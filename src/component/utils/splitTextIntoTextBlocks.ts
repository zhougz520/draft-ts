const NEWLINE_REGEX = /\r\n?|\n/g;

export function splitTextIntoTextBlocks(text: string): string[] {
    return text.split(NEWLINE_REGEX);
}
