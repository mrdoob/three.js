import { renderGroup } from '../core/UniformGroupNode.js';
import { uniform } from '../core/UniformNode.js';
import { expression } from '../code/ExpressionNode.js';
import { Fn, vec2 } from '../tsl/TSLBase.js';
import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

// Screen

/**
 * TSL object that represents the current DPR.
 *
 * @tsl
 * @type {UniformNode<float>}
 */
export const screenDPR = /*@__PURE__*/ uniform( 1 ).setGroup( renderGroup ).onRenderUpdate( ( { renderer } ) => renderer.getPixelRatio() );

/**
 * TSL object that represents the screen resolution in physical pixel units.
 *
 * @tsl
 * @type {UniformNode<vec2>}
 */
export const screenSize = /*@__PURE__*/ uniform( new Vector2() ).setGroup( renderGroup ).onRenderUpdate( ( { renderer }, self ) => {

	const renderTarget = renderer.getRenderTarget();

	if ( renderTarget !== null ) {

		self.value.set( renderTarget.width, renderTarget.height );

	} else {

		renderer.getDrawingBufferSize( self.value );

	}

} );

/**
 * TSL object that represents the current `x`/`y` pixel position on the screen in physical pixel units.
 * The coordinates are window-relative according to WebGPU standards.
 *
 * @tsl
 * @type {Node<vec2>}
 */
export const screenCoordinate = /*@__PURE__*/ ( Fn( ( builder ) => {

	const coord = expression( builder.getFragCoord(), 'vec2' );

	if ( builder.isFlipY() ) {

		// follow webgpu standards

		return vec2( coord.x, screenSize.y.sub( coord.y ) );

	}

	return coord;

}, 'vec2' ).once() )();

/**
 * TSL object that represents normalized screen coordinates, unitless in `[0, 1]`.
 *
 * @tsl
 * @type {Node<vec2>}
 */
export const screenUV = /*@__PURE__*/ screenCoordinate.div( screenSize );

// Viewport

/**
 * TSL object that represents the viewport rectangle as `x`, `y`, `width` and `height` in physical pixel units.
 *
 * @tsl
 * @type {UniformNode<vec4>}
 */
export const viewport = /*@__PURE__*/ uniform( new Vector4() ).setGroup( renderGroup ).onRenderUpdate( ( { renderer }, self ) => {

	const renderTarget = renderer.getRenderTarget();

	if ( renderTarget !== null ) {

		self.value.copy( renderTarget.viewport );

	} else {

		renderer.getViewport( self.value ).multiplyScalar( renderer.getPixelRatio() );

	}

} );

/**
 * TSL object that represents the viewport resolution in physical pixel units.
 *
 * @tsl
 * @type {Node<vec2>}
 */
export const viewportSize = viewport.zw;

/**
 * TSL object that represents the current `x`/`y` pixel position on the viewport in physical pixel units.
 *
 * @tsl
 * @type {Node<vec2>}
 */
export const viewportCoordinate = /*@__PURE__*/ screenCoordinate.sub( viewport.xy );

/**
 * TSL object that represents normalized viewport coordinates, unitless in `[0, 1]`.
 *
 * @tsl
 * @type {Node<vec2>}
 */
export const viewportUV = /*@__PURE__*/ viewportCoordinate.div( viewportSize );
