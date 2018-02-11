import 'react';

declare module 'react' {
    interface DOMAttributes<T> {
        onBeforeInput?: FormEventHandler<T>;
    }
}
