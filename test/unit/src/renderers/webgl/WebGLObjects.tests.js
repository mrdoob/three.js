import { WebGLObjects } from '../../../../../src/renderers/webgl/WebGLObjects.js';
import { BufferGeometry } from '../../../../../src/core/BufferGeometry.js';
import { MeshBasicMaterial } from '../../../../../src/materials/MeshBasicMaterial.js';
import { Mesh } from '../../../../../src/objects/Mesh.js';
import { InstancedMesh } from '../../../../../src/objects/InstancedMesh.js';
import { SkinnedMesh } from '../../../../../src/objects/SkinnedMesh.js';
import { Skeleton } from '../../../../../src/objects/Skeleton.js';
import { Bone } from '../../../../../src/objects/Bone.js';
import { Color } from '../../../../../src/math/Color.js';

// Recording stand-ins for the five collaborators WebGLObjects talks to.
function harness() {

	const calls = { geometriesGet: [], geometriesUpdate: [], attributesUpdate: [], attributesRemove: [], released: [] };

	const gl = { ARRAY_BUFFER: 'ARRAY_BUFFER' };

	const geometries = {
		// The real WebGLGeometries maps an object's geometry to a buffer
		// geometry; here the geometry stands in for its own buffer geometry.
		get( object, geometry ) {

			calls.geometriesGet.push( [ object, geometry ] );
			return geometry;

		},
		update( buffergeometry ) {

			calls.geometriesUpdate.push( buffergeometry );

		}
	};

	const attributes = {
		update( attribute, bufferType ) {

			calls.attributesUpdate.push( [ attribute, bufferType ] );

		},
		remove( attribute ) {

			calls.attributesRemove.push( attribute );

		}
	};

	const bindingStates = {
		releaseStatesOfObject( object ) {

			calls.released.push( object );

		}
	};

	const info = { render: { frame: 0 } };

	return { calls, gl, geometries, attributes, bindingStates, info, objects: new WebGLObjects( gl, geometries, attributes, bindingStates, info ) };

}

function mesh() {

	return new Mesh( new BufferGeometry(), new MeshBasicMaterial() );

}

export default QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGL', () => {

		QUnit.module( 'WebGLObjects', () => {

			// INSTANCING
			QUnit.test( 'Instancing - exposes the expected API', ( assert ) => {

				const { objects } = harness();

				assert.strictEqual( typeof objects.update, 'function', 'update() is exposed' );
				assert.strictEqual( typeof objects.dispose, 'function', 'dispose() is exposed' );

			} );

			// update
			QUnit.test( 'update - returns the buffer geometry for the object', ( assert ) => {

				const { objects, calls } = harness();
				const object = mesh();

				const result = objects.update( object );

				assert.strictEqual( result, object.geometry, 'the resolved buffer geometry is returned' );
				assert.deepEqual( calls.geometriesGet, [[ object, object.geometry ]], 'the object and its geometry are handed to WebGLGeometries' );

			} );

			QUnit.test( 'update - updates the geometry once per frame', ( assert ) => {

				// Several objects can share a geometry, so the update has to be
				// deduplicated within a frame.
				const { objects, calls, info } = harness();
				const object = mesh();

				objects.update( object );
				objects.update( object );

				assert.strictEqual( calls.geometriesUpdate.length, 1, 'the second call in the same frame is skipped' );

				info.render.frame = 1;
				objects.update( object );

				assert.strictEqual( calls.geometriesUpdate.length, 2, 'a new frame triggers another update' );

			} );

			QUnit.test( 'update - deduplicates per geometry, not per object', ( assert ) => {

				const { objects, calls } = harness();

				const geometry = new BufferGeometry();
				const a = new Mesh( geometry, new MeshBasicMaterial() );
				const b = new Mesh( geometry, new MeshBasicMaterial() );

				objects.update( a );
				objects.update( b );

				assert.strictEqual( calls.geometriesUpdate.length, 1, 'a shared geometry is only updated once' );

			} );

			QUnit.test( 'update - tracks geometries independently', ( assert ) => {

				const { objects, calls } = harness();

				objects.update( mesh() );
				objects.update( mesh() );

				assert.strictEqual( calls.geometriesUpdate.length, 2, 'each distinct geometry is updated' );

			} );

			QUnit.test( 'update - leaves a plain mesh\'s attributes alone', ( assert ) => {

				const { objects, calls } = harness();

				objects.update( mesh() );

				assert.deepEqual( calls.attributesUpdate, [], 'nothing instance-specific is uploaded' );

			} );

			// update - InstancedMesh
			QUnit.test( 'update - uploads the instance matrix for an instanced mesh', ( assert ) => {

				const { objects, calls, gl } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				objects.update( object );

				assert.deepEqual(
					calls.attributesUpdate,
					[[ object.instanceMatrix, gl.ARRAY_BUFFER ]],
					'the instance matrix is uploaded as an array buffer'
				);

			} );

			QUnit.test( 'update - uploads the instance color when there is one', ( assert ) => {

				const { objects, calls, gl } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				object.setColorAt( 0, new Color( 0xff0000 ) );
				objects.update( object );

				assert.deepEqual(
					calls.attributesUpdate,
					[[ object.instanceMatrix, gl.ARRAY_BUFFER ], [ object.instanceColor, gl.ARRAY_BUFFER ]],
					'both instance attributes are uploaded'
				);

			} );

			QUnit.test( 'update - uploads the instance attributes once per frame', ( assert ) => {

				const { objects, calls, info } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				objects.update( object );
				objects.update( object );

				assert.strictEqual( calls.attributesUpdate.length, 1, 'the second call in the same frame is skipped' );

				info.render.frame = 1;
				objects.update( object );

				assert.strictEqual( calls.attributesUpdate.length, 2, 'a new frame uploads again' );

			} );

			QUnit.test( 'update - subscribes to the instanced mesh\'s dispose event exactly once', ( assert ) => {

				const { objects, info, calls } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				objects.update( object );
				info.render.frame = 1;
				objects.update( object );

				// Asserted behaviourally rather than by reading the private
				// _listeners array: a listener subscribed twice would run the
				// dispose handler twice for a single event, releasing the object
				// and removing its instance matrix twice over.
				object.dispatchEvent( { type: 'dispose' } );

				assert.strictEqual( calls.released.length, 1, 'one dispose event releases the object exactly once' );
				assert.strictEqual(
					calls.attributesRemove.filter( a => a === object.instanceMatrix ).length,
					1,
					'the instance matrix is removed exactly once'
				);

			} );

			// update - SkinnedMesh
			QUnit.test( 'update - updates a skinned mesh\'s skeleton once per frame', ( assert ) => {

				const { objects, info } = harness();

				const object = new SkinnedMesh( new BufferGeometry(), new MeshBasicMaterial() );
				const skeleton = new Skeleton( [ new Bone() ] );
				object.bind( skeleton );

				let updates = 0;
				skeleton.update = () => updates ++;

				objects.update( object );
				objects.update( object );

				assert.strictEqual( updates, 1, 'the second call in the same frame is skipped' );

				info.render.frame = 1;
				objects.update( object );

				assert.strictEqual( updates, 2, 'a new frame updates the skeleton again' );

			} );

			QUnit.test( 'update - deduplicates a shared skeleton across meshes', ( assert ) => {

				const { objects } = harness();

				const skeleton = new Skeleton( [ new Bone() ] );

				let updates = 0;
				skeleton.update = () => updates ++;

				for ( let i = 0; i < 2; i ++ ) {

					const object = new SkinnedMesh( new BufferGeometry(), new MeshBasicMaterial() );
					object.bind( skeleton );
					objects.update( object );

				}

				assert.strictEqual( updates, 1, 'a shared skeleton is only updated once per frame' );

			} );

			// dispose of an instanced mesh
			QUnit.test( 'disposing an instanced mesh releases its GPU resources', ( assert ) => {

				const { objects, calls } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				objects.update( object );
				object.dispatchEvent( { type: 'dispose' } );

				assert.deepEqual( calls.released, [ object ], 'the binding states are released' );
				assert.deepEqual( calls.attributesRemove, [ object.instanceMatrix ], 'the instance matrix buffer is removed' );

			} );

			QUnit.test( 'disposing an instanced mesh also removes its instance color', ( assert ) => {

				const { objects, calls } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				object.setColorAt( 0, new Color( 0xff0000 ) );
				objects.update( object );
				object.dispatchEvent( { type: 'dispose' } );

				assert.deepEqual(
					calls.attributesRemove,
					[ object.instanceMatrix, object.instanceColor ],
					'both instance buffers are removed'
				);

			} );

			QUnit.test( 'disposing an instanced mesh unsubscribes the listener', ( assert ) => {

				// Otherwise a mesh disposed twice would release twice.
				const { objects, calls } = harness();
				const object = new InstancedMesh( new BufferGeometry(), new MeshBasicMaterial(), 4 );

				objects.update( object );
				object.dispatchEvent( { type: 'dispose' } );
				object.dispatchEvent( { type: 'dispose' } );

				assert.strictEqual( calls.released.length, 1, 'the second dispose is not handled' );

			} );

			// dispose
			QUnit.test( 'dispose - forgets which objects were updated this frame', ( assert ) => {

				const { objects, calls } = harness();
				const object = mesh();

				objects.update( object );
				objects.dispose();
				objects.update( object );

				assert.strictEqual( calls.geometriesUpdate.length, 2, 'the geometry is updated again after disposal' );

			} );

		} );

	} );

} );
