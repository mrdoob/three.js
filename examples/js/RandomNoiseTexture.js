/** Generates a data texture filled with uniform random noise in [0, 1] */
function randomNoiseTexture(w, h) {
	var data = new Float32Array( 3 * w * h );
	for (var i = 0; i < data.length; i++) {
		data[i] = Math.random();
	}

	return new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
}