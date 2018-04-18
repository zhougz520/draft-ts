import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
    DraftEditor_root,
    DraftEditor_editorContainer
} from '../assets/DraftEditorStyle';
import { IDraftEditorProps, IDraftEditorState, IDraftScrollPosition } from './DraftEditor.Props';
import { EditorState } from '../model/immutable/EditorState';
import { ContentBlock } from '../model/immutable/ContentBlock';
import * as DefaultDraftBlockStyle from '../model/immutable/DefaultDraftBlockStyle';

import { DraftEditorContents } from '../contents/DraftEditorContents/DraftEditorContents';
import { DraftEditorEditHandler } from '../handlers/edit/DraftEditorEditHandler';
import { DraftEditorCompositionHandler } from '../handlers/composition/DraftEditorCompositionHandler';
import { DraftEditorModes } from '../handlers/DraftEditorModes';

// TODO
import { getDefaultKeyBinding } from '../utils/getDefaultKeyBinding';
import { generateRandomKey } from '../model/keys/generateRandomKey';
import { getDraftInlineStyleMap } from '../utils/collection/inline';
import { utils } from '../utils/fbjs';

const { Style, getScrollPosition, invariant, Scroll, emptyFunction } = utils;
const { getDraftBlockStyleMap } = DefaultDraftBlockStyle;

/**
 * 定义一组对象来对应所有可能的'mode'
 */
const handlerMap: any = {
    edit: DraftEditorEditHandler,
    composite: DraftEditorCompositionHandler
};

/**
 * 'DraftEditor'是根组件，它是一个'contentEditable'的div
 * 并提供各种方法来操作
 */
export class DraftEditor extends React.Component<IDraftEditorProps, IDraftEditorState> {
    public static defaultProps = {
        blockStyleFn: emptyFunction.thatReturns(''),
        keyBindingFn: getDefaultKeyBinding,
        readOnly: false,
        inlineStyleRenderMap: getDraftInlineStyleMap(),
        blockStyleRenderMap: getDraftBlockStyleMap()
    };

    public _blockSelectEvents: boolean;
    public _handler: any;
    public _editorKey: string;
    public _latestEditorState: EditorState;
    public _latestCommittedEditorState: EditorState;
    public _pendingStateFromBeforeInput: void | EditorState = undefined;

    public editor: HTMLElement | null = null;
    public editorContainer: HTMLElement | null = null;

    /**
     * 把事件路由到处理程序
     */
    public _onBeforeInput: any = this._buildHandler('onBeforeInput');
    public _onBlur: any = this._buildHandler('onBlur');
    public _onCompositionEnd: any = this._buildHandler('onCompositionEnd');
    public _onCompositionStart: any = this._buildHandler('onCompositionStart');
    public _onFocus: any = this._buildHandler('onFocus');
    public _onInput: any = this._buildHandler('onInput');
    public _onKeyDown: any = this._buildHandler('onKeyDown');
    public _onKeyPress: any = this._buildHandler('onKeyPress');
    public _onSelect: any = this._buildHandler('onSelect');

    public constructor(props: IDraftEditorProps) {
        super(props);

        this._blockSelectEvents = false;
        this._handler = null;
        this._editorKey = props.editorKey || generateRandomKey();
        this._latestEditorState = props.editorState;
        this._latestCommittedEditorState = props.editorState;

        this.state = { contentsKey: 0 };
    }

    public render(): React.ReactNode {
        const { readOnly } = this.props;

        return (
            <div style={DraftEditor_root()}>
                <div
                    style={DraftEditor_editorContainer}
                    ref={(ref: HTMLElement | null) => (this.editorContainer = ref)}
                >
                    <div
                        className="editorContainer"
                        contentEditable={!readOnly}
                        // TODO data-contents
                        onBeforeInput={this._onBeforeInput}
                        onBlur={this._onBlur}
                        onCompositionEnd={this._onCompositionEnd}
                        onCompositionStart={this._onCompositionStart}
                        onFocus={this._onFocus}
                        onInput={this._onInput}
                        onKeyDown={this._onKeyDown}
                        onKeyPress={this._onKeyPress}
                        onSelect={this._onSelect}
                        ref={(ref: HTMLElement | null) => (this.editor = ref)}
                        suppressContentEditableWarning
                    >
                        <DraftEditorContents
                            key={'contents' + this.state.contentsKey}
                            editorKey={this._editorKey}
                            editorState={this.props.editorState}
                            inlineStyleRenderMap={this.props.inlineStyleRenderMap}
                            blockStyleRenderMap={this.props.blockStyleRenderMap}
                            blockStyleFn={this.props.blockStyleFn as (block: ContentBlock) => string}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // TODO
    public componentDidMount(): void {
        this.setMode('edit');
    }

    public componentWillUpdate(nextProps: IDraftEditorProps): void {
        this._blockSelectEvents = true;
        this._latestEditorState = nextProps.editorState;
    }

    public componentDidUpdate(): void {
        this._blockSelectEvents = false;
        this._latestCommittedEditorState = this.props.editorState;
    }

    public focus = (scrollPosition?: IDraftScrollPosition): void => {
        const { editorState } = this.props;
        const alreadyHasFocus: boolean = editorState.getSelection().getHasFocus();
        const editorNode: Element = ReactDOM.findDOMNode(this.editor as HTMLElement);

        if (!editorNode) {
            return;
        }

        const scrollParent: any = Style.getScrollParent(editorNode);
        const { x, y } = scrollPosition || getScrollPosition(scrollParent);

        invariant(
            editorNode instanceof HTMLElement,
            'editorNode is not an HTMLElement'
        );
        (editorNode as HTMLElement).focus();

        if (scrollParent === window) {
            window.scrollTo(x, y);
        } else {
            Scroll.setTop(scrollParent, y);
        }

        if (!alreadyHasFocus) {
            this.update(
                EditorState.forceSelection(editorState, editorState.getSelection())
            );
        }
    }

    public blur = (): void => {
        const editorNode = ReactDOM.findDOMNode(this.editor as HTMLElement);
        invariant(
            editorNode instanceof HTMLElement,
            'editorNode is not an HTMLElement'
        );
        (editorNode as HTMLElement).blur();
    }

    public setMode = (mode: DraftEditorModes): void => {
        this._handler = handlerMap[mode];
    }

    public exitCurrentMode = (): void => {
        this.setMode('edit');
    }

    public getEditorKey = (): string => {
        return this._editorKey;
    }

    public restoreEditorDOM = (scrollPosition?: IDraftScrollPosition): void => {
        this.setState({ contentsKey: this.state.contentsKey + 1 }, () => {
            this.focus(scrollPosition);
        });
    }

    /**
     * 通过`this.update(...)`使用
     *
     * 把`EditorState`对象传递到更高级别的组件
     * 这是修改`DraftEditor`组件状态的方法
     * 使用`DraftEditor`的组件必须提供一个`onChange`属性来接收从此传来的状态更新
     */
    public update = (editorState: EditorState): void => {
        this._latestEditorState = editorState;
        this.props.onChange(editorState);
    }

    /**
     * 构建一个将事件传递给指定程序的方法
     * @param eventName 事件名称
     */
    private _buildHandler(eventName: string): any {
        return (e: any) => {
            if (!this.props.readOnly) {
                const method = this._handler && this._handler[eventName];
                method && method(this, e);
            }
        };
    }
}
