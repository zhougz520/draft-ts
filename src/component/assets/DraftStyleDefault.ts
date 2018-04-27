import * as React from 'react';

export const DraftStyleDefault_block: React.CSSProperties = {
    position: 'relative',
    whiteSpace: 'pre-wrap'
};

export const DraftStyleDefault_depth = (depth: number): string => {
    if (depth === 0) {
        return '';
    } else {
        return 'ql-indent-' + depth;
    }
};
