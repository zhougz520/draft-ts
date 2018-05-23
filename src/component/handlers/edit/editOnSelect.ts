import * as ReactDOM from 'react-dom';

import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';

import { getDraftEditorSelection } from '../../selection/getDraftEditorSelection';
import { IDOMDerivedSelection } from '../../selection/DOMDerivedSelection';

import { utils } from '../../utils/fbjs';
const { invariant } = utils;

/**
 * 选中事件
 * @param editor 'DraftEditor'实例
 */
export function editOnSelect(editor: DraftEditor): void {
    if (
        editor._blockSelectEvents || editor._latestEditorState !== editor.props.editorState
    ) {
        return;
    }

    let editorState: EditorState = editor.props.editorState;
    const editorNode: Element = ReactDOM.findDOMNode(editor.editorContainer as HTMLElement) as Element;
    invariant(editorNode, 'Missing editorNode');
    invariant(
        editorNode.firstChild instanceof HTMLElement,
        'editorNode.firstChild is not an HTMLElement'
    );
    const documentSelection: IDOMDerivedSelection = getDraftEditorSelection(
        editorState, editorNode.firstChild as HTMLElement
    );
    const updatedSelectionState: SelectionState = documentSelection.selectionState;

    if (updatedSelectionState !== editorState.getSelection()) {
        if (documentSelection.needsRecovery) {
            editorState = EditorState.forceSelection(
                editorState,
                updatedSelectionState
            );
        } else {
            editorState = EditorState.acceptSelection(
                editorState,
                updatedSelectionState
            );
        }
        editor.update(editorState);
    }
}
