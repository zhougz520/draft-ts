import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { BlockMap } from '../immutable/BlockMapBuilder';
import { CharacterMetadata } from '../immutable/CharacterMetadata';

import { insertIntoList } from './insertIntoList';

import { Repeat } from 'immutable';
import { utils } from '../../utils/fbjs';
const { invariant } = utils;

export function insertTextIntoContentState(
    contentState: ContentState,
    selectionState: SelectionState,
    text: string,
    characterMetadata: CharacterMetadata
): ContentState {
    invariant(
        selectionState.isCollapsed(),
        '`insertText` should only be called with a collapsed range.'
    );

    const len: number = text.length;
    if (!len) {
        return contentState;
    }

    const blockMap: BlockMap = contentState.getBlockMap();
    const key: string = selectionState.getStartKey();
    const offset: number = selectionState.getStartOffset();
    const block: ContentBlock = blockMap.get(key);
    const blockText: string = block.getText();

    const newBlock: ContentBlock = block.merge({
        text:
            blockText.slice(0, offset) +
            text +
            blockText.slice(offset, block.getLength()),
        characterList: insertIntoList(
            block.getCharacterList(),
            Repeat(characterMetadata, len).toList(),
            offset
        )
    }) as ContentBlock;

    const newOffset: number = offset + len;

    return contentState.merge({
        blockMap: blockMap.set(key, newBlock) as BlockMap,
        selectionAfter: selectionState.merge({
            anchorOffset: newOffset,
            focusOffset: newOffset
        }) as SelectionState
    }) as ContentState;
}
