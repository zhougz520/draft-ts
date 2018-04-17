import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { ContentState } from '../../model/immutable/ContentState';
import { ContentBlock } from '../../model/immutable/ContentBlock';
import { SelectionState } from '../../model/immutable/SelectionState';
import { EditorChangeType } from '../../model/immutable/EditorChangeType';

import { DraftModifier } from '../../model/modifier/DraftModifier';
import { findAncestorOffsetKey } from '../../selection/findAncestorOffsetKey';
import { DraftOffsetKey } from '../../selection/DraftOffsetKey';
import { utils } from '../../utils/fbjs';
const { nullthrows } = utils;

const DOUBLE_NEWLINE: string = '\n\n';

export function editOnInput(editor: DraftEditor): void {
    if (editor._pendingStateFromBeforeInput !== undefined) {
        editor.update(editor._pendingStateFromBeforeInput);
        editor._pendingStateFromBeforeInput = undefined;
    }

    const domSelection: Selection = window.getSelection();

    const { anchorNode, isCollapsed } = domSelection;
    // const isNotTextNode: boolean = anchorNode.nodeType !== Node.TEXT_NODE;
    const isNotTextOrElementNode: boolean =
        anchorNode.nodeType !== Node.TEXT_NODE &&
        anchorNode.nodeType !== Node.ELEMENT_NODE;

    // TODO DraftFeatureFlags.draft_killswitch_allow_nontextnodes
    if (isNotTextOrElementNode) {
        // TODO: (t16149272) figure out context for this change
        return;
    }

    if (
        anchorNode.nodeType === Node.TEXT_NODE &&
        (anchorNode.previousSibling !== null || anchorNode.nextSibling !== null)
    ) {
        // When typing at the beginning of a visual line, Chrome splits the text
        // nodes into two. Why? No one knows. This commit is suspicious:
        // https://chromium.googlesource.com/chromium/src/+/a3b600981286b135632371477f902214c55a1724
        // To work around, we'll merge the sibling text nodes back into this one.
        const span: Node | null = anchorNode.parentNode;
        anchorNode.nodeValue = (span as Node).textContent;
        for (
            let child: Node | null = (span as Node).firstChild;
            child !== null;
            child = child.nextSibling
        ) {
            if (child !== anchorNode) {
                (span as Node).removeChild(child);
            }
        }
    }

    let domText: string = anchorNode.textContent as string;
    const editorState: EditorState = editor._latestEditorState;
    const offsetKey: string = nullthrows(findAncestorOffsetKey(anchorNode));
    // TODO decoratorKey
    const { blockKey, leafKey } = DraftOffsetKey.decode(offsetKey);

    const { start, end } = editorState
        .getBlockTree(blockKey)
        .getIn([0, 'leaves', leafKey]);

    const content: ContentState = editorState.getCurrentContent();
    const block: ContentBlock = content.getBlockForKey(blockKey);
    const modelText: string = block.getText().slice(start, end);

    // Special-case soft newlines here. If the DOM text ends in a soft newline,
    // we will have manually inserted an extra soft newline in DraftEditorLeaf.
    // We want to remove this extra newline for the purpose of our comparison
    // of DOM and model text.
    if (domText.endsWith(DOUBLE_NEWLINE)) {
        domText = domText.slice(0, -1);
    }

    // No change -- the DOM is up to date. Nothing to do here.
    if (domText === modelText) {
        // This can be buggy for some Android keyboards because they don't fire
        // standard onkeydown/pressed events and only fired editOnInput
        // so domText is already changed by the browser and ends up being equal
        // to modelText unexpectedly
        return;
    }

    const selection: SelectionState = editorState.getSelection();

    // We'll replace the entire leaf with the text content of the target.
    const targetRange: SelectionState = selection.merge({
        anchorOffset: start,
        focusOffset: end,
        isBackward: false
    }) as SelectionState;

    // TODO entity
    // const entityKey = block.getEntityAt(start);
    // const entity = entityKey && content.getEntity(entityKey);
    // const entityType = entity && entity.getMutability();
    // const preserveEntity = entityType === 'MUTABLE';

    // TODO apply-entity
    const changeType: EditorChangeType = 'spellcheck-change';

    const newContent: ContentState = DraftModifier.replaceText(
        content,
        targetRange,
        domText,
        block.getInlineStyleAt(start)
        // TODO preserveEntity
    );

    // TODO isGecko
    const charDelta: number = domText.length - modelText.length;
    const startOffset: number = selection.getStartOffset();
    const endOffset: number = selection.getEndOffset();

    const anchorOffset: number = isCollapsed ? endOffset + charDelta : startOffset;
    const focusOffset: number = endOffset + charDelta;

    const contentWithAdjustedDOMSelection: ContentState = newContent.merge({
        selectionBefore: content.getSelectionAfter(),
        selectionAfter: selection.merge({ anchorOffset, focusOffset }) as SelectionState
    }) as ContentState;

    editor.update(
        EditorState.push(editorState, contentWithAdjustedDOMSelection, changeType)
    );
}
