import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
	Bone, BoxGeometry, BufferAttribute, BufferGeometry, CylinderGeometry, Float16BufferAttribute, Float32BufferAttribute,
	Group, InstancedMesh, InterleavedBuffer, InterleavedBufferAttribute, Matrix4, Mesh, PlaneGeometry, Skeleton, SkinnedMesh, SphereGeometry,
	TorusGeometry, Uint16BufferAttribute, Vector3
} from 'three';
import { UVUnwrapper } from '../examples/jsm/utils/UVUnwrapper.js';
import { auditAtlas } from './benchmarks/uv-unwrapper/validate.js';

const unwrapper = new UVUnwrapper();

function verify( result, limit = 1.5 ) {

	const audit = auditAtlas( result );
	assert.equal( audit.overlaps, 0, 'No positive-area UV intersections' );
	assert.equal( audit.collapsed, 0, 'No collapsed or reversed nondegenerate triangles' );
	assert.equal( audit.paddingViolations, 0, 'Gutters preserved' );
	assert.ok( audit.maxStretch <= limit + 0.002, `Stretch ${ audit.maxStretch } within limit ${ limit }` );
	assert.ok( Math.abs( audit.worldArea - result.statistics.worldArea ) < Math.max( 1e-8, audit.worldArea * 1e-6 ) );
	assert.ok( Math.abs( audit.utilization - result.statistics.utilization ) < 1e-6 );
	return audit;

}

test( 'unique atlas for shared geometry under nested, mirrored, nonuniform transforms', () => {

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

	const result = unwrapper.unwrap( root );
	verify( result );
	assert.equal( result.meshes.length, 3 );
	assert.equal( new Set( result.meshes.map( r => r.geometry ) ).size, 3 );
	assert.equal( geometry.getAttribute( 'uv1' ), undefined );
	for ( const record of result.meshes ) {

		assert.notEqual( record.geometry, geometry );
		assert.deepEqual( record.geometry.groups, geometry.groups );

	}

} );

test( 'chart area normalization preserves common density on differently scaled planes', () => {

	const root = new Group();
	for ( const scale of [ 0.5, 1, 4 ] ) {

		const mesh = new Mesh( new PlaneGeometry( 1, 1, 4, 4 ) );
		mesh.scale.set( scale, scale * 2, 1 );
		root.add( mesh );

	}

	const result = unwrapper.unwrap( root, { resolution: 512, texelsPerUnit: 16 } );
	const audit = verify( result );
	assert.ok( Math.abs( audit.minDensity - 16 ) < 0.0001 && Math.abs( audit.maxDensity - 16 ) < 0.0001 );
	assert.equal( result.channel, 1 );

} );

test( 'conformal solve improves curved charts; sphere and torus remain valid', () => {

	let lightmap;
	for ( const mode of [ 'lightmap', 'normal' ] ) {

		const result = unwrapper.unwrap( new Mesh( new SphereGeometry( 1, 32, 16 ) ), { mode } );
		const audit = verify( result, mode === 'normal' ? 2 : 1.5 );
		if ( mode === 'lightmap' ) lightmap = result;
		else {

			assert.ok( result.charts.some( c => c.method === 'conformal' ) );
			assert.ok( result.charts.length < lightmap.charts.length );
			assert.ok( audit.maxStretch < lightmap.statistics.maxStretch );

		}

		verify( unwrapper.unwrap( new Mesh( new TorusGeometry( 1, 0.4, 12, 36 ) ), { mode } ), mode === 'normal' ? 2 : 1.5 );

	}

} );

test( 'seam splitting copies every attribute, morph, interleaved and normalized value', () => {

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
	const result = unwrapper.unwrap( new Mesh( geometry ), { mode: 'normal' } );
	verify( result, 2 );
	const record = result.meshes[ 0 ];
	for ( const [ name, original ] of Object.entries( geometry.attributes ) ) {

		const output = record.geometry.attributes[ name ];
		assert.equal( output.normalized, original.normalized );
		for ( let i = 0; i < output.count; i ++ ) {

			for ( let j = 0; j < output.itemSize; j ++ ) assert.equal( output.getComponent( i, j ), original.getComponent( record.sourceVertices[ i ], j ) );

		}

	}

	const morph = record.geometry.morphAttributes.position[ 0 ];
	for ( let i = 0; i < morph.count; i ++ ) assert.equal( morph.getX( i ), geometry.morphAttributes.position[ 0 ].getX( record.sourceVertices[ i ] ) );
	assert.equal( record.geometry.morphTargetsRelative, true );
	assert.deepEqual( record.geometry.drawRange, geometry.drawRange );
	assert.notEqual( record.geometry.attributes.uv.array, geometry.attributes.uv.array );
	assert.equal( unwrapper.unwrap( record.mesh, { attribute: 'uv' } ).meshes[ 0 ].geometry.attributes.tangent, undefined );

} );

test( 'preserves original triangle order, removes no faces, and handles nonindexed geometry', () => {

	const mesh = new Mesh( new BoxGeometry().toNonIndexed() );
	const original = mesh.geometry;
	const result = unwrapper.unwrap( mesh );
	verify( result );
	const output = mesh.geometry;
	assert.equal( output.index.count, original.attributes.position.count );
	for ( let i = 0; i < output.index.count; i ++ ) {

		const a = new Vector3().fromBufferAttribute( output.attributes.position, output.index.getX( i ) );
		const b = new Vector3().fromBufferAttribute( original.attributes.position, i );
		assert.ok( a.equals( b ) );

	}

} );

test( 'malformed input and atlas overflow fail before modifying any mesh', () => {

	for ( const invalid of [ NaN, - 1, Infinity ] ) assert.throws( () => unwrapper.unwrap( new Group(), { padding: invalid } ) );
	assert.throws( () => unwrapper.unwrap( new Group(), { mode: 'other' } ) );
	assert.throws( () => unwrapper.unwrap( new InstancedMesh( new BoxGeometry(), undefined, 2 ) ) );
	const root = new Group(), good = new Mesh( new BoxGeometry() ), bad = new Mesh( new BoxGeometry() );
	const original = good.geometry;
	bad.geometry.attributes.position.setX( 0, NaN );
	root.add( good, bad );
	assert.throws( () => unwrapper.unwrap( root ) );
	assert.equal( good.geometry, original );
	bad.geometry = new BoxGeometry();
	assert.throws( () => unwrapper.unwrap( root, { resolution: 16, padding: 7 } ) );
	assert.throws( () => unwrapper.unwrap( root, { texelsPerUnit: 100000 } ) );
	assert.equal( good.geometry, original );
	bad.geometry.setIndex( [ 0, 1, 1000 ] );
	bad.geometry.clearGroups();
	assert.throws( () => unwrapper.unwrap( root ), /index out of range/ );

} );

test( 'degenerate and nonmanifold triangles terminate, retain topology and report degeneracy', () => {

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, - 1, 0, 0, 0, 1 ], 3 ) );
	geometry.setIndex( [ 0, 1, 2, 1, 0, 3, 1, 0, 4, 0, 0, 0 ] );
	const result = unwrapper.unwrap( new Mesh( geometry ) );
	verify( result );
	assert.equal( result.statistics.degenerateTriangles, 1 );
	assert.equal( result.meshes[ 0 ].geometry.index.count, 12 );
	assert.equal( result.meshes[ 0 ].faceCharts[ 3 ], - 1 );
	const empty = unwrapper.unwrap( new Group() );
	assert.equal( empty.charts.length, 0 );

} );

test( 'deterministic output and configurable chart work bound', () => {

	const results = [ 0, 1 ].map( () => unwrapper.unwrap( new Mesh( new SphereGeometry( 1, 24, 12 ) ), { mode: 'normal', maxChartFaces: 32 } ) );
	verify( results[ 0 ], 2 );
	assert.ok( results[ 0 ].charts.every( c => c.faces.length <= 32 ) );
	assert.deepEqual( results[ 0 ].meshes[ 0 ].geometry.attributes.uv1.array, results[ 1 ].meshes[ 0 ].geometry.attributes.uv1.array );

} );

test( 'authored cylinder seams remain distinct and valid islands retain their shape', () => {

	const mesh = new Mesh( new CylinderGeometry( 1, 1, 6.4, 32, 1, true ) );
	const result = unwrapper.unwrap( mesh, { mode: 'normal', useInputUVs: true } );
	verify( result, 2 );
	assert.equal( result.charts.length, 1, 'The slit cylinder stays one connected island' );
	assert.equal( result.charts[ 0 ].method, 'input' );
	const original = result.meshes[ 0 ].originalGeometry.attributes.uv;
	for ( let i = 0; i < mesh.geometry.attributes.uv.count; i ++ ) {

		const source = result.meshes[ 0 ].sourceVertices[ i ];
		assert.equal( mesh.geometry.attributes.uv.getX( i ), original.getX( source ) );
		assert.equal( mesh.geometry.attributes.uv.getY( i ), original.getY( source ) );

	}

	const bad = new PlaneGeometry();
	bad.attributes.uv.array.fill( 0 );
	verify( unwrapper.unwrap( new Mesh( bad ), { mode: 'normal', useInputUVs: true } ), 2 );

} );

test( 'Float32 collapse is rejected atomically even when double precision flattening succeeds', () => {

	const root = new Group(), large = new Mesh( new PlaneGeometry( 10, 10 ) );
	root.add( large );
	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new Float32BufferAttribute( [ 0, 0, 0, 1, 0, 0, 0.5, 1e-12, 0 ], 3 ) );
	const sliver = new Mesh( geometry );
	root.add( sliver );
	const original = large.geometry;
	assert.throws( () => unwrapper.unwrap( root ), /Float32 atlas precision/ );
	assert.equal( large.geometry, original );
	assert.equal( sliver.geometry, geometry );

} );

test( 'skinned glTF bind matrices and morphs use rendered world area without altering the pose', () => {

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
	const result = unwrapper.unwrap( root );
	verify( result );
	assert.ok( Math.abs( result.statistics.worldArea - 24 ) < 1e-6, 'Skin bind scale cancels mesh scale; root scale and morph remain' );
	assert.equal( mesh.morphTargetInfluences[ 0 ], 0.5 );
	for ( let i = 0; i < mesh.geometry.attributes.position.count; i ++ ) {

		const source = result.meshes[ 0 ].sourceVertices[ i ];
		assert.ok( new Vector3().fromBufferAttribute( mesh.geometry.attributes.position, i ).equals( new Vector3().fromBufferAttribute( geometry.attributes.position, source ) ) );

	}

	assert.equal( bone.quaternion.w, 1 );

} );
