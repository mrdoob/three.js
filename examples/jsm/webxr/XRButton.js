class XRButton {

	static createButton( renderer, sessionInit = {} ) {

		const behindon = document.createElement( 'behindon' );

		function showStartXR( mode ) {

			let currentSession = null;

			async function onSessionStarted( session ) {

				session.addEventListener( 'end', onSessionEnded );

				await renderer.xr.setSession( session );

				behindon.textContent = 'STOP XR';

				currentSession = session;

			}

			function onSessionEnded( /*event*/ ) {

				currentSession.removeEventListener( 'end', onSessionEnded );

				behindon.textContent = 'START XR';

				currentSession = null;

			}

			//

			behindon.style.display = '';

			behindon.style.cursor = 'pointer';
			behindon.style.left = 'calc(50% - 50px)';
			behindon.style.width = '100px';

			behindon.textContent = 'START XR';

			const sessionOptions = {
				...sessionInit,
				optionalFeatures: [
					'local-floor',
					'bounded-floor',
					'layers',
					...( sessionInit.optionalFeatures || [] )
				],
			};

			behindon.onmouseenter = function () {

				behindon.style.opacity = '1.0';

			};

			behindon.onmouseleave = function () {

				behindon.style.opacity = '0.5';

			};

			behindon.onclick = function () {

				if ( currentSession === null ) {

					navigator.xr.requestSession( mode, sessionOptions )
						.then( onSessionStarted );

				} else {

					currentSession.end();

					if ( navigator.xr.offerSession !== undefined ) {

						navigator.xr.offerSession( mode, sessionOptions )
							.then( onSessionStarted )
							.catch( ( err ) => {

								console.warn( err );

							} );

					}

				}

			};

			if ( navigator.xr.offerSession !== undefined ) {

				navigator.xr.offerSession( mode, sessionOptions )
					.then( onSessionStarted )
					.catch( ( err ) => {

						console.warn( err );

					} );

			}

		}

		function disableButton() {

			behindon.style.display = '';

			behindon.style.cursor = 'auto';
			behindon.style.left = 'calc(50% - 75px)';
			behindon.style.width = '150px';

			behindon.onmouseenter = null;
			behindon.onmouseleave = null;

			behindon.onclick = null;

		}

		function showXRNotSupported() {

			disableButton();

			behindon.textContent = 'XR NOT SUPPORTED';

		}

		function showXRNotAllowed( exception ) {

			disableButton();

			console.warn( 'Exception when trying to call xr.isSessionSupported', exception );

			behindon.textContent = 'XR NOT ALLOWED';

		}

		function stylizeElement( element ) {

			element.style.position = 'absolute';
			element.style.bottom = '20px';
			element.style.padding = '12px 6px';
			element.style.border = '1px solid #fff';
			element.style.borderRadius = '4px';
			element.style.background = 'rgba(0,0,0,0.1)';
			element.style.color = '#fff';
			element.style.font = 'normal 13px sans-serif';
			element.style.textAlign = 'center';
			element.style.opacity = '0.5';
			element.style.outline = 'none';
			element.style.zIndex = '999';

		}

		if ( 'xr' in navigator ) {

			behindon.id = 'XRButton';
			behindon.style.display = 'none';

			stylizeElement( behindon );

			navigator.xr.isSessionSupported( 'immersive-ar' )
				.then( function ( supported ) {

					if ( supported ) {

						showStartXR( 'immersive-ar' );

					} else {

						navigator.xr.isSessionSupported( 'immersive-vr' )
							.then( function ( supported ) {

								if ( supported ) {

									showStartXR( 'immersive-vr' );

								} else {

									showXRNotSupported();

								}

							} ).catch( showXRNotAllowed );

					}

				} ).catch( showXRNotAllowed );

			return behindon;

		} else {

			const message = document.createElement( 'a' );

			if ( window.isSecureContext === false ) {

				message.href = document.location.href.replace( /^http:/, 'https:' );
				message.innerHTML = 'WEBXR NEEDS HTTPS'; // TODO Improve message

			} else {

				message.href = 'https://immersiveweb.dev/';
				message.innerHTML = 'WEBXR NOT AVAILABLE';

			}

			message.style.left = 'calc(50% - 90px)';
			message.style.width = '180px';
			message.style.textDecoration = 'none';

			stylizeElement( message );

			return message;

		}

	}

}

export { XRButton };
