import { PerspectiveCamera, Scene } from 'three';
import { Texture } from 'three/webgpu';
import { convertToTexture, pass, texture, vec4 } from 'three/tsl';
import { afterImage } from '../../../../examples/jsm/tsl/display/AfterImageNode.js';
import { bilateralBlur } from '../../../../examples/jsm/tsl/display/BilateralBlurNode.js';
import { chromaticAberration } from '../../../../examples/jsm/tsl/display/ChromaticAberrationNode.js';
import { denoise, temporalDenoise } from '../../../../examples/jsm/tsl/display/DenoiseNode.js';
import { dof } from '../../../../examples/jsm/tsl/display/DepthOfFieldNode.js';
import { fsr1 } from '../../../../examples/jsm/tsl/display/FSR1Node.js';
import FXAANode, { fxaa } from '../../../../examples/jsm/tsl/display/FXAANode.js';
import { gaussianBlur } from '../../../../examples/jsm/tsl/display/GaussianBlurNode.js';
import { lensflare } from '../../../../examples/jsm/tsl/display/LensflareNode.js';
import { rgbShift } from '../../../../examples/jsm/tsl/display/RGBShiftNode.js';
import { smaa } from '../../../../examples/jsm/tsl/display/SMAANode.js';
import { ssgi } from '../../../../examples/jsm/tsl/display/SSGINode.js';
import { sharpen } from '../../../../examples/jsm/tsl/display/SharpenNode.js';
import { sobel } from '../../../../examples/jsm/tsl/display/SobelOperatorNode.js';
import { taau } from '../../../../examples/jsm/tsl/display/TAAUNode.js';
import { traa } from '../../../../examples/jsm/tsl/display/TRAANode.js';
import { temporalReproject } from '../../../../examples/jsm/tsl/display/TemporalReprojectNode.js';
import { transition } from '../../../../examples/jsm/tsl/display/TransitionNode.js';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'TSL', () => {

		QUnit.module( 'EffectDispose', () => {

			const textureInput = () => texture( new Texture() );
			const operatorInput = () => vec4( 1, 0, 0, 1 ).mul( 0.5 );

			const cases = [
				{ name: 'afterImage', create: ( input ) => afterImage( input, 0.96 ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'bilateralBlur', create: ( input ) => bilateralBlur( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'chromaticAberration', create: ( input ) => chromaticAberration( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'denoise', create: ( input ) => denoise( input, { position: textureInput(), normal: textureInput() } ), getInputNode: ( effect ) => effect.inputNode },
				{ name: 'temporalDenoise', create: ( input ) => temporalDenoise( input, { depth: textureInput(), velocity: textureInput(), camera: new PerspectiveCamera() } ), getInputNode: ( effect ) => effect.inputNode },
				{ name: 'dof', create: ( input ) => dof( input, textureInput() ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'fsr1', create: ( input ) => fsr1( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'fxaa', create: ( input ) => fxaa( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'gaussianBlur', create: ( input ) => gaussianBlur( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'lensflare', create: ( input ) => lensflare( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'rgbShift', create: ( input ) => rgbShift( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'smaa', create: ( input ) => smaa( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'ssgi', create: ( input ) => ssgi( input, textureInput(), textureInput(), new PerspectiveCamera() ), getInputNode: ( effect ) => effect.beautyNode },
				{ name: 'sharpen', create: ( input ) => sharpen( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'sobel', create: ( input ) => sobel( input ), getInputNode: ( effect ) => effect.textureNode },
				{ name: 'taau', create: ( input ) => taau( input, textureInput(), textureInput(), new PerspectiveCamera() ), getInputNode: ( effect ) => effect.beautyNode },
				{ name: 'traa', create: ( input ) => traa( input, textureInput(), textureInput(), new PerspectiveCamera() ), getInputNode: ( effect ) => effect.beautyNode },
				{ name: 'temporalReproject', create: ( input ) => temporalReproject( input, textureInput(), textureInput(), textureInput(), new PerspectiveCamera() ), getInputNode: ( effect ) => effect.beautyNode },
			];

			for ( const { name, create, getInputNode } of cases ) {

				QUnit.test( name + ' disposes the internal RTTNode created by convertToTexture()', assert => {

					const effect = create( operatorInput() );
					const inputNode = getInputNode( effect );

					assert.strictEqual( inputNode.isRTTNode, true, 'the input is an internally created RTTNode' );

					let disposed = false;
					inputNode.renderTarget.addEventListener( 'dispose', () => {

						disposed = true;

					} );

					effect.dispose();

					assert.strictEqual( disposed, true, 'the internal render target is disposed' );

				} );

				QUnit.test( name + ' does not dispose a caller-owned texture node', assert => {

					const input = textureInput();
					const effect = create( input );

					assert.strictEqual( getInputNode( effect ), input, 'the input node is passed through unchanged' );

					let disposed = false;
					input.addEventListener( 'dispose', () => {

						disposed = true;

					} );

					effect.dispose();

					assert.strictEqual( disposed, false, 'the caller-owned node is left untouched' );

				} );

			}

			QUnit.test( 'smaa does not dispose a user-supplied RTTNode', assert => {

				const input = convertToTexture( operatorInput() );
				const effect = smaa( input );

				assert.strictEqual( effect.textureNode, input, 'the input node is passed through unchanged' );

				let disposed = false;
				input.renderTarget.addEventListener( 'dispose', () => {

					disposed = true;

				} );

				effect.dispose();

				assert.strictEqual( disposed, false, 'the caller-owned RTTNode is left untouched' );

			} );

			QUnit.test( 'fxaa does not dispose a user-supplied RTTNode', assert => {

				const input = convertToTexture( operatorInput() );
				const effect = fxaa( input );

				assert.strictEqual( effect.textureNode, input, 'the input node is passed through unchanged' );

				let disposed = false;
				input.renderTarget.addEventListener( 'dispose', () => {

					disposed = true;

				} );

				effect.dispose();

				assert.strictEqual( disposed, false, 'the caller-owned RTTNode is left untouched' );

			} );

			QUnit.test( 'smaa does not dispose the texture node of a pass node', assert => {

				const effect = smaa( pass( new Scene(), new PerspectiveCamera() ) );

				assert.notOk( effect.textureNode.isRTTNode, 'the input is a pass texture node, not an RTTNode' );

				let disposed = false;
				effect.textureNode.addEventListener( 'dispose', () => {

					disposed = true;

				} );

				effect.dispose();

				assert.strictEqual( disposed, false, 'the pass-owned texture node is left untouched' );

			} );

			QUnit.test( 'directly constructed FXAANode does not dispose its input', assert => {

				const input = convertToTexture( operatorInput() );
				const effect = new FXAANode( input );

				let disposed = false;
				input.renderTarget.addEventListener( 'dispose', () => {

					disposed = true;

				} );

				effect.dispose();

				assert.strictEqual( disposed, false, 'the caller-owned RTTNode is left untouched' );

			} );

			QUnit.test( 'transition disposes all internally created RTTNodes', assert => {

				const effect = transition( operatorInput(), operatorInput(), operatorInput(), 0.5, 0.1, 1 );

				const inputNodes = [ effect.textureNodeA, effect.textureNodeB, effect.mixTextureNode ];

				for ( const inputNode of inputNodes ) {

					assert.strictEqual( inputNode.isRTTNode, true, 'the input is an internally created RTTNode' );

				}

				let disposedCount = 0;
				for ( const inputNode of inputNodes ) {

					inputNode.renderTarget.addEventListener( 'dispose', () => {

						disposedCount ++;

					} );

				}

				effect.dispose();

				assert.strictEqual( disposedCount, 3, 'all three internal render targets are disposed' );

			} );

			QUnit.test( 'transition does not dispose caller-owned texture nodes', assert => {

				const inputA = textureInput();
				const inputB = textureInput();
				const mixInput = textureInput();
				const effect = transition( inputA, inputB, mixInput, 0.5, 0.1, 1 );

				assert.strictEqual( effect.textureNodeA, inputA, 'the first input is passed through unchanged' );
				assert.strictEqual( effect.textureNodeB, inputB, 'the second input is passed through unchanged' );
				assert.strictEqual( effect.mixTextureNode, mixInput, 'the mix input is passed through unchanged' );

				let disposedCount = 0;
				for ( const input of [ inputA, inputB, mixInput ] ) {

					input.addEventListener( 'dispose', () => {

						disposedCount ++;

					} );

				}

				effect.dispose();

				assert.strictEqual( disposedCount, 0, 'no caller-owned node is disposed' );

			} );

			QUnit.test( 'transition disposes only the owned inputs', assert => {

				const inputB = textureInput();
				const effect = transition( operatorInput(), inputB, operatorInput(), 0.5, 0.1, 1 );

				assert.strictEqual( effect.textureNodeA.isRTTNode, true, 'the first input is an internally created RTTNode' );
				assert.strictEqual( effect.textureNodeB, inputB, 'the second input is passed through unchanged' );
				assert.strictEqual( effect.mixTextureNode.isRTTNode, true, 'the mix input is an internally created RTTNode' );

				let disposedA = false;
				let disposedB = false;
				let disposedMix = false;
				effect.textureNodeA.renderTarget.addEventListener( 'dispose', () => {

					disposedA = true;

				} );
				inputB.addEventListener( 'dispose', () => {

					disposedB = true;

				} );
				effect.mixTextureNode.renderTarget.addEventListener( 'dispose', () => {

					disposedMix = true;

				} );

				effect.dispose();

				assert.strictEqual( disposedA, true, 'the owned first input is disposed' );
				assert.strictEqual( disposedB, false, 'the caller-owned second input is left untouched' );
				assert.strictEqual( disposedMix, true, 'the owned mix input is disposed' );

			} );

		} );

	} );

} );
