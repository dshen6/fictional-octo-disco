from Message import Message
from PlayerData import PlayerData
import GameRules
import time
import random

class Game:
    def __init__(self):
        self.outgoingMessages = []
        self.knownClients = []

        self.currentPhase = "lobby"
        self.timer = -1
        self.lastTickTime = time.perf_counter()
        self.lastTimerBroadcast = self.lastTickTime
        self.phaseTimeUp = False
        self.playerTurn = -1
        self.isGameOver = False
        self.roundIndex = 0

        self.nextPlayerId = 0
        self.activePlayers = []
        self.playerData = {}

    def tick(self, incoming, clients):
        self.outgoingMessages = []

        # track elapsed time
        currentTime = time.perf_counter()
        elapsed = currentTime - self.lastTickTime
        self.lastTickTime = currentTime
        self.updateTimer(elapsed)

        # send timer updates every 10 seconds
        if currentTime - self.lastTimerBroadcast > 10:
            if self.timer > 0:
                self.sendPhaseUpdate(clients)
            self.lastTimerBroadcast = currentTime

        # update game state
        tickFunc = {
            "lobby":    self.lobbyTick,
            "planning": self.planningTick,
            "trolling": self.trollingTick,
            "voting":   self.votingTick,
            "results":  self.resultsTick,
            "summary":  self.summaryTick
        }
        tickFunc[self.currentPhase](incoming, clients)

        # hand our outgoing messages to the server layer
        return self.outgoingMessages
    
    def updateTimer(self, elapsed):
        lastTimer = self.timer
        if self.timer > 0:
            self.timer -= elapsed
        self.phaseTimeUp = self.timer <= 0 and lastTimer > 0

    def lobbyTick(self, incoming, clients):
        self.handleNewClients(clients)

        # handle joining players
        sendPlayerList = False
        for msg in incoming:
            if msg.messageType == "JoinRequest":
                if self.getPlayerId(msg.clientId) >= 0:
                    # already joined
                    playerId = self.getPlayerId(msg.clientId)
                    if playerId in self.playerData:
                        self.playerData[playerId] = PlayerData(msg.payload["playerName"])
                        sendPlayerList = True
                elif not "playerId" in msg.payload:
                    # new player join
                    playerId = self.nextPlayerId
                    self.nextPlayerId += 1
                    self.activePlayers.append({"playerId": playerId, "clientId": msg.clientId})
                    self.playerData[playerId] = PlayerData(msg.payload["playerName"])
                    self.send(msg.clientId, "JoinResponse", {
                        "playerId": playerId,
                        "isSpectator": False,
                        "isHost": True # everyone is a host for now
                    })
                    sendPlayerList = True
                else:
                    # rejoin after lost connection
                    for player in self.activePlayers:
                        if player["playerId"] == msg.payload["playerId"]:
                            player["clientId"] = msg.clientId
                            self.send(msg.clientId, "JoinResponse", {
                                "playerId": player["playerId"],
                                "isSpectator": False,
                                "isHost": True # everyone is a host for now
                            })
                            break

        # send player list updates to all clients
        if sendPlayerList:
            self.sendPlayerList(clients)
            self.sendPhaseUpdate(clients)
        
        # handle starting the game
        for msg in incoming:
            if msg.messageType == "StartGame":
                self.setupPlanning(clients)
                break

    def setupPlanning(self, clients):
        # switch to planning phase
        self.currentPhase = "planning"
        self.timer = GameRules.PLANNING_PHASE_TIME
        self.sendPhaseUpdate(clients)

        # give players their phrase and cards
        phrase = self.distributePhrase()
        self.distributeCards(len(phrase) - 1)

    def planningTick(self, incoming, clients):
        self.handleNewClients(clients)
        for newPlayer in self.handleNewPlayers(incoming, clients):
            self.send(self.getClientId(newPlayer), "PhraseUpdate", {"playerId": newPlayer, "phrase": self.playerData[newPlayer].phrase})
            self.send(self.getClientId(newPlayer), "DeckDeal", {"playerId": newPlayer, "cards": self.playerData[newPlayer].deck})

        # handle card usage
        for msg in incoming:
            if msg.messageType == "UseCard":
                playerId = self.getPlayerId(msg.clientId)
                if playerId < 0:
                    continue
                playerData = self.playerData[playerId]
                cardIndex = msg.payload["cardIndex"]
                if cardIndex < 0 or cardIndex >= len(playerData.deck):
                    continue
                actions = {
                    "rhyme":   lambda: playerData.applyRhyme(msg.payload["position1"], msg.payload["wordText"]),
                    "invert":  lambda: playerData.applyInvert(msg.payload["position1"], msg.payload["wordText"]),
                    "subvert": lambda: playerData.applySubvert(msg.payload["position1"], msg.payload["wordText"]),
                    "swap":    lambda: playerData.applySwap(msg.payload["position1"], msg.payload["position2"]),
                    "pump":    lambda: playerData.applyPump(msg.payload["position1"], msg.payload["wordText"]),
                    "dump":    lambda: playerData.applyDump(msg.payload["position1"], msg.payload["mode"])
                }
                cardType = playerData.deck[cardIndex]
                if cardType in actions:
                    success = actions[cardType]()
                    if success:
                        del playerData.deck[cardIndex]
                        self.send(msg.clientId, "CardConsumed", {"playerId": playerId, "cardIndex": cardIndex})
                        self.send(msg.clientId, "PhraseUpdate", {"playerId": playerId, "phrase": playerData.phrase})
                    else:
                        self.sendUseCardError(playerId, cardIndex)

        # handle fast forward
        validCards = 0
        for playerId in self.playerData:
            for card in self.playerData[playerId].deck:
                if card != "troll":
                    validCards += 1
        if validCards == 0:
            self.phaseTimeUp = True
        
        # handle timer
        if self.phaseTimeUp:
            self.setupTrolling(clients)

    def setupTrolling(self, clients):
        # send the final phrase update
        self.sendGlobalPhraseUpdate(clients)

        # switch to the trolling phase
        self.currentPhase = "trolling"
        self.timer = GameRules.TROLLING_TURN_TIME
        self.sendPhaseUpdate(clients)

        # next turn (or skip to voting)
        isTrolling = self.nextTrollingTurn(clients, False)
        if not isTrolling:
            self.setupVoting(clients)

    def nextTrollingTurn(self, clients, tossCards):
        # toss the current player's unused troll cards
        if tossCards:
            if self.playerTurn >= 0:
                playerData = self.playerData[self.playerTurn]
                playerData.deck = list(filter(lambda c: c != "troll", playerData.deck))

        # pick a new player with at least one troll card
        possiblePlayers = []
        for playerId in self.playerData:
            if "troll" in self.playerData[playerId].deck:
                possiblePlayers.append(playerId)
        if len(possiblePlayers) == 0:
            return False
        self.playerTurn = possiblePlayers[random.randint(0, len(possiblePlayers) - 1)]

        # notify all clients
        for clientId in clients:
            self.send(clientId, "PlayerTurn", {"playerId": self.playerTurn})
        
        return True

    def trollingTick(self, incoming, clients):
        if self.handleNewClients(clients):
            self.sendGlobalPhraseUpdate(clients)
        for newPlayer in self.handleNewPlayers(incoming, clients):
            self.send(self.getClient(newPlayer), "PlayerTurn", {"playerId": self.playerTurn})

        # handle card usage
        for msg in incoming:
            if msg.messageType == "UseCard":
                playerId = self.getPlayerId(msg.clientId)
                if playerId < 0:
                    continue
                if self.playerTurn != playerId:
                    continue
                playerData = self.playerData[playerId]
                cardIndex = msg.payload["cardIndex"]
                if cardIndex < 0 or cardIndex >= len(playerData.deck):
                    continue
                if playerData.deck[cardIndex] != "troll":
                    self.sendUseCardError(playerId, cardIndex)
                    continue
                otherPlayerId = msg.payload["playerId2"]
                if not otherPlayerId in self.playerData:
                    self.sendUseCardError(playerId, cardIndex)
                    continue
                otherPlayerData = self.playerData[otherPlayerId]
                success = playerData.applyToll(msg.payload["position1"], otherPlayerData, msg.payload["position2"])
                if success:
                    del playerData.deck[cardIndex]
                    self.send(msg.clientId, "CardConsumed", {"playerId": playerId, "cardIndex": cardIndex})
                    self.sendGlobalPhraseUpdate(clients)
                    self.nextTrollingTurn(clients, False)
                else:
                    self.sendUseCardError(playerId, cardIndex)

        # handle timer
        if self.phaseTimeUp:
            isTrolling = self.nextTrollingTurn(clients, True)
            if isTrolling:
                self.timer = GameRules.TROLLING_TURN_TIME
            else:
                self.setupVoting(clients)

    def setupVoting(self, clients):
        # switch to the trolling phase
        self.currentPhase = "voting"
        self.timer = GameRules.VOTING_PHASE_TIME
        self.sendPhaseUpdate(clients)

        #reset all votes
        for playerId in self.playerData:
            self.playerData[playerId].currentVotes = 0
        self.sendCurrentVotes(clients)

    def votingTick(self, incoming, clients):
        if self.handleNewClients(clients):
            self.sendCurrentVotes(clients)
        self.handleNewPlayers(incoming, clients)

        # handle votes
        sendTotals = False
        for msg in incoming:
            if msg.messageType == "Vote":
                playerId = self.getPlayerId(msg.clientId)
                if playerId < 0:
                    continue
                targetPlayerId = msg.payload["playerId"]
                if not targetPlayerId in self.playerData:
                    continue
                if targetPlayerId == playerId:
                    continue
                self.playerData[targetPlayerId].currentVotes += 1
                sendTotals = True

        #send the updated vote counts
        if sendTotals:
            self.sendCurrentVotes(clients)

        # handle timer
        if self.phaseTimeUp:
            self.setupResults(clients)

    def setupResults(self, clients):
        # apply votes to multi-round totals
        for playerId in self.playerData:
            self.playerData[playerId].totalVotes += self.playerData[playerId].currentVotes

        # switch to the results phase
        self.currentPhase = "results"
        self.timer = GameRules.RESULTS_PHASE_TIME
        self.sendPhaseUpdate(clients)

    def resultsTick(self, incoming, clients):
        self.handleNewClients(clients)
        self.handleNewPlayers(incoming, clients)

        #handle timer
        if self.phaseTimeUp:
            self.roundIndex += 1
            if self.roundIndex < 5:
                self.setupPlanning(clients)
            else:
                self.setupSummary(clients)

    def setupSummary(self, clients):
        self.currentPhase = "summary"
        self.timer = GameRules.SUMMARY_PHASE_TIME
        self.sendPhaseUpdate(clients)

    def summaryTick(self, incoming, clients):
        self.handleNewClients(clients)
        self.handleNewPlayers(incoming, clients)

        #handle timer
        if self.phaseTimeUp:
            self.isGameOver = True

    def distributePhrase(self):
        phrase = GameRules.PHRASES[random.randint(0, len(GameRules.PHRASES) - 1)].split(" ")
        for playerId in self.playerData:
            playerData = self.playerData[playerId]
            playerData.phrase = phrase.copy()
            self.send(self.getClientId(playerId), "PhraseUpdate", {"playerId": playerId, "phrase": phrase})
        return phrase

    def distributeCards(self, numCards):
        for playerId in self.playerData:
            playerData = self.playerData[playerId]
            playerData.deck = []
            for i in range(numCards):
                card = GameRules.CARDS[random.randint(0, len(GameRules.CARDS) - 1)]
                playerData.deck.append(card)
            self.send(self.getClientId(playerId), "DeckDeal", {"playerId": playerId, "cards": playerData.deck})

    def sendPlayerList(self, clients):
        playerNames = {}
        for playerId in self.playerData:
            playerNames[playerId] = self.playerData[playerId].name
        for clientId in clients:
            self.send(clientId, "PlayerList", {"players": playerNames})

    def sendPhaseUpdate(self, clients):
        payload = {"state": self.currentPhase}
        if self.timer > 0:
            payload["timer"] = int(self.timer)
        for clientId in clients:
            self.send(clientId, "GameStateUpdate", payload)

    def sendGlobalPhraseUpdate(self, clients):
        phrases = { }
        lockedWords = { }
        for playerId in self.playerData:
            playerData = self.playerData[playerId]
            phrases[playerId] = playerData.phrase
            lockedWords[playerId] = playerData.lockedIndexes
        for clientId in clients:
            self.send(clientId, "GlobalPhraseUpdate", {"phrases": phrases, "lockedWords":lockedWords})

    def sendCurrentVotes(self, clients):
        votes = { }
        for playerId in self.playerData:
            votes[playerId] = self.playerData[playerId].currentVotes
        for clientId in clients:
            self.send(clientId, "VoteTotals", {"votes": votes})
    
    def sendUseCardError(self, playerId, cardIndex):
        clientId = self.getClientId(playerId)
        if clientId >= 0:
            self.send(clientId, "UseCardError", {"cardIndex": cardIndex})

    def send(self, clientId, messageType, payload):
        self.outgoingMessages.append(Message(clientId, messageType, payload))

    def getPlayerId(self, clientId):
        for player in self.activePlayers:
            if player["clientId"] == clientId:
                return player["playerId"]
        return -1

    def getClientId(self, playerId):
        for player in self.activePlayers:
            if player["playerId"] == playerId:
                return player["clientId"]
        return -1

    def handleNewClients(self, clients):
        sendUpdates = False
        for clientId in clients:
            if not clientId in self.knownClients:
                sendUpdates = True
        self.knownClients = clients.copy()
        if sendUpdates:
            self.sendPhaseUpdate(clients)
            self.sendPlayerList(clients)
        return sendUpdates


    def handleNewPlayers(self, incoming, clients):
        newPlayers = []
        for msg in incoming:
            if msg.messageType == "JoinRequest":
                if self.getPlayerId(msg.clientId) >= 0:
                    # already joined as a player
                    continue
                elif "playerId" in msg.payload:
                    # rejoin after lost connection
                    for player in self.activePlayers:
                        if player["playerId"] == msg.payload["playerId"]:
                            player["clientId"] = msg.clientId
                            self.send(msg.clientId, "JoinResponse", {
                                "playerId": player["playerId"],
                                "isSpectator": False,
                                "isHost": True # everyone is a host for now
                            })
                            newPlayers.append(player["playerId"])
                            break
                else:
                    # view as a spectator
                    self.send(msg.clientId, "JoinResponse", {
                        "playerId": -1,
                        "isSpectator": True,
                        "isHost": False
                    })
        return newPlayers