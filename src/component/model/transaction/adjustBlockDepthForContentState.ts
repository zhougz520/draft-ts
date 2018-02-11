import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { BlockMap } from '../immutable/BlockMapBuilder';
import { ContentBlock } from '../immutable/ContentBlock';

/**
 * 修改Block的层级数
 * @param contentState
 * @param selectionState
 * @param adjustment
 * @param maxDepth 最大层级
 */
export function adjustBlockDepthForContentState(
    contentState: ContentState,
    selectionState: SelectionState,
    adjustment: number,
    maxDepth: number
): ContentState {
    const startKey: string = selectionState.getStartKey();
    const endKey: string = selectionState.getEndKey();
    let blockMap: BlockMap = contentState.getBlockMap();
    const blocks: any = blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .map((block: ContentBlock) => {
            let depth: number = block.getDepth() + adjustment;
            depth = Math.max(0, Math.min(depth, maxDepth));

            return block.set('depth', depth);
        });

    blockMap = blockMap.merge(blocks);

    return contentState.merge({
        blockMap,
        selectionBefore: selectionState,
        selectionAfter: selectionState
    }) as ContentState;
}
