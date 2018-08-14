import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { SelectionState } from '../../model/immutable/SelectionState';
import { ContentState } from '../../model/immutable/ContentState';
import { BlockMap } from '../../model/immutable/BlockMapBuilder';
import { DraftModifier } from '../../model/modifier/DraftModifier';
import { getFragmentFromSelection } from './getFragmentFromSelection';

import { utils } from '../../utils/fbjs';
const { Style, getScrollPosition } = utils;

export function editOnCut(editor: DraftEditor, e: any): void {
    const editorState: EditorState = editor._latestEditorState;
    const selection: SelectionState = editorState.getSelection();

    // No selection, so there's nothing to cut.
    if (selection.isCollapsed()) {
        e.preventDefault();

        return;
    }

    // Track the current scroll position so that it can be forced back in place
    // after the editor regains control of the DOM.
    // $FlowFixMe e.target should be an instanceof Node
    const scrollParent = Style.getScrollParent(e.target);
    const { x, y } = getScrollPosition(scrollParent);

    const fragment: BlockMap | null = getFragmentFromSelection(editorState);
    editor.setClipboard(fragment);

    // Set `cut` mode to disable all event handling temporarily.
    editor.setMode('cut');

    // Let native `cut` behavior occur, then recover control.
    setTimeout(() => {
        editor.restoreEditorDOM({ x, y });
        editor.exitCurrentMode();
        editor.update(removeFragment(editorState));
    }, 0);
}

function removeFragment(editorState: EditorState): EditorState {
    const newContent: ContentState = DraftModifier.removeRange(
        editorState.getCurrentContent(),
        editorState.getSelection()
    );

    return EditorState.push(editorState, newContent, 'remove-range');
}
