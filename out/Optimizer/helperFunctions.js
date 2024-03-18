"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandDefinitions = exports.tokensToString = void 0;
function tokensToString(tokens) {
    let returnString = "";
    for (var token of tokens) {
        if (token.type === 'luting-header') {
            returnString = returnString.concat(token.content.toString(), " ");
        }
        else {
            returnString = returnString.concat(token.content.toString());
        }
    }
    return returnString;
}
exports.tokensToString = tokensToString;
function expandDefinitions(tokens) {
    let res = "";
    const definitionLookup = {};
    let inDefinition = 0;
    let currentDefinition = [];
    for (var token of tokens) {
        if (inDefinition > 0) {
            //currently making some definitions so add the current token accordingly
            for (var d of currentDefinition) {
                d = d.concat(token.content.toString());
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
        if (token.type === 'predefined-section') {
            //a defined section! let's expand it!
            const defName = token.content.match(/[A-Z]/);
            const repetitions = token.content.match(/\d+/);
            if (defName) {
                if (repetitions) {
                    for (let i = 0; i < +repetitions; i++) {
                        res = res.concat(definitionLookup[defName.toString()].toString());
                    }
                }
                else {
                    res = res.concat(definitionLookup[defName.toString()].toString());
                }
            }
        }
        else if (token.type === 'end-definition') {
            //a definition just finished. This means we added a closing bracket to it which we shouldn't have. let's remove it
            currentDefinition[currentDefinition.length - 1] = currentDefinition[currentDefinition.length - 1].substring(0, currentDefinition[currentDefinition.length - 1].length - 1);
            inDefinition--;
            //the name of the new definition is defined as the first character of the last definition.
            const newDefName = currentDefinition[inDefinition].substring(0, 1);
            //the definition itself is saved right afterwards
            const newDefinition = currentDefinition[inDefinition].substring(1);
            //remove the definition from the array
            currentDefinition.splice(inDefinition);
            definitionLookup[newDefName] = newDefinition;
            res.concat(token.content.toString());
        }
        else {
            res = res.concat(token.content.toString());
        }
    }
    return res;
}
exports.expandDefinitions = expandDefinitions;
//# sourceMappingURL=helperFunctions.js.map