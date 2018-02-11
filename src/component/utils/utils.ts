const containsNode = require('fbjs/lib/containsNode');
const emptyFunction = require('fbjs/lib/emptyFunction');
const getActiveElement = require('fbjs/lib/getActiveElement');
const getElementPosition = require('fbjs/lib/getElementPosition');
const getScrollPosition = require('fbjs/lib/getScrollPosition');
const getViewportDimensions = require('fbjs/lib/getViewportDimensions');
const invariant = require('fbjs/lib/invariant');
const Keys = require('fbjs/lib/Keys');
const nullthrows = require('fbjs/lib/nullthrows');
const Scroll = require('fbjs/lib/Scroll');
const setImmediate = require('fbjs/lib/setImmediate');
const Style = require('fbjs/lib/Style');
const UnicodeUtils = require('fbjs/lib/UnicodeUtils');
const UserAgent = require('fbjs/lib/UserAgent');

export const utils: any = {
    containsNode,
    emptyFunction,
    getActiveElement,
    getElementPosition,
    getScrollPosition,
    getViewportDimensions,
    invariant,
    Keys,
    nullthrows,
    Scroll,
    setImmediate,
    Style,
    UnicodeUtils,
    UserAgent
};
