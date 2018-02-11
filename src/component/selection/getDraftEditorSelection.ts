import { IDOMDerivedSelection } from './DOMDerivedSelection';
import { EditorState } from '../model/immutable/EditorState';
import { SelectionState } from '../model/immutable/SelectionState';

import { getDraftEditorSelectionWithNodes } from './getDraftEditorSelectionWithNodes';

/**
 * 将当前选择范围转换为锚点\焦点
 * @param editorState
 * @param root
 */
export function getDraftEditorSelection(editorState: EditorState, root: HTMLElement): IDOMDerivedSelection {
    const selection: Selection = window.getSelection();

    if (selection.rangeCount === 0) {
        return {
            selectionState: editorState.getSelection().set('hasFocus', false) as SelectionState,
            needsRecovery: false
        };
    }

    return getDraftEditorSelectionWithNodes(
        editorState,
        root,
        selection.anchorNode,
        selection.anchorOffset,
        selection.focusNode,
        selection.focusOffset
    );
}
