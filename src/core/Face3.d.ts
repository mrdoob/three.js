import { Vector3 } from './../math/Vector3';
import { Color } from './../math/Color';

/**
 * Triangle face.
 *
 * @source https://github.com/mrdoob/three.js/blob/master/src/core/Face3.js
 */
export class Face3 {

	/**
	 * @param a Vertex A index.
	 * @param b Vertex B index.
	 * @param c Vertex C index.
	 * @param normal Face normal or array of vertex normals.
	 * @param color Face color or array of vertex colors.
	 * @param materialIndex Material index.
	 */
	constructor(
		a: number,
		b: number,
		c: number,
		normal?: Vector3,
		color?: Color,
		materialIndex?: number
	);
	constructor(
		a: number,
		b: number,
		c: number,
		normal?: Vector3,
		vertexColors?: Color[],
		materialIndex?: number
	);
	constructor(
		a: number,
		b: number,
		c: number,
		vertexNormals?: Vector3[],
		color?: Color,
		materialIndex?: number
	);
	constructor(
		a: number,
		b: number,
		c: number,
		vertexNormals?: Vector3[],
		vertexColors?: Color[],
		materialIndex?: number
	);

	/**
	 * Vertex A index.
	 */
	a: number;

	/**
	 * Vertex B index.
	 */
	b: number;

	/**
	 * Vertex C index.
	 */
	c: number;

	/**
	 * Face normal.
	 * @default new THREE.Vector3()
	 */
	normal: Vector3;

	/**
	 * Array of 3 vertex normals.
	 * @default []
	 */
	vertexNormals: Vector3[];

	/**
	 * Face color.
	 * @default new THREE.Color()
	 */
	color: Color;

	/**
	 * Array of 3 vertex colors.
	 * @default []
	 */
	vertexColors: Color[];

	/**
	 * Material index (points to {@link Mesh.material}).
	 * @default 0
	 */
	materialIndex: number;

	clone(): Face3;
	copy( source: Face3 ): this;

}
