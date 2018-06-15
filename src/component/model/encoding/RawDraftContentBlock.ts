import { InlineStyleRange } from './InlineStyleRange';

/**
 * A plain object representation of a ContentBlock, with all style and entity
 * attribution repackaged as range objects.
 */
export interface IRawDraftContentBlock {
    key?: string;
    type?: string;   // TODO DraftBlockType
    text?: string;
    depth?: number;
    inlineStyleRanges?: InlineStyleRange[];
    data?: any;
}
