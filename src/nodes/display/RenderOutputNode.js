import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject } from '../tsl/TSLCore.js';

import { NoColorSpace, NoToneMapping } from '../../constants.js';
import { ColorManagement } from '../../math/ColorManagement.js';

class RenderOutputNode extends TempNode {

	static get type() {

		return 'RenderOutputNode';

	}

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
		const outputColorSpace = ( this.outputColorSpace !== null ? this.outputColorSpace : context.outputColorSpace ) || NoColorSpace;

		if ( toneMapping !== NoToneMapping ) {

			outputNode = outputNode.toneMapping( toneMapping );

		}

		// working to output color space

		if ( outputColorSpace !== NoColorSpace && outputColorSpace !== ColorManagement.workingColorSpace ) {

			outputNode = outputNode.workingToColorSpace( outputColorSpace );

		}

		return outputNode;

	}

}

export default RenderOutputNode;

export const renderOutput = ( color, toneMapping = null, outputColorSpace = null ) => nodeObject( new RenderOutputNode( nodeObject( color ), toneMapping, outputColorSpace ) );

addMethodChaining( 'renderOutput', renderOutput );
