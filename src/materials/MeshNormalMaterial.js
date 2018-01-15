import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  opacity: <float>,
 *
 *  bumpMap: new THREE.Texture( <Image> ),
 *  bumpScale: <float>,
 *
 *  normalMap: new THREE.Texture( <Image> ),
 *  normalScale: <Vector2>,
 *
 *  displacementMap: new THREE.Texture( <Image> ),
 *  displacementScale: <float>,
 *  displacementBias: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */

function MeshNormalMaterial( parameters ) {

	Material.call( this );

	this.type = 'MeshNormalMaterial';

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalScale = new Vector2( 1, 1 );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.wireframe = false;
	this.wireframeLinewidth = 1;

	this.fog = false;
	this.lights = false;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

}

MeshNormalMaterial.prototype = Object.create( Material.prototype );
MeshNormalMaterial.prototype.constructor = MeshNormalMaterial;

MeshNormalMaterial.prototype.isMeshNormalMaterial = true;

MeshNormalMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	if ( source.bumpMap !== undefined ) this.bumpMap = source.bumpMap;
	if ( source.bumpScale !== undefined ) this.bumpScale = source.bumpScale;

	if ( source.normalMap !== undefined ) this.normalMap = source.normalMap;
	if ( source.normalScale !== undefined ) this.normalScale.copy( source.normalScale );

	if ( source.displacementMap !== undefined ) this.displacementMap = source.displacementMap;
	if ( source.displacementScale !== undefined ) this.displacementScale = source.displacementScale;
	if ( source.displacementBias !== undefined ) this.displacementBias = source.displacementBias;

	if ( source.wireframe !== undefined ) this.wireframe = source.wireframe;
	if ( source.wireframeLinewidth !== undefined ) this.wireframeLinewidth = source.wireframeLinewidth;

	if ( source.skinning !== undefined ) this.skinning = source.skinning;
	if ( source.morphTargets !== undefined ) this.morphTargets = source.morphTargets;
	if ( source.morphNormals !== undefined ) this.morphNormals = source.morphNormals;

	return this;

};


export { MeshNormalMaterial };
