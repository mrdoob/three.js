import { MeshDepthMaterial, RGBADepthPacking } from "../../../build/three.module";

/**
 * @author Maxime Quiblier / http://github.com/maximeq
 */
export function MeshRGBADepthMaterial( parameters ) {

	parameters = parameters || {};
	parameters.depthPacking = RGBADepthPacking;

	MeshDepthMaterial.call( this, parameters );

}

MeshRGBADepthMaterial.prototype = Object.create( MeshDepthMaterial.prototype );
MeshRGBADepthMaterial.prototype.constructor = MeshRGBADepthMaterial;
