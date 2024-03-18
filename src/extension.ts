import * as vscode from 'vscode';
import { printTokens } from './Language/tokenPrinter';
import { lutingToken } from './Language/myTokenParser';
import { myLuteDocumentSemanticTokensProvider } from './Language/myTokenParser';
import * as helper from "./Optimizer/helperFunctions";

export function activate(context: vscode.ExtensionContext) {
    console.log("activate was called");
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
                editBuilder.insert(end, '\n\n' + decodedString + '\n');
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
                editBuilder.insert(end, '\n\n' + expandedString + '\n');
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
    // Add the commands to the context subscriptions
    context.subscriptions.push(vscode.commands.registerCommand(printTokensCommand, printTokensCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(tokenizeAndBack, fwbwtokenizeHandler));
    context.subscriptions.push(vscode.commands.registerCommand(expandDefinitionsCommand, expandDefinitionsCommandHandler));
}


/*
// Define the token legend
const legend = new vscode.SemanticTokensLegend([
    'instrument',
    'octave',
    'volume',
    'time',
    'fraction',
    'note',
    'start-definition',
    'end-definition',
    'predefined-section',
    'newVoice',
    'octaveChange',
    'lutingheader'
]);

// Implement the document semantic tokens provider
class LuteDocumentSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SemanticTokens> {
        // Tokenize the document
        const tokensBuilder = new vscode.SemanticTokensBuilder(legend);

        const text = document.getText();
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let lineIndex = 0;

            while (lineIndex < line.length) {
                const char = line[lineIndex];

                // Match patterns
                if (char.match(/\s/)) {
                    // Skip whitespace
                    lineIndex++;
                } else if (char.match(/[A-Z]/)) {
                    // Match predefined section
                    const match = line.substring(lineIndex).match(/^[A-Z]/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'predefined-section');
                        lineIndex += match[0].length;
                    }
                } else if (char === '{') {
                    // Match start-definition
                    tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + 1)), 'start-definition');
                    lineIndex++;
                } else if (char === '}') {
                    // Match end-definition
                    tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + 1)), 'end-definition');
                    lineIndex++;
                } else if (char === '|') {
                    // Match newVoice
                    tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + 1)), 'newVoice');
                    lineIndex++;
                } else if (char === '<' || char === '>') {
                    // Match octaveChange
                    tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + 1)), 'octaveChange');
                    lineIndex++;
                } else if (char === '#' && line.substring(lineIndex).match(/^#lute \d+/)) {
                    // Match lutingheader
                    const match = line.substring(lineIndex).match(/^#lute \d+/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'lutingheader');
                        lineIndex += match[0].length;
                    }
                } else if (char.match(/[a-g]'?|r/)) {
                    // Match note
                    const match = line.substring(lineIndex).match(/^[a-g]'?|r/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'note');
                        lineIndex += match[0].length;
                    }
                } else if (char === 'i') {
                    // Match instrument
                    const match = line.substring(lineIndex).match(/^i\w/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'instrument');
                        lineIndex += match[0].length;
                    }
                } else if (char === 'o' && line.substring(lineIndex).match(/^o\d/)) {
                    // Match octave
                    const match = line.substring(lineIndex).match(/^o\d/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'octave');
                        lineIndex += match[0].length;
                    }
                } else if (char === 'v' && line.substring(lineIndex).match(/^v\d/)) {
                    // Match volume
                    const match = line.substring(lineIndex).match(/^v\d/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'volume');
                        lineIndex += match[0].length;
                    }
                } else if (char === 't' && line.substring(lineIndex).match(/^t\d+/)) {
                    // Match time
                    const match = line.substring(lineIndex).match(/^t\d+/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'time');
                        lineIndex += match[0].length;
                    }
                } else if (char.match(/\d+\/\d+|\d+|\/\d+/)) {
                    // Match fraction
                    const match = line.substring(lineIndex).match(/^(\d+\/\d+|\d+|\/\d+)/);
                    if (match) {
                        tokensBuilder.push(new vscode.Range(new vscode.Position(i, lineIndex), new vscode.Position(i, lineIndex + match[0].length)), 'fraction');
                        lineIndex += match[0].length;
                    }
                } else {
                    // Unrecognized token
                    lineIndex++;
                }
            }
        }

        return tokensBuilder.build();
    }
}
*/