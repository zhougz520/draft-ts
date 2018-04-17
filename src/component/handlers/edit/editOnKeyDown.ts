import { DraftEditor } from '../../base/DraftEditor';

import { EditorState } from '../../model/immutable/EditorState';

import { DraftEditorCommand } from '../../model/constants/DraftEditorCommand';
import { DraftModifier } from '../../model/modifier/DraftModifier';

import { keyCommandInsertNewline } from './commands/keyCommandInsertNewline';
import { keyCommandMoveSelectionToEndOfBlock } from './commands/keyCommandMoveSelectionToEndOfBlock';
import { keyCommandMoveSelectionToStartOfBlock } from './commands/keyCommandMoveSelectionToStartOfBlock';
import { keyCommandPlainBackspace } from './commands/keyCommandPlainBackspace';

import { KeyBindingUtil } from '../../utils/KeyBindingUtil';
import { utils } from '../../utils/fbjs';

const { isOptionKeyCommand } = KeyBindingUtil;
const { Keys, UserAgent } = utils;
const isChrome: boolean = UserAgent.isBrowser('Chrome');

/**
 * Map a `DraftEditorCommand` command value to a corresponding function.
 */
function onKeyCommand(
    command: DraftEditorCommand | string,
    editorState: EditorState
): EditorState {
    switch (command) {
        case 'redo':
        // TODO return EditorState.redo(editorState);
        case 'delete':
        // TODO return keyCommandPlainDelete(editorState);
        case 'delete-word':
        // TODO return keyCommandDeleteWord(editorState);
        case 'backspace':
            return keyCommandPlainBackspace(editorState);
        case 'backspace-word':
        // TODO return keyCommandBackspaceWord(editorState);
        case 'backspace-to-start-of-line':
        // TODO return keyCommandBackspaceToStartOfLine(editorState);
        case 'split-block':
            return keyCommandInsertNewline(editorState);
        case 'transpose-characters':
        // TODO return keyCommandTransposeCharacters(editorState);
        case 'move-selection-to-start-of-block':
            return keyCommandMoveSelectionToStartOfBlock(editorState);
        case 'move-selection-to-end-of-block':
            return keyCommandMoveSelectionToEndOfBlock(editorState);
        case 'secondary-cut':
        // TODO return SecondaryClipboard.cut(editorState);
        case 'secondary-paste':
        // TODO return SecondaryClipboard.paste(editorState);
        default:
            return editorState;
    }
}

// TODO editOnKeyDown
export function editOnKeyDown(editor: DraftEditor, e: any): void {
    const keyCode: any = e.which;
    const editorState: EditorState = editor._latestEditorState;

    switch (keyCode) {
        case Keys.RETURN:
            e.preventDefault();
            break;
        case Keys.ESC:
            e.preventDefault();

            return;
        case Keys.TAB:
            editor.props.onTab && editor.props.onTab(e);

            return;
        case Keys.UP:
        case Keys.RIGHT:
        case Keys.DOWN:
        case Keys.LEFT:
            return;
        case Keys.SPACE:
            // Handling for OSX where option + space scrolls.
            if (isChrome && isOptionKeyCommand(e)) {
                e.preventDefault();
                // Insert a nbsp into the editor.
                const contentState = DraftModifier.replaceText(
                    editorState.getCurrentContent(),
                    editorState.getSelection(),
                    '\u00a0'
                );
                editor.update(
                    EditorState.push(editorState, contentState, 'insert-characters')
                );

                return;
            }
    }

    const command: string | null | undefined = editor.props.keyBindingFn && editor.props.keyBindingFn(e);

    // If no command is specified, allow keydown event to continue.
    if (!command) {
        return;
    }

    if (command === 'undo') {
        // Since undo requires some special updating behavior to keep the editor
        // in sync, handle it separately.
        // TODO keyCommandUndo(e, editorState, editor.update);
        return;
    }

    // At this point, we know that we're handling a command of some kind, so
    // we don't want to insert a character following the keydown.
    e.preventDefault();

    // TODO handleKeyCommand
    if (
        editor.props.handleKeyCommand &&
        editor.props.handleKeyCommand(command, editorState) === true
    ) {
        return;
    }

    const newState: EditorState = onKeyCommand(command, editorState);
    if (newState !== editorState) {
        editor.update(newState);
    }
}
