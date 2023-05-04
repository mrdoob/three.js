const platform = {

	updateplatform( params ) {

		this.AudioContext = params.AudioContext;
		this.fetch = params.fetch;
		this.Request = params.Request;
		this.Headers = params.Headers;
		this.createElementNS = params.createElementNS;
		this.animationContext = {

			requestAnimationFrame: params.requestAnimationFrame,
			cancelAnimationFrame: params.cancelAnimationFrame,

		};
		this.devicePixelRatio = params.devicePixelRatio;

	},

	setProperties( properties ) {

		this.properties = Object.assign( this.properties ?? {}, properties );

	}

};

if ( typeof window !== 'undefined' && typeof window.window !== 'undefined' ) {

	// When running three.js in a virtual dom environment like jsdom, the window object
	// may not contains all the members that are required by the platform, so we should
	// check these memebers before updating the platform. You should update the platform
	// manually when the check is failed.
	if ( ( window.AudioContext || window.webkitAudioContext ) &&
			window.fetch &&
			window.Request &&
			window.Headers &&
			document.createElementNS &&
			window.requestAnimationFrame &&
			window.cancelAnimationFrame &&
			window.devicePixelRatio !== undefined ) {

		platform.updateplatform( {

			AudioContext: ( window.AudioContext || window.webkitAudioContext ).bind( window ),
			fetch: window.fetch.bind( window ),
			Request: window.Request.bind( window ),
			Headers: window.Headers.bind( window ),
			createElementNS: document.createElementNS.bind( document ),
			requestAnimationFrame: window.requestAnimationFrame.bind( window ),
			cancelAnimationFrame: window.cancelAnimationFrame.bind( window ),
			devicePixelRatio: () => {

				return window.devicePixelRatio;

			},

		} );

	}

}

export { platform };
