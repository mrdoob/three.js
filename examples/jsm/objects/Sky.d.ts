import {
	BoxBufferGeometry,
	Mesh,
	ShaderMaterial
} from '../../../src/Three';

export class Sky extends Mesh {

	constructor();

	geometry: BoxBufferGeometry;
	material: ShaderMaterial;

	static SkyShader: object;

}
