// Version: 1.109 - Usando RichContextMenu compartilhado
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ContentBlock } from '../../../../types';
import { EDITOR_WIDGETS } from '../../EditorWidgets';
import { RichContextMenu } from '../RichContextMenu';
import { CELEBRATION_BLOCKS } from '../CelebrationBlocks';
import { getEngagementColors } from '../EngagementColors';

interface SmartBlockEditorProps {
    block: ContentBlock;
    onUpdate: (updatedBlock: ContentBlock) => void;
}

export const SmartBlockEditor: React.FC<SmartBlockEditorProps> = ({ block, onUpdate }) => {
    // 1. Identify Widget
    const widgetId = block.settings.widgetId;

    // Resolve Color Theme
    const currentColor = block.settings.engagementColor || 'default_blue';
    const colorThemes = getEngagementColors('default');
    const activeTheme = colorThemes.find(c => c.id === currentColor) || colorThemes[0];

    // Find in standard widgets OR celebration blocks
    let widgetDef = EDITOR_WIDGETS.find(w => w.id === widgetId);

    if (!widgetDef) {
        // Try to find in celebrations
        const celebration = CELEBRATION_BLOCKS.find(c => c.template.settings?.widgetId === widgetId);
        if (celebration) {
            // Map to EditorWidget interface
            widgetDef = {
                id: widgetId,
                name: celebration.name,
                category: 'editorial', // Default category
                icon: celebration.icon,
                description: celebration.description,
                html: celebration.template.content || ''
            };
        }
    }

    // Fallback: look in content string (legacy method)
    if (!widgetDef) {
        widgetDef = EDITOR_WIDGETS.find(w => block.content.includes(w.id));
    }

    // 2. Mutable State for Content (HTML string)
    // We inject contentEditable="true" directly into the string so React renders it natively.
    const [renderHtml, setRenderHtml] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const isEditingRef = useRef(false);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, key: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'style' | 'color' | 'layout'>('style');

    // HELPER: Prepare HTML for Editor (Inject contentEditable)
    const prepareHtmlForEditing = useCallback((html: string) => {
        if (!html) return '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Find all editable keys and make them editable + styled
        const editableElements = doc.querySelectorAll('[data-key]');

        if (editableElements.length === 0) return html; // Return original if no keys found

        editableElements.forEach(el => {
            el.setAttribute('contenteditable', 'true');
            // Add visual cues classes directly to the string
            let classes = el.getAttribute('class') || '';
            if (!classes.includes('cursor-text')) {
                classes += ' cursor-text hover:outline-dashed hover:outline-1 hover:outline-blue-300 transition-all outline-none';
                el.setAttribute('class', classes.trim());
            }
        });

        return doc.body.innerHTML;
    }, []);

    // INITIALIZATION & SYNC
    useEffect(() => {
        if (isEditingRef.current) return;

        let baseHtml = block.content;
        // Fallback to template if content is empty/corrupt
        if (widgetDef && (!baseHtml || !baseHtml.includes('data-key'))) {
            baseHtml = widgetDef.html;
        }

        // Apply visual variant capability (inject class)
        const currentVariant = block.settings.editorialVariant;
        if (currentVariant && widgetDef) {
            // We need to fetch styles synchronously or use what we have. 
            // Ideally we shouldn't do async inside render prep usually, but for now:
            // We will assume the parent handles the class injection via `SmartBlockRenderer` normally.
            // BUT here we are the editor. We need to mirror the style.
            // Simplified: Just render the content. The logic below handles the "view" update.
        }

        const editableHtml = prepareHtmlForEditing(baseHtml);
        setRenderHtml(editableHtml);

    }, [block.content, block.settings.editorialVariant, widgetDef, prepareHtmlForEditing]);


    // SYNC BACK TO PARENT
    const syncContent = () => {
        if (!containerRef.current || !widgetDef) return;

        // Clone the container to clean up attributes before saving
        const clone = containerRef.current.cloneNode(true) as HTMLElement;

        // Extract Data JSON
        const newData: Record<string, string> = {};

        // Clean up: Remove contentEditable and preview classes
        clone.querySelectorAll('[data-key]').forEach((el) => {
            const key = el.getAttribute('data-key');
            if (key) newData[key] = el.innerHTML;

            el.removeAttribute('contenteditable');
            // We should strip the specific classes we added? 
            // Regex replacement might be safer on the string if we added generic classes.
            el.classList.remove('cursor-text', 'hover:outline-dashed', 'hover:outline-1', 'hover:outline-blue-300', 'transition-all', 'outline-none');
        });

        // Current HTML cleaned
        const finalHtml = clone.innerHTML;

        onUpdate({
            ...block,
            content: finalHtml,
            settings: {
                ...block.settings,
                widgetId: widgetDef.id,
                widgetData: newData
            }
        });
    };

    // FORMATTING
    const handleFormat = (cmd: string, value?: string) => {
        document.execCommand(cmd, false, value);
        syncContent();
    };

    // HANDLERS
    const handleContainerRightClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLElement;
        const keyEl = target.closest('[data-key]');

        if (keyEl) {
            // Force selection visually
            const selection = window.getSelection();
            if (selection && selection.rangeCount === 0) {
                const range = document.createRange();
                range.selectNodeContents(keyEl);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            setContextMenu({ x: e.clientX, y: e.clientY, key: keyEl.getAttribute('data-key') || 'unknown' });
        }
    };

    const handleInput = () => {
        // Debounce sync?
        // simple flag for now
        isEditingRef.current = true;
    };

    const handleBlur = (e: React.FocusEvent) => {
        // Only sync if we are leaving the editor container entirely?
        // Or specific element blur.
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!containerRef.current?.contains(relatedTarget)) {
            isEditingRef.current = false;
            syncContent();
        }
    };

    // Close menu on click
    useEffect(() => {
        const closeMenu = () => setContextMenu(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);


    if (!widgetDef) return <div className="p-4 text-red-500 text-xs">Widget perdido. Recrie o bloco.</div>;

    return (
        <div className={`w-full relative group/editor transition-all duration-300 p-4 rounded-xl ${activeTheme.classes.wrapper}`}>

            {/* INSTRUCTIONS */}
            <div className="absolute -top-6 left-0 right-0 flex justify-center opacity-0 group-hover/editor:opacity-100 transition-opacity pointer-events-none z-10">
                <span className="bg-zinc-900/90 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-zinc-700">
                    <i className="fas fa-edit mr-1.5 text-blue-400"></i>
                    Edição Visual Ativa
                </span>
            </div>

            {/* LIVE PREVIEW / EDITOR CANVAS */}
            <div
                ref={containerRef}
                className={`w-full transition-all outline-none ${activeTheme.classes.text}`}
                dangerouslySetInnerHTML={{ __html: renderHtml }}
                onContextMenu={handleContainerRightClick}
                onInput={handleInput}
                onBlurCapture={handleBlur} // Capture blur from children
            />

            {/* CONTEXT MENU - Rico com Abas */}
            {contextMenu && (
                <RichContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onFormat={handleFormat}
                    onInsertLink={() => {
                        const url = prompt('Link URL:', 'https://');
                        if (url) handleFormat('createLink', url);
                    }}
                />
            )}
        </div>
    );
};
