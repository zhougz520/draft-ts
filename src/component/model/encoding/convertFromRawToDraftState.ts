import { IRawDraftContentState } from './RawDraftContentState';
import { ContentState } from '../immutable/ContentState';
import { ContentBlock } from '../immutable/ContentBlock';
import { CharacterMetadata, DraftInlineStyle } from '../immutable/CharacterMetadata';
import { generateRandomKey } from '../../model/keys/generateRandomKey';
import { decodeInlineStyleRanges } from './decodeInlineStyleRanges';
import { createCharacterList } from './createCharacterList';

import { Map, List } from 'immutable';

export function convertFromRawToDraftState(
    rawState: IRawDraftContentState
): ContentState {
    const { blocks } = rawState;

    const contentBlocks = blocks.map(
        (block) => {
            let {
                key,
                type,
                text,
                depth,
                inlineStyleRanges,
                data
            } = block;
            key = key || generateRandomKey();
            type = type || 'unstyled';
            text = text || '';
            depth = depth || 0;
            inlineStyleRanges = inlineStyleRanges || [];
            data = Map(data);

            const inlineStyles: DraftInlineStyle[] = decodeInlineStyleRanges(text, inlineStyleRanges);
            const characterList: List<CharacterMetadata> = createCharacterList(inlineStyles);

            return new ContentBlock({key, type, text, depth, characterList, data});
        }
    );

    return ContentState.createFromBlockArray(contentBlocks);
}
