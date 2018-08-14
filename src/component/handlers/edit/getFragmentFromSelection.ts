import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';
import { BlockMap } from '../../model/immutable/BlockMapBuilder';
import { getContentStateFragment } from '../../model/transaction/getContentStateFragment';

export function getFragmentFromSelection(editorState: EditorState): BlockMap | null {
    const selectionState: SelectionState = editorState.getSelection();

    if (selectionState.isCollapsed()) {
        return null;
    }

    return getContentStateFragment(
        editorState.getCurrentContent(),
        selectionState
    );
}
