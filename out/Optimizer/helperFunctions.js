"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimize = exports.expandTimings = exports.finalizeLuting = exports.removeComments = exports.expandDefinitions = exports.equalTokens = exports.tokensToString = void 0;
const myTokenParser_1 = require("../Language/myTokenParser");
function tokensToString(tokens) {
    let returnString = "";
    for (var token of tokens) {
        returnString = returnString.concat(token.content.toString());
    }
    return returnString;
}
exports.tokensToString = tokensToString;
function equalTokens(t1s, t2s) {
    if (t1s.length !== t2s.length) {
        return false;
    }
    for (let i = 0; i < t1s.length; i++) {
        if (t1s[i].type !== t2s[i].type || t1s[i].content !== t2s[i].content) {
            return false;
        }
    }
    return true;
}
exports.equalTokens = equalTokens;
function expandDefinitions(tokens) {
    let res = "";
    const definitionLookup = {};
    let inDefinition = 0;
    let currentDefinition = [];
    for (var token of tokens) {
        if (inDefinition > 0) {
            if (!(token.type === 'end-definition' || token.type === 'start-definition' || token.type === 'predefined-section')) {
                currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].concat(token.content.toString());
            }
        }
        //now we finally take care of any new definitions or definitions which need expanding
        if (token.type === 'start-definition') {
            const defName = token.content.match(/[A-Z]/);
            if (defName) {
                currentDefinition.push(defName[0].toString());
            }
            else {
                console.error("Tried to create a new definition without a name!");
            }
            inDefinition++;
        }
        else if (token.type === 'predefined-section') {
            //a defined section! let's expand it!
            const defName = token.content.match(/[A-Z]/);
            const repetitions = token.content.match(/\d+/);
            if (defName) {
                const definedValue = definitionLookup[defName[0].toString()].toString();
                if (repetitions) {
                    if (inDefinition > 0) {
                        for (let i = 0; i < +repetitions; i++) {
                            currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].concat(definedValue);
                        }
                    }
                    else {
                        for (let i = 0; i < +repetitions; i++) {
                            res = res.concat(definedValue);
                        }
                    }
                }
                else {
                    if (inDefinition > 0) {
                        currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].concat(definedValue);
                    }
                    else {
                        res = res.concat(definedValue);
                    }
                }
            }
        }
        else if (token.type === 'end-definition') {
            //how many times we want the current definition to be written initially
            const repetitions = token.content.match(/\d+/);
            inDefinition--;
            //the name of the new definition is defined as the first character of the last definition.
            const newDefName = currentDefinition[inDefinition].substring(0, 1);
            //the definition itself is saved right afterwards
            const newDefinition = currentDefinition[inDefinition].substring(1);
            //remove the definition from the array
            currentDefinition.splice(inDefinition);
            definitionLookup[newDefName] = newDefinition;
            if (repetitions) {
                for (let i = 0; i < +repetitions[0]; i++) {
                    if (inDefinition > 0) {
                        currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].concat(definitionLookup[newDefName]);
                    }
                    else {
                        res = res.concat(definitionLookup[newDefName.toString()].toString());
                    }
                }
            }
            else {
                if (inDefinition > 0) {
                    currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].concat(definitionLookup[newDefName]);
                }
                else {
                    res = res.concat(definitionLookup[newDefName.toString()].toString());
                }
            }
        }
        else {
            if (inDefinition === 0) {
                res = res.concat(token.content.toString());
            }
        }
    }
    return res;
}
exports.expandDefinitions = expandDefinitions;
function removeComments(tokens) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'comment') {
            tokens.splice(i, 1);
            i--;
        }
    }
    return tokens;
}
exports.removeComments = removeComments;
function finalizeLuting(tokens) {
    removeComments(tokens);
    return tokensToString(tokens);
}
exports.finalizeLuting = finalizeLuting;
function expandTimings(tokens) {
    //only works on lutings which had their definition expanded!
    let currentTime = "1";
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'time') {
            const newTime = tokens[i].content.match(/(\d+\/\d+|\d+|\/\d+)/);
            if (newTime) {
                currentTime = newTime[0].toString();
                tokens.splice(i, 1);
                i--;
            }
            else {
                console.error("didn't find new time hryElp");
            }
        }
        else if (tokens[i].type === 'note') {
            const frac = tokens[i].content.match(/(\d+\/\d+|\d+|\/\d+)/);
            if (!frac) {
                //note has no fraction
                const note = tokens[i].content.match(/([a-g]'?|r)/);
                if (note) {
                    const newNote = note[0].toString().concat(currentTime);
                    tokens[i].content = newNote;
                }
            }
        }
        else if (tokens[i].type === 'chord') {
            const frac = tokens[i].content.match(/(\d+\/\d+|\d+|\/\d+)/);
            if (!frac) {
                //chord has no fraction
                const chord = tokens[i].content.match(/[^)]+/);
                const closingBracket = tokens[i].content.match(/\)/);
                if (chord && closingBracket) {
                    const newNote = chord[0].toString().concat(closingBracket[0].toString(), currentTime);
                    tokens[i].content = newNote;
                }
            }
        }
        else if (tokens[i].type === 'new-voice') {
            currentTime = "1";
        }
    }
    return tokens;
}
exports.expandTimings = expandTimings;
function calculateUniqueSubstrings(tokens) {
    const substringSet = new Set();
    const tokenSubArraySet = new Set();
    // Calculate all substrings
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j <= tokens.length; j++) {
            let tempArr = tokens.slice(i, j);
            let currentString = "";
            let legalDefWise = true;
            let skipVoice = false;
            let inDef = 0;
            for (const tk of tempArr) {
                if (tk.type === 'new-voice') {
                    skipVoice = true;
                    break;
                }
                else if (tk.type === 'start-definition') {
                    inDef++;
                }
                else if (tk.type === 'end-definition') {
                    if (inDef = 0) {
                        legalDefWise = false;
                        break;
                    }
                    inDef--;
                }
                currentString = currentString.concat(tk.content.toString());
            }
            if (skipVoice) {
                break;
            }
            else if (inDef !== 0) {
                continue;
            }
            if (legalDefWise) {
                let oldSize = substringSet.size;
                substringSet.add(currentString);
                if (oldSize !== substringSet.size) {
                    //added a new element
                    tokenSubArraySet.add(tempArr);
                }
            }
            else {
                continue;
            }
        }
    }
    let substringArr = Array.from(substringSet);
    let tokenArrArr = Array.from(tokenSubArraySet);
    // Calculate gain for each substring
    const substringsWithGain = tokenArrArr.map(tokenArr => {
        const occurrences = getLutingIndicesOf(tokens, tokenArr).length;
        const length = totalLength(tokenArr);
        const gain = (occurrences * length) - (length + occurrences + 2);
        return { tokenArr, gain };
    });
    substringsWithGain.sort((a, b) => b.gain - a.gain);
    return substringsWithGain;
}
function totalLength(subLuting) {
    let cnt = 0;
    for (let l of subLuting) {
        cnt += l.length;
    }
    return cnt;
}
function optimize(tokens, maxItr) {
    let globalDefsToUse = ["Z", "Y", "X", "W", "V", "U", "T", "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
    let numVoices = getLutingIndicesOf(tokens, [new myTokenParser_1.lutingToken("|", "new-voice")]).length + 1;
    let localDefsToUse = [];
    for (let i = 0; i < numVoices; i++) {
        localDefsToUse[i] = [];
        for (let j = globalDefsToUse.length - 1; j >= 0; j--) {
            localDefsToUse[i].push(globalDefsToUse[j]);
        }
    }
    removeComments(tokens);
    tokens = (0, myTokenParser_1.provideLutingTokensFromString)(expandDefinitions(tokens));
    for (let i = 0; i < maxItr; i++) {
        let sortedSubstrings = calculateUniqueSubstrings(tokens);
        if (sortedSubstrings[0].gain <= 0) {
            //no more optimizations possible!
            break;
        }
        let best = sortedSubstrings[0].tokenArr;
        let localPosition = isLocalDef(tokens, best);
        let definitionName = "";
        if (localPosition < 0) {
            //not local
            definitionName = globalDefsToUse[0];
            globalDefsToUse.splice(0, 1);
        }
        else {
            definitionName = localDefsToUse[localPosition][0];
            localDefsToUse[localPosition].splice(0, 1);
        }
        let numOccurrences = getLutingIndicesOf(tokens, best).length;
        let newDefinition = new myTokenParser_1.lutingToken(definitionName.concat('{'), "start-definition");
        let newDefEnd = new myTokenParser_1.lutingToken("}", "end-definition");
        //base case: the definition
        const insertLocation = getLutingIndexOf(tokens, best);
        //add the new definition start and end brackets
        tokens.splice(insertLocation, 0, newDefinition);
        const bl = best.length;
        const newLoc = insertLocation + bl + 1; //we add 1 since we included one more token
        tokens.splice(insertLocation + best.length + 1, 0, newDefEnd);
        //replacing other occurrences by just the predefined-value
        for (let j = 1; j < numOccurrences; j++) {
            const insertLocation = getSecondLutingIndexOf(tokens, best);
            let newDefinition = new myTokenParser_1.lutingToken(definitionName, "predefined-value");
            tokens.splice(insertLocation, best.length, newDefinition);
        }
    }
    const resultingLuting = tokensToString(tokens);
    return resultingLuting;
}
exports.optimize = optimize;
function isLocalDef(luting, subLuting) {
    let substrPositions = getLutingIndicesOf(luting, subLuting);
    let newVoicePositions = getLutingIndicesOf(luting, [new myTokenParser_1.lutingToken("|", "new-voice")]);
    newVoicePositions.unshift(0);
    let localPos = 0;
    for (; localPos < newVoicePositions.length; localPos++) {
        if (substrPositions[0] < newVoicePositions[localPos]) {
            break;
        }
    }
    localPos--;
    for (let i = 1; i < substrPositions.length; i++) {
        if (substrPositions[i] > newVoicePositions[localPos + 1]) {
            return -1;
        }
    }
    return localPos;
}
function getLutingIndicesOf(luting, subLuting) {
    var searchLutingLength = luting.length;
    if (searchLutingLength === 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    while ((index = getLutingIndexAfter(luting, subLuting, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + subLuting.length;
    }
    return indices;
}
function getLutingIndexAfter(luting, subLuting, start) {
    const subLutingLength = subLuting.length;
    for (let i = start; i <= luting.length - subLutingLength; i++) {
        if (equalTokens(subLuting, luting.slice(i, i + subLutingLength))) {
            return i;
        }
    }
    return -1;
}
function getLutingIndexOf(luting, subLuting) {
    const subLutingLength = subLuting.length;
    for (let i = 0; i <= luting.length - subLutingLength; i++) {
        if (equalTokens(subLuting, luting.slice(i, i + subLutingLength))) {
            return i;
        }
    }
    return -1;
}
function getSecondLutingIndexOf(luting, subLuting) {
    const subLutingLength = subLuting.length;
    let cnt = 0;
    let i = 0;
    for (; i <= luting.length - subLutingLength && cnt !== 2; i++) {
        if (i === 925) {
            let breakpoint = 3;
        }
        if (equalTokens(subLuting, luting.slice(i, i + subLutingLength))) {
            cnt++;
        }
    }
    if (cnt === 2) {
        return i - 1;
    }
    return -1;
}
//# sourceMappingURL=helperFunctions.js.map