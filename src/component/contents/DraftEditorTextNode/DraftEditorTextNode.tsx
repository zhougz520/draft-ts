import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { IDraftEditorTextNodeProps } from './DraftEditorTextNode.Props';

/**
 * 在IE中，<br>会被渲染成2条新行
 * 通过换行符可以确保只渲染1条新行
 */
const useNewlineChar: boolean = false;

/**
 * 检查节点是否换行符
 */
function isNewline(node: Element): boolean {
    return useNewlineChar ? node.textContent === '\n' : node.tagName === 'BR';
}

const NEWLINE_A: JSX.Element = useNewlineChar ? (
    <span key="A" data-text="true">
        {'\n'}
    </span>
) : (
        <br key="A" data-text="true" />
    );

const NEWLINE_B: JSX.Element = useNewlineChar ? (
    <span key="B" data-text="true">
        {'\n'}
    </span>
) : (
        <br key="B" data-text="true" />
    );

/**
 * 'DraftEditor'中最低级别的组件，文本节点组件
 * 执行自定义的换行符处理
 * 编辑状态
 */
export class DraftEditorTextNode extends React.Component<IDraftEditorTextNodeProps, any> {
    private _forceFlag: boolean;

    public constructor(props: IDraftEditorTextNodeProps) {
        super(props);

        this._forceFlag = false;
    }

    public shouldComponentUpdate(nextProps: IDraftEditorTextNodeProps): boolean {
        const node: Element = ReactDOM.findDOMNode(this);
        const shouldBeNewline: boolean = nextProps.children === '';

        if (shouldBeNewline) {
            return !isNewline(node);
        }

        return node.textContent !== nextProps.children;
    }

    public componentWillUpdate(): void {
        // By flipping this flag, we also keep flipping keys which forces
        // React to remount this node every time it rerenders.
        this._forceFlag = !this._forceFlag;
    }

    public render(): React.ReactNode {
        if (this.props.children === '') {
            return this._forceFlag ? NEWLINE_A : NEWLINE_B;
        }

        return (
            <span key={this._forceFlag ? 'A' : 'B'} data-text="true">
                {this.props.children}
            </span>
        );
    }
}
