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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const tokenPrinter_1 = require("./Language/tokenPrinter");
const helper = __importStar(require("./Optimizer/helperFunctions"));
const myTokenParser_1 = require("./Language/myTokenParser");
function activate(context) {
    // Command to print all tokens of current .lute to console; used for testing
    const printTokensCommand = 'lutingsyntax.printTokens';
    const printTokensCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            // Call the printTokens function with the tokens
            await (0, tokenPrinter_1.printTokens)(myTokens);
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Command to turn current .lute file into a cheerable luting string. String will be pasted into current document.
    const finalizeLuting = 'lutingsyntax.finalize';
    const finalizeLutingCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            // Call the timingExpander functino with the tokens
            const finalizedString = helper.finalizeLuting(myTokens);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + finalizedString + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Hope it sounds good! hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Command to expand all current definitions into a big ass string; used for testing
    const expandDefinitionsCommand = 'lutingsyntax.expandDefinitions';
    const expandDefinitionsCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            // Call the timingExpander functino with the tokens
            const expandedString = helper.expandDefinitions(myTokens);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + expandedString + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Let's hope it doesn't fuck up...");
                }
                else {
                    vscode.window.showErrorMessage("Failed :(");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Command to expand all definitions and timings; used for testing.
    const expandDefsAndTimings = 'lutingsyntax.expandDefsAndTimings';
    const expandDefsAndTimingsCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const expandedString = helper.expandDefinitions(myTokens);
            let expandedTokens = (0, myTokenParser_1.provideLutingTokensFromString)(expandedString);
            helper.expandTimings(expandedTokens);
            let res = helper.tokensToString(expandedTokens);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Here is the full result" + '\n' + res + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Let's hope it isn't fucked up...");
                }
                else {
                    vscode.window.showErrorMessage("Failed to add the unjambled luting to the file");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Register a language feature provider for the lute language
    const testCommand = 'lutingsyntax.testCommand';
    const testCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            helper.removeComments(myTokens);
            myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(helper.expandDefinitions(myTokens));
            helper.optimize(myTokens, 5);
            const occurrences = helper.countOccurrencesOfSubStrings(myTokens);
            const gain = helper.calculateGainFromOccurrences(occurrences);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + occurrences + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here are the test results!");
                }
                else {
                    vscode.window.showErrorMessage("Failed to add the unjambled luting to the file");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Add the commands to the context subscriptions
    context.subscriptions.push(vscode.commands.registerCommand(printTokensCommand, printTokensCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(expandDefinitionsCommand, expandDefinitionsCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(testCommand, testCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(finalizeLuting, finalizeLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(expandDefsAndTimings, expandDefsAndTimingsCommandHandler));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map