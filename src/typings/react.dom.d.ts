import 'react';

declare module 'react' {
    /* tslint:disable:interface-name */
    interface DOMAttributes<T> {
        onBeforeInput?: FormEventHandler<T>;
    }
    /* tslint:enable:interface-name */
}
