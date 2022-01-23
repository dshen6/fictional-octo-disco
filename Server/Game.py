from Message import Message
from PlayerData import PlayerData
import GameRules
import time
import random

class Game:
    def __init__(self):
        self.outgoingMessages = []

        self.currentPhase = "lobby"
        self.timer = -1
        self.lastTickTime = time.perf_counter()
        self.lastTimerBroadcast = self.lastTickTime
        self.phaseTimeUp = False
        self.playerTurn = -1

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
        sendPlayerList = False

        # handle joining players
        for msg in incoming:
            if msg.messageType == "JoinRequest":
                if self.getPlayerId(msg.clientId) >= 0:
                    # already joined
                    continue
                sendPlayerList = True
                if not "playerId" in msg.payload:
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
            playerNames = {}
            for playerId in self.playerData:
                playerNames[playerId] = self.playerData[playerId].name
            for clientId in clients:
                self.send(clientId, "PlayerList", {"players": playerNames})
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
        self.handleSpectators(incoming, clients)

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
        isTrolling = self.nextTrollingTurn(clients)
        if not isTrolling:
            self.setupVoting(clients)

    def nextTrollingTurn(self, clients):
        possiblePlayers = []
        for playerId in self.playerData:
            if "troll" in self.playerData[playerId].deck:
                possiblePlayers.append(playerId)
        if len(possiblePlayers) == 0:
            return False
        self.playerTurn = possiblePlayers[random.randint(0, len(possiblePlayers) - 1)]
        for clientId in clients:
            self.send(clientId, "PlayerTurn", {"playerId": self.playerTurn})
        return True

    def trollingTick(self, incoming, clients):
        self.handleSpectators(incoming, clients)

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
                    continue
                otherPlayerId = msg.payload["playerId2"]
                if not otherPlayerId in self.playerData:
                    continue
                otherPlayerData = self.playerData[otherPlayerId]
                success = playerData.applyToll(msg.payload["position1"], otherPlayerData, msg.payload["position2"])
                if success:
                    del playerData.deck[cardIndex]
                    self.send(msg.clientId, "CardConsumed", {"playerId": playerId, "cardIndex": cardIndex})
                    self.sendGlobalPhraseUpdate()
                    self.nextTrollingTurn()

        # handle timer
        if self.phaseTimeUp:
            isTrolling = self.nextTrollingTurn(clients)
            if isTrolling:
                self.timer = GameRules.TROLLING_TURN_TIME
            else:
                self.setupVoting(clients)

    def setupVoting(self, clients):
        pass

    def votingTick(self, incoming, clients):
        self.handleSpectators(incoming, clients)

    def resultsTick(self, incoming, clients):
        self.handleSpectators(incoming, clients)

    def summaryTick(self, incoming, clients):
        self.handleSpectators(incoming, clients)

    def distributePhrase(self):
        phrase = GameRules.PHRASES[random.randint(0, len(GameRules.PHRASES) - 1)].split(" ")
        for playerId in self.playerData:
            playerData = self.playerData[playerId]
            playerData.phrase = phrase
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

    def sendPhaseUpdate(self, clients):
        payload = {"state": self.currentPhase}
        if self.timer > 0:
            payload["timer"] = self.timer
        for clientId in clients:
            self.send(clientId, "GameStateUpdate", payload)

    def sendGlobalPhraseUpdate(self, clients):
        content = {}
        for playerId in self.playerData:
            playerData = self.playerData[playerId]
            content[playerId] = playerData.phrase
        for clientId in clients:
            self.send(clientId, "GlobalPhraseUpdate", {"phrases": content})

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

    def handleSpectators(self, incoming, clients):
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
                            self.sendPhaseUpdate(clients)
                            break
                else:
                    # view as a spectator
                    self.send(msg.clientId, "JoinResponse", {
                        "playerId": -1,
                        "isSpectator": True,
                        "isHost": False
                    })
                    self.sendPhaseUpdate(clients)