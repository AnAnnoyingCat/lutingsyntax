import * as vscode from 'vscode';
import { printTokens } from './Language/tokenPrinter';
import { lutingToken } from './Language/myTokenParser';
import * as helper from "./Optimizer/helperFunctions";
import { provideLutingTokensFromString } from './Language/myTokenParser';

export function activate(context: vscode.ExtensionContext) {

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
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            // Call the printTokens function with the tokens
            await printTokens(myTokens);
        } else {
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
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            // Call the timingExpander functino with the tokens
            const finalizedString = helper.finalizeLuting(myTokens);

            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + finalizedString + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");
                } else {
                    vscode.window.showErrorMessage("Failed to writeback");
                }
            });
            vscode.env.clipboard.writeText(finalizedString);


        } else {
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
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

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
                    vscode.window.showErrorMessage("Failed :(");
                }
            });

        } else {
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
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);
            const expandedString = helper.expandDefinitions(myTokens);
            let expandedTokens = provideLutingTokensFromString(expandedString);
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
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            const optimizedResult = helper.optimize(myTokens, 5);

            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + optimizedResult + '\n');
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here are the test results!");
                } else {
                    vscode.window.showErrorMessage("Failed to add the testResults file");
                }
            });

        } else {
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
