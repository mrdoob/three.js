import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
import { createServer } from '../../utils/server.js';

const server = createServer( { root: fileURLToPath( new URL( '../../', import.meta.url ) ) } );
await new Promise( resolve => server.listen( 0, '127.0.0.1', resolve ) );
const url = `http://127.0.0.1:${ server.address().port }/gpu-driven-updates`;
const systemChrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const executablePath = process.env.CHROME_EXECUTABLE || ( existsSync( systemChrome ) ? systemChrome : undefined );
let browser;

try {

	browser = await puppeteer.launch( { headless: true, executablePath, args: [ '--enable-unsafe-webgpu' ] } );
	const page = await browser.newPage();
	const errors = [];
	page.on( 'pageerror', error => errors.push( error.message ) );
	page.on( 'console', message => {

		if ( message.type() === 'error' ) errors.push( message.text() );

	} );
	await page.setRequestInterception( true );
	page.on( 'request', request => {

		if ( request.url() === url ) {

			request.respond( {
				contentType: 'text/html',
				body: `<!doctype html><link rel="icon" href="data:,"><script type="importmap">
{"imports":{"three":"/src/Three.WebGPU.js","three/webgpu":"/src/Three.WebGPU.js","three/tsl":"/src/Three.TSL.js","three/addons/":"/examples/jsm/"}}
</script>`
			} );

		} else {

			request.continue();

		}

	} );
	await page.goto( url );

	const result = await page.evaluate( async () => {

		const THREE = await import( 'three/webgpu' );
		const { attribute, materialReference, normalLocal, vec3 } = await import( 'three/tsl' );
		const { MeshletDrawingPipeline } = await import( 'three/addons/pipelines/MeshletDrawingPipeline.js' );
		const { VisibilityBufferDrawingPipeline } = await import( 'three/addons/pipelines/VisibilityBufferDrawingPipeline.js' );
		const renderer = new THREE.WebGPURenderer();
		await renderer.init();
		const gpuErrors = [];
		renderer.backend.device.addEventListener( 'uncapturederror', event => gpuErrors.push( event.error.message ) );
		const size = 64;
		renderer.setSize( size, size );
		const target = new THREE.RenderTarget( size, size );
		renderer.setRenderTarget( target );
		const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 100 );
		camera.position.z = 4;
		const scenarios = [];
		const pipelines = { render: 0, compute: 0 };

		for ( const [ method, key ] of [[ 'createRenderPipeline', 'render' ], [ 'createComputePipeline', 'compute' ]] ) {

			const original = renderer.backend[ method ];
			renderer.backend[ method ] = function ( ...args ) {

				pipelines[ key ] ++;
				return original.apply( this, args );

			};

		}

		const capture = async ( pipeline, scene, frames = 1, sample = false ) => {

			renderer.drawingPipeline = pipeline;

			for ( let i = 0; i < frames; i ++ ) {

				renderer.render( scene, camera );
				await renderer.backend.device.queue.onSubmittedWorkDone();

			}

			return renderer.readRenderTargetPixelsAsync( target, sample ? 28 : 0, sample ? 28 : 0, sample ? 8 : size, sample ? 8 : size );

		};

		for ( const Material of [ THREE.MeshStandardMaterial, THREE.MeshStandardNodeMaterial ] ) {

			const scene = new THREE.Scene();
			scene.add( new THREE.AmbientLight( 0xffffff, 1 ) );
			const geometry = new THREE.PlaneGeometry( 2, 2 );
			const material = new Material( { color: 0xff0000, emissive: 0x0000ff, emissiveIntensity: 0.1 } );
			scene.add( new THREE.Mesh( geometry, material ) );
			const pipeline = new MeshletDrawingPipeline( { lodThreshold: 0 } );
			renderer.drawingPipeline = pipeline;
			await renderer.compileAsync( scene, camera );
			const previous = await capture( pipeline, scene );
			const beforePipelines = { ...pipelines };
			material.color = new THREE.Color( 0x00ff00 );
			material.emissiveIntensity = 0.8;
			const actual = await capture( pipeline, scene );
			const afterPipelines = { ...pipelines };
			const expected = await capture( new THREE.StandardDrawingPipeline(), scene );
			let maxError = 0;
			for ( let i = 0; i < actual.length; i ++ ) maxError = Math.max( maxError, Math.abs( actual[ i ] - expected[ i ] ) );
			scenarios.push( { mode: Material.name, name: 'lit color and emissive intensity', maxError, changed: actual.some( ( value, i ) => value !== previous[ i ] ), stablePipelines: true, beforePipelines, afterPipelines } );
			pipeline.dispose();
			geometry.dispose();
			material.dispose();

		}

		for ( const mode of [ 'hardware', 'depth-prepass', 'visibility' ] ) {

			const pipeline = mode === 'visibility' ? new VisibilityBufferDrawingPipeline( { lodThreshold: 0, maxRasterSize: 64 } ) : new MeshletDrawingPipeline( { lodThreshold: 0, depthPrepass: mode === 'depth-prepass' } );
			const sample = mode === 'visibility';
			const scene = new THREE.Scene();
			const geometry = new THREE.PlaneGeometry( 2, 2, 4, 4 );
			const material = new THREE.MeshBasicNodeMaterial( { color: 0xff0000 } );
			const mesh = new THREE.Mesh( geometry, material );
			scene.add( mesh );
			renderer.drawingPipeline = pipeline;
			await renderer.compileAsync( scene, camera );
			let previous = await capture( pipeline, scene, 3, sample );

			const check = async ( name, mutate, stablePipelines = false, compile = false, nearest = false ) => {

				mutate();
				renderer.drawingPipeline = pipeline;
				if ( compile ) await renderer.compileAsync( scene, camera );
				const beforePipelines = { ...pipelines };
				const actual = await capture( pipeline, scene, 1, sample );
				const afterPipelines = { ...pipelines };
				const settled = await capture( pipeline, scene, 3, sample );
				const expected = await capture( new THREE.StandardDrawingPipeline(), scene, 1, sample );
				let maxError = 0;

				for ( let i = 0; i < actual.length; i ++ ) maxError = Math.max( maxError, Math.abs( actual[ i ] - expected[ i ] ), Math.abs( settled[ i ] - expected[ i ] ) );

				scenarios.push( {
					mode, name, maxError, changed: actual.some( ( value, i ) => value !== previous[ i ] ), stablePipelines, beforePipelines, afterPipelines,
					palettePreserved: nearest === false || actual.every( value => value === 0 || value === 255 ),
					filtersPreserved: nearest === false || ( material.map.minFilter === THREE.NearestFilter && material.map.magFilter === THREE.NearestFilter )
				} );
				previous = actual;

			};

			// New instance buffers can have the same version as those they replace.
			// Their contents must still be uploaded without rebuilding the pipelines.

			scene.remove( mesh );
			material.color.set( 0xffffff );
			const instanced = new THREE.InstancedMesh( geometry, material, 2 );
			const matrix = new THREE.Matrix4();
			instanced.setMatrixAt( 0, matrix.makeTranslation( - 0.6, 0, 0 ) );
			instanced.setMatrixAt( 1, matrix.makeTranslation( 0.6, 0, 0 ) );
			instanced.instanceMatrix.needsUpdate = true;
			const matrices = instanced.instanceMatrix.array.slice();
			scene.add( instanced );
			renderer.drawingPipeline = pipeline;
			await renderer.compileAsync( scene, camera );
			previous = await capture( pipeline, scene, 3, sample );
			await check( 'instanceMatrix replacement at the same version', () => {

				const replacement = new THREE.InstancedBufferAttribute( matrices.slice(), 16 );
				for ( let i = 0; i < replacement.count; i ++ ) replacement.setComponent( i, 12, 20 );
				replacement.needsUpdate = true;
				instanced.instanceMatrix = replacement;
				instanced.computeBoundingSphere();

			}, true );
			await check( 'restore instanceMatrix at the same version', () => {

				instanced.instanceMatrix = new THREE.InstancedBufferAttribute( matrices.slice(), 16 );
				instanced.instanceMatrix.needsUpdate = true;
				instanced.computeBoundingSphere();

			}, true );

			instanced.setColorAt( 0, new THREE.Color( 0xff0000 ) );
			instanced.setColorAt( 1, new THREE.Color( 0x0000ff ) );
			instanced.instanceColor.needsUpdate = true;
			material.needsUpdate = true;
			renderer.drawingPipeline = pipeline;
			await renderer.compileAsync( scene, camera );
			previous = await capture( pipeline, scene, 3, sample );
			await check( 'instanceColor replacement at the same version', () => {

				instanced.instanceColor = new THREE.InstancedBufferAttribute( new Float32Array( [ 0, 1, 0, 0, 1, 0 ] ), 3 );
				instanced.instanceColor.needsUpdate = true;

			}, true );

			const instanceGroup = new THREE.BundleGroup();
			instanceGroup.add( instanced );
			scene.add( instanceGroup );
			renderer.drawingPipeline = pipeline;
			await renderer.compileAsync( scene, camera );
			previous = await capture( pipeline, scene, 3, sample );
			await check( 'static group instanceMatrix replacement', () => {

				const replacement = new THREE.InstancedBufferAttribute( matrices.slice(), 16 );
				for ( let i = 0; i < replacement.count; i ++ ) replacement.setComponent( i, 12, 20 );
				replacement.needsUpdate = true;
				instanced.instanceMatrix = replacement;
				instanced.computeBoundingSphere();
				instanceGroup.needsUpdate = true;

			} );
			await check( 'static group matrix and color replacement', () => {

				instanced.instanceMatrix = new THREE.InstancedBufferAttribute( matrices.slice(), 16 );
				instanced.instanceMatrix.needsUpdate = true;
				instanced.instanceColor = new THREE.InstancedBufferAttribute( new Float32Array( [ 1, 0, 0, 1, 0, 0 ] ), 3 );
				instanced.instanceColor.needsUpdate = true;
				instanced.computeBoundingSphere();
				instanceGroup.needsUpdate = true;

			} );
			scene.add( instanced );
			scene.remove( instanceGroup );

			instanced.instanceColor = null;
			geometry.setAttribute( 'instanceTint', new THREE.InstancedBufferAttribute( new Float32Array( [ 1, 0, 0, 0, 0, 1 ] ), 3 ) );
			geometry.attributes.instanceTint.needsUpdate = true;
			material.colorNode = attribute( 'instanceTint', 'vec3' );
			material.needsUpdate = true;
			renderer.drawingPipeline = pipeline;
			await renderer.compileAsync( scene, camera );
			previous = await capture( pipeline, scene, 3, sample );
			await check( 'instanced attribute replacement at the same version', () => {

				const replacement = new THREE.InstancedBufferAttribute( new Float32Array( [ 0, 1, 0, 0, 1, 0 ] ), 3 );
				replacement.needsUpdate = true;
				geometry.setAttribute( 'instanceTint', replacement );

			} );

			scene.remove( instanced );
			instanced.dispose();
			geometry.deleteAttribute( 'instanceTint' );
			material.colorNode = null;
			material.color.set( 0xff0000 );
			material.needsUpdate = true;
			scene.add( mesh );
			previous = await capture( pipeline, scene, 1, sample );

			await check( 'color mutation', () => material.color.set( 0x00ff00 ), true );
			await check( 'color replacement', () => material.color = new THREE.Color( 0x0000ff ), true );

			material.roughness = 1;
			material.colorNode = vec3( materialReference( 'roughness', 'float' ) );
			material.needsUpdate = true;
			previous = await capture( pipeline, scene, 1, sample );
			await check( 'scalar uniform', () => material.roughness = 0.2, true );

			const maps = [ 0xff0000, 0x00ff00 ].map( color => {

				const texture = new THREE.DataTexture( new Uint8Array( [ color >> 16, ( color >> 8 ) & 255, color & 255, 255 ] ), 1, 1 );
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;
				texture.needsUpdate = true;
				return texture;

			} );
			material.colorNode = null;
			material.color.set( 0xffffff );
			material.map = maps[ 0 ];
			material.needsUpdate = true;
			previous = await capture( pipeline, scene, 1, sample );
			await check( 'texture replacement', () => material.map = maps[ 1 ], true );

			for ( const type of [ THREE.UnsignedByteType, THREE.FloatType ] ) {

				// A pixel-art pattern detects accidental linear filtering as well as missing samplers.
				// DataTexture's default nearest filters are kept, including for RGBA32F textures.

				const nearestMaps = [ 0, 1 ].map( palette => {

					const ArrayType = type === THREE.FloatType ? Float32Array : Uint8Array;
					const data = new ArrayType( 4 * 4 * 4 );
					const value = type === THREE.FloatType ? 1 : 255;

					for ( let y = 0; y < 4; y ++ ) {

						for ( let x = 0; x < 4; x ++ ) {

							const offset = ( y * 4 + x ) * 4;
							const odd = ( x + y ) % 2 === 1;
							data.set( palette === 0 ? [ odd ? value : 0, 0, odd ? 0 : value, value ] : [ odd ? value : 0, value, odd ? value : 0, value ], offset );

						}

					}

					const texture = new THREE.DataTexture( data, 4, 4, THREE.RGBAFormat, type );
					texture.wrapS = THREE.RepeatWrapping;
					texture.wrapT = THREE.MirroredRepeatWrapping;
					texture.repeat.set( 2.25, 1.75 );
					texture.offset.set( 0.13, - 0.19 );
					texture.needsUpdate = true;
					return texture;

				} );
				maps.push( ...nearestMaps );
				material.map = nearestMaps[ 0 ];
				material.needsUpdate = true;
				renderer.drawingPipeline = pipeline;
				await renderer.compileAsync( scene, camera );
				previous = await capture( pipeline, scene, 1, sample );
				await check( `nearest ${ type === THREE.FloatType ? 'float' : 'byte' } texture replacement`, () => material.map = nearestMaps[ 1 ], true, false, true );

			}

			material.map = null;
			material.alphaTest = 0.5;
			material.needsUpdate = true;
			previous = await capture( pipeline, scene, 3, sample );
			await check( 'alpha opacity', () => material.opacity = 0.2, true );
			await check( 'alpha threshold', () => material.alphaTest = 0.1, true );

			material.opacity = 1;
			material.alphaTest = 0;
			material.needsUpdate = true;
			previous = await capture( pipeline, scene, 1, sample );
			await check( 'translate out of view', () => geometry.translate( 10, 0, 0 ) );
			await check( 'translate into view', () => geometry.translate( - 10, 0, 0 ), false, true );

			const positions = geometry.attributes.position;
			await check( 'position attribute replacement', () => {

				const replacement = positions.clone();
				for ( let i = 0; i < replacement.count; i ++ ) replacement.setX( i, replacement.getX( i ) + 10 );
				geometry.setAttribute( 'position', replacement );

			} );
			await check( 'restore position attribute', () => geometry.setAttribute( 'position', positions ) );

			const indices = geometry.index.array.slice();
			await check( 'index mutation', () => {

				for ( let i = 0; i < indices.length; i += 3 ) {

					geometry.index.setX( i + 1, indices[ i + 2 ] );
					geometry.index.setX( i + 2, indices[ i + 1 ] );

				}

				geometry.index.needsUpdate = true;

			} );
			await check( 'index replacement', () => geometry.setIndex( new THREE.BufferAttribute( indices, 1 ) ), false, true );

			const data = new THREE.InterleavedBuffer( new Float32Array( positions.count * 4 ), 4 );
			const interleaved = new THREE.InterleavedBufferAttribute( data, 3, 0 );
			for ( let i = 0; i < positions.count; i ++ ) interleaved.setXYZ( i, positions.getX( i ), positions.getY( i ), positions.getZ( i ) );
			geometry.setAttribute( 'position', interleaved );
			previous = await capture( pipeline, scene, 1, sample );
			await check( 'interleaved position mutation', () => {

				for ( let i = 0; i < interleaved.count; i ++ ) interleaved.setX( i, interleaved.getX( i ) + 10 );
				interleaved.needsUpdate = true;

			} );
			await check( 'restore interleaved positions', () => {

				for ( let i = 0; i < interleaved.count; i ++ ) interleaved.setX( i, interleaved.getX( i ) - 10 );
				interleaved.needsUpdate = true;

			} );

			const tint = new THREE.Float32BufferAttribute( new Float32Array( positions.count * 3 ), 3 );
			for ( let i = 0; i < tint.count; i ++ ) tint.setXYZ( i, 1, 0, 0 );
			geometry.setAttribute( 'tint', tint );
			material.colorNode = attribute( 'tint', 'vec3' );
			material.needsUpdate = true;
			previous = await capture( pipeline, scene, 1, sample );
			await check( 'custom attribute mutation', () => {

				for ( let i = 0; i < tint.count; i ++ ) tint.setXYZ( i, 0, 1, 0 );
				tint.needsUpdate = true;

			} );

			material.colorNode = normalLocal.mul( 0.5 ).add( 0.5 );
			material.needsUpdate = true;
			previous = await capture( pipeline, scene, 1, sample );
			await check( 'normal attribute mutation', () => {

				const normals = geometry.attributes.normal;
				for ( let i = 0; i < normals.count; i ++ ) normals.setXYZ( i, 1, 0, 0 );
				normals.needsUpdate = true;

			} );

			// The same geometry has meshlets for the full mesh and each material group.

			geometry.addGroup( 0, indices.length / 2, 0 );
			geometry.addGroup( indices.length / 2, indices.length / 2, 1 );
			const grouped = new THREE.Mesh( geometry, [ material, material ] );
			grouped.position.z = 0.1;
			scene.add( grouped );
			previous = await capture( pipeline, scene, 4, sample );
			await check( 'shared geometry and material groups', () => geometry.translate( 10, 0, 0 ), false, true );
			await check( 'restore shared geometry', () => geometry.translate( - 10, 0, 0 ), false, true );

			pipeline.dispose();
			geometry.dispose();
			material.dispose();
			for ( const map of maps ) map.dispose();

		}

		renderer.drawingPipeline = new THREE.StandardDrawingPipeline();
		target.dispose();
		renderer.dispose();
		return { scenarios, gpuErrors };

	} );

	assert.deepEqual( result.gpuErrors, [] );
	assert.deepEqual( errors, [] );
	for ( const scenario of result.scenarios ) {

		const label = `${ scenario.mode }: ${ scenario.name }`;
		assert.equal( scenario.maxError, 0, `${ label } must match conventional rendering on the first and subsequent frames.` );
		assert.equal( scenario.changed, true, `${ label } must change the rendered pixels.` );
		if ( scenario.palettePreserved !== undefined ) assert.equal( scenario.palettePreserved, true, `${ label } must keep the nearest-filtered palette without interpolated colors.` );
		if ( scenario.filtersPreserved !== undefined ) assert.equal( scenario.filtersPreserved, true, `${ label } must preserve the texture's nearest filters.` );
		if ( scenario.stablePipelines ) assert.deepEqual( scenario.afterPipelines, scenario.beforePipelines, `${ label } must reuse its pipelines.` );

	}

	console.log( `GPU-driven updates passed: ${ result.scenarios.length } material and geometry updates, hardware, depth prepass and visibility buffer, unchanged pipelines for material uniforms.` );

} finally {

	await browser?.close();
	await new Promise( resolve => server.close( resolve ) );

}
