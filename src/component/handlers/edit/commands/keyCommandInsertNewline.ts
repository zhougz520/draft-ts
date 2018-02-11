import { EditorState } from '../../../model/immutable/EditorState';
import { DraftModifier } from '../../../model/modifier/DraftModifier';
import { ContentState } from '../../../model/immutable/ContentState';

export function keyCommandInsertNewline(editorState: EditorState): EditorState {
    const contentState: ContentState = DraftModifier.splitBlock(
        editorState.getCurrentContent(),
        editorState.getSelection()
    );

    return EditorState.push(editorState, contentState, 'split-block');
}
