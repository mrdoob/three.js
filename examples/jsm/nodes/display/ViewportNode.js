import Node from '../core/Node.js';
import { uniform, div, vec2, invert } from '../shadernode/ShaderNodeBaseElements.js';
import { Vector2 } from 'three';
import { NodeUpdateType } from '../core/constants.js';

let resolution;

class ViewportNode extends Node {

	static COORDINATE = 'coordinate';
	static RESOLUTION = 'resolution';
	static TOP_LEFT = 'topLeft';
	static BOTTOM_LEFT = 'bottomLeft';
	static TOP_RIGHT = 'topRight';
	static BOTTOM_RIGHT = 'bottomRight';

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		return this.scope === ViewportNode.COORDINATE ? 'vec4' : 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ViewportNode.RESOLUTION ) {

			updateType = NodeUpdateType.FRAME;

		}

		this.updateType = updateType;

		return updateType;

	}

	update( { renderer } ) {

		renderer.getSize( resolution );

	}

	construct( builder ) {

		const scope = this.scope;

		if ( scope === ViewportNode.COORDINATE ) return;

		let output = null;

		if ( scope === ViewportNode.RESOLUTION ) {

			resolution ||= new Vector2();

			output = uniform( resolution );

		} else {

			const coordinateNode = vec2( new ViewportNode( ViewportNode.COORDINATE ) );
			const resolutionNode = new ViewportNode( ViewportNode.RESOLUTION );

			output = div( coordinateNode, resolutionNode );

			let outX = output.x;
			let outY = output.y;

			if ( /top/i.test( scope ) && builder.isFlipY() ) outY = invert( outY );
			else if ( /bottom/i.test( scope ) && builder.isFlipY() === false ) outY = invert( outY );

			if ( /right/i.test( scope ) ) outX = invert( outX );

			output = vec2( outX, outY );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ViewportNode.COORDINATE ) {

			return builder.getFragCoord();

		}

		return super.generate( builder );

	}

}

export default ViewportNode;
