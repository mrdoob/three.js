import { TangentSpaceNormalMap, BackSide } from '../constants.js';
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
 *  normalMapType: THREE.TangentSpaceNormalMap,
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
	this.normalMapType = TangentSpaceNormalMap;
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

MeshStandardMaterial.prototype.onRefreshUniforms = function ( uniforms ) {

	Material.prototype.onRefreshUniforms.call( this, uniforms );

	uniforms.roughness.value = this.roughness;
	uniforms.metalness.value = this.metalness;

	if ( this.roughnessMap ) {

		uniforms.roughnessMap.value = this.roughnessMap;

	}

	if ( this.metalnessMap ) {

		uniforms.metalnessMap.value = this.metalnessMap;

	}

	if ( this.emissiveMap ) {

		uniforms.emissiveMap.value = this.emissiveMap;

	}

	if ( this.bumpMap ) {

		uniforms.bumpMap.value = this.bumpMap;
		uniforms.bumpScale.value = this.bumpScale;
		if ( this.side === BackSide ) uniforms.bumpScale.value *= - 1;

	}

	if ( this.normalMap ) {

		uniforms.normalMap.value = this.normalMap;
		uniforms.normalScale.value.copy( this.normalScale );
		if ( this.side === BackSide ) uniforms.normalScale.value.negate();

	}

	if ( this.displacementMap ) {

		uniforms.displacementMap.value = this.displacementMap;
		uniforms.displacementScale.value = this.displacementScale;
		uniforms.displacementBias.value = this.displacementBias;

	}

	if ( this.envMap ) {

		//uniforms.envMap.value = this.envMap; // part of uniforms common
		uniforms.envMapIntensity.value = this.envMapIntensity;

	}

};

MeshStandardMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.defines = { 'STANDARD': '' };

	this.color.copy( source.color );
	this.roughness = source.roughness;
	this.metalness = source.metalness;

	this.map = source.map;

	this.lightMap = source.lightMap;
	this.lightMapIntensity = source.lightMapIntensity;

	this.aoMap = source.aoMap;
	this.aoMapIntensity = source.aoMapIntensity;

	this.emissive.copy( source.emissive );
	this.emissiveMap = source.emissiveMap;
	this.emissiveIntensity = source.emissiveIntensity;

	this.bumpMap = source.bumpMap;
	this.bumpScale = source.bumpScale;

	this.normalMap = source.normalMap;
	this.normalMapType = source.normalMapType;
	this.normalScale.copy( source.normalScale );

	this.displacementMap = source.displacementMap;
	this.displacementScale = source.displacementScale;
	this.displacementBias = source.displacementBias;

	this.roughnessMap = source.roughnessMap;

	this.metalnessMap = source.metalnessMap;

	this.alphaMap = source.alphaMap;

	this.envMap = source.envMap;
	this.envMapIntensity = source.envMapIntensity;

	this.refractionRatio = source.refractionRatio;

	this.wireframe = source.wireframe;
	this.wireframeLinewidth = source.wireframeLinewidth;
	this.wireframeLinecap = source.wireframeLinecap;
	this.wireframeLinejoin = source.wireframeLinejoin;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;
	this.morphNormals = source.morphNormals;

	return this;

};


export { MeshStandardMaterial };
