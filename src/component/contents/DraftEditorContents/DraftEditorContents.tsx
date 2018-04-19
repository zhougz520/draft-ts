import * as React from 'react';

import { DraftStyleDefault_depth } from '../../assets/DraftStyleDefault';
import { IDraftEditorContentsProps } from './DraftEditorContents.Props';
import { DraftEditorBlock } from '../DraftEditorBlock/DraftEditorBlock';

import { EditorState } from '../../model/immutable/EditorState';
import { ContentState } from '../../model/immutable/ContentState';
import { SelectionState } from '../../model/immutable/SelectionState';
import { ContentBlock } from '../../model/immutable/ContentBlock';

import { DraftOffsetKey } from '../../selection/DraftOffsetKey';

import { utils } from '../../utils/fbjs';
const { joinClasses } = utils;

import '../../assets/Sass/Indent.scss';
import '../../assets/Sass/TextAlign.scss';

export class DraftEditorContents extends React.Component<IDraftEditorContentsProps, any> {
    public shouldComponentUpdate(nextProps: IDraftEditorContentsProps): boolean {
        const prevEditorState: EditorState = this.props.editorState;
        const nextEditorState: EditorState = nextProps.editorState;

        // TODO prevDirectionMap\nextDirectionMap

        const didHaveFocus: boolean = prevEditorState.getSelection().getHasFocus();
        const nowHasFocus: boolean = nextEditorState.getSelection().getHasFocus();

        if (didHaveFocus !== nowHasFocus) {
            return true;
        }

        const nextNativeContent: ContentState | null = nextEditorState.getNativelyRenderedContent();

        const wasComposing: boolean = prevEditorState.isInCompositionMode();
        const nowComposing: boolean = nextEditorState.isInCompositionMode();

        if (
            prevEditorState === nextEditorState ||
            (nextNativeContent !== null &&
                nextEditorState.getCurrentContent() === nextNativeContent) ||
            (wasComposing && nowComposing)
        ) {
            return false;
        }

        const prevContent: ContentState = prevEditorState.getCurrentContent();
        const nextContent: ContentState = nextEditorState.getCurrentContent();
        // TODO prevDecorator\nextDecorator

        return (
            prevContent !== nextContent ||
            nextEditorState.mustForceSelection()
        );
    }

    public render(): React.ReactNode {
        const { editorState, blockStyleRenderMap, inlineStyleRenderMap } = this.props;

        const content: ContentState = editorState.getCurrentContent();
        const selection: SelectionState = editorState.getSelection();
        const forceSelection: boolean = editorState.mustForceSelection();
        // TODO decorator
        // TODO directionMap

        const blocksAsArray: ContentBlock[] = content.getBlocksAsArray();
        const processedBlocks: any[] = [];

        for (let ii: number = 0; ii < blocksAsArray.length; ii++) {
            const block: ContentBlock = blocksAsArray[ii];
            const key: string = block.getKey();
            const blockType: string = block.getType();

            const offsetKey: string = DraftOffsetKey.encode(key, 0);
            const componentProps: any = {
                contentState: content,
                block,
                forceSelection,
                key,
                offsetKey,
                selection,
                tree: editorState.getBlockTree(key),
                inlineStyleRenderMap
            };

            const configForType =
                blockStyleRenderMap.get(blockType) || blockStyleRenderMap.get('unstyled');
            const wrapperTemplate: any = configForType.wrapper;

            const Element: any =
                configForType.element || blockStyleRenderMap.get('unstyled').element;

            const depth: number = block.getDepth();
            let className: string = this.props.blockStyleFn(block);;

            if (Element === 'li') {
                className = joinClasses(className, DraftStyleDefault_depth(depth));
            }

            const Component: typeof DraftEditorBlock = DraftEditorBlock;
            const childProps: any = {
                className,
                'data-block': true,
                /* $FlowFixMe(>=0.53.0 site=www,mobile) This comment suppresses an
                 * error when upgrading Flow's support for React. Common errors found
                 * when upgrading Flow's React support are documented at
                 * https://fburl.com/eq7bs81w */
                'data-editor': this.props.editorKey,
                'data-offset-key': offsetKey,
                key
            };

            const child: React.DetailedReactHTMLElement<any, HTMLElement> = React.createElement(
                Element,
                childProps,
                /* $FlowFixMe(>=0.53.0 site=www,mobile) This comment suppresses an
                 * error when upgrading Flow's support for React. Common errors found
                 * when upgrading Flow's React support are documented at
                 * https://fburl.com/eq7bs81w */
                <Component {...componentProps} />
            ) as any;

            processedBlocks.push({
                block: child,
                wrapperTemplate,
                key,
                offsetKey
            });
        }

        const outputBlocks: any[] = [];
        for (let ii = 0; ii < processedBlocks.length;) {
            const info = processedBlocks[ii];
            if (info.wrapperTemplate) {
                const blocks: ContentBlock[] = [];
                do {
                    blocks.push(processedBlocks[ii].block);
                    ii++;
                } while (
                    ii < processedBlocks.length &&
                    processedBlocks[ii].wrapperTemplate === info.wrapperTemplate
                );
                const wrapperElement = React.cloneElement(
                    info.wrapperTemplate,
                    {
                        'key': info.key + '-wrap',
                        'data-offset-key': info.offsetKey
                    },
                    blocks
                );
                outputBlocks.push(wrapperElement);
            } else {
                outputBlocks.push(info.block);
                ii++;
            }
        }

        return <div data-contents="true">{outputBlocks}</div>;
    }

}
