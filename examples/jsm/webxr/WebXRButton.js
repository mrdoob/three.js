class WebXRButton {

	constructor( renderer, sessionOptions ) {

		this.renderer = renderer;
		this.sessionOptions = sessionOptions;
		this.currentSession = null;
		this.button = null;
		this.id = 'WebXRButton';
		this.stopLabel = 'STOP WEBXR';
		this.startLabel = 'START WEBXR';
		this.notSupportedLabel = 'WEBXR NOT SUPPORTED';
		this.notAllowedLabel = 'WEBXR NOT ALLOWED';

	}

	createButtonElement() {

		const button = document.createElement( 'button' );
		this.button = button;

		if ( 'xr' in navigator ) {

			button.id = this.id;
			button.style.display = 'none';
			this.stylizeElement( button );

			this.getSessionMode( navigator.xr )
				.then( ( mode ) => {

					mode ? this.showStart( mode ) : this.showNotSupported();

				} )
				.catch( this.showNotAllowed );

			return button;

		} else {

			return this.createErrorMessage();

		}

	}

	async getSessionMode( xr ) {

		const isSupported = await xr.isSessionSupported( 'inline' );
		return isSupported ? 'inline' : null;

	}

	async onSessionStarted( session ) {

		session.addEventListener( 'end', this.onSessionEnded );
		await this.renderer.xr.setSession( session );

		this.button.textContent = this.stopLabel;
		this.currentSession = session;

	}

	onSessionEnded() {

		this.currentSession.removeEventListener( 'end', this.onSessionEnded );
		this.button.textContent = this.startLabel;
		this.currentSession = null;

	}

	showStart( mode ) {

		this.currentSession = null;

		this.button.style.display = '';

		this.button.style.cursor = 'pointer';
		this.button.style.left = 'calc(50% - 50px)';
		this.button.style.width = '100px';

		this.button.textContent = this.startLabel;

		this.button.onmouseenter = () => {

			this.button.style.opacity = '1.0';

		};

		this.button.onmouseleave = () => {

			this.button.style.opacity = '0.5';

		};

		this.button.onclick = () => {

			if ( this.currentSession === null ) {

				navigator.xr
					.requestSession( mode, this.sessionOptions )
					.then( this.onSessionStarted.bind( this ) );

			} else {

				this.currentSession.end();

			}

		};

	}

	disableButton() {

		this.button.style.display = '';

		this.button.style.cursor = 'auto';
		this.button.style.left = 'calc(50% - 75px)';
		this.button.style.width = '150px';

		this.button.onmouseenter = null;
		this.button.onmouseleave = null;

		this.button.onclick = null;

	}

	showNotSupported() {

		this.disableButton();

		this.button.textContent = this.notSupportedLabel;

	}

	showNotAllowed( exception ) {

		this.disableButton();

		console.warn(
			'Exception when trying to call xr.isSessionSupported',
			exception
		);

		this.button.textContent = this.notAllowedLabel;

	}

	stylizeElement( element ) {

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

	createErrorMessage() {

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

		this.stylizeElement( message );

		return message;

	}

}

export { WebXRButton };
