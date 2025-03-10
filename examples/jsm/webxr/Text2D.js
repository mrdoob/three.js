import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three';

/** @module Text2D */

/**
 * A helper function for creating a simple plane mesh
 * that can be used as a text label. The mesh's material
 * holds a canvas texture that displays the given message.
 *
 * @param {string} message - The message to display.
 * @param {number} height - The labels height.
 * @return {Mesh} The plane mesh representing a text label.
 */
function createText( message, height ) {

	const canvas = document.createElement( 'canvas' );
	const context = canvas.getContext( '2d' );
	let metrics = null;
	const textHeight = 100;
	context.font = 'normal ' + textHeight + 'px Arial';
	metrics = context.measureText( message );
	const textWidth = metrics.width;
	canvas.width = textWidth;
	canvas.height = textHeight;
	context.font = 'normal ' + textHeight + 'px Arial';
	context.textAlign = 'center';
	context.textBaseline = 'middle';
	context.fillStyle = '#ffffff';
	context.fillText( message, textWidth / 2, textHeight / 2 );

	const texture = new Texture( canvas );
	texture.needsUpdate = true;

	const material = new MeshBasicMaterial( {
		color: 0xffffff,
		side: DoubleSide,
		map: texture,
		transparent: true,
	} );
	const geometry = new PlaneGeometry(
		( height * textWidth ) / textHeight,
		height
	);
	const plane = new Mesh( geometry, material );
	return plane;

}

export { createText };
