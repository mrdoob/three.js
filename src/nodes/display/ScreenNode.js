import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Fn, nodeImmutable, vec2 } from '../tsl/TSLBase.js';

import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

/** @module ScreenNode **/

let screenSizeVec, viewportVec;

/**
 * This node provides a collection of screen related metrics.
 * Depending on {@link module:ScreenNode~ScreenNode#scope}, the nodes can represent
 * resolution or viewport data as well as fragment or uv coordinates.
 *
 * @augments Node
 */
class ScreenNode extends Node {

	static get type() {

		return 'ScreenNode';

	}

	/**
	 * Constructs a new screen node.
	 *
	 * @param {('coordinate'|'viewport'|'size'|'uv')} scope - The node's scope.
	 */
	constructor( scope ) {

		super();

		/**
		 * The node represents different metric depending on which scope is selected.
		 *
		 * - `ScreenNode.COORDINATE`: Window-relative coordinates of the current fragment according to WebGPU standards.
		 * - `ScreenNode.VIEWPORT`: The current viewport defined as a four-dimensional vector.
		 * - `ScreenNode.SIZE`: The dimensions of the current bound framebuffer.
		 * - `ScreenNode.UV`: Normalized coordinates.
		 *
		 * @type {('coordinate'|'viewport'|'size'|'uv')}
		 */
		this.scope = scope;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isViewportNode = true;

	}

	/**
	 * This method is overwritten since the node type depends on the selected scope.
	 *
	 * @return {('vec2'|'vec4')} The node type.
	 */
	getNodeType() {

		if ( this.scope === ScreenNode.VIEWPORT ) return 'vec4';
		else return 'vec2';

	}

	/**
	 * This method is overwritten since the node's update type depends on the selected scope.
	 *
	 * @return {NodeUpdateType} The update type.
	 */
	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ScreenNode.SIZE || this.scope === ScreenNode.VIEWPORT ) {

			updateType = NodeUpdateType.RENDER;

		}

		this.updateType = updateType;

		return updateType;

	}

	/**
	 * `ScreenNode` implements {@link Node#update} to retrieve viewport and size information
	 * from the current renderer.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( { renderer } ) {

		const renderTarget = renderer.getRenderTarget();

		if ( this.scope === ScreenNode.VIEWPORT ) {

			if ( renderTarget !== null ) {

				viewportVec.copy( renderTarget.viewport );

			} else {

				renderer.getViewport( viewportVec );

				viewportVec.multiplyScalar( renderer.getPixelRatio() );

			}

		} else {

			if ( renderTarget !== null ) {

				screenSizeVec.width = renderTarget.width;
				screenSizeVec.height = renderTarget.height;

			} else {

				renderer.getDrawingBufferSize( screenSizeVec );

			}

		}

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let output = null;

		if ( scope === ScreenNode.SIZE ) {

			output = uniform( screenSizeVec || ( screenSizeVec = new Vector2() ) );

		} else if ( scope === ScreenNode.VIEWPORT ) {

			output = uniform( viewportVec || ( viewportVec = new Vector4() ) );

		} else {

			output = vec2( screenCoordinate.div( screenSize ) );

		}

		return output;

	}

	generate( builder ) {

		if ( this.scope === ScreenNode.COORDINATE ) {

			let coord = builder.getFragCoord();

			if ( builder.isFlipY() ) {

				// follow webgpu standards

				const size = builder.getNodeProperties( screenSize ).outputNode.build( builder );

				coord = `${ builder.getType( 'vec2' ) }( ${ coord }.x, ${ size }.y - ${ coord }.y )`;

			}

			return coord;

		}

		return super.generate( builder );

	}

}

ScreenNode.COORDINATE = 'coordinate';
ScreenNode.VIEWPORT = 'viewport';
ScreenNode.SIZE = 'size';
ScreenNode.UV = 'uv';

export default ScreenNode;

// Screen

/**
 * TSL object that represents normalized screen coordinates, unitless in `[0, 1]`.
 *
 * @type {ScreenNode<vec2>}
 */
export const screenUV = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.UV );

/**
 * TSL object that represents the screen resolution in physical pixel units.
 *
 * @type {ScreenNode<vec2>}
 */
export const screenSize = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.SIZE );

/**
 * TSL object that represents the current `x`/`y` pixel position on the screen in physical pixel units.
 *
 * @type {ScreenNode<vec2>}
 */
export const screenCoordinate = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.COORDINATE );

// Viewport

/**
 * TSL object that represents the viewport rectangle as `x`, `y`, `width` and `height` in physical pixel units.
 *
 * @type {ScreenNode<vec4>}
 */
export const viewport = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.VIEWPORT );

/**
 * TSL object that represents the viewport resolution in physical pixel units.
 *
 * @type {ScreenNode<vec2>}
 */
export const viewportSize = viewport.zw;

/**
 * TSL object that represents the current `x`/`y` pixel position on the viewport in physical pixel units.
 *
 * @type {ScreenNode<vec2>}
 */
export const viewportCoordinate = /*@__PURE__*/ screenCoordinate.sub( viewport.xy );

/**
 * TSL object that represents normalized viewport coordinates, unitless in `[0, 1]`.
 *
 * @type {ScreenNode<vec2>}
 */
export const viewportUV = /*@__PURE__*/ viewportCoordinate.div( viewportSize );

// Deprecated

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
