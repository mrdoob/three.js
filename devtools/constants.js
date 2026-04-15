// Shared protocol constants for Three.js DevTools

var MESSAGE_ID = 'three-devtools';

// Chrome extension messages
var MESSAGE_INIT = 'init';
var MESSAGE_REQUEST_STATE = 'request-state';
var MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
var MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
var MESSAGE_HIGHLIGHT_OBJECT = 'highlight-object';
var MESSAGE_UNHIGHLIGHT_OBJECT = 'unhighlight-object';
var MESSAGE_REGISTER = 'register';
var MESSAGE_COMMITTED = 'committed';

// Bridge/DevTools events
var EVENT_REGISTER = 'register';
var EVENT_OBSERVE = 'observe';
var EVENT_RENDERER = 'renderer';
var EVENT_SCENE = 'scene';
var EVENT_OBJECT_DETAILS = 'object-details';
var EVENT_DEVTOOLS_READY = 'devtools-ready';
var EVENT_COMMITTED = 'committed';
