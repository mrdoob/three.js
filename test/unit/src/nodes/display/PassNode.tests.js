import { HalfFloatType, UnsignedByteType } from '../../../../../src/constants.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import { pass, passTexture } from '../../../../../src/nodes/display/PassNode.js';

import { float, vec2 } from '../../../../../src/nodes/tsl/TSLBase.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Display', () => {

		QUnit.module( 'PassNode', () => {

			QUnit.test( 'pass texture sampling chains', ( assert ) => {

				const scenePass = pass( new Scene(), new PerspectiveCamera() );
				const texture = passTexture( scenePass, scenePass.getTexture( 'output' ) );
				const coordinates = vec2( 0.25, 0.75 );
				const level = float( 2 );
				const sample = texture.sample( coordinates ).level( level );

				assert.strictEqual( sample.uvNode, coordinates, 'Selecting a mip preserves screen-space coordinates.' );
				assert.strictEqual( sample.levelNode, level, 'The selected mip is retained.' );
				assert.strictEqual( sample.passNode, scenePass, 'The render dependency is retained.' );
				assert.strictEqual( texture.level( level ).sample( coordinates ).levelNode, level, 'Sampling after selecting a mip also preserves the mip.' );
				assert.strictEqual( texture.load( coordinates ).level( level ).sampler, false, 'A chained load remains unfiltered.' );
				assert.strictEqual( texture.uvNode, null, 'The original texture is unchanged.' );

			} );


			QUnit.test( 'output type', ( assert ) => {

				const renderer = { samples: 0, reversedDepthBuffer: false, getOutputBufferType: () => HalfFloatType };
				const scene = new Scene();
				const camera = new PerspectiveCamera();

				const defaultPass = pass( scene, camera );
				defaultPass.setup( { renderer } );

				assert.strictEqual( defaultPass.renderTarget.texture.type, HalfFloatType, 'Defaults to the output buffer type of the renderer.' );

				const bytePass = pass( scene, camera, { type: UnsignedByteType } );
				bytePass.setup( { renderer } );

				assert.strictEqual( bytePass.renderTarget.texture.type, UnsignedByteType, 'Honors the type option.' );

			} );

		} );

	} );

} );
