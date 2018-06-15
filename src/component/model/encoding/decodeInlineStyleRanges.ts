import { DraftInlineStyle } from '../immutable/CharacterMetadata';

import { OrderedSet } from 'immutable';
import { utils } from '../../utils/fbjs';
const { UnicodeUtils } = utils;
const { substr } = UnicodeUtils;

/**
 * Convert to native JavaScript string lengths to determine ranges.
 */
export function decodeInlineStyleRanges(
    text: string,
    ranges?: any[]
): DraftInlineStyle[] {
    const EMPTY_SET = OrderedSet();
    const styles: any[] = Array(text.length).fill(EMPTY_SET);
    if (ranges) {
        ranges.forEach((range) => {
            let cursor: number = substr(text, 0, range.offset).length;
            const end: number = cursor + substr(text, range.offset, range.length).length;
            while (cursor < end) {
                styles[cursor] = styles[cursor].add(range.style);
                cursor++;
            }
        });
    }

    return styles;
}
