import NodeMaterial from '../../../../src/materials/nodes/NodeMaterial.js';
import { Material } from '../../../../src/materials/Material.js';
import ProxyNodeMaterial from '../../../../src/materials/nodes/ProxyNodeMaterial.js';
import NodeLibrary from '../../../../src/renderers/common/nodes/NodeLibrary.js';
import { uniform } from '../../../../src/nodes/core/UniformNode.js';
import { Texture } from '../../../../src/textures/Texture.js';
import { Vector3 } from '../../../../src/math/Vector3.js';

export default QUnit.module( 'Materials', () => {

	QUnit.module( 'ProxyNodeMaterial', () => {

		QUnit.test( 'shared shader and independent instances', ( assert ) => {

			const base = new NodeMaterial();
			base.colorNode = uniform( 'vec3', 'color' );
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
			assert.notStrictEqual( a.uniforms, b.uniforms );
			assert.strictEqual( a.customProgramCacheKey(), b.customProgramCacheKey() );
			const key = a.customProgramCacheKey();
			a.uniforms.color = [ 1, 0, 0 ];
			assert.strictEqual( a.customProgramCacheKey(), key );

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

		QUnit.test( 'requires a node material', ( assert ) => {

			assert.throws( () => new ProxyNodeMaterial(), /must be a NodeMaterial/ );
			assert.throws( () => new ProxyNodeMaterial( new Material() ), /must be a NodeMaterial/ );

		} );

		QUnit.test( 'clone', ( assert ) => {

			const base = new NodeMaterial();
			base.colorNode = uniform( 'vec3', 'color' );
			const material = new ProxyNodeMaterial( base );
			const texture = new Texture();
			material.opacity = 0.5;
			material.uniforms = { color: new Vector3( 1, 0, 0 ), map: texture, amount: 2 };
			const clone = material.clone();

			assert.ok( clone.isProxyNodeMaterial );
			assert.strictEqual( clone.nodeMaterial, base );
			assert.strictEqual( clone.colorNode, base.colorNode );
			assert.strictEqual( clone.opacity, 0.5 );
			assert.notStrictEqual( clone.id, material.id );
			assert.notStrictEqual( clone.uuid, material.uuid );
			assert.strictEqual( clone.customProgramCacheKey(), material.customProgramCacheKey() );
			assert.notStrictEqual( clone.uniforms, material.uniforms );
			assert.notStrictEqual( clone.uniforms.color, material.uniforms.color );
			assert.deepEqual( clone.uniforms.color, material.uniforms.color );
			assert.strictEqual( clone.uniforms.map, texture, 'Textures are shared' );
			assert.strictEqual( clone.uniforms.amount, 2 );

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
