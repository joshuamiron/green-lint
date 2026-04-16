import * as vscode from 'vscode';
import { GreenLintEngine, Issue } from '@green-lint/core';

/**
 * Provide code actions (quick fixes) for Green Lint diagnostics
 */
export class GreenLintCodeActionProvider implements vscode.CodeActionProvider {
  private engine = new GreenLintEngine();
  
  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];
    
    // Find Green Lint diagnostics at this location
    const greenLintDiagnostics = context.diagnostics.filter(
      d => d.source === 'Green Lint'
    );
    
    if (greenLintDiagnostics.length === 0) {
      return actions;
    }
    
    // Analyze the file to get issues with fixes
    const sourceCode = document.getText();
    const issues = await this.engine.analyzeFile(document.fileName, sourceCode);
    
    // Create code actions for each diagnostic
    for (const diagnostic of greenLintDiagnostics) {
      // Find the matching issue
      const issue = issues.find(i => {
        const diagLine = diagnostic.range.start.line + 1; // Convert to 1-indexed
        return i.location.startLine === diagLine && i.patternId === diagnostic.code;
      });
      
      if (issue && issue.fixes.length > 0) {
        // Create a code action for the preferred fix
        const preferredFix = issue.fixes.find(f => f.isPreferred) || issue.fixes[0];
        
        const action = new vscode.CodeAction(
          `🌱 Green Lint: ${preferredFix.description}`,
          vscode.CodeActionKind.QuickFix
        );
        
        action.diagnostics = [diagnostic];
        action.isPreferred = true;
        
        // Create the edit
        action.edit = new vscode.WorkspaceEdit();
        
        // Apply all fixes to get the fixed code
        const fixedCode = await this.engine.applyFixes(sourceCode, [issue]);
        
        // Replace the entire document
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(sourceCode.length)
        );
        
        action.edit.replace(document.uri, fullRange, fixedCode);
        
        actions.push(action);
      }
    }
    
    return actions;
  }
}