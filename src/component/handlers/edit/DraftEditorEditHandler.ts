import { editOnBeforeInput } from './editOnBeforeInput';
import { editOnBlur } from './editOnBlur';
import { editOnCompositionStart } from './editOnCompositionStart';
import { editOnFocus } from './editOnFocus';
import { editOnInput } from './editOnInput';
import { editOnKeyDown } from './editOnKeyDown';
import { editOnSelect } from './editOnSelect';

/**
 * edit事件的入口函数，绑定各种事件。
 */
export const DraftEditorEditHandler: any = {
    onBeforeInput: editOnBeforeInput,
    onBlur: editOnBlur,
    onCompositionStart: editOnCompositionStart,
    onFocus: editOnFocus,
    onInput: editOnInput,
    onKeyDown: editOnKeyDown,
    onSelect: editOnSelect
};
