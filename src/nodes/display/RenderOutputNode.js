import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

import { LinearSRGBColorSpace, SRGBColorSpace, NoToneMapping } from '../../constants.js';

class RenderOutputNode extends TempNode {

	constructor( colorNode, toneMapping, outputColorSpace ) {

		super( 'vec4' );

		this.colorNode = colorNode;
		this.toneMapping = toneMapping;
		this.outputColorSpace = outputColorSpace;

		this.isRenderOutput = true;

	}

	setup( { context } ) {

		let outputNode = this.colorNode || context.color;

		// tone mapping

		const toneMapping = ( this.toneMapping !== null ? this.toneMapping : context.toneMapping ) || NoToneMapping;
		const outputColorSpace = ( this.outputColorSpace !== null ? this.outputColorSpace : context.outputColorSpace ) || LinearSRGBColorSpace;

		if ( toneMapping !== NoToneMapping ) {

			outputNode = outputNode.toneMapping( toneMapping );

		}

		// output color space

		if ( outputColorSpace === SRGBColorSpace ) {

			outputNode = outputNode.toOutputColorSpace( outputColorSpace );

		}

		return outputNode;

	}

}

export default RenderOutputNode;

RenderOutputNode.type = /*@__PURE__*/ registerNode( 'RenderOutput', RenderOutputNode );

export const renderOutput = ( color, toneMapping = null, outputColorSpace = null ) => nodeObject( new RenderOutputNode( nodeObject( color ), toneMapping, outputColorSpace ) );

addMethodChaining( 'renderOutput', renderOutput );
