import StructTypeNode from '../../../../../src/nodes/core/StructTypeNode.js';
import { float, vec2, vec3 } from '../../../../../src/nodes/tsl/TSLCore.js';

export default QUnit.module( 'Nodes', () => {

	QUnit.module( 'Core', () => {

		QUnit.module( 'StructTypeNode', () => {

			// Members Layout
			QUnit.module( 'Members Layout Construction', () => {

				QUnit.test( 'constructor returns correct struct members layout', ( assert ) => {

					const node = new StructTypeNode( {
						u: float( 0 ),
						v: float( 0 ),
						w: vec2( 0 ),
						x: vec3( 0 )
					}, 'FancyStruct' );

					const membersLayout = node.membersLayout;

					assert.strictEqual(
						Object.entries( membersLayout ).length, 4,
						'Number of entries in membersLayout must match number passed in'
					);

				} );

				QUnit.test( 'constructor preserves member count for alternate declaration forms', ( assert ) => {

					const verbose = new StructTypeNode( {
						u: { type: 'float' },
						v: { type: 'float' },
						w: { type: 'vec2' },
						x: { type: 'vec3' }
					}, 'VerboseStruct' );

					assert.strictEqual(
						verbose.membersLayout.length, 4,
						'Number of entries in membersLayout must match number passed in as type objects'
					);

				} );

				QUnit.test( 'constructor returns correct member names and types', ( assert ) => {

					const members = {
						position: 'vec3',
						radius: 'float',
						cell: 'ivec2',
						transform: 'mat4'
					};

					const node = new StructTypeNode( members, 'FancyStruct' );
					const membersLayout = node.membersLayout;

					const expectedNames = Object.keys( members );

					assert.deepEqual(
						membersLayout.map( member => member.name ), expectedNames,
						'Member names must match, and preserve the order of, the membersLayout passed in'
					);

					assert.deepEqual(
						membersLayout.map( member => member.type ), Object.values( members ),
						'Member types must match the membersLayout passed in'
					);

				} );

				QUnit.test( 'getMemberType() correctly returns each member type', ( assert ) => {

					const members = {
						position: 'vec3',
						radius: 'float',
						cell: 'ivec2',
						transform: 'mat4'
					};

					const node = new StructTypeNode( members, 'FancyStruct' );
					const expectedNames = Object.keys( members );

					for ( const name of expectedNames ) {

						assert.strictEqual(
							node.getMemberType( null, name ), members[ name ],
							`getMemberType() must report '${ members[ name ] }' for member '${ name }'`
						);

					}

					assert.strictEqual(
						node.getMemberType( null, 'notAMember' ), 'void',
						'getMemberType() must report \'void\' for an unknown member'
					);

				} );

				QUnit.test( 'constructor resolves the atomic flag of a member', ( assert ) => {

					const node = new StructTypeNode( {
						counter: { type: 'uint', atomic: true },
						total: { type: 'uint' },
						label: 'uint'
					}, 'AtomicStruct' );

					assert.deepEqual(
						node.membersLayout.map( member => member.atomic ), [ true, false, false ],
						'atomic must be preserved when declared, and default to false otherwise'
					);

				} );

			} );

			// Buffer Layout
			QUnit.module( 'Memory Layout', () => {

				QUnit.test( 'members are aligned and padded according to the WGSL struct layout rules', ( assert ) => {

					// Mirrors the following struct, whose byte offsets are fixed by the
					// WGSL address space layout constraints:
					//
					// struct B {                                     //             align(16) size(48)
					//     a: vec2<f32>,                              // offset(0)   align(8)  size(8)
					//     // -- implicit member alignment padding -- // offset(8)             size(8)
					//     b: vec3<f32>,                              // offset(16)  align(16) size(12)
					//     c: f32,                                    // offset(28)  align(4)  size(4)
					//     d: f32,                                    // offset(32)  align(4)  size(4)
					//     // -- implicit struct size padding --      // offset(36)            size(12)
					// }
					//
					// StructTypeNode counts in 4-byte elements rather than bytes, so every
					// byte offset above is divided by four.

					const node = new StructTypeNode( {
						a: 'vec2',
						b: 'vec3',
						c: 'float',
						d: 'float'
					}, 'B' );

					assert.deepEqual(
						node.membersLayout.map( member => member.offset ), [ 0, 4, 7, 8 ],
						'Member offsets must be padded up to the alignment required by each member type'
					);

					assert.strictEqual(
						node.structLength, 12,
						'structLength must round the struct up to a multiple of its strictest member alignment'
					);

				} );

				QUnit.test( 'a member that fits the current chunk is not padded', ( assert ) => {

					// A float following a vec3 completes the 16-byte chunk the vec3 opened,
					// so it must sit at element offset 3 and leave the struct 4 elements long.

					const node = new StructTypeNode( {
						a: 'vec3',
						b: 'float'
					}, 'PackedStruct' );

					assert.deepEqual(
						node.membersLayout.map( member => member.offset ), [ 0, 3 ],
						'A member small enough to complete the current chunk must not be pushed to the next one'
					);

					assert.strictEqual(
						node.structLength, 4,
						'A vec3 followed by a float must occupy exactly one 16-byte chunk'
					);

				} );

				QUnit.test( 'a vec4 following a vec3 starts a new chunk', ( assert ) => {

					// Unlike a float, a vec4 cannot complete the chunk the vec3 opened, so it
					// is pushed to the next one and the vec3 is padded out to a full 16 bytes:
					//
					// struct VectorStruct {                          //             align(16) size(64)
					//     a: vec3<f32>,                              // offset(0)   align(16) size(12)
					//     // -- implicit member alignment padding -- // offset(12)            size(4)
					//     b: vec4<f32>,                              // offset(16)  align(16) size(16)
					//     c: vec4<f32>,                              // offset(32)  align(16) size(16)
					//     d: vec4<f32>,                              // offset(48)  align(16) size(16)
					// }

					const node = new StructTypeNode( {
						a: 'vec3',
						b: 'vec4',
						c: 'vec4',
						d: 'vec4'
					}, 'VectorStruct' );

					assert.deepEqual(
						node.membersLayout.map( member => member.offset ), [ 0, 4, 8, 12 ],
						'A member too large to complete the current chunk must be pushed to the next one'
					);

					assert.strictEqual(
						node.structLength, 16,
						'Three vec4s following a vec3 must occupy exactly four 16-byte chunks'
					);

				} );

			} );

		} );

	} );

} );
