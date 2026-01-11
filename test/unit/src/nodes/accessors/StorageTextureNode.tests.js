import { storageTexture } from '../../../../../src/nodes/accessors/StorageTextureNode.js';
import { NodeAccess } from '../../../../../src/nodes/core/constants.js';
import StorageTexture from '../../../../../src/renderers/common/StorageTexture.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Accessors', () => {

		QUnit.module( 'StorageTextureNode', () => {

			QUnit.test( 'clone preserves access property', ( assert ) => {

				const texture = new StorageTexture( 512, 512 );
				const node = storageTexture( texture ).setAccess( NodeAccess.READ_ONLY );

				assert.strictEqual( node.access, NodeAccess.READ_ONLY, 'original has READ_ONLY access' );

				const cloned = node.clone();

				assert.strictEqual( cloned.access, NodeAccess.READ_ONLY, 'cloned node preserves READ_ONLY access' );

			} );

			QUnit.test( 'clone preserves READ_WRITE access', ( assert ) => {

				const texture = new StorageTexture( 512, 512 );
				const node = storageTexture( texture ).setAccess( NodeAccess.READ_WRITE );

				const cloned = node.clone();

				assert.strictEqual( cloned.access, NodeAccess.READ_WRITE, 'cloned node preserves READ_WRITE access' );

			} );

		} );

	} );

} );
