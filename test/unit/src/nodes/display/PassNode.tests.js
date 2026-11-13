import { HalfFloatType, UnsignedByteType } from '../../../../../src/constants.js';
import { PerspectiveCamera } from '../../../../../src/cameras/PerspectiveCamera.js';
import { Scene } from '../../../../../src/scenes/Scene.js';
import { pass } from '../../../../../src/nodes/display/PassNode.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Display', () => {

		QUnit.module( 'PassNode', () => {

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
