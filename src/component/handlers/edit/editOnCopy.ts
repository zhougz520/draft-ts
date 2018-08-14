import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';
import { getFragmentFromSelection } from './getFragmentFromSelection';

export function editOnCopy(editor: DraftEditor, e: any): void {
    const editorState: EditorState = editor._latestEditorState;
    const selection: SelectionState = editorState.getSelection();

    // No selection, so there's nothing to copy.
    if (selection.isCollapsed()) {
        e.preventDefault();

        return;
    }

    editor.setClipboard(getFragmentFromSelection(editor._latestEditorState));
}
