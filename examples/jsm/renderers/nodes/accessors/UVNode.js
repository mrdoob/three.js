import AttributeNode from '../core/AttributeNode.js';

class UVNode extends AttributeNode {

	constructor( index = 0 ) {

		super( null, 'vec2' );

		this.index = index;

		Object.defineProperty( this, 'isUVNode', { value: true } );

	}

	getAttributeName( /*builder*/ ) {

		return 'uv' + ( this.index > 0 ? this.index + 1 : '' );

	}

}

export default UVNode;
