#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { GreenLintEngine } from '@green-lint/core';

const program = new Command();

const SUPPORTED_EXTENSIONS = ['.html', '.jsx', '.tsx'];

function isSupportedFile(file: string): boolean {
  return SUPPORTED_EXTENSIONS.some(ext => file.endsWith(ext));
}

/**
 * Print a box drawn to fit the given line(s), using a chalk color function.
 */
function printBox(lines: string | string[], color: (s: string) => string = chalk.blue): void {
  const allLines = Array.isArray(lines) ? lines : [lines];
  const width = Math.max(...allLines.map(line => line.length));
  console.log(color(`┌${'─'.repeat(width + 2)}┐`));
  for (const line of allLines) {
    console.log(color(`│ ${line.padEnd(width)} │`));
  }
  console.log(color(`└${'─'.repeat(width + 2)}┘`));
}

/**
 * The literal (non-glob) directory prefix of a pattern, e.g.
 * "src/**\/*.html" -> "src"
 */
function literalBasePath(pattern: string): string {
  const magicIndex = pattern.search(/[*?{}[\]!]/);
  const prefix = magicIndex === -1 ? pattern : pattern.slice(0, magicIndex);
  const lastSlash = prefix.lastIndexOf('/');
  return lastSlash === -1 ? '.' : prefix.slice(0, lastSlash);
}

/**
 * Report why a pattern matched no files, distinguishing a missing path
 * from a path that exists but contains no matching files.
 */
function reportNoFiles(pattern: string): void {
  const basePath = literalBasePath(pattern);

  if (!existsSync(basePath)) {
    printBox(`No such file or directory: ${basePath}`, chalk.red);
  } else {
    printBox(`No html, jsx or tsx files found at this path: ${pattern}`, chalk.yellow);
  }
}

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
  .action(async (pattern: string, options: { json?: boolean }) => {
    printBox('🌱 Green Lint - Analyzing files...');
    console.log();

    // Find files
    const files = (await glob(pattern, { nodir: true })).filter(isSupportedFile);

    if (files.length === 0) {
      reportNoFiles(pattern);
      return;
    }

    console.log(chalk.gray(`Found ${files.length} file(s)\n`));
    
    // Analyze each file
    const engine = new GreenLintEngine();
    let totalIssues = 0;
    const allResults: any[] = [];
    
    for (const file of files) {
      const sourceCode = readFileSync(file, 'utf-8');
      const issues = await engine.analyzeFile(file, sourceCode);
      
      totalIssues += issues.length;
      
      if (issues.length > 0) {
        allResults.push({ file, issues });
        
        if (!options.json) {
          console.log(chalk.bold.underline(file));
          
          for (const issue of issues) {
            const severityIcon = issue.severity === 'error' ? '❌' : 
                                 issue.severity === 'warning' ? '⚠️' : 'ℹ️';
            const severityColor = issue.severity === 'error' ? chalk.red : 
                                  issue.severity === 'warning' ? chalk.yellow : chalk.blue;
            
            console.log(`  ${severityIcon} ${severityColor(issue.message)}`);
            console.log(chalk.gray(`     Line ${issue.location.startLine}:${issue.location.startColumn}`));
            console.log(chalk.gray(`     Energy Impact: ${issue.energyImpact.level} - ${issue.energyImpact.metric}`));
            
            if (issue.fixes.length > 0) {
              console.log(chalk.green(`     💡 ${issue.fixes.length} fix(es) available`));
            }
            
            console.log();
          }
        }
      }
    }
    
    // Summary
    if (options.json) {
      console.log(JSON.stringify(allResults, null, 2));
    } else {
      const summaryLines = [
        'Summary',
        `Files analyzed: ${files.length}`,
        `Issues found: ${totalIssues}`,
        totalIssues > 0
          ? `Run 'green-lint fix' to automatically fix issues`
          : 'No issues found! Your code is energy-efficient.',
      ];

      console.log();
      printBox(summaryLines, totalIssues > 0 ? chalk.yellow : chalk.green);
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
  .action(async (pattern: string, options: { dryRun?: boolean }) => {
    printBox('🌱 Green Lint - Fixing issues...');
    console.log();

    const files = (await glob(pattern, { nodir: true })).filter(isSupportedFile);

    if (files.length === 0) {
      reportNoFiles(pattern);
      return;
    }

    const engine = new GreenLintEngine();
    let totalFixed = 0;
    
    for (const file of files) {
      const sourceCode = readFileSync(file, 'utf-8');
      const issues = await engine.analyzeFile(file, sourceCode);
      
      if (issues.length > 0) {
        const fixedCode = await engine.applyFixes(file, sourceCode, issues);
        
        if (!options.dryRun) {
          writeFileSync(file, fixedCode, 'utf-8');
        }
        
        totalFixed += issues.length;
        
        console.log(chalk.green(`✓ Fixed ${issues.length} issue(s) in ${file}`));
      }
    }
    
    const summaryLines = [
      'Summary',
      `Files processed: ${files.length}`,
      `Issues fixed: ${totalFixed}`,
    ];
    if (options.dryRun) {
      summaryLines.push('(Dry run - no files were modified)');
    }

    console.log();
    printBox(summaryLines, options.dryRun ? chalk.yellow : chalk.green);
  });

program.parse();