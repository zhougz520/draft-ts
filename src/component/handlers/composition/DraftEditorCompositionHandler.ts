import { DraftEditor } from '../../base/DraftEditor';

import { EditorState } from '../../model/immutable/EditorState';
import { DraftInlineStyle } from '../../model/immutable/CharacterMetadata';

import { DraftModifier } from '../../model/modifier/DraftModifier';
import { isSelectionAtLeafStart } from '../../selection/isSelectionAtLeafStart';
import { utils } from '../../utils/fbjs';
const { Keys } = utils;

/**
 * 延迟毫秒
 * 以允许`onCompositionStart`再次触发`onCompositionEnd`
 */
const RESOLVE_DELAY: number = 20;

let resolved: boolean = false;
let stillComposing: boolean = false;
let textInputData: string = '';

export const DraftEditorCompositionHandler: any = {
    onBeforeInput(editor: DraftEditor, e: any): void {
        textInputData = (textInputData || '') + e.nativeEvent.data;
    },

    onCompositionStart(editor: DraftEditor): void {
        stillComposing = true;
    },

    onCompositionEnd(editor: DraftEditor): void {
        resolved = false;
        stillComposing = false;
        setTimeout(() => {
            if (!resolved) {
                DraftEditorCompositionHandler.resolveComposition(editor);
            }
        }, RESOLVE_DELAY);
    },

    onKeyDown(editor: DraftEditor, e: any): void {
        if (!stillComposing) {
            // If a keydown event is received after compositionend but before the
            // 20ms timer expires (ex: type option-E then backspace, or type A then
            // backspace in 2-Set Korean), we should immediately resolve the
            // composition and reinterpret the key press in edit mode.
            DraftEditorCompositionHandler.resolveComposition(editor);
            editor._onKeyDown(e);

            return;
        }
        if (e.which === Keys.RIGHT || e.which === Keys.LEFT) {
            e.preventDefault();
        }
    },

    onKeyPress(editor: DraftEditor, e: any): void {
        if (e.which === Keys.RETURN) {
            e.preventDefault();
        }
    },

    resolveComposition(editor: DraftEditor): void {
        if (stillComposing) {
            return;
        }

        resolved = true;
        const composedChars: string = textInputData;
        textInputData = '';

        const editorState: EditorState = EditorState.set(editor._latestEditorState, {
            inCompositionMode: false
        });

        const currentStyle: DraftInlineStyle = editorState.getCurrentInlineStyle();
        // TODO entityKey

        const mustReset: boolean =
            !composedChars ||
            isSelectionAtLeafStart(editorState) ||
            currentStyle.size > 0;
        // TODO entityKey

        if (mustReset) {
            editor.restoreEditorDOM();
        }

        editor.exitCurrentMode();

        if (composedChars) {
            // If characters have been composed, re-rendering with the update
            // is sufficient to reset the editor.
            const contentState = DraftModifier.replaceText(
                editorState.getCurrentContent(),
                editorState.getSelection(),
                composedChars,
                currentStyle
                // TODO entityKey
            );
            editor.update(
                EditorState.push(editorState, contentState, 'insert-characters')
            );

            return;
        }

        if (mustReset) {
            editor.update(
                EditorState.set(editorState, {
                    nativelyRenderedContent: null,
                    forceSelection: true
                })
            );
        }
    }
};
