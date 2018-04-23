import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { CharacterMetadata } from '../immutable/CharacterMetadata';
import { BlockMap } from '../immutable/BlockMapBuilder';

import { generateRandomKey } from '../keys/generateRandomKey';
import { utils } from '../../utils/fbjs';
import { List } from 'immutable';
const { invariant } = utils;

export function splitBlockInContentState(
    contentState: ContentState,
    selectionState: SelectionState
): ContentState {
    invariant(selectionState.isCollapsed(), 'Selection range must be collapsed.');

    const key: string = selectionState.getAnchorKey();
    const offset: number = selectionState.getAnchorOffset();
    const blockMap: BlockMap = contentState.getBlockMap();
    const blockToSplit: ContentBlock = blockMap.get(key);

    const text: string = blockToSplit.getText();
    const chars: List<CharacterMetadata> = blockToSplit.getCharacterList();

    const blockAbove: ContentBlock = blockToSplit.merge({
        text: text.slice(0, offset),
        characterList: chars.slice(0, offset)
    }) as ContentBlock;
    const dataAbove = blockAbove.getData();

    const keyBelow: string = generateRandomKey();
    const blockBelow: ContentBlock = blockAbove.merge({
        key: keyBelow,
        text: text.slice(offset),
        characterList: chars.slice(offset),
        // TODO 换行会清空data样式，list模式会有问题
        data: dataAbove.delete('text-align')
    }) as ContentBlock;

    const blocksBefore = blockMap.toSeq().takeUntil((v) => v === blockToSplit);
    const blocksAfter = blockMap
        .toSeq()
        .skipUntil((v) => v === blockToSplit)
        .rest();
    const newBlocks = blocksBefore
        .concat(
        [[blockAbove.getKey(), blockAbove], [blockBelow.getKey(), blockBelow]],
        blocksAfter
        )
        .toOrderedMap();

    return contentState.merge({
        blockMap: newBlocks,
        selectionBefore: selectionState,
        selectionAfter: selectionState.merge({
            anchorKey: keyBelow,
            anchorOffset: 0,
            focusKey: keyBelow,
            focusOffset: 0,
            isBackward: false
        })
    }) as ContentState;
}
