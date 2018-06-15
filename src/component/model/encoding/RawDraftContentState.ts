import { IRawDraftContentBlock } from './RawDraftContentBlock';

/**
 * A type that represents a composed document as vanilla JavaScript objects,
 * with all styles and entities represented as ranges. Corresponding entity
 * objects are packaged as objects as well.
 *
 * This object is especially useful when sending the document state to the
 * server for storage, as its representation is more concise than our
 * immutable objects.
 */
export interface IRawDraftContentState {
    blocks: IRawDraftContentBlock[];
}
