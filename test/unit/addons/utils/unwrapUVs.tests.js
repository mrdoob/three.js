import {
	Bone, BoxGeometry, BufferAttribute, BufferGeometry, CylinderGeometry, Float16BufferAttribute, Float32BufferAttribute,
	Group, ObjectLoader, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Mesh, PlaneGeometry, Skeleton, SkinnedMesh, SphereGeometry,
	TorusGeometry, Uint16BufferAttribute, Vector3
} from 'three';
import { unwrapUVs as unwrap } from '../../../../examples/jsm/utils/unwrapUVs.js';
import { CONSOLE_LEVEL } from '../../utils/console-wrapper.js';

// Independent output audit. Uses polygon clipping, rather than the unwrapper's
// separating-axis test, to detect positive-area triangle intersections.
function auditAtlas( result ) {

	const triangles = [], stretches = [], densities = [];
	let worldArea = 0, uvArea = 0, paddingViolations = 0, collapsed = 0;
	for ( const record of result.meshes ) {

		const geometry = record.mesh.geometry, uv = geometry.attributes[ result.attribute ];
		const index = geometry.index;
		for ( let f = 0; f < index.count / 3; f ++ ) {

			const ids = [ 0, 1, 2 ].map( j => index.getX( f * 3 + j ) );
			const p = ids.map( v => [ uv.getX( v ), uv.getY( v ) ] );
			if ( p.some( v => ! Number.isFinite( v[ 0 ] + v[ 1 ] ) || v[ 0 ] < 0 || v[ 0 ] > 1 || v[ 1 ] < 0 || v[ 1 ] > 1 ) ) throw new Error( 'Invalid UV coordinate.' );
			if ( record.faceCharts[ f ] === - 1 ) {

				if ( p.some( v => v[ 0 ] !== 0 || v[ 1 ] !== 0 ) ) throw new Error( 'Ignored faces must have UV (0, 0).' );
				continue;

			}

			const world = ids.map( v => record.mesh.getVertexPosition( v, new Vector3() ).applyMatrix4( record.mesh.matrixWorld ) );
			const ab = world[ 1 ].clone().sub( world[ 0 ] ), ac = world[ 2 ].clone().sub( world[ 0 ] );
			const cross = new Vector3().crossVectors( ab, ac ).length();
			if ( cross === 0 ) continue;
			const det = orient( p[ 0 ], p[ 1 ], p[ 2 ] );
			if ( det <= 0 ) collapsed ++;
			const length = ab.length(), x = ac.dot( ab ) / length, y = cross / length;
			const ux = ( p[ 1 ][ 0 ] - p[ 0 ][ 0 ] ) / length, vx = ( p[ 1 ][ 1 ] - p[ 0 ][ 1 ] ) / length;
			const uy = ( p[ 2 ][ 0 ] - p[ 0 ][ 0 ] - ux * x ) / y, vy = ( p[ 2 ][ 1 ] - p[ 0 ][ 1 ] - vx * x ) / y;
			const trace = ux * ux + vx * vx + uy * uy + vy * vy;
			const difference = ux * ux + vx * vx - uy * uy - vy * vy, product = ux * uy + vx * vy;
			const delta = Math.sqrt( difference * difference + 4 * product * product );
			stretches.push( ( trace + delta ) / 2 / ( det / cross ) );
			densities.push( Math.sqrt( det / cross ) * result.resolution );
			worldArea += cross / 2;
			uvArea += det / 2;
			const chart = result.charts[ record.faceCharts[ f ] ];
			for ( const v of p ) {

				const px = v[ 0 ] * result.resolution, py = v[ 1 ] * result.resolution;
				if ( px < chart.x + result.padding - 1e-4 || py < chart.y + result.padding - 1e-4 ||
					px > chart.x + chart.width - result.padding + 1e-4 || py > chart.y + chart.height - result.padding + 1e-4 ) paddingViolations ++;

			}

			triangles.push( p );

		}

	}

	const side = Math.max( 1, Math.ceil( Math.sqrt( triangles.length ) / 2 ) );
	const cells = new Map();
	let overlaps = 0;
	for ( let i = 0; i < triangles.length; i ++ ) {

		const triangle = triangles[ i ], seen = new Set();
		const minX = Math.floor( Math.min( ...triangle.map( v => v[ 0 ] ) ) * side );
		const maxX = Math.floor( Math.max( ...triangle.map( v => v[ 0 ] ) ) * side );
		const minY = Math.floor( Math.min( ...triangle.map( v => v[ 1 ] ) ) * side );
		const maxY = Math.floor( Math.max( ...triangle.map( v => v[ 1 ] ) ) * side );
		for ( let x = minX; x <= maxX; x ++ ) {

			for ( let y = minY; y <= maxY; y ++ ) {

				const key = x * ( side + 1 ) + y;
				if ( ! cells.has( key ) ) cells.set( key, [] );
				const cell = cells.get( key );
				for ( const j of cell ) {

					if ( seen.has( j ) ) continue;
					seen.add( j );
					// Float32 roundoff at shared edges is tolerated relative to triangle area.
					const tolerance = Math.min( polygonArea( triangle ), polygonArea( triangles[ j ] ) ) * 1e-5;
					if ( intersectionArea( triangle, triangles[ j ] ) > Math.max( 1e-14, tolerance ) ) overlaps ++;

				}

				cell.push( i );

			}

		}

	}

	stretches.sort( ( a, b ) => a - b );
	densities.sort( ( a, b ) => a - b );
	return {
		overlaps, collapsed, paddingViolations, worldArea, utilization: uvArea,
		maxStretch: stretches.at( - 1 ) || 1, p95Stretch: stretches[ Math.floor( stretches.length * 0.95 ) ] || 1,
		minDensity: densities[ 0 ] || 0, maxDensity: densities.at( - 1 ) || 0
	};

}

function orient( a, b, c ) {

	return ( b[ 0 ] - a[ 0 ] ) * ( c[ 1 ] - a[ 1 ] ) - ( b[ 1 ] - a[ 1 ] ) * ( c[ 0 ] - a[ 0 ] );

}

function polygonArea( points ) {

	let sum = 0;
	for ( let i = 1; i < points.length - 1; i ++ ) sum += orient( points[ 0 ], points[ i ], points[ i + 1 ] );
	return Math.abs( sum ) / 2;

}

function intersectionArea( a, b ) {

	let polygon = a;
	for ( let i = 0; i < 3 && polygon.length; i ++ ) {

		const p = b[ i ], q = b[ ( i + 1 ) % 3 ], next = [];
		for ( let j = 0; j < polygon.length; j ++ ) {

			const from = polygon[ j ], to = polygon[ ( j + 1 ) % polygon.length ];
			const da = orient( p, q, from ), db = orient( p, q, to );
			if ( da >= 0 ) next.push( from );
			if ( ( da < 0 ) !== ( db < 0 ) ) {

				const t = da / ( da - db );
				next.push( [ from[ 0 ] + ( to[ 0 ] - from[ 0 ] ) * t, from[ 1 ] + ( to[ 1 ] - from[ 1 ] ) * t ] );

			}

		}

		polygon = next;

	}

	return polygonArea( polygon );

}

function verify( assert, result, limit = 1.5 ) {

	const audit = auditAtlas( result );
	assert.strictEqual( audit.overlaps, 0, 'No positive-area UV intersections' );
	assert.strictEqual( audit.collapsed, 0, 'No collapsed or reversed nondegenerate triangles' );
	assert.strictEqual( audit.paddingViolations, 0, 'Gutters preserved' );
	assert.ok( audit.maxStretch <= limit + 0.002, `Stretch ${ audit.maxStretch } within limit ${ limit }` );
	return audit;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Utils', () => {

		QUnit.module( 'unwrapUVs', () => {

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
				assert.strictEqual( new Set( result.meshes.map( r => r.mesh.geometry ) ).size, 3 );
				assert.strictEqual( geometry.getAttribute( 'uv1' ), undefined );
				for ( const record of result.meshes ) {

					assert.notStrictEqual( record.mesh.geometry, geometry );
					assert.deepEqual( record.mesh.geometry.groups, geometry.groups );

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

			} );

			QUnit.test( 'conformal solve improves curved charts; sphere and torus remain valid', assert => {

				let lightmap;
				for ( const mode of [ 'lightmap', 'normal' ] ) {

					const result = unwrap( new Mesh( new SphereGeometry( 1, 32, 16 ) ), { mode } );
					const audit = verify( assert, result, mode === 'normal' ? 2 : 1.5 );
					if ( mode === 'lightmap' ) lightmap = result;
					else {

						assert.ok( result.charts.length < lightmap.charts.length );
						assert.ok( audit.maxStretch < auditAtlas( lightmap ).maxStretch );

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

					const output = record.mesh.geometry.attributes[ name ];
					assert.strictEqual( output.normalized, original.normalized );
					for ( let i = 0; i < output.count; i ++ ) {

						for ( let j = 0; j < output.itemSize; j ++ ) assert.strictEqual( output.getComponent( i, j ), original.getComponent( record.sourceVertices[ i ], j ) );

					}

				}

				const morph = record.mesh.geometry.morphAttributes.position[ 0 ];
				for ( let i = 0; i < morph.count; i ++ ) assert.strictEqual( morph.getX( i ), geometry.morphAttributes.position[ 0 ].getX( record.sourceVertices[ i ] ) );
				assert.strictEqual( record.mesh.geometry.morphTargetsRelative, true );
				assert.deepEqual( record.mesh.geometry.drawRange, geometry.drawRange );
				assert.notStrictEqual( record.mesh.geometry.attributes.uv.array, geometry.attributes.uv.array );
				assert.strictEqual( unwrap( record.mesh, { attribute: 'uv' } ).meshes[ 0 ].mesh.geometry.attributes.tangent, undefined );

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

			QUnit.test( 'atlas overflow returns null without modifying any mesh', assert => {

				const root = new Group(), good = new Mesh( new BoxGeometry() ), other = new Mesh( new BoxGeometry() );
				const original = good.geometry;
				root.add( good, other );
				console.level = CONSOLE_LEVEL.OFF;
				assert.strictEqual( unwrap( root, { resolution: 16, padding: 7 } ), null );
				assert.strictEqual( good.geometry, original );
				const fitted = unwrap( root, { texelsPerUnit: 100000 } );
				console.level = CONSOLE_LEVEL.DEFAULT;
				verify( assert, fitted );
				assert.ok( fitted.texelsPerUnit < 100000, 'Falls back to the fitted density' );

			} );

			QUnit.test( 'degenerate and nonmanifold triangles terminate, retain topology and report degeneracy', assert => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, - 1, 0, 0, 0, 1 ], 3 ) );
				geometry.setIndex( [ 0, 1, 2, 1, 0, 3, 1, 0, 4, 0, 0, 0 ] );
				const result = unwrap( new Mesh( geometry ) );
				verify( assert, result );
				assert.strictEqual( result.meshes[ 0 ].faceCharts.filter( chart => chart === - 1 ).length, 1 );
				assert.strictEqual( result.meshes[ 0 ].mesh.geometry.index.count, 12 );
				assert.strictEqual( result.meshes[ 0 ].faceCharts[ 3 ], - 1 );
				const empty = unwrap( new Group() );
				assert.strictEqual( empty.charts.length, 0 );

			} );

			QUnit.test( 'deterministic output and bounded chart work', assert => {

				const results = [ 0, 1 ].map( () => unwrap( new Mesh( new PlaneGeometry( 1, 1, 40, 40 ) ), { mode: 'normal' } ) );
				verify( assert, results[ 0 ], 2 );
				const sizes = new Map();
				for ( const chart of results[ 0 ].meshes[ 0 ].faceCharts ) sizes.set( chart, ( sizes.get( chart ) || 0 ) + 1 );
				assert.ok( Array.from( sizes.values() ).every( count => count <= 2048 ) );
				assert.deepEqual( results[ 0 ].meshes[ 0 ].mesh.geometry.attributes.uv1.array, results[ 1 ].meshes[ 0 ].mesh.geometry.attributes.uv1.array );

			} );

			QUnit.test( 'dense lightmap planes retain packing efficiency with bounded chart work', assert => {

				const result = unwrap( new Mesh( new PlaneGeometry( 1, 1, 64, 64 ) ), { mode: 'lightmap' } );
				assert.strictEqual( result.charts.length, 1, 'An 8192-face plane stays in one chart' );
				assert.ok( verify( assert, result ).utilization > 0.98, 'Dense plane fills the atlas' );
				const larger = unwrap( new Mesh( new PlaneGeometry( 1, 1, 66, 66 ) ), { mode: 'lightmap' } );
				const sizes = new Map();
				for ( const chart of larger.meshes[ 0 ].faceCharts ) sizes.set( chart, ( sizes.get( chart ) || 0 ) + 1 );
				assert.false( sizes.has( - 1 ), 'All plane faces receive UVs' );
				assert.ok( Array.from( sizes.values() ).every( count => count <= 8192 ), 'Lightmap chart work remains bounded' );

			} );

			QUnit.test( 'authored cylinder seams remain distinct and valid islands retain their shape', assert => {

				const mesh = new Mesh( new CylinderGeometry( 1, 1, 6.4, 32, 1, true ) );
				const original = mesh.geometry.attributes.uv;
				const result = unwrap( mesh, { mode: 'normal', useInputUVs: true } );
				verify( assert, result, 2 );
				assert.strictEqual( result.charts.length, 1, 'The slit cylinder stays one connected island' );
				for ( let i = 0; i < mesh.geometry.attributes.uv.count; i ++ ) {

					const source = result.meshes[ 0 ].sourceVertices[ i ];
					assert.strictEqual( mesh.geometry.attributes.uv.getX( i ), original.getX( source ) );
					assert.strictEqual( mesh.geometry.attributes.uv.getY( i ), original.getY( source ) );

				}

				const bad = new PlaneGeometry();
				bad.attributes.uv.array.fill( 0 );
				verify( assert, unwrap( new Mesh( bad ), { mode: 'normal', useInputUVs: true } ), 2 );

			} );

			QUnit.test( 'near-zero area slivers are retained but excluded from the atlas', assert => {

				for ( const mode of [ 'lightmap', 'normal' ] ) {

					const root = new Group(), large = new Mesh( new PlaneGeometry( 10, 10 ) );
					const geometry = new BufferGeometry();
					geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0.5, 1e-12, 0 ], 3 ) );
					const sliver = new Mesh( geometry );
					root.add( large, sliver );
					const result = unwrap( root, { mode } );
					verify( assert, result, mode === 'normal' ? 2 : 1.5 );
					const record = result.meshes[ 1 ];
					assert.strictEqual( record.mesh.geometry.index.count, 3 );
					assert.deepEqual( record.faceCharts, new Int32Array( [ - 1 ] ) );
					assert.deepEqual( record.mesh.geometry.attributes.position.array, geometry.attributes.position.array );
					assert.ok( record.mesh.geometry.attributes.uv1.array.every( value => value === 0 ) );
					assert.strictEqual( result.meshes.reduce( ( sum, record ) => sum + record.faceCharts.filter( chart => chart === - 1 ).length, 0 ), 1 );

				}

			} );

			QUnit.test( 'ignored shared vertices are split and fully degenerate meshes retain topology', assert => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0.5, 1e-8, 0 ], 3 ) );
				geometry.setIndex( [ 0, 1, 2, 0, 1, 3 ] );
				const result = unwrap( new Mesh( geometry ) );
				verify( assert, result );
				const record = result.meshes[ 0 ];
				assert.deepEqual( record.faceCharts, new Int32Array( [ 0, - 1 ] ) );
				assert.strictEqual( record.mesh.geometry.index.count, 6 );
				assert.strictEqual( record.mesh.geometry.attributes.position.count, 6 );
				const degenerate = new BufferGeometry();
				degenerate.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ], 3 ) );
				const allIgnored = unwrap( new Mesh( degenerate ) );
				assert.strictEqual( allIgnored.charts.length, 0 );
				assert.strictEqual( allIgnored.meshes[ 0 ].faceCharts[ 0 ], - 1 );
				assert.strictEqual( allIgnored.meshes[ 0 ].mesh.geometry.index.count, 3 );

			} );

			QUnit.test( 'near-degenerate slivers from large coordinates are excluded', assert => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new BufferAttribute( new Float64Array( [ 0, 0, 0, 10000, 10000, 0, 10000, 10000.0001, 0 ] ), 3 ) );
				const result = unwrap( new Mesh( geometry ) );
				assert.strictEqual( result.charts.length, 0 );
				assert.strictEqual( result.meshes.reduce( ( sum, record ) => sum + record.faceCharts.filter( chart => chart === - 1 ).length, 0 ), 1 );
				assert.ok( result.meshes[ 0 ].mesh.geometry.attributes.uv1.array.every( value => value === 0 ) );

			} );

			QUnit.test( 'subtexel Float32 failures are excluded without weakening retained chart validation', assert => {

				const geometry = new BufferGeometry();
				geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0.5, 2e-5, 0 ], 3 ) );
				for ( const mode of [ 'lightmap', 'normal' ] ) {

					const root = new Group();
					root.add( new Mesh( new PlaneGeometry() ), new Mesh( geometry ) );
					const result = unwrap( root, { mode, texelsPerUnit: 0.001 } );
					verify( assert, result, mode === 'normal' ? 2 : 1.5 );
					assert.strictEqual( result.meshes.reduce( ( sum, record ) => sum + record.faceCharts.filter( chart => chart === - 1 ).length, 0 ), 1 );
					assert.strictEqual( result.meshes[ 1 ].faceCharts[ 0 ], - 1 );
					assert.strictEqual( result.meshes[ 1 ].mesh.geometry.index.count, 3 );
					assert.ok( result.meshes[ 1 ].mesh.geometry.attributes.uv1.array.every( value => value === 0 ) );

				}

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
				assert.ok( Math.abs( auditAtlas( result ).worldArea - 24 ) < 1e-6, 'Skin bind scale cancels mesh scale; root scale and morph remain' );
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
					const mesh = new Mesh( geometry );
					const result = unwrap( mesh );
					verify( assert, result );
					const restored = new ObjectLoader().parse( mesh.toJSON() ).geometry;
					assert.strictEqual( mesh.geometry.type, 'BufferGeometry' );
					assert.deepEqual( restored.index.array, mesh.geometry.index.array );
					for ( const name of Object.keys( mesh.geometry.attributes ) ) assert.deepEqual( restored.attributes[ name ].array, mesh.geometry.attributes[ name ].array );
					assert.deepEqual( restored.groups, mesh.geometry.groups );
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
					assert.ok( auditAtlas( result ).utilization > 0.71 );
					for ( const chart of result.charts ) assert.ok( chart.x + chart.width <= 1024 && chart.y + chart.height <= 1024 );

				}

			} );

			QUnit.test( 'result retains atlas metadata and vertex and face mappings', assert => {

				const result = unwrap( new Mesh( new BoxGeometry() ) );
				assert.deepEqual( Object.keys( result ), [ 'attribute', 'resolution', 'padding', 'texelsPerUnit', 'charts', 'meshes' ] );
				assert.deepEqual( Object.keys( result.meshes[ 0 ] ), [ 'mesh', 'sourceVertices', 'faceCharts' ] );
				assert.strictEqual( result.meshes[ 0 ].sourceVertices.length, result.meshes[ 0 ].mesh.geometry.attributes.position.count );
				assert.strictEqual( result.meshes[ 0 ].faceCharts.length, 12 );
				assert.deepEqual( Object.keys( result.charts[ 0 ] ), [ 'x', 'y', 'width', 'height' ] );

			} );

		} );

	} );

} );
