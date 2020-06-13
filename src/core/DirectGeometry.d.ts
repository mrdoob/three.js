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
	indices: number[];
	vertices: Vector3[];
	normals: Vector3[];
	colors: Color[];
	uvs: Vector2[];
	uvs2: Vector2[];
	groups: { start: number; materialIndex: number }[];
	morphTargets: MorphTarget[];
	skinWeights: Vector4[];
	skinIndices: Vector4[];
	boundingBox: Box3 | null;
	boundingSphere: Sphere | null;
	verticesNeedUpdate: boolean;
	normalsNeedUpdate: boolean;
	colorsNeedUpdate: boolean;
	uvsNeedUpdate: boolean;
	groupsNeedUpdate: boolean;

	computeBoundingBox(): void;
	computeBoundingSphere(): void;
	computeGroups( geometry: Geometry ): void;
	fromGeometry( geometry: Geometry ): DirectGeometry;
	dispose(): void;

}
