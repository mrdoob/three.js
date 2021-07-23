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
 *  reflectivity: <float>,
 *  ior: <float>,
 *
 *  sheen: <Color>,
 *
 *  transmission: <float>,
 *  transmissionMap: new THREE.Texture( <Image> ),
 *
 *  thickness: <float>,
 *  thicknessMap: new THREE.Texture( <Image> ),
 *  attenuationDistance: <float>,
 *  attenuationColor: <Color>
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

		this.clearcoat = 0.0;
		this.clearcoatMap = null;
		this.clearcoatRoughness = 0.0;
		this.clearcoatRoughnessMap = null;
		this.clearcoatNormalScale = new Vector2( 1, 1 );
		this.clearcoatNormalMap = null;

		this.reflectivity = 0.5; // maps to F0 = 0.04

		Object.defineProperty( this, 'ior', {
			get: function () {

				return ( 1 + 0.4 * this.reflectivity ) / ( 1 - 0.4 * this.reflectivity );

			},
			set: function ( ior ) {

				this.reflectivity = MathUtils.clamp( 2.5 * ( ior - 1 ) / ( ior + 1 ), 0, 1 );

			}
		} );

		this.sheen = null; // null will disable sheen bsdf

		this.transmission = 0.0;
		this.transmissionMap = null;

		this.thickness = 0.01;
		this.thicknessMap = null;
		this.attenuationDistance = 0.0;
		this.attenuationColor = new Color( 1, 1, 1 );

		this.setValues( parameters );

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

		this.reflectivity = source.reflectivity;

		if ( source.sheen ) {

			this.sheen = ( this.sheen || new Color() ).copy( source.sheen );

		} else {

			this.sheen = null;

		}

		this.transmission = source.transmission;
		this.transmissionMap = source.transmissionMap;

		this.thickness = source.thickness;
		this.thicknessMap = source.thicknessMap;
		this.attenuationDistance = source.attenuationDistance;
		this.attenuationColor.copy( source.attenuationColor );

		return this;

	}

}

MeshPhysicalMaterial.prototype.isMeshPhysicalMaterial = true;

export { MeshPhysicalMaterial };
