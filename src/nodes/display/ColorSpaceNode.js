import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject, vec4 } from '../tsl/TSLCore.js';

import { LinearSRGBColorSpace, SRGBColorSpace } from '../../constants.js';

const getColorSpaceName = ( colorSpace ) => {

	let method = null;

	if ( colorSpace === LinearSRGBColorSpace ) {

		method = 'Linear';

	} else if ( colorSpace === SRGBColorSpace ) {

		method = 'sRGB';

	}

	return method;

};

export const getColorSpaceMethod = ( source, target ) => {

	return getColorSpaceName( source ) + 'To' + getColorSpaceName( target );

};

class ColorSpaceNode extends TempNode {

	constructor( colorNode, target = null, source = null ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.target = target;
		this.source = source;

	}

	setup( builder ) {

		const { renderer, context } = builder;

		const source = this.source || context.outputColorSpace || renderer.outputColorSpace;
		const target = this.target || context.outputColorSpace || renderer.outputColorSpace;
		const colorNode = this.colorNode;

		if ( source === target ) return colorNode;

		const colorSpace = getColorSpaceMethod( source, target );

		let outputNode = null;

		const colorSpaceFn = renderer.nodes.library.getColorSpaceFunction( colorSpace );

		if ( colorSpaceFn !== null ) {

			outputNode = vec4( colorSpaceFn( colorNode.rgb ), colorNode.a );

		} else {

			console.error( 'ColorSpaceNode: Unsupported Color Space configuration.', colorSpace );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

export default ColorSpaceNode;

ColorSpaceNode.type = /*@__PURE__*/ registerNode( 'ColorSpace', ColorSpaceNode );

export const toOutputColorSpace = ( node, colorSpace = null ) => nodeObject( new ColorSpaceNode( nodeObject( node ), colorSpace, LinearSRGBColorSpace ) );
export const toWorkingColorSpace = ( node, colorSpace = null ) => nodeObject( new ColorSpaceNode( nodeObject( node ), LinearSRGBColorSpace, colorSpace ) );

addMethodChaining( 'toOutputColorSpace', toOutputColorSpace );
addMethodChaining( 'toWorkingColorSpace', toWorkingColorSpace );
