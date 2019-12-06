import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

export class Mesh<
	TMaterial extends Material | Material[] = Material,
	TGeometry extends Geometry | BufferGeometry = Geometry | BufferGeometry
> extends Object3D {

	constructor(
		geometry?: TGeometry,
		material?: TMaterial
	);

	geometry: TGeometry;
	material: TMaterial;
	morphTargetInfluences?: number[];
	morphTargetDictionary?: { [key: string]: number };
	isMesh: true;
	type: string;

	updateMorphTargets(): void;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;

}
