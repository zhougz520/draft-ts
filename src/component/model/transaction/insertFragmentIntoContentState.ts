import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { BlockMap, BlockMapBuilder } from '../immutable/BlockMapBuilder';
import { CharacterMetadata } from '../immutable/CharacterMetadata';
import { generateRandomKey } from '../keys/generateRandomKey';

import { insertIntoList } from './insertIntoList';

import { List } from 'immutable';
import { utils } from '../../utils/fbjs';
const { invariant } = utils;

export function insertFragmentIntoContentState(
    contentState: ContentState,
    selectionState: SelectionState,
    fragment: BlockMap
): ContentState {
    invariant(
        selectionState.isCollapsed(),
        '`insertFragment` should only be called with a collapsed selection state.'
    );

    const targetKey: string = selectionState.getStartKey();
    const targetOffset: number = selectionState.getStartOffset();

    const blockMap: BlockMap = contentState.getBlockMap();

    const fragmentSize: number = fragment.size;
    let finalKey: string = targetKey;
    let finalOffset: number = targetOffset;

    if (fragmentSize === 1) {
        const targetBlock: ContentBlock = blockMap.get(targetKey);
        const pastedBlock: ContentBlock = fragment.first();
        const text: string = targetBlock.getText();
        const chars: List<CharacterMetadata> = targetBlock.getCharacterList();

        const newBlock: ContentBlock = targetBlock.merge({
            text: (
                text.slice(0, targetOffset) +
                pastedBlock.getText() +
                text.slice(targetOffset)
            ),
            characterList: insertIntoList(
                chars,
                pastedBlock.getCharacterList(),
                targetOffset
            ),
            data: pastedBlock.getData()
        }) as ContentBlock;

        finalKey = targetKey;
        finalOffset = targetOffset + pastedBlock.getText().length;

        return contentState.merge({
            blockMap: blockMap.set(targetKey, newBlock),
            selectionBefore: selectionState,
            selectionAfter: selectionState.merge({
                anchorKey: finalKey,
                anchorOffset: finalOffset,
                focusKey: finalKey,
                focusOffset: finalOffset,
                isBackward: false
            })
        }) as ContentState;
    }

    const newBlockArr: any[] = [];

    contentState.getBlockMap().forEach(
        (block: ContentBlock, blockKey: string) => {
            if (blockKey !== targetKey) {
                newBlockArr.push(block);

                return;
            }

            const text: string = block.getText();
            const chars: List<CharacterMetadata> = block.getCharacterList();

            // Modify head portion of block.
            const blockSize: number = text.length;
            const headText: string = text.slice(0, targetOffset);
            const headCharacters = chars.slice(0, targetOffset);
            const appendToHead: ContentBlock = fragment.first();

            const modifiedHead: ContentBlock = block.merge({
                text: headText + appendToHead.getText(),
                characterList: headCharacters.concat(appendToHead.getCharacterList()),
                type: headText ? block.getType() : appendToHead.getType(),
                data: appendToHead.getData()
            }) as ContentBlock;

            newBlockArr.push(modifiedHead);

            // Insert fragment blocks after the head and before the tail.
            fragment.slice(1, fragmentSize - 1).forEach(
                (fragmentBlock: ContentBlock) => {
                    newBlockArr.push(fragmentBlock.set('key', generateRandomKey()));
                }
            );

            // Modify tail portion of block.
            const tailText: string = text.slice(targetOffset, blockSize);
            const tailCharacters = chars.slice(targetOffset, blockSize);
            const prependToTail: ContentBlock = fragment.last();
            finalKey = generateRandomKey();

            const modifiedTail: ContentBlock = prependToTail.merge({
                key: finalKey,
                text: prependToTail.getText() + tailText,
                characterList: prependToTail
                    .getCharacterList()
                    .concat(tailCharacters),
                data: prependToTail.getData()
            }) as ContentBlock;

            newBlockArr.push(modifiedTail);
        }
    );

    finalOffset = fragment.last().getLength();

    return contentState.merge({
        blockMap: BlockMapBuilder.createFromArray(newBlockArr),
        selectionBefore: selectionState,
        selectionAfter: selectionState.merge({
            anchorKey: finalKey,
            anchorOffset: finalOffset,
            focusKey: finalKey,
            focusOffset: finalOffset,
            isBackward: false
        })
    }) as ContentState;
}
