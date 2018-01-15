import { Material } from './Material.js';
import { BasicDepthPacking } from '../constants.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / https://clara.io
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  displacementMap: new THREE.Texture( <Image> ),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 * }
 */

function MeshDepthMaterial( parameters ) {

	Material.call( this );

	this.type = 'MeshDepthMaterial';

	this.depthPacking = BasicDepthPacking;

	this.skinning = false;
	this.morphTargets = false;

	this.map = null;

	this.alphaMap = null;

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false;
	this.lights = false;

	this.setValues( parameters );

}

MeshDepthMaterial.prototype = Object.create( Material.prototype );
MeshDepthMaterial.prototype.constructor = MeshDepthMaterial;

MeshDepthMaterial.prototype.isMeshDepthMaterial = true;

MeshDepthMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	if ( source.depthPacking !== undefined ) this.depthPacking = source.depthPacking;

	if ( source.skinning !== undefined ) this.skinning = source.skinning;
	if ( source.morphTargets !== undefined ) this.morphTargets = source.morphTargets;

	if ( source.map !== undefined ) this.map = source.map;

	if ( source.alphaMap !== undefined ) this.alphaMap = source.alphaMap;

	if ( source.displacementMap !== undefined ) this.displacementMap = source.displacementMap;
	if ( source.displacementScale !== undefined ) this.displacementScale = source.displacementScale;
	if ( source.displacementBias !== undefined ) this.displacementBias = source.displacementBias;

	if ( source.wireframe !== undefined ) this.wireframe = source.wireframe;
	if ( source.wireframeLinewidth !== undefined ) this.wireframeLinewidth = source.wireframeLinewidth;

	return this;

};


export { MeshDepthMaterial };
