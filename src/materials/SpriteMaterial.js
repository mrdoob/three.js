import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  map: new THREE.Texture( <Image> ),
 *  alphaMap: new THREE.Texture( <Image> ),
 *  rotation: <float>,
 *  sizeAttenuation: <bool>
 * }
 */

function SpriteMaterial( parameters ) {

	Material.call( this );

	this.type = 'SpriteMaterial';

	this.color = new Color( 0xffffff );

	this.map = null;

	this.alphaMap = null;

	this.rotation = 0;

	this.sizeAttenuation = true;

	this.transparent = true;

	this.setValues( parameters );

}

SpriteMaterial.prototype = Object.create( Material.prototype );
SpriteMaterial.prototype.constructor = SpriteMaterial;
SpriteMaterial.prototype.isSpriteMaterial = true;

SpriteMaterial.prototype.onRefreshUniforms = function ( uniforms ) {

	uniforms.diffuse.value.copy( this.color );
	uniforms.opacity.value = this.opacity;
	uniforms.rotation.value = this.rotation;

	if ( this.map ) {

		uniforms.map.value = this.map;

	}

	if ( this.alphaMap ) {

		uniforms.alphaMap.value = this.alphaMap;

	}

	// uv repeat and offset setting priorities
	// 1. color map
	// 2. alpha map

	var uvScaleMap;

	if ( this.map ) {

		uvScaleMap = this.map;

	} else if ( this.alphaMap ) {

		uvScaleMap = this.alphaMap;

	}

	if ( uvScaleMap !== undefined ) {

		if ( uvScaleMap.matrixAutoUpdate === true ) {

			uvScaleMap.updateMatrix();

		}

		uniforms.uvTransform.value.copy( uvScaleMap.matrix );

	}

};

SpriteMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	this.alphaMap = source.alphaMap;

	this.rotation = source.rotation;

	this.sizeAttenuation = source.sizeAttenuation;

	return this;

};


export { SpriteMaterial };
