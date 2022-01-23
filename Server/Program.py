import json
import time
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from Game import Game
from Message import Message

ServerState = {
    "running": True,
    "clients": {},
    "incomingMessages": [],
    "nextPlayerId": 0
}

def Main():
    print("Server starting")

    server = SimpleWebSocketServer('', 8080, ClientConnection)
    game = Game()
    while ServerState["running"]:
        #handle incoming messages
        ServerState["incomingMessages"] = []
        server.serveonce()

        # determine all active player ids
        players = []
        for client in ServerState["clients"]:
            players.append(client)

        # run the game logic
        outgoing = game.tick(ServerState["incomingMessages"], players)

        # send outgoing messages
        for msg in outgoing:
            targetPlayer = msg.playerId
            payload = msg.payload
            if targetPlayer in ServerState["clients"]:
                client = ServerState["clients"][targetPlayer]
                client.sendMessage(json.dumps(payload))
        
        # sleep the thread
        time.sleep(0.1)

    print("Server stopping")


class ClientConnection(WebSocket):
    def handleMessage(self):
        try:
            message = json.loads(self.data)
            ServerState["incomingMessages"].append(Message(self.getPlayerId(), message))
        except BaseException as error:
            print("Error handling message: " + str(error))

    def handleConnected(self):
        try:
            playerId = ServerState["nextPlayerId"]
            ServerState["nextPlayerId"] += 1
            ServerState["clients"][playerId] = self
            print("Player", playerId, "joined")
        except BaseException as error:
            print("Error on connect: " + str(error))

    def handleClose(self):
        try:
            playerId = self.getPlayerId()
            if playerId >= 0:
                del ServerState["clients"][playerId]
                print("Player", playerId, "left")
        except BaseException as error:
            print("Error on disconnect: " + str(error))
    
    def getPlayerId(self):
        playerId = -1
        clients = ServerState["clients"]
        for clientId in clients:
            if clients[clientId] == self:
                playerId = clientId
        return playerId

if __name__ == "__main__":
    Main()