import { ContentState } from '../immutable/ContentState';
import { ContentBlock } from '../immutable/ContentBlock';
import { encodeInlineStyleRanges } from './encodeInlineStyleRanges';
import { IRawDraftContentState } from './RawDraftContentState';

export function convertFromDraftStateToRaw(
    contentState: ContentState
): IRawDraftContentState {
    const rawBlocks: any[] = [];
    contentState.getBlockMap().forEach((block: ContentBlock, blockKey: string) => {
        rawBlocks.push({
            key: blockKey,
            text: block.getText(),
            type: block.getType(),
            depth: block.getDepth(),
            inlineStyleRanges: encodeInlineStyleRanges(block),
            data: block.getData().toObject()
        });
    });

    return {
        blocks: rawBlocks
    };
}
