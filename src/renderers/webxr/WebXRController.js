import { Group } from '../../objects/Group.js';

function WebXRController() {

	this._targetRay = null;
	this._grip = null;
	this._hand = null;

}

Object.assign( WebXRController.prototype, {

	constructor: WebXRController,

	getHandSpace: function () {

		if ( this._hand === null ) {

			this._hand = new Group();
			this._hand.matrixAutoUpdate = false;
			this._hand.visible = false;

			this._hand.joints = [];
			this._hand.inputState = { pinching: false };

			if ( window.XRHand ) {

				for ( let i = 0; i <= window.XRHand.LITTLE_PHALANX_TIP; i ++ ) {

					// The transform of this joint will be updated with the joint pose on each frame
					const joint = new Group();
					joint.matrixAutoUpdate = false;
					joint.visible = false;
					this._hand.joints.push( joint );
					// ??
					this._hand.add( joint );

				}

			}

		}

		return this._hand;

	},

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

		if ( this._hand !== null ) {

			this._hand.dispatchEvent( event );

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

		if ( this._hand !== null ) {

			this._hand.visible = false;

		}

		return this;

	},

	update: function ( inputSource, frame, referenceSpace ) {

		let inputPose = null;
		let gripPose = null;
		let handPose = null;

		const targetRay = this._targetRay;
		const grip = this._grip;
		const hand = this._hand;

		if ( inputSource && frame.session.visibilityState !== 'visible-blurred' ) {

			if ( hand && inputSource.hand ) {

				handPose = true;

				for ( let i = 0; i <= window.XRHand.LITTLE_PHALANX_TIP; i ++ ) {

					if ( inputSource.hand[ i ] ) {

						// Update the joints groups with the XRJoint poses
						const jointPose = frame.getJointPose( inputSource.hand[ i ], referenceSpace );
						const joint = hand.joints[ i ];

						if ( jointPose !== null ) {

							joint.matrix.fromArray( jointPose.transform.matrix );
							joint.matrix.decompose( joint.position, joint.rotation, joint.scale );
							joint.jointRadius = jointPose.radius;

						}

						joint.visible = jointPose !== null;

						// Custom events

						// Check pinch
						const indexTip = hand.joints[ window.XRHand.INDEX_PHALANX_TIP ];
						const thumbTip = hand.joints[ window.XRHand.THUMB_PHALANX_TIP ];
						const distance = indexTip.position.distanceTo( thumbTip.position );

						const distanceToPinch = 0.02;
						const threshold = 0.005;

						if ( hand.inputState.pinching && distance > distanceToPinch + threshold ) {

							hand.inputState.pinching = false;
							this.dispatchEvent( {
								type: "pinchend",
								handedness: inputSource.handedness,
								target: this
							} );

						} else if ( ! hand.inputState.pinching && distance <= distanceToPinch - threshold ) {

							hand.inputState.pinching = true;
							this.dispatchEvent( {
								type: "pinchstart",
								handedness: inputSource.handedness,
								target: this
							} );

						}

					}

				}

			} else {

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

		}

		if ( targetRay !== null ) {

			targetRay.visible = ( inputPose !== null );

		}

		if ( grip !== null ) {

			grip.visible = ( gripPose !== null );

		}

		if ( hand !== null ) {

			hand.visible = ( handPose !== null );

		}

		return this;

	}

} );


export { WebXRController };
