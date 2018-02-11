import { List } from 'immutable';

export function insertIntoList<T>(
    targetList: List<T>,
    toInsert: List<T>,
    offset: number
): List<T> {
    if (offset === targetList.count()) {
        toInsert.forEach((c: any) => {
            targetList = targetList.push(c);
        });
    } else if (offset === 0) {
        toInsert.reverse().forEach((c: any) => {
            targetList = targetList.unshift(c);
        });
    } else {
        const head = targetList.slice(0, offset);
        const tail = targetList.slice(offset);
        targetList = head.concat(toInsert, tail).toList();
    }

    return targetList;
}
