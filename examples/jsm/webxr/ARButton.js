import { WebXRButton } from './WebXRButton.js';

class ARButton extends WebXRButton {

	constructor( renderer, sessionInit ) {

		super( renderer, sessionInit );
		this.id = 'ARbutton';
		this.stopLabel = 'STOP AR';
		this.startLabel = 'START AR';
		this.notSupportedLabel = 'AR NOT SUPPORTED';
		this.notAllowedLabel = 'AR NOT ALLOWED';

	}

	static createButton( renderer, sessionInit = {} ) {

		const arButtonInstance = new ARButton( renderer, sessionInit );
		return arButtonInstance.createButtonElement();

	}

	setupDOMOverlay() {

		if ( this.sessionOptions.domOverlay === undefined ) {

			const overlay = document.createElement( 'div' );
			overlay.style.display = 'none';
			document.body.appendChild( overlay );

			const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			svg.setAttribute( 'width', 38 );
			svg.setAttribute( 'height', 38 );
			svg.style.position = 'absolute';
			svg.style.right = '20px';
			svg.style.top = '20px';
			svg.addEventListener( 'click', function () {

				currentSession.end();

			} );
			overlay.appendChild( svg );

			const path = document.createElementNS(
				'http://www.w3.org/2000/svg',
				'path'
			);
			path.setAttribute( 'd', 'M 12,12 L 28,28 M 28,12 12,28' );
			path.setAttribute( 'stroke', '#fff' );
			path.setAttribute( 'stroke-width', 2 );
			svg.appendChild( path );

			if ( this.sessionOptions.optionalFeatures === undefined ) {

				this.sessionOptions.optionalFeatures = [];

			}

			this.sessionOptions.optionalFeatures.push( 'dom-overlay' );
			this.sessionOptions.domOverlay = { root: overlay };

		}

	}

	async onSessionStarted( session ) {

		this.renderer.xr.setReferenceSpaceType( 'local' );
		await super.onSessionStarted( session );
		this.sessionOptions.domOverlay.root.style.display = '';

	}

	async getSessionMode( xr ) {

		const isSupported = await xr.isSessionSupported( 'immersive-ar' );
		return isSupported ? 'immersive-ar' : null;

	}

	onSessionEnded() {

		super.onSessionEnded();
		this.sessionOptions.domOverlay.root.style.display = 'none';

	}

	showStart() {

		this.setupDOMOverlay();
		super.showStart();

	}

}

export { ARButton };
