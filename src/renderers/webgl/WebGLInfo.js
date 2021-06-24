function WebGLInfo( gl ) {

	const memory = {
		geometries: 0,
		textures: 0
	};

	const render = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};

	const frameBuffer = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};

	function update( count, mode, instanceCount, isFrameBuffer ) {

		const target = isFrameBuffer ? frameBuffer : render;
		target.calls ++;

		switch ( mode ) {

			case gl.TRIANGLES:
				target.triangles += instanceCount * ( count / 3 );
				break;

			case gl.LINES:
				target.lines += instanceCount * ( count / 2 );
				break;

			case gl.LINE_STRIP:
				target.lines += instanceCount * ( count - 1 );
				break;

			case gl.LINE_LOOP:
				target.lines += instanceCount * count;
				break;

			case gl.POINTS:
				target.points += instanceCount * count;
				break;

			default:
				console.error( 'THREE.WebGLInfo: Unknown draw mode:', mode );
				break;

		}


	}

	function reset( isRenderToScreen ) {

		render.frame ++;
		render.calls = 0;
		render.triangles = 0;
		render.points = 0;
		render.lines = 0;

		if ( ! isRenderToScreen ) {

			frameBuffer.frame ++;
			frameBuffer.calls = 0;
			frameBuffer.triangles = 0;
			frameBuffer.points = 0;
			frameBuffer.lines = 0;

		}

	}

	return {
		memory: memory,
		render: render,
		frameBuffer: frameBuffer,
		programs: null,
		autoReset: true,
		reset: reset,
		update: update
	};

}


export { WebGLInfo };
