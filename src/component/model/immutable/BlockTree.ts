import { ContentBlock } from './ContentBlock';
import { ContentState } from './ContentState';
import { CharacterMetadata } from './CharacterMetadata';
import { findRangesImmutable } from './findRangesImmutable';

import { Record, List, Repeat } from 'immutable';
import { utils } from '../../utils/fbjs';
const { emptyFunction } = utils;

const returnTrue: any = emptyFunction.thatReturnsTrue;

export interface ILeafRange {
    start: number | null;
    end: number | null;
}

const defaultLeafRange: ILeafRange = {
    start: null,
    end: null
};
const LeafRange: Record.Class = Record(defaultLeafRange);

const defaultDecoratorRange: {
    start: number | null;
    end: number | null;
    // TODO decoratorKey: string | null,
    leaves: List<ILeafRange> | null;
} = {
        start: null,
        end: null,
        leaves: null
    };
const DecoratorRange: Record.Class = Record(defaultDecoratorRange);

export const BlockTree: any = {
    /**
     * 为给定的ContentBlock对生成一个块树
     * @param contentState
     * @param block
     */
    generate(
        contentState: ContentState,
        block: ContentBlock
        // TODO decorator
    ): List<any> {
        const textLength: number = block.getLength();
        if (!textLength) {
            return List.of(
                new DecoratorRange({
                    start: 0,
                    end: 0,
                    leaves: List.of(new LeafRange({ start: 0, end: 0 }))
                })
            );
        }

        const leafSets: any = [];
        // TODO decorator
        const decorations: any = List(Repeat(null, textLength));

        const chars: List<CharacterMetadata> = block.getCharacterList();

        findRangesImmutable(decorations, areEqual, returnTrue, (start: number, end: number) => {
            leafSets.push(
                new DecoratorRange({
                    start,
                    end,
                    leaves: generateLeaves(chars.slice(start, end).toList(), start)
                })
            );
        });

        return List(leafSets);
    }
};

function generateLeaves(
    characters: List<CharacterMetadata>,
    offset: number
) {
    const leaves: any = [];
    const inlineStyles: List<any> = characters.map((c: any) => c.getStyle()).toList();
    findRangesImmutable(inlineStyles, areEqual, returnTrue, (start: number, end: number) => {
        leaves.push(
            new LeafRange({
                start: start + offset,
                end: end + offset
            })
        );
    });

    return List(leaves);
}

function areEqual(a: any, b: any): boolean {
    return a === b;
}
