import { BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three/webgpu';
import { VertexLayout, simplifyGeometry, subdivideGeometry } from '../../../../examples/jsm/lighting/VertexLightMapper.js';

// the triangles around each edge, by the positions of its ends, and the length of the edges of one triangle

function edgeUses( geometry ) {

	const position = geometry.getAttribute( 'position' );
	const index = geometry.getIndex();
	const count = index !== null ? index.count : position.count;
	const key = ( i ) => [ position.getX( i ), position.getY( i ), position.getZ( i ) ].map( ( v ) => v.toFixed( 5 ) ).join();
	const uses = new Map();
	let boundary = 0;

	for ( let t = 0; t < count; t += 3 ) {

		for ( let e = 0; e < 3; e ++ ) {

			const i = index !== null ? index.getX( t + e ) : t + e;
			const j = index !== null ? index.getX( t + ( e + 1 ) % 3 ) : t + ( e + 1 ) % 3;
			const edge = [ key( i ), key( j ) ].sort().join( '|' );

			uses.set( edge, ( uses.get( edge ) ?? 0 ) + 1 );

		}

	}

	for ( const [ edge, n ] of uses ) {

		if ( n !== 1 ) continue;

		const [ a, b ] = edge.split( '|' ).map( ( p ) => new Vector3( ...p.split( ',' ).map( Number ) ) );
		boundary += a.distanceTo( b );

	}

	return { uses, boundary };

}

function maxEdge( geometry ) {

	const position = geometry.getAttribute( 'position' );
	const index = geometry.getIndex();
	const a = new Vector3(), b = new Vector3();
	let longest = 0;

	for ( let t = 0; t < index.count; t += 3 ) {

		for ( let e = 0; e < 3; e ++ ) {

			a.fromBufferAttribute( position, index.getX( t + e ) );
			b.fromBufferAttribute( position, index.getX( t + ( e + 1 ) % 3 ) );
			longest = Math.max( longest, a.distanceTo( b ) );

		}

	}

	return longest;

}

// the smallest angle of the triangles, in degrees

function minAngle( geometry ) {

	const position = geometry.getAttribute( 'position' );
	const index = geometry.getIndex();
	const p = [ new Vector3(), new Vector3(), new Vector3() ];
	let smallest = 180;

	for ( let t = 0; t < index.count; t += 3 ) {

		for ( let c = 0; c < 3; c ++ ) p[ c ].fromBufferAttribute( position, index.getX( t + c ) );

		for ( let c = 0; c < 3; c ++ ) {

			const u = p[ ( c + 1 ) % 3 ].clone().sub( p[ c ] ), v = p[ ( c + 2 ) % 3 ].clone().sub( p[ c ] );
			smallest = Math.min( smallest, u.angleTo( v ) * 180 / Math.PI );

		}

	}

	return smallest;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Lighting', () => {

		QUnit.module( 'VertexLightMapper', () => {

			QUnit.test( 'VertexLayout welds by position and normal', assert => {

				const material = new MeshBasicMaterial();

				// the faces of a box keep their own records at the hard edges

				const box = new Mesh( new BoxGeometry( 1, 1, 1 ), material );
				let layout = new VertexLayout( [ box ] );

				assert.strictEqual( layout.recordCount, 24, 'a record per corner of each face' );
				assert.strictEqual( layout.triangleCount, 12, 'all triangles' );
				assert.ok( Math.abs( layout.masses.reduce( ( a, b ) => a + b, 0 ) - 6 ) < 1e-5, 'the masses sum to the area' );

				// two quads that share an edge, in different meshes, and the flat triangles of non-indexed geometry

				const left = new Mesh( new PlaneGeometry( 1, 1 ), material );
				const right = new Mesh( new PlaneGeometry( 1, 1 ).toNonIndexed(), material );
				right.position.x = 1;

				layout = new VertexLayout( [ left, right ] );

				assert.strictEqual( layout.recordCount, 6, 'the shared edge and the split corners weld' );
				assert.strictEqual( layout.getRecord( left, 0, 1 ), layout.getRecord( right, 0, 0 ), 'the meshes share the records of their edge' );

				material.dispose();

			} );

			QUnit.test( 'VertexLayout gives the back of double-sided and open meshes records of their own', assert => {

				const front = new MeshBasicMaterial();
				const double = new MeshBasicMaterial( { side: DoubleSide } );

				const sheet = new Mesh( new PlaneGeometry( 1, 1 ), double );
				const plane = new Mesh( new PlaneGeometry( 1, 1 ), front );
				const box = new Mesh( new BoxGeometry( 1, 1, 1 ), front );
				plane.position.x = 2;
				box.position.x = 4;

				let layout = new VertexLayout( [ sheet, plane, box ], { doubleSided: true } );

				assert.ok( layout.hasBack( sheet ) && ! layout.hasBack( plane ) && ! layout.hasBack( box ), 'only the double-sided mesh has a back' );
				assert.strictEqual( layout.recordCount, 4 + 4 + 4 + 24, 'a second record per vertex of the double-sided mesh' );
				assert.strictEqual( layout.triangleCount, 4 + 2 + 12, 'and a triangle for the back of each of its faces' );
				assert.notStrictEqual( layout.getRecord( sheet, 0, 0, true ), layout.getRecord( sheet, 0, 0 ), 'the back has its own record' );
				assert.ok( Math.abs( layout.normals[ layout.getRecord( sheet, 0, 0, true ) * 3 + 2 ] + 1 ) < 1e-6, 'with the opposite normal' );
				assert.strictEqual( layout.getRecord( plane, 0, 0, true ), - 1, 'single-sided meshes have no back records' );

				layout = new VertexLayout( [ sheet, plane, box ], { doubleSided: true, openSurfaces: true } );

				assert.ok( layout.hasBack( plane ) && ! layout.hasBack( box ), 'open meshes get a back too, closed ones not' );

				front.dispose();
				double.dispose();

			} );

			QUnit.test( 'subdivideGeometry splits long edges without cracks', assert => {

				const plane = new PlaneGeometry( 4, 1 );
				const subdivided = subdivideGeometry( plane, 0.5 );

				assert.ok( maxEdge( subdivided ) <= 0.5 + 1e-6, 'no edge is longer than the maximum' );

				const { uses, boundary } = edgeUses( subdivided );

				assert.ok( [ ...uses.values() ].every( ( n ) => n <= 2 ), 'no edge is used by more than two triangles' );
				assert.ok( Math.abs( boundary - 10 ) < 1e-4, 'the boundary is the perimeter, there are no T-junctions' );
				assert.strictEqual( subdivided.getAttribute( 'uv' ).count, subdivided.getAttribute( 'position' ).count, 'the attributes are interpolated' );
				assert.strictEqual( subdivideGeometry( plane, 10 ), plane, 'short edges keep the geometry' );

				// the faces of a box are separate in the geometry, but meet at their edges

				const box = new BoxGeometry( 2, 1, 1 );
				const closed = edgeUses( subdivideGeometry( box, 0.3 ) );

				assert.ok( [ ...closed.uses.values() ].every( ( n ) => n === 2 ), 'the box stays closed, the faces split their shared edges alike' );

				plane.dispose();
				box.dispose();

			} );

			QUnit.test( 'subdivideGeometry splits marked edges once', assert => {

				const plane = new PlaneGeometry( 1, 1 );
				let calls = 0;

				// only the edges of the first vertex

				const split = ( i, j ) => {

					calls ++;
					return i === 0 || j === 0;

				};

				const refined = subdivideGeometry( plane, 0, { rounds: 1, split } );

				assert.ok( calls > 0, 'the predicate decides' );
				assert.strictEqual( refined.getIndex().count / 3, 4, 'the two edges of the first vertex split its triangle into three, the other one keeps its edges' );
				assert.ok( Math.abs( edgeUses( refined ).boundary - 4 ) < 1e-5, 'no T-junctions' );

				plane.dispose();

			} );

			QUnit.test( 'subdivideGeometry can split the longest edges too', assert => {

				// refinements toward a corner split the short edges there

				const corner = new Vector3( - 0.5, - 0.5, 0 );
				const refine = ( longest ) => {

					let geometry = subdivideGeometry( new PlaneGeometry( 1, 1 ), 0.3 );

					for ( let round = 0; round < 4; round ++ ) {

						const position = geometry.getAttribute( 'position' );
						const near = ( i ) => corner.distanceTo( new Vector3().fromBufferAttribute( position, i ) ) < 0.3;

						geometry = subdivideGeometry( geometry, 0, { rounds: 1, longest, split: ( i, j ) => near( i ) !== near( j ) || ( near( i ) && round < 2 ) } );

					}

					return geometry;

				};

				const thin = refine( false ), graded = refine( true );

				assert.ok( minAngle( thin ) < 20, 'splitting short edges alone makes thin triangles' );
				assert.ok( minAngle( graded ) > 44.9, 'the triangles of a grid keep their angles' );
				assert.ok( graded.getIndex().count > thin.getIndex().count, 'the longest edges split around the refinement' );
				assert.ok( Math.abs( edgeUses( graded ).boundary - 4 ) < 1e-5, 'no T-junctions' );

				thin.dispose();
				graded.dispose();

			} );

			QUnit.test( 'simplifyGeometry keeps the vertices of another geometry', async assert => {

				// constant values on a flat grid let the simplification remove all vertices but the corners

				const grid = new PlaneGeometry( 2, 2, 8, 8 );
				const values = new Float32Array( grid.getAttribute( 'position' ).count ).fill( 1 );

				const free = await simplifyGeometry( grid, values, { error: 0.01 } );
				assert.strictEqual( free.geometry.getIndex().count / 3, 2, 'two triangles remain' );

				const original = new PlaneGeometry( 2, 2, 2, 2 );
				const kept = await simplifyGeometry( grid, values, { error: 0.01, keep: original } );
				assert.strictEqual( kept.geometry.getAttribute( 'position' ).count, 9, 'the vertices of the coarser grid stay' );
				assert.strictEqual( await simplifyGeometry( grid, values, { error: 0.01, keep: grid } ), null, 'keeping all vertices removes none' );

				for ( const geometry of [ grid, original, free.geometry, kept.geometry ] ) geometry.dispose();

			} );

		} );

	} );

} );
