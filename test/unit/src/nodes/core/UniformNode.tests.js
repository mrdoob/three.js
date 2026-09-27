import { uniform, vec3 } from '../../../../../src/Three.TSL.js';
import { Vector3 } from '../../../../../src/math/Vector3.js';
import NodeFrame from '../../../../../src/nodes/core/NodeFrame.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'UniformNode', () => {

		QUnit.test( 'existing uniform signatures', ( assert ) => {

			assert.strictEqual( uniform( 2 ).value, 2 );
			assert.strictEqual( uniform( 2, 'uint' ).nodeType, 'uint' );
			assert.strictEqual( uniform( 'float' ).value, 0 );
			assert.deepEqual( uniform( 'vec3' ).value, new Vector3() );
			const vector = new Vector3( 1, 2, 3 );
			assert.strictEqual( uniform( vector ).value, vector );
			assert.deepEqual( uniform( vec3( 1, 2, 3 ) ).value, vector );

		} );

		QUnit.test( 'named uniforms update for each object in the same render', ( assert ) => {

			const node = uniform( 'vec3', 'color' );
			const frame = new NodeFrame();
			const a = { uniforms: { color: new Vector3( 1, 0, 0 ) } };
			const b = { uniforms: { color: new Vector3( 0, 1, 0 ) } };

			assert.strictEqual( node.nodeType, 'vec3' );

			for ( const material of [ a, b, a ] ) {

				frame.material = material;
				frame.updateNode( node );
				assert.strictEqual( node.value, material.uniforms.color );

			}

			a.uniforms = { color: new Vector3( 0, 0, 1 ) };
			frame.updateNode( node );
			assert.strictEqual( node.value, a.uniforms.color, 'Reads the current uniforms object' );

		} );

		QUnit.test( 'missing uniforms reset to the type default', ( assert ) => {

			const frame = new NodeFrame();
			const vector = uniform( 'vec3', 'color' );
			const scalar = uniform( 'float', 'amount' );
			const boolean = uniform( 'bool', 'enabled' );
			frame.material = { uniforms: { color: new Vector3( 1, 2, 3 ), amount: 2, enabled: true } };

			for ( const node of [ vector, scalar, boolean ] ) frame.updateNode( node );

			assert.strictEqual( scalar.value, 2 );
			assert.strictEqual( boolean.value, true );

			frame.material.uniforms = { amount: 0, enabled: false };

			for ( const node of [ vector, scalar, boolean ] ) frame.updateNode( node );

			assert.deepEqual( vector.value, new Vector3() );
			assert.strictEqual( scalar.value, 0 );
			assert.strictEqual( boolean.value, false );

			frame.material = {};
			frame.updateNode( vector );
			assert.deepEqual( vector.value, new Vector3() );

		} );

	} );

} );
