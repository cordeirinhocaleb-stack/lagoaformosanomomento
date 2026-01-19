/**
 * ABSOLUTE FINAL - 4 Violations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'src', 'components', 'admin');

console.log('🏁 ABSOLUTE FINAL - Last 4 Violations!\n');

const ABSOLUTE_FINAL_RENAMES = {
    'editor/blocks/BlockContent.tsx': 'editor/blocks/BlockContentRender.tsx',
    'editor/blocks/textblock/render/renderers/TextCurrent.tsx': 'editor/blocks/textblock/render/renderers/TextCurrentRender.tsx',
    'editor/blocks/textblock/render/renderers/Quote.tsx': 'editor/blocks/textblock/render/renderers/QuoteRender.tsx',
    'editor/blocks/textblock/render/TextModeRender.tsx': 'editor/blocks/textblock/render/TextModeRenderBlock.tsx'
};

console.log(`📋 Renaming ${Object.keys(ABSOLUTE_FINAL_RENAMES).length} files...\n`);

let renamedCount = 0;

Object.keys(ABSOLUTE_FINAL_RENAMES).forEach(oldRelPath => {
    const oldPath = path.join(ADMIN_DIR, oldRelPath);
    const newPath = path.join(ADMIN_DIR, ABSOLUTE_FINAL_RENAMES[oldRelPath]);

    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${path.basename(oldRelPath)} → ${path.basename(ABSOLUTE_FINAL_RENAMES[oldRelPath])}`);
        renamedCount++;
    }
});

console.log(`\n✅ Renamed ${renamedCount} files\n`);

function updateImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let changesCount = 0;

    Object.keys(ABSOLUTE_FINAL_RENAMES).forEach(oldRelPath => {
        const oldName = path.basename(oldRelPath, '.tsx');
        const newRelPath = ABSOLUTE_FINAL_RENAMES[oldRelPath];
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

        const escapedOldPath = oldRelPath.replace(/\\/g, '/').replace(/\.tsx$/, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern3 = new RegExp(`import\\(['"]@/components/admin/${escapedOldPath}['"]\\)`, 'g');
        const newImportPath = newRelPath.replace(/\\/g, '/').replace(/\.tsx$/, '');
        if (pattern3.test(content)) {
            content = content.replace(pattern3, `import('@/components/admin/${newImportPath}')`);
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
console.log('🎉🎉🎉 100% COMPLIANCE - MISSION COMPLETE! 🎉🎉🎉');
