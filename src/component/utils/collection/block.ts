/*
    API:操作Block的一些方法
*/

import { OrderedMap, List, Map } from 'immutable';
import { EditorState } from '../../model/immutable/EditorState';
import { ContentBlock } from '../../model/immutable/ContentBlock';
import { SelectionState } from '../../model/immutable/SelectionState';
import { ContentState } from '../../model/immutable/ContentState';
import { DraftModifier } from '../../model/modifier/DraftModifier';
import { RichTextEditorUtil } from '../../model/modifier/RichTextEditorUtil';

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

export function mergeBlockData(
    editorState: EditorState,
    data: any  
): EditorState {
    const newContentState: ContentState = DraftModifier.mergeBlockData(
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

// TODO 设置List的样式数据
/**
 * 
 * @param editorState 当前editorState
 * @param blockType 需要设置的blockType ['unordered-list-item','ordered-list-item']
 * @param styleType 自定义的样式类型 ul:disc circle square, ol:decimal lower-alpha lower-roman
 */
export function setListBlockStyleData(
    editorState: EditorState,
    blockType: string,
    data: any
): EditorState {
    const specialBlockType: List<string> = List(['unordered-list-item', 'ordered-list-item']);
    if (specialBlockType.includes(blockType) === false) {
        return editorState;
    }

    const selection: SelectionState = editorState.getSelection();
    const content: ContentState = editorState.getCurrentContent();
    const key: string = selection.getAnchorKey();
    const block: ContentBlock = content.getBlockForKey(key);
    const depth: number = block.getDepth();

    // TODO 逻辑按取消和设置样式来
    let editorStateWithBlockType: EditorState | null = null;
    if (depth === 0) {
        editorStateWithBlockType = RichTextEditorUtil.toggleBlockType(editorState, blockType)
    } else {
        editorStateWithBlockType = editorState;
    }

    const editorStateWithData: EditorState = setBlockData(editorStateWithBlockType, data);

    return editorStateWithData;
}
