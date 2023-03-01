import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_BlinnPhong from './BSDF/BRDF_BlinnPhong.js';
import { lightingModel } from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { materialReflectivity } from '../accessors/MaterialNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { ShaderNode } from '../shadernode/ShaderNode.js';

const RE_Direct_BlinnPhong = new ShaderNode( ( { lightDirection, lightColor, reflectedLight } ) => {

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const irradiance = dotNL.mul( lightColor );

	reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert.call( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_BlinnPhong.call( { lightDirection } ) ).mul( materialReflectivity ) );

} );

const RE_IndirectDiffuse_BlinnPhong = new ShaderNode( ( { irradiance, reflectedLight } ) => {

	reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert.call( { diffuseColor } ) ) );

} );

const phongLightingModel = lightingModel( RE_Direct_BlinnPhong, RE_IndirectDiffuse_BlinnPhong );

export default phongLightingModel;
