import { List } from 'immutable';

/**
 * Search through an array to find contiguous stretches of elements that
 * match a specified filter function.
 *
 * When ranges are found, execute a specified `found` function to supply
 * the values to the caller.
 */
export function findRangesImmutable<T>(
    haystack: List<T>,
    areEqualFn: (a: T, b: T) => boolean,
    filterFn: (value: T) => boolean,
    foundFn: (start: number, end: number) => void
): void {
    if (!haystack.size) {
        return;
    }

    let cursor: number = 0;

    haystack.reduce((value: T, nextValue: any, nextIndex: any) => {
        if (!areEqualFn(value, nextValue)) {
            if (filterFn(value)) {
                foundFn(cursor, nextIndex);
            }
            cursor = nextIndex;
        }

        return nextValue;
    });

    filterFn(haystack.last()) && foundFn(cursor, haystack.count());
}
