import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import BRDF_BlinnPhong from './BSDF/BRDF_BlinnPhong.js';
import { lightingModel } from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { materialReflectivity } from '../accessors/MaterialNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { tslFn } from '../shadernode/ShaderNode.js';

const RE_Direct_BlinnPhong = tslFn( ( { lightDirection, lightColor, reflectedLight } ) => {

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const irradiance = dotNL.mul( lightColor );

	reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

	reflectedLight.directSpecular.addAssign( irradiance.mul( BRDF_BlinnPhong( { lightDirection } ) ).mul( materialReflectivity ) );

} );

const RE_IndirectDiffuse_BlinnPhong = tslFn( ( { irradiance, reflectedLight } ) => {

	reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

} );

const phongLightingModel = lightingModel( null, RE_Direct_BlinnPhong, RE_IndirectDiffuse_BlinnPhong );

export default phongLightingModel;
