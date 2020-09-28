import InputNode from '../core/InputNode.js';

class Vector3Node extends InputNode {

	constructor( value ) {

		super( 'v3' );

		this.value = value

	}

	generateConst( builder ) {

		return builder.generateVec3( this.value.x, this.value.y, this.value.z );

	}

}

export default Vector3Node;
