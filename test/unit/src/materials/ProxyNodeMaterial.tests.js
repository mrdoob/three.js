import NodeMaterial from '../../../../src/materials/nodes/NodeMaterial.js';
import { Material } from '../../../../src/materials/Material.js';
import ProxyNodeMaterial from '../../../../src/materials/nodes/ProxyNodeMaterial.js';
import NodeLibrary from '../../../../src/renderers/common/nodes/NodeLibrary.js';
import NodeMaterialObserver from '../../../../src/materials/nodes/manager/NodeMaterialObserver.js';
import { materialReference } from '../../../../src/nodes/accessors/MaterialReferenceNode.js';
import { Color } from '../../../../src/math/Color.js';
import { Texture } from '../../../../src/textures/Texture.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'ProxyNodeMaterial', () => {

		QUnit.test( 'shared shader and independent instances', ( assert ) => {

			const base = new NodeMaterial();
			base.colorNode = materialReference( 'myColor', 'color' );
			base.transparent = true;
			const a = new ProxyNodeMaterial( base );
			const b = new ProxyNodeMaterial( base );

			assert.ok( a instanceof Material );
			assert.notOk( a instanceof NodeMaterial );
			assert.strictEqual( a.type, 'ProxyNodeMaterial' );
			assert.strictEqual( new NodeLibrary().fromMaterial( a ), a, 'Renderer uses the delegated build directly' );
			assert.strictEqual( a.nodeMaterial, base );
			assert.strictEqual( a.colorNode, base.colorNode );
			assert.strictEqual( a.transparent, true );
			assert.notStrictEqual( a.id, base.id );
			assert.notStrictEqual( a.id, b.id );
			assert.notStrictEqual( a.uuid, base.uuid );
			assert.notStrictEqual( a.uuid, b.uuid );
			assert.strictEqual( a.customProgramCacheKey(), b.customProgramCacheKey() );
			const key = a.customProgramCacheKey();
			a.myColor = new Color( 1, 0, 0 );
			assert.strictEqual( a.customProgramCacheKey(), key );
			assert.strictEqual( b.myColor, undefined, 'Instance properties are independent' );

		} );

		QUnit.test( 'delegates shader setup with the instance material', ( assert ) => {

			const base = new NodeMaterial();
			const material = new ProxyNodeMaterial( base );
			const builder = { material };
			base.setup = function ( receivedBuilder ) {

				assert.strictEqual( this, base );
				assert.strictEqual( receivedBuilder, builder );
				assert.strictEqual( receivedBuilder.material, material );

			};

			material.build( builder );

		} );

		QUnit.test( 'read-only node properties', ( assert ) => {

			const base = new NodeMaterial();
			base.colorNode = materialReference( 'myColor', 'color' );
			const material = new ProxyNodeMaterial( base );

			assert.strictEqual( material.colorNode, base.colorNode );
			assert.strictEqual( material.positionNode, null );
			assert.throws( () => {

				material.colorNode = materialReference( 'other', 'color' );

			}, TypeError, 'Node properties cannot be assigned' );
			assert.strictEqual( material.colorNode, base.colorNode );

			base.positionNode = materialReference( 'offset', 'vec3' );
			assert.strictEqual( material.positionNode, base.positionNode, 'Reads the current node material value' );
			assert.ok( NodeMaterialObserver.prototype.containsNode( { material, context: {} } ), 'Renderer detects node properties to refresh object uniforms' );
			assert.strictEqual( material.clone().colorNode, base.colorNode );

		} );

		QUnit.test( 'node material updates', ( assert ) => {

			const base = new NodeMaterial();
			const a = new ProxyNodeMaterial( base );
			const b = new ProxyNodeMaterial( base );
			const key = a.customProgramCacheKey();

			assert.strictEqual( a.version, 0 );

			base.needsUpdate = true;
			assert.strictEqual( a.version, 1, 'Node material updates reach all instances' );
			assert.strictEqual( b.version, 1 );
			assert.notStrictEqual( a.customProgramCacheKey(), key );

			a.needsUpdate = true;
			assert.strictEqual( a.version, 1, 'Instance updates have no effect' );
			assert.strictEqual( base.version, 1 );
			assert.strictEqual( a.clone().version, 1, 'Clones use the node material version' );

		} );

		QUnit.test( 'requires a node material', ( assert ) => {

			assert.throws( () => new ProxyNodeMaterial(), /must be a NodeMaterial/ );
			assert.throws( () => new ProxyNodeMaterial( new Material() ), /must be a NodeMaterial/ );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const base = new NodeMaterial();
			base.colorNode = materialReference( 'myColor', 'color' );
			const material = new ProxyNodeMaterial( base );
			material.opacity = 0.5;
			material.myColor = new Color( 1, 0, 0 );
			const clone = material.clone();

			assert.ok( clone.isProxyNodeMaterial );
			assert.strictEqual( clone.nodeMaterial, base );
			assert.strictEqual( clone.colorNode, base.colorNode );
			assert.strictEqual( clone.opacity, 0.5 );
			assert.notStrictEqual( clone.id, material.id );
			assert.notStrictEqual( clone.uuid, material.uuid );
			assert.strictEqual( clone.customProgramCacheKey(), material.customProgramCacheKey() );
			assert.strictEqual( clone.myColor, material.myColor, 'Object values are shared' );

		} );

		QUnit.test( 'independent user data', ( assert ) => {

			const base = new NodeMaterial();
			const texture = new Texture();
			base.userData = { phase: 1, tint: new Color( 1, 0, 0 ), map: texture };
			const a = new ProxyNodeMaterial( base );
			const b = new ProxyNodeMaterial( base );

			assert.notStrictEqual( a.userData, base.userData );
			assert.notStrictEqual( a.userData, b.userData );
			assert.strictEqual( a.userData.phase, 1, 'Starts with the node material values' );
			assert.ok( a.userData.tint.isColor, 'Keeps the value types' );
			assert.notStrictEqual( a.userData.tint, base.userData.tint );
			assert.strictEqual( a.userData.map, texture, 'Textures are shared' );

			a.userData.phase = 2;
			a.userData.tint.setRGB( 0, 1, 0 );
			assert.strictEqual( b.userData.phase, 1 );
			assert.deepEqual( b.userData.tint, new Color( 1, 0, 0 ) );

			const clone = a.clone();
			assert.notStrictEqual( clone.userData, a.userData );
			assert.strictEqual( clone.userData.phase, 2 );
			assert.ok( clone.userData.tint.isColor );
			assert.notStrictEqual( clone.userData.tint, a.userData.tint );
			assert.deepEqual( clone.userData.tint, a.userData.tint );

			clone.userData.phase = 3;
			assert.strictEqual( a.userData.phase, 2, 'Clone changes do not affect the source' );

		} );

		QUnit.test( 'independent disposal', ( assert ) => {

			const base = new NodeMaterial();
			base.addEventListener( 'dispose', () => assert.ok( false, 'Source must not be disposed' ) );
			const material = new ProxyNodeMaterial( base );
			let disposed = 0;
			material.addEventListener( 'dispose', () => disposed ++ );
			material.dispose();
			assert.strictEqual( disposed, 1 );

		} );

	} );

} );
