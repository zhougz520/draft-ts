import * as React from 'react';

export const DraftStyleDefault_block: React.CSSProperties = {
    position: 'relative',
    whiteSpace: 'pre-wrap'
};

export const DraftStyleDefault_depth = (depth: number): string => {
    return 'ql-indent-' + depth;
};
