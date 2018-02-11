import { OrderedMap } from 'immutable';

import { ContentBlock } from './ContentBlock';

export type BlockMap = OrderedMap<string, ContentBlock>;

export const BlockMapBuilder = {
    createFromArray(blocks: ContentBlock[]): BlockMap {
        return OrderedMap(blocks.map((block: ContentBlock) => [block.getKey(), block]));
    }
};
