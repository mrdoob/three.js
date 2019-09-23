import { Object3D } from '../../core/Object3D';
import { BufferGeometry } from '../../core/BufferGeometry';
import { Material } from '../../materials/Material';
import { WebGLProgram } from './WebGLProgram';

export class WebGLMorphtargets {

	constructor( gl: WebGLRenderingContext );

	update( object: Object3D, geometry: BufferGeometry, material: Material, program: WebGLProgram ): void;

}
