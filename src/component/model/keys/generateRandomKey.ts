const seenKeys: any = {};
const MULTIPLIER: number = Math.pow(2, 24);

export function generateRandomKey(): string {
    let key: any;
    while (key === undefined || seenKeys.hasOwnProperty(key) || !isNaN(+key)) {
        key = Math.floor(Math.random() * MULTIPLIER).toString(32);
    }
    seenKeys[key] = true;

    return key;
}
