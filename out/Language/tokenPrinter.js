"use strict";
// tokenPrinter.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTokens = void 0;
async function printTokens(myTokens) {
    try {
        if (myTokens) {
            // Iterate over the data array and print each token
            let str = '';
            for (let i = 0; i < myTokens.length; i++) {
                str = str.concat(myTokens[i].content.toString(), "; ");
            }
            console.log(str);
        }
        else {
            console.error('Tokens is null or undefined.');
        }
    }
    catch (error) {
        console.error('Error printing tokens:', error);
    }
}
exports.printTokens = printTokens;
//# sourceMappingURL=tokenPrinter.js.map