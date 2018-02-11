import * as React from 'react';

export const DraftStyleDefault_block: React.CSSProperties = {
    position: 'relative',
    whiteSpace: 'pre-wrap'
};

export const DraftStyleDefault_ul: React.CSSProperties = {
    margin: '0 16px',
    padding: '0'
};

export const DraftStyleDefault_ol: React.CSSProperties = {
    margin: '0 16px',
    padding: '0'
};

export const DraftStyleDefault_depth = (depth: number): React.CSSProperties => {
    const styleObj: React.CSSProperties = {
        marginLeft: 1.5 * depth + 'em'
    };

    return styleObj;
};
