import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';
import { ContentState } from '../../model/immutable/ContentState';
import { DraftInlineStyle } from '../../model/immutable/CharacterMetadata';

import { DraftModifier } from '../../model/modifier/DraftModifier';
import { isSelectionAtLeafStart } from '../../selection/isSelectionAtLeafStart';

import { utils } from '../../utils/fbjs';
const { setImmediate } = utils;

function replaceText(
    editorState: EditorState,
    text: string,
    inlineStyle: DraftInlineStyle
    // TODO entityKey
): EditorState {
    const contentState: ContentState = DraftModifier.replaceText(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        text,
        inlineStyle
        // TODO entityKey
    );

    return EditorState.push(editorState, contentState, 'insert-characters');
}

export function editOnBeforeInput(editor: DraftEditor, e: any): void {
    if (editor._pendingStateFromBeforeInput !== undefined) {
        editor.update(editor._pendingStateFromBeforeInput);
        editor._pendingStateFromBeforeInput = undefined;
    }

    const editorState: EditorState = editor._latestEditorState;

    const chars: string = e.nativeEvent.data;

    if (!chars) {
        return;
    }

    // TODO handleBeforeInput

    const selection: SelectionState = editorState.getSelection();
    const selectionStart: number = selection.getStartOffset();
    const selectionEnd: number = selection.getEndOffset();
    // const anchorKey: string = selection.getAnchorKey();

    if (!selection.isCollapsed()) {
        e.preventDefault();

        const currentlySelectedChars: string = editorState
            .getCurrentContent()
            .getPlainText()
            .slice(selectionStart, selectionEnd);
        if (chars === currentlySelectedChars) {
            editor.update(
                EditorState.forceSelection(
                    editorState,
                    selection.merge({ focusOffset: selectionEnd }) as SelectionState
                )
            );
        } else {
            editor.update(
                replaceText(
                    editorState,
                    chars,
                    editorState.getCurrentInlineStyle()
                    // TODO getEntityKeyForSelection
                )
            );
        }

        return;
    }

    let newEditorState: EditorState = replaceText(
        editorState,
        chars,
        editorState.getCurrentInlineStyle()
        // TODO getEntityKeyForSelection
    );

    // 有些情况下需要防止原生的插入
    let mustPreventNative: boolean = false;
    if (!mustPreventNative) {
        // 在一个Leaf的开始处输入时，浏览器往往会在DOM中奇怪的地方插入文本，所以我们会自己处理。
        mustPreventNative = isSelectionAtLeafStart(editor._latestCommittedEditorState);
    }
    if (!mustPreventNative) {
        // Chrome will also split up a node into two pieces if it contains a Tab
        // char, for no explicable reason. Seemingly caused by this commit:
        // https://chromium.googlesource.com/chromium/src/+/013ac5eaf3%5E%21/
        const nativeSelection: Selection = window.getSelection();
        if (nativeSelection.anchorNode && nativeSelection.anchorNode.nodeType === Node.TEXT_NODE) {
            const parentNode: Node = nativeSelection.anchorNode.parentNode as Node;
            mustPreventNative =
                parentNode.nodeName === 'SPAN' &&
                (parentNode.firstChild as Node).nodeType === Node.TEXT_NODE &&
                ((parentNode.firstChild as Node).nodeValue as string).indexOf('\t') !== -1;
        }
    }
    if (!mustPreventNative) {
        // Check the old and new "fingerprints" of the current block to determine
        // whether this insertion requires any addition or removal of text nodes,
        // in which case we would prevent the native character insertion.
        // TODO getFingerprint
    }
    if (!mustPreventNative) {
        // TODO mustPreventDefaultForCharacter
    }
    if (!mustPreventNative) {
        // TODO getDirectionMap
    }

    if (mustPreventNative) {
        e.preventDefault();
        editor.update(newEditorState);

        return;
    }

    // We made it all the way! Let the browser do its thing and insert the char.
    newEditorState = EditorState.set(newEditorState, {
        nativelyRenderedContent: newEditorState.getCurrentContent()
    });
    editor._pendingStateFromBeforeInput = newEditorState;
    setImmediate(() => {
        if (editor._pendingStateFromBeforeInput !== undefined) {
            editor.update(editor._pendingStateFromBeforeInput);
            editor._pendingStateFromBeforeInput = undefined;
        }
    });
}
