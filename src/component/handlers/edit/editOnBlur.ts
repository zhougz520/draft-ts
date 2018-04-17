import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';

import { utils } from '../../utils/fbjs';
const { containsNode, getActiveElement } = utils;

export function editOnBlur(editor: DraftEditor, e: any): void {
    if (getActiveElement() === document.body) {
        const selection: Selection = window.getSelection();
        const editorNode: any = editor.refs.editor;
        if (
            selection.rangeCount === 1 &&
            containsNode(editorNode, selection.anchorNode) &&
            containsNode(editorNode, selection.focusNode)
        ) {
            selection.removeAllRanges();
        }
    }

    const editorState: EditorState = editor._latestEditorState;
    const currentSelection: SelectionState = editorState.getSelection();
    if (!currentSelection.getHasFocus()) {
        return;
    }

    const selectionState: SelectionState = currentSelection.set('hasFocus', false) as SelectionState;
    editor.props.onBlur && editor.props.onBlur(e);
    editor.update(EditorState.acceptSelection(editorState, selectionState));
}
