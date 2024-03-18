// tokenPrinter.ts

import * as vscode from 'vscode';
import { LuteDocumentSemanticTokensProvider } from './tokenParser'; // Import the token parser
import { lutingTokenLegend } from './tokenParser';
import { lutingToken } from './myTokenParser';
import { myLuteDocumentSemanticTokensProvider } from './myTokenParser';

export async function printTokens(documentUri: vscode.Uri): Promise<void> {
    try {
        // Load the document
        const document = await vscode.workspace.openTextDocument(documentUri);
        
        // Create an instance of the token provider
        const tokenProvider = new LuteDocumentSemanticTokensProvider();
        const myTokenProvider = new myLuteDocumentSemanticTokensProvider();

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
        } else {
            console.error('Tokens is null or undefined.');
        }
    } catch (error) {
        console.error('Error printing tokens:', error);
    }
}
