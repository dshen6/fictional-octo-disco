class PlayerData:
    def __init__(self, name):
        self.name = name
        self.phrase = []
        self.deck = []
        self.lockedIndexes = []
        self.currentVotes = 0
        self.totalVotes = 0
        self.lastError = ""

    def partialReset(self):
        self.lockedIndexes = []
        self.lastError = ""

    def applyGeneric(self, wordIndex, replacement):
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            self.lastError = "You must select a valid word to replace!"
            return False
        if replacement == "":
            self.lastError = "You must type a replacement word!"
            return False
        self.phrase[wordIndex] = replacement.lower()
        return True

    def applyRhyme(self, wordIndex, replacement):
        return self.applyGeneric(wordIndex, replacement)

    def applyInvert(self, wordIndex, replacement):
        return self.applyGeneric(wordIndex, replacement)

    def applySubvert(self, wordIndex, replacement):
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            self.lastError = "You must select a valid word to subvert!"
            return False
        if replacement == "":
            self.lastError = "You must type a replacement word!"
            return False
        firstLetter = self.phrase[wordIndex][0]
        lastLetter = self.phrase[wordIndex][len(self.phrase[wordIndex]) - 1]
        if replacement[0] != firstLetter or replacement[len(replacement) - 1] != lastLetter:
            self.lastError = "Your word must start and end with the same letters as the original word!"
            return False
        self.phrase[wordIndex] = replacement.lower()
        return True

    def applySwap(self, wordIndex, otherWordIndex):
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            self.lastError = "You must select a valid word to swap from!"
            return False
        if otherWordIndex < 0 or otherWordIndex >= len(self.phrase):
            self.lastError = "You must select a valid word to swap to!"
            return False
        if wordIndex == otherWordIndex:
            self.lastError = "You must select two distinct words!"
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
                self.lastError = "You must a valid word to dump!"
                return False
            del self.phrase[wordIndex]
            return True
        elif mode == "stinky":
            if wordIndex < 0 or wordIndex > len(self.phrase):
                self.lastError = "You must a valid word to dump!"
                return False
            self.phrase.insert(wordIndex, "stinky")
            return True

    def applyTroll(self, wordIndex, otherPlayerData, otherWordIndex):
        if self == otherPlayerData:
            self.lastError = "You must troll two different players!"
            return False
        if wordIndex < 0 or wordIndex >= len(self.phrase):
            self.lastError = "You must select a valid word to swap!"
            return False
        if otherWordIndex < 0 or otherWordIndex >= len(otherPlayerData.phrase):
            self.lastError = "You must select a valid word to swap!"
            return False
        if wordIndex in self.lockedIndexes:
            self.lastError = "That word has already been used and cannot be selected again!"
            return False
        if otherWordIndex in otherPlayerData.lockedIndexes:
            self.lastError = "That word has already been used and cannot be selected again!"
            return False
        temp = self.phrase[wordIndex]
        self.phrase[wordIndex] = otherPlayerData.phrase[otherWordIndex]
        otherPlayerData.phrase[otherWordIndex] = temp
        self.lockedIndexes.append(wordIndex)
        otherPlayerData.lockedIndexes.append(otherWordIndex)
        return True