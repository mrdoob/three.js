import { float, max, normalWorld, sqrt, tangentWorld, bitangentWorld, transformNormalToView, vec2, vec3 } from 'three/tsl';

/**
 * Turns a trained tangent-space (dx, dy) offset into the mesh's final
 * view-space normal. The network only predicts the 2-component offset (see
 * NTCFormat.js's 'tanh'-activated `normal`/`clearcoatNormal` channels) - z
 * is reconstructed here as the positive root `sqrt(1 - dx*dx - dy*dy)`,
 * matching the always-positive-hemisphere tangent-space z convention every
 * `.ntc` asset was trained against.
 *
 * This is NOT the standard three.js `normalMap(texture, scale)` convention,
 * where the returned vector is left in tangent space and the base
 * `NodeMaterial.setupNormal()` pipeline transforms it downstream - here the
 * tangent/bitangent/normal blend happens explicitly, against whatever mesh
 * this material is actually applied to, matching how the offset was baked
 * at training time.
 */
function reconstructFinalNormal( offsetNode ) {

	const dx = offsetNode.x;
	const dy = offsetNode.y;
	const dz = sqrt( max( float( 1 ).sub( dx.mul( dx ) ).sub( dy.mul( dy ) ), float( 0 ) ) );
	const tangentSpace = vec3( dx, dy, dz );
	const blended = tangentWorld.mul( tangentSpace.x )
		.add( bitangentWorld.mul( tangentSpace.y ) )
		.add( normalWorld.mul( tangentSpace.z ) )
		.normalize();

	return transformNormalToView( blended );

}

/**
 * Converts a plain JS constant value (a bare number, or a [x,y]/[x,y,z]
 * array) into the equivalent TSL node - used to apply a constant (untrained)
 * channel's resolved value as a literal shader constant.
 */
function constantToNode( value ) {

	if ( ! Array.isArray( value ) ) return float( value );

	return value.length === 2 ? vec2( ...value ) : vec3( ...value );

}

/**
 * Small registry of composite "output types" beyond a bare scalar or
 * fixed-size vector, keyed by a channel descriptor's optional `type` field
 * (see NTCFormat.CHANNELS). A channel that doesn't need this omits `type`.
 *
 * `normal`: both `normal` and `clearcoatNormal` train a 2-component
 * tangent-space (dx, dy) offset but are *consumed* as a fully
 * TBN-reconstructed 3-component view-space vector - see
 * `reconstructFinalNormal` above.
 */
const OUTPUT_TYPES = {
	normal: {
		reconstruct: reconstructFinalNormal,
		previewSize: 3
	}
};

/**
 * Resolves a channel descriptor's *effective* type label - its explicit
 * `type` if it set one, otherwise a generic size-based default ('float',
 * 'float2', 'float3').
 */
function channelEffectiveType( channel ) {

	if ( channel.type ) return channel.type;

	return channel.size === 1 ? 'float' : `float${channel.size}`;

}

export { reconstructFinalNormal, constantToNode, OUTPUT_TYPES, channelEffectiveType };
