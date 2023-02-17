import TempNode from '../core/TempNode.js';
import { dot, mix } from '../math/MathNode.js';
import { add } from '../math/OperatorNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, ShaderNode, nodeProxy, float, vec3, mat3 } from '../shadernode/ShaderNode.js';

const saturationNode = new ShaderNode( ( { color, adjustment } ) => {

	return luminance( color ).mix( color, adjustment );

} );

const vibranceNode = new ShaderNode( ( { color, adjustment } ) => {

	const average = add( color.r, color.g, color.b ).div( 3.0 );

	const mx = color.r.max( color.g.max( color.b ) );
	const amt = mx.sub( average ).mul( adjustment ).mul( - 3.0 );

	return mix( color, mx, amt );

} );

const hueNode = new ShaderNode( ( { color, adjustment } ) => {

	const RGBtoYIQ = mat3( 0.299, 0.587, 0.114, 0.595716, - 0.274453, - 0.321263, 0.211456, - 0.522591, 0.311135 );
	const YIQtoRGB = mat3( 1.0, 0.9563, 0.6210, 1.0, - 0.2721, - 0.6474, 1.0, - 1.107, 1.7046 );

	const yiq = RGBtoYIQ.mul( color );

	const hue = yiq.z.atan2( yiq.y ).add( adjustment );
	const chroma = yiq.yz.length();

	return YIQtoRGB.mul( vec3( yiq.x, chroma.mul( hue.cos() ), chroma.mul( hue.sin() ) ) );

} );

class ColorAdjustmentNode extends TempNode {

	constructor( method, colorNode, adjustmentNode = float( 1 ) ) {

		super( 'vec3' );

		this.method = method;

		this.colorNode = colorNode;
		this.adjustmentNode = adjustmentNode;

	}

	construct() {

		const { method, colorNode, adjustmentNode } = this;

		const callParams = { color: colorNode, adjustment: adjustmentNode };

		let outputNode = null;

		if ( method === ColorAdjustmentNode.SATURATION ) {

			outputNode = saturationNode.call( callParams );

		} else if ( method === ColorAdjustmentNode.VIBRANCE ) {

			outputNode = vibranceNode.call( callParams );

		} else if ( method === ColorAdjustmentNode.HUE ) {

			outputNode = hueNode.call( callParams );

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

addNodeClass( ColorAdjustmentNode );
