/**
 * Benchmark: BufferGeometry.computeBoundingSphere() fast path vs the previous
 * implementation (per-vertex Vector3.fromBufferAttribute access).
 *
 * Run with: node test/benchmark/computeBoundingSphere.js
 */

import { BufferGeometry } from '../../src/core/BufferGeometry.js';
import { BufferAttribute } from '../../src/core/BufferAttribute.js';
import { Box3 } from '../../src/math/Box3.js';
import { Sphere } from '../../src/math/Sphere.js';
import { Vector3 } from '../../src/math/Vector3.js';

const _box = new Box3();
const _vector = new Vector3();

// faithful copy of the previous implementation (no morph targets)

function computeBoundingSphereOld( geometry ) {

	const sphere = new Sphere();
	const position = geometry.attributes.position;
	const center = sphere.center;

	// old Box3.setFromBufferAttribute path

	_box.makeEmpty();

	for ( let i = 0, il = position.count; i < il; i ++ ) {

		_box.expandByPoint( _vector.fromBufferAttribute( position, i ) );

	}

	_box.getCenter( center );

	let maxRadiusSq = 0;

	for ( let i = 0, il = position.count; i < il; i ++ ) {

		_vector.fromBufferAttribute( position, i );

		maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( _vector ) );

	}

	sphere.radius = Math.sqrt( maxRadiusSq );

	return sphere;

}

function makeGeometry( vertexCount ) {

	const array = new Float32Array( vertexCount * 3 );

	for ( let i = 0; i < array.length; i ++ ) {

		array[ i ] = Math.random() * 200 - 100;

	}

	const geometry = new BufferGeometry();
	geometry.setAttribute( 'position', new BufferAttribute( array, 3 ) );

	return geometry;

}

function bench( fn, iterations ) {

	const times = [];

	for ( let i = 0; i < iterations; i ++ ) {

		const start = performance.now();
		fn();
		times.push( performance.now() - start );

	}

	times.sort( ( a, b ) => a - b );

	return times[ Math.floor( times.length / 2 ) ]; // median

}

const sizes = [ 10_000, 100_000, 1_000_000, 5_000_000 ];
const iterations = 20;

console.log( `median of ${ iterations } runs per case\n` );
console.log( 'vertices'.padStart( 10 ), 'old (ms)'.padStart( 12 ), 'new (ms)'.padStart( 12 ), 'speedup'.padStart( 10 ) );

for ( const size of sizes ) {

	const geometry = makeGeometry( size );

	// correctness check

	const oldSphere = computeBoundingSphereOld( geometry );
	geometry.computeBoundingSphere();
	const newSphere = geometry.boundingSphere;

	if ( Math.abs( oldSphere.radius - newSphere.radius ) > 1e-10 ||
		oldSphere.center.distanceTo( newSphere.center ) > 1e-10 ) {

		console.error( `MISMATCH at ${ size } vertices: old`, oldSphere, 'new', newSphere );
		process.exit( 1 );

	}

	// warmup

	for ( let i = 0; i < 3; i ++ ) {

		computeBoundingSphereOld( geometry );
		geometry.computeBoundingSphere();

	}

	const oldMs = bench( () => computeBoundingSphereOld( geometry ), iterations );
	const newMs = bench( () => geometry.computeBoundingSphere(), iterations );

	console.log(
		String( size ).padStart( 10 ),
		oldMs.toFixed( 3 ).padStart( 12 ),
		newMs.toFixed( 3 ).padStart( 12 ),
		( oldMs / newMs ).toFixed( 2 ).padStart( 9 ) + 'x'
	);

}
