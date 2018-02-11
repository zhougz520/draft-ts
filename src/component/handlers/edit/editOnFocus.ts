import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';

export function editOnFocus(editor: DraftEditor, e: any): void {
    const editorState: EditorState = editor._latestEditorState;
    const currentSelection: SelectionState = editorState.getSelection();
    if (currentSelection.getHasFocus()) {
        return;
    }

    const selection: SelectionState = currentSelection.set('hasFocus', true) as SelectionState;
    editor.props.onFocus && editor.props.onFocus(e);

    // TODO UserAgent.isBrowser('Chrome < 60.0.3081.0')
    editor.update(EditorState.acceptSelection(editorState, selection));
}
