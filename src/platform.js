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

	}

};

if ( typeof window !== 'undefined' && typeof window.window !== 'undefined' ) {

	platform.updateplatform( {

		AudioContext: ( window.AudioContext || window.webkitAudioContext ).bind( window ),
		fetch: window.fetch.bind( window ),
		Request: window.Request.bind( window ),
		Headers: window.Headers.bind( window ),
		createElementNS: document.createElementNS.bind( document ),
		requestAnimationFrame: window.requestAnimationFrame.bind( window ),
		cancelAnimationFrame: window.cancelAnimationFrame.bind( window ),

	} );

}

export { platform };
