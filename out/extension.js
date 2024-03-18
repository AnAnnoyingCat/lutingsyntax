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
const tokenPrinter_1 = require("./Language/tokenPrinter");
function activate(context) {
    // Register a language feature provider for the lute language
    let disposable = vscode.commands.registerCommand('extension.printTokens', async () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            // Get the URI of the active document
            const documentUri = editor.document.uri;
            // Call the printTokens function with the document URI
            await (0, tokenPrinter_1.printTokens)(documentUri);
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    });
    // Add the disposable to the context subscriptions
    context.subscriptions.push(disposable);
}
exports.activate = activate;
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
//# sourceMappingURL=extension.js.map