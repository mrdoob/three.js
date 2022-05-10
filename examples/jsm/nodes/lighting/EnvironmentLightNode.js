import LightingNode from './LightingNode.js';
import ContextNode from '../core/ContextNode.js';
import MaxMipLevelNode from '../utils/MaxMipLevelNode.js';
//import ReflectNode from '../accessors/ReflectNode.js';
import { ShaderNode, float, add, mul, div, log2, clamp, roughness, reflect, mix, vec3, positionViewDirection, negate, normalize, transformedNormalView, transformedNormalWorld, transformDirection, cameraViewMatrix } from '../shadernode/ShaderNodeElements.js';

// taken from here: http://casual-effects.blogspot.ca/2011/08/plausible-environment-lighting-in-two.html
const getSpecularMIPLevel = new ShaderNode( ( { texture, levelNode } ) => {

	const maxMIPLevelScalar = new MaxMipLevelNode( texture );

	const sigma = div( mul( Math.PI, mul( levelNode, levelNode ) ), add( 1.0, levelNode ) );
	const desiredMIPLevel = add( maxMIPLevelScalar, log2( sigma ) );

	return clamp( desiredMIPLevel, 0.0, maxMIPLevelScalar );

} );
/*
const getMaxMIPLevel = new ShaderNode( ( { texture } ) => {

	return new MaxMipLevelNode( texture );

} );
*/
class EnvironmentLightNode extends LightingNode {

	constructor( envNode = null ) {

		super();

		this.envNode = envNode;

	}

	generate( builder ) {

		const envNode = this.envNode;

		const flipNormalWorld = vec3( negate( transformedNormalWorld.x ), transformedNormalWorld.yz );

		let reflectVec = reflect( negate( positionViewDirection ), transformedNormalView );
		reflectVec = normalize( mix( reflectVec, transformedNormalView, mul( roughness, roughness ) ) );
		reflectVec = transformDirection( reflectVec, cameraViewMatrix );
		reflectVec = vec3( negate( reflectVec.x ), reflectVec.yz );

		//reflectVec = normalize( mix( new ReflectNode(), flipNormalWorld, mul( roughness, roughness ) ) );

		const radianceContext = new ContextNode( envNode, {
			tempRead: false,
			uvNode: reflectVec,
			levelNode: roughness,
			levelShaderNode: getSpecularMIPLevel
		} );

		const irradianceContext = new ContextNode( envNode, {
			tempRead: false,
			uvNode: flipNormalWorld,
			levelNode: float( 1 ),
			levelShaderNode: getSpecularMIPLevel
		} );

		builder.context.radiance.add( radianceContext );

		builder.context.iblIrradiance.add( mul( Math.PI, irradianceContext ) );

	}

}

export default EnvironmentLightNode;
