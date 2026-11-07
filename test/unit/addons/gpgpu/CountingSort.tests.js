import { CountingSort } from '../../../../examples/jsm/gpgpu/CountingSort.js';
import { uint } from 'three/tsl';

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'GPGPU', () => {

		QUnit.module( 'CountingSort', () => {

			QUnit.test( 'disposes before a GPU bin function is configured', ( assert ) => {

				const sort = new CountingSort( 3 );
				let disposed = false;
				sort.orderAttribute.addEventListener( 'dispose', () => disposed = true );

				sort.dispose();

				assert.true( disposed, 'releases the order buffer without compute nodes' );

			} );

			QUnit.test( 'disposes a CPU-only sorter', ( assert ) => {

				const sort = new CountingSort( 3 );
				sort.enableWebGLBuffers();
				sort.computeCPU( i => 2 - i );
				assert.deepEqual( Array.from( sort.orderAttribute.array ), [ 2, 1, 0 ], 'sorts without configuring compute nodes' );

				let disposed = false;
				sort.orderAttribute.addEventListener( 'dispose', () => disposed = true );
				sort.dispose();

				assert.true( disposed, 'releases the CPU order buffer without compute nodes' );

			} );

			QUnit.test( 'releases replaced compute nodes without disposing shared buffers', ( assert ) => {

				const sort = new CountingSort( 3 );
				sort.setBinNode( () => uint( 0 ) );

				const previousNodes = [ sort._resetNode, sort._histogramNode, sort._prefixNode, sort._scatterNode ];
				const disposedNodes = new Set();
				for ( const node of previousNodes ) node.addEventListener( 'dispose', () => disposedNodes.add( node ) );

				let bufferDisposals = 0;
				for ( const attribute of [ sort.orderAttribute, sort.binRead.value, sort.histogramAtomic.value, sort.offsetAtomic.value ] ) {

					attribute.addEventListener( 'dispose', () => bufferDisposals ++ );

				}

				sort.setBinNode( () => uint( 1 ) );

				assert.strictEqual( disposedNodes.size, previousNodes.length, 'releases every previous compute node' );
				assert.strictEqual( bufferDisposals, 0, 'replacement keeps the shared buffers alive' );

				sort.dispose();
				assert.strictEqual( bufferDisposals, 4, 'final disposal releases the shared buffers' );

			} );

			QUnit.test( 'disposes configured compute nodes once across repeated disposal', ( assert ) => {

				const sort = new CountingSort( 3 );
				sort.setBinNode( () => uint( 0 ) );
				let disposals = 0;
				for ( const node of [ sort._resetNode, sort._histogramNode, sort._prefixNode, sort._scatterNode ] ) {

					node.addEventListener( 'dispose', () => disposals ++ );

				}

				sort.dispose();
				sort.dispose();

				assert.strictEqual( disposals, 4, 'each compute node is released only once' );

			} );

		} );

	} );

} );
