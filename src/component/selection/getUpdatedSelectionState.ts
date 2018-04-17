import { EditorState } from '../model/immutable/EditorState';
import { SelectionState } from '../model/immutable/SelectionState';

import { DraftOffsetKey } from './DraftOffsetKey';
import { IDraftOffsetKeyPath } from './DraftOffsetKeyPath';

import { utils } from '../utils/fbjs';
const { nullthrows } = utils;

export function getUpdatedSelectionState(
    editorState: EditorState,
    anchorKey: string,
    anchorOffset: number,
    focusKey: string,
    focusOffset: number
): SelectionState {
    const selection: SelectionState = nullthrows(editorState.getSelection());
    // TODO __DEV__

    const anchorPath: IDraftOffsetKeyPath = DraftOffsetKey.decode(anchorKey);
    const anchorBlockKey: string = anchorPath.blockKey;
    // TODO decoratorKey
    const anchorLeaf: any = editorState
        .getBlockTree(anchorBlockKey)
        .getIn([0, 'leaves', anchorPath.leafKey]);

    const focusPath: IDraftOffsetKeyPath = DraftOffsetKey.decode(focusKey);
    const focusBlockKey: string = focusPath.blockKey;
    // TODO decoratorKey
    const focusLeaf: any = editorState
        .getBlockTree(focusBlockKey)
        .getIn([0, 'leaves', focusPath.leafKey]);

    const anchorLeafStart: number = anchorLeaf.get('start');
    const focusLeafStart: number = focusLeaf.get('start');

    const anchorBlockOffset: number | null = anchorLeaf ? anchorLeafStart + anchorOffset : null;
    const focusBlockOffset: number | null = focusLeaf ? focusLeafStart + focusOffset : null;

    const areEqual: boolean =
        selection.getAnchorKey() === anchorBlockKey &&
        selection.getAnchorOffset() === anchorBlockOffset &&
        selection.getFocusKey() === focusBlockKey &&
        selection.getFocusOffset() === focusBlockOffset;

    if (areEqual) {
        return selection;
    }

    let isBackward: boolean = false;
    if (anchorBlockKey === focusBlockKey) {
        const anchorLeafEnd: number = anchorLeaf.get('end');
        const focusLeafEnd: number = focusLeaf.get('end');
        if (focusLeafStart === anchorLeafStart && focusLeafEnd === anchorLeafEnd) {
            isBackward = focusOffset < anchorOffset;
        } else {
            isBackward = focusLeafStart < anchorLeafStart;
        }
    } else {
        const startKey: string = editorState
            .getCurrentContent()
            .getBlockMap()
            .keySeq()
            .skipUntil((v: any) => v === anchorBlockKey || v === focusBlockKey)
            .first();
        isBackward = startKey === focusBlockKey;
    }

    return selection.merge({
        anchorKey: anchorBlockKey,
        anchorOffset: anchorBlockOffset,
        focusKey: focusBlockKey,
        focusOffset: focusBlockOffset,
        isBackward
    }) as SelectionState;
}
