import { DraftEditor } from '../../base/DraftEditor';
import { EditorState } from '../../model/immutable/EditorState';
import { ContentState } from '../../model/immutable/ContentState';
import { ContentBlock } from '../../model/immutable/ContentBlock';
import { CharacterMetadata } from '../../model/immutable/CharacterMetadata';
import { BlockMap, BlockMapBuilder } from '../../model/immutable/BlockMapBuilder';
import { DraftModifier } from '../../model/modifier/DraftModifier';
import { RichTextEditorUtil } from '../../model/modifier/RichTextEditorUtil';
import { generateRandomKey } from '../../model/keys/generateRandomKey';
import { sanitizeDraftText } from '../../model/encoding/sanitizeDraftText';

import { splitTextIntoTextBlocks } from '../../utils/splitTextIntoTextBlocks';
import { List, Repeat } from 'immutable';
import { utils } from '../../utils/fbjs';
const { DataTransfer } = utils;

export function editOnPaste(editor: DraftEditor, e: any): void {
    e.preventDefault();
    const data = new DataTransfer(e.clipboardData);

    // TODO 粘贴文件

    let textBlocks: string[] = [];
    const text = data.getText();
    const html = data.getHTML();
    const editorState = editor._latestEditorState;

    // TODO 处理自定义粘贴

    if (text) {
        textBlocks = splitTextIntoTextBlocks(text);
    }

    // If the text from the paste event is rich content that matches what we
    // already have on the internal clipboard, assume that we should just use
    // the clipboard fragment for the paste. This will allow us to preserve
    // styling and entities, if any are present. Note that newlines are
    // stripped during comparison -- this is because copy/paste within the
    // editor in Firefox and IE will not include empty lines. The resulting
    // paste will preserve the newlines correctly.
    const internalClipboard = editor.getClipboard();
    if (data.isRichText() && internalClipboard) {
        if (
            // If the editorKey is present in the pasted HTML, it should be safe to
            // assume this is an internal paste.
            html.indexOf(editor.getEditorKey()) !== -1 ||
            // The copy may have been made within a single block, in which case the
            // editor key won't be part of the paste. In this case, just check
            // whether the pasted text matches the internal clipboard.
            (
                textBlocks.length === 1 &&
                internalClipboard.size === 1 &&
                internalClipboard.first().getText() === text
            )
        ) {
            editor.update(
                insertFragment(editor._latestEditorState, internalClipboard)
            );

            return;
        }
    }
    // TODO 这里只处理粘贴富文本，其他模式后面按需补充

    if (textBlocks.length) {
        const character: CharacterMetadata = CharacterMetadata.create({
            style: editorState.getCurrentInlineStyle()
        });

        const currentBlockType: string = RichTextEditorUtil.getCurrentBlockType(editorState);

        const textFragment: ContentBlock[] = processText(
            textBlocks,
            character,
            currentBlockType
        );

        const textMap: BlockMap = BlockMapBuilder.createFromArray(textFragment);
        editor.update(insertFragment(editor._latestEditorState, textMap));
    }
}

function insertFragment(
    editorState: EditorState,
    fragment: BlockMap
): EditorState {
    const newContent: ContentState = DraftModifier.replaceWithFragment(
        editorState.getCurrentContent(),
        editorState.getSelection(),
        fragment
    );
    // TODO: merge the entity map once we stop using DraftEntity
    // like this:
    // const mergedEntityMap = newContent.getEntityMap().merge(entityMap);

    return EditorState.push(
        editorState,
        newContent,
        'insert-fragment'
    );
}

function processText(
    textBlocks: string[],
    character: CharacterMetadata,
    type: string   // TODO DraftBlockType
): ContentBlock[] {
    return textBlocks.map(
        (textLine: string) => {
            textLine = sanitizeDraftText(textLine);

            return new ContentBlock({
                key: generateRandomKey(),
                type,
                text: textLine,
                characterList: List(Repeat(character, textLine.length))
            });
        }
    );
}
