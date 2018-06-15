import { DraftEditor } from './component/base/DraftEditor';
import { EditorState } from './component/model/immutable/EditorState';
import { ContentState } from './component/model/immutable/ContentState';
import { RichTextEditorUtil } from './component/model/modifier/RichTextEditorUtil';
import * as DefaultDraftBlockStyle from './component/model/immutable/DefaultDraftBlockStyle';
import * as DefaultDraftInlineStyle from './component/model/immutable/DefaultDraftInlineStyle';

import * as InlineUtils from './component/utils/collection/inline';
import * as BlockUtils from './component/utils/collection/block';

import { utils } from './component/utils/fbjs';

import { convertFromDraftStateToRaw } from './component/model/encoding/convertFromDraftStateToRaw';
import { convertFromRawToDraftState } from './component/model/encoding/convertFromRawToDraftState';

export const DraftPublic = {
    DefaultDraftBlockStyle,
    DefaultDraftInlineStyle,

    Editor: DraftEditor,
    EditorState,
    ContentState,

    RichUtils: RichTextEditorUtil,

    InlineUtils,
    BlockUtils,
    FbjsUtils: utils,

    convertFromDraftStateToRaw,
    convertFromRawToDraftState
};
