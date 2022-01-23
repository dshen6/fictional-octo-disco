class PlayerData:
    def __init__(self, name):
        self.name = name
        self.phrase = []
        self.deck = []
        self.lockedIndexes = []
        self.currentVotes = 0
        self.totalVotes = 0

    def applyGeneric(self, wordIndex, replacement):
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            return False
        if replacement == "":
            return False
        self.phrase[wordIndex] = replacement.lower()
        return True

    def applyRhyme(self, wordIndex, replacement):
        return self.applyGeneric(wordIndex, replacement)

    def applyInvert(self, wordIndex, replacement):
        return self.applyGeneric(wordIndex, replacement)

    def applySubvert(self, wordIndex, replacement):
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            return False
        if replacement == "":
            return False
        firstLetter = self.phrase[wordIndex][0]
        lastLetter = self.phrase[wordIndex][len(self.phrase) - 1]
        if replacement[0] != firstLetter or replacement[len(replacement) - 1] != lastLetter:
            return False
        self.phrase[wordIndex] = replacement.lower()
        return True

    def applySwap(self, wordIndex, otherWordIndex):
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            return False
        if otherWordIndex < 0 or otherWordIndex >= len(self.phrase):
            return False
        if wordIndex == otherWordIndex:
            return False
        temp = self.phrase[wordIndex]
        self.phrase[wordIndex] = self.phrase[otherWordIndex]
        self.phrase[otherWordIndex] = temp
        return True

    def applyPump(self, wordIndex, replacement):
        return self.applyGeneric(wordIndex, replacement)

    def applyDump(self, wordIndex, mode):
        if mode == "delete":
            if wordIndex < 0 or wordIndex >= len(self.phrase):
                return False
            del self.phrase[wordIndex]
            return True
        elif mode == "stinky":
            if wordIndex < 0 or wordIndex > len(self.phrase):
                return False
            self.phrase.insert(wordIndex, "stinky")
            return True

    def applyTroll(self, wordIndex, otherPlayerData, otherWordIndex):
        if self == otherPlayerData:
            return False
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            return False
        if otherWordIndex < 0 or otherWordIndex >= len(otherPlayerData.phrase):
            return False
        if wordIndex in self.lockedIndexes:
            return False
        if otherWordIndex in otherPlayerData.lockedIndexes:
            return False
        temp = self.phrase[wordIndex]
        self.phrase[wordIndex] = otherPlayerData.phrase[otherWordIndex]
        otherPlayerData[otherWordIndex] = temp
        self.lockedIndexes.append(wordIndex)
        otherPlayerData.lockedIndexes.append(otherWordIndex)
        return True