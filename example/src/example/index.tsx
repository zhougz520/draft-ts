import * as React from 'react';
import { DraftPublic } from '../../../src';
import { Button } from 'antd';

import './index.scss';

const { Editor, EditorState, RichUtils, InlineUtils } = DraftPublic;

export default class Example extends React.PureComponent<any, any> {
    constructor(props: any) {
        super(props);

        this.state = { editorState: EditorState.createEmpty() };
    }

    handleKeyCommand = (command: any, editorState: any) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);

            return true;
        }

        return false;
    }

    onChange = (editorState: any) => this.setState({ editorState });

    focus = () => (this.refs.editor as any).focus();

    onTab = (e: any) => {
        this.onChange(RichUtils.onTab(e, this.state.editorState));
    }

    toggleBlockType = (blockType: any) => {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    toggleInlineStyle = (inlineStyle: any) => {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    toggleColorStyle = (inlineStyle: any) => {
        this.onChange(
            InlineUtils.toggleCustomInlineStyle(
                this.state.editorState,
                'color',
                inlineStyle
            )
        );
    }

    render() {
        const { editorState } = this.state;

        return (
            <div className="RichEditor-root">
                <div id="msGrid" style={{ height: '24px', width: '100%'}}>
                    Sass Test
                </div>
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <div className="RichEditor-editor" onClick={this.focus}>
                    <Editor
                        editorState={editorState}
                        inlineStyleRenderMap={InlineUtils.getDraftInlineStyleMap()}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        onTab={this.onTab}
                        // tslint:disable-next-line:jsx-no-string-ref
                        ref="editor"
                    />
                </div>
            </div>
        );
    }
}

/* tslint:disable:max-classes-per-file */
export class StyleButton extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    onToggle = (e: any) => {
        e.preventDefault();
        this.props.onToggle(this.props.style);
    }

    render() {
        let primary: any = undefined;
        if (this.props.active) {
            primary = 'primary';
        }

        return (
            <Button
                type={primary}
                onMouseDown={this.onToggle}
            >
                {this.props.label}
            </Button>
        );
    }
}
/* tslint:enable:max-classes-per-file */

const INLINE_STYLES: any = [
    { label: 'Bold', style: 'BOLD' },
    { label: 'Italic', style: 'ITALIC' },
    { label: 'CODE', style: 'CODE' },
    { label: 'STR', style: 'STRIKETHROUGH' },
    { label: 'UND', style: 'UNDERLINE' },
    { label: 'SUP', style: 'SUPERSCRIPT' },
    { label: 'SUB', style: 'SUBSCRIPT' }
];

const InlineStyleControls: any = (props: any) => {
    const currentStyle: any = props.editorState.getCurrentInlineStyle();

    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type: any) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

const BLOCK_STYLES: any = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' }
];

const BlockStyleControls: any = (props: any) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_STYLES.map((type: any) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};
