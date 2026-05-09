import LightingModel from '../core/LightingModel.js';
import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { normalGeometry } from '../accessors/Normal.js';
import { Fn, float, vec2, vec3 } from '../tsl/TSLBase.js';
import { mix, smoothstep } from '../math/MathNode.js';
import { materialReference } from '../accessors/MaterialReferenceNode.js';

const getGradientIrradiance = /*@__PURE__*/ Fn( ( { normal, lightDirection, builder } ) => {

	// dotNL will be from -1.0 to 1.0
	const dotNL = normal.dot( lightDirection );
	const coord = vec2( dotNL.mul( 0.5 ).add( 0.5 ), 0.0 );

	if ( builder.material.gradientMap ) {

		const gradientMap = materialReference( 'gradientMap', 'texture' ).context( { getUV: () => coord } );

		return vec3( gradientMap.r );

	} else {

		const fw = coord.fwidth().mul( 0.5 );

		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( float( 0.7 ).sub( fw.x ), float( 0.7 ).add( fw.x ), coord.x ) );

	}

} );

/**
 * Represents the lighting model for a toon material. Used in {@link MeshToonNodeMaterial}.
 *
 * @augments LightingModel
 */
class ToonLightingModel extends LightingModel {

	/**
	 * Implements the direct lighting. Instead of using a conventional smooth irradiance, the irradiance is
	 * reduced to a small number of discrete shades to create a comic-like, flat look.
	 *
	 * @param {Object} lightData - The light data.
	 * @param {NodeBuilder} builder - The current node builder.
	 */
	direct( { lightDirection, lightColor, reflectedLight }, builder ) {

		const irradiance = getGradientIrradiance( { normal: normalGeometry, lightDirection, builder } ).mul( lightColor );

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

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

export default ToonLightingModel;
