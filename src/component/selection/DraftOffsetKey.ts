import { IDraftOffsetKeyPath } from './DraftOffsetKeyPath';

const KEY_DELIMITER: string = '-';

export const DraftOffsetKey: any = {
    encode(
        blockKey: string,
        // TODO decoratorKey: number,
        leafKey: number
    ): string {
        return blockKey + KEY_DELIMITER + leafKey;
    },

    decode(offsetKey: string): IDraftOffsetKeyPath {
        // TODO decoratorKey: number,
        const [blockKey, leafKey]: string[] = offsetKey.split(KEY_DELIMITER);

        return {
            blockKey,
            leafKey: parseInt(leafKey, 10)
        };
    }
};
