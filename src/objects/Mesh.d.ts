import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

export class Mesh extends Object3D {

	constructor(
		geometry?: BufferGeometry,
		material?: Material | Material[]
	);

	geometry: BufferGeometry;
	material: Material | Material[];
	morphTargetInfluences?: number[];
	morphTargetDictionary?: { [key: string]: number };
	readonly isMesh: true;
	type: string;

	updateMorphTargets(): void;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;

}
