import AttributeNode from '../core/AttributeNode.js';

class UVNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec2' );

		this.index = index;

	}

	getAttributeName( /*builder*/ ) {

		return 'uv' + ( this.index > 0 ? this.index + 1 : '' );

	}

}

export default UVNode;
