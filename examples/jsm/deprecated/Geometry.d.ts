import {
	Vector3,
	Color,
	Vector2,
	Vector4,
	Box3,
	Sphere,
	Matrix4,
	BufferGeometry,
	Matrix,
	Mesh,
	Bone,
	AnimationClip,
	EventDispatcher,
	Object3D
} from '../../../src/Three';

/**
 * @deprecated Use Face3 instead.
 */

export interface MorphTarget {
	name: string;
	vertices: Vector3[];
}

export interface MorphColor {
	name: string;
	colors: Color[];
}

export interface MorphNormals {
	name: string;
	normals: Vector3[];
}

/**
 * Base class for geometries
 */
export class Geometry extends EventDispatcher {

	constructor();

	/**
	 * Unique number of this geometry instance
	 */
	id: number;

	uuid: string;

	readonly isGeometry: true;

	/**
	 * Name for this geometry. Default is an empty string.
	 * @default ''
	 */
	name: string;

	/**
	 * @default 'Geometry'
	 */
	type: string;

	/**
	 * The array of vertices hold every position of points of the model.
	 * To signal an update in this array, Geometry.verticesNeedUpdate needs to be set to true.
	 * @default []
	 */
	vertices: Vector3[];

	/**
	 * Array of vertex colors, matching number and order of vertices.
	 * Used in ParticleSystem, Line and Ribbon.
	 * Meshes use per-face-use-of-vertex colors embedded directly in faces.
	 * To signal an update in this array, Geometry.colorsNeedUpdate needs to be set to true.
	 * @default []
	 */
	colors: Color[];

	/**
	 * Array of triangles or/and quads.
	 * The array of faces describe how each vertex in the model is connected with each other.
	 * To signal an update in this array, Geometry.elementsNeedUpdate needs to be set to true.
	 * @default []
	 */
	faces: Face3[];

	/**
	 * Array of face UV layers.
	 * Each UV layer is an array of UV matching order and number of vertices in faces.
	 * To signal an update in this array, Geometry.uvsNeedUpdate needs to be set to true.
	 * @default [[]]
	 */
	faceVertexUvs: Vector2[][][];

	/**
	 * Array of morph targets. Each morph target is a Javascript object:
	 *
	 *		 { name: "targetName", vertices: [ new THREE.Vector3(), ... ] }
	 *
	 * Morph vertices match number and order of primary vertices.
	 * @default []
	 */
	morphTargets: MorphTarget[];

	/**
	 * Array of morph normals. Morph normals have similar structure as morph targets, each normal set is a Javascript object:
	 *
	 *		 morphNormal = { name: "NormalName", normals: [ new THREE.Vector3(), ... ] }
	 * @default []
	 */
	morphNormals: MorphNormals[];

	/**
	 * Array of skinning weights, matching number and order of vertices.
	 * @default []
	 */
	skinWeights: Vector4[];

	/**
	 * Array of skinning indices, matching number and order of vertices.
	 * @default []
	 */
	skinIndices: Vector4[];

	/**
	 * @default []
	 */
	lineDistances: number[];

	/**
	 * Bounding box.
	 * @default null
	 */
	boundingBox: Box3 | null;

	/**
	 * Bounding sphere.
	 * @default null
	 */
	boundingSphere: Sphere | null;

	/**
	 * Set to true if the vertices array has been updated.
	 * @default false
	 */
	verticesNeedUpdate: boolean;

	/**
	 * Set to true if the faces array has been updated.
	 * @default false
	 */
	elementsNeedUpdate: boolean;

	/**
	 * Set to true if the uvs array has been updated.
	 * @default false
	 */
	uvsNeedUpdate: boolean;

	/**
	 * Set to true if the normals array has been updated.
	 * @default false
	 */
	normalsNeedUpdate: boolean;

	/**
	 * Set to true if the colors array has been updated.
	 * @default false
	 */
	colorsNeedUpdate: boolean;

	/**
	 * Set to true if the linedistances array has been updated.
	 * @default false
	 */
	lineDistancesNeedUpdate: boolean;

	/**
	 *
	 * @default false
	 */
	groupsNeedUpdate: boolean;

	/**
	 * Bakes matrix transform directly into vertex coordinates.
	 */
	applyMatrix4( matrix: Matrix4 ): Geometry;

	rotateX( angle: number ): Geometry;
	rotateY( angle: number ): Geometry;
	rotateZ( angle: number ): Geometry;

	translate( x: number, y: number, z: number ): Geometry;
	scale( x: number, y: number, z: number ): Geometry;
	lookAt( vector: Vector3 ): void;

	fromBufferGeometry( geometry: BufferGeometry ): Geometry;

	center(): Geometry;

	normalize(): Geometry;

	/**
	 * Computes face normals.
	 */
	computeFaceNormals(): void;

	/**
	 * Computes vertex normals by averaging face normals.
	 * Face normals must be existing / computed beforehand.
	 */
	computeVertexNormals( areaWeighted?: boolean ): void;

	/**
	 * Compute vertex normals, but duplicating face normals.
	 */
	computeFlatVertexNormals(): void;

	/**
	 * Computes morph normals.
	 */
	computeMorphNormals(): void;

	/**
	 * Computes bounding box of the geometry, updating {@link Geometry.boundingBox} attribute.
	 */
	computeBoundingBox(): void;

	/**
	 * Computes bounding sphere of the geometry, updating Geometry.boundingSphere attribute.
	 * Neither bounding boxes or bounding spheres are computed by default. They need to be explicitly computed, otherwise they are null.
	 */
	computeBoundingSphere(): void;

	merge(
		geometry: Geometry,
		matrix?: Matrix,
		materialIndexOffset?: number
	): void;

	mergeMesh( mesh: Mesh ): void;

	/**
	 * Checks for duplicate vertices using hashmap for specified number of decimal points, e.g. 4 for epsilon of 0.0001
	 * Duplicated vertices are removed and faces' vertices are updated.
	 */
	mergeVertices( precisionPoints?: number ): number;

	setFromPoints( points: Array<Vector2> | Array<Vector3> ): this;

	sortFacesByMaterialIndex(): void;

	toBufferGeometry(): BufferGeometry;

	static createBufferGeometryFromObject( object: Object3D ): BufferGeometry;

	toJSON(): any;

	/**
	 * Creates a new clone of the Geometry.
	 */
	clone(): Geometry;

	copy( source: Geometry ): this;

	/**
	 * Removes The object from memory.
	 * Don't forget to call this method when you remove an geometry because it can cuase meomory leaks.
	 */
	dispose(): void;

	// These properties do not exist in a normal Geometry class, but if you use the instance that was passed by JSONLoader, it will be added.
	bones: Bone[];
	animation: AnimationClip;
	animations: AnimationClip[];

}

/**
 * Triangle face.
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
