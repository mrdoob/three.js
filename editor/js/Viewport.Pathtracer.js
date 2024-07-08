import { WebGLPathTracer } from 'three-gpu-pathtracer';

function ViewportPathtracer( renderer ) {

	let pathTracer = null;

	function init( scene, camera ) {

		if ( pathTracer === null ) {

			pathTracer = new WebGLPathTracer( renderer );
			pathTracer.filterGlossyFactor = 0.5;

		}

		pathTracer.setScene( scene, camera );

	}

	function setSize( /* width, height */ ) {

		if ( pathTracer === null ) return;

		// path tracer size automatically updates based on the canvas
		pathTracer.updateCamera();

	}

	function setBackground( /* background, blurriness */ ) {

		if ( pathTracer === null ) return;

		// update environment settings based on initialized scene fields
		pathTracer.updateEnvironment();

	}

	function updateMaterials() {

		if ( pathTracer === null ) return;

		pathTracer.updateMaterials();

	}

	function setEnvironment( /* environment */ ) {

		if ( pathTracer === null ) return;

		pathTracer.updateEnvironment();

	}

	function update() {

		if ( pathTracer === null ) return;

		pathTracer.renderSample();

	}

	function reset() {

		if ( pathTracer === null ) return;

		pathTracer.updateCamera();

	}

	function getSamples() {

		if ( pathTracer === null ) return;

		return pathTracer.samples;

	}

	return {
		init: init,
		setSize: setSize,
		setBackground: setBackground,
		setEnvironment: setEnvironment,
		updateMaterials: updateMaterials,
		update: update,
		reset: reset,
		getSamples: getSamples
	};

}

export { ViewportPathtracer };
