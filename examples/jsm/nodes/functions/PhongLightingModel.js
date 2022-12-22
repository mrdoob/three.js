import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_BlinnPhong from './BSDF/BRDF_BlinnPhong.js';

import {
	ShaderNode,
	mul, clamp, dot, transformedNormalView,
	diffuseColor, materialReflectivity, lightingModel
} from '../shadernode/ShaderNodeElements.js';

const RE_Direct_BlinnPhong = new ShaderNode( ( { lightDirection, lightColor, reflectedLight } ) => {

	const dotNL = clamp( dot( transformedNormalView, lightDirection ) );
	const irradiance = mul( dotNL, lightColor );

	reflectedLight.directDiffuse.add( mul( irradiance, BRDF_Lambert.call( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.add( irradiance.mul( BRDF_BlinnPhong.call( { lightDirection } ) ).mul( materialReflectivity ) );

} );

const RE_IndirectDiffuse_BlinnPhong = new ShaderNode( ( { irradiance, reflectedLight } ) => {

	reflectedLight.indirectDiffuse.add( irradiance.mul( BRDF_Lambert.call( { diffuseColor } ) ) );

} );

const phongLightingModel = lightingModel( RE_Direct_BlinnPhong, RE_IndirectDiffuse_BlinnPhong );

export default phongLightingModel;
