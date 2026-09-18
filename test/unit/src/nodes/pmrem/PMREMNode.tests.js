import PMREMNode from '../../../../../src/nodes/pmrem/PMREMNode.js';
import CubeRenderTarget from '../../../../../src/renderers/common/CubeRenderTarget.js';
import { CompressedCubeTexture } from '../../../../../src/textures/CompressedCubeTexture.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'PMREM', () => {

		QUnit.module( 'PMREMNode', () => {

			QUnit.test( 'updateFromTexture', ( assert ) => {

				const target = new CubeRenderTarget( 32 );
				target.texture.mipmaps = [ { width: 32 }, { width: 16 }, { width: 8 } ];

				const mipmaps = [ { width: 64 }, { width: 32 }, { width: 16 }, { width: 8 } ];
				const faces = Array.from( { length: 6 }, () => ( { width: 64, height: 64, mipmaps } ) );
				const compressed = new CompressedCubeTexture( faces );

				const node = new PMREMNode( target.texture );
				node.updateFromTexture( target.texture );

				assert.strictEqual( node._texture.value, target.texture, 'uses the generated cube texture' );
				assert.strictEqual( node._maxLod.value, 2, 'reads the generated mip chain' );
				assert.strictEqual( node._size.value, 32, 'reads the generated base level size' );

				node.updateFromTexture( compressed );

				assert.strictEqual( node._texture.value, compressed, 'uses the compressed cube texture' );
				assert.strictEqual( node._maxLod.value, 3, 'reads the per-face compressed mip chain' );
				assert.strictEqual( node._size.value, 64, 'reads the compressed base level size' );

				target.dispose();
				compressed.dispose();
				node.dispose();

			} );

		} );

	} );

} );
