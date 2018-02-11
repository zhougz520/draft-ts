import { EditorState } from '../immutable/EditorState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentState } from '../immutable/ContentState';
import { DraftModifier } from '../modifier/DraftModifier';

/**
 * For a collapsed selection state, remove text based on the specified strategy.
 * If the selection state is not collapsed, remove the entire selected range.
 */
export function removeTextWithStrategy(
    editorState: EditorState,
    strategy: (editorState: EditorState) => SelectionState
    // TODO direction: DraftRemovalDirection
): ContentState {
    const selection: SelectionState = editorState.getSelection();
    const content: ContentState = editorState.getCurrentContent();
    let target: SelectionState = selection;
    if (selection.isCollapsed()) {
        // TODO direction
        if (editorState.isSelectionAtStartOfContent()) {
            return content;
        }

        target = strategy(editorState);
        if (target === selection) {
            return content;
        }
    }

    // TODO direction
    return DraftModifier.removeRange(content, target);
}
