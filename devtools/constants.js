// Shared protocol constants for Three.js DevTools, assigned to the global object
// so every script that loads this file can read them
Object.assign( globalThis, {

	MESSAGE_ID: 'three-devtools',

	// Tells the background script which tab this panel inspects
	MESSAGE_INIT: 'init',

	// Requests from the panel (panel -> background -> content script -> bridge)
	MESSAGE_REQUEST_STATE: 'request-state',
	MESSAGE_REQUEST_OBJECT_DETAILS: 'request-object-details',
	MESSAGE_SCROLL_TO_CANVAS: 'scroll-to-canvas',
	MESSAGE_HIGHLIGHT_OBJECT: 'highlight-object',
	MESSAGE_UNHIGHLIGHT_OBJECT: 'unhighlight-object',

	// Events dispatched by three.js on window.__THREE_DEVTOOLS__
	EVENT_REGISTER: 'register',
	EVENT_OBSERVE: 'observe',

	// Events sent to the panel
	EVENT_RENDERER: 'renderer',
	EVENT_SCENE: 'scene',
	EVENT_SCENE_REMOVED: 'scene-removed',
	EVENT_OBJECT_DETAILS: 'object-details',
	EVENT_COMMITTED: 'committed'

} );
