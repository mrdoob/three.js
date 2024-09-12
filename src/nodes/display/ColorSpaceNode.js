import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject, vec4 } from '../tsl/TSLCore.js';

import { LinearSRGBColorSpace, SRGBColorSpace } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';

const WORKING_COLOR_SPACE = 'WorkingColorSpace';
const OUTPUT_COLOR_SPACE = 'OutputColorSpace';

function getColorSpaceName( colorSpace ) {

	let method = null;

	if ( colorSpace === LinearSRGBColorSpace ) {

		method = 'Linear';

	} else if ( colorSpace === SRGBColorSpace ) {

		method = 'sRGB';

	}

	return method;

}

export function getColorSpaceMethod( source, target ) {

	return getColorSpaceName( source ) + 'To' + getColorSpaceName( target );

}

class ColorSpaceNode extends TempNode {

	static get type() {

		return 'ColorSpaceNode';

	}

	constructor( colorNode, source, target ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.source = source;
		this.target = target;

	}

	getColorSpace( builder, colorSpace ) {

		if ( colorSpace === WORKING_COLOR_SPACE ) {

			return ColorManagement.workingColorSpace;

		} else if ( colorSpace === OUTPUT_COLOR_SPACE ) {

			return builder.context.outputColorSpace || builder.renderer.outputColorSpace;

		}

		return colorSpace;

	}

	setup( builder ) {

		const { renderer } = builder;
		const { colorNode } = this;

		const source = this.getColorSpace( builder, this.source );
		const target = this.getColorSpace( builder, this.target );

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

export const toOutputColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, OUTPUT_COLOR_SPACE ) );
export const toWorkingColorSpace = ( node ) => nodeObject( new ColorSpaceNode( nodeObject( node ), OUTPUT_COLOR_SPACE, WORKING_COLOR_SPACE ) );

export const workingToColorSpace = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), WORKING_COLOR_SPACE, colorSpace ) );
export const colorSpaceToWorking = ( node, colorSpace ) => nodeObject( new ColorSpaceNode( nodeObject( node ), colorSpace, WORKING_COLOR_SPACE ) );

addMethodChaining( 'toOutputColorSpace', toOutputColorSpace );
addMethodChaining( 'toWorkingColorSpace', toWorkingColorSpace );

addMethodChaining( 'workingToColorSpace', workingToColorSpace );
addMethodChaining( 'colorSpaceToWorking', colorSpaceToWorking );
