import { editOnBeforeInput } from './editOnBeforeInput';
import { editOnBlur } from './editOnBlur';
import { editOnCompositionStart } from './editOnCompositionStart';
import { editOnCopy } from './editOnCopy';
import { editOnCut } from './editOnCut';
import { editOnFocus } from './editOnFocus';
import { editOnInput } from './editOnInput';
import { editOnKeyDown } from './editOnKeyDown';
import { editOnPaste } from './editOnPaste';
import { editOnSelect } from './editOnSelect';

/**
 * edit事件的入口函数，绑定各种事件。
 */
export const DraftEditorEditHandler: any = {
    onBeforeInput: editOnBeforeInput,
    onBlur: editOnBlur,
    onCompositionStart: editOnCompositionStart,
    onCopy: editOnCopy,
    onCut: editOnCut,
    onFocus: editOnFocus,
    onInput: editOnInput,
    onKeyDown: editOnKeyDown,
    onPaste: editOnPaste,
    onSelect: editOnSelect
};
