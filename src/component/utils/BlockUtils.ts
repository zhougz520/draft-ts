/*
    API:操作Block的一些方法
*/

import { OrderedMap, List } from 'immutable';
import { EditorState } from '../model/immutable/EditorState';
import { ContentBlock } from '../model/immutable/ContentBlock';
import { SelectionState } from '../model/immutable/SelectionState';
import { ContentState } from '../model/immutable/ContentState';

/**
 * 返回选定Block的集合
 * OrderedMap
 */
export function getSelectedBlocksMap(editorState: EditorState): OrderedMap<string, ContentBlock> {
    const selectionState: SelectionState = editorState.getSelection();
    const contentState: ContentState = editorState.getCurrentContent();
    const startKey: string = selectionState.getStartKey();
    const endKey: string = selectionState.getEndKey();
    const blockMap: OrderedMap<string, ContentBlock> = contentState.getBlockMap();

    return blockMap
        .toSeq()
        .skipUntil((_, k) => k === startKey)
        .takeUntil((_, k) => k === endKey)
        .concat([[endKey, blockMap.get(endKey)]]) as OrderedMap<string, ContentBlock>;
}

/**
 * 返回选定Block的集合
 * List
 */
export function getSelectedBlocksList(editorState: EditorState): List<ContentBlock> {
    return getSelectedBlocksMap(editorState).toList();
}
