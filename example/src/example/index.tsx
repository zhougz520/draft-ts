import * as React from 'react';
import { DraftPublic } from '../../../src';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import 'office-ui-fabric-react/dist/css/fabric.css';
import styled from 'styled-components';

import { CustColorPicker } from './ColorPicker';

const { Editor, EditorState, RichUtils, DefaultDraftInlineStyle } = DraftPublic;

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
        const maxDepth: number = 6;
        this.onChange(RichUtils.onTab(e, this.state.editorState, maxDepth));
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
            DefaultDraftInlineStyle.toggleCustomInlineStyle(
                this.state.editorState,
                'color',
                inlineStyle
            )
        );
    }

    render() {
        const { editorState } = this.state;
        console.log({ editorState });

        interface CustProps { type: string; }

        const CustOl = styled<CustProps, 'ol'>('ol')`
            list-style-type: ${
                (p: CustProps) => {
                    switch (p.type) {
                        case 'ol':
                            return 'lower-roman';
                        default:
                            return 'upper-roman';
                    }
                }
            };
        `;

        return (
            <div className="RichEditor-root">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg2">A</div>
                        <div className="ms-Grid-col ms-sm6 ms-md8 ms-lg10">B</div>
                    </div>
                </div>
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <CustColorPicker
                    editorState={editorState}
                    onToggle={this.toggleColorStyle}
                />
                <div className="RichEditor-editor" onClick={this.focus}>
                    <Editor
                        editorState={editorState}
                        inlineStyleRenderMap={DefaultDraftInlineStyle.getDraftInlineStyleMap()}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        onTab={this.onTab}
                        // tslint:disable-next-line:jsx-no-string-ref
                        ref="editor"
                    />
                </div>
                <CustOl type="de">
                    <li>123</li>
                </CustOl>
                <CustOl type="ol">
                    <li>123</li>
                </CustOl>
            </div>
        );
    }
}

export class StyleButton extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    onToggle = (e: any) => {
        e.preventDefault();
        this.props.onToggle(this.props.style);
    }

    render() {
        let primary: boolean = false;
        if (this.props.active) {
            primary = true;
        }

        return (
            <DefaultButton
                primary={primary}
                text={this.props.label}
                onMouseDown={this.onToggle}
            />
        );
    }
}

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
