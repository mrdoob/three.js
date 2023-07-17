import BRDF_Lambert from './BSDF/BRDF_Lambert.js';
import { lightingModel } from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';
import { transformedNormalView } from '../accessors/NormalNode.js';
import { tslFn } from '../shadernode/ShaderNode.js';

const RE_Direct_Lambert = tslFn( ( { lightDirection, lightColor, reflectedLight } ) => {

	const dotNL = transformedNormalView.dot( lightDirection ).clamp();
	const irradiance = dotNL.mul( lightColor );

	reflectedLight.directDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor: diffuseColor.rgb } ) ) );

} );

const RE_IndirectDiffuse_Lambert = tslFn( ( { irradiance, reflectedLight } ) => {

	reflectedLight.indirectDiffuse.addAssign( irradiance.mul( BRDF_Lambert( { diffuseColor } ) ) );

} );

const lambertLightingModel = lightingModel( null, RE_Direct_Lambert, RE_IndirectDiffuse_Lambert );

export default lambertLightingModel;
