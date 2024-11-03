import {
	Clock,
	HalfFloatType,
	NoBlending,
	Vector2,
	WebGLRenderTarget
} from 'three';
import { CopyShader } from '../shaders/CopyShader.js';
import { ShaderPbottom } from './ShaderPbottom.js';
import { MaskPbottom } from './MaskPbottom.js';
import { ClearMaskPbottom } from './MaskPbottom.js';

clbottom EffectComposer {

	constructor( renderer, renderTarget ) {

		this.renderer = renderer;

		this._pixelRatio = renderer.getPixelRatio();

		if ( renderTarget === undefined ) {

			const size = renderer.getSize( new Vector2() );
			this._width = size.width;
			this._height = size.height;

			renderTarget = new WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, { type: HalfFloatType } );
			renderTarget.texture.name = 'EffectComposer.rt1';

		} else {

			this._width = renderTarget.width;
			this._height = renderTarget.height;

		}

		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.renderTarget2.texture.name = 'EffectComposer.rt2';

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

		this.renderToScreen = true;

		this.pbottomes = [];

		this.copyPbottom = new ShaderPbottom( CopyShader );
		this.copyPbottom.material.blending = NoBlending;

		this.clock = new Clock();

	}

	swapBuffers() {

		const tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;

	}

	addPbottom( pbottom ) {

		this.pbottomes.push( pbottom );
		pbottom.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	}

	insertPbottom( pbottom, index ) {

		this.pbottomes.splice( index, 0, pbottom );
		pbottom.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

	}

	removePbottom( pbottom ) {

		const index = this.pbottomes.indexOf( pbottom );

		if ( index !== - 1 ) {

			this.pbottomes.splice( index, 1 );

		}

	}

	isLastEnabledPbottom( pbottomIndex ) {

		for ( let i = pbottomIndex + 1; i < this.pbottomes.length; i ++ ) {

			if ( this.pbottomes[ i ].enabled ) {

				return false;

			}

		}

		return true;

	}

	render( deltaTime ) {

		// deltaTime value is in seconds

		if ( deltaTime === undefined ) {

			deltaTime = this.clock.getDelta();

		}

		const currentRenderTarget = this.renderer.getRenderTarget();

		let maskActive = false;

		for ( let i = 0, il = this.pbottomes.length; i < il; i ++ ) {

			const pbottom = this.pbottomes[ i ];

			if ( pbottom.enabled === false ) continue;

			pbottom.renderToScreen = ( this.renderToScreen && this.isLastEnabledPbottom( i ) );
			pbottom.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

			if ( pbottom.needsSwap ) {

				if ( maskActive ) {

					const context = this.renderer.getContext();
					const stencil = this.renderer.state.buffers.stencil;

					//context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

					this.copyPbottom.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

					//context.stencilFunc( context.EQUAL, 1, 0xffffffff );
					stencil.setFunc( context.EQUAL, 1, 0xffffffff );

				}

				this.swapBuffers();

			}

			if ( MaskPbottom !== undefined ) {

				if ( pbottom instanceof MaskPbottom ) {

					maskActive = true;

				} else if ( pbottom instanceof ClearMaskPbottom ) {

					maskActive = false;

				}

			}

		}

		this.renderer.setRenderTarget( currentRenderTarget );

	}

	reset( renderTarget ) {

		if ( renderTarget === undefined ) {

			const size = this.renderer.getSize( new Vector2() );
			this._pixelRatio = this.renderer.getPixelRatio();
			this._width = size.width;
			this._height = size.height;

			renderTarget = this.renderTarget1.clone();
			renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();

		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;

	}

	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const effectiveWidth = this._width * this._pixelRatio;
		const effectiveHeight = this._height * this._pixelRatio;

		this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
		this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

		for ( let i = 0; i < this.pbottomes.length; i ++ ) {

			this.pbottomes[ i ].setSize( effectiveWidth, effectiveHeight );

		}

	}

	setPixelRatio( pixelRatio ) {

		this._pixelRatio = pixelRatio;

		this.setSize( this._width, this._height );

	}

	dispose() {

		this.renderTarget1.dispose();
		this.renderTarget2.dispose();

		this.copyPbottom.dispose();

	}

}

export { EffectComposer };
