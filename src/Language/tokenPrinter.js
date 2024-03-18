"use strict";
// tokenPrinter.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTokens = void 0;
const tokenParser_ts_1 = require("./tokenParser.ts"); // Import the token parser
async function printTokens(document) {
    // Create an instance of the token provider
    const tokenProvider = new tokenParser_ts_1.LuteDocumentSemanticTokensProvider();
    // Get the tokens for the document
    const tokens = await tokenProvider.provideDocumentSemanticTokens(document, null);
    // Print tokens separated by a comma
    const tokenStrings = tokens.data.map(token => {
        return `${token.tokenType},${token.modifiers},${token.deltaLine},${token.deltaStart},${token.length}`;
    });
    console.log(tokenStrings.join(','));
}
exports.printTokens = printTokens;
//# sourceMappingURL=tokenPrinter.js.map