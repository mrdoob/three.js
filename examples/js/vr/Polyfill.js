

if( 'xr' in navigator ) {

	console.log('Helio: Chrome m73 WebXR Polyfill:', navigator.xr);

	// WebXRManager - XR.supportSession() Polyfill - WebVR.js line 147

	navigator.xr.supportsSession = navigator.xr.supportsSessionMode;

	if( 'supportsSessionMode' in navigator.xr ) {

		const temp = navigator.xr.requestSession.bind(navigator.xr);

		navigator.xr.requestSession = function (sessionType) {

			return new Promise((resolve, reject) => {
				temp({ mode: sessionType })
					.then(session => {

						// WebXRManager - xrFrame.getPose() Polyfill - line 279

						const tempRequestAnimationFrame = session.requestAnimationFrame.bind(session);

						session.requestAnimationFrame = function (callback) {

							return tempRequestAnimationFrame(function (time, frame) {

								frame.getPose = function (targetRaySpace, referenceSpace) {

									console.log('targetRay', targetRaySpace)

									return frame.getInputPose(targetRaySpace, referenceSpace);

								}

								callback(time, frame);

							})

						};

						// WebXRManager - xrFrame.getPose( inputSource.targetRaySpace, referenceSpace) Polyfill - line 279

						const tempGetInputSources = session.getInputSources.bind(session);

						session.getInputSources = function () {

							const res = tempGetInputSources();

							res.forEach(xrInputSource => {

								Object.defineProperty(xrInputSource, 'targetRaySpace', {
									get: function () {
										return xrInputSource
									},
								});

							});

							return res;
						}

						// WebXRManager - xrSession.getInputSources() Polyfill Line 132 - 136

						session.inputSources = Object.defineProperty(session, 'inputSources', {
							get: session.getInputSources
						});

						// WebXRManager - xrSession.updateRenderState() Polyfill Line 129

						session.updateRenderState = function ({ baseLayer }) {

							session.baseLayer = baseLayer;

							// WebXRManager - xrSession.renderState.baseLayer Polyfill Line 219

							session.renderState = {
								baseLayer: baseLayer,
							}

						}

						// WebXRManager - xrSession.requestReferenceSpace() Polyfill Line 130

						const temp = session.requestReferenceSpace.bind(session);

						session.requestReferenceSpace = function () {

							return temp({ type: 'stationary', subtype: 'floor-level' });

						}

						resolve(session);

					});
			})

		}

	}

}


