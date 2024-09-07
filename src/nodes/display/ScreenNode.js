import Node from '../core/Node.js';
import { NodeUpdateType } from '../core/constants.js';
import { uniform } from '../core/UniformNode.js';
import { Fn, nodeImmutable, vec2 } from '../tsl/TSLBase.js';

import { Vector2 } from '../../math/Vector2.js';
import { Vector4 } from '../../math/Vector4.js';

let screenSizeVec, viewportVec;

class ScreenNode extends Node {

	static get type() {

		return 'ScreenNode';

	}

	constructor( scope ) {

		super();

		this.scope = scope;

		this.isViewportNode = true;

	}

	getNodeType() {

		if ( this.scope === ScreenNode.VIEWPORT ) return 'vec4';
		else return 'vec2';

	}

	getUpdateType() {

		let updateType = NodeUpdateType.NONE;

		if ( this.scope === ScreenNode.SIZE || this.scope === ScreenNode.VIEWPORT ) {

			updateType = NodeUpdateType.RENDER;

		}

		this.updateType = updateType;

		return updateType;

	}

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

export const screenUV = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.UV );
export const screenSize = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.SIZE );
export const screenCoordinate = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.COORDINATE );

// Viewport

export const viewport = /*@__PURE__*/ nodeImmutable( ScreenNode, ScreenNode.VIEWPORT );
export const viewportSize = viewport.zw;
export const viewportCoordinate = /*@__PURE__*/ screenCoordinate.sub( viewport.xy );
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
