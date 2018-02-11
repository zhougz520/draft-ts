import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { BlockMap } from '../immutable/BlockMapBuilder';
import { ContentBlock } from '../immutable/ContentBlock';
import { CharacterMetadata } from '../immutable/CharacterMetadata';

import { Map, List } from 'immutable';

export function removeRangeFromContentState(
    contentState: ContentState,
    selectionState: SelectionState
): ContentState {
    if (selectionState.isCollapsed()) {
        return contentState;
    }

    let blockMap: BlockMap = contentState.getBlockMap();
    const startKey: string = selectionState.getStartKey();
    const startOffset: number = selectionState.getStartOffset();
    const endKey: string = selectionState.getEndKey();
    const endOffset: number = selectionState.getEndOffset();

    const startBlock: ContentBlock = blockMap.get(startKey);
    const endBlock: ContentBlock = blockMap.get(endKey);
    let characterList: List<CharacterMetadata>;

    if (startBlock === endBlock) {
        characterList = removeFromList(
            startBlock.getCharacterList(),
            startOffset,
            endOffset
        );
    } else {
        characterList = startBlock
            .getCharacterList()
            .slice(0, startOffset)
            .concat(endBlock.getCharacterList().slice(endOffset)) as List<CharacterMetadata>;
    }

    const modifiedStart: ContentBlock = startBlock.merge({
        text:
            startBlock.getText().slice(0, startOffset) +
            endBlock.getText().slice(endOffset),
        characterList
    }) as ContentBlock;

    const newBlocks: any = blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat(Map([[endKey, null]]))
        .map((_, k) => {
            return k === startKey ? modifiedStart : null;
        });

    blockMap = blockMap.merge(newBlocks).filter((block) => !!block) as BlockMap;

    return contentState.merge({
        blockMap,
        selectionBefore: selectionState,
        selectionAfter: selectionState.merge({
            anchorKey: startKey,
            anchorOffset: startOffset,
            focusKey: startKey,
            focusOffset: startOffset,
            isBackward: false
        }) as SelectionState
    }) as ContentState;
}

function removeFromList(
    targetList: List<CharacterMetadata>,
    startOffset: number,
    endOffset: number
): List<CharacterMetadata> {
    if (startOffset === 0) {
        while (startOffset < endOffset) {
            targetList = targetList.shift();
            startOffset++;
        }
    } else if (endOffset === targetList.count()) {
        while (endOffset > startOffset) {
            targetList = targetList.pop();
            endOffset--;
        }
    } else {
        const head = targetList.slice(0, startOffset);
        const tail = targetList.slice(endOffset);
        targetList = head.concat(tail).toList();
    }

    return targetList;
}
