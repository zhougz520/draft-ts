import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';

export function editOnCompositionStart(editor: DraftEditor, e: any): void {
    editor.setMode('composite');
    editor.update(
        EditorState.set(editor._latestEditorState, { inCompositionMode: true })
    );
    // Allow composition handler to interpret the compositionstart event
    editor._onCompositionStart(e);
}
