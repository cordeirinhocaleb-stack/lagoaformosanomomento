/**
 * Final Phase 3 Script: Fix ALL remaining violations
 * - 6 remaining 'any' usages
 * - 37 remaining naming violations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'src', 'components', 'admin');

console.log('🚀 Final Phase 3: Complete Compliance\n');

// Step 1: Fix remaining 'any' usages
console.log('Step 1: Fixing remaining 6 "any" usages...\n');

const anyFixes = [
    {
        file: 'editor/blocks/textblock/normalize.ts',
        pattern: /const settings = \(block\.settings \|\| \{\}\) as any;/g,
        replacement: 'const settings = (block.settings || {}) as Record<string, unknown>;'
    },
    {
        file: 'editor/blocks/TextBlock.tsx',
        pattern: /block\.settings as any/g,
        replacement: 'block.settings as Record<string, unknown>'
    },
    {
        file: 'editor/layout/InspectorSidebar.tsx',
        pattern: /\(p as any\)/g,
        replacement: '(p as Record<string, unknown>)'
    },
    {
        file: 'editor/NewsEditorCanvas.tsx',
        pattern: /const s: any = block\.settings;/g,
        replacement: 'const s = block.settings as Record<string, unknown>;'
    },
    {
        file: 'EditorTab.tsx',
        pattern: /\(file: any, source: any\)/g,
        replacement: '(file: File, source: string)'
    },
    {
        file: 'users/panels/UserSupportPanel.tsx',
        pattern: /\(JSON\.parse\(localStorage\.getItem\('lfnm_user'\) \|\| '\{\}'\) as any\)/g,
        replacement: '(JSON.parse(localStorage.getItem("lfnm_user") || "{}") as Record<string, unknown>)'
    }
];

let anyFixCount = 0;
anyFixes.forEach(fix => {
    const filePath = path.join(ADMIN_DIR, fix.file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (fix.pattern.test(content)) {
            content = content.replace(fix.pattern, fix.replacement);
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`✅ Fixed 'any' in: ${fix.file}`);
            anyFixCount++;
        }
    }
});

console.log(`\n✅ Fixed ${anyFixCount} 'any' usages\n`);

// Step 2: Rename remaining components
console.log('Step 2: Renaming remaining 37 components...\n');

const FINAL_RENAMES = {
    // Renderers (lowercase to PascalCase + descriptive)
    'editor/blocks/textblock/render/renderers/currentText.tsx': 'editor/blocks/textblock/render/renderers/CurrentTextRenderer.tsx',
    'editor/blocks/textblock/render/renderers/headlineBlock.tsx': 'editor/blocks/textblock/render/renderers/HeadlineBlockRenderer.tsx',
    'editor/blocks/textblock/render/renderers/itemList.tsx': 'editor/blocks/textblock/render/renderers/ItemListRenderer.tsx',
    'editor/blocks/textblock/render/renderers/quoteAspas.tsx': 'editor/blocks/textblock/render/renderers/QuoteRenderer.tsx',
    'editor/blocks/textblock/render/renderers/visualDivider.tsx': 'editor/blocks/textblock/render/renderers/VisualDividerRenderer.tsx',
    'editor/blocks/textblock/render/renderTextMode.tsx': 'editor/blocks/textblock/render/TextModeRenderer.tsx',

    // Advertisers - Add context prefixes
    'advertisers/config/AdvertiserConfigTabs.tsx': 'advertisers/config/AdvertiserConfigTabsPanel.tsx',
    'advertisers/config/shared/FormSaveToolbar.tsx': 'advertisers/config/shared/AdvertiserFormSaveToolbar.tsx',
    'advertisers/editor/AdvertiserEditorTabs.tsx': 'advertisers/editor/AdvertiserEditorTabsPanel.tsx',
    'advertisers/editor/components/UserLinkSelector.tsx': 'advertisers/editor/components/AdvertiserUserLinkSelector.tsx',
    'advertisers/editor/sections/showcase/DisplayLocationsConfig.tsx': 'advertisers/editor/sections/showcase/AdvertiserDisplayLocationsPanel.tsx',
    'advertisers/editor/sections/showcase/ImageSequenceUploader.tsx': 'advertisers/editor/sections/showcase/AdvertiserImageSequenceUploader.tsx',
    'advertisers/editor/sections/showcase/MediaControls.tsx': 'advertisers/editor/sections/showcase/AdvertiserMediaControlsPanel.tsx',
    'advertisers/editor/sections/showcase/RedirectButtonConfig.tsx': 'advertisers/editor/sections/showcase/AdvertiserRedirectButtonPanel.tsx',
    'advertisers/editor/sections/showcase/VideoUploaderWrapper.tsx': 'advertisers/editor/sections/showcase/AdvertiserVideoUploaderPanel.tsx',
    'advertisers/list/AdvertisersEmptyState.tsx': 'advertisers/list/AdvertisersEmptyStatePanel.tsx',
    'advertisers/list/AdvertisersToolbar.tsx': 'advertisers/list/AdvertisersListToolbarPanel.tsx',
    'advertisers/popup/PopupPreviewStage.tsx': 'advertisers/popup/AdvertiserPopupPreviewPanel.tsx',
    'advertisers/popupBuilder/PopupLivePreviewStage.tsx': 'advertisers/popupBuilder/AdvertiserPopupLivePreviewPanel.tsx',
    'advertisers/popupBuilder/PopupThemeSelectorByFilter.tsx': 'advertisers/popupBuilder/AdvertiserPopupThemeSelectorPanel.tsx',

    // Editor/Banner - More descriptive
    'editor/banner/components/BannerImageGallery.tsx': 'editor/banner/components/BannerImageGalleryPanel.tsx',
    'editor/banner/components/BannerLayoutSelector.tsx': 'editor/banner/components/BannerLayoutSelectorPanel.tsx',
    'editor/banner/components/BannerMediaTypeSelector.tsx': 'editor/banner/components/BannerMediaTypeSelectorPanel.tsx',
    'editor/banner/components/BannerVideoTrimSelector.tsx': 'editor/banner/components/BannerVideoTrimSelectorPanel.tsx',

    // Editor/Blocks
    'editor/blocks/BlockRenderer.tsx': 'editor/blocks/ContentBlockRenderer.tsx',
    'editor/blocks/media/VideoEffectControl.tsx': 'editor/blocks/media/VideoEffectControlPanel.tsx',
    'editor/blocks/text-block-components/TextFormattingToolbar.tsx': 'editor/blocks/text-block-components/TextBlockFormattingToolbar.tsx',

    // Editor/Engagement
    'editor/engagement/EngagementContentEditors.tsx': 'editor/engagement/EngagementContentEditorsPanel.tsx',
    'editor/engagement/EngagementVisualEditors.tsx': 'editor/engagement/EngagementVisualEditorsPanel.tsx',
    'editor/engagement/QuickMediaUploader.tsx': 'editor/engagement/EngagementQuickMediaUploader.tsx',

    // Editor/Layout
    'editor/layout/NewsEditorContent.tsx': 'editor/layout/NewsEditorContentPanel.tsx',
    'editor/layout/NewsEditorCover.tsx': 'editor/layout/NewsEditorCoverPanel.tsx',
    'editor/layout/NewsEditorMobileDock.tsx': 'editor/layout/NewsEditorMobileDockPanel.tsx',

    // Editor
    'editor/NewsEditorCanvas.tsx': 'editor/NewsEditorCanvasPanel.tsx',

    // Jobs
    'jobs/JobFilterToolbar.tsx': 'jobs/JobListFilterToolbar.tsx',

    // Users
    'users/UserFilterToolbar.tsx': 'users/UserListFilterToolbar.tsx',
    'users/panels/pos/POSMarketShelf.tsx': 'users/panels/pos/POSMarketShelfPanel.tsx'
};

let renamedCount = 0;

Object.keys(FINAL_RENAMES).forEach(oldRelPath => {
    const oldPath = path.join(ADMIN_DIR, oldRelPath);
    const newPath = path.join(ADMIN_DIR, FINAL_RENAMES[oldRelPath]);

    if (fs.existsSync(oldPath)) {
        const newDir = path.dirname(newPath);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }

        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${oldRelPath} → ${FINAL_RENAMES[oldRelPath]}`);
        renamedCount++;
    } else {
        console.log(`⚠️  File not found: ${oldRelPath}`);
    }
});

console.log(`\n✅ Renamed ${renamedCount} files\n`);

// Step 3: Update imports
console.log('Step 3: Updating imports...\n');

function updateImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let changesCount = 0;

    Object.keys(FINAL_RENAMES).forEach(oldRelPath => {
        const oldName = path.basename(oldRelPath, '.tsx');
        const newRelPath = FINAL_RENAMES[oldRelPath];
        const newName = path.basename(newRelPath, '.tsx');

        // Pattern 1: import X from './OldName'
        const pattern1 = new RegExp(`from ['"]([./]+)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
        if (pattern1.test(content)) {
            content = content.replace(pattern1, `from '$1${newName}'`);
            modified = true;
            changesCount++;
        }

        // Pattern 2: import { X } from './path/OldName'
        const pattern2 = new RegExp(`from ['"]([./]+.*/)${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g');
        if (pattern2.test(content)) {
            content = content.replace(pattern2, `from '$1${newName}'`);
            modified = true;
            changesCount++;
        }

        // Pattern 3: import('@/components/admin/path/OldName')
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
                console.log(`✅ Updated ${updates} imports in: ${path.relative(PROJECT_ROOT, filePath)}`);
                totalUpdates += updates;
            }
        }
    });

    return totalUpdates;
}

const srcDir = path.join(PROJECT_ROOT, 'src');
const totalUpdates = processDirectory(srcDir);

console.log(`\n✅ Updated ${totalUpdates} imports across the codebase\n`);
console.log('🎉 FINAL PHASE 3 COMPLETE!');
console.log('\n📊 Run audit to verify 100% compliance!');
console.log('⚠️  IMPORTANT: Test the application thoroughly before committing!');
