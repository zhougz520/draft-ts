import * as React from 'react';

import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { ColorPicker } from 'office-ui-fabric-react/lib/ColorPicker';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';

import { DraftPublic } from '../../../src';
const { DefaultDraftInlineStyle } = DraftPublic;

const ButtonDivStyle = {
    display: 'inline-block'
};

export class CustColorPicker extends React.Component<any, any> {
    private _menuButtonElement: HTMLElement | null = null;

    constructor(props: any) {
        super(props);

        this.state = {
            isCalloutVisible: false
        };
    }

    render() {
        const { isCalloutVisible } = this.state;

        const currentColor = DefaultDraftInlineStyle
            .getSelectionCustomInlineStyle(this.props.editorState, ['COLOR']).COLOR;
        const color = currentColor && currentColor.substring(6);

        return (
            <div>
                <div
                    style={ButtonDivStyle}
                    ref={(menuButton) => this._menuButtonElement = menuButton}
                >
                    <DefaultButton
                        text={'COLOR'}
                        onClick={this._onShowCallout}
                    />
                </div>
                {
                    isCalloutVisible && (
                        <Callout
                            gapSpace={0}
                            role={'alertdialog'}
                            target={this._menuButtonElement}
                            onDismiss={this._colorPickerOnDismiss}
                            directionalHint={DirectionalHint.rightBottomEdge}
                            beakWidth={5}
                        >
                            <ColorPicker
                                color={color ? color : '#000000'}
                                onColorChanged={this.props.onToggle}
                                alphaSliderHidden
                            />
                        </Callout>
                    )
                }
            </div>
        );
    }

    _onShowCallout = () => {
        this.setState({
            isCalloutVisible: !this.state.isCalloutVisible
        });
    }

    _colorPickerOnDismiss = () => {
        this.setState({
            isCalloutVisible: false
        });
    }
}
