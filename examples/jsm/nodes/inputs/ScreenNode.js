/**
 * @author sunag / http://www.sunag.com.br/
 */

import { InputNode } from '../core/InputNode.js';
import { TextureNode } from './TextureNode.js';

export class ScreenNode extends TextureNode {

	constructor( uv ) {

		super( undefined, uv );

		this.nodeType = "Screen";

	}

	getUnique() {

		return true;

	}

	getTexture( builder, output ) {

		return super.generate( builder, output, this.getUuid(), 't', 'renderTexture' );

	}

}
