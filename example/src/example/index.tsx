import * as React from 'react';
import { DraftPublic } from '../../../src';
import { Button, Select, Radio } from 'antd';

import './index.scss';

const { Editor, EditorState, RichUtils, InlineUtils, BlockUtils, FbjsUtils } = DraftPublic;
const { cx } = FbjsUtils;

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

    toggleBlockTypeClass = (blockType: any) => {
        const currentBlockClass = BlockUtils.getSelectedBlocksMetadata(this.state.editorState).get('ul');
        if (currentBlockClass !== blockType) {
            this.onChange(
                BlockUtils.mergeBlockData(
                    this.state.editorState,
                    { 'ul': blockType }
                )
            ); 
        } else {
            this.onChange(
                BlockUtils.mergeBlockData(
                    this.state.editorState,
                    { 'ul': undefined }
                )
            );             
        }
    }

    toggleInlineStyle = (inlineStyle: any) => {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    toggleColorStyle = (color: any) => {
        this.onChange(
            InlineUtils.toggleCustomInlineStyle(
                this.state.editorState,
                'color',
                color.target.value
            )
        );
    }

    toggleBgColorStyle = (color: any) => {
        this.onChange(
            InlineUtils.toggleCustomInlineStyle(
                this.state.editorState,
                'bgcolor',
                color.target.value
            )
        );
    }    

    toggleFontSize = (fontSize: any) => {
        this.onChange(
            InlineUtils.toggleCustomInlineStyle(
                this.state.editorState,
                'fontSize',
                fontSize
            )
        );
    }

    toggleFontFamily = (fontFamily: any) => {
        this.onChange(
            InlineUtils.toggleCustomInlineStyle(
                this.state.editorState,
                'fontFamily',
                fontFamily
            )
        );        
    }

    toggleTextAlign = (textAlign: any) => {
        const currentTextAlignment = BlockUtils.getSelectedBlocksMetadata(this.state.editorState).get('text-align');
        if (currentTextAlignment !== textAlign) {
            this.onChange(
                BlockUtils.mergeBlockData(
                    this.state.editorState,
                    { 'text-align': textAlign.target.value }
                )
            );  
        } else {
            this.onChange(
                BlockUtils.mergeBlockData(
                    this.state.editorState,
                    { 'text-align': undefined }
                )
            );             
        }
         
    }

    blockStyleFn = (block: any): string => {
        const blockAlignment = block.getData() && block.getData().get('text-align');
        const blockUlType = block.getData() && block.getData().get('ul');
                
        return this.getListItemClasses(blockAlignment, blockUlType);
    }

    getListItemClasses = (align: string | undefined, ulType: string | undefined) => {
        return cx({
            'block-aligned-center': align === 'center',
            'block-aligned-justify': align === 'justify',
            'block-aligned-right': align === 'right',
            'block-aligned-left': align === 'left',
            'ulType-circle': ulType === 'circle',
        });
    }

    render() {
        const { editorState } = this.state;
        console.log(editorState);

        return (
            <div className="RichEditor-root">
                <div id="msGrid" style={{ height: '24px', width: '100%'}}>
                    Sass Test
                </div>
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                    onToggleClass={this.toggleBlockTypeClass}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <TextAlignControls
                    editorState={editorState}
                    onToggle={this.toggleTextAlign}                
                />
                FontSize:<FontSizeControls
                    editorState={editorState}
                    onToggle={this.toggleFontSize}                    
                />
                &nbsp;&nbsp;FontFamily:<FontFamilyControls
                    editorState={editorState}
                    onToggle={this.toggleFontFamily}                    
                />
                &nbsp;&nbsp;Color:<ColorControls
                    editorState={editorState}
                    onToggle={this.toggleColorStyle}                     
                />
                &nbsp;&nbsp;BgColor:<BgColorControls
                    editorState={editorState}
                    onToggle={this.toggleBgColorStyle}                     
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
                        blockStyleFn={this.blockStyleFn}
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

export class StyleSelect extends React.Component<any, any> {
    constructor(props: any) {
        super(props);
    }

    onToggle = (value: any) => {
        this.props.onToggle(value);
    }

    render() {
        const { selected, options } = this.props;

        return (
            <Select value={selected} style={{ width: 100 }} onChange={this.onToggle}>
                {
                    options.map(
                        (option: any) => {
                            return <Select.Option value={option} key={option}>{option}</Select.Option>;
                        }
                    )
                }
            </Select>
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
            <StyleButton
                key={'circle'}
                active={'circle' === blockType}
                label={'circle'}
                onToggle={props.onToggleClass}
                style={'circle'}
            />            
        </div>
    );
};

const FONT_SIZE: any = [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96];
const FontSizeControls: any = (props: any) => {
    const { editorState } = props;
    let fontSize: any = InlineUtils.getSelectionCustomInlineStyle(editorState, ['FONTSIZE']).FONTSIZE
    if (fontSize) {
        fontSize = fontSize.substring(9);
    }

    return (
        <StyleSelect selected={fontSize} options={FONT_SIZE} onToggle={props.onToggle} />
    );
}

const FONT_FAMILY: any = ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'];
const FontFamilyControls: any = (props: any) => {
    const { editorState } = props;
    let fontFamily: any = InlineUtils.getSelectionCustomInlineStyle(editorState, ['FONTFAMILY']).FONTFAMILY
    if (fontFamily) {
        fontFamily = fontFamily.substring(11);
    }

    return (
        <StyleSelect selected={fontFamily} options={FONT_FAMILY} onToggle={props.onToggle} />
    );
}

const COLOR_LIST = ['black', 'red', 'orange', 'blue'];
const ColorControls: any = (props: any) => {
    const { editorState } = props;
    let colorStyle: any = InlineUtils.getSelectionCustomInlineStyle(editorState, ['COLOR']).COLOR
    if (colorStyle) {
        colorStyle = colorStyle.substring(6);
    }

    return (
        <Radio.Group value={colorStyle} onChange={props.onToggle}>
            {
                COLOR_LIST.map(
                    (color: any) => {
                        return <Radio.Button value={color} key={color} style={{color: color}}>{color}</Radio.Button>
                    }
                )
            }
        </Radio.Group>
    );
}

const BgColorControls: any = (props: any) => {
    const { editorState } = props;
    let colorStyle: any = InlineUtils.getSelectionCustomInlineStyle(editorState, ['BGCOLOR']).BGCOLOR
    if (colorStyle) {
        colorStyle = colorStyle.substring(8);
    }

    return (
        <Radio.Group value={colorStyle} onChange={props.onToggle}>
            {
                COLOR_LIST.map(
                    (color: any) => {
                        return <Radio.Button value={color} key={color} style={{color: color}}>{color}</Radio.Button>
                    }
                )
            }
        </Radio.Group>
    );
}

const TEXT_ALIGN = ['left', 'center', 'right', 'justify'];
const TextAlignControls: any = (props: any) => {
    const { editorState } = props;
    let textAlign: Map<any, any> = BlockUtils.getSelectedBlocksMetadata(editorState).get('text-align');

    return (
        <div className="RichEditor-controls">
            TextAlign:
            <Radio.Group value={textAlign} onChange={props.onToggle}>
                {
                    TEXT_ALIGN.map(
                        (align: any) => {
                            return <Radio.Button value={align} key={align}>{align}</Radio.Button>
                        }
                    )
                }
            </Radio.Group>
        </div>
    );
}
