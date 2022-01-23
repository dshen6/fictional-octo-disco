from platform import python_version_tuple
from urllib import response
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
        self.phaseTimeUp = False

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
                self.currentPhase = "planning"
                self.timer = GameRules.PLANNING_PHASE_TIME
                self.sendPhaseUpdate(clients)
                phrase = self.distributePhrase()
                self.distributeCards(len(phrase) - 1)

                #global phrase update
                #gpu = {}
                #for playerId in self.playerData:
                #    playerData = self.playerData[playerId]
                #    gpu[playerId] = playerData.phrase
                #for clientId in clients:
                #    self.send(clientId, "GlobalPhraseUpdate", {"phrases": gpu})

                break

    def planningTick(self, incoming, clients):
        self.handleSpectators(incoming, clients)

        #for msg in incoming:
        #    if msg.messageType == "UseCard":


    def trollingTick(self, incoming, clients):
        self.handleSpectators(incoming, clients)

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
            playerData.cards = []
            for i in range(numCards):
                card = GameRules.CARDS[random.randint(0, len(GameRules.CARDS) - 1)]
                playerData.cards.append(card)
            self.send(self.getClientId(playerId), "DeckDeal", {"playerId": playerId, "cards": playerData.cards})

    def sendPhaseUpdate(self, clients):
        payload = {"state": self.currentPhase}
        if self.timer > 0:
            payload["timer"] = self.timer
        for clientId in clients:
            self.send(clientId, "GameStateUpdate", payload)

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