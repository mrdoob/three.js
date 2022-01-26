import AttributeNode from '../core/AttributeNode.js';

class UVNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec2' );

		this.index = index;

	}

	getAttributeName( /*builder*/ ) {

		const index = this.index;

		return 'uv' + ( index > 0 ? index + 1 : '' );

	}

}

UVNode.prototype.isUVNode = true;

export default UVNode;
