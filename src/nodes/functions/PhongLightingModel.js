import BasicLightingModel from './BasicLightingModel.js';
import F_Schlick from './BSDF/F_Schlick.js';
import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import { diffuseColor, shininess, specularColor } from '../core/PropertyNode.js';
import { transformedNormalView } from '../accessors/Normal.js';
import { materialSpecularStrength } from '../accessors/MaterialNode.js';
import { positionViewDirection } from '../accessors/Position.js';
import { Fn, float } from '../tsl/TSLBase.js';

const G_BlinnPhong_Implicit = () => float( 0.25 );

const D_BlinnPhong = /*@__PURE__*/ Fn( ( { dotNH } ) => {

	return shininess.mul( float( 0.5 ) ).add( 1.0 ).mul( float( 1 / Math.PI ) ).mul( dotNH.pow( shininess ) );

} );

const BRDF_BlinnPhong = /*@__PURE__*/ Fn( ( { lightDirection } ) => {

	const halfDir = lightDirection.add( positionViewDirection ).normalize();

	const dotNH = transformedNormalView.dot( halfDir ).clamp();
	const dotVH = positionViewDirection.dot( halfDir ).clamp();

	const F = F_Schlick( { f0: specularColor, f90: 1.0, dotVH } );
	const G = G_BlinnPhong_Implicit();
	const D = D_BlinnPhong( { dotNH } );

	return F.mul( G ).mul( D );

} );

/**
 * Represents the lighting model for a phong material. Used in {@link MeshPhongNodeMaterial}.
 *
 * @augments BasicLightingModel
 */
class PhongLightingModel extends BasicLightingModel {

	/**
	 * Constructs a new phong lighting model.
	 *
	 * @param {boolean} [specular=true] - Whether specular is supported or not.
	 */
	constructor( specular = true ) {

		super();

		/**
		 * Whether specular is supported or not. Set this to `false` if you are
		 * looking for a Lambert-like material meaning a material for non-shiny
		 * surfaces, without specular highlights.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.specular = specular;

	}

	/**
	 * Implements the direct lighting. The specular portion is optional an can be controlled
	 * with the {@link PhongLightingModel#specular} flag.
	 *
	 * @param {Object} lightData - The light data.
	 */
	direct( { lightDirection, lightColor, reflectedLight } ) {

		const dotNL = transformedNormalView.dot( lightDirection ).clamp();
		const irradiance = dotNL.mul( lightColor );

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

		if ( this.specular === true ) {

			reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_BlinnPhong( { lightDirection } ) ).mul( materialSpecularStrength ) );

		}

	}

	/**
	 * Implements the indirect lighting.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	indirect( builder ) {

		const { ambientOcclusion, irradiance, reflectedLight } = builder.context;

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	}

}

export default PhongLightingModel;
