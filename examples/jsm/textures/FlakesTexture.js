/**
 * Utility class for generating a flakes texture image. This image might be used
 * as a normal map to produce a car paint like effect.
 *
 * @three_import import { FlakesTexture } from 'three/addons/textures/FlakesTexture.js';
 */
class FlakesTexture {

	/**
	 * Generates a new flakes texture image. The result is a canvas
	 * that can be used as an input for {@link CanvasTexture}.
	 *
	 * @param {number} [width=512] - The width of the image.
	 * @param {number} [height=512] - The height of the image.
	 * @return {HTMLCanvasElement} The generated image.
	 */
	constructor( width = 512, height = 512 ) {

		const canvas = document.createElement( 'canvas' );
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext( '2d' );
		context.fillStyle = 'rgb(127,127,255)';
		context.fillRect( 0, 0, width, height );

		for ( let i = 0; i < 4000; i ++ ) {

			const x = Math.random() * width;
			const y = Math.random() * height;
			const r = Math.random() * 3 + 3;

			let nx = Math.random() * 2 - 1;
			let ny = Math.random() * 2 - 1;
			let nz = 1.5;

			const l = Math.sqrt( nx * nx + ny * ny + nz * nz );

			nx /= l; ny /= l; nz /= l;

			context.fillStyle = 'rgb(' + ( nx * 127 + 127 ) + ',' + ( ny * 127 + 127 ) + ',' + ( nz * 255 ) + ')';
			context.beginPath();
			context.arc( x, y, r, 0, Math.PI * 2 );
			context.fill();

		}

		return canvas;

	}

}

export { FlakesTexture };
