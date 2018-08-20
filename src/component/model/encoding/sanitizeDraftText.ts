const REGEX_BLOCK_DELIMITER = new RegExp('\r', 'g');

export function sanitizeDraftText(input: string): string {
    return input.replace(REGEX_BLOCK_DELIMITER, '');
}
