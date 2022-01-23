import json
import time
from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
from Game import Game
from Message import Message

ServerState = {
    "running": True,
    "clients": {},
    "incomingMessages": [],
    "nextClientId": 0
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
            targetPlayer = msg.clientId
            payload = msg.payload.copy()
            payload["messageType"] = msg.messageType
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
            ServerState["incomingMessages"].append(Message(self.getClientId(), message["messageType"], message))
        except BaseException as error:
            print("Error handling message: " + str(error))

    def handleConnected(self):
        try:
            clientId = ServerState["nextClientId"]
            ServerState["nextClientId"] += 1
            ServerState["clients"][clientId] = self
            print("Client", clientId, "joined")
        except BaseException as error:
            print("Error on connect: " + str(error))

    def handleClose(self):
        try:
            clientId = self.getClientId()
            if clientId >= 0:
                del ServerState["clients"][clientId]
                print("Client", clientId, "left")
        except BaseException as error:
            print("Error on disconnect: " + str(error))
    
    def getClientId(self):
        clientId = -1
        clients = ServerState["clients"]
        for clientId in clients:
            if clients[clientId] == self:
                clientId = clientId
        return clientId

if __name__ == "__main__":
    Main()