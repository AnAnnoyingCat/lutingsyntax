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
const helper = __importStar(require("./Optimizer/helperFunctions"));
const myTokenParser_1 = require("./Language/myTokenParser");
function activate(context) {
    // Command to turn current .lute file into a cheerable luting string and copy it to clipboard.
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
            vscode.env.clipboard.writeText(finalizedString);
            vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    //Command to return cheerable string from current luting.
    const cheerableLuting = 'lutingsyntax.cheer';
    const cheerableLutingCommandHandler = async () => {
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
            vscode.env.clipboard.writeText(finalizedString);
            vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Safe Optimize command
    // Implements additional correctness guarantees at the cost of possible gain
    const safeOptimizeCommand = 'lutingsyntax.safeoptimize';
    const safeOptimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const optimizedResult = helper.optimize(myTokens, 50, true, false);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Safely optimized Luting: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Unsafe Optimize command
    // Is most probably correct but not guaranteed, possibly better gain
    const unsafeOptimizeCommand = 'lutingsyntax.unsafeoptimize';
    const unsafeOptimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const optimizedResult = helper.optimize(myTokens, 50, false, false);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Un(!)-safely optimized luting; make sure it compiles first: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Quick Optimize command
    // Is most probably correct but not guaranteed, possibly better gain
    const quickOptimizeCommand = 'lutingsyntax.quickoptimize';
    const quickOptimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const optimizedResult = helper.optimize(myTokens, 50, false, true);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Quickly optimized lutiing: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
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
            const optimizedResult = helper.optimize(myTokens, 50, false, false);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + optimizedResult + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here are the test results!");
                }
                else {
                    vscode.window.showErrorMessage("Failed to add the testResults file");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Add the commands to the context subscriptions
    context.subscriptions.push(vscode.commands.registerCommand(finalizeLuting, finalizeLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(safeOptimizeCommand, safeOptimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(unsafeOptimizeCommand, unsafeOptimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(quickOptimizeCommand, quickOptimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(cheerableLuting, cheerableLutingCommandHandler));
    /*
      {
        "command": "lutingsyntax.testCommand",
        "title": "Luting: Execute test command"
      },
      */
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map