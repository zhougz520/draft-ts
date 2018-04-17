import { EditorState } from '../../../model/immutable/EditorState';
import { ContentState } from '../../../model/immutable/ContentState';
import { SelectionState } from '../../../model/immutable/SelectionState';

import { moveSelectionBackward } from '../../../model/transaction/moveSelectionBackward';
import { removeTextWithStrategy } from '../../../model/transaction/removeTextWithStrategy';

import { utils } from '../../../utils/fbjs';
const { UnicodeUtils } = utils;

/**
 * Remove the selected range. If the cursor is collapsed, remove the preceding
 * character. This operation is Unicode-aware, so removing a single character
 * will remove a surrogate pair properly as well.
 */
export function keyCommandPlainBackspace(editorState: EditorState): EditorState {
    const afterRemoval: ContentState = removeTextWithStrategy(
        editorState,
        (strategyState: EditorState) => {
            const selection: SelectionState = strategyState.getSelection();
            const content: ContentState = strategyState.getCurrentContent();
            const key: string = selection.getAnchorKey();
            const offset: number = selection.getAnchorOffset();
            const charBehind: string = content.getBlockForKey(key).getText()[offset - 1];

            return moveSelectionBackward(
                strategyState,
                charBehind ? UnicodeUtils.getUTF16Length(charBehind, 0) : 1
            );
        }
        // TODO 'backward',
    );

    if (afterRemoval === editorState.getCurrentContent()) {
        return editorState;
    }

    const selectionState: SelectionState = editorState.getSelection();

    return EditorState.push(
        editorState,
        afterRemoval.set('selectionBefore', selectionState) as ContentState,
        selectionState.isCollapsed() ? 'backspace-character' : 'remove-range'
    );
}
