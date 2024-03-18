"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandTimings = void 0;
async function expandTimings(tokens) {
    let currentTime = "1";
    for (let i = 0; i < tokens.length; i++) {
        let curr = tokens[i];
        if (curr.type === 'new-voice') {
            currentTime = "1";
        }
        else if (curr.type === 'time') {
            //tx. set current time to x and remove the tx entirely.
            let newTime = curr.content.match(/(\d+\/\d+|\d+|\/\d+)/);
            if (newTime) {
                currentTime = newTime[0];
                tokens.splice(i, 1);
                i--;
            }
            else {
                console.error("big oopsie in expandedTimings: didn't find the new time to set it to");
            }
        }
        else if (curr.type === 'note') {
            const fraction = curr.content.match(/(\d+\/\d+|\d+|\/\d+)/);
            if (fraction) {
                //note already has a fraction, do nothing
            }
            else {
                const currentNote = curr.content.match(/([a-g]'?|r)/);
                if (currentNote) {
                    const newNote = currentNote[0].concat(currentTime.toString());
                    curr.content = newNote;
                }
                else {
                    console.error("shouldn't get here, no current note found.");
                }
            }
        }
    }
    return tokensToString(tokens);
}
exports.expandTimings = expandTimings;
//# sourceMappingURL=timingExpander.js.map