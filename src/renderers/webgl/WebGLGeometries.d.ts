import { WebGLAttributes } from './WebGLAttributes';
import { WebGLInfo } from './WebGLInfo';
import { BufferAttribute } from '../../core/BufferAttribute';
import { BufferGeometry } from '../../core/BufferGeometry';
import { Geometry } from '../../core/Geometry';
import { Object3D } from '../../core/Object3D';

export class WebGLGeometries {

	constructor( gl: WebGLRenderingContext, attributes: WebGLAttributes, info: WebGLInfo );

	get( object: Object3D, geometry: Geometry | BufferGeometry ): BufferGeometry;
	update( geometry: Geometry | BufferGeometry ): void;
	getWireframeAttribute( geometry: Geometry | BufferGeometry ): BufferAttribute;

}
