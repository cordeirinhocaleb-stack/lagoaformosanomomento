/**
 * Script to batch-fix 'any' usages in Users/Subscription components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_DIR = path.join(__dirname, '..', 'components', 'admin', 'users');

const fixes = [
    // Fix 1: Replace (error as any).message with proper error handling
    {
        pattern: /\(error as any\)\.message/g,
        replacement: '(error instanceof Error ? error.message : String(error))',
        description: 'Error message access'
    },
    // Fix 2: Replace (err as any) in catch blocks with (err: unknown)
    {
        pattern: /catch\s*\(\s*err:\s*any\s*\)/g,
        replacement: 'catch (err: unknown)',
        description: 'Catch block error type'
    },
    // Fix 3: Replace (error: any) in catch blocks with (error: unknown)
    {
        pattern: /catch\s*\(\s*error:\s*any\s*\)/g,
        replacement: 'catch (error: unknown)',
        description: 'Catch block error type'
    },
    // Fix 4: Replace (lfnmCoin as any).src with proper type
    {
        pattern: /\(lfnmCoin as any\)\.src/g,
        replacement: '(typeof lfnmCoin === "object" && lfnmCoin !== null && "src" in lfnmCoin ? lfnmCoin.src : lfnmCoin)',
        description: 'lfnmCoin image src access'
    },
    // Fix 5: Replace (p: any) => with proper type
    {
        pattern: /\(p:\s*any\)\s*=>/g,
        replacement: '(p: { id: string; name?: string }) =>',
        description: 'Plan object type'
    },
    // Fix 6: Replace (ad: any) => with proper type
    {
        pattern: /\(ad:\s*any\)\s*=>/g,
        replacement: '(ad: Record<string, unknown>) =>',
        description: 'Ad object type'
    },
    // Fix 7: Replace let/const x: any = with Record<string, unknown>
    {
        pattern: /(let|const)\s+(\w+):\s*any\s*=/g,
        replacement: '$1 $2: Record<string, unknown> =',
        description: 'Variable declarations'
    },
    // Fix 8: Replace const x: any[] = with unknown[]
    {
        pattern: /const\s+(\w+):\s*any\[\]\s*=/g,
        replacement: 'const $1: unknown[] =',
        description: 'Array declarations'
    },
    // Fix 9: Replace (user.commercialData as any) with proper type
    {
        pattern: /\(user\.commercialData as any\)/g,
        replacement: '(user.commercialData as Record<string, unknown>)',
        description: 'User commercialData access'
    },
    // Fix 10: Replace (user as any) with proper type
    {
        pattern: /\(user as any\)/g,
        replacement: '(user as Record<string, unknown>)',
        description: 'User object type assertion'
    },
    // Fix 11: Replace (data as any[]) with unknown[]
    {
        pattern: /\(data as any\[\]\)/g,
        replacement: '(data as unknown[])',
        description: 'Data array type assertion'
    },
    // Fix 12: Replace (usage as any) with Record<string, unknown>
    {
        pattern: /\(usage as any\)/g,
        replacement: '(usage as Record<string, unknown>)',
        description: 'Usage object type assertion'
    },
    // Fix 13: Replace null as any with null
    {
        pattern: /null as any/g,
        replacement: 'null',
        description: 'Null type assertion'
    },
    // Fix 14: Replace onUpdateUser: (updates: any) with proper type
    {
        pattern: /onUpdateUser:\s*\(updates:\s*any\)\s*=>/g,
        replacement: 'onUpdateUser: (updates: Record<string, unknown>) =>',
        description: 'onUpdateUser callback type'
    },
    // Fix 15: Replace currentUsage: any with unknown
    {
        pattern: /currentUsage:\s*any/g,
        replacement: 'currentUsage: unknown',
        description: 'currentUsage prop type'
    },
    // Fix 16: Replace (selectedLogs: any[]) with unknown[]
    {
        pattern: /\(selectedLogs:\s*any\[\]\)/g,
        replacement: '(selectedLogs: unknown[])',
        description: 'selectedLogs parameter type'
    },
    // Fix 17: Replace (JSON.parse(...) as any) with unknown
    {
        pattern: /\(JSON\.parse\([^)]+\)\s*as\s*any\)/g,
        replacement: '(JSON.parse(localStorage.getItem("lfnm_user") || "{}") as Record<string, unknown>)',
        description: 'JSON.parse type assertion'
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
        console.log(`✅ Fixed ${changesCount} issues in: ${path.relative(USERS_DIR, filePath)}`);
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

console.log('🚀 Starting batch fix for Users/Subscription components...\n');
const totalFixes = processDirectory(USERS_DIR);
console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('📊 Run audit script to verify results.');
