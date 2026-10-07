import WGSLNodeBuilder from '../../../../../../src/renderers/webgpu/nodes/WGSLNodeBuilder.js';
import BufferNode from '../../../../../../src/nodes/accessors/BufferNode.js';
import StorageBufferNode from '../../../../../../src/nodes/accessors/StorageBufferNode.js';
import StorageBufferAttribute from '../../../../../../src/renderers/common/StorageBufferAttribute.js';
import IndirectStorageBufferAttribute from '../../../../../../src/renderers/common/IndirectStorageBufferAttribute.js';

QUnit.module( 'Renderers', () => {

	QUnit.module( 'WebGPU', () => {

		QUnit.module( 'WGSLNodeBuilder', () => {

			const renderer = { debug: { diagnostics: { keywords: false } } };
			const factories = {
				buffer: () => new BufferNode( new Float32Array( 4 ), 'vec4', 1 ),
				storageBuffer: () => new StorageBufferNode( new StorageBufferAttribute( 1, 4 ), 'vec4', 1 ),
				indirectStorageBuffer: () => new StorageBufferNode( new IndirectStorageBufferAttribute( 3, 1 ), 'uint', 3 )
			};

			for ( const [ type, createNode ] of Object.entries( factories ) ) {

				for ( const stage of [ 'vertex', 'fragment', 'compute' ] ) {

					QUnit.test( `${ type }: builder-local names in ${ stage }`, ( assert ) => {

						const a = new WGSLNodeBuilder( null, renderer );
						const b = new WGSLNodeBuilder( null, renderer );
						const names = [];

						for ( const name of [ null, null, 'explicitBuffer' ] ) {

							const nodeA = createNode();
							const nodeB = createNode();
							const uniformA = a.getUniformFromNode( nodeA, type, stage, name );
							const uniformB = b.getUniformFromNode( nodeB, type, stage, name );
							const bindingA = a.getDataFromNode( nodeA, stage, a.globalCache ).uniformGPU;
							const bindingB = b.getDataFromNode( nodeB, stage, b.globalCache ).uniformGPU;

							assert.notStrictEqual( nodeA.id, nodeB.id, 'Distinct node identities' );
							assert.strictEqual( uniformA.name, uniformB.name, 'Equivalent builders use the same identifier' );
							if ( name !== null ) assert.strictEqual( uniformA.name, name, 'Explicit name is preserved' );
							assert.notStrictEqual( bindingA, bindingB, 'Bindings are not shared between independent buffers' );
							assert.strictEqual( bindingA.nodeUniform, nodeA, 'First binding retains its node' );
							assert.strictEqual( bindingB.nodeUniform, nodeB, 'Second binding retains its node' );
							const originalName = uniformA.name;
							assert.strictEqual( a.getUniformFromNode( nodeA, type, stage, name ), uniformA, 'Repeated lookup retains the uniform' );
							assert.strictEqual( uniformA.name, originalName, 'Repeated lookup does not rename it again' );
							names.push( uniformA.name );

						}

						assert.strictEqual( new Set( names ).size, names.length, 'Buffer names remain distinct within a stage' );

					} );

				}

				QUnit.test( `${ type }: one buffer used across stages`, ( assert ) => {

					const builder = new WGSLNodeBuilder( null, renderer );
					const node = createNode();
					const stages = { vertex: 1, fragment: 2, compute: 4 };

					for ( const [ stage, visibility ] of Object.entries( stages ) ) {

						const uniform = builder.getUniformFromNode( node, type, stage );
						const binding = builder.getDataFromNode( node, stage, builder.globalCache ).uniformGPU;
						assert.strictEqual( uniform.node, node, `${ stage } references the same buffer node` );
						assert.strictEqual( binding.nodeUniform, node, `${ stage } binding retains the same data source` );
						assert.strictEqual( binding.getVisibility() & visibility, visibility, `${ stage } binding remains visible` );

					}

				} );

			}

		} );

	} );

} );
