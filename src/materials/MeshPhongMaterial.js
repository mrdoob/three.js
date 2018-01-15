import { Material } from './Material.js';
import { MultiplyOperation } from '../constants.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  specular: <hex>,
 *  shininess: <float>,
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
 *  specularMap: new THREE.Texture( <Image> ),
 *
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  envMap: new THREE.TextureCube( [posx, negx, posy, negy, posz, negz] ),
 *  combine: THREE.Multiply,
 *  reflectivity: <float>,
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

function MeshPhongMaterial( parameters ) {

	Material.call( this );

	this.type = 'MeshPhongMaterial';

	this.color = new Color( 0xffffff ); // diffuse
	this.specular = new Color( 0x111111 );
	this.shininess = 30;

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

	this.specularMap = null;

	this.alphaMap = null;

	this.envMap = null;
	this.combine = MultiplyOperation;
	this.reflectivity = 1;
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

MeshPhongMaterial.prototype = Object.create( Material.prototype );
MeshPhongMaterial.prototype.constructor = MeshPhongMaterial;

MeshPhongMaterial.prototype.isMeshPhongMaterial = true;

MeshPhongMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	if ( source.color !== undefined ) this.color.copy( source.color );
	if ( source.specular !== undefined ) this.specular.copy( source.specular );
	if ( source.shininess !== undefined ) this.shininess = source.shininess;

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

	if ( source.specularMap !== undefined ) this.specularMap = source.specularMap;

	if ( source.alphaMap !== undefined ) this.alphaMap = source.alphaMap;

	if ( source.envMap !== undefined ) this.envMap = source.envMap;
	if ( source.combine !== undefined ) this.combine = source.combine;
	if ( source.reflectivity !== undefined ) this.reflectivity = source.reflectivity;
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


export { MeshPhongMaterial };
