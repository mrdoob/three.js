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

	constructor( colorSpace, colorNode ) {

		super( 'vec4' );

		this.colorSpace = colorSpace;
		this.colorNode = colorNode;

	}

	setup( builder ) {

		const { colorSpace, colorNode } = this;

		if ( colorSpace === ColorSpaceNode.LINEAR_TO_LINEAR ) {

			return colorNode;

		}

		let outputNode = null;

		const colorSpaceFn = builder.renderer.nodes.library.getColorSpaceFunction( colorSpace );

		if ( colorSpaceFn !== null ) {

			outputNode = vec4( colorSpaceFn( colorNode.rgb ), colorNode.a );

		} else {

			console.error( 'ColorSpaceNode: Unsupported Color Space configuration.', colorSpace );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

ColorSpaceNode.LINEAR_TO_LINEAR = 'LinearToLinear';

export default ColorSpaceNode;

export const linearToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( getColorSpaceMethod( LinearSRGBColorSpace, colorSpace ), nodeObject( node ) ) );
export const colorSpaceToLinear = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( getColorSpaceMethod( colorSpace, LinearSRGBColorSpace ), nodeObject( node ) ) );

addMethodChaining( 'linearToColorSpace', linearToColorSpace );
addMethodChaining( 'colorSpaceToLinear', colorSpaceToLinear );
