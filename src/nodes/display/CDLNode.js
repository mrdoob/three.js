import TempNode from '../core/TempNode.js';
import { Fn, nodeObject, vec3, vec4 } from '../tsl/TSLBase.js';
import { max } from '../math/MathNode.js';
import { LinearSRGBColorSpace } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';
import { Vector3 } from '../../math/Vector3.js';

/**
 * Color Decision List (CDL) v1.2
 *
 * References:
 * - ASC CDL v1.2
 * - https://blender.stackexchange.com/a/55239/43930
 * - https://docs.acescentral.com/specifications/acescc/
 */
class CDLNode extends TempNode {

	static get type() {

		return 'CDLNode';

	}

	constructor( inputNode, slopeNode = vec3( 1 ), offsetNode = vec3( 0 ), powerNode = vec3( 1 ), saturationNode = vec3( 1 ) ) {

		super();

		this.inputNode = inputNode;
		this.slopeNode = slopeNode;
		this.offsetNode = offsetNode;
		this.powerNode = powerNode;
		this.saturationNode = saturationNode;

		// ASC CDL v1.2 explicitly requires Rec. 709 luminance coefficients, without input conversion to Rec. 709.
		this.luminanceCoefficients = ColorManagement.getLuminanceCoefficients( new Vector3(), LinearSRGBColorSpace );

	}

	setup() {

		const { inputNode, slopeNode, offsetNode, powerNode, saturationNode, luminanceCoefficients } = this;

		const cdl = Fn( () => {

			// NOTE: The ASC CDL v1.2 defines a [0, 1] clamp on slope+offset output,
			// and another on saturation output. As discussed in ACEScc specification
			// notes on CDL application, the limits may be omitted to support values >1
			// if negative inputs to the power expression are avoided.
			//
			// We use `max( in, 0.0 )` for this reason, but the lower limit may not be
			// required in all cases.

			const luma = inputNode.rgb.dot( vec3( luminanceCoefficients ) );

			// clamp( ( in * slope ) + offset ) ^ power
			const output = max( inputNode.rgb.mul( slopeNode ).add( offsetNode ), 0.0 ).pow( powerNode ).toVar();

			// clamp( luma + sat * ( in - luma ) )
			output.assign( max( luma.add( saturationNode.mul( output.sub( luma ) ) ), 0.0 ) );

			return vec4( output.rgb, inputNode.a );

		} );

		const outputNode = cdl();

		return outputNode;

	}

}

export default CDLNode;

export const cdl = ( node, slope = vec3( 1 ), offset = vec3( 0 ), power = vec3( 1 ), saturation = vec3( 1 ) ) => nodeObject(
	new CDLNode(
		nodeObject( node ),
		nodeObject( slope ),
		nodeObject( offset ),
		nodeObject( power ),
		nodeObject( saturation )
	)
);
