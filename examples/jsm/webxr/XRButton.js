import { WebXRButton } from './WebXRButton.js';

class XRButton extends WebXRButton {

	constructor( renderer, sessionOptions ) {

		super( renderer, sessionOptions );
		this.id = 'XRbutton';
		this.stopLabel = 'STOP XR';
		this.startLabel = 'START XR';
		this.notSupportedLabel = 'XR NOT SUPPORTED';
		this.notAllowedLabel = 'XR NOT ALLOWED';

	}

	static createButton( renderer, sessionInit = {} ) {

		const sessionOptions = {
			...sessionInit,
			optionalFeatures: [
				'local-floor',
				'bounded-floor',
				'hand-tracking',
				'layers',
				...( sessionInit.optionalFeatures || [] ),
			],
		};

		const arButtonInstance = new XRButton( renderer, sessionOptions );
		return arButtonInstance.createButtonElement();

	}

	async getSessionMode( xr ) {

		const isARSupported = await xr.isSessionSupported( 'immersive-ar' );
		if ( isARSupported ) return 'immersive-ar';

		const isVRSupported = await xr.isSessionSupported( 'immersive-vr' );
		if ( isVRSupported ) return 'immersive-vr';

		return null;

	}

}

export { XRButton };
