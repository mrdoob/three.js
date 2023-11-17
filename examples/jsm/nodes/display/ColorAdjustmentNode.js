import TempNode from '../core/TempNode.js';
import { dot, mix } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, tslFn, nodeProxy, float, vec3 } from '../shadernode/ShaderNode.js';

const saturationNode = tslFn( ( { color, adjustment } ) => {

	return adjustment.mix( luminance( color ), color );

} );

const vibranceNode = tslFn( ( { color, adjustment } ) => {

	const average = add( color.r, color.g, color.b ).div( 3.0 );

	const mx = color.r.max( color.g.max( color.b ) );
	const amt = mx.sub( average ).mul( adjustment ).mul( - 3.0 );

	return mix( color, mx, amt );

} );

const hueNode = tslFn( ( { color, adjustment } ) => {

	const k = vec3( 0.57735, 0.57735, 0.57735 );

	const cosAngle = adjustment.cos();

	return vec3( color.rgb.mul( cosAngle ).add( k.cross( color.rgb ).mul( adjustment.sin() ).add( k.mul( dot( k, color.rgb ).mul( cosAngle.oneMinus() ) ) ) ) );

} );

class ColorAdjustmentNode extends TempNode {

	constructor( method, colorNode, adjustmentNode = float( 1 ) ) {

		super( 'vec3' );

		this.method = method;

		this.colorNode = colorNode;
		this.adjustmentNode = adjustmentNode;

	}

	setup() {

		const { method, colorNode, adjustmentNode } = this;

		const callParams = { color: colorNode, adjustment: adjustmentNode };

		let outputNode = null;

		if ( method === ColorAdjustmentNode.SATURATION ) {

			outputNode = saturationNode( callParams );

		} else if ( method === ColorAdjustmentNode.VIBRANCE ) {

			outputNode = vibranceNode( callParams );

		} else if ( method === ColorAdjustmentNode.HUE ) {

			outputNode = hueNode( callParams );

		} else {

			console.error( `${ this.type }: Method "${ this.method }" not supported!` );

		}

		return outputNode;

	}

}

ColorAdjustmentNode.SATURATION = 'saturation';
ColorAdjustmentNode.VIBRANCE = 'vibrance';
ColorAdjustmentNode.HUE = 'hue';

export default ColorAdjustmentNode;

export const saturation = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.SATURATION );
export const vibrance = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.VIBRANCE );
export const hue = nodeProxy( ColorAdjustmentNode, ColorAdjustmentNode.HUE );

export const lumaCoeffs = vec3( 0.2125, 0.7154, 0.0721 );
export const luminance = ( color, luma = lumaCoeffs ) => dot( color, luma );

addNodeElement( 'saturation', saturation );
addNodeElement( 'vibrance', vibrance );
addNodeElement( 'hue', hue );

addNodeClass( 'ColorAdjustmentNode', ColorAdjustmentNode );
