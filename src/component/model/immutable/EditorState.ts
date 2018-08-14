import { Record, OrderedMap, List, OrderedSet, Stack } from 'immutable';

import { SelectionState } from './SelectionState';
import { ContentState } from './ContentState';
import { BlockTree } from './BlockTree';
import { BlockMap } from './BlockMapBuilder';
import { EditorChangeType } from './EditorChangeType';
import { DraftInlineStyle } from './CharacterMetadata';
import { ContentBlock } from './ContentBlock';

// TODO treeMap
const defaultRecord: {
    allowUndo: boolean,
    currentContent: ContentState | null,
    forceSelection: boolean,
    inCompositionMode: boolean,
    inlineStyleOverride: DraftInlineStyle | null,
    lastChangeType: EditorChangeType | null,
    nativelyRenderedContent: ContentState | null,
    selection: SelectionState | null,
    treeMap: OrderedMap<string, List<any>> | null,
    redoStack: Stack<ContentState>,
    undoStack: Stack<ContentState>
} = {
    allowUndo: true,
    currentContent: null,
    forceSelection: false,
    inCompositionMode: false,
    inlineStyleOverride: null,
    lastChangeType: null,
    nativelyRenderedContent: null,
    selection: null,
    treeMap: null,
    redoStack: Stack(),
    undoStack: Stack()
};

export const EditorStateRecord: Record.Class = Record(defaultRecord);

export class EditorState extends EditorStateRecord {
    static createEmpty(text: string = ''): EditorState {
        return EditorState.createWithContent(
            ContentState.createFromText(text)
        );
    }

    static createWithContent(contentState: ContentState): EditorState {
        const firstKey: string = contentState
            .getBlockMap()
            .first()
            .getKey();

        return EditorState.create({
            currentContent: contentState,
            undoStack: Stack(),
            redoStack: Stack(),
            selection: SelectionState.createEmpty(firstKey)
        });
    }

    static create(config: any): EditorState {
        const { currentContent } = config;
        const recordConfig: any = {
            ...config,
            treeMap: generateNewTreeMap(currentContent)
        };

        return new EditorState(recordConfig);
    }

    // TODO error
    static set(editorState: EditorState, put: any): EditorState {
        // TODO decorator
        const map: any = editorState.withMutations(
            (state: any) => {
                // const existingDecorator = state.get('decorator');
                // let decorator = existingDecorator;
                // if (put.decorator === null) {
                //     decorator = null;
                // } else if (put.decorator) {
                //     decorator = put.decorator;
                // }

                const newContent: ContentState = put.currentContent || editorState.getCurrentContent();

                // if (decorator !== existingDecorator) {
                //     // const treeMap: OrderedMap<any, any> = state.get('treeMap');
                //     // TODO newTreeMap
                //     let newTreeMap;
                //     if (decorator && existingDecorator) {
                //         newTreeMap = null;
                //     } else {
                //         newTreeMap = null;
                //     }

                //     state.merge({
                //         decorator,
                //         treeMap: newTreeMap,
                //         nativelyRenderedContent: null
                //     });

                //     return;
                // }

                const existingContent: ContentState = editorState.getCurrentContent();
                if (newContent !== existingContent) {
                    state.set(
                        'treeMap',
                        regenerateTreeForNewBlocks(
                            editorState,
                            newContent.getBlockMap()
                        )
                    );
                }

                state.merge(put);
            }
        );

        return new EditorState(map);
    }

    static acceptSelection(editorState: EditorState, selection: SelectionState
    ): EditorState {
        return updateSelection(editorState, selection, false);
    }

    static forceSelection(editorState: EditorState, selection: SelectionState
    ): EditorState {
        if (!selection.getHasFocus()) {
            selection = selection.set('hasFocus', true) as SelectionState;
        }

        return updateSelection(editorState, selection, true);
    }

    static push(editorState: EditorState, contentState: ContentState, changeType: EditorChangeType
    ): EditorState {
        if (editorState.getCurrentContent() === contentState) {
            return editorState;
        }

        const forceSelection: boolean = changeType !== 'insert-characters';
        // TODO directionMap\getAllowUndo

        const selection: SelectionState = editorState.getSelection();
        const currentContent: ContentState = editorState.getCurrentContent();
        let undoStack: Stack<ContentState> = editorState.getUndoStack();
        let newContent: ContentState = contentState;

        if (
            selection !== currentContent.getSelectionAfter() ||
            mustBecomeBoundary(editorState, changeType)
        ) {
            undoStack = undoStack.push(currentContent);
            newContent = newContent.set('selectionBefore', selection) as ContentState;
        } else if (
            changeType === 'insert-characters' ||
            changeType === 'backspace-character' ||
            changeType === 'delete-character'
        ) {
            // Preserve the previous selection.
            newContent = newContent.set(
                'selectionBefore',
                currentContent.getSelectionBefore()
            ) as ContentState;
        }

        let inlineStyleOverride: DraftInlineStyle | null = editorState.getInlineStyleOverride();

        // Don't discard inline style overrides for the following change types:
        const overrideChangeTypes: string[] = [
            'adjust-depth',
            'change-block-type',
            'split-block'
        ];

        if (overrideChangeTypes.indexOf(changeType) === -1) {
            inlineStyleOverride = null;
        }

        const editorStateChanges: any = {
            currentContent: newContent,
            undoStack,
            redoStack: Stack(),
            lastChangeType: changeType,
            selection: contentState.getSelectionAfter(),
            forceSelection,
            inlineStyleOverride
        };

        return EditorState.set(editorState, editorStateChanges);
    }

    /**
     * Make the top ContentState in the undo stack the new current content and
     * push the current content onto the redo stack.
     */
    static undo(editorState: EditorState): EditorState {
        if (!editorState.getAllowUndo()) {
            return editorState;
        }

        const undoStack: Stack<ContentState> = editorState.getUndoStack();
        const newCurrentContent: ContentState = undoStack.peek();
        if (!newCurrentContent) {
            return editorState;
        }

        const currentContent: ContentState = editorState.getCurrentContent();

        return EditorState.set(editorState, {
            currentContent: newCurrentContent,
            undoStack: undoStack.shift(),
            redoStack: editorState.getRedoStack().push(currentContent),
            forceSelection: true,
            inlineStyleOverride: null,
            lastChangeType: 'undo',
            nativelyRenderedContent: null,
            selection: currentContent.getSelectionBefore()
        });
    }

    /**
     * Make the top ContentState in the redo stack the new current content and
     * push the current content onto the undo stack.
     */
    static redo(editorState: EditorState): EditorState {
        if (!editorState.getAllowUndo()) {
            return editorState;
        }

        const redoStack: Stack<ContentState> = editorState.getRedoStack();
        const newCurrentContent: ContentState = redoStack.peek();
        if (!newCurrentContent) {
            return editorState;
        }

        const currentContent: ContentState = editorState.getCurrentContent();

        return EditorState.set(editorState, {
            currentContent: newCurrentContent,
            undoStack: editorState.getUndoStack().push(currentContent),
            redoStack: redoStack.shift(),
            forceSelection: true,
            inlineStyleOverride: null,
            lastChangeType: 'redo',
            nativelyRenderedContent: null,
            selection: newCurrentContent.getSelectionAfter()
        });
    }

    static setInlineStyleOverride(
        editorState: EditorState,
        inlineStyleOverride: DraftInlineStyle
    ): EditorState {
        return EditorState.set(editorState, { inlineStyleOverride });
    }

    getAllowUndo(): boolean {
        return this.get('allowUndo');
    }

    getCurrentContent(): ContentState {
        return this.get('currentContent');
    }

    getUndoStack(): Stack<ContentState> {
        return this.get('undoStack');
    }

    getRedoStack(): Stack<ContentState> {
        return this.get('redoStack');
    }

    getSelection(): SelectionState {
        return this.get('selection');
    }

    isInCompositionMode(): boolean {
        return this.get('inCompositionMode');
    }

    mustForceSelection(): boolean {
        return this.get('forceSelection');
    }

    getNativelyRenderedContent(): ContentState | null {
        return this.get('nativelyRenderedContent');
    }

    getLastChangeType(): EditorChangeType | null {
        return this.get('lastChangeType');
    }

    getInlineStyleOverride(): DraftInlineStyle | null {
        return this.get('inlineStyleOverride');
    }

    getBlockTree(blockKey: string): List<any> {
        return this.getIn(['treeMap', blockKey]);
    }

    isSelectionAtStartOfContent(): boolean {
        const firstKey: string = this.getCurrentContent()
            .getBlockMap()
            .first()
            .getKey();

        return this.getSelection().hasEdgeWithin(firstKey, 0, 0);
    }

    isSelectionAtEndOfContent(): boolean {
        const content: ContentState = this.getCurrentContent();
        const blockMap: BlockMap = content.getBlockMap();
        const last: ContentBlock = blockMap.last();
        const end: number = last.getLength();

        return this.getSelection().hasEdgeWithin(last.getKey(), end, end);
    }

    getCurrentInlineStyle(): DraftInlineStyle {
        const override: DraftInlineStyle | null = this.getInlineStyleOverride();
        if (override != null) {
            return override;
        }

        const content: ContentState = this.getCurrentContent();
        const selection: SelectionState = this.getSelection();

        if (selection.isCollapsed()) {
            return getInlineStyleForCollapsedSelection(content, selection);
        }

        return getInlineStyleForNonCollapsedSelection(content, selection);
    }
}

/**
 * 更新SelectionState
 * @param editorState
 * @param selection
 * @param forceSelection
 */
function updateSelection(
    editorState: EditorState,
    selection: SelectionState,
    forceSelection: boolean
): EditorState {
    return EditorState.set(editorState, {
        selection,
        forceSelection,
        nativelyRenderedContent: null,
        inlineStyleOverride: null
    });
}

// TODO decorator
function generateNewTreeMap(contentState: ContentState): OrderedMap<string, List<any>> {
    return contentState
        .getBlockMap()
        .map((block) => BlockTree.generate(contentState, block))
        .toOrderedMap();
}

function regenerateTreeForNewBlocks(
    editorState: EditorState,
    newBlockMap: BlockMap
    // TODO newEntityMap\decorator
): OrderedMap<string, List<any>> {
    const contentState: ContentState = editorState.getCurrentContent();
    const prevBlockMap: BlockMap = contentState.getBlockMap();
    const prevTreeMap: OrderedMap<string, List<any>> = editorState.get('treeMap');

    return prevTreeMap.merge(
        newBlockMap
            .toSeq()
            .filter((block, key) => block !== prevBlockMap.get(key as string))
            .map((block) => BlockTree.generate(contentState, block))
    );
}

/**
 * 返回一个变化是否应该被认为是一个边界状态
 * @param editorState
 * @param changeType
 */
function mustBecomeBoundary(
    editorState: EditorState,
    changeType: EditorChangeType
): boolean {
    const lastChangeType: EditorChangeType | null = editorState.getLastChangeType();

    return (
        changeType !== lastChangeType ||
        (changeType !== 'insert-characters' &&
            changeType !== 'backspace-character' &&
            changeType !== 'delete-character')
    );
}

function getInlineStyleForCollapsedSelection(
    content: ContentState,
    selection: SelectionState
): DraftInlineStyle {
    const startKey: string = selection.getStartKey();
    const startOffset: number = selection.getStartOffset();
    const startBlock: ContentBlock = content.getBlockForKey(startKey);

    // If the cursor is not at the start of the block, look backward to
    // preserve the style of the preceding character.
    if (startOffset > 0) {
        return startBlock.getInlineStyleAt(startOffset - 1);
    }

    // The caret is at position zero in this block. If the block has any
    // text at all, use the style of the first character.
    if (startBlock.getLength()) {
        return startBlock.getInlineStyleAt(0);
    }

    // Otherwise, look upward in the document to find the closest character.
    return lookUpwardForInlineStyle(content, startKey);
}

function getInlineStyleForNonCollapsedSelection(
    content: ContentState,
    selection: SelectionState
): DraftInlineStyle {
    const startKey: string = selection.getStartKey();
    const startOffset: number = selection.getStartOffset();
    const startBlock: ContentBlock = content.getBlockForKey(startKey);

    // If there is a character just inside the selection, use its style.
    if (startOffset < startBlock.getLength()) {
        return startBlock.getInlineStyleAt(startOffset);
    }

    // Check if the selection at the end of a non-empty block. Use the last
    // style in the block.
    if (startOffset > 0) {
        return startBlock.getInlineStyleAt(startOffset - 1);
    }

    // Otherwise, look upward in the document to find the closest character.
    return lookUpwardForInlineStyle(content, startKey);
}

function lookUpwardForInlineStyle(
    content: ContentState,
    fromKey: string
): DraftInlineStyle {
    const lastNonEmpty: ContentBlock = content
        .getBlockMap()
        .reverse()
        .skipUntil((_, k) => k === fromKey)
        .skip(1)
        .skipUntil((block: any, _) => block.getLength())
        .first();

    if (lastNonEmpty) {
        return lastNonEmpty.getInlineStyleAt(lastNonEmpty.getLength() - 1);
    }

    return OrderedSet();
}
