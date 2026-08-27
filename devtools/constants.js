/* eslint-disable no-unused-vars */
// Shared protocol constants for Three.js DevTools

var MESSAGE_ID = 'three-devtools';

// Name of the highlight clone highlight.js adds to the scene
var HIGHLIGHT_NAME = '__THREE_DEVTOOLS_HIGHLIGHT__';

// Requests from the panel (panel -> background -> content script -> bridge)
var MESSAGE_INIT = 'init';
var MESSAGE_REQUEST_STATE = 'request-state';
var MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
var MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
var MESSAGE_HIGHLIGHT_OBJECT = 'highlight-object';
var MESSAGE_UNHIGHLIGHT_OBJECT = 'unhighlight-object';

// Events dispatched by three.js on window.__THREE_DEVTOOLS__
var EVENT_REGISTER = 'register';
var EVENT_OBSERVE = 'observe';

// Events sent to the panel
var EVENT_RENDERER = 'renderer';
var EVENT_SCENE = 'scene';
var EVENT_SCENE_REMOVED = 'scene-removed';
var EVENT_OBJECT_DETAILS = 'object-details';
var EVENT_COMMITTED = 'committed';
