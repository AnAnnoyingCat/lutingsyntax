import * as vscode from 'vscode';
import { printTokens } from './Language/tokenPrinter';
import { lutingToken } from './Language/myTokenParser';
import * as helper from "./Optimizer/helperFunctions";
import { provideLutingTokensFromString } from './Language/myTokenParser';

export function activate(context: vscode.ExtensionContext) {

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
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            // Call the timingExpander functino with the tokens
            const finalizedString = helper.finalizeLuting(myTokens);

            vscode.env.clipboard.writeText(finalizedString);
            vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");


        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };


    // Optimize command
    // Register a language feature provider for the lute language
    const optimizeCommand = 'lutingsyntax.optimize';
    const optimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            const optimizedResult = helper.optimize(myTokens, 50);

            
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Optimized luting: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);

            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your optimized luting! Hope it sounds good hryAdmire");
                } else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
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

            const optimizedResult = helper.optimize(myTokens, 50);


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
    context.subscriptions.push(vscode.commands.registerCommand(finalizeLuting, finalizeLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(optimizeCommand, optimizeCommandHandler));
    //context.subscriptions.push(vscode.commands.registerCommand(testCommand, testCommandHandler));
    /*
      {
        "command": "lutingsyntax.testCommand",
        "title": "Luting: Execute test command"
      },
      */
}
