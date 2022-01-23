from Message import Message
import time

class Game:
    def __init__(self):
        self.currentPhase = "lobby"
        self.timer = -1
        self.lastTickTime = time.perf_counter()
        self.phaseTimeUp = False

    def tick(self, incoming, players):
        outgoing = []

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
        tickFunc[self.currentPhase](players, incoming, outgoing)

        return outgoing
    
    def updateTimer(self, elapsed):
        lastTimer = self.timer
        if self.timer > 0:
            self.timer -= elapsed
        self.phaseTimeUp = self.timer <= 0 and lastTimer > 0

    def lobbyTick(self, players, incoming, outgoing):
        pass

    def planningTick(self, players, incoming, outgoing):
        pass

    def trollingTick(self, players, incoming, outgoing):
        pass

    def votingTick(self, players, incoming, outgoing):
        pass

    def resultsTick(self, players, incoming, outgoing):
        pass

    def summaryTick(self, players, incoming, outgoing):
        pass