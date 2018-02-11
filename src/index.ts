import { DraftEditor } from './component/base/DraftEditor';
import { EditorState } from './component/model/immutable/EditorState';
import { RichTextEditorUtil } from './component/model/modifier/RichTextEditorUtil';
import * as DefaultDraftBlockStyle from './component/model/immutable/DefaultDraftBlockStyle';
import * as DefaultDraftInlineStyle from './component/model/immutable/DefaultDraftInlineStyle';

export const DraftPublic = {
    DefaultDraftBlockStyle,
    DefaultDraftInlineStyle,

    Editor: DraftEditor,
    EditorState,

    RichUtils: RichTextEditorUtil
};
