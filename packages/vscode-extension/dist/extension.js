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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const core_1 = require("@green-lint/core");
const diagnostics_1 = require("./diagnostics");
const codeActions_1 = require("./codeActions");
let diagnosticCollection;
const engine = new core_1.GreenLintEngine();
/**
 * Extension activation
 */
function activate(context) {
    console.log('Green Lint extension activated!');
    // Create diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('green-lint');
    context.subscriptions.push(diagnosticCollection);
    // Register code action provider
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('html', new codeActions_1.GreenLintCodeActionProvider(), {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));
    // Analyze on file open
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(doc => analyzeDocument(doc)));
    // Analyze on file save
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => analyzeDocument(doc)));
    // Analyze on content change (debounced)
    let timeout;
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => analyzeDocument(event.document), 500);
    }));
    // Command: Analyze current file
    context.subscriptions.push(vscode.commands.registerCommand('green-lint.analyzeFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await analyzeDocument(editor.document);
            vscode.window.showInformationMessage('Green Lint: Analysis complete!');
        }
    }));
    // Command: Fix all issues
    context.subscriptions.push(vscode.commands.registerCommand('green-lint.fixFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        const sourceCode = document.getText();
        // Analyze
        const issues = await engine.analyzeFile(document.fileName, sourceCode);
        if (issues.length === 0) {
            vscode.window.showInformationMessage('Green Lint: No issues to fix!');
            return;
        }
        // Apply fixes
        const fixedCode = await engine.applyFixes(sourceCode, issues);
        // Replace entire document
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(sourceCode.length));
        edit.replace(document.uri, fullRange, fixedCode);
        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(`Green Lint: Fixed ${issues.length} issue(s)!`);
    }));
    // Analyze all open HTML files
    vscode.workspace.textDocuments.forEach(doc => {
        if (doc.languageId === 'html') {
            analyzeDocument(doc);
        }
    });
}
/**
 * Analyze a document and update diagnostics
 */
async function analyzeDocument(document) {
    // Only analyze HTML files
    if (document.languageId !== 'html') {
        return;
    }
    // Check if enabled
    const config = vscode.workspace.getConfiguration('greenLint');
    if (!config.get('enabled', true)) {
        return;
    }
    const sourceCode = document.getText();
    try {
        const issues = await engine.analyzeFile(document.fileName, sourceCode);
        (0, diagnostics_1.updateDiagnostics)(document, diagnosticCollection, issues);
    }
    catch (error) {
        console.error('Green Lint analysis error:', error);
    }
}
/**
 * Extension deactivation
 */
function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
//# sourceMappingURL=extension.js.map