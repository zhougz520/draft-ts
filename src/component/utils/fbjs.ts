/* tslint:disable:no-var-requires */
const containsNode = require('fbjs/lib/containsNode');
const cx = require('fbjs/lib/cx');
const emptyFunction = require('fbjs/lib/emptyFunction');
const getActiveElement = require('fbjs/lib/getActiveElement');
const getElementPosition = require('fbjs/lib/getElementPosition');
const getScrollPosition = require('fbjs/lib/getScrollPosition');
const getViewportDimensions = require('fbjs/lib/getViewportDimensions');
const invariant = require('fbjs/lib/invariant');
const joinClasses = require('fbjs/lib/joinClasses');
const Keys = require('fbjs/lib/Keys');
const nullthrows = require('fbjs/lib/nullthrows');
const Scroll = require('fbjs/lib/Scroll');
const setImmediate = require('fbjs/lib/setImmediate');
const Style = require('fbjs/lib/Style');
const UnicodeUtils = require('fbjs/lib/UnicodeUtils');
const UserAgent = require('fbjs/lib/UserAgent');
/* tslint:enable:no-var-requires */

export const utils: any = {
    cx,
    containsNode,
    emptyFunction,
    getActiveElement,
    getElementPosition,
    getScrollPosition,
    getViewportDimensions,
    invariant,
    joinClasses,
    Keys,
    nullthrows,
    Scroll,
    setImmediate,
    Style,
    UnicodeUtils,
    UserAgent
};
