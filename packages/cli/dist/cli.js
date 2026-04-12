#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const glob_1 = require("glob");
const fs_1 = require("fs");
const core_1 = require("@green-lint/core");
const program = new commander_1.Command();
program
    .name('green-lint')
    .description('Energy-aware code analysis and auto-fixing')
    .version('0.1.0');
/**
 * Analyze command
 */
program
    .command('analyze')
    .description('Analyze files for green software issues')
    .argument('<pattern>', 'File pattern to analyze (e.g., "src/**/*.html")')
    .option('--json', 'Output results as JSON')
    .action(async (pattern, options) => {
    console.log(chalk_1.default.blue('🌱 Green Lint - Analyzing files...\n'));
    // Find files
    const files = await (0, glob_1.glob)(pattern);
    if (files.length === 0) {
        console.log(chalk_1.default.yellow('No files found matching pattern:', pattern));
        return;
    }
    console.log(chalk_1.default.gray(`Found ${files.length} file(s)\n`));
    // Analyze each file
    const engine = new core_1.GreenLintEngine();
    let totalIssues = 0;
    const allResults = [];
    for (const file of files) {
        const sourceCode = (0, fs_1.readFileSync)(file, 'utf-8');
        const issues = await engine.analyzeFile(file, sourceCode);
        totalIssues += issues.length;
        if (issues.length > 0) {
            allResults.push({ file, issues });
            if (!options.json) {
                console.log(chalk_1.default.bold.underline(file));
                for (const issue of issues) {
                    const severityIcon = issue.severity === 'error' ? '❌' :
                        issue.severity === 'warning' ? '⚠️' : 'ℹ️';
                    const severityColor = issue.severity === 'error' ? chalk_1.default.red :
                        issue.severity === 'warning' ? chalk_1.default.yellow : chalk_1.default.blue;
                    console.log(`  ${severityIcon} ${severityColor(issue.message)}`);
                    console.log(chalk_1.default.gray(`     Line ${issue.location.startLine}:${issue.location.startColumn}`));
                    console.log(chalk_1.default.gray(`     Energy Impact: ${issue.energyImpact.level} - ${issue.energyImpact.metric}`));
                    if (issue.fixes.length > 0) {
                        console.log(chalk_1.default.green(`     💡 ${issue.fixes.length} fix(es) available`));
                    }
                    console.log();
                }
            }
        }
    }
    // Summary
    if (options.json) {
        console.log(JSON.stringify(allResults, null, 2));
    }
    else {
        console.log(chalk_1.default.bold('\n📊 Summary:'));
        console.log(`   Files analyzed: ${files.length}`);
        console.log(`   Issues found: ${totalIssues}`);
        if (totalIssues > 0) {
            console.log(chalk_1.default.yellow(`\n   Run ${chalk_1.default.bold('green-lint fix')} to automatically fix issues`));
        }
        else {
            console.log(chalk_1.default.green('\n   ✨ No issues found! Your code is energy-efficient.'));
        }
    }
});
/**
 * Fix command
 */
program
    .command('fix')
    .description('Automatically fix green software issues')
    .argument('<pattern>', 'File pattern to fix (e.g., "src/**/*.html")')
    .option('--dry-run', 'Show what would be fixed without making changes')
    .action(async (pattern, options) => {
    console.log(chalk_1.default.blue('🌱 Green Lint - Fixing issues...\n'));
    const files = await (0, glob_1.glob)(pattern);
    if (files.length === 0) {
        console.log(chalk_1.default.yellow('No files found matching pattern:', pattern));
        return;
    }
    const engine = new core_1.GreenLintEngine();
    let totalFixed = 0;
    for (const file of files) {
        const sourceCode = (0, fs_1.readFileSync)(file, 'utf-8');
        const issues = await engine.analyzeFile(file, sourceCode);
        if (issues.length > 0) {
            const fixedCode = engine.applyFixes(sourceCode, issues);
            if (!options.dryRun) {
                (0, fs_1.writeFileSync)(file, fixedCode, 'utf-8');
            }
            totalFixed += issues.length;
            console.log(chalk_1.default.green(`✓ Fixed ${issues.length} issue(s) in ${file}`));
        }
    }
    console.log(chalk_1.default.bold(`\n📊 Summary:`));
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Issues fixed: ${totalFixed}`);
    if (options.dryRun) {
        console.log(chalk_1.default.yellow('\n   (Dry run - no files were modified)'));
    }
});
program.parse();
//# sourceMappingURL=cli.js.map