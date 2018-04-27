import { ContentState } from '../immutable/ContentState';
import { SelectionState } from '../immutable/SelectionState';
import { ContentBlock } from '../immutable/ContentBlock';
import { CharacterMetadata, DraftInlineStyle } from '../immutable/CharacterMetadata';

import { removeRangeFromContentState } from '../transaction/removeRangeFromContentState';
import { insertTextIntoContentState } from '../transaction/insertTextIntoContentState';
import { ContentStateInlineStyle } from '../transaction/ContentStateInlineStyle';
import { modifyBlockForContentState } from '../transaction/modifyBlockForContentState';
import { splitBlockInContentState } from '../transaction/splitBlockInContentState';

import { OrderedSet } from 'immutable';

export const DraftModifier = {
    replaceText(
        contentState: ContentState,
        rangeToReplace: SelectionState,
        text: string,
        inlineStyle?: DraftInlineStyle
        // TODO entityKey
    ): ContentState {
        // TODO withoutEntities removeEntitiesAtEdges
        const afterSelect: ContentState = contentState.set('selectionAfter', rangeToReplace) as ContentState;
        const withoutText: ContentState = removeRangeFromContentState(afterSelect, rangeToReplace);

        const character: CharacterMetadata = CharacterMetadata.create({
            style: inlineStyle || OrderedSet()
            // TODO entity
        });

        return insertTextIntoContentState(
            withoutText,
            withoutText.getSelectionAfter(),
            text,
            character
        );
    },

    removeRange(
        contentState: ContentState,
        rangeToRemove: SelectionState
        // TODO removalDirection: DraftRemovalDirection,
    ): ContentState {
        if (rangeToRemove.getIsBackward()) {
            rangeToRemove = rangeToRemove.merge({
                anchorKey: rangeToRemove.getFocusKey(),
                anchorOffset: rangeToRemove.getFocusOffset(),
                focusKey: rangeToRemove.getAnchorKey(),
                focusOffset: rangeToRemove.getAnchorOffset(),
                isBackward: false
            }) as SelectionState;
        }

        // TODO EntityKey

        const adjustedRemovalRange: SelectionState = rangeToRemove;
        // TODO draft_segmented_entities_behavior

        // TODO withoutEntities removeEntitiesAtEdges
        const afterSelect: ContentState = contentState.set('selectionAfter', adjustedRemovalRange) as ContentState;

        return removeRangeFromContentState(afterSelect, adjustedRemovalRange);
    },

    splitBlock(
        contentState: ContentState,
        selectionState: SelectionState
    ): ContentState {
        // TODO withoutEntities removeEntitiesAtEdges
        const afterSelect: ContentState = contentState.set('selectionAfter', selectionState) as ContentState;
        const withoutText: ContentState = removeRangeFromContentState(afterSelect, selectionState);

        return splitBlockInContentState(
            withoutText,
            withoutText.getSelectionAfter()
        );
    },

    applyInlineStyle(
        contentState: ContentState,
        selectionState: SelectionState,
        inlineStyle: string
    ): ContentState {
        return ContentStateInlineStyle.add(
            contentState,
            selectionState,
            inlineStyle
        );
    },

    removeInlineStyle(
        contentState: ContentState,
        selectionState: SelectionState,
        inlineStyle: string
    ): ContentState {
        return ContentStateInlineStyle.remove(
            contentState,
            selectionState,
            inlineStyle
        );
    },

    setBlockType(
        contentState: ContentState,
        selectionState: SelectionState,
        blockType: string,   // TODO DraftBlockType
        depth?: number
    ): ContentState {
        let config: any = {
            type: blockType
        };
        if (depth !== undefined) {
            config = {
                type: blockType,
                depth
            };
        }

        return modifyBlockForContentState(contentState, selectionState, (block: ContentBlock) =>
            block.merge(config) as ContentBlock
        );
    },

    setBlockData(
        contentState: ContentState,
        selectionState: SelectionState,
        blockData: Map<any, any>
    ): ContentState {
        return modifyBlockForContentState(
            contentState,
            selectionState,
            (block: ContentBlock) => block.merge({ data: blockData }) as ContentBlock
        );
    },

    mergeBlockData(
        contentState: ContentState,
        selectionState: SelectionState,
        blockData: Map<any, any>
    ): ContentState {
        return modifyBlockForContentState(
            contentState,
            selectionState,
            (block: ContentBlock) => block.merge({ data: block.getData().merge(blockData) }) as ContentBlock
        );
    }
};
