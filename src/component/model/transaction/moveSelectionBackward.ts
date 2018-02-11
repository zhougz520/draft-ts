import { EditorState } from '../immutable/EditorState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentState } from '../immutable/ContentState';
import { ContentBlock } from '../immutable/ContentBlock';

/**
 * Given a collapsed selection, move the focus `maxDistance` backward within
 * the selected block. If the selection will go beyond the start of the block,
 * move focus to the end of the previous block, but no further.
 *
 * This function is not Unicode-aware, so surrogate pairs will be treated
 * as having length 2.
 */
export function moveSelectionBackward(
    editorState: EditorState,
    maxDistance: number
): SelectionState {
    const selection: SelectionState = editorState.getSelection();
    const content: ContentState = editorState.getCurrentContent();
    const key: string = selection.getStartKey();
    const offset: number = selection.getStartOffset();

    let focusKey: string = key;
    let focusOffset: number = 0;

    if (maxDistance > offset) {
        const keyBefore: string | null = content.getKeyBefore(key);
        if (keyBefore == null) {
            focusKey = key;
        } else {
            focusKey = keyBefore;
            const blockBefore: ContentBlock = content.getBlockForKey(keyBefore);
            focusOffset = blockBefore.getText().length;
        }
    } else {
        focusOffset = offset - maxDistance;
    }

    return selection.merge({
        focusKey,
        focusOffset,
        isBackward: true
    }) as SelectionState;
}
