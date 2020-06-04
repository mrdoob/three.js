import { Group } from '../../objects/Group.js';

/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function WebXRController() {

	this._targetRay = null;
	this._grip = null;

}

Object.assign( WebXRController.prototype, {

	constructor: WebXRController,

	getTargetRaySpace: function () {

		if ( this._targetRay === null ) {

			this._targetRay = new Group();
			this._targetRay.matrixAutoUpdate = false;
			this._targetRay.visible = false;

		}

		return this._targetRay;

	},

	getGripSpace: function () {

		if ( this._grip === null ) {

			this._grip = new Group();
			this._grip.matrixAutoUpdate = false;
			this._grip.visible = false;

		}

		return this._grip;

	},

	dispatchEvent: function ( event ) {

		if ( this._targetRay !== null ) {

			this._targetRay.dispatchEvent( event );

		}

		if ( this._grip !== null ) {

			this._grip.dispatchEvent( event );

		}

		return this;

	},

	disconnect: function ( inputSource ) {

		this.dispatchEvent( { type: 'disconnected', data: inputSource } );

		if ( this._targetRay !== null ) {

			this._targetRay.visible = false;

		}

		if ( this._grip !== null ) {

			this._grip.visible = false;

		}

		return this;

	},

	update: function ( inputSource, frame, referenceSpace ) {

		var inputPose = null;
		var gripPose = null;

		var targetRay = this._targetRay;
		var grip = this._grip;

		if ( inputSource ) {

			if ( targetRay !== null ) {

				inputPose = frame.getPose( inputSource.targetRaySpace, referenceSpace );

				if ( inputPose !== null ) {

					targetRay.matrix.fromArray( inputPose.transform.matrix );
					targetRay.matrix.decompose( targetRay.position, targetRay.rotation, targetRay.scale );

				}

			}

			if ( grip !== null && inputSource.gripSpace ) {

				gripPose = frame.getPose( inputSource.gripSpace, referenceSpace );

				if ( gripPose !== null ) {

					grip.matrix.fromArray( gripPose.transform.matrix );
					grip.matrix.decompose( grip.position, grip.rotation, grip.scale );

				}

			}

		}

		if ( targetRay !== null ) {

			targetRay.visible = ( inputPose !== null );

		}

		if ( grip !== null ) {

			grip.visible = ( gripPose !== null );

		}

		return this;

	}

} );


export { WebXRController };
