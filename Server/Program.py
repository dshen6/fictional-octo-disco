import sys
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

def Run(port):
    # start the server
    print("Server starting on port " + str(port))
    server = SimpleWebSocketServer('', port, ClientConnection)

    # game loop
    game = Game()
    while ServerState["running"]:
        # restart the game if it's over
        if game.isGameOver:
            game = Game()

        # handle incoming messages
        ServerState["incomingMessages"] = []
        server.serveonce()

        # determine all active player ids
        clients = []
        for client in ServerState["clients"]:
            clients.append(client)

        # run the game logic
        outgoing = []
        try:
            outgoing = game.tick(ServerState["incomingMessages"], clients)
        except BaseException as error:
            print("Error in game tick: " + str(error))

        # send outgoing messages
        for msg in outgoing:
            targetPlayer = msg.clientId
            payload = msg.payload.copy()
            payload["messageType"] = msg.messageType
            if targetPlayer in ServerState["clients"]:
                client = ServerState["clients"][targetPlayer]
                try:
                    client.sendMessage(json.dumps(payload))
                except BaseException as error:
                    print("Error sending message: " + str(error))
        
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
        clients = ServerState["clients"]
        for clientId in clients:
            if clients[clientId] == self:
                return clientId
        return -1

if __name__ == "__main__":
    # parse the server port
    port = 8080
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    Run(port)