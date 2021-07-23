import { InputNode } from '../core/InputNode.js';
import { TextureNode } from './TextureNode.js';

class ScreenNode extends TextureNode {

	constructor( uv ) {

		super( undefined, uv );

	}

	getUnique() {

		return true;

	}

	getTexture( builder, output ) {

		return InputNode.prototype.generate.call( this, builder, output, this.getUuid(), 't', 'renderTexture' );

	}

}

ScreenNode.prototype.nodeType = 'Screen';

export { ScreenNode };
