// tokenPrinter.ts

import * as vscode from 'vscode';
import { lutingToken } from './myTokenParser';
import { myLuteDocumentSemanticTokensProvider } from './myTokenParser';

export async function printTokens(myTokens: lutingToken[]): Promise<void> {
    try {
        if (myTokens) {
            // Iterate over the data array and print each token
            let str = '';
            for (let i = 0; i < myTokens.length; i++) {
                str = str.concat(myTokens[i].content.toString(), "; ");
            }
            console.log(str);
        } else {
            console.error('Tokens is null or undefined.');
        }
    } catch (error) {
        console.error('Error printing tokens:', error);
    }
}
