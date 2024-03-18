// tokenPrinter.ts

import * as vscode from 'vscode';
import { LuteDocumentSemanticTokensProvider } from './tokenParser'; // Import the token parser

export async function printTokens(documentUri: vscode.Uri): Promise<void> {
    try {
        // Load the document
        const document = await vscode.workspace.openTextDocument(documentUri);
        
        // Create an instance of the token provider
        const tokenProvider = new LuteDocumentSemanticTokensProvider();

        // Get the tokens for the document
        const tokens = await tokenProvider.provideDocumentSemanticTokens(document, (new vscode.CancellationTokenSource()).token);

        if (tokens) {
            // Iterate over the data array and print each token
            for (let i = 0; i < tokens.data.length; i++) {
                const token = tokens.data[i];
                console.log(token); // Or use console.log(JSON.stringify(token)) for better formatting
            }
        } else {
            console.error('Tokens is null or undefined.');
        }
    } catch (error) {
        console.error('Error printing tokens:', error);
    }
}
