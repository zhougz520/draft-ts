import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Example from './example/index';

// React Render
const MOUNT_NODE = document.getElementById('root');

let render = () => {
    ReactDOM.render(
        <Example />,
        MOUNT_NODE
    );
};

if ((module as any).hot) {
    // Development render functions
    const renderApp = render;
    const renderError = (error: any) => {
        const RedBox = require('redbox-react').default;
        ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
    };

      // Wrap render in try/catch
    render = () => {
        try {
            renderApp();
        } catch (error) {
            renderError(error);
        }
    };
}

render();
