import * as React from 'react';

export const DraftEditor_root = (align?: string): React.CSSProperties => {
    const styleObj: React.CSSProperties = {
        height: 'inherit',
        textAlign: 'inherit',
        position: 'relative'
    };
    if (align) {
        styleObj.textAlign = align;
    }

    return styleObj;
};

export const DraftEditor_editorContainer: React.CSSProperties = {
    height: 'height',
    textAlign: 'initial',
    backgroundColor: '#ffffff',
    borderLeft: '0.1px solid transparent',
    position: 'relative',
    zIndex: 1
};
