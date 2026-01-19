/**
 * Tipos para componentes de Content Blocks
 * @module types/admin/blocks
 */

export interface TextBlockSettings {
    editorialVariant?: EditorialVariant;
    columnWidth: ColumnWidth;
    paragraphGap: Spacing;
}

export type EditorialVariant = 'headline' | 'quote' | 'list' | 'divider' | 'current';
export type ColumnWidth = 'full' | 'narrow' | 'wide';
export type Spacing = 'tight' | 'normal' | 'loose';

export interface HeadlineStyle {
    shadowDepth: number;
    uppercase: boolean;
    weight: 'normal' | 'bold' | 'black';
    align: 'left' | 'center' | 'right';
}

export interface QuoteStyle {
    borderPosition: 'left' | 'right' | 'both';
    borderWidth: number;
    borderColor: string;
    italic: boolean;
}

export interface ListStyle {
    spacing: Spacing;
    markerColor: 'default' | 'brand' | 'accent';
    markerStyle: 'disc' | 'circle' | 'square' | 'decimal';
}

export interface DividerConfig {
    style: 'solid' | 'dashed' | 'dotted';
    width: 'thin' | 'medium' | 'thick';
    color: string;
    spacing: Spacing;
}

export interface ParagraphStyle {
    type: 'heading' | 'body' | 'caption';
    uppercase?: boolean;
    italic?: boolean;
    bold?: boolean;
}

export interface VideoEffectSettings {
    key: string;
    value: string | number | boolean;
}

export interface CTAContent {
    text: string;
    url: string;
}

export interface RelatedContent {
    title: string;
}

export interface MobileToolBtnProps {
    icon: string;
    label: string;
    action: () => void;
    val?: string | boolean;
    activeColor?: string;
    tooltip?: string;
}

export interface BlockSettings {
    editorialVariant?: EditorialVariant;
    perStyle?: Record<string, unknown>;
    [key: string]: unknown;
}
