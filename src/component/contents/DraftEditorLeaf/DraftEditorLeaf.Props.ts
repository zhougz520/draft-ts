import { ContentBlock } from '../../model/immutable/ContentBlock';
import { SelectionState } from '../../model/immutable/SelectionState';
import { DraftInlineStyle } from '../../model/immutable/CharacterMetadata';

export interface IDraftEditorLeafProps {
    // 包含Leaf的block
    block: ContentBlock;

    // TODO customStyleMap\customStyleFn

    // 渲染后是否强制DOM选择
    forceSelection: boolean;

    // 这个Leaf是否是其中的最后一块
    isLast: boolean;

    offsetKey: string;

    // 当前的'SelectionState'，用来表示一个选择范围
    selection?: SelectionState;

    // 字符串在Block中的锚点位置
    start: number;

    styleSet: DraftInlineStyle;

    // Leaf中呈现的文本
    text: string;

    inlineStyleRenderMap: any;
}
