import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

export class Line extends Object3D {

	constructor(
		geometry?: BufferGeometry,
		material?: Material | Material[]
	);

	geometry: BufferGeometry;
	material: Material | Material[];

	type: 'Line' | 'LineLoop' | 'LineSegments' | string;
	readonly isLine: true;

	morphTargetInfluences?: number[];
	morphTargetDictionary?: { [key: string]: number };

	computeLineDistances(): this;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;
	updateMorphTargets(): void;

}
