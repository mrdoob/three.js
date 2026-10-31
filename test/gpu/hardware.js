const software = /swiftshader|llvmpipe|lavapipe|software|basic render|warp/i;

export function assertHardwareRenderer( renderer, backend ) {

	if ( backend === 'webgl' ) {

		const gl = renderer.backend.gl;
		const extension = gl.getExtension( 'WEBGL_debug_renderer_info' );
		const name = extension && gl.getParameter( extension.UNMASKED_RENDERER_WEBGL );
		if ( ! name || software.test( name ) ) throw new Error( `Hardware WebGL verification blocked: ${ name || 'renderer identity unavailable' }` );
		console.info( `WebGL GPU: ${ name }` );

	} else {

		const info = renderer.backend.device?.adapterInfo;
		if ( ! info ) throw new Error( 'Hardware WebGPU verification blocked: device identity unavailable' );
		const name = [ info.vendor, info.architecture, info.device, info.description ].join( ' ' ).trim();
		if ( info.isFallbackAdapter || ! name || software.test( name ) ) {

			throw new Error( `Hardware WebGPU verification blocked: ${ name || 'adapter identity unavailable' }` );

		}

		console.info( `WebGPU GPU: ${ name }` );

	}

}
