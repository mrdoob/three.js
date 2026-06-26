import {
	BufferGeometry,
	Float32BufferAttribute
} from 'three';

/**
 * A special type of box geometry intended for {@link LineSegments}.
 *
 * ```js
 * const geometry = new THREE.BoxLineGeometry();
 * const material = new THREE.LineBasicMaterial( { color: 0x00ff00 } );
 * const lines = new THREE.LineSegments( geometry, material );
 * scene.add( lines );
 * ```
 *
 * @augments BufferGeometry
 * @three_import import { BoxLineGeometry } from 'three/addons/geometries/BoxLineGeometry.js';
 */
class BoxLineGeometry extends BufferGeometry {

	/**
	 * Constructs a new box line geometry.
	 *
	 * @param {number} [width=1] - The width. That is, the length of the edges parallel to the X axis.
	 * @param {number} [height=1] - The height. That is, the length of the edges parallel to the Y axis.
	 * @param {number} [depth=1] - The depth. That is, the length of the edges parallel to the Z axis.
	 * @param {number} [widthSegments=1] - Number of segmented rectangular sections along the width of the sides.
	 * @param {number} [heightSegments=1] - Number of segmented rectangular sections along the height of the sides.
	 * @param {number} [depthSegments=1] - Number of segmented rectangular sections along the depth of the sides.
	 */
	constructor( width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1 ) {

		super();

		widthSegments = Math.floor( widthSegments );
		heightSegments = Math.floor( heightSegments );
		depthSegments = Math.floor( depthSegments );

		const widthHalf = width / 2;
		const heightHalf = height / 2;
		const depthHalf = depth / 2;

		const segmentWidth = width / widthSegments;
		const segmentHeight = height / heightSegments;
		const segmentDepth = depth / depthSegments;

		const vertices = [];

		let x = - widthHalf;
		let y = - heightHalf;
		let z = - depthHalf;

		for ( let i = 0; i <= widthSegments; i ++ ) {

			vertices.push( x, - heightHalf, - depthHalf, x, heightHalf, - depthHalf );
			vertices.push( x, heightHalf, - depthHalf, x, heightHalf, depthHalf );
			vertices.push( x, heightHalf, depthHalf, x, - heightHalf, depthHalf );
			vertices.push( x, - heightHalf, depthHalf, x, - heightHalf, - depthHalf );

			x += segmentWidth;

		}

		for ( let i = 0; i <= heightSegments; i ++ ) {

			vertices.push( - widthHalf, y, - depthHalf, widthHalf, y, - depthHalf );
			vertices.push( widthHalf, y, - depthHalf, widthHalf, y, depthHalf );
			vertices.push( widthHalf, y, depthHalf, - widthHalf, y, depthHalf );
			vertices.push( - widthHalf, y, depthHalf, - widthHalf, y, - depthHalf );

			y += segmentHeight;

		}

		for ( let i = 0; i <= depthSegments; i ++ ) {

			vertices.push( - widthHalf, - heightHalf, z, - widthHalf, heightHalf, z );
			vertices.push( - widthHalf, heightHalf, z, widthHalf, heightHalf, z );
			vertices.push( widthHalf, heightHalf, z, widthHalf, - heightHalf, z );
			vertices.push( widthHalf, - heightHalf, z, - widthHalf, - heightHalf, z );

			z += segmentDepth;

		}

		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

	}

}

export { BoxLineGeometry };
