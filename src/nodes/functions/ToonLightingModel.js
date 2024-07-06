import LightingModel from '../core/LightingModel.js';
import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { normalGeometry } from '../accessors/NormalNode.js';
import { tslFn, float, vec2, vec3 } from '../shadernode/ShaderNode.js';
import { mix, smoothstep } from '../math/MathNode.js';
import { materialReference } from '../accessors/MaterialReferenceNode.js';

const getGradientIrradiance = tslFn( ( { normal, lightDirection, builder } ) => {

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

class ToonLightingModel extends LightingModel {

	direct( { lightDirection, lightColor, reflectedLight }, stack, builder ) {

		const irradiance = getGradientIrradiance( { normal: normalGeometry, lightDirection, builder } ).mul( lightColor );

		reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

	}

	indirect( { ambientOcclusion, irradiance, reflectedLight } ) {

		reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

		reflectedLight.indirectDiffuse.mulAssign( ambientOcclusion );

	}

}

export default ToonLightingModel;
