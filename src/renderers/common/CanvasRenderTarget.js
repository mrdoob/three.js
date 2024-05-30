import { createCanvasElement } from '../../utils.js';
import { REVISION, SRGBColorSpace } from '../../constants';
import { EventDispatcher } from '../../core/EventDispatcher';
import { Vector4 } from '../../math/Vector4.js';

class CanvasRenderTarget extends EventDispatcher {

	constructor( parameters ) {

		super();

		this.isCanvasRenderTarget = true;

		this.canvas = parameters.canvas;
		this.context = parameters.context;
		this._domElement = parameters.domElement;
		this.alpha = ( parameters.alpha === undefined ) ? true : parameters.alpha;

		this.antialias = ( parameters.antialias === true );

		if ( this.antialias === true ) {

			this.sampleCount = ( parameters.sampleCount === undefined ) ? 4 : parameters.sampleCount;

		} else {

			this.sampleCount = 1;

		}

		this.outputColorSpace = SRGBColorSpace;

		this.depth = true;
		this.stencil = false;

		this._width = 0;
		this._height = 0;
		this.pixelRatio = 1;

		this.viewport = new Vector4( 0, 0, this._width, this._height );
		this.scissor = new Vector4( 0, 0, this._width, this._height );
		this.scissorTest = false;

		this.version = 0;

	}

	set needsUpdate( value ) {

		if ( value === true ) this.version ++;

	}

	get domElement() {

		let domElement = this._domElement;

		if ( ! domElement ) {

			domElement = ( this.canvas !== undefined ) ? this.canvas : createCanvasElement();

			// OffscreenCanvas does not have setAttribute, see #22811
			if ( 'setAttribute' in domElement ) domElement.setAttribute( 'data-engine', `three.js r${REVISION} webgpu` );

			this._domElement = domElement;

		}

		return domElement;

	}

	get samples() {

		return this.sampleCount;

	}

	get depthBuffer() {

		return this.depth;

	}

	get stencilBuffer() {

		return this.stencil;

	}

	getPixelRatio() {

		return this.pixelRatio;

	}

	getDrawingBufferSize( target ) {

		return target.set( this._width * this.pixelRatio, this._height * this.pixelRatio ).floor();

	}

	getSize( target ) {

		return target.set( this._width, this._height );

	}

	setPixelRatio( value = 1 ) {

		this.pixelRatio = value;

		this.setSize( this._width, this._height, false );

	}

	setDrawingBufferSize( width, height, pixelRatio ) {

		this._width = width;
		this._height = height;

		this.pixelRatio = pixelRatio;

		this.domElement.width = Math.floor( width * pixelRatio );
		this.domElement.height = Math.floor( height * pixelRatio );

		this.setViewport( 0, 0, width, height );

		this.needsUpdate = true;

	}

	setSize( width, height, updateStyle = true ) {

		this._width = width;
		this._height = height;

		this.domElement.width = Math.floor( width * this.pixelRatio );
		this.domElement.height = Math.floor( height * this.pixelRatio );

		if ( updateStyle === true ) {

			this.domElement.style.width = width + 'px';
			this.domElement.style.height = height + 'px';

		}

		this.setViewport( 0, 0, width, height );

		this.needsUpdate = true;

	}

	getScissor( target ) {

		const scissor = this.scissor;

		target.x = scissor.x;
		target.y = scissor.y;
		target.width = scissor.width;
		target.height = scissor.height;

		return target;

	}

	setScissor( x, y, width, height ) {

		const scissor = this.scissor;

		if ( x.isVector4 ) {

			scissor.copy( x );

		} else {

			scissor.set( x, y, width, height );

		}

	}

	getScissorTest() {

		return this.scissorTest;

	}

	setScissorTest( value ) {

		this.scissorTest = value;

	}

	getViewport( target ) {

		return target.copy( this.viewport );

	}

	setViewport( x, y, width, height, minDepth = 0, maxDepth = 1 ) {

		const viewport = this.viewport;

		if ( x.isVector4 ) {

			viewport.copy( x );

		} else {

			viewport.set( x, y, width, height );

		}

		viewport.minDepth = minDepth;
		viewport.maxDepth = maxDepth;

	}

	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export default CanvasRenderTarget;
