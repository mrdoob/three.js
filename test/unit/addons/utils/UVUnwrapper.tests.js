import {
	Bone, BoxGeometry, BufferAttribute, BufferGeometry, CylinderGeometry, Float16BufferAttribute, Float32BufferAttribute,
	Group, ObjectLoader, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Mesh, PlaneGeometry, Skeleton, SkinnedMesh, SphereGeometry,
	TorusGeometry, Uint16BufferAttribute, Vector3
} from 'three';
import { UVUnwrapper } from '../../../../examples/jsm/utils/UVUnwrapper.js';
import { auditAtlas } from './UVUnwrapperTestUtils.js';

const unwrapper = new UVUnwrapper();

function unwrap( root, options = {} ) {

	return unwrapper.unwrap( root, { diagnostics: true, ...options } );

}

function verify( assert, result, limit = 1.5 ) {

	const audit = auditAtlas( result );
	assert.strictEqual( audit.overlaps, 0, 'No positive-area UV intersections' );
	assert.strictEqual( audit.collapsed, 0, 'No collapsed or reversed nondegenerate triangles' );
	assert.strictEqual( audit.paddingViolations, 0, 'Gutters preserved' );
	assert.ok( audit.maxStretch <= limit + 0.002, `Stretch ${ audit.maxStretch } within limit ${ limit }` );
	assert.ok( Math.abs( audit.worldArea - result.diagnostics.statistics.worldArea ) < Math.max( 1e-8, audit.worldArea * 1e-6 ) );
	assert.ok( Math.abs( audit.utilization - result.diagnostics.statistics.utilization ) < 1e-6 );
	return audit;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'UVUnwrapper', () => {

			QUnit.test( 'unique atlas for shared geometry under nested, mirrored, nonuniform transforms', assert => {

				const root = new Group(), nested = new Group(), geometry = new BoxGeometry();
				nested.rotation.set( 0.5, 0.3, 0.2 );
				nested.scale.set( 2, 0.7, 1.3 );
				root.add( nested );
				for ( let i = 0; i < 3; i ++ ) {

					const mesh = new Mesh( geometry );
					mesh.position.set( i * 3, 0, 0 );
					mesh.scale.set( i === 0 ? - 1 : i + 1, 1, 2 );
					mesh.rotation.z = i * 0.2;
					nested.add( mesh );

				}

				const result = unwrap( root );
				verify( assert, result );
				assert.strictEqual( result.meshes.length, 3 );
				assert.strictEqual( new Set( result.meshes.map( r => r.geometry ) ).size, 3 );
				assert.strictEqual( geometry.getAttribute( 'uv1' ), undefined );
				for ( const record of result.meshes ) {

					assert.notStrictEqual( record.geometry, geometry );
					assert.deepEqual( record.geometry.groups, geometry.groups );

				}

			} );

			QUnit.test( 'chart area normalization preserves common density on differently scaled planes', assert => {

				const root = new Group();
				for ( const scale of [ 0.5, 1, 4 ] ) {

					const mesh = new Mesh( new PlaneGeometry( 1, 1, 4, 4 ) );
					mesh.scale.set( scale, scale * 2, 1 );
					root.add( mesh );

				}

				const result = unwrap( root, { resolution: 512, texelsPerUnit: 16 } );
				const audit = verify( assert, result );
				assert.ok( Math.abs( audit.minDensity - 16 ) < 0.0001 && Math.abs( audit.maxDensity - 16 ) < 0.0001 );
				assert.strictEqual( result.channel, 1 );

			} );

			QUnit.test( 'conformal solve improves curved charts; sphere and torus remain valid', assert => {

				let lightmap;
				for ( const mode of [ 'lightmap', 'normal' ] ) {

					const result = unwrap( new Mesh( new SphereGeometry( 1, 32, 16 ) ), { mode } );
					const audit = verify( assert, result, mode === 'normal' ? 2 : 1.5 );
					if ( mode === 'lightmap' ) lightmap = result;
					else {

						assert.ok( result.diagnostics.charts.some( c => c.method === 'conformal' ) );
						assert.ok( result.charts.length < lightmap.charts.length );
						assert.ok( audit.maxStretch < lightmap.diagnostics.statistics.maxStretch );

					}

					verify( assert, unwrap( new Mesh( new TorusGeometry( 1, 0.4, 12, 36 ) ), { mode } ), mode === 'normal' ? 2 : 1.5 );

				}

			} );

			QUnit.test( 'seam splitting copies every attribute, morph, interleaved and normalized value', assert => {

				const geometry = new BoxGeometry();
				const count = geometry.attributes.position.count;
				geometry.setAttribute( 'skinIndex', new Uint16BufferAttribute( new Uint16Array( count * 4 ).map( ( v, i ) => i % 7 ), 4 ) );
				geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( new Float32Array( count * 4 ).fill( 0.25 ), 4 ) );
				geometry.setAttribute( 'color', new BufferAttribute( new Uint8Array( count * 3 ).map( ( v, i ) => i * 17 % 256 ), 3, true ) );
				geometry.setAttribute( 'tangent', new Float32BufferAttribute( new Float32Array( count * 4 ).fill( 1 ), 4 ) );
				geometry.setAttribute( 'half', new Float16BufferAttribute( new Uint16Array( count ).fill( 0x3c00 ), 1 ) );
				geometry.setAttribute( 'interleaved', new InterleavedBufferAttribute( new InterleavedBuffer( new Float32Array( count * 5 ).map( ( v, i ) => i / 7 ), 5 ), 2, 2 ) );
				geometry.morphAttributes.position = [ geometry.attributes.position.clone() ];
				geometry.morphTargetsRelative = true;
				geometry.setDrawRange( 3, 12 );
				const result = unwrap( new Mesh( geometry ), { mode: 'normal' } );
				verify( assert, result, 2 );
				const record = result.meshes[ 0 ];
				for ( const [ name, original ] of Object.entries( geometry.attributes ) ) {

					const output = record.geometry.attributes[ name ];
					assert.strictEqual( output.normalized, original.normalized );
					for ( let i = 0; i < output.count; i ++ ) {

						for ( let j = 0; j < output.itemSize; j ++ ) assert.strictEqual( output.getComponent( i, j ), original.getComponent( record.sourceVertices[ i ], j ) );

					}

				}

				const morph = record.geometry.morphAttributes.position[ 0 ];
				for ( let i = 0; i < morph.count; i ++ ) assert.strictEqual( morph.getX( i ), geometry.morphAttributes.position[ 0 ].getX( record.sourceVertices[ i ] ) );
				assert.strictEqual( record.geometry.morphTargetsRelative, true );
				assert.deepEqual( record.geometry.drawRange, geometry.drawRange );
				assert.notStrictEqual( record.geometry.attributes.uv.array, geometry.attributes.uv.array );
				assert.strictEqual( unwrap( record.mesh, { attribute: 'uv' } ).meshes[ 0 ].geometry.attributes.tangent, undefined );

			} );

			QUnit.test( 'preserves original triangle order, removes no faces, and handles nonindexed geometry', assert => {

				const mesh = new Mesh( new BoxGeometry().toNonIndexed() );
				const original = mesh.geometry;
				const result = unwrap( mesh );
				verify( assert, result );
				const output = mesh.geometry;
				assert.strictEqual( output.index.count, original.attributes.position.count );
				for ( let i = 0; i < output.index.count; i ++ ) {

					const a = new Vector3().fromBufferAttribute( output.attributes.position, output.index.getX( i ) );
					const b = new Vector3().fromBufferAttribute( original.attributes.position, i );
					assert.ok( a.equals( b ) );

				}

			} );

			QUnit.test( 'atlas overflow fails before modifying any mesh', assert => {

				const root = new Group(), good = new Mesh( new BoxGeometry() ), other = new Mesh( new BoxGeometry() );
				const original = good.geometry;
				root.add( good, other );
				assert.throws( () => unwrap( root, { resolution: 16, padding: 7 } ), /gutters/ );
				assert.throws( () => unwrap( root, { texelsPerUnit: 100000 } ), /packing/ );
				assert.strictEqual( good.geometry, original );

			} );

			QUnit.test( 'degenerate and nonmanifold triangles terminate, retain topology and report degeneracy', assert => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, - 1, 0, 0, 0, 1 ], 3 ) );
				geometry.setIndex( [ 0, 1, 2, 1, 0, 3, 1, 0, 4, 0, 0, 0 ] );
				const result = unwrap( new Mesh( geometry ) );
				verify( assert, result );
				assert.strictEqual( result.diagnostics.statistics.degenerateTriangles, 1 );
				assert.strictEqual( result.meshes[ 0 ].geometry.index.count, 12 );
				assert.strictEqual( result.meshes[ 0 ].faceCharts[ 3 ], - 1 );
				const empty = unwrap( new Group() );
				assert.strictEqual( empty.charts.length, 0 );

			} );

			QUnit.test( 'deterministic output and configurable chart work bound', assert => {

				const results = [ 0, 1 ].map( () => unwrap( new Mesh( new SphereGeometry( 1, 24, 12 ) ), { mode: 'normal', maxChartFaces: 32 } ) );
				verify( assert, results[ 0 ], 2 );
				const sizes = new Map();
				for ( const chart of results[ 0 ].meshes[ 0 ].faceCharts ) sizes.set( chart, ( sizes.get( chart ) || 0 ) + 1 );
				assert.ok( Array.from( sizes.values() ).every( count => count <= 32 ) );
				assert.deepEqual( results[ 0 ].meshes[ 0 ].geometry.attributes.uv1.array, results[ 1 ].meshes[ 0 ].geometry.attributes.uv1.array );

			} );

			QUnit.test( 'authored cylinder seams remain distinct and valid islands retain their shape', assert => {

				const mesh = new Mesh( new CylinderGeometry( 1, 1, 6.4, 32, 1, true ) );
				const result = unwrap( mesh, { mode: 'normal', useInputUVs: true } );
				verify( assert, result, 2 );
				assert.strictEqual( result.charts.length, 1, 'The slit cylinder stays one connected island' );
				assert.strictEqual( result.diagnostics.charts[ 0 ].method, 'input' );
				const original = result.meshes[ 0 ].originalGeometry.attributes.uv;
				for ( let i = 0; i < mesh.geometry.attributes.uv.count; i ++ ) {

					const source = result.meshes[ 0 ].sourceVertices[ i ];
					assert.strictEqual( mesh.geometry.attributes.uv.getX( i ), original.getX( source ) );
					assert.strictEqual( mesh.geometry.attributes.uv.getY( i ), original.getY( source ) );

				}

				const bad = new PlaneGeometry();
				bad.attributes.uv.array.fill( 0 );
				verify( assert, unwrap( new Mesh( bad ), { mode: 'normal', useInputUVs: true } ), 2 );

			} );

			QUnit.test( 'Float32 collapse is rejected atomically even when double precision flattening succeeds', assert => {

				const root = new Group(), large = new Mesh( new PlaneGeometry( 10, 10 ) );
				root.add( large );
				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0.5, 1e-12, 0 ], 3 ) );
				const sliver = new Mesh( geometry );
				root.add( sliver );
				const original = large.geometry;
				assert.throws( () => unwrap( root ), /Float32 atlas precision/ );
				assert.strictEqual( large.geometry, original );
				assert.strictEqual( sliver.geometry, geometry );

			} );

			QUnit.test( 'skinned glTF bind matrices and morphs use rendered world area without altering the pose', assert => {

				const root = new Group(), bone = new Bone(), geometry = new PlaneGeometry( 2, 2 );
				const count = geometry.attributes.position.count;
				geometry.setAttribute( 'skinIndex', new Uint16BufferAttribute( new Uint16Array( count * 4 ), 4 ) );
				const weights = new Float32Array( count * 4 );
				for ( let i = 0; i < count; i ++ ) weights[ i * 4 ] = 1;
				geometry.setAttribute( 'skinWeight', new Float32BufferAttribute( weights, 4 ) );
				const morph = geometry.attributes.position.clone();
				for ( let i = 0; i < count; i ++ ) morph.setX( i, morph.getX( i ) * 2 );
				geometry.morphAttributes.position = [ morph ];
				const mesh = new SkinnedMesh( geometry );
				root.add( mesh, bone );
				mesh.scale.setScalar( 0.01 );
				mesh.bind( new Skeleton( [ bone ], [ new Matrix4() ] ), new Matrix4() );
				mesh.morphTargetInfluences[ 0 ] = 0.5;
				root.scale.setScalar( 2 );
				const result = unwrap( root );
				verify( assert, result );
				assert.ok( Math.abs( result.diagnostics.statistics.worldArea - 24 ) < 1e-6, 'Skin bind scale cancels mesh scale; root scale and morph remain' );
				assert.strictEqual( mesh.morphTargetInfluences[ 0 ], 0.5 );
				for ( let i = 0; i < mesh.geometry.attributes.position.count; i ++ ) {

					const source = result.meshes[ 0 ].sourceVertices[ i ];
					assert.ok( new Vector3().fromBufferAttribute( mesh.geometry.attributes.position, i ).equals( new Vector3().fromBufferAttribute( geometry.attributes.position, source ) ) );

				}

				assert.strictEqual( bone.quaternion.w, 1 );

			} );

			QUnit.test( 'parameterized geometries serialize the actual unwrapped buffers', assert => {

				for ( const geometry of [ new BoxGeometry(), new SphereGeometry( 1, 12, 6 ) ] ) {

					geometry.name = 'authored';
					geometry.userData.label = 'preserved';
					geometry.computeBoundingBox();
					const mesh = new Mesh( geometry );
					const result = unwrap( mesh );
					verify( assert, result );
					const restored = new ObjectLoader().parse( mesh.toJSON() ).geometry;
					assert.strictEqual( mesh.geometry.type, 'BufferGeometry' );
					assert.deepEqual( restored.index.array, mesh.geometry.index.array );
					for ( const name of Object.keys( mesh.geometry.attributes ) ) assert.deepEqual( restored.attributes[ name ].array, mesh.geometry.attributes[ name ].array );
					assert.deepEqual( restored.groups, mesh.geometry.groups );
					assert.deepEqual( mesh.geometry.boundingBox, geometry.boundingBox );
					restored.computeBoundingBox();
					assert.deepEqual( restored.boundingBox, mesh.geometry.boundingBox );
					assert.strictEqual( restored.name, 'authored' );
					assert.strictEqual( restored.userData.label, 'preserved' );

				}

			} );

			QUnit.test( 'three square charts use the full atlas width at fixed and fitted density', assert => {

				for ( const texelsPerUnit of [ 500, 0 ] ) {

					const root = new Group();
					for ( let i = 0; i < 3; i ++ ) root.add( new Mesh( new PlaneGeometry() ) );
					const result = unwrap( root, { texelsPerUnit } );
					verify( assert, result );
					assert.ok( result.texelsPerUnit >= 500 - 1e-4 );
					assert.ok( result.diagnostics.statistics.utilization > 0.71 );
					for ( const chart of result.charts ) assert.ok( chart.x + chart.width <= 1024 && chart.y + chart.height <= 1024 );

				}

			} );

			QUnit.test( 'reported density measures the rounded Float32 output in absolute units', assert => {

				const root = new Group();
				root.add( new Mesh( new PlaneGeometry() ) );
				const small = new BufferGeometry();
				small.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1e-6, 0, 0, 0, 1e-6, 0 ], 3 ) );
				root.add( new Mesh( small ) );
				const result = unwrap( root, { texelsPerUnit: 400 } );
				const audit = verify( assert, result );
				const stats = result.diagnostics.statistics;
				assert.ok( Math.abs( stats.minTexelsPerUnit - audit.minDensity ) < 1e-6 );
				assert.ok( Math.abs( stats.maxTexelsPerUnit - audit.maxDensity ) < 1e-6 );
				assert.ok( Math.max( Math.abs( audit.maxDensity - 400 ), Math.abs( audit.minDensity - 400 ) ) > 0.001, 'The fixture exposes absolute rounding drift' );

			} );

			QUnit.test( 'default result retains mappings and omits detailed diagnostics', assert => {

				const result = unwrapper.unwrap( new Mesh( new BoxGeometry() ) );
				assert.strictEqual( result.diagnostics, undefined );
				assert.strictEqual( result.meshes[ 0 ].sourceVertices.length, result.meshes[ 0 ].geometry.attributes.position.count );
				assert.strictEqual( result.meshes[ 0 ].faceCharts.length, 12 );
				assert.deepEqual( Object.keys( result.charts[ 0 ] ), [ 'x', 'y', 'width', 'height' ] );

			} );

		} );

	} );

} );
