import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject, vec4 } from '../tsl/TSLCore.js';
import { rendererReference } from '../accessors/RendererReferenceNode.js';

import { NoToneMapping } from '../../constants.js';
import { hash } from '../core/NodeUtils.js';

class ToneMappingNode extends TempNode {

	static get type() {

		return 'ToneMappingNode';

	}

	constructor( toneMapping, exposureNode = toneMappingExposure, colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	getCacheKey() {

		return hash( super.getCacheKey(), this.toneMapping );

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		let outputNode = null;

		const toneMappingFn = builder.renderer.library.getToneMappingFunction( toneMapping );

		if ( toneMappingFn !== null ) {

			outputNode = vec4( toneMappingFn( colorNode.rgb, this.exposureNode ), colorNode.a );

		} else {

			console.error( 'ToneMappingNode: Unsupported Tone Mapping configuration.', toneMapping );

			outputNode = colorNode;

		}

		return outputNode;

	}

}

export default ToneMappingNode;

export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );
export const toneMappingExposure = /*@__PURE__*/ rendererReference( 'toneMappingExposure', 'float' );

addMethodChaining( 'toneMapping', ( color, mapping, exposure ) => toneMapping( mapping, exposure, color ) );
