import TempNode from '../core/TempNode.js';
import { addNodeClass } from '../core/Node.js';
import { addNodeElement, nodeObject } from '../shadernode/ShaderNode.js';

import { SRGBColorSpace, NoToneMapping } from '../../constants.js';

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

		const toneMapping = this.toneMapping !== null ? this.toneMapping : context.toneMapping;
		const outputColorSpace = this.outputColorSpace !== null ? this.outputColorSpace : context.outputColorSpace;

		if ( toneMapping !== NoToneMapping ) {

			outputNode = outputNode.toneMapping( toneMapping );

		}

		// output color space

		if ( outputColorSpace === SRGBColorSpace ) {

			outputNode = outputNode.linearToColorSpace( outputColorSpace );

		}

		return outputNode;

	}

}

export default RenderOutputNode;

export const renderOutput = ( color, toneMapping = null, outputColorSpace = null ) => nodeObject( new RenderOutputNode( nodeObject( color ), toneMapping, outputColorSpace ) );

addNodeElement( 'renderOutput', renderOutput );

addNodeClass( 'RenderOutputNode', RenderOutputNode );
