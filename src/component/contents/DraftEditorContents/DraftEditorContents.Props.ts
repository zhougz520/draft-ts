import { EditorState } from '../../model/immutable/EditorState';
import { ContentBlock } from '../../model/immutable/ContentBlock';

export interface IDraftEditorContentsProps {
    editorState: EditorState;
    editorKey: string;
    inlineStyleRenderMap: any;
    blockStyleRenderMap: any;
    blockStyleFn: (block: ContentBlock) => string;
}
