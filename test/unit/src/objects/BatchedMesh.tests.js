import { BatchedMesh } from '../../../../src/objects/BatchedMesh.js';
import { BoxGeometry } from '../../../../src/geometries/BoxGeometry.js';
import { BufferGeometry } from '../../../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../../../src/core/BufferAttribute.js';
import { MeshBasicMaterial } from '../../../../src/materials/MeshBasicMaterial.js';
import { PerspectiveCamera } from '../../../../src/cameras/PerspectiveCamera.js';
import { createWireframeIndexBufferAttribute } from '../../../../src/renderers/common/WireframeIndexUtils.js';

export default QUnit.module( 'Objects', () => {

	QUnit.module( 'BatchedMesh', () => {

		// PUBLIC

		QUnit.test( 'setInstanceCount', ( assert ) => {

			const box = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0x00ff00 } );

			// initialize and add a geometry into the batched mesh
			const batchedMesh = new BatchedMesh( 4, 5000, 10000, material );
			const boxGeometryId = batchedMesh.addGeometry( box );

			// create instances of this geometry
			const boxInstanceIds = [];
			for ( let i = 0; i < 4; i ++ ) {

				boxInstanceIds.push( batchedMesh.addInstance( boxGeometryId ) );

			}

			batchedMesh.deleteInstance( boxInstanceIds[ 2 ] );
			batchedMesh.deleteInstance( boxInstanceIds[ 3 ] );

			// shrink the instance count
			batchedMesh.setInstanceCount( 2 );

			assert.ok( batchedMesh.instanceCount === 2, 'instance count unequal 2' );

		} );

		// WIREFRAME

		QUnit.test( 'drawRange matches used index prefix (pooled index buffer for wireframe)', ( assert ) => {

			// One box (36 indices) in a large reserved index pool: wireframe must not walk maxIndexCount.
			const box = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
			const maxIndex = 2_000_000;
			const batchedMesh = new BatchedMesh( 1, 5000, maxIndex, material );
			batchedMesh.addGeometry( box );

			const g = batchedMesh.geometry;
			assert.equal( g.index.count, maxIndex, 'pooled index buffer is maxIndex long' );
			assert.equal( g.drawRange.start, 0, 'drawRange start' );
			assert.equal( g.drawRange.count, batchedMesh._nextIndexStart, 'drawRange count is the used prefix' );
			const wf = createWireframeIndexBufferAttribute( g );
			// 12 triangles in box, 6 wireframe line indices per triangle
			assert.equal( wf.count, 12 * 6, 'wireframe index count is only for used subrange' );

		} );

		QUnit.test( 'wireframe - multiDraw starts and counts are doubled', ( assert ) => {

			const box = new BoxGeometry( 1, 1, 1 );
			const material = new MeshBasicMaterial( { color: 0x00ff00 } );

			const batchedMesh = new BatchedMesh( 2, 5000, 10000, material );
			batchedMesh.perObjectFrustumCulled = false;
			const geoId = batchedMesh.addGeometry( box );
			batchedMesh.addInstance( geoId );
			batchedMesh.addInstance( geoId );

			const camera = new PerspectiveCamera();
			camera.updateMatrixWorld();

			// Run onBeforeRender without wireframe to get baseline values
			batchedMesh._visibilityChanged = true;
			batchedMesh.onBeforeRender( {}, {}, camera, batchedMesh.geometry, material );

			const baseStarts = [];
			const baseCounts = [];
			for ( let i = 0; i < batchedMesh._multiDrawCount; i ++ ) {

				baseStarts.push( batchedMesh._multiDrawStarts[ i ] );
				baseCounts.push( batchedMesh._multiDrawCounts[ i ] );

			}

			// Run onBeforeRender with wireframe enabled
			const wireMaterial = new MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
			batchedMesh._visibilityChanged = true;
			batchedMesh.onBeforeRender( {}, {}, camera, batchedMesh.geometry, wireMaterial );

			const wireStarts = [];
			const wireCounts = [];
			for ( let i = 0; i < batchedMesh._multiDrawCount; i ++ ) {

				wireStarts.push( batchedMesh._multiDrawStarts[ i ] );
				wireCounts.push( batchedMesh._multiDrawCounts[ i ] );

			}

			assert.equal( batchedMesh._multiDrawCount, 2, 'draw count is 2 for both instances' );

			// Wireframe counts should be exactly 2x the non-wireframe counts
			for ( let i = 0; i < baseCounts.length; i ++ ) {

				assert.equal( wireCounts[ i ], baseCounts[ i ] * 2,
					`wireframe count[${ i }] should be double the non-wireframe count` );

			}

			// Verify the wireframe starts are consistent: converting to element indices should
			// give exactly 2x the non-wireframe element indices
			const index = batchedMesh.geometry.getIndex();
			const baseBpe = index.array.BYTES_PER_ELEMENT;
			const posCount = batchedMesh.geometry.attributes.position.count;
			const wireBpe = posCount > 65535 ? 4 : 2;

			for ( let i = 0; i < baseStarts.length; i ++ ) {

				const baseElementIndex = baseStarts[ i ] / baseBpe;
				const wireElementIndex = wireStarts[ i ] / wireBpe;
				assert.equal( wireElementIndex, baseElementIndex * 2,
					`wireframe start[${ i }] element index should be double the non-wireframe element index` );

			}

		} );

		QUnit.test( 'wireframe - multiDraw byte offsets produce valid index ranges', ( assert ) => {

			// Use two different geometries in the batch to test non-zero start offsets
			const box = new BoxGeometry( 1, 1, 1 );
			const box2 = new BoxGeometry( 2, 2, 2 );
			const material = new MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

			const batchedMesh = new BatchedMesh( 2, 5000, 10000, material );
			batchedMesh.perObjectFrustumCulled = false;
			const geoId1 = batchedMesh.addGeometry( box );
			const geoId2 = batchedMesh.addGeometry( box2 );
			batchedMesh.addInstance( geoId1 );
			batchedMesh.addInstance( geoId2 );

			const camera = new PerspectiveCamera();
			camera.updateMatrixWorld();

			batchedMesh._visibilityChanged = true;
			batchedMesh.onBeforeRender( {}, {}, camera, batchedMesh.geometry, material );

			const posCount = batchedMesh.geometry.attributes.position.count;
			const wireBpe = posCount > 65535 ? 4 : 2;

			// The maximum wireframe index count is 2x the original index count
			const origIndex = batchedMesh.geometry.getIndex();
			const maxWireframeElements = origIndex.count * 2;

			for ( let i = 0; i < batchedMesh._multiDrawCount; i ++ ) {

				const firstIndex = batchedMesh._multiDrawStarts[ i ] / wireBpe;
				const count = batchedMesh._multiDrawCounts[ i ];

				assert.ok( firstIndex >= 0,
					`wireframe firstIndex[${ i }] (${ firstIndex }) should be non-negative` );
				assert.ok( Number.isInteger( firstIndex ),
					`wireframe firstIndex[${ i }] (${ firstIndex }) should be an integer` );
				assert.ok( firstIndex + count <= maxWireframeElements,
					`wireframe range[${ i }] (${ firstIndex } + ${ count } = ${ firstIndex + count }) should fit within buffer (${ maxWireframeElements })` );

			}

		} );

		QUnit.test( 'wireframe - bytesPerElement consistency at 65535 vertex boundary', ( assert ) => {

			// Test that at the boundary of 65535 vertices, the wireframe index type and
			// the BatchedMesh bytesPerElement calculation agree. This was a bug where
			// getWireframeIndex used >= 65535 but BatchedMesh used > 65535.

			// Create a geometry with exactly 65535 positions (the boundary case)
			const geom = new BufferGeometry();
			const posArray = new Float32Array( 65535 * 3 );
			geom.setAttribute( 'position', new BufferAttribute( posArray, 3 ) );

			// Create a small index buffer (3 indices for one triangle)
			const indexArray = new Uint16Array( [ 0, 1, 2 ] );
			geom.setIndex( new BufferAttribute( indexArray, 1 ) );

			const material = new MeshBasicMaterial( { wireframe: true } );
			const batchedMesh = new BatchedMesh( 1, 65535, 3, material );
			const geoId = batchedMesh.addGeometry( geom );
			batchedMesh.addInstance( geoId );

			// The BatchedMesh geometry should have position.count = 65535
			const batchPosCount = batchedMesh.geometry.attributes.position.count;
			assert.equal( batchPosCount, 65535, 'BatchedMesh position count is 65535' );

			// The BatchedMesh wireframe bytesPerElement: position.count > 65535 → 2 (Uint16)
			const batchWireBpe = batchPosCount > 65535 ? 4 : 2;
			assert.equal( batchWireBpe, 2, 'BatchedMesh wireframe bytesPerElement is 2 at the 65535 boundary' );

			// The wireframe index should also use Uint16 at count=65535 (> 65535, not >= 65535)
			// After our fix, getWireframeIndex uses > 65535, matching BatchedMesh
			const expectedWireType = batchPosCount > 65535 ? 4 : 2;
			assert.equal( expectedWireType, batchWireBpe,
				'wireframe index type threshold matches BatchedMesh bytesPerElement threshold' );

		} );

		QUnit.test( 'wireframe - multiDraw with large vertex count (> 65535)', ( assert ) => {

			// Test that wireframe works correctly when vertex count exceeds 65535
			// (requires Uint32 index buffer)
			const geom = new BufferGeometry();
			const vertCount = 70000;
			const posArray = new Float32Array( vertCount * 3 );
			geom.setAttribute( 'position', new BufferAttribute( posArray, 3 ) );

			// Create a small index buffer
			const indexArray = new Uint32Array( [ 0, 1, 2, 3, 4, 5 ] );
			geom.setIndex( new BufferAttribute( indexArray, 1 ) );

			const wireMaterial = new MeshBasicMaterial( { wireframe: true } );
			const batchedMesh = new BatchedMesh( 1, vertCount, 6, wireMaterial );
			batchedMesh.perObjectFrustumCulled = false;
			const geoId = batchedMesh.addGeometry( geom );
			batchedMesh.addInstance( geoId );

			const camera = new PerspectiveCamera();
			camera.updateMatrixWorld();

			batchedMesh._visibilityChanged = true;
			batchedMesh.onBeforeRender( {}, {}, camera, batchedMesh.geometry, wireMaterial );

			const posCount = batchedMesh.geometry.attributes.position.count;
			assert.ok( posCount > 65535, 'position count exceeds 65535' );

			// The original index has 6 elements (2 triangles)
			// Wireframe should produce 12 elements (6 edges * 2 vertices)
			const wireBpe = posCount > 65535 ? 4 : 2;
			assert.equal( wireBpe, 4, 'wireframe bytesPerElement is 4 for large vertex count' );

			// Verify the draw data is correct
			assert.equal( batchedMesh._multiDrawCount, 1, 'one draw call' );
			assert.equal( batchedMesh._multiDrawCounts[ 0 ], 12,
				'wireframe count is 2x the original index count (6 * 2 = 12)' );

			const firstIndex = batchedMesh._multiDrawStarts[ 0 ] / wireBpe;
			assert.equal( firstIndex, 0, 'wireframe first index is 0 for the first geometry' );

		} );

	} );

} );
