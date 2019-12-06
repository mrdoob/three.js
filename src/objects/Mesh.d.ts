import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial';

export class Mesh<TMaterial extends Material | Material[] = MeshBasicMaterial> extends Object3D {

	constructor(
		geometry?: Geometry | BufferGeometry,
		material?: TMaterial
	);

	geometry: Geometry | BufferGeometry;
	material: TMaterial;
	morphTargetInfluences?: number[];
	morphTargetDictionary?: { [key: string]: number };
	isMesh: true;
	type: string;

	updateMorphTargets(): void;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;

}
