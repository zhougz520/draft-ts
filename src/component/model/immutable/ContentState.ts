// 这里必须引入所有的immutable，不然会报BlockMap找不到OrderedMap。这应该是TS的一个未关闭BUG
// error TS4029: Public property 'getBlockMap' of exported class has or is using name 'OrderedMap' but cannot be named.
import * as immutable from 'immutable';

import { SelectionState } from './SelectionState';
import { ContentBlock } from './ContentBlock';
import { CharacterMetadata } from './CharacterMetadata';

import { BlockMap, BlockMapBuilder } from './BlockMapBuilder';
import { generateRandomKey } from '../keys/generateRandomKey';

const { Record, List, Repeat } = immutable;

const defaultRecord: {
    blockMap: BlockMap | null,
    selectionBefore: SelectionState | null,
    selectionAfter: SelectionState | null,
} = {
        blockMap: null,
        selectionBefore: null,
        selectionAfter: null
    };

export const ContentStateRecord: immutable.Record.Class = Record(defaultRecord);

export class ContentState extends ContentStateRecord {
    static createFromBlockArray(blocks: ContentBlock[] | { contentBlocks: ContentBlock[] }): ContentState {
        const theBlocks: ContentBlock[] = Array.isArray(blocks) ? blocks : blocks.contentBlocks;
        const blockMap: BlockMap = BlockMapBuilder.createFromArray(theBlocks);
        const selectionState: SelectionState = blockMap.isEmpty()
            ? new SelectionState()
            : SelectionState.createEmpty(blockMap.first().getKey());

        return new ContentState({
            blockMap,
            selectionBefore: selectionState,
            selectionAfter: selectionState
        });
    }

    static createFromText(text: string, delimiter: string | RegExp = /\r\n?|\n/g): ContentState {
        const strings: string[] = text.split(delimiter);
        const blocks: ContentBlock[] = strings.map(
            (block: string) => {
                return new ContentBlock({
                    key: generateRandomKey(),
                    text: block,
                    type: 'unstyled',
                    characterList: List(Repeat(CharacterMetadata.EMPTY, block.length))
                });
            }
        );

        return ContentState.createFromBlockArray(blocks);
    }

    getBlockMap(): BlockMap {
        return this.get('blockMap');
    }

    getSelectionBefore(): SelectionState {
        return this.get('selectionBefore');
    }

    getSelectionAfter(): SelectionState {
        return this.get('selectionAfter');
    }

    getBlockForKey(key: string): ContentBlock {
        const block: ContentBlock = this.getBlockMap().get(key);

        return block;
    }

    getKeyBefore(key: string): string | null {
        return this.getBlockMap()
            .reverse()
            .keySeq()
            .skipUntil((v: any) => v === key)
            .skip(1)
            .first();
    }

    getKeyAfter(key: string): string | null {
        return this.getBlockMap()
            .keySeq()
            .skipUntil((v: any) => v === key)
            .skip(1)
            .first();
    }

    getBlockBefore(key: string): ContentBlock | null {
        return this.getBlockMap()
            .reverse()
            .skipUntil((_: any, k: any) => k === key)
            .skip(1)
            .first();
    }

    getBlockAfter(key: string): ContentBlock | null {
        return this.getBlockMap()
            .skipUntil((_: any, k: any) => k === key)
            .skip(1)
            .first();
    }

    getBlocksAsArray(): ContentBlock[] {
        return this.getBlockMap().toArray();
    }

    getFirstBlock(): ContentBlock {
        return this.getBlockMap().first();
    }

    getLastBlock(): ContentBlock {
        return this.getBlockMap().last();
    }

    getPlainText(delimiter?: string): string {
        return this.getBlockMap()
            .map((block) => {
                return block ? block.getText() : '';
            })
            .join(delimiter || '\n');
    }

    hasText(): boolean {
        const blockMap: BlockMap = this.getBlockMap();

        return blockMap.size > 1 || blockMap.first().getLength() > 0;
    }
}
