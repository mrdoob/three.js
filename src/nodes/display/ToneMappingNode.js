import { registerNode } from '../core/Node.js';
import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeObject, vec4 } from '../tsl/TSLCore.js';
import { rendererReference } from '../accessors/RendererReferenceNode.js';

import { NoToneMapping } from '../../constants.js';

class ToneMappingNode extends TempNode {

	constructor( toneMapping, exposureNode = toneMappingExposure, colorNode = null ) {

		super( 'vec3' );

		this.toneMapping = toneMapping;

		this.exposureNode = exposureNode;
		this.colorNode = colorNode;

	}

	getCacheKey() {

		let cacheKey = super.getCacheKey();
		cacheKey = '{toneMapping:' + this.toneMapping + ',nodes:' + cacheKey + '}';

		return cacheKey;

	}

	setup( builder ) {

		const colorNode = this.colorNode || builder.context.color;
		const toneMapping = this.toneMapping;

		if ( toneMapping === NoToneMapping ) return colorNode;

		let outputNode = null;

		const toneMappingFn = builder.renderer.nodes.library.getToneMappingFunction( toneMapping );

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

ToneMappingNode.type = /*@__PURE__*/ registerNode( 'ToneMapping', ToneMappingNode );

export const toneMapping = ( mapping, exposure, color ) => nodeObject( new ToneMappingNode( mapping, nodeObject( exposure ), nodeObject( color ) ) );
export const toneMappingExposure = /*@__PURE__*/ rendererReference( 'toneMappingExposure', 'float' );

addMethodChaining( 'toneMapping', ( color, mapping, exposure ) => toneMapping( mapping, exposure, color ) );
