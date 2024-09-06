import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Fn, nodeImmutable, vec2 } from '../tsl/TSLBase.js';

import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

let resolution, viewportResult;

class ViewportNode extends Node {

	static get type() {

		return 'ViewportNode';

	}

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		if ( this.scope === ViewportNode.VIEWPORT ) return 'vec4';
		else return 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ViewportNode.SIZE || this.scope === ViewportNode.VIEWPORT ) {

			updateType = NodeUpdateType.RENDER;

		}

		this.updateType = updateType;

		return updateType;

	}

	update( { renderer } ) {

		if ( this.scope === ViewportNode.VIEWPORT ) {

			renderer.getViewport( viewportResult );

		} else {

			const renderTarget = renderer.getRenderTarget();

			if ( renderTarget !== null ) {

				resolution.width = renderTarget.width;
				resolution.height = renderTarget.height;

			} else {

				renderer.getDrawingBufferSize( resolution );

			}

		}

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let output = null;

		if ( scope === ViewportNode.SIZE ) {

			output = uniform( resolution || ( resolution = new Vector2() ) );

		} else if ( scope === ViewportNode.VIEWPORT ) {

			output = uniform( viewportResult || ( viewportResult = new Vector4() ) );

		} else {

			output = vec2( screenCoordinate.div( screenSize ) );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ViewportNode.COORDINATE ) {

			let coord = builder.getFragCoord();

			if ( builder.isFlipY() ) {

				// follow webgpu standards

				const resolution = builder.getNodeProperties( screenSize ).outputNode.build( builder );

				coord = `${ builder.getType( 'vec2' ) }( ${ coord }.x, ${ resolution }.y - ${ coord }.y )`;

			}

			return coord;

		}

		return super.generate( builder );

	}

}

ViewportNode.COORDINATE = 'coordinate';
ViewportNode.VIEWPORT = 'viewport';
ViewportNode.SIZE = 'resolution';
ViewportNode.UV = 'uv';

export default ViewportNode;

export const screenUV = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.UV );
export const screenSize = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.SIZE );
export const screenCoordinate = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.COORDINATE );

export const viewport = /*@__PURE__*/ nodeImmutable( ViewportNode, ViewportNode.VIEWPORT );

export const viewportResolution = /*@__PURE__*/ ( Fn( () => { // @deprecated, r169

	console.warn( 'TSL.ViewportNode: "viewportResolution" is deprecated. Use "screenSize" instead.' );

	return screenSize;

}, 'vec2' ).once() )();

export const viewportTopLeft = /*@__PURE__*/ ( Fn( () => { // @deprecated, r168

	console.warn( 'TSL.ViewportNode: "viewportTopLeft" is deprecated. Use "screenUV" instead.' );

	return screenUV;

}, 'vec2' ).once() )();

export const viewportBottomLeft = /*@__PURE__*/ ( Fn( () => { // @deprecated, r168

	console.warn( 'TSL.ViewportNode: "viewportBottomLeft" is deprecated. Use "screenUV.flipY()" instead.' );

	return screenUV.flipY();

}, 'vec2' ).once() )();
