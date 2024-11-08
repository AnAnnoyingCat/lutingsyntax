"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnuthMorrisPrattLutingIndices = exports.optimizeYourLuting = void 0;
/**
 * The class used to tokenize a Luting in order for optimization to more easily check legality of macros.
 */
class lutingToken {
    /*
    /This is a small custom class wich encapsulates what it means to be a luting token
    /
   */
    length;
    type;
    content;
    constructor(content, type) {
        this.content = content;
        this.type = type;
        this.length = content.length;
    }
}
/**
 * The main function of this whole thing. Optimizes a Luting according to legality and certain options
 * @param input The Luting that should be optimized
 * @param maxItr Max amount of iterations that should be gone through. Recommended: 50
 * @param optimization 'quick': Do not expand existing macros first (use with 1.5k characters or longer Lutings!) 'thorough': Expand macros first
 * @returns The optimized Luting as a String
 */
function optimizeYourLuting(input, maxItr, optimization) {
    let tokens = provideLutingTokensFromString(input);
    let optimalLuting;
    if (optimization === 'quick') {
        console.log("Doing quick optimization");
        optimalLuting = optimizeMacros(tokens, maxItr, true, true);
    }
    else if (optimization === 'thorough') {
        console.log("Doing thorough optimization");
        optimalLuting = optimizeMacros(tokens, maxItr, true, false);
    }
    else {
        console.log("Doing no optimization");
        removeComments(tokens);
        optimalLuting = tokensToString(tokens);
    }
    let multilutings = [];
    if (optimalLuting.length < 493) {
        //No multilute Needed!
        return '\n' + optimalLuting;
    }
    //First multilute is different
    let i = 0;
    let curr_multilute = optimalLuting.substring(i, 491);
    curr_multilute = curr_multilute.slice(0, 5).concat(" m", curr_multilute.slice(5));
    multilutings.push(curr_multilute);
    i = 491;
    while (i < optimalLuting.length) {
        curr_multilute = optimalLuting.substring(i, i + 485);
        if (i < optimalLuting.length - 485) {
            curr_multilute = "#lute m ".concat(curr_multilute);
        }
        else {
            //Final multilute
            curr_multilute = "#lute ".concat(curr_multilute);
        }
        multilutings.push(curr_multilute);
        i += 485;
    }
    let res = "";
    for (let j = 0; j < multilutings.length; j++) {
        res = res.concat("\n//Multilute " + (j + 1) + ":" + "\n" + multilutings[j]);
    }
    return res;
}
exports.optimizeYourLuting = optimizeYourLuting;
/**
     * Optimize a given luting according to certain parameters
     * @param tokens The array of lutingTokens to optimize
     * @param maxItr The max number of iterations to optimize for. Recommended 50 for max. Optimization.
     * @param safe 	 Kinda outdated, just set to true since the possible gains from unsafe optimization are miniscule.
     * @param quick	 True: Perform optimization without expanding definitions first. False: perform thorough optimization.
     * @returns A string of the optimized luting
     */
function optimizeMacros(tokens, maxItr, safe, quick) {
    let globalDefsToUse = ["Z", "Y", "X", "W", "V", "U", "T", "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F", "E", "D", "C", "B", "A"];
    let numVoices = KnuthMorrisPrattLutingIndices(tokens, [new lutingToken("|", "new-voice")]).length + 1;
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
    //Setting up with quick optimization
    removeComments(tokens);
    if (!quick) {
        tokens = provideLutingTokensFromString(expandDefinitions(tokens));
        if (tokens.length >= 2500) {
            throw new EvalError("Looks like your luting is really, really long. Please use \'Quick\' optimization instead. (dw, at this length it makes barely any difference)");
        }
    }
    else {
        checkExistingDefs(tokens, globalDefsToUse, localDefsToUse);
        lowestGlobalDef = globalDefsToUse[0];
        hightestLocalDef = localDefsToUse[0][0];
    }
    for (let i = 0; i < maxItr; i++) {
        //Finding the substrings with the best gain
        let sortedSubstrings = calculateUniqueSubstrings(tokens);
        if (sortedSubstrings[bestOffset].gain <= 0) {
            //no more optimizations possible!
            //either no more optimizations present or ran out of definitions.
            console.log("nothing more to gain.");
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
            if (globalDefsToUse.length <= 0) {
                console.log("ran out of global defs. now looking to find more local optimizations");
                bestOffset++;
                continue;
            }
            definitionName = globalDefsToUse[0];
            if (lowestGlobalDef > definitionName) {
                lowestGlobalDef = definitionName;
            }
            //remove this global def from all local defs
            for (let locald of localDefsToUse) {
                const index = locald.indexOf(definitionName);
                if (index !== -1) {
                    locald.splice(index, 1);
                }
            }
            globalDefsToUse.splice(0, 1);
        }
        else {
            if (localDefsToUse[localPosition].length <= 0) {
                console.log("ran out of local defs on this one. trying to find more defs otherplace now.");
                bestOffset++;
                continue;
            }
            definitionName = localDefsToUse[localPosition][0];
            if (hightestLocalDef < definitionName) {
                hightestLocalDef = definitionName;
            }
            const index = globalDefsToUse.indexOf(definitionName);
            if (index !== -1) {
                globalDefsToUse.splice(index, 1);
            }
            localDefsToUse[localPosition].splice(0, 1);
        }
        let numOccurrences = KnuthMorrisPrattLutingIndices(tokens, best).length;
        let newDefinition = new lutingToken(definitionName.concat('{'), "start-definition");
        let newDefEnd = new lutingToken("}", "end-definition");
        //Base case: the definition
        const insertLocation = getLutingIndexOf(tokens, best);
        //add the new definition start and end brackets
        tokens.splice(insertLocation, 0, newDefinition);
        tokens.splice(insertLocation + best.length + 1, 0, newDefEnd);
        //Replacing other occurrences by just the predefined-value
        for (let j = 1; j < numOccurrences; j++) {
            const insertLocation = getSecondLutingIndexOf(tokens, best);
            let newDefinition = new lutingToken(definitionName, "predefined-section");
            tokens.splice(insertLocation, best.length, newDefinition);
        }
        //squash down the current definition
        tokens = squashRepeatedDefs(tokens, new lutingToken(definitionName, "predefined-section"));
    }
    const resultingLuting = tokensToString(tokens);
    return resultingLuting;
}
/**
 * This function takes a string input and tokenizes it into instances of the lutingToken class.
 * @param inputText input string to be tokenized
 * @returns array of lutingToken[]
 */
function provideLutingTokensFromString(inputText) {
    const lutingTokens = [];
    const lines = inputText.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let lineIndex = 0;
        while (lineIndex < line.length) {
            const char = line[lineIndex];
            // Match patterns
            if (char.match(/\s/)) {
                // Skip whitespace
                lineIndex++;
            }
            else if (char === '/' && line.substring(lineIndex + 1, lineIndex + 2) === '/') {
                // Match comment
                const commentBody = line.substring(lineIndex + 2).match(/[^]*?(?=\/\/|$)/);
                const commentEnd = line.substring(lineIndex + 2).match(/\/\//);
                if (char && commentBody) {
                    if (commentEnd) {
                        const fullString = "//".concat(commentBody[0].toString(), commentEnd[0].toString());
                        lutingTokens.push(new lutingToken(fullString, "comment"));
                        lineIndex += fullString.length;
                    }
                    else {
                        const fullString = "//".concat(commentBody[0].toString());
                        lutingTokens.push(new lutingToken(fullString, "comment"));
                        lineIndex += fullString.length;
                    }
                }
                else if (char && commentEnd) {
                    const fullString = "//".concat(commentEnd[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "comment"));
                    lineIndex += fullString.length;
                }
            }
            else if (char.match(/[A-Z]/)) {
                // Match predefined section
                const trailingNum = line.substring(lineIndex + 1).match(/^\d+/);
                if (char && line.substring(lineIndex + 1, lineIndex + 2) === '{') {
                    const fullString = char.concat("{");
                    lutingTokens.push(new lutingToken(fullString, "start-definition"));
                    lineIndex += fullString.length;
                }
                else if (char) {
                    let fullString = "";
                    if (trailingNum) {
                        fullString = char.concat(trailingNum[0].toString());
                    }
                    else {
                        fullString = char;
                    }
                    lutingTokens.push(new lutingToken(fullString, "predefined-section"));
                    lineIndex += fullString.length;
                }
            }
            else if (char === '(') {
                //Match chord
                const chord = line.substring(lineIndex + 1).match(/[^)]+/);
                const closingBracket = line.substring(lineIndex + 1).match(/\)/);
                if (chord && closingBracket) {
                    const trailingFrac = line.substring(lineIndex + chord[0].length + 2).match(/^(\d+\/\d+|\d+|\/\d+)/);
                    if (trailingFrac) {
                        const fullString = "(".concat(chord[0].toString()).concat(closingBracket[0].toString()).concat(trailingFrac[0].toString());
                        lutingTokens.push(new lutingToken(fullString, "chord"));
                        lineIndex += fullString.length;
                    }
                    else {
                        const fullString = "(".concat(chord[0].toString()).concat(closingBracket[0].toString());
                        lutingTokens.push(new lutingToken(fullString, "chord"));
                        lineIndex += fullString.length;
                    }
                }
                else {
                    throw new TypeError("Unfinished chord in line " + i + ", char nr. " + (lineIndex + 1) + ". ");
                }
            }
            else if (char === '}') {
                // Match end-definition
                const trailingNum = line.substring(lineIndex + 1).match(/^\d+/);
                if (trailingNum) {
                    const fullString = char.concat(trailingNum[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "end-definition"));
                    lineIndex += fullString.length;
                }
                else {
                    lutingTokens.push(new lutingToken(char, "end-definition"));
                    lineIndex++;
                }
            }
            else if (char === '|') {
                // Match new-voice
                lutingTokens.push(new lutingToken(char, "new-voice"));
                lineIndex++;
            }
            else if (char === '<' || char === '>') {
                // Match octave-change
                const trailingNum = line.substring(lineIndex + 1).match(/^\d+/);
                if (trailingNum) {
                    const fullString = char.concat(trailingNum[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "octave-change"));
                    lineIndex += fullString.length;
                }
                else {
                    lutingTokens.push(new lutingToken(char, "octave-change"));
                    lineIndex++;
                }
            }
            else if (char === '#' && line.substring(lineIndex).match(/^#lute ?m? ?[0-9]*/)) {
                // Match luting-header
                const match = line.substring(lineIndex).match(/^#lute ?m? ?[0-9]*/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0].concat(" "), "luting-header"));
                    lineIndex += match[0].length;
                }
            }
            else if (char.match(/([a-g]'?|r)/)) {
                // Match note
                const match = line.substring(lineIndex).match(/^[a-g]'?|r/);
                if (match) {
                    const trailingFrac = line.substring(lineIndex + match[0].length).match(/^(\d+\/\d+|\d+|\/\d+)/);
                    if (trailingFrac) {
                        const fullNote = match[0].concat(trailingFrac[0].toString());
                        lutingTokens.push(new lutingToken(fullNote, "note"));
                        lineIndex += fullNote.length;
                    }
                    else {
                        lutingTokens.push(new lutingToken(match[0], "note"));
                        lineIndex += match[0].length;
                    }
                }
            }
            else if (char === 'i') {
                // Match instrument
                const match = line.substring(lineIndex).match(/^i\w/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "instrument"));
                    lineIndex += match[0].length;
                }
            }
            else if (char === 'o') {
                // Match octave
                const match = line.substring(lineIndex).match(/^o\d?/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "octave"));
                    lineIndex += match[0].length;
                }
            }
            else if (char === 'v' || char === '~') {
                // Match volume
                const match = line.substring(lineIndex).match(/^~?v\d?/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "volume"));
                    lineIndex += match[0].length;
                }
            }
            else if (char === 's') {
                // Match volume
                const match = line.substring(lineIndex).match(/^s\d?/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "side"));
                    lineIndex += match[0].length;
                }
            }
            else if (char === 't') {
                // Match time
                const trailingFrac = line.substring(lineIndex + 1).match(/^(\d+\/\d+|\d+|\/\d+)/);
                if (trailingFrac) {
                    const fullString = char.concat(trailingFrac[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "time"));
                    lineIndex += fullString.length;
                }
                else if (char) {
                    lutingTokens.push(new lutingToken(char, "time"));
                    lineIndex += char.length;
                }
            }
            else {
                // Unrecognized token; throwing an error.
                throw new TypeError("unrecognized character: " + char.toString() + " in line " + i + ", char nr. " + (lineIndex + 1) + ".");
            }
        }
    }
    return lutingTokens;
}
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
/**
 * Get all indices of a subset of lutingTokens occurring within an array of lutingToken efficiently.
 * @param tokens 		The array of lutingTokens to check
 * @param subLuting 	The subLuting to check for
 * @returns				Array of indices of lutingTokens
 */
function KnuthMorrisPrattLutingIndices(tokens, subLuting) {
    const T = KnuthMorrisPrattTableBuilder(subLuting);
    let j = 0;
    let k = 0;
    let P = [];
    while (j < tokens.length) {
        if (equalTokens([subLuting[k]], [tokens[j]])) {
            j++;
            k++;
            if (k === subLuting.length) {
                //occurrence found.
                P.push(j - k);
                k = T[k];
            }
        }
        else {
            k = T[k];
            if (k < 0) {
                j++;
                k++;
            }
        }
    }
    return P;
}
exports.KnuthMorrisPrattLutingIndices = KnuthMorrisPrattLutingIndices;
/**
 * Helper function to build the table used in KnuthMorrisPratt.
 * @param subLuting 		Subluting to build the table over
 * @returns 				Array containing the numbers in t[]
 */
function KnuthMorrisPrattTableBuilder(subLuting) {
    let T = [];
    let pos = 1;
    let cnd = 0;
    T[0] = -1;
    while (pos < subLuting.length) {
        if (equalTokens([subLuting[pos]], [subLuting[cnd]])) {
            T[pos] = T[cnd];
        }
        else {
            T[pos] = cnd;
            while (cnd >= 0 && !(equalTokens([subLuting[pos]], [subLuting[cnd]]))) {
                cnd = T[cnd];
            }
        }
        pos++;
        cnd++;
    }
    T.push(0);
    return T;
}
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
/**
 * Helper function to expand all pre-existing definitions. Used for optimization
 * @param tokens The array of lutingTokens to expand
 * @return The String of lutingTokens resulting from expanding all definitions fully.
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
/**
 * Helper function to check for any already present definition letters and remove them globally
 * @param tokens 			The set of tokens to check
 * @param globalDefsToUse 	Array of the global definitions
 * @param localDefsToUse 	Array of the arrays of local definitions
 */
function checkExistingDefs(tokens, globalDefsToUse, localDefsToUse) {
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'start-definition') {
            let defName = tokens[i].content.match(/[A-Z]/)[0];
            if (globalDefsToUse.includes(defName)) {
                globalDefsToUse.splice(globalDefsToUse.indexOf(defName), 1);
                for (let local of localDefsToUse) {
                    local.splice(local.indexOf(defName), 1);
                }
            }
        }
    }
}
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
        const occurrences = KnuthMorrisPrattLutingIndices(tokens, tokenArr).length;
        const length = totalLength(tokenArr);
        const gain = (occurrences * length) - (length + occurrences + 2);
        return { tokenArr, gain };
    });
    substringsWithGain.sort((a, b) => b.gain - a.gain);
    return substringsWithGain;
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
 * Helper function to find out whether a definition is contained within just one voice, and if so in which, and whether it's a safe or unsafe definition.
 * @param tokens 			The array of lutingTokens to check over
 * @param subLuting 		The to-be-defined array of lutingTokens
 * @param currentLocalChar 	The current locally defined character appearing latest in the alphabet; Used for safety-testing.
 * @param safe 				If set to true checks for safety
 * @returns 				-2 if "safe" is set to true and the def is unsafe , -1 if the definition is global and a positive number representing the voice where the def is present otherwise.
 */
function isLocalDef(tokens, subLuting, currentLocalChar, safe) {
    if (!areBracketsLegal(subLuting)) {
        return -2;
    }
    let substrPositions = KnuthMorrisPrattLutingIndices(tokens, subLuting);
    let newVoicePositions = KnuthMorrisPrattLutingIndices(tokens, [new lutingToken("|", "new-voice")]);
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
 * Helper function to check whether a given definition contains premature closing bracket
 * @param tokens to be defined
 * @returns true or false
 */
function areBracketsLegal(tokens) {
    let bracketCnt = 0;
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'start-definition') {
            bracketCnt++;
        }
        else if (tokens[i].type === 'end-definition') {
            bracketCnt--;
        }
        if (bracketCnt < 0) {
            return false;
        }
    }
    return true;
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
//# sourceMappingURL=optimizeLuting.js.map