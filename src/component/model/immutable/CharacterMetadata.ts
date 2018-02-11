import { Map, OrderedSet, Record } from 'immutable';

export type DraftInlineStyle = OrderedSet<string>;

export interface ICharacterMetadataConfig {
    style?: DraftInlineStyle;
    // TODO entity
}

const defaultRecord: ICharacterMetadataConfig = {
    style: OrderedSet()
};

export const CharacterMetadataRecord: Record.Class = Record(defaultRecord);

export class CharacterMetadata extends CharacterMetadataRecord {
    static EMPTY: CharacterMetadata;

    static create(config?: ICharacterMetadataConfig): CharacterMetadata {
        if (!config) {
            return EMPTY;
        }

        const defaultConfig: ICharacterMetadataConfig = {
            style: OrderedSet()
        };

        // Fill in unspecified properties, if necessary.
        const configMap: Map<any, any> = Map(defaultConfig).merge(config as any);

        const existing: CharacterMetadata | null = pool.get(configMap);
        if (existing) {
            return existing;
        }

        const newCharacter: CharacterMetadata = new CharacterMetadata(configMap);
        pool = pool.set(configMap, newCharacter);

        return newCharacter;
    }

    static applyStyle(
        record: CharacterMetadata,
        style: string
    ): CharacterMetadata {
        const withStyle: ICharacterMetadataConfig | undefined =
            record.set('style', record.getStyle().add(style)) as ICharacterMetadataConfig | undefined;

        return CharacterMetadata.create(withStyle);
    }

    static removeStyle(
        record: CharacterMetadata,
        style: string
    ): CharacterMetadata {
        const withoutStyle: ICharacterMetadataConfig | undefined =
            record.set('style', record.getStyle().remove(style)) as ICharacterMetadataConfig | undefined;

        return CharacterMetadata.create(withoutStyle);
    }

    public getStyle(): DraftInlineStyle {
        return this.get('style');
    }

    public hasStyle(style: string): boolean {
        return this.getStyle().includes(style);
    }
}

const EMPTY: CharacterMetadata = new CharacterMetadata();
let pool: Map<Map<any, any>, CharacterMetadata> = Map([
    [Map(defaultRecord), EMPTY]
]);

CharacterMetadata.EMPTY = EMPTY;
