import { Geometry } from './../core/Geometry';
import { Material } from './../materials/Material';
import { LineBasicMaterial } from './../materials/LineBasicMaterial';
import { Raycaster } from './../core/Raycaster';
import { Object3D } from './../core/Object3D';
import { BufferGeometry } from '../core/BufferGeometry';
import { Intersection } from '../core/Raycaster';

export class Line<
	TGeometry extends Geometry | BufferGeometry = BufferGeometry,
	TMaterial extends Material = LineBasicMaterial
> extends Object3D {

	constructor( geometry?: TGeometry, material?: TMaterial, mode?: number );

	geometry: TGeometry;
	material: TMaterial;

	type: 'Line' | 'LineLoop' | 'LineSegments';
	readonly isLine: true;

	computeLineDistances(): this;
	raycast( raycaster: Raycaster, intersects: Intersection[] ): void;

}
