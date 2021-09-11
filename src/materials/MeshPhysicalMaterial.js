import { Vector2 } from '../math/Vector2.js';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';
import { Color } from '../math/Color.js';
import * as MathUtils from '../math/MathUtils.js';

/**
 * parameters = {
 *  clearcoat: <float>,
 *  clearcoatMap: new THREE.Texture( <Image> ),
 *  clearcoatRoughness: <float>,
 *  clearcoatRoughnessMap: new THREE.Texture( <Image> ),
 *  clearcoatNormalScale: <Vector2>,
 *  clearcoatNormalMap: new THREE.Texture( <Image> ),
 *
 *  ior: <float>,
 *  reflectivity: <float>,
 *
 *  sheen: <float>,
 *  sheenTint: <Color>,
 *  sheenRoughness: <float>,
 *
 *  transmission: <float>,
 *  transmissionMap: new THREE.Texture( <Image> ),
 *
 *  thickness: <float>,
 *  thicknessMap: new THREE.Texture( <Image> ),
 *  attenuationDistance: <float>,
 *  attenuationTint: <Color>,
 *
 *  specularIntensity: <float>,
 *  specularIntensityhMap: new THREE.Texture( <Image> ),
 *  specularTint: <Color>,
 *  specularTintMap: new THREE.Texture( <Image> )
 * }
 */

class MeshPhysicalMaterial extends MeshStandardMaterial {

	constructor( parameters ) {

		super();

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};

		this.type = 'MeshPhysicalMaterial';

		this.clearcoatMap = null;
		this.clearcoatRoughness = 0.0;
		this.clearcoatRoughnessMap = null;
		this.clearcoatNormalScale = new Vector2( 1, 1 );
		this.clearcoatNormalMap = null;

		this.ior = 1.5;

		Object.defineProperty( this, 'reflectivity', {
			get: function () {

				return ( MathUtils.clamp( 2.5 * ( this.ior - 1 ) / ( this.ior + 1 ), 0, 1 ) );

			},
			set: function ( reflectivity ) {

				this.ior = ( 1 + 0.4 * reflectivity ) / ( 1 - 0.4 * reflectivity );

			}
		} );

		this.sheenTint = new Color( 0x000000 );
		this.sheenRoughness = 1.0;

		this.transmissionMap = null;

		this.thickness = 0.01;
		this.thicknessMap = null;
		this.attenuationDistance = 0.0;
		this.attenuationTint = new Color( 1, 1, 1 );

		this.specularIntensity = 1.0;
		this.specularIntensityMap = null;
		this.specularTint = new Color( 1, 1, 1 );
		this.specularTintMap = null;

		this._sheen = 0.0;
		this._clearcoat = 0;
		this._transmission = 0;

		this.setValues( parameters );

	}

	get sheen() {

		return this._sheen;

	}

	set sheen( value ) {

		if ( this._sheen > 0 !== value > 0 ) {

			this.version ++;

		}

		this._sheen = value;

	}

	get clearcoat() {

		return this._clearcoat;

	}

	set clearcoat( value ) {

		if ( this._clearcoat > 0 !== value > 0 ) {

			this.version ++;

		}

		this._clearcoat = value;

	}

	get transmission() {

		return this._transmission;

	}

	set transmission( value ) {

		if ( this._transmission > 0 !== value > 0 ) {

			this.version ++;

		}

		this._transmission = value;

	}

	copy( source ) {

		super.copy( source );

		this.defines = {

			'STANDARD': '',
			'PHYSICAL': ''

		};

		this.clearcoat = source.clearcoat;
		this.clearcoatMap = source.clearcoatMap;
		this.clearcoatRoughness = source.clearcoatRoughness;
		this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
		this.clearcoatNormalMap = source.clearcoatNormalMap;
		this.clearcoatNormalScale.copy( source.clearcoatNormalScale );

		this.ior = source.ior;

		this.sheen = source.sheen;
		this.sheenTint.copy( source.sheenTint );
		this.sheenRoughness = source.sheenRoughness;

		this.transmission = source.transmission;
		this.transmissionMap = source.transmissionMap;

		this.thickness = source.thickness;
		this.thicknessMap = source.thicknessMap;
		this.attenuationDistance = source.attenuationDistance;
		this.attenuationTint.copy( source.attenuationTint );

		this.specularIntensity = source.specularIntensity;
		this.specularIntensityMap = source.specularIntensityMap;
		this.specularTint.copy( source.specularTint );
		this.specularTintMap = source.specularTintMap;

		return this;

	}

}

MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

export { MeshPhysicalMaterial };
