/**
 * Final comprehensive script to fix ALL remaining 'any' usages in admin components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_DIR = path.join(__dirname, '..', 'components', 'admin');

const fixes = [
    // Fix 1: const s: any = settings; -> const s = settings as Record<string, unknown>;
    {
        pattern: /const\s+s:\s*any\s*=\s*settings;/g,
        replacement: 'const s = settings as Record<string, unknown>;',
        description: 'Settings variable'
    },
    // Fix 2: const activeTheme: any = -> const activeTheme =
    {
        pattern: /const\s+activeTheme:\s*any\s*=/g,
        replacement: 'const activeTheme =',
        description: 'Active theme variable'
    },
    // Fix 3: (block.settings as any) -> (block.settings as Record<string, unknown>)
    {
        pattern: /\(block\.settings as any\)/g,
        replacement: '(block.settings as Record<string, unknown>)',
        description: 'Block settings'
    },
    // Fix 4: (block?.settings as any) -> (block?.settings as Record<string, unknown>)
    {
        pattern: /\(block\?\.settings as any\)/g,
        replacement: '(block?.settings as Record<string, unknown>)',
        description: 'Optional block settings'
    },
    // Fix 5: (settings as any) -> (settings as Record<string, unknown>)
    {
        pattern: /\(settings as any\)/g,
        replacement: '(settings as Record<string, unknown>)',
        description: 'Settings type assertion'
    },
    // Fix 6: (p: any) => -> (p: Record<string, unknown>) =>
    {
        pattern: /\(p:\s*any\)\s*=>/g,
        replacement: '(p: Record<string, unknown>) =>',
        description: 'Parameter p type'
    },
    // Fix 7: (file: any) -> (file: File)
    {
        pattern: /\(file:\s*any\)/g,
        replacement: '(file: File)',
        description: 'File parameter type'
    },
    // Fix 8: (source: any) -> (source: string)
    {
        pattern: /\(source:\s*any\)/g,
        replacement: '(source: string)',
        description: 'Source parameter type'
    },
    // Fix 9: (newData: any) -> (newData: unknown)
    {
        pattern: /\(newData:\s*any\)/g,
        replacement: '(newData: unknown)',
        description: 'newData parameter type'
    },
    // Fix 10: } catch (error: any) { -> } catch (error: unknown) {
    {
        pattern: /catch\s*\(\s*error:\s*any\s*\)/g,
        replacement: 'catch (error: unknown)',
        description: 'Catch error type'
    },
    // Fix 11: (ad: any, idx) -> (ad: Record<string, unknown>, idx)
    {
        pattern: /\(ad:\s*any,\s*idx/g,
        replacement: '(ad: Record<string, unknown>, idx',
        description: 'Ad parameter type'
    },
    // Fix 12: newDate as any -> newDate
    {
        pattern: /newDate as any/g,
        replacement: 'newDate',
        description: 'newDate type assertion'
    },
    // Fix 13: (user.commercialData || {}) as any -> (user.commercialData || {}) as Record<string, unknown>
    {
        pattern: /\(user\.commercialData \|\| \{\}\) as any/g,
        replacement: '(user.commercialData || {}) as Record<string, unknown>',
        description: 'User commercialData'
    },
    // Fix 14: (JSON.parse(...) as any) -> (JSON.parse(...) as Record<string, unknown>)
    {
        pattern: /\(JSON\.parse\([^)]+\)\s*as\s*any\)/g,
        replacement: '(JSON.parse(localStorage.getItem("lfnm_user") || "{}") as Record<string, unknown>)',
        description: 'JSON.parse type'
    },
    // Fix 15: { ...meta, videoId: vid } as any -> { ...meta, videoId: vid } as Record<string, unknown>
    {
        pattern: /\{\s*\.\.\.meta,\s*videoId:\s*vid\s*\}\s*as\s*any/g,
        replacement: '{ ...meta, videoId: vid } as Record<string, unknown>',
        description: 'Meta object type'
    },
    // Fix 16: bannerEffects as any -> bannerEffects as unknown
    {
        pattern: /bannerEffects as any/g,
        replacement: 'bannerEffects as unknown',
        description: 'Banner effects type'
    },
    // Fix 17: setBannerYoutubeMetadata as any -> setBannerYoutubeMetadata
    {
        pattern: /setBannerYoutubeMetadata as any/g,
        replacement: 'setBannerYoutubeMetadata',
        description: 'setBannerYoutubeMetadata type'
    },
    // Fix 18: setBannerEffects as any -> setBannerEffects
    {
        pattern: /setBannerEffects as any/g,
        replacement: 'setBannerEffects',
        description: 'setBannerEffects type'
    },
    // Fix 19: (ctrl.bannerEffects as any) -> (ctrl.bannerEffects as unknown)
    {
        pattern: /\(ctrl\.bannerEffects as any\)/g,
        replacement: '(ctrl.bannerEffects as unknown)',
        description: 'ctrl.bannerEffects type'
    },
    // Fix 20: MobileToolBtn = ({ ... }: any) -> MobileToolBtn = ({ icon, label, action, val, activeColor, tooltip }: { icon: string; label: string; action: () => void; val?: string | boolean; activeColor?: string; tooltip?: string })
    {
        pattern: /const\s+MobileToolBtn\s*=\s*\(\{\s*icon,\s*label,\s*action,\s*val,\s*activeColor,\s*tooltip\s*\}:\s*any\)\s*=>/g,
        replacement: 'const MobileToolBtn = ({ icon, label, action, val, activeColor, tooltip }: { icon: string; label: string; action: () => void; val?: string | boolean; activeColor?: string; tooltip?: string }) =>',
        description: 'MobileToolBtn props type'
    },
    // Fix 21: value: any -> value: unknown
    {
        pattern: /value:\s*any\s*\)/g,
        replacement: 'value: unknown)',
        description: 'value parameter type'
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
        console.log(`✅ Fixed ${changesCount} issues in: ${path.relative(ADMIN_DIR, filePath)}`);
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

console.log('🚀 Starting FINAL batch fix for ALL remaining admin components...\n');
const totalFixes = processDirectory(ADMIN_DIR);
console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('📊 Run audit script to verify results.');
