import * as vscode from 'vscode';
import { GreenLintEngine } from '@green-lint/core';
import { updateDiagnostics } from './diagnostics';
import { GreenLintCodeActionProvider } from './codeActions';

let diagnosticCollection: vscode.DiagnosticCollection;
const engine = new GreenLintEngine();

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('Green Lint extension activated!');
  
  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('green-lint');
  context.subscriptions.push(diagnosticCollection);
  
  // Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      'html',
      new GreenLintCodeActionProvider(),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
      }
    )
  );

  // Analyze on file open
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => analyzeDocument(doc))
  );
  
  // Analyze on file save
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(doc => analyzeDocument(doc))
  );
  
  // Analyze on content change (debounced)
  let timeout: NodeJS.Timeout | undefined;
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(event => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => analyzeDocument(event.document), 500);
    })
  );
  
  // Command: Analyze current file
  context.subscriptions.push(
    vscode.commands.registerCommand('green-lint.analyzeFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await analyzeDocument(editor.document);
        vscode.window.showInformationMessage('Green Lint: Analysis complete!');
      }
    })
  );
  
  // Command: Fix all issues
  context.subscriptions.push(
    vscode.commands.registerCommand('green-lint.fixFile', async () => {
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
      const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(sourceCode.length)
      );
      edit.replace(document.uri, fullRange, fixedCode);
      
      await vscode.workspace.applyEdit(edit);
      
      vscode.window.showInformationMessage(`Green Lint: Fixed ${issues.length} issue(s)!`);
    })
  );
  
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
async function analyzeDocument(document: vscode.TextDocument): Promise<void> {
  // Only analyze HTML files
  if (document.languageId !== 'html') {
    return;
  }
  
  // Check if enabled
  const config = vscode.workspace.getConfiguration('greenLint');
  if (!config.get<boolean>('enabled', true)) {
    return;
  }
  
  const sourceCode = document.getText();
  
  try {
    const issues = await engine.analyzeFile(document.fileName, sourceCode);
    updateDiagnostics(document, diagnosticCollection, issues);
  } catch (error) {
    console.error('Green Lint analysis error:', error);
  }
}

/**
 * Extension deactivation
 */
export function deactivate() {
  if (diagnosticCollection) {
    diagnosticCollection.dispose();
  }
}