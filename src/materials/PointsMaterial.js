import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 *
 * parameters = {
 *  color: <hex>,
 *  opacity: <float>,
 *  map: new THREE.Texture( <Image> ),
 *  alphaMap: new THREE.Texture( <Image> ),
 *
 *  size: <float>,
 *  sizeAttenuation: <bool>
 *
 *  morphTargets: <bool>
 * }
 */

function PointsMaterial( parameters ) {

	Material.call( this );

	this.type = 'PointsMaterial';

	this.color = new Color( 0xffffff );

	this.map = null;

	this.alphaMap = null;

	this.size = 1;
	this.sizeAttenuation = true;

	this.morphTargets = false;

	this.setValues( parameters );

}

PointsMaterial.prototype = Object.create( Material.prototype );
PointsMaterial.prototype.constructor = PointsMaterial;

PointsMaterial.prototype.isPointsMaterial = true;

PointsMaterial.prototype.onRefreshUniforms = function ( uniforms ) {

	uniforms.diffuse.value.copy( this.color );
	uniforms.opacity.value = this.opacity;
	uniforms.size.value = this.size * _pixelRatio;
	uniforms.scale.value = _height * 0.5;

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

PointsMaterial.prototype.copy = function ( source ) {

	Material.prototype.copy.call( this, source );

	this.color.copy( source.color );

	this.map = source.map;

	this.alphaMap = source.alphaMap;

	this.size = source.size;
	this.sizeAttenuation = source.sizeAttenuation;

	this.morphTargets = source.morphTargets;

	return this;

};


export { PointsMaterial };
