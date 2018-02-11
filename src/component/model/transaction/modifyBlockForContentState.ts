import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { BlockMap } from '../immutable/BlockMapBuilder';

import { Map } from 'immutable';

export function modifyBlockForContentState(
    contentState: ContentState,
    selectionState: SelectionState,
    operation: (block: ContentBlock) => ContentBlock
): ContentState {
    const startKey: string = selectionState.getStartKey();
    const endKey: string = selectionState.getEndKey();
    const blockMap: BlockMap = contentState.getBlockMap();
    const newBlocks: any = blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat(Map([[endKey, blockMap.get(endKey)]]))
        .map(operation as any);

    return contentState.merge({
        blockMap: blockMap.merge(newBlocks),
        selectionBefore: selectionState,
        selectionAfter: selectionState
    }) as ContentState;
}
