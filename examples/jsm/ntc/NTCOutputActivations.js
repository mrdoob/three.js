import { exp, float, log, max, tanh } from 'three/tsl';

/**
 * Per-channel output nonlinearities for a decoder whose MLP itself always
 * ends in a plain linear layer. Applied as a post-processing step on the
 * raw per-channel output `z` (see NTCFormat.js's per-channel `activation`
 * metadata and NTCMLPNode.js's `sliceChannels`).
 *
 * 'linear' (the default) is intentionally not handled by name below - a
 * channel that never names one of the activations below gets plain linear
 * behavior "for free".
 */

/**
 * Plain logistic sigmoid, `1 / (1 + e^-x)`.
 */
function sigmoidTSL( xNode ) {

	return float( 1 ).div( float( 1 ).add( exp( xNode.negate() ) ) );

}

/**
 * z -> a, the forward nonlinearity.
 */
function applyChannelActivation( zNode, activation ) {

	if ( activation === 'sigmoid' ) return sigmoidTSL( zNode );
	if ( activation === 'tanh' ) return tanh( zNode );

	// Numerically stable softplus: log(1+e^z) computed as
	// max(z,0) + log(1+e^-|z|), which never overflows exp() for large |z|.
	if ( activation === 'softplus' ) return max( zNode, float( 0 ) ).add( log( exp( zNode.abs().negate() ).add( 1 ) ) );

	return zNode;

}

export { sigmoidTSL, applyChannelActivation };
