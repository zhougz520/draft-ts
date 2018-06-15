import { ContentBlock } from '../immutable/ContentBlock';
import { CharacterMetadata, DraftInlineStyle } from '../immutable/CharacterMetadata';
import { findRangesImmutable } from '../immutable/findRangesImmutable';
import { InlineStyleRange } from './InlineStyleRange';

import { List, OrderedSet } from 'immutable';
import { utils } from '../../utils/fbjs';
const { UnicodeUtils } = utils;

function getEncodedInlinesForType(
    block: ContentBlock,
    styleList: List<DraftInlineStyle>,
    styleToEncode: string
): InlineStyleRange[] {
    const areEqual = (a: any, b: any) => a === b;
    const isTruthy = (a: any) => !!a;
    const ranges: any[] = [];

    // Obtain an array with ranges for only the specified style.
    const filteredInlines: List<boolean> = styleList
        .map((style: OrderedSet<string>) => style.has(styleToEncode))
        .toList();

    findRangesImmutable(
        filteredInlines,
        areEqual,
        // We only want to keep ranges with nonzero style values.
        isTruthy,
        (start, end) => {
            const text = block.getText();
            ranges.push({
                offset: UnicodeUtils.strlen(text.slice(0, start)),
                length: UnicodeUtils.strlen(text.slice(start, end)),
                style: styleToEncode
            });
        }
    );

    return ranges;
}

export function encodeInlineStyleRanges(
    block: ContentBlock
): InlineStyleRange[] {
    const EMPTY_ARRAY: any[] = [];
    const styleList: List<OrderedSet<string>> = block.getCharacterList().map((c: CharacterMetadata) => c.getStyle()).toList();
    const ranges = styleList
        .flatten()
        .toSet()
        .map((style) => getEncodedInlinesForType(block, styleList, style));

    return Array.prototype.concat.apply(EMPTY_ARRAY, ranges.toJS());
}
