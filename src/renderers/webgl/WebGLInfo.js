function WebGLInfo( gl ) {

	let _isRTT = false;

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

	const rtt = {
		frame: 0,
		calls: 0,
		triangles: 0,
		points: 0,
		lines: 0
	};

	function enableRTT() {

		_isRTT = true;

	}

	function disableRTT() {

		_isRTT = false;

	}

	function update( count, mode, instanceCount ) {

		let target = render;

		if ( _isRTT ) {

			target = rtt;

		}

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

	function reset() {

		render.frame ++;
		render.calls = 0;
		render.triangles = 0;
		render.points = 0;
		render.lines = 0;

		if ( ! _isRTT ) {

			rtt.frame ++;
			rtt.calls = 0;
			rtt.triangles = 0;
			rtt.points = 0;
			rtt.lines = 0;

		}

	}

	return {
		memory: memory,
		render: render,
		rtt: rtt,
		enableRTT: enableRTT,
		disableRTT: disableRTT,
		programs: null,
		autoReset: true,
		reset: reset,
		update: update
	};

}


export { WebGLInfo };
