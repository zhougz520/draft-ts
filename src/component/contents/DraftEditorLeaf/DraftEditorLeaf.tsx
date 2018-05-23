import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { IDraftEditorLeafProps } from './DraftEditorLeaf.Props';
import { DraftEditorTextNode } from '../DraftEditorTextNode/DraftEditorTextNode';

import { setDraftEditorSelection } from '../../selection/setDraftEditorSelection';
import { utils } from '../../utils/fbjs';
const { invariant } = utils;

/**
 * 所有的Leaf都有单独的TextNode,用于区分不同的样式渲染
 */
export class DraftEditorLeaf extends React.Component<IDraftEditorLeafProps, any> {
    public leaf: HTMLElement | null = null;

    public shouldComponentUpdate(nextProps: IDraftEditorLeafProps): boolean {
        const leafNode: Element = ReactDOM.findDOMNode(this.leaf as HTMLElement) as Element;
        invariant(leafNode, 'Missing leafNode');

        return (
            leafNode.textContent !== nextProps.text ||
            nextProps.styleSet !== this.props.styleSet ||
            nextProps.forceSelection
        );
    }

    public componentDidUpdate(): void {
        this._setSelection();
    }

    public componentDidMount(): void {
        this._setSelection();
    }

    public render(): React.ReactNode {
        const { isLast, offsetKey } = this.props;
        let { text } = this.props;

        // If the leaf is at the end of its block and ends in a soft newline, append
        // an extra line feed character. Browsers collapse trailing newline
        // characters, which leaves the cursor in the wrong place after a
        // shift+enter. The extra character repairs this.
        if (text.endsWith('\n') && isLast) {
            text += '\n';
        }

        // TODO customStyleMap, customStyleFn
        const { styleSet, inlineStyleRenderMap } = this.props;

        const styleObj = styleSet.reduce((map: any, styleName) => {
            const mergedStyles: any = {};
            const style: any = inlineStyleRenderMap[styleName as string];

            if (style !== undefined && map.textDecoration !== style.textDecoration) {
                // .trim() is necessary for IE9/10/11 and Edge
                mergedStyles.textDecoration = [map.textDecoration, style.textDecoration]
                    .join(' ')
                    .trim();
            }

            return Object.assign(map, style, mergedStyles);
        }, {});

        return (
            <span
                data-offset-key={offsetKey}
                ref={(ref: HTMLElement | null) => (this.leaf = ref)}
                style={styleObj}
            >
                <DraftEditorTextNode>{text}</DraftEditorTextNode>
            </span>
        );
    }

    private _setSelection(): void {
        const { selection } = this.props;

        if (selection == null || !selection.getHasFocus()) {
            return;
        }

        const { block, start, text } = this.props;
        const blockKey: string = block.getKey();
        const end: number = start + text.length;
        if (!selection.hasEdgeWithin(blockKey, start, end)) {
            return;
        }

        const node: Node | null = ReactDOM.findDOMNode(this);
        invariant(node, 'Missing node');
        const child: Node | null = (node as Node).firstChild;
        invariant(child, 'Missing child');
        let targetNode: Node | null;

        if ((child as Node).nodeType === Node.TEXT_NODE) {
            targetNode = child;
        } else if ((child as Node).nodeName === 'BR') {
            // TODO if child.tagName
            targetNode = node;
        } else {
            targetNode = (child as Node).firstChild as Node | null;
            invariant(targetNode, 'Missing targetNode');
        }

        setDraftEditorSelection(selection, targetNode as Node, blockKey, start, end);
    }
}
