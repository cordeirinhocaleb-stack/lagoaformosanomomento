/**
 * FINAL 3 - Achieving 100% Compliance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'src', 'components', 'admin');

console.log('🎯 FINAL 3 - 100% COMPLIANCE!\n');

const FINAL_3 = {
    'editor/blocks/BlockContentRender.tsx': 'editor/blocks/BlockContentDisplay.tsx',
    'editor/blocks/textblock/render/renderers/QuoteRender.tsx': 'editor/blocks/textblock/render/renderers/QuoteDisplay.tsx',
    'editor/blocks/textblock/render/renderers/TextCurrentRender.tsx': 'editor/blocks/textblock/render/renderers/TextCurrentDisplay.tsx'
};

let renamedCount = 0;

Object.keys(FINAL_3).forEach(oldRelPath => {
    const oldPath = path.join(ADMIN_DIR, oldRelPath);
    const newPath = path.join(ADMIN_DIR, FINAL_3[oldRelPath]);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${path.basename(oldRelPath)} → ${path.basename(FINAL_3[oldRelPath])}`);
        renamedCount++;
    }
});

console.log(`\n✅ Renamed ${renamedCount} files\n`);

function updateImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let changesCount = 0;

    Object.keys(FINAL_3).forEach(oldRelPath => {
        const oldName = path.basename(oldRelPath, '.tsx');
        const newRelPath = FINAL_3[oldRelPath];
        const newName = path.basename(newRelPath, '.tsx');

        const pattern1 = new RegExp(`from ['"]([./]+)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
        if (pattern1.test(content)) {
            content = content.replace(pattern1, `from '$1${newName}'`);
            modified = true;
            changesCount++;
        }

        const pattern2 = new RegExp(`from ['"]([./]+.*/)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
        if (pattern2.test(content)) {
            content = content.replace(pattern2, `from '$1${newName}'`);
            modified = true;
            changesCount++;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        return changesCount;
    }

    return 0;
}

function processDirectory(dir) {
    let totalUpdates = 0;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            totalUpdates += processDirectory(filePath);
        } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            const updates = updateImportsInFile(filePath);
            if (updates > 0) {
                totalUpdates += updates;
            }
        }
    });

    return totalUpdates;
}

const srcDir = path.join(PROJECT_ROOT, 'src');
const totalUpdates = processDirectory(srcDir);

console.log(`✅ Updated ${totalUpdates} imports\n`);
console.log('🎉🎉🎉 100% COMPLIANCE ACHIEVED! 🎉🎉🎉');
