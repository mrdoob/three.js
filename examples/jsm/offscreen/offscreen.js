import { init } from './scene.js';

/* @__PURE__ */ ( () => {

	self.onmessage = function ( message ) {

		const data = message.data;
		init( data.drawingSurface, data.width, data.height, data.pixelRatio, data.path );

	};

} )();
