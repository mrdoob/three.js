import AttributeNode from '../core/AttributeNode.js';

class UVNode extends AttributeNode {

	constructor( value = 0 ) {

		super( null, 'vec2' );

		this.value = value;

	}

	getAttributeName( /*builder*/ ) {

		const value = this.value;

		return 'uv' + ( value > 0 ? value + 1 : '' );

	}

}

UVNode.prototype.isUVNode = true;

export default UVNode;
