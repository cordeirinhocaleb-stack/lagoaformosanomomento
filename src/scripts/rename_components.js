/**
 * Phase 3: Automated Component Renaming Script
 * Renames components to follow semantic naming standards and updates all imports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const ADMIN_DIR = path.join(PROJECT_ROOT, 'src', 'components', 'admin');

// Mapping of old names to new names
const RENAMES = {
    // Advertisers
    'advertisers/config/banners/WysiwygField.tsx': 'advertisers/config/banners/WysiwygEditor.tsx',
    'advertisers/config/ConfigTabs.tsx': 'advertisers/config/AdvertiserConfigTabs.tsx',
    'advertisers/config/shared/SaveBar.tsx': 'advertisers/config/shared/FormSaveToolbar.tsx',
    'advertisers/editor/components/UserLinker.tsx': 'advertisers/editor/components/UserLinkSelector.tsx',
    'advertisers/editor/EditorTabs.tsx': 'advertisers/editor/AdvertiserEditorTabs.tsx',
    'advertisers/list/AdvertisersListToolbar.tsx': 'advertisers/list/AdvertisersToolbar.tsx',
    'advertisers/list/EmptyState.tsx': 'advertisers/list/AdvertisersEmptyState.tsx',

    // Editor/Banner
    'editor/banner/CloudinaryVideoUploader.tsx': 'editor/banner/CloudinaryVideoUploadPanel.tsx',
    'editor/banner/YouTubeVideoUploader.tsx': 'editor/banner/YouTubeVideoUploadPanel.tsx',
    'editor/banner/EditorBannerNew.tsx': 'editor/banner/BannerEditorPanel.tsx',
    'editor/banner/components/ImageGallery.tsx': 'editor/banner/components/BannerImageGallery.tsx',
    'editor/banner/components/LayoutSelector.tsx': 'editor/banner/components/BannerLayoutSelector.tsx',
    'editor/banner/components/MediaTypeSelector.tsx': 'editor/banner/components/BannerMediaTypeSelector.tsx',
    'editor/banner/components/VideoTrimSelector.tsx': 'editor/banner/components/BannerVideoTrimSelector.tsx',
    'editor/banner/banner-components/YouTubeUploadStatus.tsx': 'editor/banner/banner-components/YouTubeUploadStatusPanel.tsx',

    // Editor/Blocks
    'editor/blocks/SmartBlockRenderer.tsx': 'editor/blocks/BlockRenderer.tsx',
    'editor/blocks/components/MediaBlockOverlays.tsx': 'editor/blocks/components/MediaBlockOverlaysPanel.tsx',
    'editor/blocks/media/EffectControl.tsx': 'editor/blocks/media/VideoEffectControl.tsx',
    'editor/blocks/text-block-components/MobileFormattingToolbar.tsx': 'editor/blocks/text-block-components/TextFormattingToolbar.tsx',
    'editor/blocks/text-block-components/TextBlockStyles.tsx': 'editor/blocks/text-block-components/TextBlockStylesPanel.tsx',
    'editor/blocks/textblock/MobileToolBtn.tsx': 'editor/blocks/textblock/FormattingToolButton.tsx',

    // Editor/Engagement
    'editor/engagement/ContentEditors.tsx': 'editor/engagement/EngagementContentEditors.tsx',
    'editor/engagement/PollQuizEditors.tsx': 'editor/engagement/PollQuizEditorPanel.tsx',
    'editor/engagement/QuickUploader.tsx': 'editor/engagement/QuickMediaUploader.tsx',
    'editor/engagement/VisualEditors.tsx': 'editor/engagement/EngagementVisualEditors.tsx',

    // Editor/Layout
    'editor/layout/EditorContent.tsx': 'editor/layout/NewsEditorContent.tsx',
    'editor/layout/EditorCover.tsx': 'editor/layout/NewsEditorCover.tsx',
    'editor/layout/EditorMobileDock.tsx': 'editor/layout/NewsEditorMobileDock.tsx',

    // Editor/Other
    'editor/CelebrationBlocks.tsx': 'editor/CelebrationBlocksPanel.tsx',
    'editor/EditorCanvas.tsx': 'editor/NewsEditorCanvas.tsx',
    'editor/EditorMeta.tsx': 'editor/NewsEditorMetaPanel.tsx',
    'editor/gallery/GalleryGridControls.tsx': 'editor/gallery/GalleryGridControlsPanel.tsx',
    'editor/media/VideoSourcePicker.tsx': 'editor/media/VideoSourcePickerPanel.tsx',

    // Inspector
    'inspector/BlockSpecificControls.tsx': 'inspector/BlockSpecificControlsPanel.tsx',

    // Jobs
    'jobs/JobFilterBar.tsx': 'jobs/JobFilterToolbar.tsx',

    // Settings
    'settings/FeatureSettings.tsx': 'settings/FeatureSettingsPanel.tsx',
    'settings/FooterSettings.tsx': 'settings/FooterSettingsPanel.tsx',
    'settings/IntegrationSettings.tsx': 'settings/IntegrationSettingsPanel.tsx',

    // Users
    'users/UserFilterBar.tsx': 'users/UserFilterToolbar.tsx',
    'users/UserFilters.tsx': 'users/UserFiltersPanel.tsx',
    'users/panels/pos/MarketShelf.tsx': 'users/panels/pos/POSMarketShelf.tsx',
    'users/panels/pos/POSCart.tsx': 'users/panels/pos/POSCartPanel.tsx',
    'users/panels/pos/POSModals.tsx': 'users/panels/pos/POSModalsPanel.tsx',
    'users/panels/subscription/CreditItemControl.tsx': 'users/panels/subscription/CreditItemControlPanel.tsx',

    // Advertisers/Popup
    'advertisers/popup/PreviewStage.tsx': 'advertisers/popup/PopupPreviewStage.tsx',
    'advertisers/popupBuilder/LivePreviewStage.tsx': 'advertisers/popupBuilder/PopupLivePreviewStage.tsx',
    'advertisers/popupBuilder/PopupSetBuilder.tsx': 'advertisers/popupBuilder/PopupSetBuilderPanel.tsx',
    'advertisers/popupBuilder/ThemeSelectorByFilter.tsx': 'advertisers/popupBuilder/PopupThemeSelectorByFilter.tsx'
};

// Component name mapping (for updating imports)
const COMPONENT_RENAMES = {};
Object.keys(RENAMES).forEach(oldPath => {
    const oldName = path.basename(oldPath, '.tsx');
    const newName = path.basename(RENAMES[oldPath], '.tsx');
    COMPONENT_RENAMES[oldName] = newName;
});

console.log('🚀 Phase 3: Semantic Component Renaming\n');
console.log(`📋 Total files to rename: ${Object.keys(RENAMES).length}\n`);

// Step 1: Rename files
console.log('Step 1: Renaming files...\n');
let renamedCount = 0;

Object.keys(RENAMES).forEach(oldRelPath => {
    const oldPath = path.join(ADMIN_DIR, oldRelPath);
    const newPath = path.join(ADMIN_DIR, RENAMES[oldRelPath]);

    if (fs.existsSync(oldPath)) {
        // Ensure target directory exists
        const newDir = path.dirname(newPath);
        if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir, { recursive: true });
        }

        fs.renameSync(oldPath, newPath);
        console.log(`✅ ${oldRelPath} → ${RENAMES[oldRelPath]}`);
        renamedCount++;
    } else {
        console.log(`⚠️  File not found: ${oldRelPath}`);
    }
});

console.log(`\n✅ Renamed ${renamedCount} files\n`);

// Step 2: Update imports across the entire src directory
console.log('Step 2: Updating imports...\n');

function updateImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let changesCount = 0;

    // Update imports for renamed files
    Object.keys(RENAMES).forEach(oldRelPath => {
        const oldName = path.basename(oldRelPath, '.tsx');
        const newRelPath = RENAMES[oldRelPath];
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
console.log('🎉 Phase 3 Complete! Run audit to verify.');
console.log('\n⚠️  IMPORTANT: Test the application thoroughly before committing!');
