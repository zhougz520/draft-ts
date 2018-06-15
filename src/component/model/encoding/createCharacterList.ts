import { CharacterMetadata, DraftInlineStyle } from '../immutable/CharacterMetadata';

import { List } from 'immutable';

export function createCharacterList(
    inlineStyles: DraftInlineStyle[]
): List<CharacterMetadata> {
    const characterArray: CharacterMetadata[] = inlineStyles.map((style, ii) => {
        return CharacterMetadata.create({ style });
    });

    return List(characterArray);
}
