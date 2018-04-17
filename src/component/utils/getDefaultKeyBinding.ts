import { DraftEditorCommand } from '../model/constants/DraftEditorCommand';

import { KeyBindingUtil } from './KeyBindingUtil';
import { utils } from './fbjs';
const { Keys, UserAgent } = utils;

const isOSX: boolean = UserAgent.isPlatform('Mac OS X');
const isWindows: boolean = UserAgent.isPlatform('Windows');
const shouldFixFirefoxMovement: boolean = isOSX && UserAgent.isBrowser('Firefox < 29');

const { hasCommandModifier, isCtrlKeyCommand } = KeyBindingUtil;

function shouldRemoveWord(e: any): boolean {
    return (isOSX && e.altKey) || isCtrlKeyCommand(e);
}

function getZCommand(e: any): DraftEditorCommand | null {
    if (!hasCommandModifier(e)) {
        return null;
    }

    return e.shiftKey ? 'redo' : 'undo';
}

function getDeleteCommand(e: any): DraftEditorCommand | null {
    // Allow default "cut" behavior for Windows on Shift + Delete.
    if (isWindows && e.shiftKey) {
        return null;
    }

    return shouldRemoveWord(e) ? 'delete-word' : 'delete';
}

function getBackspaceCommand(e: any): DraftEditorCommand | null {
    if (hasCommandModifier(e) && isOSX) {
        return 'backspace-to-start-of-line';
    }

    return shouldRemoveWord(e) ? 'backspace-word' : 'backspace';
}

/**
 * Retrieve a bound key command for the given event.
 */
// TODO getDefaultKeyBinding
export function getDefaultKeyBinding(
    e: any
): DraftEditorCommand | null {
    switch (e.keyCode) {
        case 66: // B
            return hasCommandModifier(e) ? 'bold' : null;
        case 68: // D
            return isCtrlKeyCommand(e) ? 'delete' : null;
        case 72: // H
            return isCtrlKeyCommand(e) ? 'backspace' : null;
        case 73: // I
            return hasCommandModifier(e) ? 'italic' : null;
        case 74: // J
            return hasCommandModifier(e) ? 'code' : null;
        case 75: // K
            return !isWindows && isCtrlKeyCommand(e) ? 'secondary-cut' : null;
        case 77: // M
            return isCtrlKeyCommand(e) ? 'split-block' : null;
        case 79: // O
            return isCtrlKeyCommand(e) ? 'split-block' : null;
        case 84: // T
            return isOSX && isCtrlKeyCommand(e) ? 'transpose-characters' : null;
        case 85: // U
            return hasCommandModifier(e) ? 'underline' : null;
        case 87: // W
            return isOSX && isCtrlKeyCommand(e) ? 'backspace-word' : null;
        case 89: // Y
            if (isCtrlKeyCommand(e)) {
                return isWindows ? 'redo' : 'secondary-paste';
            }

            return null;
        case 90: // Z
            return getZCommand(e) || null;
        case Keys.RETURN:
            return 'split-block';
        case Keys.DELETE:
            return getDeleteCommand(e);
        case Keys.BACKSPACE:
            return getBackspaceCommand(e);
        // LEFT/RIGHT handlers serve as a workaround for a Firefox bug.
        case Keys.LEFT:
            return shouldFixFirefoxMovement && hasCommandModifier(e)
                ? 'move-selection-to-start-of-block'
                : null;
        case Keys.RIGHT:
            return shouldFixFirefoxMovement && hasCommandModifier(e)
                ? 'move-selection-to-end-of-block'
                : null;
        default:
            return null;
    }
}
