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
exports.GreenLintCodeActionProvider = void 0;
const vscode = __importStar(require("vscode"));
const core_1 = require("@green-lint/core");
/**
 * Provide code actions (quick fixes) for Green Lint diagnostics
 */
class GreenLintCodeActionProvider {
    constructor() {
        this.engine = new core_1.GreenLintEngine();
    }
    async provideCodeActions(document, range, context, token) {
        const actions = [];
        // Find Green Lint diagnostics at this location
        const greenLintDiagnostics = context.diagnostics.filter(d => d.source === 'Green Lint');
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
                const action = new vscode.CodeAction(`🌱 Green Lint: ${preferredFix.description}`, vscode.CodeActionKind.QuickFix);
                action.diagnostics = [diagnostic];
                action.isPreferred = true;
                // Create the edit
                action.edit = new vscode.WorkspaceEdit();
                // Apply all fixes to get the fixed code
                const fixedCode = await this.engine.applyFixes(sourceCode, [issue]);
                // Replace the entire document
                const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(sourceCode.length));
                action.edit.replace(document.uri, fullRange, fixedCode);
                actions.push(action);
            }
        }
        return actions;
    }
}
exports.GreenLintCodeActionProvider = GreenLintCodeActionProvider;
//# sourceMappingURL=codeActions.js.map