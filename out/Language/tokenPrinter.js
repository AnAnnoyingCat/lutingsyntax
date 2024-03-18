"use strict";
// tokenPrinter.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTokens = void 0;
const vscode = __importStar(require("vscode"));
const tokenParser_1 = require("./tokenParser"); // Import the token parser
const myTokenParser_1 = require("./myTokenParser");
async function printTokens(documentUri) {
    try {
        // Load the document
        const document = await vscode.workspace.openTextDocument(documentUri);
        // Create an instance of the token provider
        const tokenProvider = new tokenParser_1.LuteDocumentSemanticTokensProvider();
        const myTokenProvider = new myTokenParser_1.myLuteDocumentSemanticTokensProvider();
        // Get the tokens for the document
        const tokens = await tokenProvider.provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
        const myTokens = await myTokenProvider.provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
        if (myTokens) {
            // Iterate over the data array and print each token
            let str = "";
            for (let i = 0; i < myTokens.length; i++) {
                console.log(myTokens[i].content);
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