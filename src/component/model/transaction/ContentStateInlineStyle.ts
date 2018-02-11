import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { CharacterMetadata } from '../immutable/CharacterMetadata';

import { Map, OrderedMap, List } from 'immutable';

export const ContentStateInlineStyle: any = {
    add(
        contentState: ContentState,
        selectionState: SelectionState,
        inlineStyle: string
    ): ContentState {
        return modifyInlineStyle(contentState, selectionState, inlineStyle, true);
    },

    remove(
        contentState: ContentState,
        selectionState: SelectionState,
        inlineStyle: string
    ): ContentState {
        return modifyInlineStyle(contentState, selectionState, inlineStyle, false);
    }
};

function modifyInlineStyle(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: string,
    addOrRemove: boolean
): ContentState {
    const blockMap: OrderedMap<string, ContentBlock> = contentState.getBlockMap();
    const startKey: string = selectionState.getStartKey();
    const startOffset: number = selectionState.getStartOffset();
    const endKey: string = selectionState.getEndKey();
    const endOffset: number = selectionState.getEndOffset();

    const newBlocks: any = blockMap
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat(Map([[endKey, blockMap.get(endKey)]]))
        .map((block: any, blockKey: any) => {
            let sliceStart: number;
            let sliceEnd: number;

            if (startKey === endKey) {
                sliceStart = startOffset;
                sliceEnd = endOffset;
            } else {
                sliceStart = blockKey === startKey ? startOffset : 0;
                sliceEnd = blockKey === endKey ? endOffset : block.getLength();
            }

            let chars: List<CharacterMetadata> = block.getCharacterList();
            let current: CharacterMetadata;
            while (sliceStart < sliceEnd) {
                current = chars.get(sliceStart);
                chars = chars.set(
                    sliceStart,
                    addOrRemove
                        ? CharacterMetadata.applyStyle(current, inlineStyle)
                        : CharacterMetadata.removeStyle(current, inlineStyle)
                );
                sliceStart++;
            }

            return block.set('characterList', chars);
        });

    return contentState.merge({
        blockMap: blockMap.merge(newBlocks),
        selectionBefore: selectionState,
        selectionAfter: selectionState
    }) as ContentState;
}
