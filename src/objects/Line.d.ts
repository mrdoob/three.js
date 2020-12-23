import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

export class Line <
	TGeometry extends Geometry | BufferGeometry = Geometry | BufferGeometry,
	TMaterial extends Material | Material[] = Material | Material[]
> extends Object3D {

	constructor(
		geometry?: TGeometry,
		material?: TMaterial
	);

	geometry: TGeometry;
	material: TMaterial;

	type: 'Line' | 'LineLoop' | 'LineSegments' | string;
	readonly isLine: true;

	morphTargetInfluences?: number[];
	morphTargetDictionary?: { [key: string]: number };

	computeLineDistances(): this;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;
	updateMorphTargets(): void;

}
