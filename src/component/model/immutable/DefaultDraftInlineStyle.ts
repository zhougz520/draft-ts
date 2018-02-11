import { EditorState } from './EditorState';
import { SelectionState } from './SelectionState';
import { ContentBlock } from './ContentBlock';
import { DraftInlineStyle } from './CharacterMetadata';

import { DraftModifier } from '../modifier/DraftModifier';
import { RichTextEditorUtil } from '../modifier/RichTextEditorUtil';
import { getSelectedBlocksList } from '../../utils/BlockUtils';
import { List, OrderedSet } from 'immutable';
import { ContentState } from './ContentState';

export const DefaultDraftInlineStyle: any = {
    // 字体颜色
    color: {},

    // 背景颜色
    bgcolor: {},

    // 字号
    fontSize: {},

    // 字体
    fontFamily: {},

    // 加粗
    BOLD: {
        fontWeight: 'bold'
    },

    // 等宽字体
    CODE: {
        fontFamily: 'monospace',
        wordWrap: 'break-word'
    },

    // 斜体
    ITALIC: {
        fontStyle: 'italic'
    },

    // 删除线
    STRIKETHROUGH: {
        textDecoration: 'line-through'
    },

    // 下划线
    UNDERLINE: {
        textDecoration: 'underline'
    },

    // 上标
    SUPERSCRIPT: {
        fontSize: 11,
        position: 'relative',
        top: -8,
        display: 'inline-flex'
    },

    // 下标
    SUBSCRIPT: {
        fontSize: 11,
        position: 'relative',
        bottom: -8,
        display: 'inline-flex'
    }
};

/**
 * 设置InlineStyleMap
 * @param styleType
 * @param styleKey
 * @param style
 */
const addToDraftInlineStyleMap = (styleType: string, styleKey: string, style: string) => {
    DefaultDraftInlineStyle[styleType][`${styleType.toLowerCase()}-${style}`] = { [`${styleKey}`]: style };
};

/**
 * returns size at a offset.
 * @param block
 * @param stylePrefix
 * @param offset
 */
function getStyleAtOffset(block: ContentBlock, stylePrefix: string, offset: number): any {
    const styles: List<string> = block.getInlineStyleAt(offset).toList();
    const style = styles.filter((s: any) => s.startsWith(stylePrefix.toLowerCase()));
    if (style && style.size > 0) {
        return style.get(0);
    }

    return undefined;
}

/**
 * returns size at a offset.
 * @param editorState
 * @param stylePrefix
 */
function getCurrentInlineStyle(editorState: EditorState, stylePrefix: string): any {
    const styles: List<string> = editorState.getCurrentInlineStyle().toList();
    const style = styles.filter((s: any) => s.startsWith(stylePrefix.toLowerCase()));
    if (style && style.size > 0) {
        return style.get(0);
    }

    return undefined;
}

/**
 * 获取选中Block的InlineStyle
 * @param editorState
 */
export function getSelectionInlineStyle(editorState: EditorState): any {
    const currentSelection: SelectionState = editorState.getSelection();
    if (currentSelection.isCollapsed()) {
        const inlineStyles: any = {};
        const styleList = editorState.getCurrentInlineStyle().toList().toJS();
        if (styleList) {
            ['BOLD', 'CODE', 'ITALIC', 'STRIKETHROUGH', 'UNDERLINE', 'SUPERSCRIPT', 'SUBSCRIPT'].forEach((style) => {
                inlineStyles[style] = styleList.indexOf(style) >= 0;
            });

            return inlineStyles;
        }
    }

    const start: number = currentSelection.getStartOffset();
    const end: number = currentSelection.getEndOffset();
    const selectedBlocks: List<ContentBlock> = getSelectedBlocksList(editorState);
    if (selectedBlocks.size > 0) {
        const inlineStyles: any = {
            BOLD: true,
            CODE: true,
            ITALIC: true,
            STRIKETHROUGH: true,
            UNDERLINE: true,
            SUPERSCRIPT: true,
            SUBSCRIPT: true
        };

        for (let ii = 0; ii < selectedBlocks.size; ii++) {
            let blockStart: number = ii === 0 ? start : 0;
            let blockEnd: number =
                ii === (selectedBlocks.size - 1) ? end : selectedBlocks.get(ii).getText().length;
            if (blockStart === blockEnd && blockStart === 0) {
                blockStart = 1;
                blockEnd = 2;
            } else if (blockStart === blockEnd) {
                blockStart -= 1;
            }
            for (let jj = blockStart; jj < blockEnd; jj++) {
                const inlineStylesAtOffset: OrderedSet<string> = selectedBlocks.get(ii).getInlineStyleAt(jj);
                ['BOLD', 'CODE', 'ITALIC', 'STRIKETHROUGH', 'UNDERLINE', 'SUPERSCRIPT', 'SUBSCRIPT']
                    .forEach((style) => {
                        inlineStyles[style] = inlineStyles[style] && inlineStylesAtOffset.get(style) === style;
                    });
            }
        }

        return inlineStyles;
    }

    return {};
}

/**
 * 返回自定义的样式：color、bgcolor、fontSize、fontFamily
 * @param editorState
 * @param styles
 */
export function getSelectionCustomInlineStyle(
    editorState: EditorState,
    styles: string[]
): any {
    if (editorState && styles && styles.length > 0) {
        const currentSelection: SelectionState = editorState.getSelection();
        const inlineStyles: any = {};
        if (currentSelection.isCollapsed()) {
            styles.forEach((s) => {
                inlineStyles[s] = getCurrentInlineStyle(editorState, s);
            });

            return inlineStyles;
        }
        const start: number = currentSelection.getStartOffset();
        const end: number = currentSelection.getEndOffset();
        const selectedBlocks: List<ContentBlock> = getSelectedBlocksList(editorState);
        if (selectedBlocks.size > 0) {
            for (let ii = 0; ii < selectedBlocks.size; ii++) {
                let blockStart: number = ii === 0 ? start : 0;
                let blockEnd: number =
                    ii === (selectedBlocks.size - 1) ? end : selectedBlocks.get(ii).getText().length;
                if (blockStart === blockEnd && blockStart === 0) {
                    blockStart = 1;
                    blockEnd = 2;
                } else if (blockStart === blockEnd) {
                    blockStart -= 1;
                }
                for (let jj = blockStart; jj < blockEnd; jj++) {
                    if (jj === blockStart) {
                        styles.forEach((s) => {
                            inlineStyles[s] = getStyleAtOffset(selectedBlocks.get(ii), s, jj);
                        });
                    } else {
                        styles.forEach((s) => {
                            if (inlineStyles[s] &&
                                inlineStyles[s] !== getStyleAtOffset(selectedBlocks.get(ii), s, jj)) {
                                inlineStyles[s] = undefined;
                            }
                        });
                    }
                }
            }

            return inlineStyles;
        }
    }

    return {};
}

/**
 * 初始化编辑器中InlineStyle映射
 */
export const getDraftInlineStyleMap = () => {
    return {
        ...DefaultDraftInlineStyle.color,
        ...DefaultDraftInlineStyle.bgcolor,
        ...DefaultDraftInlineStyle.fontSize,
        ...DefaultDraftInlineStyle.fontFamily,
        BOLD: DefaultDraftInlineStyle.BOLD,
        CODE: DefaultDraftInlineStyle.CODE,
        ITALIC: DefaultDraftInlineStyle.ITALIC,
        STRIKETHROUGH: DefaultDraftInlineStyle.STRIKETHROUGH,
        UNDERLINE: DefaultDraftInlineStyle.UNDERLINE,
        SUPERSCRIPT: DefaultDraftInlineStyle.SUPERSCRIPT,
        SUBSCRIPT: DefaultDraftInlineStyle.SUBSCRIPT
    };
};

/**
 * 提取已经设置的InlineStyle
 * @param editorState
 */
export function extractInlineStyle(editorState: EditorState) {
    if (editorState) {
        const styleList = editorState.getCurrentContent().getBlockMap()
            .map((block: ContentBlock) => block.get('characterList')).toList().flatten();
        styleList.forEach((style) => {
            if (style && style.indexOf('color-') === 0) {
                addToDraftInlineStyleMap('color', 'color', style.substr(6));
            } else if (style && style.indexOf('bgcolor-') === 0) {
                addToDraftInlineStyleMap('bgcolor', 'backgroundColor', style.substr(8));
            } else if (style && style.indexOf('fontsize-') === 0) {
                // TODO +style.substr(9)
                addToDraftInlineStyleMap('fontSize', 'fontSize', style.substr(9));
            } else if (style && style.indexOf('fontfamily-') === 0) {
                addToDraftInlineStyleMap('fontFamily', 'fontFamily', style.substr(11));
            }
        });
    }
}

/**
 * 移除所有的InlineStyle
 * @param editorState
 */
export function removeAllInlineStyles(editorState: EditorState): EditorState {
    const currentStyles: DraftInlineStyle = editorState.getCurrentInlineStyle();
    let contentState: ContentState = editorState.getCurrentContent();
    currentStyles.forEach((style) => {
        contentState = DraftModifier.removeInlineStyle(
            contentState,
            editorState.getSelection(),
            style
        );
    });

    return EditorState.push(editorState, contentState, 'change-inline-style');
}

/**
 * 添加样式
 * @param editorState
 * @param styleType
 * @param style
 */
export function toggleCustomInlineStyle(
    editorState: EditorState,
    styleType: string,
    style: string
): EditorState {
    const selection: SelectionState = editorState.getSelection();
    const nextContentState: ContentState = Object.keys(DefaultDraftInlineStyle[styleType])
        .reduce((contentState, s) => DraftModifier.removeInlineStyle(contentState, selection, s),
        editorState.getCurrentContent());

    let nextEditorState = EditorState.push(
        editorState,
        nextContentState,
        'change-inline-style'
    );

    const currentStyle: DraftInlineStyle = editorState.getCurrentInlineStyle();

    if (selection.isCollapsed()) {
        nextEditorState = currentStyle
            .reduce((state, s) => RichTextEditorUtil.toggleInlineStyle(state, s),
            nextEditorState);
    }

    if (styleType === 'SUPERSCRIPT' || styleType === 'SUBSCRIPT') {
        if (!currentStyle.has(style)) {
            nextEditorState = RichTextEditorUtil.toggleInlineStyle(
                nextEditorState,
                style
            );
        }
    } else {
        const styleKey = styleType === 'bgcolor' ? 'backgroundColor' : styleType;
        if (!currentStyle.has(`${styleKey}-${style}`)) {
            nextEditorState = RichTextEditorUtil.toggleInlineStyle(
                nextEditorState,
                `${styleType.toLowerCase()}-${style}`
            );
            addToDraftInlineStyleMap(styleType, styleKey, style);
        }
    }

    return nextEditorState;
}
