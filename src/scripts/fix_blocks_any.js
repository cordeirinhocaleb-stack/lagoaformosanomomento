/**
 * Script to batch-fix 'any' usages in Editor/Blocks components
 * This script applies common type fixes for block-related code
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOCKS_DIR = path.join(__dirname, '..', 'components', 'admin', 'editor', 'blocks');

const fixes = [
    // Fix 1: Replace (block.content as any) with proper type assertion
    {
        pattern: /\(block\.content as any\)/g,
        replacement: '(block.content as unknown)',
        description: 'Block content type assertion'
    },
    // Fix 2: Replace (block.settings as any) with BlockSettings
    {
        pattern: /\(block\.settings as any\)/g,
        replacement: '(block.settings as Record<string, unknown>)',
        description: 'Block settings type assertion'
    },
    // Fix 3: Replace (block as any).settings with optional chaining
    {
        pattern: /\(block as any\)\.settings/g,
        replacement: '(block.settings as Record<string, unknown>)',
        description: 'Block settings access'
    },
    // Fix 4: Replace Record<string, any> with Record<string, unknown>
    {
        pattern: /Record<string,\s*any>/g,
        replacement: 'Record<string, unknown>',
        description: 'Record type'
    },
    // Fix 5: Replace const x: any = with const x: Record<string, unknown> =
    {
        pattern: /const\s+(\w+):\s*any\s*=/g,
        replacement: 'const $1: Record<string, unknown> =',
        description: 'Variable declarations'
    },
    // Fix 6: Replace perStyle: { ... } as any with proper type
    {
        pattern: /perStyle:\s*\{([^}]+)\}\s*as\s*any/g,
        replacement: 'perStyle: {$1} as Record<string, unknown>',
        description: 'perStyle type assertion'
    },
    // Fix 7: Replace ...(val as any) with ...(val as Record<string, unknown>)
    {
        pattern: /\.\.\.\((\w+)\s+as\s+any\)/g,
        replacement: '...($1 as Record<string, unknown>)',
        description: 'Spread operator type assertion'
    }
];

function applyFixes(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let changesCount = 0;

    fixes.forEach(fix => {
        const matches = content.match(fix.pattern);
        if (matches) {
            content = content.replace(fix.pattern, fix.replacement);
            modified = true;
            changesCount += matches.length;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✅ Fixed ${changesCount} issues in: ${path.relative(BLOCKS_DIR, filePath)}`);
        return changesCount;
    }

    return 0;
}

function processDirectory(dir) {
    let totalFixes = 0;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            totalFixes += processDirectory(filePath);
        } else if (/\.(ts|tsx)$/.test(file)) {
            totalFixes += applyFixes(filePath);
        }
    });

    return totalFixes;
}

console.log('🚀 Starting batch fix for Editor/Blocks components...\n');
const totalFixes = processDirectory(BLOCKS_DIR);
console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('📊 Run audit script to verify results.');
