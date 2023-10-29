import { WebXRButton } from './WebXRButton.js';

class VRButton extends WebXRButton {

	constructor( renderer, sessionInit ) {

		super( renderer, sessionInit );
		this.id = 'VRbutton';
		this.stopLabel = 'EXIT VR';
		this.startLabel = 'ENTER VR';
		this.notSupportedLabel = 'VR NOT SUPPORTED';
		this.notAllowedLabel = 'VR NOT ALLOWED';

	}

	static createButton(
		renderer,
		sessionInit = {
			// These have been kept for historical reasons: the previous
			// implementation of VRButton set these optional features. This
			// way, developers relying on the previous implementation can
			// still use the same code.
			//
			// Original implementation's comment:
			//
			// WebXR's requestReferenceSpace only works if the corresponding feature
			// was requested at session creation time. For simplicity, just ask for
			// the interesting ones as optional features, but be aware that the
			// requestReferenceSpace call will fail if it turns out to be unavailable.
			// ('local' is always available for immersive sessions and doesn't need to
			// be requested separately.)
			optionalFeatures: [
				'local-floor',
				'bounded-floor',
				'hand-tracking',
				'layers',
			],
		}
	) {

		const vrButtonInstance = new VRButton( renderer, sessionInit );
		return vrButtonInstance.createButtonElement();

	}

	async getSessionMode( xr ) {

		const isSupported = await xr.isSessionSupported( 'immersive-vr' );
		return isSupported ? 'immersive-vr' : null;

	}

}

export { VRButton };
