import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { BlockMap } from '../immutable/BlockMapBuilder';
import { ContentBlock } from '../immutable/ContentBlock';
import { listStyleTypeMap } from '../immutable/DefaultDraftBlockStyle';

import { Map, List } from 'immutable';

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

            const data: Map<any, any> = block.getData();
            // 当前的blockType
            const blockType: string = block.getType();
            // 当前的styleType
            const styleType: string | undefined = data.get(blockType);
            if (styleType !== undefined) {
                // 当前blockType对应的styleType的List
                const listStyleType: List<string> = listStyleTypeMap.get(blockType);
                const listSize: number = listStyleType.size;
                const keyOfStyleType: number = listStyleType.keyOf(styleType);
                // 计算tab下一个样式的key
                const nextKeyOfStyleType: number = (keyOfStyleType + adjustment) % listSize;
                let config: Map<string, string> = Map();
                config = config.set(blockType, listStyleType.get(nextKeyOfStyleType));
                block = block.merge({ data: data.merge(config) }) as ContentBlock;
            }

            return block.set('depth', depth);
        });

    blockMap = blockMap.merge(blocks);

    return contentState.merge({
        blockMap,
        selectionBefore: selectionState,
        selectionAfter: selectionState
    }) as ContentState;
}
