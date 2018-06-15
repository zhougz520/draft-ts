import { EditorState } from '../model/immutable/EditorState';
import { ContentBlock } from '../model/immutable/ContentBlock';
import { DraftEditorCommand } from '../model/constants/DraftEditorCommand';

export type DraftTextAlignment = 'left' | 'center' | 'right';

export interface IDraftScrollPosition {
    x: number;
    y: number;
}

export interface IDraftEditorState {
    contentsKey: number;
}

export interface IDraftEditorProps {
    /**
     * `editorState`、`onChange` 最重要的两个属性
     *
     * `editorState`定义了整个编辑器的状态
     * `onChange`是传递所有状态的方法
     */
    editorState: EditorState;
    onChange: (editorState: any) => void;

    // specify editorKey when rendering serverside. If you do not set this prop
    // react will complain that there is a server/client mismatch because Draft
    // will generate a random editorKey when rendering in each context. The key
    // is used to figure out if content is being pasted within a draft block to
    // better apply formatting and styles.  If two editors share the same key &
    // `stripPastedStyles` is false, draft will assume both editors share their
    // styling and formatting when re-applying styles.
    editorKey?: string;

    /**
     * 制定文本的对齐方向
     */
    textAlignment?: DraftTextAlignment;

    // 设置block的自定义样式，返回className
    blockStyleFn?: (block: ContentBlock) => string;

    keyBindingFn?: (e: any) => string | null;

    /**
     * 指定`DraftEditor`
     * 是否可以编辑
     */
    readOnly?: boolean;

    /**
     * 设置编辑器是否显示
     */
    disPlay?: boolean;

    tabIndex?: number;

    handleKeyCommand?: (
        command: DraftEditorCommand | string,
        editorState: EditorState
    ) => boolean;

    /**
     * 自定义事件，通过按键绑定
     */
    onTab?: (e: any) => void;

    onBlur?: (e: any) => void;
    onFocus?: (e: any) => void;

    /**
     * inline样式的配置映射
     * 用来匹配样式
     */
    inlineStyleRenderMap?: any;

    /**
     * block样式的配置映射
     * 用来匹配block ReactElement
     */
    blockStyleRenderMap?: any;

    customContentStyle?: any;
}
