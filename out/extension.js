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
const helper = __importStar(require("./helperFunctions"));
const myTokenParser_1 = require("./Language/myTokenParser");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const timingOptimizer_1 = require("./timingOptimizer");
function activate(context) {
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            // Call the timingExpander functino with the tokens
            const finalizedString = helper.finalizeLuting(myTokens);
            vscode.env.clipboard.writeText(finalizedString);
            vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");
        }
        else {
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            // Call the timingExpander functino with the tokens
            const finalizedString = helper.finalizeLuting(myTokens);
            vscode.env.clipboard.writeText(finalizedString + " Cheer1");
            vscode.window.showInformationMessage("Copied to Clipboard, Hope it sounds good! hryAdmire");
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    /**
    * Optimize current luting. Provides the options of 'safe', 'unsafe' and 'quick'.
    */
    const optimizeCommand = 'lutingsyntax.optimize';
    const optimizeCommandHandler = async () => {
        const optimizationType = await vscode.window.showQuickPick(['thorough', 'quick'], { placeHolder: 'Which type of optimization to use?' });
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor && optimizationType) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            let optimizedResult = helper.tokensToString(myTokens);
            if (optimizationType === 'thorough') {
                optimizedResult = helper.optimize(myTokens, 50, true, false);
            }
            else if (optimizationType === 'quick') {
                optimizedResult = helper.optimize(myTokens, 50, true, true);
            }
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                if (optimizationType === 'thorough') {
                    editBuilder.insert(end, '\n' + "//Safely optimized Luting: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
                }
                else if (optimizationType === 'quick') {
                    editBuilder.insert(end, '\n' + "//Quickly optimized lutiing: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
                }
                else {
                    vscode.window.showErrorMessage("This shouldn't happen. Tell @AnAnnoyingCat about this");
                }
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
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
            }
            catch (error) {
                // Show error message if the download fails
                vscode.window.showErrorMessage("Something went wrong trying to download your luting.");
            }
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    /**
     * Test command used for developing the extension.
     */
    const multiLuteCommand = 'lutingsyntax.multilute';
    const multiLuteCommandHandler = async () => {
        const optimizationType = await vscode.window.showQuickPick(['safe', 'unsafe', 'quick', 'none'], { placeHolder: 'Which type of optimization to use?' });
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor && optimizationType) {
            // Get the current tokens of the active document
            const documentUri = editor.document.uri;
            if (path.extname(documentUri.fsPath) !== '.lute') {
                vscode.window.showErrorMessage('This command can only be run on a .lute file.');
                return;
            }
            const document = await vscode.workspace.openTextDocument(documentUri);
            const text = document.getText();
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            let res = helper.makeOptimalMultilute(myTokens, 50, optimizationType);
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Your Multilutes Sir: " + res + '\n');
            }).then(success => {
                if (success) {
                    //vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            /*
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//test result: " + res + '\n');

            }).then(success => {
                if (success) {
                    //vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                } else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });*/
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    /**
    * Legacy command: Optimized timing compression.
    */
    const timedOptimizationCommand = 'lutingsyntax.timedOptimization';
    const timedOptimizationCommandHandler = async () => {
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            helper.removeComments(myTokens);
            myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(helper.expandDefinitions(myTokens));
            let expandedTokens = helper.expandTimings(myTokens);
            myTokens = (0, timingOptimizer_1.generateBestTimingPlacements)(expandedTokens);
            let timingOptimizedResult = helper.optimize(myTokens, 50, false, false);
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Timing-Optimized Luting: " + '\n' + timingOptimizedResult + '\n' + "//Luting length: " + timingOptimizedResult.length);
            }).then(success => {
                if (success) {
                    //vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    /**
    * Legacy command: Optimize current luting without expanding definitions first.
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const optimizedResult = helper.optimize(myTokens, 50, false, true);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Quickly optimized lutiing: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    /**
    * Legacy command: Safely Optimize the current Luting. Guarantees correctness of final result.
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const optimizedResult = helper.optimize(myTokens, 50, true, false);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Safely optimized Luting: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    /**
    * Legacy command: Unsafely optimize current Luting. Result may not be correct, but most likely will be.
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
            let myTokens = (0, myTokenParser_1.provideLutingTokensFromString)(text);
            const optimizedResult = helper.optimize(myTokens, 50, false, false);
            //write back into the document
            editor.edit(editBuilder => {
                const lastLine = document.lineAt(document.lineCount - 1);
                const end = lastLine.range.end;
                editBuilder.insert(end, '\n' + "//Un(!)-safely optimized luting; make sure it compiles first: " + '\n' + optimizedResult + '\n' + "//Luting length: " + optimizedResult.length);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage("Here's your luting! Hope it sounds good hryAdmire");
                }
                else {
                    vscode.window.showErrorMessage("Failed to writeback optimized luting...");
                }
            });
        }
        else {
            vscode.window.showErrorMessage('No active text editor found.');
        }
    };
    // Add the commands to the context subscriptions
    context.subscriptions.push(vscode.commands.registerCommand(finalizeLuting, finalizeLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(optimizeCommand, optimizeCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(cheerableLuting, cheerableLutingCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(downloadCommand, downloadCommandHandler));
    context.subscriptions.push(vscode.commands.registerCommand(multiLuteCommand, multiLuteCommandHandler));
    //context.subscriptions.push(vscode.commands.registerCommand(testCommand, testCommandHandler));
    /**
     * I THINK IT'S WORKING. BUT I'M NOT SURE. QUICK MIGHT STILL BE BORKED. TEST IF NORMAL ONE WORKS AS IT SHOULD!
     */
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map