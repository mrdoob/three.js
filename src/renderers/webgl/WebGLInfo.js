/**
 * @author Mugen87 / https://github.com/Mugen87
 */

function WebGLInfo( gl ) {

	var memory = {
		geometries: 0,
		textures: 0
	};

	var render = {
		frame: 0,
		calls: 0,
		faces: 0,
		points: 0,
		segments: 0
	};

	function update( count, mode, instanceCount ) {

		instanceCount = instanceCount || 1;

		render.calls ++;

		switch ( mode ) {

			case gl.TRIANGLES:
				render.faces += instanceCount * ( count / 3 );
				break;

			case gl.TRIANGLE_STRIP:
			case gl.TRIANGLE_FAN:
				render.faces += instanceCount * ( count - 2 );
				break;

			case gl.LINES:
				render.segments += instanceCount * ( count / 2 );
				break;

			case gl.LINE_STRIP:
				render.segments += instanceCount * ( count - 1 );
				break;

			case gl.LINE_LOOP:
				render.segments += instanceCount * count;
				break;

			case gl.POINTS:
				render.points += instanceCount * count;
				break;

			default:
				console.error( 'THREE.WebGLInfo: Unknown draw mode:', mode );
				break;

		}

	}

	function reset() {

		render.frame ++;
		render.calls = 0;
		render.faces = 0;
		render.points = 0;
		render.segments = 0;

	}

	return {
		memory: memory,
		render: render,
		programs: null,
		autoReset: true,
		reset: reset,
		update: update
	};

}


export { WebGLInfo };
