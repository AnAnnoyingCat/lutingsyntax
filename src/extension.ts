import * as vscode from 'vscode';
import { printTokens } from './Language/tokenPrinter';
import { lutingToken } from './Language/myTokenParser';
import { myLuteDocumentSemanticTokensProvider } from './Language/myTokenParser';
import * as helper from "./Optimizer/helperFunctions";
import { provideLutingTokensFromString } from './Language/myTokenParser';

export function activate(context: vscode.ExtensionContext) {

    // Register a language feature provider for the lute language
    const printTokensCommand = 'lutingsyntax.printTokens';
    const printTokensCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            let myTokens: lutingToken[] = new myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);

            // Call the printTokens function with the tokens
            await printTokens(myTokens);
        } else {
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
            let myTokens: lutingToken[] = new myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);

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
                } else {
                    vscode.window.showErrorMessage("Failed to add the unjambled luting to the file");
                }
            });

        } else {
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
            let myTokens: lutingToken[] = new myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);

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
                } else {
                    vscode.window.showErrorMessage("Failed to writeback");
                }
            });

        } else {
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
            let myTokens: lutingToken[] = new myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);

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
                } else {
                    vscode.window.showErrorMessage("Failed to add the unjambled luting to the file");
                }
            });

        } else {
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
            let myTokens: lutingToken[] = new myLuteDocumentSemanticTokensProvider().provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);

            const expandedString = helper.expandDefinitions(myTokens);
            let expandedTokens = provideLutingTokensFromString(expandedString);
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
                } else {
                    vscode.window.showErrorMessage("Failed to add the unjambled luting to the file");
                }
            });

        } else {
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
