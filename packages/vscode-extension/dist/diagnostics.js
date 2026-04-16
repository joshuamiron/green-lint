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
exports.updateDiagnostics = updateDiagnostics;
const vscode = __importStar(require("vscode"));
/**
 * Convert Green Lint issues to VS Code diagnostics
 */
function updateDiagnostics(document, collection, issues) {
    const diagnostics = issues.map(issue => {
        // Convert line/column to VS Code range
        const startPos = new vscode.Position(issue.location.startLine - 1, // VS Code is 0-indexed
        issue.location.startColumn - 1);
        const endPos = new vscode.Position(issue.location.endLine - 1, issue.location.endColumn - 1);
        const range = new vscode.Range(startPos, endPos);
        // Create diagnostic
        const diagnostic = new vscode.Diagnostic(range, issue.message, getSeverity(issue.severity));
        diagnostic.code = issue.patternId;
        diagnostic.source = 'Green Lint';
        // Add energy impact info
        diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, range), `Energy Impact: ${issue.energyImpact.metric}`)
        ];
        return diagnostic;
    });
    collection.set(document.uri, diagnostics);
}
/**
 * Map severity
 */
function getSeverity(severity) {
    switch (severity) {
        case 'error':
            return vscode.DiagnosticSeverity.Error;
        case 'warning':
            return vscode.DiagnosticSeverity.Warning;
        case 'info':
            return vscode.DiagnosticSeverity.Information;
    }
}
//# sourceMappingURL=diagnostics.js.map