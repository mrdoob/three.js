/**
 * @author mvilledieu / http://github.com/mvilledieu
 */

if ( /(Helio)/g.test( navigator.userAgent ) && "xr" in navigator ) {

	if ( 'isSessionSupported' in navigator.xr ) return;

	console.log( "Helio WebXR Polyfill (Lumin 0.97.0)" );

	const isHelio96 = navigator.userAgent.includes( "Chrome/73" );

	// WebXRManager - XR.supportSession() Polyfill - WebVR.js line 147

	if (
		"supportsSession" in navigator.xr === false &&
    "supportsSessionMode" in navigator.xr
	) {

		navigator.xr.supportsSession = function ( /*sessionType*/ ) {

			// Force using immersive-ar
			return navigator.xr.supportsSessionMode( 'immersive-ar' );

		};

	}

	if ( "requestSession" in navigator.xr ) {

		const tempRequestSession = navigator.xr.requestSession.bind( navigator.xr );

		navigator.xr.requestSession = function ( /*sessionType*/ ) {

			return new Promise( function ( resolve, reject ) {

				const sessionType = ( isHelio96 ? {
					mode: 'immersive-ar' // Force using immersive-ar
				} : 'immersive-ar' );

				tempRequestSession( sessionType )
					.then( function ( session ) {

						// WebXRManager - xrFrame.getPose() Polyfill - line 279

						const tempRequestAnimationFrame = session.requestAnimationFrame.bind(
							session
						);

						session.requestAnimationFrame = function ( callback ) {

							return tempRequestAnimationFrame( function ( time, frame ) {

								// WebXRManager - xrFrame.getViewerPose() Polyfill - line 279
								// Transforms view.viewMatrix to view.transform.inverse.matrix

								const tempGetViewerPose = frame.getViewerPose.bind( frame );

								frame.getViewerPose = function ( referenceSpace ) {

									const pose = tempGetViewerPose( referenceSpace );

									pose.views.forEach( function ( view ) {

										view.transform = {
											inverse: {
												matrix: view.viewMatrix
											}
										};

									} );

									return pose;

								};

								// WebXRManager - xrFrame.getPose() Polyfill - line 259

								const tempGetPose = ( isHelio96 ? null : frame.getPose.bind( frame ) );

								frame.getPose = function ( targetRaySpace, referenceSpace ) {

									if ( isHelio96 ) {

										const inputPose = frame.getInputPose(
											targetRaySpace,
											referenceSpace
										);

										inputPose.transform = {
											matrix: inputPose.targetRay.transformMatrix
										};

										return inputPose;

									} else {

										return tempGetPose( targetRaySpace.gripSpace, referenceSpace );

									}

								};

								callback( time, frame );

							} );

						};

						// WebXRManager - xrFrame.getPose( inputSource.targetRaySpace, referenceSpace) Polyfill - line 279

						const tempGetInputSources = session.getInputSources.bind( session );

						session.getInputSources = function () {

							const res = tempGetInputSources();

							res.forEach( function ( xrInputSource ) {

								Object.defineProperty( xrInputSource, "targetRaySpace", {
									get: function () {

										return xrInputSource;

									}
								} );

							} );

							return res;

						};

						// WebXRManager - xrSession.getInputSources() Polyfill Line 132 - 136

						session.inputSources = Object.defineProperty(
							session,
							"inputSources",
							{
								get: session.getInputSources
							}
						);

						// WebXRManager - xrSession.updateRenderState() Polyfill Line 129

						if ( isHelio96 ) {

							session.updateRenderState = function ( { baseLayer } ) {

								session.baseLayer = baseLayer;

								// WebXRManager - xrSession.renderState.baseLayer Polyfill Line 219

								session.renderState = {
									baseLayer: baseLayer
								};

							};

						}

						// WebXRManager - xrSession.requestReferenceSpace() Polyfill Line 130

						const tempRequestReferenceSpace = session.requestReferenceSpace.bind(
							session
						);

						session.requestReferenceSpace = function () {

							return tempRequestReferenceSpace( {
								type: "stationary",
								subtype: "floor-level"
							} );

						};

						resolve( session );

					} )
					.catch( function ( error ) {

						return reject( error );

					} );

			} );

		};

	}

}
