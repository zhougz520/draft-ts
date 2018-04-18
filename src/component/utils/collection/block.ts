/*
    API:操作Block的一些方法
*/

import { OrderedMap, List, Map } from 'immutable';
import { EditorState } from '../../model/immutable/EditorState';
import { ContentBlock } from '../../model/immutable/ContentBlock';
import { SelectionState } from '../../model/immutable/SelectionState';
import { ContentState } from '../../model/immutable/ContentState';
import { DraftModifier } from '../../model/modifier/DraftModifier';

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

/**
 * 设置ContentState的data属性
 * @param editorState 当前的editorState
 * @param data 需要设置的data:{key, value}
 */
export function setBlockData(
    editorState: EditorState,
    data: any
): EditorState {
    const newContentState: ContentState = DraftModifier.setBlockData(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        data
    );
    return EditorState.push(editorState, newContentState, "change-block-data");
}

export function getSelectedBlocksMetadata(editorState: EditorState): Map<any, any> {
    let metaData: Map<any, any> = Map();
    const selectedBlocks: List<ContentBlock> = getSelectedBlocksList(editorState);
    if (selectedBlocks && selectedBlocks.size > 0) {
        for (let i: number = 0; i < selectedBlocks.size; i += 1) {
            const data = selectedBlocks.get(i).getData();
            if (!data || data.size === 0) {
                metaData = metaData.clear();
                break;
            }
            if (i === 0) {
                metaData = data;
            } else {
                metaData.forEach((value, key) => {
                    if (!data.get(key) || data.get(key) !== value) {
                        metaData = metaData.delete(key as {});
                    }
                });
                if (metaData.size === 0) {
                    metaData = metaData.clear();
                    break;
                }
            }
        }
    }
    return metaData;
}
