"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadLuteFilePrime = exports.downloadLuteFile = exports.optimize = exports.expandTimings = exports.finalizeLuting = exports.removeComments = exports.expandDefinitions = exports.equalTokens = exports.tokensToString = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring = __importStar(require("querystring"));
const myTokenParser_1 = require("./Language/myTokenParser");
/**
 * Helper function to convert an array of lutingTokens to a string.
 * @param tokens The array of lutingTokens to convert
 * @returns The string resulting from concatenating all contents of tokens in lutingToken.
 */
function tokensToString(tokens) {
    let returnString = "";
    for (var token of tokens) {
        returnString = returnString.concat(token.content.toString());
    }
    return returnString;
}
exports.tokensToString = tokensToString;
/**
 * Helper function to check equality of two arrays of lutingTokens, where t1 === t2 iff t1.content === t2.content.
 * @param t1s The first array of tokens
 * @param t2s The second array of tokens
 * @returns True iff t1s and t2s are equal.
 */
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
/**
 * Helper function to expand all pre-existing definitions. Used for optimization
 * @param tokens The array of lutingTokens to expand
 * @return The array of lutingTokens resulting from expanding all definitions fully.
 */
function expandDefinitions(tokens) {
    let res = "";
    const definitionLookup = {};
    let inDefinition = 0;
    let currentDefinition = [];
    for (var token of tokens) {
        if (inDefinition > 0) {
            if (!(token.type === 'end-definition' || token.type === 'start-definition' || token.type === 'predefined-section')) {
                //Add to innermost definitions
                currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].concat(token.content.toString());
            }
        }
        //Now we take care of any definitions happening
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
/**
 * Simple helper functino to remove comments
 * @param tokens The array of lutingTokens to remove comments from
 * @return The array of lutingTokens with all type 'comment' tokens removed
 */
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
/**
 * Return a cheerable luting string by removing comments and newlines first
 * @param tokens The array of lutingTokens to finalize
 * @return The finallized string
 */
function finalizeLuting(tokens) {
    removeComments(tokens);
    return tokensToString(tokens);
}
exports.finalizeLuting = finalizeLuting;
/**
 * WIP expands all notes into their fully written out durations
 * @param tokens The array of lutingTokens to expand
 * @returns The array of expanded tokens.
 */
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
/**
 * Calculate all legal unique subarrays of a given array of a luting and calculate their possible gain from definition
 * @param tokens The array of lutingTokens to check
 * @returns A map of array of lutingToken to the possible gain
 */
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
                    //Cannot contain new voice
                    skipVoice = true;
                    break;
                }
                else if (tk.type === 'instrument') {
                    //Cannot contain instrument
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
/**
 * Helper function that squashes all repeated definitions into one. E.g. AAAA = A4
 * @param tokens The array of lutingTokens to squash
 * @returns The squashed array
 */
function squashRepeatedDefs(tokens, def) {
    let cnt = 0;
    let rep = false;
    let repStart = 0;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'start-definition' && tokens[i].content.charAt(0) === def.content) {
            let j = i + 1;
            let inDef = 1;
            for (; j < tokens.length; j++) {
                if (tokens[j].type === 'end-definition') {
                    inDef--;
                    if (inDef === 0) {
                        break;
                    }
                }
                else if (tokens[j].type === 'start-definition') {
                    inDef++;
                }
            }
            let localCnt = 1;
            let replacePos = j;
            j++;
            while (j < tokens.length && tokens[j].type === 'predefined-section' && tokens[j].content === def.content) {
                localCnt++;
                j++;
            }
            //now we need to replace the end-definition at replacePos (which currently is "}" by design) with "}localCnt"
            if (localCnt > 1) {
                tokens[replacePos].content = "}".concat(localCnt.toString());
                tokens.splice(replacePos + 1, localCnt - 1);
            }
        }
        else if (tokens[i].type === 'predefined-section' && tokens[i].content === def.content) {
            //We're counting now, boys!
            rep = true;
            repStart = i;
            cnt++;
        }
        else {
            if (rep && cnt > 1) {
                //we were counting reps but this one doesn't match up. We found a squashable section though.
                tokens[i - cnt].content = tokens[i - cnt].content.concat(cnt.toString());
                tokens.splice(i - cnt + 1, cnt - 1);
                i -= cnt;
                rep = false;
                cnt = 0;
            }
            else if (rep) {
                //we just counted one occurrence.
                rep = false;
                cnt = 0;
            }
        }
    }
    if (cnt > 1) {
        tokens[tokens.length - cnt].content = tokens[tokens.length - cnt].content.concat(cnt.toString());
        tokens.splice(tokens.length - cnt + 1, cnt - 1);
    }
    return tokens;
}
/**
 * Optimize a given luting according to certain parameters
 * @param tokens The array of lutingTokens to optimize
 * @param maxItr The max number of iterations to optimize for
 * @param safe 	 True: Optimize safely and produce a guaranteed correct result; False: Optimize unsafely
 * @param quick	 True: Perform optimization without expanding definitions first
 * @returns A string of the optimized luting
 */
function optimize(tokens, maxItr, safe, quick) {
    let globalDefsToUse = ["Z", "Y", "X", "W", "V", "U", "T", "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
    let numVoices = getLutingIndicesOf(tokens, [new myTokenParser_1.lutingToken("|", "new-voice")]).length + 1;
    let localDefsToUse = [];
    for (let i = 0; i < numVoices; i++) {
        localDefsToUse[i] = [];
        for (let j = globalDefsToUse.length - 1; j >= 0; j--) {
            localDefsToUse[i].push(globalDefsToUse[j]);
        }
    }
    let lowestGlobalDef = "Z";
    let hightestLocalDef = "A";
    //used for tracking legality of best transformation
    let bestOffset = 0;
    removeComments(tokens);
    if (!quick) {
        tokens = (0, myTokenParser_1.provideLutingTokensFromString)(expandDefinitions(tokens));
    }
    for (let i = 0; i < maxItr; i++) {
        //Finding the substrings with the best gain
        let sortedSubstrings = calculateUniqueSubstrings(tokens);
        if (sortedSubstrings[0].gain <= 0 || hightestLocalDef === lowestGlobalDef) {
            //no more optimizations possible!
            //either no more optimizations present or ran out of definitions.
            if (hightestLocalDef === lowestGlobalDef) {
                console.log("ran out of defs");
            }
            break;
        }
        let best = sortedSubstrings[bestOffset].tokenArr;
        //Figuring out whether the optimization is local or global; use different naming respectively
        let localPosition = isLocalDef(tokens, best, hightestLocalDef, safe);
        let definitionName = "";
        if (localPosition === -2) {
            //current best option is sadly illegal
            console.log("found some illegal definitions. ignoring...");
            bestOffset++;
            continue;
        }
        if (localPosition < 0) {
            //not local
            definitionName = globalDefsToUse[0];
            if (lowestGlobalDef > definitionName) {
                lowestGlobalDef = definitionName;
            }
            globalDefsToUse.splice(0, 1);
        }
        else {
            definitionName = localDefsToUse[localPosition][0];
            if (hightestLocalDef < definitionName) {
                hightestLocalDef = definitionName;
            }
            localDefsToUse[localPosition].splice(0, 1);
        }
        let numOccurrences = getLutingIndicesOf(tokens, best).length;
        let newDefinition = new myTokenParser_1.lutingToken(definitionName.concat('{'), "start-definition");
        let newDefEnd = new myTokenParser_1.lutingToken("}", "end-definition");
        //Base case: the definition
        const insertLocation = getLutingIndexOf(tokens, best);
        //add the new definition start and end brackets
        tokens.splice(insertLocation, 0, newDefinition);
        tokens.splice(insertLocation + best.length + 1, 0, newDefEnd);
        //Replacing other occurrences by just the predefined-value
        for (let j = 1; j < numOccurrences; j++) {
            const insertLocation = getSecondLutingIndexOf(tokens, best);
            let newDefinition = new myTokenParser_1.lutingToken(definitionName, "predefined-section");
            tokens.splice(insertLocation, best.length, newDefinition);
        }
        //squash down the current definition
        tokens = squashRepeatedDefs(tokens, new myTokenParser_1.lutingToken(definitionName, "predefined-section"));
    }
    const resultingLuting = tokensToString(tokens);
    return resultingLuting;
}
exports.optimize = optimize;
/**
 * Helper function to find out whether a definition is contained within just one voice, and if so in which, and whether it's a safe or unsafe definition.
 * @param tokens 			The array of lutingTokens to check over
 * @param subLuting 		The to-be-defined array of lutingTokens
 * @param currentLocalChar 	The current locally defined character appearing latest in the alphabet; Used for safety-testing.
 * @param safe 				If set to true checks for safety
 * @returns 				-2 if "safe" is set to true and the def is unsafe , -1 if the definition is global and a positive number representing the voice where the def is present otherwise.
 */
function isLocalDef(tokens, subLuting, currentLocalChar, safe) {
    let substrPositions = getLutingIndicesOf(tokens, subLuting);
    let newVoicePositions = getLutingIndicesOf(tokens, [new myTokenParser_1.lutingToken("|", "new-voice")]);
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
            if (safe) {
                //for safety: if we're trying to assign a previously used local letter on global ground, we're breaking the rules.
                let localLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
                localLetters = localLetters.slice(0, localLetters.indexOf(currentLocalChar));
                for (let l of localLetters) {
                    for (let i = 0; i < subLuting.length; i++) {
                        if (subLuting[i].content.indexOf(l) > -1) {
                            return -2;
                        }
                    }
                }
            }
            return -1;
        }
    }
    return localPos;
}
/**
 * Helper function to find out whether a definition is contained within just one voice, and if so in which, and whether it's a safe or unsafe definition.
 * @param tokens 			The array of lutingTokens to count.
 * @returns 				Length of the string resulting from concatenating all the contents
 */
function totalLength(tokens) {
    let cnt = 0;
    for (let l of tokens) {
        cnt += l.length;
    }
    return cnt;
}
/**
 * Get all indices of a subset of lutingTokens occurring within an array of lutingToken
 * @param tokens 			The array of lutingTokens to check.
 * @param subLuting			The subLuting to check for
 * @returns 				Array of indices of lutingTokens
 */
function getLutingIndicesOf(tokens, subLuting) {
    var searchLutingLength = tokens.length;
    if (searchLutingLength === 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    while ((index = getLutingIndexAfter(tokens, subLuting, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + subLuting.length;
    }
    return indices;
}
/**
  * Get the index of the first occurrence of a lutingToken[] appearing AFTER the start-index
  * @param tokens 			The array of lutingTokens to check.
  * @param subLuting			The subLuting to check for.
  * @param start				The start-index
  * @returns 				Position of first occurrence, -1 if none found.
  */
function getLutingIndexAfter(tokens, subLuting, start) {
    const subLutingLength = subLuting.length;
    for (let i = start; i <= tokens.length - subLutingLength; i++) {
        if (equalTokens(subLuting, tokens.slice(i, i + subLutingLength))) {
            return i;
        }
    }
    return -1;
}
/**
   * Get the index of the first occurrence of a lutingToken[]
   * @param tokens 			The array of lutingTokens to check.
   * @param subLuting			The subLuting to check for.
   * @returns 				Position of first occurrence, -1 if none found.
   */
function getLutingIndexOf(tokens, subLuting) {
    const subLutingLength = subLuting.length;
    for (let i = 0; i <= tokens.length - subLutingLength; i++) {
        if (equalTokens(subLuting, tokens.slice(i, i + subLutingLength))) {
            return i;
        }
    }
    return -1;
}
/**
   * Get the index of the second occurrence of a lutingToken[].
   * @param tokens 			The array of lutingTokens to check.
   * @param subLuting			The subLuting to check for.
   * @returns 				Position of secnd occurrence, -1 if none found.
   */
function getSecondLutingIndexOf(tokens, subLuting) {
    const subLutingLength = subLuting.length;
    let cnt = 0;
    let i = 0;
    for (; i <= tokens.length - subLutingLength && cnt !== 2; i++) {
        if (i === 925) {
            let breakpoint = 3;
        }
        if (equalTokens(subLuting, tokens.slice(i, i + subLutingLength))) {
            cnt++;
        }
    }
    if (cnt === 2) {
        return i - 1;
    }
    return -1;
}
/**
   * Download the provided luting string from luteboi.com. Timeout 30 seconds.
   * @param finalizedLuting	String of the finalized luting.
   * @returns 				The file returned by luteboi.com
   */
async function downloadLuteFile(finalizedLuting) {
    const baseUrl = 'https://luteboi.com/lute/';
    const queryParams = querystring.stringify({ message: finalizedLuting });
    const url = `${baseUrl}?${queryParams}`;
    try {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer', timeout: 120000 });
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to download the Luting.`);
    }
}
exports.downloadLuteFile = downloadLuteFile;
// Function to make a GET request to get the filename
async function getLuteFileName(finalizedLuting) {
    const baseUrl = 'https://luteboi.com/v2/lute/';
    const queryParams = querystring.stringify({ message: finalizedLuting });
    const url = `${baseUrl}?${queryParams}`;
    try {
        const response = await axios_1.default.get(url);
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to get lute filename`);
    }
}
// Function to make a POST request to download the lute file
// Function to make a POST request to download the lute file
async function downloadLuteFilePrime(finalizedLuting) {
    try {
        // Get the filename from the server
        const filename = await getLuteFileName(finalizedLuting);
        // Define function to make a periodic request
        const makePeriodicRequest = async () => {
            try {
                // Make a POST request to get the lute file
                const getFileUrl = 'https://luteboi.com/v2/get_lute/';
                const fileResponse = await axios_1.default.post(getFileUrl, { file: filename }, { responseType: 'arraybuffer' });
                // If response contains data, return the file
                if (fileResponse.data.byteLength > 0) {
                    return fileResponse.data;
                }
                else {
                    // If response does not contain data, wait for 1 second and make another request
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                    return makePeriodicRequest();
                }
            }
            catch (error) {
                // If an error occurs, wait for 1 second and make another request
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                return makePeriodicRequest();
            }
        };
        // Start the periodic request
        return makePeriodicRequest();
    }
    catch (error) {
        throw new Error(`Failed to get lute filename`);
    }
}
exports.downloadLuteFilePrime = downloadLuteFilePrime;
//# sourceMappingURL=helperFunctions.js.map