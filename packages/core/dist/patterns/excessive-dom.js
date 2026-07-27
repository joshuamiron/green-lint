"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcessiveDOMPattern = void 0;
const base_pattern_1 = require("./base-pattern");
const ast_helpers_1 = require("../utils/ast-helpers");
const jsx_ast_helpers_1 = require("../utils/jsx-ast-helpers");
/**
 * Pattern: Avoid Excessive DOM Size
 */
class ExcessiveDOMPattern extends base_pattern_1.BasePattern {
    constructor() {
        super(...arguments);
        this.id = 'excessive-dom';
        this.name = 'Avoid Excessive DOM Size';
        this.category = 'dom';
        this.description = 'Reduce DOM complexity by removing unnecessary wrapper elements';
        this.research = {
            cpuImpact: '7.6% reduction (study conditions)',
            cpuPValue: '0.162 (not statistically significant)',
            sampleSize: 10,
            citation: 'Miron, "Developing a Framework for Retroactively Applying Green Software Engineering Patterns to React Applications", Section 5.2, 2026',
        };
    }
    detect(context) {
        if (context.language === 'jsx' || context.language === 'tsx') {
            return this.detectJSX(context);
        }
        return this.detectHTML(context);
    }
    detectHTML(context) {
        const issues = [];
        const ast = (0, ast_helpers_1.parseHTML)(context.sourceCode);
        const domTree = (0, ast_helpers_1.buildDOMTreeFromHTML)(ast);
        issues.push(...this.detectTotalNodes(context, domTree));
        for (const wrapper of (0, ast_helpers_1.findUnnecessaryDivWrappers)(ast)) {
            const location = (0, ast_helpers_1.getLocation)(wrapper);
            if (location) {
                issues.push(this.createWrapperIssue(context, location));
            }
        }
        return issues;
    }
    detectJSX(context) {
        const issues = [];
        const ast = (0, jsx_ast_helpers_1.parseJSX)(context.sourceCode, context.language === 'tsx');
        const domTree = (0, jsx_ast_helpers_1.buildDOMTreeFromJSX)(ast);
        issues.push(...this.detectTotalNodes(context, domTree));
        for (const wrapper of (0, jsx_ast_helpers_1.findUnnecessaryJSXDivWrappers)(ast)) {
            const location = (0, jsx_ast_helpers_1.getJSXLocation)(wrapper.openingElement);
            if (location) {
                issues.push(this.createWrapperIssue(context, location));
            }
        }
        return issues;
    }
    /**
     * Flag the file itself if its DOM tree exceeds the configured threshold.
     * There's no automatic fix for this - reducing complexity requires
     * human judgment - so no `fixes` are attached.
     */
    detectTotalNodes(context, domTree) {
        const totalNodes = this.countNodes(domTree);
        const maxNodes = context.config?.thresholds?.maxDOMNodes || 1500;
        if (totalNodes <= maxNodes) {
            return [];
        }
        return [
            this.createIssue(context, {
                file: context.filePath,
                startLine: 1,
                startColumn: 0,
                endLine: 1,
                endColumn: 0,
            }, `DOM has ${totalNodes} nodes (recommended: <${maxNodes})`, {
                level: 'low',
                metric: 'Minimal CPU impact for static content',
                source: this.research.citation,
            }),
        ];
    }
    /**
     * Informational only - deliberately no auto-fix. A div that looks like a
     * redundant single-child wrapper from markup alone may still be doing
     * real work (a CSS Grid/Flexbox container, a styling/JS hook) that isn't
     * visible without also checking the stylesheet and script.
     */
    createWrapperIssue(context, location) {
        return this.createIssue(context, {
            file: context.filePath,
            startLine: location.line,
            startColumn: location.column,
            endLine: location.line,
            endColumn: location.column + 4, // length of "<div"
        }, `Wrapper element contains only one child and may be removable. It is not removed automatically, as it could carry styling or scripting the linter cannot detect.`, {
            level: 'low',
            metric: 'Improves maintainability, minimal energy impact',
            source: this.research.citation,
        });
    }
    /**
     * Count total DOM nodes
     */
    countNodes(tree) {
        let count = 0;
        function traverse(nodes) {
            for (const node of nodes) {
                count++;
                if (node.children) {
                    traverse(node.children);
                }
            }
        }
        traverse(tree);
        return count;
    }
}
exports.ExcessiveDOMPattern = ExcessiveDOMPattern;
//# sourceMappingURL=excessive-dom.js.map