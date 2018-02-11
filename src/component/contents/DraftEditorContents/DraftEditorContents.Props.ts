import { EditorState } from '../../model/immutable/EditorState';

export interface IDraftEditorContentsProps {
    editorState: EditorState;
    editorKey: string;
    inlineStyleRenderMap: any;
    blockStyleRenderMap: any;
}
