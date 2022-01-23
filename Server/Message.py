class Message:
    def __init__(self, clientId, messageType, payload):
        self.clientId = clientId
        self.messageType = messageType
        self.payload = payload