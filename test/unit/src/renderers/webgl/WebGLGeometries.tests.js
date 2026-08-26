import { WebGLGeometries } from '../../../../../src/renderers/webgl/WebGLGeometries.js';
import { BufferGeometry } from '../../../../../src/core/BufferGeometry.js';
import { InstancedBufferGeometry } from '../../../../../src/core/InstancedBufferGeometry.js';
import { Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from '../../../../../src/core/BufferAttribute.js';

// Recording stand-ins for the collaborators WebGLGeometries talks to.
function harness() {

	const calls = { update: [], remove: [], released: [] };

	const gl = { ARRAY_BUFFER: 'ARRAY_BUFFER' };

	const attributes = {
		update( attribute, bufferType ) {

			calls.update.push( [ attribute, bufferType ] );

		},
		remove( attribute ) {

			calls.remove.push( attribute );

		}
	};

	const info = { memory: { geometries: 0 } };

	const bindingStates = {
		releaseStatesOfGeometry( geometry ) {

			calls.released.push( geometry );

		}
	};

	return { calls, gl, attributes, info, bindingStates, geometries: new WebGLGeometries( gl, attributes, info, bindingStates ) };

}

// A single triangle, indexed or not.
function triangle( { indexed = false } = {} ) {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0 ], 3 ) );

	if ( indexed ) geometry.setIndex( new Uint16BufferAttribute( [ 0, 1, 2 ], 1 ) );

	return geometry;

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLGeometries', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes the expected API', ( assert ) => {

				const { geometries } = harness();

				for ( const method of [ 'get', 'update', 'getWireframeAttribute' ] ) {

					assert.strictEqual( typeof geometries[ method ], 'function', `${ method }() is exposed` );

				}

			} );

			// get
			QUnit.test( 'get - returns the geometry and counts it', ( assert ) => {

				const { geometries, info } = harness();
				const geometry = triangle();

				assert.strictEqual( geometries.get( {}, geometry ), geometry, 'the geometry is returned' );
				assert.strictEqual( info.memory.geometries, 1, 'the geometry is counted in the memory stats' );

			} );

			QUnit.test( 'get - only registers a geometry once', ( assert ) => {

				const { geometries, info, calls } = harness();
				const geometry = triangle();

				geometries.get( {}, geometry );
				geometries.get( {}, geometry );
				geometries.get( {}, geometry );

				assert.strictEqual( info.memory.geometries, 1, 'repeated calls do not inflate the count' );

				// Asserted behaviourally rather than by reading the private
				// _listeners array: if the dispose listener had been added once
				// per get(), a single dispose event would run the handler three
				// times, releasing three times and driving the count negative.
				geometry.dispatchEvent( { type: 'dispose' } );

				assert.strictEqual( calls.released.length, 1, 'one dispose event releases binding states exactly once' );
				assert.strictEqual( info.memory.geometries, 0, 'the count returns to zero rather than going negative' );

			} );

			QUnit.test( 'get - counts distinct geometries separately', ( assert ) => {

				const { geometries, info } = harness();

				geometries.get( {}, triangle() );
				geometries.get( {}, triangle() );

				assert.strictEqual( info.memory.geometries, 2, 'each geometry is counted' );

			} );

			// update
			QUnit.test( 'update - uploads every vertex attribute', ( assert ) => {

				const { geometries, calls, gl } = harness();

				const geometry = triangle();
				geometry.setAttribute( 'normal', new Float32BufferAttribute( [ 0, 0, 1, 0, 0, 1, 0, 0, 1 ], 3 ) );

				geometries.update( geometry );

				assert.deepEqual(
					calls.update,
					[
						[ geometry.attributes.position, gl.ARRAY_BUFFER ],
						[ geometry.attributes.normal, gl.ARRAY_BUFFER ]
					],
					'each attribute is uploaded as an array buffer'
				);

			} );

			QUnit.test( 'update - leaves the index to WebGLBindingStates', ( assert ) => {

				// The index buffer is bound as part of the VAO, so it is not
				// uploaded here.
				const { geometries, calls } = harness();
				const geometry = triangle( { indexed: true } );

				geometries.update( geometry );

				assert.strictEqual( calls.update.length, 1, 'only the position attribute is uploaded' );
				assert.ok( calls.update.every( ( [ attribute ] ) => attribute !== geometry.index ), 'the index is not among them' );

			} );

			// getWireframeAttribute - indexed
			QUnit.test( 'getWireframeAttribute - turns indexed triangles into line pairs', ( assert ) => {

				// Each triangle a,b,c becomes the three edges ab, bc, ca.
				const { geometries } = harness();
				const geometry = triangle( { indexed: true } );

				const wireframe = geometries.getWireframeAttribute( geometry );

				assert.deepEqual( Array.from( wireframe.array ), [ 0, 1, 1, 2, 2, 0 ], 'the three edges of the triangle are emitted' );
				assert.strictEqual( wireframe.itemSize, 1, 'the attribute holds bare indices' );

			} );

			QUnit.test( 'getWireframeAttribute - handles several indexed triangles', ( assert ) => {

				const { geometries } = harness();

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( new Array( 4 * 3 ).fill( 0 ), 3 ) );
				geometry.setIndex( new Uint16BufferAttribute( [ 0, 1, 2, 0, 2, 3 ], 1 ) );

				const wireframe = geometries.getWireframeAttribute( geometry );

				assert.deepEqual(
					Array.from( wireframe.array ),
					[ 0, 1, 1, 2, 2, 0, 0, 2, 2, 3, 3, 0 ],
					'both triangles contribute three edges each'
				);

			} );

			// getWireframeAttribute - non-indexed
			QUnit.test( 'getWireframeAttribute - derives edges from position order when unindexed', ( assert ) => {

				const { geometries } = harness();
				const geometry = triangle();

				const wireframe = geometries.getWireframeAttribute( geometry );

				assert.deepEqual( Array.from( wireframe.array ), [ 0, 1, 1, 2, 2, 0 ], 'consecutive vertices form each triangle' );

			} );

			QUnit.test( 'getWireframeAttribute - handles several unindexed triangles', ( assert ) => {

				const { geometries } = harness();

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( new Array( 6 * 3 ).fill( 0 ), 3 ) );

				const wireframe = geometries.getWireframeAttribute( geometry );

				assert.deepEqual(
					Array.from( wireframe.array ),
					[ 0, 1, 1, 2, 2, 0, 3, 4, 4, 5, 5, 3 ],
					'each group of three vertices forms its own triangle'
				);

			} );

			QUnit.test( 'getWireframeAttribute - returns nothing without a position attribute', ( assert ) => {

				const { geometries } = harness();

				assert.strictEqual( geometries.getWireframeAttribute( new BufferGeometry() ), undefined, 'there is nothing to build edges from' );

			} );

			// getWireframeAttribute - index width
			QUnit.test( 'getWireframeAttribute - uses 16-bit indices for small geometries', ( assert ) => {

				const { geometries } = harness();

				const wireframe = geometries.getWireframeAttribute( triangle( { indexed: true } ) );

				assert.ok( wireframe.array instanceof Uint16Array, 'a Uint16Array is enough' );

			} );

			QUnit.test( 'getWireframeAttribute - switches to 32-bit indices at 65535 vertices', ( assert ) => {

				// The threshold accounts for PRIMITIVE_RESTART_FIXED_INDEX, which
				// reserves 65535 in a 16-bit index buffer.
				const { geometries } = harness();

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( new Float32Array( 65535 * 3 ), 3 ) );
				geometry.setIndex( new Uint32BufferAttribute( [ 0, 1, 2 ], 1 ) );

				const wireframe = geometries.getWireframeAttribute( geometry );

				assert.strictEqual( geometry.attributes.position.count, 65535, 'the geometry sits exactly on the threshold' );
				assert.ok( wireframe.array instanceof Uint32Array, 'a Uint32Array is used' );

			} );

			// getWireframeAttribute - caching
			QUnit.test( 'getWireframeAttribute - reuses the built attribute', ( assert ) => {

				const { geometries } = harness();
				const geometry = triangle( { indexed: true } );

				assert.strictEqual(
					geometries.getWireframeAttribute( geometry ),
					geometries.getWireframeAttribute( geometry ),
					'the same attribute comes back'
				);

			} );

			QUnit.test( 'getWireframeAttribute - rebuilds when the index changes', ( assert ) => {

				const { geometries, calls } = harness();
				const geometry = triangle( { indexed: true } );

				const first = geometries.getWireframeAttribute( geometry );

				geometry.index.needsUpdate = true;
				const second = geometries.getWireframeAttribute( geometry );

				assert.notStrictEqual( second, first, 'a stale attribute is replaced' );
				assert.deepEqual( calls.remove, [ first ], 'the superseded attribute is released' );

			} );

			QUnit.test( 'getWireframeAttribute - tracks the index version it was built from', ( assert ) => {

				const { geometries } = harness();
				const geometry = triangle( { indexed: true } );

				geometry.index.needsUpdate = true;
				const wireframe = geometries.getWireframeAttribute( geometry );

				assert.strictEqual( wireframe.version, geometry.index.version, 'the version is carried over so staleness can be detected' );

			} );

			QUnit.test( 'getWireframeAttribute - does not rebuild an unindexed geometry', ( assert ) => {

				// Without an index there is no version to compare against, so the
				// cached attribute is kept.
				const { geometries } = harness();
				const geometry = triangle();

				const first = geometries.getWireframeAttribute( geometry );
				geometry.attributes.position.needsUpdate = true;

				assert.strictEqual( geometries.getWireframeAttribute( geometry ), first, 'the cached attribute is reused' );

			} );

			// dispose
			QUnit.test( 'disposing a geometry removes its attribute buffers', ( assert ) => {

				const { geometries, calls } = harness();
				const geometry = triangle( { indexed: true } );

				geometries.get( {}, geometry );
				geometry.dispose();

				assert.ok( calls.remove.includes( geometry.index ), 'the index buffer is removed' );
				assert.ok( calls.remove.includes( geometry.attributes.position ), 'the position buffer is removed' );

			} );

			QUnit.test( 'disposing a geometry releases its binding states and decrements the count', ( assert ) => {

				const { geometries, calls, info } = harness();
				const geometry = triangle();

				geometries.get( {}, geometry );
				geometry.dispose();

				assert.deepEqual( calls.released, [ geometry ], 'the binding states are released' );
				assert.strictEqual( info.memory.geometries, 0, 'the memory count goes back down' );

			} );

			QUnit.test( 'disposing a geometry removes its wireframe attribute', ( assert ) => {

				const { geometries, calls } = harness();
				const geometry = triangle( { indexed: true } );

				geometries.get( {}, geometry );
				const wireframe = geometries.getWireframeAttribute( geometry );

				geometry.dispose();

				assert.ok( calls.remove.includes( wireframe ), 'the wireframe buffer is removed too' );

			} );

			QUnit.test( 'disposing a geometry unsubscribes the listener', ( assert ) => {

				const { geometries, info } = harness();
				const geometry = triangle();

				geometries.get( {}, geometry );
				geometry.dispose();
				geometry.dispose();

				assert.strictEqual( info.memory.geometries, 0, 'a second dispose does not decrement again' );

			} );

			QUnit.test( 'disposing a geometry allows it to be registered again', ( assert ) => {

				const { geometries, info } = harness();
				const geometry = triangle();

				geometries.get( {}, geometry );
				geometry.dispose();
				geometries.get( {}, geometry );

				assert.strictEqual( info.memory.geometries, 1, 'the geometry is counted again' );

			} );

			QUnit.test( 'disposing an instanced geometry clears its cached instance count', ( assert ) => {

				const { geometries } = harness();

				const geometry = new InstancedBufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0 ], 3 ) );
				geometry._maxInstanceCount = 8;

				geometries.get( {}, geometry );
				geometry.dispose();

				assert.strictEqual( geometry._maxInstanceCount, undefined, 'the cached instance count is dropped' );

			} );

		} );

	} );

} );
