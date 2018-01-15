import { Material } from './Material.js';
import { Vector3 } from '../math/Vector3.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *
 *  referencePosition: <float>,
 *  nearDistance: <float>,
 *  farDistance: <float>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  displacementMap: new THREE.Texture( <Image> ),
 *  displacementScale: <float>,
 *  displacementBias: <float>
 *
 * }
 */

function MeshDistanceMaterial( parameters ) {

	Material.call( this );

	this.type = 'MeshDistanceMaterial';

	this.referencePosition = new Vector3();
	this.nearDistance = 1;
	this.farDistance = 1000;

	this.skinning = false;
	this.morphTargets = false;

	this.map = null;

	this.alphaMap = null;

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.fog = false;
	this.lights = false;

	this.setValues( parameters );

}

MeshDistanceMaterial.prototype = Object.create( Material.prototype );
MeshDistanceMaterial.prototype.constructor = MeshDistanceMaterial;

MeshDistanceMaterial.prototype.isMeshDistanceMaterial = true;

MeshDistanceMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	if ( source.referencePosition !== undefined ) this.referencePosition.copy( source.referencePosition );
	if ( source.nearDistance !== undefined ) this.nearDistance = source.nearDistance;
	if ( source.farDistance !== undefined ) this.farDistance = source.farDistance;

	if ( source.skinning !== undefined ) this.skinning = source.skinning;
	if ( source.morphTargets !== undefined ) this.morphTargets = source.morphTargets;

	if ( source.map !== undefined ) this.map = source.map;

	if ( source.alphaMap !== undefined ) this.alphaMap = source.alphaMap;

	if ( source.displacementMap !== undefined ) this.displacementMap = source.displacementMap;
	if ( source.displacementScale !== undefined ) this.displacementScale = source.displacementScale;
	if ( source.displacementBias !== undefined ) this.displacementBias = source.displacementBias;

	return this;

};


export { MeshDistanceMaterial };
