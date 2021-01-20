import AttributeNode from '../core/AttributeNode.js';

class UVNode extends AttributeNode {

	constructor( index = 0 ) {

		super( 'vec2' );

		this.index = index;

	}

	getIndexProperty( prefix ) {

		return prefix + ( this.index > 0 ? this.index + 1 : '' );

	}

	getAttributeName( /*builder*/ ) {

		return this.getIndexProperty( 'uv' );

	}

	getAttributeProperty( builder ) {

		// customize 'uv' property
		const property = this.getIndexProperty( 'vUv' );

		this.setAttributeProperty( property );

		return super.getAttributeProperty( builder );

	}

}

export default UVNode;
