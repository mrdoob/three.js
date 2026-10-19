import http from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = path.resolve( process.argv[ 2 ] || '.' );
const output = process.argv[ 3 ] || 'unwrap-models.json';
const repetitions = Number( process.argv[ 4 ] || 3 );
const html = '<script type="importmap">{"imports":{"three":"/build/three.module.js","three/addons/":"/examples/jsm/"}}</script>';
const server = http.createServer( async ( request, response ) => {

	try {

		if ( request.url === '/' ) {

			response.setHeader( 'Content-Type', 'text/html' ); response.end( html ); return;

		}

		const filename = path.join( root, decodeURIComponent( request.url.split( '?' )[ 0 ] ) );
		response.setHeader( 'Content-Type', filename.endsWith( '.js' ) ? 'text/javascript' : 'application/octet-stream' );
		response.end( await readFile( filename ) );

	} catch {

		response.statusCode = 404; response.end();

	}

} );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
let browser;
try {

	browser = await puppeteer.launch( { headless: false, args: [ '--no-first-run' ] } );
	const page = await browser.newPage();
	await page.goto( `http://127.0.0.1:${ server.address().port }` );
	const gpu = await page.evaluate( () => {

		const gl = document.createElement( 'canvas' ).getContext( 'webgl2' );
		const extension = gl?.getExtension( 'WEBGL_debug_renderer_info' );
		return extension ? gl.getParameter( extension.UNMASKED_RENDERER_WEBGL ) : null;

	} );
	if ( ! gpu || /swiftshader|llvmpipe|lavapipe|software/i.test( gpu ) ) throw new Error( `Hardware GPU unavailable: ${ gpu }` );
	console.log( gpu );
	await page.evaluate( async () => {

		const THREE = await import( 'three' );
		const { GLTFLoader } = await import( 'three/addons/loaders/GLTFLoader.js' );
		const { DRACOLoader } = await import( 'three/addons/loaders/DRACOLoader.js' );
		const { OBJLoader } = await import( 'three/addons/loaders/OBJLoader.js' );
		const { unwrapUVs } = await import( 'three/addons/utils/unwrapUVs.js' );
		const { analyzeUVUnwrap } = await import( 'three/addons/utils/UVUnwrapDiagnostics.js' ).catch( () => ( {} ) );
		const draco = new DRACOLoader().setDecoderPath( '/examples/jsm/libs/draco/gltf/' );
		const gltf = new GLTFLoader().setDRACOLoader( draco );
		window.cleanup = () => draco.dispose();
		window.benchmark = async ( name, options, runs ) => {

			let model;
			if ( name === 'Torus knot' ) model = new THREE.Mesh( new THREE.TorusKnotGeometry( 1, 0.3, 128, 16 ) );
			else if ( name === 'Tube' ) model = new THREE.Mesh( new THREE.TubeGeometry( new THREE.CatmullRomCurve3( [ new THREE.Vector3( - 2, 0, 0 ), new THREE.Vector3( - 1, 1, 0 ), new THREE.Vector3( 1, - 1, 1 ), new THREE.Vector3( 2, 0, 0 ) ] ), 64, 0.3, 12, false ) );
			else model = name.endsWith( '.obj' ) ? await new OBJLoader().loadAsync( '/examples/models/' + name ) : ( await gltf.loadAsync( '/examples/models/gltf/' + name ) ).scene;
			const originals = [];
			model.traverse( mesh => {

				if ( mesh.isMesh ) originals.push( [ mesh, mesh.geometry ] );

			} );
			model.updateWorldMatrix( true, true );
			let sourceExcluded = 0;
			for ( const [ mesh, geometry ] of originals ) {

				mesh.updateMatrixWorld( true );
				if ( mesh.isSkinnedMesh ) {

					for ( const bone of mesh.skeleton.bones ) bone.updateWorldMatrix( true, false );
					mesh.skeleton.update();

				}

				const points = Array.from( { length: geometry.attributes.position.count }, ( _, i ) => mesh.getVertexPosition( i, new THREE.Vector3() ).applyMatrix4( mesh.matrixWorld ) );
				const count = geometry.index ? geometry.index.count : points.length;
				for ( let i = 0; i < count; i += 3 ) {

					const [ a, b, c ] = [ 0, 1, 2 ].map( offset => points[ geometry.index ? geometry.index.getX( i + offset ) : i + offset ] );
					const area = new THREE.Vector3().subVectors( b, a ).cross( new THREE.Vector3().subVectors( c, a ) ).length() * 0.5;
					const longest = Math.max( a.distanceToSquared( b ), b.distanceToSquared( c ), c.distanceToSquared( a ) );
					if ( ! ( area > longest * 1e-6 ) ) sourceExcluded ++;

				}

			}

			const times = []; let result;
			for ( let run = 0; run <= runs; run ++ ) {

				for ( const [ mesh, geometry ] of originals ) {

					if ( mesh.geometry !== geometry ) mesh.geometry.dispose(); mesh.geometry = geometry;

				}

				const start = performance.now(); result = unwrapUVs( model, { ...options, resolution: 2048 } );
				if ( run > 0 ) times.push( performance.now() - start );

			}

			if ( ! result ) return { model: name, ...options, times, sourceExcluded, error: 'Atlas packing or Float32 chart validation failed' };
			let triangles = 0, ignored = 0, invalid = 0, collapsed = 0;
			const counts = new Uint32Array( result.charts.length );
			for ( const record of result.meshes ) {

				const geometry = record.mesh.geometry, uv = geometry.attributes.uv1, index = geometry.index;
				triangles += record.faceCharts.length;
				for ( let face = 0; face < record.faceCharts.length; face ++ ) {

					const chart = record.faceCharts[ face ];
					if ( chart < 0 ) {

						ignored ++; continue;

					}

					counts[ chart ] ++;
					const ids = [ 0, 1, 2 ].map( offset => index.getX( face * 3 + offset ) );
					const coords = ids.map( vertex => [ uv.getX( vertex ), uv.getY( vertex ) ] );
					if ( coords.flat().some( x => ! Number.isFinite( x ) || x < 0 || x > 1 ) ) invalid ++;
					const [ a, b, c ] = coords;
					if ( Math.abs( ( b[ 0 ] - a[ 0 ] ) * ( c[ 1 ] - a[ 1 ] ) - ( b[ 1 ] - a[ 1 ] ) * ( c[ 0 ] - a[ 0 ] ) ) < 1e-18 ) collapsed ++;

				}

			}

			const diagnostics = analyzeUVUnwrap ? analyzeUVUnwrap( result, { maxStretch: options.mode === 'lightmap' ? 1.501 : 2.001 } ) : undefined;
			for ( const [ mesh, geometry ] of originals ) {

				mesh.geometry.dispose(); geometry.dispose();
				for ( const material of [].concat( mesh.material ) ) {

					for ( const value of Object.values( material ) ) if ( value?.isTexture ) value.dispose();
					material.dispose();

				}

			}

			times.sort( ( a, b ) => a - b );
			return { model: name, ...options, times, medianMs: times[ Math.floor( times.length / 2 ) ], triangles, charts: counts.length, singletons: counts.filter( count => count === 1 ).length, sourceExcluded, ignored, invalid, collapsed, texelsPerUnit: result.texelsPerUnit, diagnostics };

		};

	} );
	const models = process.argv[ 5 ] ? process.argv[ 5 ].split( ',' ) : [ 'DamagedHelmet/glTF/DamagedHelmet.gltf', 'Soldier.glb', 'Xbot.glb', 'LeePerrySmith/LeePerrySmith.glb', 'space_ship_hallway.glb', 'obj/walt/WaltHead.obj', 'obj/ninja/ninjaHead_Low.obj', 'obj/male02/male02.obj', 'obj/female02/female02.obj', 'obj/cerberus/Cerberus.obj', 'duck.glb', 'Horse.glb', 'Flamingo.glb', 'Parrot.glb', 'RobotExpressive/RobotExpressive.glb', 'Torus knot', 'Tube' ];
	const results = [];
	for ( const model of models ) for ( const mode of [ 'lightmap', 'normal' ] ) for ( const useInputUVs of [ false, true ] ) {

		try {

			results.push( await page.evaluate( ( name, options, runs ) => window.benchmark( name, options, runs ), model, { mode, useInputUVs }, repetitions ) );

		} catch ( error ) {

			results.push( { model, mode, useInputUVs, error: error.message } );

		}

		console.log( JSON.stringify( results.at( - 1 ) ) );
		await writeFile( output, JSON.stringify( { gpu, repetitions, results }, null, 2 ) );

	}

	await page.evaluate( () => window.cleanup() );

} finally {

	await browser?.close(); server.close();

}
