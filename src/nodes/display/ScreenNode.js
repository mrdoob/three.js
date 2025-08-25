import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Fn, nodeImmutable, vec2 } from '../tsl/TSLBase.js';

import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

let _screenSizeVec, _viewportVec;

/**
 * This node provides a collection of screen related metrics.
 * Depending on {@link ScreenNode#scope}, the nodes can represent
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
	 * @param {('coordinate'|'viewport'|'size'|'uv'|'dpr')} scope - The node's scope.
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
		 * - `ScreenNode.DPR`: Device pixel ratio.
		 *
		 * @type {('coordinate'|'viewport'|'size'|'uv'|'dpr')}
		 */
		this.scope = scope;

		/**
		 * This output node.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this._output = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isViewportNode = true;

	}

	/**
	 * This method is overwritten since the node type depends on the selected scope.
	 *
	 * @return {('float'|'vec2'|'vec4')} The node type.
	 */
	getNodeType() {

		if ( this.scope === ScreenNode.DPR ) return 'float';
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

		if ( this.scope === ScreenNode.SIZE || this.scope === ScreenNode.VIEWPORT || this.scope === ScreenNode.DPR ) {

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

				_viewportVec.copy( renderTarget.viewport );

			} else {

				renderer.getViewport( _viewportVec );

				_viewportVec.multiplyScalar( renderer.getPixelRatio() );

			}

		} else if ( this.scope === ScreenNode.DPR ) {

			this._output.value = renderer.getPixelRatio();

		} else {

			if ( renderTarget !== null ) {

				_screenSizeVec.width = renderTarget.width;
				_screenSizeVec.height = renderTarget.height;

			} else {

				renderer.getDrawingBufferSize( _screenSizeVec );

			}

		}

	}

	setup( /*builder*/ ) {

		const scope = this.scope;

		let output = null;

		if ( scope === ScreenNode.SIZE ) {

			output = uniform( _screenSizeVec || ( _screenSizeVec = new Vector2() ) );

		} else if ( scope === ScreenNode.VIEWPORT ) {

			output = uniform( _viewportVec || ( _viewportVec = new Vector4() ) );

		} else if ( scope === ScreenNode.DPR ) {

			output = uniform( 1 );

		} else {

			output = vec2( screenCoordinate.div( screenSize ) );

		}

		this._output = output;

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
ScreenNode.DPR = 'dpr';

export default ScreenNode;

// Screen

/**
 * TSL object that represents the current DPR.
 *
 * @tsl
 * @type {ScreenNode<float>}
 */
export const screenDPR = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.DPR );

/**
 * TSL object that represents normalized screen coordinates, unitless in `[0, 1]`.
 *
 * @tsl
 * @type {ScreenNode<vec2>}
 */
export const screenUV = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.UV );

/**
 * TSL object that represents the screen resolution in physical pixel units.
 *
 * @tsl
 * @type {ScreenNode<vec2>}
 */
export const screenSize = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.SIZE );

/**
 * TSL object that represents the current `x`/`y` pixel position on the screen in physical pixel units.
 *
 * @tsl
 * @type {ScreenNode<vec2>}
 */
export const screenCoordinate = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.COORDINATE );

// Viewport

/**
 * TSL object that represents the viewport rectangle as `x`, `y`, `width` and `height` in physical pixel units.
 *
 * @tsl
 * @type {ScreenNode<vec4>}
 */
export const viewport = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.VIEWPORT );

/**
 * TSL object that represents the viewport resolution in physical pixel units.
 *
 * @tsl
 * @type {ScreenNode<vec2>}
 */
export const viewportSize = viewport.zw;

/**
 * TSL object that represents the current `x`/`y` pixel position on the viewport in physical pixel units.
 *
 * @tsl
 * @type {ScreenNode<vec2>}
 */
export const viewportCoordinate = /*@__PURE__*/ screenCoordinate.sub( viewport.xy );

/**
 * TSL object that represents normalized viewport coordinates, unitless in `[0, 1]`.
 *
 * @tsl
 * @type {ScreenNode<vec2>}
 */
export const viewportUV = /*@__PURE__*/ viewportCoordinate.div( viewportSize );

// Deprecated

/**
 * @deprecated since r169. Use {@link screenSize} instead.
 */
export const viewportResolution = /*@__PURE__*/ ( Fn( () => { // @deprecated, r169

	console.warn( 'THREE.TSL: "viewportResolution" is deprecated. Use "screenSize" instead.' );

	return screenSize;

}, 'vec2' ).once() )();
