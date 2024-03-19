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
const myTokenParser_1 = require("./Language/myTokenParser");
const helper = __importStar(require("./Optimizer/helperFunctions"));
const myTokenParser_2 = require("./Language/myTokenParser");
function activate(context) {
    // Register a language feature provider for the lute language
    const printTokensCommand = 'lutingsyntax.printTokens';
    const printTokensCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            let myTokens = new myTokenParser_1.myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
            // Call the printTokens function with the tokens
            await (0, tokenPrinter_1.printTokens)(myTokens);
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    const tokenizeAndBack = 'lutingsyntax.fwbwtokenize';
    const fwbwtokenizeHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            let myTokens = new myTokenParser_1.myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
            // Call the timingExpander functino with the tokens
            const decodedString = helper.tokensToString(myTokens);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + decodedString + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Let's hope it still sounds decent hryLaf");
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
    const finalizeLuting = 'lutingsyntax.finalize';
    const finalizeLutingCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            let myTokens = new myTokenParser_1.myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
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
    const expandDefinitionsCommand = 'lutingsyntax.expandDefinitions';
    const expandDefinitionsCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            let myTokens = new myTokenParser_1.myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
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
            let myTokens = new myTokenParser_1.myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);
            // Call the printTokens function with the tokens
            const expandedString = helper.expandDefinitions(myTokens);
            let expandedTokens = (0, myTokenParser_2.provideLutingTokensFromString)(expandedString);
            helper.expandTimings(expandedTokens);
            let res = helper.tokensToString(expandedTokens);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + res + '\n');
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
    context.subscriptions.push(vscode.commands.registerCommand(tokenizeAndBack, fwbwtokenizeHandler));
    context.subscriptions.push(vscode.commands.registerCommand(expandDefinitionsCommand, expandDefinitionsCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(testCommand, testCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(finalizeLuting, finalizeLutingCommandHandler));
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map