import * as vscode from 'vscode';
import { lutingToken } from './Language/myTokenParser';
import * as helper from "./helperFunctions";
import { provideLutingTokensFromString } from './Language/myTokenParser';
import axios from 'axios';
import * as querystring from 'querystring';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

    /**
    * Command to create a String from current .lute file and Paste it into the users clipboard.
    */
    const finalizeLuting = 'lutingsyntax.finalize';
    const finalizeLutingCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
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

    /**
    * Command to create a cheerable string from current luting and paste it into the user's clipboard.
    */
    const cheerableLuting = 'lutingsyntax.cheer';
    const cheerableLutingCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            // Call the timingExpander functino with the tokens
            const finalizedString = helper.finalizeLuting(myTokens);

            vscode.env.clipboard.writeText(finalizedString + " Cheer1");
            vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");
        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };


    /**
    * Safely Optimize the current Luting. Guarantees correctness of final result.
    * Possibly worse result than unsafe due to better guarantees.
    */
    const safeOptimizeCommand = 'lutingsyntax.safeoptimize';
    const safeOptimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            const optimizedResult = helper.optimize(myTokens, 50, true, false);

            
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Safely optimized Luting: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);

            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                } else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });

        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };

    /**
    * Unsafely optimize current Luting. Result may not be correct, but most likely will be. 
    * Possibly better results than safe optimization due to less guarantees.
    */
    const unsafeOptimizeCommand = 'lutingsyntax.unsafeoptimize';
    const unsafeOptimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            const optimizedResult = helper.optimize(myTokens, 50, false, false);

            
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Un(!)-safely optimized luting; make sure it compiles first: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);

            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                } else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });

        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };

    /**
    * Optimize current luting without expanding definitions first.
    * Is not safe.
    */
    const quickOptimizeCommand = 'lutingsyntax.quickoptimize';
    const quickOptimizeCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

            const optimizedResult = helper.optimize(myTokens, 50, false, true);

            
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Quickly optimized lutiing: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);

            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                } else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });

        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    
    /**
    * Command to download current .lute file into Lute-Out folder.
    */
    const downloadCommand = 'lutingsyntax.download';
    const downloadCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);
            const finalizedLuting = helper.finalizeLuting(myTokens);

            try {
                // Make a GET request to download the lute file
                const luteFile = await helper.downloadLuteFile(finalizedLuting);

                // Save the lute file to the Luting-Out directory
                const luteFileName = path.basename(documentUri.fsPath, path.extname(documentUri.fsPath));
                const luteOutDir = path.join(path.dirname(documentUri.fsPath), 'Luting-Out');
                if (!fs.existsSync(luteOutDir)) {
                    fs.mkdirSync(luteOutDir);
                }
                const luteOutFilePath = path.join(luteOutDir, `${luteFileName}.wav`);
                fs.writeFileSync(luteOutFilePath, luteFile);

                // Inform user about successful download
                vscode.window.showInformationMessage(`Lute file downloaded successfully to ${luteOutFilePath}`);
            } catch (error) {
                // Show error message if the download fails
                vscode.window.showErrorMessage("Something went wrong trying to download your luting.");
            }
        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };


    /**
    * Test command used for developing the extension.
    */
    const testCommand = 'lutingsyntax.testCommand';
    const testCommandHandler = async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens: lutingToken[] = provideLutingTokensFromString(text);

        } else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };



    
    // Add the commands to the context subscriptions
    context.subscriptions.push(vscode.commands.registerCommand(finalizeLuting, finalizeLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(safeOptimizeCommand, safeOptimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(unsafeOptimizeCommand, unsafeOptimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(quickOptimizeCommand, quickOptimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(cheerableLuting, cheerableLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(downloadCommand, downloadCommandHandler));
    //context.subscriptions.push(vscode.commands.registerCommand(testCommand, testCommandHandler));
}
