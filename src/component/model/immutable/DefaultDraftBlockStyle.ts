import * as React from 'react';

import { DraftStyleDefault_ul, DraftStyleDefault_ol } from '../../assets/DraftStyleDefault';
import { Map } from 'immutable';

const UL_WRAP: JSX.Element = React.createElement('ul', {style: DraftStyleDefault_ul});
const OL_WRAP: JSX.Element = React.createElement('ol', {style: DraftStyleDefault_ol});
const PRE_WRAP: JSX.Element = React.createElement('pre');

export const DefaultDraftBlockStyle: any = Map({
    // H1
    'header-one': {
        element: 'h1'
    },

    // H2
    'header-two': {
        element: 'h2'
    },

    // H3
    'header-three': {
        element: 'h3'
    },

    // H4
    'header-four': {
        element: 'h4'
    },

    // H5
    'header-five': {
        element: 'h5'
    },

    // H6
    'header-six': {
        element: 'h6'
    },

    // 无序列表
    'unordered-list-item': {
        element: 'li',
        wrapper: UL_WRAP
    },

    // 有序列表
    'ordered-list-item': {
        element: 'li',
        wrapper: OL_WRAP
    },

    // 块引用
    'blockquote': {
        element: 'blockquote'
    },

    // 流内容
    'atomic': {
        element: 'figure'
    },

    // 代码块
    'code-block': {
        element: 'pre',
        wrapper: PRE_WRAP
    },

    // 无
    'unstyled': {
        element: 'div',
        aliasedElements: ['p']
    }
});

/**
 * 初始化编辑器中InlineStyle映射
 */
export const getDraftBlockStyleMap = () => {
    return DefaultDraftBlockStyle;
};
