"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimize = exports.calculateGainFromOccurrences = exports.countOccurrencesOfSubStrings = exports.expandTimings = exports.finalizeLuting = exports.removeComments = exports.expandDefinitions = exports.equalTokens = exports.tokensToString = void 0;
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
    const substringsSet = new Set();
    // Calculate all substrings
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i; j < tokens.length; j++) {
            let substring = "";
            let legal = true;
            let inDef = 0;
            for (let k = i; k <= j; k++) {
                if (tokens[k].type === 'new-voice') {
                    legal = false;
                    break;
                }
                else if (tokens[k].type === 'start-definition') {
                    inDef++;
                }
                else if (tokens[k].type === 'end-definition') {
                    if (inDef === 0) {
                        legal = false;
                        break;
                    }
                    inDef--;
                }
                substring += tokens[k].content.toString();
            }
            if (legal) {
                substringsSet.add(substring);
            }
        }
    }
    // Convert set to array
    const substringsArray = Array.from(substringsSet);
    // Calculate gain for each substring
    const substringsWithGain = substringsArray.map(substring => {
        const occurrences = tokensToString(tokens).split(substring).length - 1;
        const length = substring.length;
        const gain = (occurrences * length) - (length + occurrences - 2);
        return { substring, gain };
    });
    substringsWithGain.sort((a, b) => b.gain - a.gain);
    return substringsWithGain;
}
function countOccurrencesOfSubStrings(tokens) {
    let occurrences = new Map();
    for (let i = 0; i < tokens.length; i++) {
        for (let j = i + 1; j <= tokens.length; j++) {
            let tempArr = tokens.slice(i, j);
            let currentString = "";
            let legal = true;
            let inDef = 0;
            for (const tk of tempArr) {
                if (tk.type === 'new-voice') {
                    legal = false;
                    break;
                }
                else if (tk.type === 'start-definition') {
                    inDef++;
                }
                else if (tk.type === 'end-definition') {
                    if (inDef = 0) {
                        legal = false;
                        break;
                    }
                    inDef--;
                }
                currentString = currentString.concat(tk.content.toString());
            }
            if (inDef !== 0) {
                legal = false;
            }
            if (legal && occurrences.has(currentString)) {
                occurrences.set(currentString, occurrences.get(currentString) + 1);
            }
            else if (legal) {
                occurrences.set(currentString, 1);
            }
            else {
                continue;
            }
        }
    }
    const sortedArray = Array.from(occurrences).sort((a, b) => b[1] - a[1]);
    const sortedOcurrences = new Map(sortedArray);
    return sortedOcurrences;
}
exports.countOccurrencesOfSubStrings = countOccurrencesOfSubStrings;
function calculateGainFromOccurrences(occurrences) {
    let res = new Map();
    occurrences.forEach((value, key) => {
        let gain = (value * key.length) - (key.length + value + 2);
        res.set(key, gain);
    });
    const sortedArray = Array.from(res).sort((a, b) => b[1] - a[1]);
    const sortedOcurrences = new Map(sortedArray);
    return sortedOcurrences;
}
exports.calculateGainFromOccurrences = calculateGainFromOccurrences;
function optimize(tokens, maxItr) {
    let globalDefsToUse = ["Z", "Y", "X", "W", "V", "U", "T", "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
    let numVoices = 1;
    for (let tk of tokens) {
        if (tk.type === 'new-voice') {
            numVoices++;
        }
    }
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
        let occurrences = countOccurrencesOfSubStrings(tokens);
        let gain = calculateGainFromOccurrences(occurrences);
        let sortedSubstrings = calculateUniqueSubstrings(tokens);
        if (sortedSubstrings[0].gain <= 0) {
            //no more optimizations possible!
            break;
        }
        if (gain.values().next().value <= 0) {
            //no more optimizations possible!
            break;
        }
        //let best: string = gain.keys().next().value;
        let best = sortedSubstrings[0].substring;
        let stringToModify = tokensToString(tokens);
        let localPosition = isLocalDef(stringToModify, best);
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
        let substrPositions = getIndicesOf(stringToModify, best);
        let firstPos = stringToModify.indexOf(best);
        let newDefinition = definitionName.concat("{", best, "}");
        let bestLength = best.length;
        //base case: the definition
        let before = stringToModify.slice(0, firstPos);
        let after = stringToModify.slice(firstPos + bestLength);
        stringToModify = before.concat(newDefinition, after);
        //replacing other occurrences by the letter
        for (let j = 1; j < substrPositions.length; j++) {
            const index = getSecondIncexOf(stringToModify, best);
            let before = stringToModify.slice(0, index);
            let after = stringToModify.slice(index + bestLength);
            stringToModify = before.concat(definitionName, after);
        }
        tokens = (0, myTokenParser_1.provideLutingTokensFromString)(stringToModify);
    }
    return tokensToString(tokens);
}
exports.optimize = optimize;
function isLocalDef(luting, substring) {
    let substrPositions = getIndicesOf(luting, substring);
    let newVoicePositions = getIndicesOf(luting, "|");
    newVoicePositions.unshift(0);
    let localPos = 0;
    for (; localPos < newVoicePositions.length; localPos++) {
        if (substrPositions[0] < newVoicePositions[localPos]) {
            localPos--;
            break;
        }
    }
    for (let i = 1; i < substrPositions.length; i++) {
        if (substrPositions[i] > newVoicePositions[localPos + 1]) {
            return -1;
        }
    }
    return localPos;
}
function getIndicesOf(searchStr, str) {
    var searchStrLen = searchStr.length;
    if (searchStrLen === 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    while ((index = searchStr.indexOf(str, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + str.length;
    }
    return indices;
}
function getSecondIncexOf(searchStr, str) {
    var searchStrLen = searchStr.length;
    if (searchStrLen === 0) {
        return -1;
    }
    var startIndex = 0, index;
    index = searchStr.indexOf(str, startIndex);
    startIndex = index + str.length;
    index = searchStr.indexOf(str, startIndex);
    return index;
}
//# sourceMappingURL=helperFunctions.js.map