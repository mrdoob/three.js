import PMREMNode from '../../../../../src/nodes/pmrem/PMREMNode.js';
import { float, vec3 } from '../../../../../src/nodes/tsl/TSLBase.js';
import { Texture } from '../../../../../src/textures/Texture.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'PMREM', () => {

		QUnit.module( 'PMREMNode', () => {

			QUnit.test( 'setup with an image-less texture', ( assert ) => {

				const texture = new Texture();
				const node = new PMREMNode( texture, vec3( 0, 0, 1 ), float( 0 ) );
				const result = node.setup( { renderer: {}, context: {} } );

				assert.strictEqual( node._pmrem, null, 'PMREM remains unresolved while the image is unavailable' );
				assert.ok( result.isNode, 'Setup completes with the placeholder PMREM texture' );

			} );

		} );

	} );

} );
