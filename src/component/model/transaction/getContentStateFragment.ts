import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { BlockMap } from '../immutable/BlockMapBuilder';
import { CharacterMetadata } from '../immutable/CharacterMetadata';
import { generateRandomKey } from '../keys/generateRandomKey';

import { List } from 'immutable';

export function getContentStateFragment(contentState: ContentState, selectionState: SelectionState): BlockMap {
    const startKey: string = selectionState.getStartKey();
    const startOffset: number = selectionState.getStartOffset();
    const endKey: string = selectionState.getEndKey();
    const endOffset: number = selectionState.getEndOffset();

    // TODO withoutEntities removeEntitiesAtEdges
    const contentWithoutEdgeEntities: ContentState = contentState.set('selectionAfter', selectionState) as ContentState;

    const blockMap: BlockMap = contentWithoutEdgeEntities.getBlockMap();
    const blockKeys = blockMap.keySeq();
    const startIndex: number = blockKeys.indexOf(startKey);
    const endIndex: number = blockKeys.indexOf(endKey) + 1;

    const slice: any = blockMap.slice(startIndex, endIndex).map((block: ContentBlock, blockKey: string) => {
        const newKey: string = generateRandomKey();

        const text: string = block.getText();
        const chars: List<CharacterMetadata> = block.getCharacterList();

        if (startKey === endKey) {
            return block.merge({
                key: newKey,
                text: text.slice(startOffset, endOffset),
                characterList: chars.slice(startOffset, endOffset)
            });
        }

        if (blockKey === startKey) {
            return block.merge({
                key: newKey,
                text: text.slice(startOffset),
                characterList: chars.slice(startOffset)
            });
        }

        if (blockKey === endKey) {
            return block.merge({
                key: newKey,
                text: text.slice(0, endOffset),
                characterList: chars.slice(0, endOffset)
            });
        }

        return block.set('key', newKey);
    });

    return slice.toOrderedMap();
}
