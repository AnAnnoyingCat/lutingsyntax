import * as vscode from 'vscode';

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
    'comment',
    'side',
    'chord'
*/

export class lutingToken{
     /*
     /This is a small custom class wich encapsulates what it means to be a luting token
     /
    */
	length: number;
	type: string;
	content: string;

	constructor(content: string, type: string){
		this.content = content;
		this.type = type;
		this.length = content.length;
	}
}

export function provideLutingTokensFromString(inputText: string): lutingToken[] {
    /*
     * This function takes a string input and tokenizes it into instances of the lutingToken class.
     * It returns an array of such tokens.
     */

    const lutingTokens: lutingToken[] = [];
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
            } else if (char === '/' && line.substring(lineIndex+1, lineIndex+2) === '/') {
                // Match comment
                const commentBody = line.substring(lineIndex+2).match(/[^]*?(?=\/\/|$)/);
                const commentEnd = line.substring(lineIndex+2).match(/\/\//);

                if (char && commentBody){
                    if (commentEnd){
                        const fullString = "//".concat(commentBody[0].toString(), commentEnd[0].toString());
                        lutingTokens.push(new lutingToken(fullString , "comment"));
                        lineIndex += fullString.length;
                    } else {
                        const fullString = "//".concat(commentBody[0].toString());
                        lutingTokens.push(new lutingToken(fullString , "comment"));
                        lineIndex += fullString.length;
                    }
                } else if (char&&commentEnd) {
                    const fullString = "//".concat(commentEnd[0].toString());
                        lutingTokens.push(new lutingToken(fullString , "comment"));
                        lineIndex += fullString.length;
                } 
            } else if (char.match(/[A-Z]/)) {
                // Match predefined section
                const trailingNum = line.substring(lineIndex+1).match(/^\d+/);
                if (char && line.substring(lineIndex+1, lineIndex+2) === '{'){
                    const fullString = char.concat("{");
                    lutingTokens.push(new lutingToken(fullString , "start-definition"));
                    lineIndex += fullString.length;
                } else if (char) {
                    let fullString = "";
                    if (trailingNum){
                        fullString = char.concat(trailingNum[0].toString());
                    } else {
                        fullString = char;
                    }
                    lutingTokens.push(new lutingToken(fullString , "predefined-section"));
                    lineIndex += fullString.length;
                } 
            } else if(char === '('){
                //Match chord
                const chord = line.substring(lineIndex+1).match(/[^)]+/);
                const closingBracket = line.substring(lineIndex+1).match(/\)/);
                if (chord && closingBracket){
                    const trailingFrac = line.substring(lineIndex + chord[0].length + 2).match(/^(\d+\/\d+|\d+|\/\d+)/);
                    if (trailingFrac){
                        const fullString = "(".concat(chord[0].toString()).concat(closingBracket[0].toString()).concat(trailingFrac[0].toString());
                        lutingTokens.push(new lutingToken(fullString, "chord"));
                        lineIndex += fullString.length;
                    } else {
                        const fullString = "(".concat(chord[0].toString()).concat(closingBracket[0].toString());
                        lutingTokens.push(new lutingToken(fullString, "chord"));
                        lineIndex += fullString.length;
                    }
                } else {
                    throw new TypeError("Unfinished chord in line " + i + ", char nr. " + (lineIndex + 1) + ". ");
                }
            } else if (char === '}') {
                // Match end-definition
                const trailingNum = line.substring(lineIndex+1).match(/^\d+/);
                if (trailingNum){
                    const fullString = char.concat(trailingNum[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "end-definition"));
                    lineIndex += fullString.length;
                } else {
                    lutingTokens.push(new lutingToken(char, "end-definition"));
                    lineIndex++;
                }
            }else if (char === '|') {
                // Match new-voice
                lutingTokens.push(new lutingToken(char, "new-voice"));
                lineIndex++;
            } else if (char === '<' || char === '>') {
                // Match octave-change
                const trailingNum = line.substring(lineIndex+1).match(/^\d+/);
                if (trailingNum){
                    const fullString = char.concat(trailingNum[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "octave-change"));
                    lineIndex += fullString.length;
                } else {
                    lutingTokens.push(new lutingToken(char, "octave-change"));
                    lineIndex++;
                }
            } else if (char === '#' && line.substring(lineIndex).match(/^#lute ?m? ?[0-9]*/)) {
                // Match luting-header
                const match = line.substring(lineIndex).match(/^#lute ?m? ?[0-9]*/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0].concat(" "), "luting-header"));
                    lineIndex += match[0].length;
                }
            } else if (char.match(/([a-g]'?|r)/)) {
                // Match note
                const match = line.substring(lineIndex).match(/^[a-g]'?|r/);
                if (match) {
                    const trailingFrac = line.substring(lineIndex + match[0].length).match(/^(\d+\/\d+|\d+|\/\d+)/);
                    if (trailingFrac){
                        const fullNote = match[0].concat(trailingFrac[0].toString());
                        lutingTokens.push(new lutingToken(fullNote, "note"));
                        lineIndex += fullNote.length;
                    } else {
                        lutingTokens.push(new lutingToken(match[0], "note"));
                        lineIndex += match[0].length;
                    }
                }
            } else if (char === 'i') {
                // Match instrument
                const match = line.substring(lineIndex).match(/^i\w/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "instrument"));
                    lineIndex += match[0].length;
                }
            } else if (char === 'o') {
                // Match octave
                const match = line.substring(lineIndex).match(/^o\d?/);

                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "octave"));
                    lineIndex += match[0].length;
                }
            } else if (char === 'v' || char === '~') {
                // Match volume
                const match = line.substring(lineIndex).match(/^~?v\d?/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "volume"));
                    lineIndex += match[0].length;
                }
            } else if (char === 's') {
                // Match volume
                const match = line.substring(lineIndex).match(/^s\d?/);
                if (match) {
                    lutingTokens.push(new lutingToken(match[0], "side"));
                    lineIndex += match[0].length;
                }
            } else if (char === 't') {
                // Match time
                const trailingFrac = line.substring(lineIndex+1).match(/^(\d+\/\d+|\d+|\/\d+)/);
                if (trailingFrac) {
                    const fullString = char.concat(trailingFrac[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "time"));
                    lineIndex += fullString.length;
                } else if (char){
                    lutingTokens.push(new lutingToken(char, "time"));
                    lineIndex += char.length;
                }
            }else if (char === '@') {
                // Match BPM
                const trailingFrac = line.substring(lineIndex+1).match(/^(\d+\/\d+|\d+|\/\d+)/);
                if (trailingFrac) {
                    const fullString = char.concat(trailingFrac[0].toString());
                    lutingTokens.push(new lutingToken(fullString, "time"));
                    lineIndex += fullString.length;
                } else if (char){
                    lutingTokens.push(new lutingToken(char, "time"));
                    lineIndex += char.length;
                }
            }else {
                // Unrecognized token; throwing an error.
                throw new TypeError("unrecognized character: " + char.toString() + " in line " + i + ", char nr. " + (lineIndex + 1) + ".");
            }
        }
    }
    return lutingTokens;
}