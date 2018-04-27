import { ContentState } from '../../model/immutable/ContentState';
import { ContentBlock } from '../../model/immutable/ContentBlock';
import { SelectionState } from '../../model/immutable/SelectionState';

import { List } from 'immutable';

export interface IDraftEditorBlockProps {
    contentState: ContentState;

    block: ContentBlock;

    // TODO customStyleMap\customStyleFn

    tree: List<any>;

    offsetKey: string;

    selection: SelectionState;

    // TODO decorator\direction\blockProps
    forceSelection: boolean;

    startIndent?: boolean;

    inlineStyleRenderMap: any;

    blockStyleFn: Function;
}
