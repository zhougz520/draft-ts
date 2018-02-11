import { EditorState } from '../../../model/immutable/EditorState';
import { SelectionState } from '../../../model/immutable/SelectionState';

export function keyCommandMoveSelectionToStartOfBlock(
    editorState: EditorState
) {
    const selection: SelectionState = editorState.getSelection();
    const startKey: string = selection.getStartKey();

    return EditorState.set(editorState, {
        selection: selection.merge({
            anchorKey: startKey,
            anchorOffset: 0,
            focusKey: startKey,
            focusOffset: 0,
            isBackward: false
        }),
        forceSelection: true
    });
}
