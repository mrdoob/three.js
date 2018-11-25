import { TangentSpaceNormalMap } from '../constants.js';
import { Material } from './Material.js';
import { Vector2 } from '../math/Vector2.js';
import { Color } from '../math/Color.js';

/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *
 *  matcap: new THREE.Texture( <Image> ),
 *
 *  map: new THREE.Texture( <Image> ),
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
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  skinning: <bool>,
 *  morphTargets: <bool>,
 *  morphNormals: <bool>
 * }
 */

function MeshMatcapMaterial( parameters ) {

	Material.call( this );

	this.defines = { 'MATCAP': '' };

	this.type = 'MeshMatcapMaterial';

	this.color = new Color( 0xffffff ); // diffuse

	this.matcap = null;

	this.map = null;

	this.bumpMap = null;
	this.bumpScale = 1;

	this.normalMap = null;
	this.normalMapType = TangentSpaceNormalMap;
	this.normalScale = new Vector2( 1, 1 );

	this.displacementMap = null;
	this.displacementScale = 1;
	this.displacementBias = 0;

	this.alphaMap = null;

	this.skinning = false;
	this.morphTargets = false;
	this.morphNormals = false;

	this.lights = false;

	this.setValues( parameters );

	// a matcap is required

	if ( this.matcap === null ) {

		var canvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' );
		canvas.width = 1;
		canvas.height = 1;

		var context = canvas.getContext( '2d' );

		context.fillStyle = '#fff';
		context.fillRect( 0, 0, 1, 1 );

		this.matcap = new THREE.CanvasTexture( canvas );

	}

}

MeshMatcapMaterial.prototype = Object.create( Material.prototype );
MeshMatcapMaterial.prototype.constructor = MeshMatcapMaterial;

MeshMatcapMaterial.prototype.isMeshMatcapMaterial = true;

MeshMatcapMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.defines = { 'MATCAP': '' };

	this.color.copy( source.color );

	this.matcap = source.matcap;

	this.map = source.map;

	this.bumpMap = source.bumpMap;
	this.bumpScale = source.bumpScale;

	this.normalMap = source.normalMap;
	this.normalMapType = source.normalMapType;
	this.normalScale.copy( source.normalScale );

	this.displacementMap = source.displacementMap;
	this.displacementScale = source.displacementScale;
	this.displacementBias = source.displacementBias;

	this.alphaMap = source.alphaMap;

	this.skinning = source.skinning;
	this.morphTargets = source.morphTargets;
	this.morphNormals = source.morphNormals;

	return this;

};


export { MeshMatcapMaterial };
