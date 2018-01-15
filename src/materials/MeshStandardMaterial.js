import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  roughness: <float>,
 *  metalness: <float>,
 *  opacity: <float>,
 *
 *  map: new THREE.Texture( <Image> ),
 *
 *  lightMap: new THREE.Texture( <Image> ),
 *  lightMapIntensity: <float>
 *
 *  aoMap: new THREE.Texture( <Image> ),
 *  aoMapIntensity: <float>
 *
 *  emissive: <hex>,
 *  emissiveIntensity: <float>
 *  emissiveMap: new THREE.Texture( <Image> ),
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
 *  roughnessMap: new THREE.Texture( <Image> ),
 *
 *  metalnessMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.CubeTexture( [posx, negx, posy, negy, posz, negz] ),
 *  envMapIntensity: <float>
 *
 *  refractionRatio: <float>,
 *
 *  wireframe: <boolean>,
 *  wireframeLinewidth: <float>,
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */

function MeshStandardMaterial( parameters ) {

	Material.call( this );

	this.defines = { 'STANDARD': '' };

	this.type = 'MeshStandardMaterial';

	this.color = new Color( 0xffffff ); // diffuse
	this.roughness = 0.5;
	this.metalness = 0.5;

	this.map = null;

	this.lightMap = null;
	this.lightMapIntensity = 1.0;

	this.aoMap = null;
	this.aoMapIntensity = 1.0;

	this.emissive = new Color( 0x000000 );
	this.emissiveIntensity = 1.0;
	this.emissiveMap = null;

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalScale = new Vector2( 1, 1 );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.roughnessMap = null;

	this.metalnessMap = null;

	this.alphaMap = null;

	this.envMap = null;
	this.envMapIntensity = 1.0;

	this.refractionRatio = 0.98;

	this.wireframe = false;
	this.wireframeLinewidth = 1;
	this.wireframeLinecap = 'round';
	this.wireframeLinejoin = 'round';

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.setValues( parameters );

}

MeshStandardMaterial.prototype = Object.create( Material.prototype );
MeshStandardMaterial.prototype.constructor = MeshStandardMaterial;

MeshStandardMaterial.prototype.isMeshStandardMaterial = true;

MeshStandardMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.defines = { 'STANDARD': '' };

	if ( source.color !== undefined ) this.color.copy( source.color );
	if ( source.roughness !== undefined ) this.roughness = source.roughness;
	if ( source.metalness !== undefined ) this.metalness = source.metalness;

	if ( source.map !== undefined ) this.map = source.map;

	if ( source.lightMap !== undefined ) this.lightMap = source.lightMap;
	if ( source.lightMapIntensity !== undefined ) this.lightMapIntensity = source.lightMapIntensity;

	if ( source.aoMap !== undefined ) this.aoMap = source.aoMap;
	if ( source.aoMapIntensity !== undefined ) this.aoMapIntensity = source.aoMapIntensity;

	if ( source.emissive !== undefined ) this.emissive.copy( source.emissive );
	if ( source.emissiveMap !== undefined ) this.emissiveMap = source.emissiveMap;
	if ( source.emissiveIntensity !== undefined ) this.emissiveIntensity = source.emissiveIntensity;

	if ( source.bumpMap !== undefined ) this.bumpMap = source.bumpMap;
	if ( source.bumpScale !== undefined ) this.bumpScale = source.bumpScale;

	if ( source.normalMap !== undefined ) this.normalMap = source.normalMap;
	if ( source.normalScale !== undefined ) this.normalScale.copy( source.normalScale );

	if ( source.displacementMap !== undefined ) this.displacementMap = source.displacementMap;
	if ( source.displacementScale !== undefined ) this.displacementScale = source.displacementScale;
	if ( source.displacementBias !== undefined ) this.displacementBias = source.displacementBias;

	if ( source.roughnessMap !== undefined ) this.roughnessMap = source.roughnessMap;

	if ( source.metalnessMap !== undefined ) this.metalnessMap = source.metalnessMap;

	if ( source.alphaMap !== undefined ) this.alphaMap = source.alphaMap;

	if ( source.envMap !== undefined ) this.envMap = source.envMap;
	if ( source.envMapIntensity !== undefined ) this.envMapIntensity = source.envMapIntensity;

	if ( source.refractionRatio !== undefined ) this.refractionRatio = source.refractionRatio;

	if ( source.wireframe !== undefined ) this.wireframe = source.wireframe;
	if ( source.wireframeLinewidth !== undefined ) this.wireframeLinewidth = source.wireframeLinewidth;
	if ( source.wireframeLinecap !== undefined ) this.wireframeLinecap = source.wireframeLinecap;
	if ( source.wireframeLinejoin !== undefined ) this.wireframeLinejoin = source.wireframeLinejoin;

	if ( source.skinning !== undefined ) this.skinning = source.skinning;
	if ( source.morphTargets !== undefined ) this.morphTargets = source.morphTargets;
	if ( source.morphNormals !== undefined ) this.morphNormals = source.morphNormals;

	return this;

};


export { MeshStandardMaterial };
