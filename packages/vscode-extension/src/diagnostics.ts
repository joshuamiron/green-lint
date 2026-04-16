import * as vscode from 'vscode';
import { Issue } from '@green-lint/core';

/**
 * Convert Green Lint issues to VS Code diagnostics
 */
export function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
  issues: Issue[]
): void {
  const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
    // Convert line/column to VS Code range
    const startPos = new vscode.Position(
      issue.location.startLine - 1,  // VS Code is 0-indexed
      issue.location.startColumn - 1
    );
    
    const endPos = new vscode.Position(
      issue.location.endLine - 1,
      issue.location.endColumn - 1
    );
    
    const range = new vscode.Range(startPos, endPos);
    
    // Create diagnostic
    const diagnostic = new vscode.Diagnostic(
      range,
      issue.message,
      getSeverity(issue.severity)
    );
    
    diagnostic.code = issue.patternId;
    diagnostic.source = 'Green Lint';
    
    // Add energy impact info
    diagnostic.relatedInformation = [
      new vscode.DiagnosticRelatedInformation(
        new vscode.Location(document.uri, range),
        `Energy Impact: ${issue.energyImpact.metric}`
      )
    ];
    
    return diagnostic;
  });
  
  collection.set(document.uri, diagnostics);
}

/**
 * Map severity
 */
function getSeverity(severity: 'error' | 'warning' | 'info'): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'error':
      return vscode.DiagnosticSeverity.Error;
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    case 'info':
      return vscode.DiagnosticSeverity.Information;
  }
}