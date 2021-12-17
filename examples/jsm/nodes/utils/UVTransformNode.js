import { ExpressionNode } from '../core/ExpressionNode.js';
import { Matrix3Node } from '../inputs/Matrix3Node.js';
import { UVNode } from '../accessors/UVNode.js';

class UVTransformNode extends ExpressionNode {

	constructor( uv, position ) {

		super( '( uvTransform * vec3( uvNode, 1 ) ).xy', 'vec2' );

		this.uv = uv || new UVNode();
		this.position = position || new Matrix3Node();

	}

	generate( builder, output ) {

		this.keywords[ 'uvNode' ] = this.uv;
		this.keywords[ 'uvTransform' ] = this.position;

		return super.generate( builder, output );

	}

	setUvTransform( tx, ty, sx, sy, rotation, cx, cy ) {

		cx = cx !== undefined ? cx : .5;
		cy = cy !== undefined ? cy : .5;

		this.position.value.setUvTransform( tx, ty, sx, sy, rotation, cx, cy );

	}

	copy( source ) {

		super.copy( source );

		this.uv = source.uv;
		this.position = source.position;

		return this;

	}

	toJSON( meta ) {

		var data = this.getJSONNode( meta );

		if ( ! data ) {

			data = this.createJSONNode( meta );

			data.uv = this.uv.toJSON( meta ).uuid;
			data.position = this.position.toJSON( meta ).uuid;

		}

		return data;

	}

}

UVTransformNode.prototype.nodeType = 'UVTransform';

export { UVTransformNode };
