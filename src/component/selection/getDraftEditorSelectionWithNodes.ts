import { IDOMDerivedSelection } from './DOMDerivedSelection';
import { EditorState } from '../model/immutable/EditorState';

import { findAncestorOffsetKey } from './findAncestorOffsetKey';
import { getSelectionOffsetKeyForNode } from './getSelectionOffsetKeyForNode';
import { getUpdatedSelectionState } from './getUpdatedSelectionState';

import { utils } from '../utils/fbjs';
const { nullthrows, invariant } = utils;

interface ISelectionPoint {
    key: string;
    offset: number;
}

export function getDraftEditorSelectionWithNodes(
    editorState: EditorState,
    root: HTMLElement | null,
    anchorNode: Node,
    anchorOffset: number,
    focusNode: Node,
    focusOffset: number
): IDOMDerivedSelection {
    const anchorIsTextNode: boolean = anchorNode.nodeType === Node.TEXT_NODE;
    const focusIsTextNode: boolean = focusNode.nodeType === Node.TEXT_NODE;

    if (anchorIsTextNode && focusIsTextNode) {
        return {
            selectionState: getUpdatedSelectionState(
                editorState,
                nullthrows(findAncestorOffsetKey(anchorNode)),
                anchorOffset,
                nullthrows(findAncestorOffsetKey(focusNode)),
                focusOffset
            ),
            needsRecovery: false
        };
    }

    let anchorPoint: ISelectionPoint;
    let focusPoint: ISelectionPoint;
    let needsRecovery: boolean = true;

    // An element is selected. Convert this selection range into leaf offset
    // keys and offset values for consumption at the component level. This
    // is common in Firefox, where select-all and triple click behavior leads
    // to entire elements being selected.
    //
    // Note that we use the `needsRecovery` parameter in the callback here. This
    // is because when certain elements are selected, the behavior for subsequent
    // cursor movement (e.g. via arrow keys) is uncertain and may not match
    // expectations at the component level. For example, if an entire <div> is
    // selected and the user presses the right arrow, Firefox keeps the selection
    // on the <div>. If we allow subsequent keypresses to insert characters
    // natively, they will be inserted into a browser-created text node to the
    // right of that <div>. This is obviously undesirable.
    //
    // With the `needsRecovery` flag, we inform the caller that it is responsible
    // for manually setting the selection state on the rendered document to
    // ensure proper selection state maintenance.

    if (anchorIsTextNode) {
        anchorPoint = {
            key: nullthrows(findAncestorOffsetKey(anchorNode)),
            offset: anchorOffset
        };
        focusPoint = getPointForNonTextNode(root, focusNode, focusOffset);
    } else if (focusIsTextNode) {
        focusPoint = {
            key: nullthrows(findAncestorOffsetKey(focusNode)),
            offset: focusOffset
        };
        anchorPoint = getPointForNonTextNode(root, anchorNode, anchorOffset);
    } else {
        anchorPoint = getPointForNonTextNode(root, anchorNode, anchorOffset);
        focusPoint = getPointForNonTextNode(root, focusNode, focusOffset);

        // If the selection is collapsed on an empty block, don't force recovery.
        // This way, on arrow key selection changes, the browser can move the
        // cursor from a non-zero offset on one block, through empty blocks,
        // to a matching non-zero offset on other text blocks.
        if (anchorNode === focusNode && anchorOffset === focusOffset) {
            needsRecovery =
                !!anchorNode.firstChild && anchorNode.firstChild.nodeName !== 'BR';
        }
    }

    return {
        selectionState: getUpdatedSelectionState(
            editorState,
            anchorPoint.key,
            anchorPoint.offset,
            focusPoint.key,
            focusPoint.offset
        ),
        needsRecovery
    };
}

/**
 * 获取传入节点第一个子节点后代
 * @param node 节点
 */
function getFirstLeaf(node: Node): Node {
    while (node.firstChild && getSelectionOffsetKeyForNode(node.firstChild)) {
        node = node.firstChild;
    }

    return node;
}

/**
 * 获取传入节点的最后一个子节点后代
 * @param node 节点
 */
function getLastLeaf(node: Node): Node {
    while (node.lastChild && getSelectionOffsetKeyForNode(node.lastChild)) {
        node = node.lastChild;
    }

    return node;
}

function getPointForNonTextNode(
    editorRoot: HTMLElement | null,
    startNode: Node,
    childOffset: number
): ISelectionPoint {
    let node: Node = startNode;
    const offsetKey: string | null = findAncestorOffsetKey(node);

    invariant(
        offsetKey != null ||
        (editorRoot && (editorRoot === node || editorRoot.firstChild === node)),
        'Unknown node in selection range.'
    );

    // If the editorRoot is the selection, step downward into the content
    // wrapper.
    if (editorRoot === node) {
        node = node.firstChild as Node;
        invariant(
            node instanceof Element && node.getAttribute('data-contents') === 'true',
            'Invalid DraftEditorContents structure.'
        );
        if (childOffset > 0) {
            childOffset = node.childNodes.length;
        }
    }

    // If the child offset is zero and we have an offset key, we're done.
    // If there's no offset key because the entire editor is selected,
    // find the leftmost ("first") leaf in the tree and use that as the offset
    // key.
    if (childOffset === 0) {
        let key: string;
        if (offsetKey != null) {
            key = offsetKey;
        } else {
            const firstLeaf: Node = getFirstLeaf(node);
            key = nullthrows(getSelectionOffsetKeyForNode(firstLeaf));
        }

        return { key, offset: 0 };
    }

    const nodeBeforeCursor: Node = node.childNodes[childOffset - 1];
    let leafKey: string;
    let textLength: number;

    if (!getSelectionOffsetKeyForNode(nodeBeforeCursor)) {
        // Our target node may be a leaf or a text node, in which case we're
        // already where we want to be and can just use the child's length as
        // our offset.
        leafKey = nullthrows(offsetKey);
        textLength = getTextContentLength(nodeBeforeCursor);
    } else {
        // Otherwise, we'll look at the child to the left of the cursor and find
        // the last leaf node in its subtree.
        const lastLeaf = getLastLeaf(nodeBeforeCursor);
        leafKey = nullthrows(getSelectionOffsetKeyForNode(lastLeaf));
        textLength = getTextContentLength(lastLeaf);
    }

    return {
        key: leafKey,
        offset: textLength
    };
}

/**
 * 返回一个textContent的长度
 * 如果是换行就为0
 * @param node
 */
function getTextContentLength(node: Node): number {
    // TODO string | null
    const textContent: string = node.textContent as string;

    return textContent === '\n' ? 0 : textContent.length;
}
