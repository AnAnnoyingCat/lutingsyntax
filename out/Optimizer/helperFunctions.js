"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expandDefinitions = exports.tokensToString = void 0;
function tokensToString(tokens) {
    let returnString = "";
    for (var token of tokens) {
        returnString = returnString.concat(token.content.toString());
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
//# sourceMappingURL=helperFunctions.js.map