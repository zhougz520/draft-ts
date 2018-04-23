import { EditorState } from '../immutable/EditorState';
import { SelectionState } from '../immutable/SelectionState';
import { DraftInlineStyle } from '../immutable/CharacterMetadata';
import { ContentState } from '../immutable/ContentState';
import { ContentBlock } from '../immutable/ContentBlock';
import { BlockMap } from '../immutable/BlockMapBuilder';

import { DraftEditorCommand } from '../constants/DraftEditorCommand';
import { adjustBlockDepthForContentState } from '../transaction/adjustBlockDepthForContentState';
import { DraftModifier } from './DraftModifier';

import { List, Map } from 'immutable';
import { utils } from '../../utils/fbjs';
const { nullthrows } = utils;

/**
 * @param MAX_INDENT tab缩进的最大层级0~MAX_INDENT
 * 需要与\src\component\assets\Sass\Indent.scss文件中的MAX_INDENT参数对应，小1
 */
const MAX_INDENT: number = 9;

export const RichTextEditorUtil = {
    handleKeyCommand(
        editorState: EditorState,
        command: DraftEditorCommand | string
    ): EditorState | null {
        switch (command) {
            case 'bold':
                return RichTextEditorUtil.toggleInlineStyle(editorState, 'BOLD');
            case 'italic':
                return RichTextEditorUtil.toggleInlineStyle(editorState, 'ITALIC');
            case 'underline':
                return RichTextEditorUtil.toggleInlineStyle(editorState, 'UNDERLINE');
            case 'code':
                // TODO toggleCode
                // return RichTextEditorUtil.toggleCode(editorState);
            case 'backspace':
            case 'backspace-word':
            case 'backspace-to-start-of-line':
                return RichTextEditorUtil.onBackspace(editorState);
            case 'delete':
            case 'delete-word':
            case 'delete-to-end-of-block':
                // TODO onDelete
                // return RichTextEditorUtil.onDelete(editorState);
            default:
                // they may have custom editor commands; ignore those
                return null;
        }
    },

    onBackspace(editorState: EditorState): EditorState | null {
        const selection: SelectionState = editorState.getSelection();
        if (
            !selection.isCollapsed() ||
            selection.getAnchorOffset() ||
            selection.getFocusOffset()
        ) {
            return null;
        }

        // First, try to remove a preceding atomic block.
        const content: ContentState = editorState.getCurrentContent();
        const startKey: string = selection.getStartKey();
        const blockBefore: ContentBlock | null = content.getBlockBefore(startKey);

        if (blockBefore && blockBefore.getType() === 'atomic') {
            const blockMap: BlockMap = content.getBlockMap().delete(blockBefore.getKey());
            const withoutAtomicBlock: ContentState = content.merge({
                blockMap,
                selectionAfter: selection
            }) as ContentState;
            if (withoutAtomicBlock !== content) {
                return EditorState.push(
                    editorState,
                    withoutAtomicBlock,
                    'remove-range'
                );
            }
        }

        // If that doesn't succeed, try to remove the current block style.
        const withoutBlockStyle: ContentState | null = RichTextEditorUtil.tryToRemoveBlockStyle(
            editorState
        );

        if (withoutBlockStyle) {
            return EditorState.push(
                editorState,
                withoutBlockStyle,
                'change-block-type'
            );
        }

        return null;
    },

    /**
     * 修改BlockType用于界面渲染
     * @param editorState 当前editorState
     * @param blockType 新的blockType
     */
    toggleBlockType(
        editorState: EditorState,
        blockType: string   // TODO DraftBlockType
    ): EditorState {
        const selection: SelectionState = editorState.getSelection();
        const startKey: string = selection.getStartKey();
        let endKey: string = selection.getEndKey();
        const content: ContentState = editorState.getCurrentContent();
        let target: SelectionState = selection;

        if (startKey !== endKey && selection.getEndOffset() === 0) {
            const blockBefore: ContentBlock = nullthrows(content.getBlockBefore(endKey));
            endKey = blockBefore.getKey();
            target = target.merge({
                anchorKey: startKey,
                anchorOffset: selection.getStartOffset(),
                focusKey: endKey,
                focusOffset: blockBefore.getLength(),
                isBackward: false
            }) as SelectionState;
        }

        const hasAtomicBlock: boolean = content
            .getBlockMap()
            .skipWhile((_, k) => k !== startKey)
            .reverse()
            .skipWhile((_, k) => k !== endKey)
            .some((v: any) => v.getType() === 'atomic');

        if (hasAtomicBlock) {
            return editorState;
        }

        const typeToSet: string =
            content.getBlockForKey(startKey).getType() === blockType
                ? 'unstyled'
                : blockType;

        // 当设置样式不为列表的时候depth重置为0
        let depth: number | undefined = undefined;
        const specialBlockType: List<string> = List(['unordered-list-item', 'ordered-list-item']);
        if (specialBlockType.includes(typeToSet) === false) {
            depth = 0;
        }

        return EditorState.push(
            editorState,
            DraftModifier.setBlockType(content, target, typeToSet, depth),
            'change-block-type'
        );
    },

    toggleInlineStyle(
        editorState: EditorState,
        inlineStyle: string
    ): EditorState {
        const selection: SelectionState = editorState.getSelection();
        const currentStyle: DraftInlineStyle = editorState.getCurrentInlineStyle();

        // If the selection is collapsed, toggle the specified style on or off and
        // set the result as the new inline style override. This will then be
        // used as the inline style for the next character to be inserted.
        if (selection.isCollapsed()) {
            return EditorState.setInlineStyleOverride(
                editorState,
                currentStyle.has(inlineStyle)
                    ? currentStyle.remove(inlineStyle)
                    : currentStyle.add(inlineStyle)
            );
        }

        // If characters are selected, immediately apply or remove the
        // inline style on the document state itself.
        const content: ContentState = editorState.getCurrentContent();
        let newContent: ContentState;

        // If the style is already present for the selection range, remove it.
        // Otherwise, apply it.
        if (currentStyle.has(inlineStyle)) {
            newContent = DraftModifier.removeInlineStyle(
                content,
                selection,
                inlineStyle
            );
        } else {
            newContent = DraftModifier.applyInlineStyle(
                content,
                selection,
                inlineStyle
            );
        }

        return EditorState.push(editorState, newContent, 'change-inline-style');
    },

    onTab(
        e: any,
        editorState: EditorState,
        maxDepth: number = MAX_INDENT
    ): EditorState {
        const selection: SelectionState = editorState.getSelection();
        const key: string = selection.getAnchorKey();
        if (key !== selection.getFocusKey()) {
            return editorState;
        }

        const content: ContentState = editorState.getCurrentContent();
        const block: ContentBlock = content.getBlockForKey(key);
        const type: string = block.getType();
        if (type !== 'unordered-list-item' && type !== 'ordered-list-item') {
            return editorState;
        }

        e.preventDefault();

        const blockAbove: ContentBlock | null = content.getBlockBefore(key);
        if (!blockAbove) {
            return editorState;
        }

        const typeAbove: string = blockAbove.getType();
        if (
            typeAbove !== 'unordered-list-item' &&
            typeAbove !== 'ordered-list-item'
        ) {
            return editorState;
        }

        const depth: number = block.getDepth();
        if (!e.shiftKey && depth === maxDepth) {
            return editorState;
        }
        if (e.shiftKey && depth === 0) {
            return editorState;
        }

        maxDepth = Math.min(blockAbove.getDepth() + 1, maxDepth);

        const withAdjustment: ContentState = adjustBlockDepthForContentState(
            content,
            selection,
            e.shiftKey ? -1 : 1,
            maxDepth
        );

        return EditorState.push(editorState, withAdjustment, 'adjust-depth');
    },

    tryToRemoveBlockStyle(editorState: EditorState): ContentState | null {
        const selection: SelectionState = editorState.getSelection();
        const offset: number = selection.getAnchorOffset();
        if (selection.isCollapsed() && offset === 0) {
            const key: string = selection.getAnchorKey();
            const content: ContentState = editorState.getCurrentContent();
            const block: ContentBlock = content.getBlockForKey(key);

            const firstBlock: ContentBlock = content.getFirstBlock();
            if (block.getLength() > 0 && block !== firstBlock) {
                return null;
            }

            const type: string = block.getType();
            const blockBefore: ContentBlock | null = content.getBlockBefore(key);
            if (
                type === 'code-block' &&
                blockBefore &&
                blockBefore.getType() === 'code-block' &&
                blockBefore.getLength() !== 0
            ) {
                return null;
            }

            if (type !== 'unstyled') {
                // 清除样式的时候把depth重置为0，把data清空
                const contentStateWithOutData: ContentState = DraftModifier.setBlockData(content, selection, Map() as any);
                return DraftModifier.setBlockType(contentStateWithOutData, selection, 'unstyled', 0);
            }
        }

        return null;
    }
};
