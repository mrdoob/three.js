import * as MikkTSpace from '../../../../examples/jsm/libs/mikktspace.module.js';

// The WebAssembly build embedded in mikktspace.module.js is compiled from the JavaScript
// port in the same file: an edit to the port without a rebuild makes the two disagree,
// which is what these tests catch. The tangents match to the last bit on V8 and on
// JavaScriptCore; an engine whose Math.acos rounds a corner angle the other way may
// move a component by one float32 ulp, never the handedness.

const generateMesh = ( triangles ) => {

	let s = 0x2545f491;
	const random = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ( s >>> 0 ) / 4294967296; };

	const position = new Float32Array( triangles * 9 ), normal = new Float32Array( triangles * 9 ), texcoord = new Float32Array( triangles * 6 );

	for ( let t = 0; t < triangles; t ++ ) {

		const cx = random() * 10, cy = random() * 10, cz = random() * 10;

		for ( let c = 0; c < 3; c ++ ) {

			const i = t * 3 + c;
			position[ i * 3 ] = cx + random(); position[ i * 3 + 1 ] = cy + random(); position[ i * 3 + 2 ] = cz + random();
			const nx = random() - 0.5, ny = random() - 0.5, nz = random() - 0.5, l = Math.hypot( nx, ny, nz );
			normal[ i * 3 ] = nx / l; normal[ i * 3 + 1 ] = ny / l; normal[ i * 3 + 2 ] = nz / l;
			texcoord[ i * 2 ] = random(); texcoord[ i * 2 + 1 ] = random();

		}

	}

	// Shared and mirrored corners exercise welding and orientation groups.
	for ( let t = 1; t < triangles; t += 4 ) {

		for ( let k = 0; k < 8; k ++ ) position[ t * 9 + k ] = position[ ( t - 1 ) * 9 + k ];
		for ( let k = 0; k < 6; k ++ ) texcoord[ t * 6 + k ] = texcoord[ ( t - 1 ) * 6 + k ];
		texcoord[ t * 6 + 1 ] = 1 - texcoord[ t * 6 + 1 ];

	}

	return { position, normal, texcoord };

};

const ulps = ( a, b ) => {

	const va = new Int32Array( new Float32Array( [ a ] ).buffer )[ 0 ], vb = new Int32Array( new Float32Array( [ b ] ).buffer )[ 0 ];
	return Math.abs( va - vb );

};

export default QUnit.module( 'Libs', () => {

	QUnit.module( 'MikkTSpace', () => {

		QUnit.test( 'the JavaScript port and its WebAssembly build agree', async ( assert ) => {

			const mesh = generateMesh( 4000 );

			MikkTSpace.dispose();
			const js = MikkTSpace.generateTangents( mesh.position, mesh.normal, mesh.texcoord );

			const wasm = await MikkTSpace.ready;
			assert.ok( wasm, 'the WebAssembly build instantiates in this engine' );
			const compiled = MikkTSpace.generateTangents( mesh.position, mesh.normal, mesh.texcoord );

			assert.strictEqual( compiled.length, js.length, 'the same number of components' );

			let differing = 0, worst = 0, signs = 0;

			for ( let i = 0; i < js.length; i ++ ) {

				if ( compiled[ i ] === js[ i ] ) continue;
				if ( i % 4 === 3 ) signs ++;
				differing ++;
				worst = Math.max( worst, ulps( compiled[ i ], js[ i ] ) );

			}

			assert.strictEqual( signs, 0, 'the handedness agrees everywhere' );
			assert.ok( worst <= 1, `components differ by at most one float32 ulp (${ differing } of ${ js.length } differ, the worst by ${ worst })` );
			if ( differing > 0 ) console.log( `MikkTSpace: ${ differing } of ${ js.length } tangent components differ between JavaScript and WebAssembly by one float32 ulp in this engine` );

			MikkTSpace.dispose();

		} );

		QUnit.test( 'before ready, after dispose, and where the input is not the wasm\'s, the JavaScript answers', async ( assert ) => {

			const mesh = generateMesh( 20 );
			const js = MikkTSpace.generateTangents( mesh.position, mesh.normal, mesh.texcoord );

			await MikkTSpace.ready;
			MikkTSpace.dispose();
			assert.deepEqual( Array.from( MikkTSpace.generateTangents( mesh.position, mesh.normal, mesh.texcoord ) ), Array.from( js ), 'after dispose, the JavaScript\'s tangents' );

			assert.strictEqual( MikkTSpace.generateTangents( new Float32Array( 0 ), new Float32Array( 0 ), new Float32Array( 0 ) ).length, 0, 'empty input' );
			assert.throws( () => MikkTSpace.generateTangents( new Float32Array( 9 ), new Float32Array( 9 ), new Float32Array( 4 ) ), /matching/, 'mismatched attributes throw as before' );

		} );

	} );

} );
