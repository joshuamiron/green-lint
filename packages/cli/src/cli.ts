#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { GreenLintEngine } from '@green-lint/core';

const program = new Command();

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
    console.log(chalk.blue('🌱 Green Lint - Analyzing files...\n'));
    
    // Find files
    const files = await glob(pattern);
    
    if (files.length === 0) {
      console.log(chalk.yellow('No files found matching pattern:', pattern));
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
      console.log(chalk.bold('\n📊 Summary:'));
      console.log(`   Files analyzed: ${files.length}`);
      console.log(`   Issues found: ${totalIssues}`);
      
      if (totalIssues > 0) {
        console.log(chalk.yellow(`\n   Run ${chalk.bold('green-lint fix')} to automatically fix issues`));
      } else {
        console.log(chalk.green('\n   ✨ No issues found! Your code is energy-efficient.'));
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
  .action(async (pattern: string, options: { dryRun?: boolean }) => {
    console.log(chalk.blue('🌱 Green Lint - Fixing issues...\n'));
    
    const files = await glob(pattern);
    
    if (files.length === 0) {
      console.log(chalk.yellow('No files found matching pattern:', pattern));
      return;
    }
    
    const engine = new GreenLintEngine();
    let totalFixed = 0;
    
    for (const file of files) {
      const sourceCode = readFileSync(file, 'utf-8');
      const issues = await engine.analyzeFile(file, sourceCode);
      
      if (issues.length > 0) {
        const fixedCode = engine.applyFixes(sourceCode, issues);
        
        if (!options.dryRun) {
          writeFileSync(file, fixedCode, 'utf-8');
        }
        
        totalFixed += issues.length;
        
        console.log(chalk.green(`✓ Fixed ${issues.length} issue(s) in ${file}`));
      }
    }
    
    console.log(chalk.bold(`\n📊 Summary:`));
    console.log(`   Files processed: ${files.length}`);
    console.log(`   Issues fixed: ${totalFixed}`);
    
    if (options.dryRun) {
      console.log(chalk.yellow('\n   (Dry run - no files were modified)'));
    }
  });

program.parse();