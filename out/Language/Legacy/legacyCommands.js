"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/;
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
        let myTokens = provideLutingTokensFromString(text);
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
//# sourceMappingURL=legacyCommands.js.map