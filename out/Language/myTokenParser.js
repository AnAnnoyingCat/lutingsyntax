"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myLuteDocumentSemanticTokensProvider = exports.lutingToken = void 0;
/* All the possible types of tokens:
    'instrument'
    'octave',
    'volume',
    'time',
    'fraction',
    'note',
    'start-definition',
    'end-definition',
    'predefined-section',
    'new-voice',
    'octave-change',
    'luting-header',
    'comment'
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
exports.lutingToken = lutingToken;
// Implement the document semantic tokens provider
class myLuteDocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document, token) {
        /*
        /This function takes a document and tokenizes it into my lutingToken class. It returns an array of said class.
        /
       */
        const lutingTokens = [];
        const text = document.getText();
        const lines = text.split('\n');
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
                    const commentBody = line.substring(lineIndex + 2).match(/^.*?(?=\/\/|$)/);
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
                else if (char === '#' && line.substring(lineIndex).match(/^#lute \d+/)) {
                    // Match luting-header
                    const match = line.substring(lineIndex).match(/^#lute \d+/);
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
                else if (char === 'v') {
                    // Match volume
                    const match = line.substring(lineIndex).match(/^v\d?/);
                    if (match) {
                        lutingTokens.push(new lutingToken(match[0], "volume"));
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
                    }
                }
                else if (char.match(/\d/)) {
                    // Match fraction
                    const match = line.substring(lineIndex).match(/^(\d+\/\d+|\d+|\/\d+)/);
                    if (match) {
                        //shouldn't get here!
                        console.log("oopsie woopsie found a fraction");
                        lutingTokens.push(new lutingToken(match[0], "fraction"));
                        lineIndex += match[0].length;
                    }
                }
                else {
                    // Unrecognized token
                    console.error("unrecognized token: ".concat(char.toString()));
                    lineIndex++;
                }
            }
        }
        return lutingTokens;
    }
}
exports.myLuteDocumentSemanticTokensProvider = myLuteDocumentSemanticTokensProvider;
//# sourceMappingURL=myTokenParser.js.map