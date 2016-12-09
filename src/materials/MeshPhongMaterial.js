import { Material } from './Material';
import { MultiplyOperation } from '../constants';
import { Vector2 } from '../math/Vector2';
import { Color } from '../math/Color';

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
	this.isExperimentalMaterial = true;

	this.addParameter( 'color', new Color( 0xffffff ), 'diffuse' ); // diffuse
	this.addParameter( 'specular', new Color( 0x111111 ) );
	this.addParameter( 'shininess', 30, null, function ( value ) { return Math.max( value, 1e-4 ) } );

	this.addParameter( 'map', null );

	this.addParameter( 'lightMap', null );
	this.addParameter( 'lightMapIntensity', 1.0 );

	this.addParameter( 'aoMap', null );
	this.addParameter( 'aoMapIntensity',  1.0 );

	this.addParameter( 'emissive', new Color( 0x000000 ), 'emissiveColor' );
	this.addParameter( 'emissiveIntensity',  1.0 );
	this.addParameter( 'emissiveMap',  null );

	this.addParameter( 'bumpMap', null );
	this.addParameter( 'bumpScale', 1 );

	this.addParameter( 'normalMap', null );
	this.addParameter( 'normalScale', new Vector2( 1, 1 ) );

	this.addParameter( 'displacementMap', null );
	this.addParameter( 'displacementScale', 1 );
	this.addParameter( 'displacementBias', 0 );

	this.addParameter( 'specularMap', null );

	this.addParameter( 'alphaMap', null );

	this.addParameter( '_envMap', null, 'envMap' );
	this.addParameter( 'flipEnvMap', 1, null );

	Object.defineProperty( this, 'envMap', {
		set: function ( value ) { this._envMap = value; this.flipEnvMap = ( ! ( value && value.isCubeTexture ) ) ? 1 : - 1 },
		get: function () { return this._envMap }
	} );

	this.combine = MultiplyOperation;
	this.addParameter( 'reflectivity', 1 );
	this.addParameter( 'refractionRatio',  0.98 );

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

	this.color.copy( source.color );
	this.specular.copy( source.specular );
	this.shininess = source.shininess;

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
	this.normalScale.copy( source.normalScale );

	this.displacementMap = source.displacementMap;
	this.displacementScale = source.displacementScale;
	this.displacementBias = source.displacementBias;

	this.specularMap = source.specularMap;

	this.alphaMap = source.alphaMap;

	this.envMap = source.envMap;
	this.combine = source.combine;
	this.reflectivity = source.reflectivity;
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


export { MeshPhongMaterial };
