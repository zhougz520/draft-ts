import { EditorState } from '../../../model/immutable/EditorState';
import { SelectionState } from '../../../model/immutable/SelectionState';
import { ContentState } from '../../../model/immutable/ContentState';

export function keyCommandMoveSelectionToEndOfBlock(
    editorState: EditorState
): EditorState {
    const selection: SelectionState = editorState.getSelection();
    const endKey: string = selection.getEndKey();
    const content: ContentState = editorState.getCurrentContent();
    const textLength: number = content.getBlockForKey(endKey).getLength();

    return EditorState.set(editorState, {
        selection: selection.merge({
            anchorKey: endKey,
            anchorOffset: textLength,
            focusKey: endKey,
            focusOffset: textLength,
            isBackward: false
        }),
        forceSelection: true
    });
}
