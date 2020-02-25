import { BufferGeometry } from '../core/BufferGeometry';
import { Material } from './../materials/Material';
import { MeshBasicMaterial } from './../materials/MeshBasicMaterial';
import { BufferAttribute } from './../core/BufferAttribute';
import { Mesh } from './Mesh';
import { Matrix4 } from './../math/Matrix4';

export class InstancedMesh<
	TGeometry extends BufferGeometry,
	TMaterial extends Material = MeshBasicMaterial
> extends Mesh<TGeometry, TMaterial> {

	constructor( geometry: TGeometry, material: TMaterial, count: number );

	count: number;
	instanceMatrix: BufferAttribute;
	readonly isInstancedMesh: true;

	getMatrixAt( index: number, matrix: Matrix4 ): void;
	setMatrixAt( index: number, matrix: Matrix4 ): void;



}
