import Node, { addNodeClass } from '../core/Node.js';
import { uv } from '../accessors/UVNode.js';
import { nodeProxy, float, vec2 } from '../shadernode/ShaderNode.js';

class SpriteSheetUVNode extends Node {

	constructor( countNode, uvNode = uv(), frameNode = float( 0 ) ) {

		super( 'vec2' );

		this.countNode = countNode;
		this.uvNode = uvNode;
		this.frameNode = frameNode;

	}

	construct() {

		const { frameNode, uvNode, countNode } = this;

		const { width, height } = countNode;

		const frameNum = frameNode.mod( width.mul( height ) ).floor();

		const column = frameNum.mod( width );
		const row = height.sub( frameNum.add( 1 ).div( width ).ceil() );

		const scale = countNode.reciprocal();
		const uvFrameOffset = vec2( column, row );

		return uvNode.add( uvFrameOffset ).mul( scale );

	}

}

export default SpriteSheetUVNode;

export const spritesheetUV = nodeProxy( SpriteSheetUVNode );

addNodeClass( SpriteSheetUVNode );
