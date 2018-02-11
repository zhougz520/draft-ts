import { List, Record, Repeat, OrderedSet } from 'immutable';

import { CharacterMetadata, DraftInlineStyle } from './CharacterMetadata';
import { findRangesImmutable } from './findRangesImmutable';

export interface IBlockNodeConfig {
    key?: string;
    type?: string;
    text?: string;
    characterList?: List<CharacterMetadata>;
    depth?: number;
}

const defaultRecord: IBlockNodeConfig = {
    key: '',
    type: 'unstyled',
    text: '',
    characterList: List(),
    depth: 0
};

export const ContentBlockRecord: Record.Class = Record(defaultRecord);

const decorateCharacterList = (config: IBlockNodeConfig): IBlockNodeConfig => {
    if (!config) {
        return config;
    }

    const { characterList, text } = config;

    if (text && !characterList) {
        config.characterList = List(Repeat(CharacterMetadata.EMPTY, text.length));
    }

    return config;
};

export class ContentBlock extends ContentBlockRecord {
    constructor(config: IBlockNodeConfig) {
        super(decorateCharacterList(config));
    }

    getKey(): string {
        return this.get('key');
    }

    getType(): string {
        return this.get('type');
    }

    getText(): string {
        return this.get('text');
    }

    getCharacterList(): List<CharacterMetadata> {
        return this.get('characterList');
    }

    getLength(): number {
        return this.getText().length;
    }

    getDepth(): number {
        return this.get('depth');
    }

    getInlineStyleAt(offset: number): DraftInlineStyle {
        const character: CharacterMetadata = this.getCharacterList().get(offset);

        return character ? character.getStyle() : OrderedSet();
    }

    findStyleRanges(
        filterFn: (value: CharacterMetadata) => boolean,
        callback: (start: number, end: number) => void
    ): void {
        findRangesImmutable(
            this.getCharacterList(),
            haveEqualStyle,
            filterFn,
            callback
        );
    }
}

function haveEqualStyle(
    charA: CharacterMetadata,
    charB: CharacterMetadata
): boolean {
    return charA.getStyle() === charB.getStyle();
}
