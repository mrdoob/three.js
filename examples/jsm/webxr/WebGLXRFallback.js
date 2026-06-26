/**
 * Sets up a construction-time WebGL fallback for WebGPU XR examples.
 *
 * @param {WebGPURenderer} renderer - The initial renderer.
 * @param {Function} createFallbackRenderer - A function that returns a new renderer with a WebGL backend.
 * @param {Function} onFallback - A function that installs the new renderer in the app.
 */
function setupWebGLXRFallback( renderer, createFallbackRenderer, onFallback = () => {} ) {

	let currentRenderer = renderer;
	const patchedRenderers = new WeakSet();

	function patchRenderer( renderer ) {

		if ( patchedRenderers.has( renderer ) ) return;

		patchedRenderers.add( renderer );

		const setSession = renderer.xr.setSession.bind( renderer.xr );

		renderer.xr.setSession = async function ( session ) {

			if ( renderer !== currentRenderer ) {

				return currentRenderer.xr.setSession( session );

			}

			if ( session !== null && renderer.backend.isWebGPUBackend === true && session.enabledFeatures.includes( 'webgpu' ) === false ) {

				return switchToFallbackRenderer( session, renderer );

			}

			try {

				return await setSession( session );

			} catch ( error ) {

				if ( session === null || renderer.backend.isWebGPUBackend !== true ) {

					throw error;

				}

				return switchToFallbackRenderer( session, renderer );

			}

		};

	}

	async function switchToFallbackRenderer( session, renderer ) {

		if ( renderer.initialized === false ) await renderer.init();

		const fallbackRenderer = createFallbackRenderer( renderer );

		if ( fallbackRenderer.backend.isWebGLBackend !== true ) {

			throw new Error( 'THREE.WebGLXRFallback: createFallbackRenderer() must return a renderer with a WebGL backend.' );

		}

		const animationLoop = renderer.getAnimationLoop();

		fallbackRenderer.xr.enabled = renderer.xr.enabled;
		fallbackRenderer.xr.cameraAutoUpdate = renderer.xr.cameraAutoUpdate;
		fallbackRenderer.xr.setFramebufferScaleFactor( renderer.xr.getFramebufferScaleFactor() );
		fallbackRenderer.xr.setReferenceSpaceType( renderer.xr.getReferenceSpaceType() );

		if ( animationLoop !== null ) await fallbackRenderer.setAnimationLoop( animationLoop );

		await onFallback( fallbackRenderer, renderer );

		currentRenderer = fallbackRenderer;
		patchRenderer( fallbackRenderer );

		return fallbackRenderer.xr.setSession( session );

	}

	patchRenderer( renderer );

}

export { setupWebGLXRFallback };
