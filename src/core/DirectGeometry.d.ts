import { Vector3 } from './../math/Vector3';
import { Color } from './../math/Color';
import { Vector2 } from './../math/Vector2';
import { Vector4 } from './../math/Vector4';
import { Box3 } from './../math/Box3';
import { Sphere } from './../math/Sphere';
import { Geometry } from './Geometry';
import { MorphTarget } from './Geometry';

/**
 * @see {@link https://github.com/mrdoob/three.js/blob/master/src/core/DirectGeometry.js|src/core/DirectGeometry.js}
 */
export class DirectGeometry {

	constructor();

	id: number;
	uuid: string;
	name: string;
	type: string;

	/**
	 * @default []
	 */
	indices: number[];

	/**
	 * @default []
	 */
	vertices: Vector3[];

	/**
	 * @default []
	 */
	normals: Vector3[];

	/**
	 * @default []
	 */
	colors: Color[];

	/**
	 * @default []
	 */
	uvs: Vector2[];

	/**
	 * @default []
	 */
	uvs2: Vector2[];

	/**
	 * @default []
	 */
	groups: { start: number; materialIndex: number }[];

	/**
	 * @default {}
	 */
	morphTargets: MorphTarget[];

	/**
	 * @default []
	 */
	skinWeights: Vector4[];

	/**
	 * @default []
	 */
	skinIndices: Vector4[];

	/**
	 * @default null
	 */
	boundingBox: Box3 | null;

	/**
	 * @default null
	 */
	boundingSphere: Sphere | null;

	/**
	 * @default false
	 */
	verticesNeedUpdate: boolean;

	/**
	 * @default false
	 */
	normalsNeedUpdate: boolean;

	/**
	 * @default false
	 */
	colorsNeedUpdate: boolean;

	/**
	 * @default false
	 */
	uvsNeedUpdate: boolean;

	/**
	 * @default false
	 */
	groupsNeedUpdate: boolean;

	computeBoundingBox(): void;
	computeBoundingSphere(): void;
	computeGroups( geometry: Geometry ): void;
	fromGeometry( geometry: Geometry ): DirectGeometry;
	dispose(): void;

}
