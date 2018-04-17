import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
    DraftStyleDefault_block
} from '../../assets/DraftStyleDefault';
import { IDraftEditorBlockProps } from './DraftEditorBlock.Props';
import { DraftEditorLeaf } from '../DraftEditorLeaf/DraftEditorLeaf';

import { SelectionState } from '../../model/immutable/SelectionState';
import { ContentBlock } from '../../model/immutable/ContentBlock';

import { DraftOffsetKey } from '../../selection/DraftOffsetKey';
import { utils } from '../../utils/fbjs';
const { getElementPosition, getScrollPosition, getViewportDimensions, invariant, Scroll, Style } = utils;

const SCROLL_BUFFER: number = 10;

export class DraftEditorBlock extends React.Component<IDraftEditorBlockProps, any> {
    public shouldComponentUpdate(nextProps: IDraftEditorBlockProps): boolean {
        return (
            this.props.block !== nextProps.block ||
            this.props.tree !== nextProps.tree ||
            // TODO this.props.direction !== nextProps.direction ||
            (isBlockOnSelectionEdge(nextProps.selection, nextProps.block.getKey()) &&
                nextProps.forceSelection)
        );
    }

    public componentDidMount(): void {
        const selection: SelectionState = this.props.selection;
        const endKey: string = selection.getEndKey();
        if (!selection.getHasFocus() || endKey !== this.props.block.getKey()) {
            return;
        }

        const blockNode: any = ReactDOM.findDOMNode(this);
        const scrollParent: any = Style.getScrollParent(blockNode);
        const scrollPosition: any = getScrollPosition(scrollParent);
        let scrollDelta: number;

        if (scrollParent === window) {
            const nodePosition: any = getElementPosition(blockNode);
            const nodeBottom: number = nodePosition.y + nodePosition.height;
            const viewportHeight: number = getViewportDimensions().height;
            scrollDelta = nodeBottom - viewportHeight;
            if (scrollDelta > 0) {
                window.scrollTo(
                    scrollPosition.x,
                    scrollPosition.y + scrollDelta + SCROLL_BUFFER
                );
            }
        } else {
            invariant(
                blockNode instanceof HTMLElement,
                'blockNode is not an HTMLElement'
            );
            const blockBottom: number = blockNode.offsetHeight + blockNode.offsetTop;
            const scrollBottom: number = scrollParent.offsetHeight + scrollPosition.y;
            scrollDelta = blockBottom - scrollBottom;
            if (scrollDelta > 0) {
                Scroll.setTop(
                    scrollParent,
                    Scroll.getTop(scrollParent) + scrollDelta + SCROLL_BUFFER
                );
            }
        }
    }

    public render(): React.ReactNode {
        const { offsetKey } = this.props;
        // TODO className

        return (
            <div data-offset-key={offsetKey} style={DraftStyleDefault_block}>
                {this._renderChildren()}
            </div>
        );
    }

    private _renderChildren(): Array<React.ReactElement<any>> {
        const block: ContentBlock = this.props.block;
        const blockKey: string = block.getKey();
        const text: string = block.getText();
        const lastLeafSet: number = this.props.tree.size - 1;
        const hasSelection: boolean = isBlockOnSelectionEdge(this.props.selection, blockKey);

        return this.props.tree
            .map((leafSet, ii) => {
                const leavesForLeafSet: any = leafSet.get('leaves');
                const lastLeaf: number = leavesForLeafSet.size - 1;
                const leaves: any = leavesForLeafSet
                    .map((leaf: any, jj: number) => {
                        const offsetKey: string = DraftOffsetKey.encode(blockKey, jj);
                        const start: number = leaf.get('start');
                        const end: number = leaf.get('end');

                        return (
                            /* $FlowFixMe(>=0.53.0 site=www,mobile) This comment suppresses an
                         * error when upgrading Flow's support for React. Common errors found
                         * when upgrading Flow's React support are documented at
                         * https://fburl.com/eq7bs81w */
                            <DraftEditorLeaf
                                key={offsetKey}
                                offsetKey={offsetKey}
                                block={block}
                                start={start}
                                selection={hasSelection ? this.props.selection : undefined}
                                forceSelection={this.props.forceSelection}
                                text={text.slice(start, end)}
                                styleSet={block.getInlineStyleAt(start)}
                                // customStyleMap={this.props.customStyleMap}
                                // customStyleFn={this.props.customStyleFn}
                                isLast={ii === lastLeafSet && jj === lastLeaf}
                                inlineStyleRenderMap={this.props.inlineStyleRenderMap}
                            />
                        );
                    })
                    .toArray();

                return leaves;
                // TODO decorator
            })
            .toArray();
    }
}

/**
 * 返回一个块是否与`SelectionState`的任一边重叠
 */
function isBlockOnSelectionEdge(
    selection: SelectionState,
    key: string
): boolean {
    return selection.getAnchorKey() === key || selection.getFocusKey() === key;
}
