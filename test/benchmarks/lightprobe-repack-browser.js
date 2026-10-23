import * as THREE from 'three/webgpu';
import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';

// Open lightprobe-repack.html, or run node test/benchmarks/lightprobe-repack.js.
// Timings are sustained throughput, never individual-frame or GPU-pass timings.
const output = document.getElementById( 'results' );
const absoluteTolerance = 1e-4;
const relativeTolerance = 2e-3;
const results = { absoluteTolerance, relativeTolerance, accuracy: [], throughput: [] };

function log( message ) {

	output.textContent += '\n' + message;
	console.log( message );

}

function compare( name, reference, actual ) {

	let maxAbsoluteError = 0, differingComponents = 0;

	for ( let i = 0; i < reference.length; i ++ ) {

		const a = THREE.DataUtils.fromHalfFloat( reference[ i ] );
		const b = THREE.DataUtils.fromHalfFloat( actual[ i ] );
		const error = Math.abs( a - b );

		if ( ! Number.isFinite( a ) || ! Number.isFinite( b ) || error > absoluteTolerance + relativeTolerance * Math.max( Math.abs( a ), Math.abs( b ) ) ) {

			throw new Error( `${ name }: component ${ i }: raster=${ a }, compute=${ b }` );

		}

		maxAbsoluteError = Math.max( maxAbsoluteError, error );
		if ( reference[ i ] !== actual[ i ] ) differingComponents ++;

	}

	const result = { name, components: reference.length, maxAbsoluteError, differingComponents };
	results.accuracy.push( result );
	log( JSON.stringify( result ) );

}

async function run() {

	const adapter = await navigator.gpu?.requestAdapter( { powerPreference: 'high-performance' } );
	if ( ! adapter ) throw new Error( 'A hardware WebGPU adapter is required.' );
	const info = adapter.info;
	results.adapter = { vendor: info.vendor, architecture: info.architecture, device: info.device, description: info.description, isFallbackAdapter: info.isFallbackAdapter };
	if ( info.isFallbackAdapter || /swiftshader|llvmpipe|lavapipe|software/i.test( JSON.stringify( results.adapter ) ) ) throw new Error( 'Software adapters are not supported.' );
	log( JSON.stringify( results.adapter ) );

	const renderer = new THREE.WebGPURenderer();
	await renderer.init();
	renderer._animation.stop();
	renderer.shadowMap.enabled = true;
	const device = renderer.backend.device;
	const errors = [];
	device.addEventListener( 'uncapturederror', event => errors.push( event.error.message ) );

	function atlasLayout( grid ) {

		const target = grid._renderTarget;
		const bytesPerRow = Math.ceil( target.width * 8 / 256 ) * 256;
		return { target, bytesPerRow, size: bytesPerRow * target.height * target.depth };

	}

	function fillAtlas( grid ) {

		const { target, bytesPerRow, size } = atlasLayout( grid );
		const data = new Uint16Array( size / 2 );
		data.fill( THREE.DataUtils.toHalfFloat( 0.125 ) );
		device.queue.writeTexture( { texture: renderer.backend.get( target.texture ).texture }, data, { bytesPerRow, rowsPerImage: target.height }, [ target.width, target.height, target.depth ] );

	}

	async function readAtlas( grid ) {

		const { target, bytesPerRow, size } = atlasLayout( grid );
		const buffer = device.createBuffer( { size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ } );
		const encoder = device.createCommandEncoder();
		encoder.copyTextureToBuffer( { texture: renderer.backend.get( target.texture ).texture }, { buffer, bytesPerRow, rowsPerImage: target.height }, [ target.width, target.height, target.depth ] );
		device.queue.submit( [ encoder.finish() ] );
		await buffer.mapAsync( GPUMapMode.READ );
		const padded = new Uint16Array( buffer.getMappedRange() );
		const data = new Uint16Array( target.width * target.height * target.depth * 4 );

		for ( let row = 0; row < target.height * target.depth; row ++ ) {

			data.set( padded.subarray( row * bytesPerRow / 2, row * bytesPerRow / 2 + target.width * 4 ), row * target.width * 4 );

		}

		buffer.unmap();
		buffer.destroy();
		return data;

	}

	async function measure( operation, milliseconds, batchSize ) {

		await device.queue.onSubmittedWorkDone();
		const start = performance.now();
		let completed = 0;

		do {

			for ( let i = 0; i < batchSize; i ++ ) operation();
			await device.queue.onSubmittedWorkDone();
			completed += batchSize;

		} while ( performance.now() - start < milliseconds );

		const elapsed = performance.now() - start;
		return { completed, elapsed, operationsPerSecond: completed * 1000 / elapsed };

	}

	const cases = [
		{ model: 'room', resolution: [ 6, 6, 6 ] },
		{ model: 'room', resolution: [ 14, 7, 7 ] },
		{ model: 'room', resolution: [ 5, 3, 4 ], accuracyOnly: true },
		{ model: 'room', resolution: [ 2, 2, 2 ], accuracyOnly: true }
	];

	for ( const config of cases ) {

		const room = new THREE.Group();
		const colors = [ 0xffffff, 0x884422, 0x224488 ];
		for ( let i = 0; i < 3; i ++ ) {

			const mesh = new THREE.Mesh( new THREE.BoxGeometry( 1 + i, 1 + i, 1 ), new THREE.MeshStandardMaterial( { color: colors[ i ] } ) );
			mesh.position.set( i * 2 - 2, i, i - 1 );
			room.add( mesh );

		}

		const light = new THREE.PointLight( 0xffffff, 30 );
		light.position.set( 0, 5, 3 );
		room.add( light );
		const gltf = { scene: room };
		const scene = new THREE.Scene();
		scene.add( gltf.scene );
		gltf.scene.traverse( object => {

			if ( object.isMesh ) object.castShadow = object.receiveShadow = true;
			if ( object.isLight && object.shadow ) {

				object.castShadow = true;
				object.shadow.mapSize.setScalar( 256 );

			}

		} );
		const bounds = new THREE.Box3().setFromObject( gltf.scene );
		const size = bounds.getSize( new THREE.Vector3() ).multiplyScalar( 0.95 );
		const grid = new LightProbeGrid( size.x, size.y, size.z, ...config.resolution );
		grid.position.copy( bounds.getCenter( new THREE.Vector3() ) );
		grid.multiBounce = true;
		const name = `${ config.model } ${ config.resolution.join( 'x' ) }`;
		const count = config.resolution.reduce( ( a, b ) => a * b );
		const options = { cubemapSize: 32, near: 0.05, far: size.length() * 2 };

		// A direct bake populates the same projection texture read by both paths.
		grid.useComputeRepack = false;
		grid.bake( renderer, scene, options );
		await device.queue.onSubmittedWorkDone();
		// The bake disables clearing before packing partial atlas viewports.
		renderer.autoClear = false;

		const nx = config.resolution[ 0 ], nz = config.resolution[ 2 ];
		const ranges = [[ 0, count ], [ 0, 1 ], [ count - 1, count ], [ 1, count - 1 ], [ nx - 1, nx + 1 ], [ nx * nz - 1, nx * nz + 1 ], [ 0, 0 ]];

		for ( const [ start, end ] of ranges ) {

			fillAtlas( grid );
			grid._repackProbesRaster( renderer, start, end );
			const raster = await readAtlas( grid );
			fillAtlas( grid );
			grid._repackProbesCompute( renderer, start, end );
			const compute = await readAtlas( grid );
			compare( `${ name } range [${ start }, ${ end }) including padding / untouched texels`, raster, compute );

		}

		renderer.setRenderTarget( null );

		// Exercise the compute-written atlas as the input to later bounce passes.
		for ( const useCompute of [ false, true ] ) {

			grid.useComputeRepack = useCompute;
			grid.bake( renderer, scene, { ...options, bounces: 3 } );
			const atlas = await readAtlas( grid );
			if ( useCompute === false ) config.reference = atlas;
			else compare( `${ name } complete four-pass bake`, config.reference, atlas );

		}

		if ( ! config.accuracyOnly && ! new URLSearchParams( location.search ).has( 'accuracyOnly' ) ) {

			for ( const kind of [ 'repack', 'bake' ] ) {

				for ( const useCompute of [ false, true ] ) {

					grid.useComputeRepack = useCompute;
					const operation = kind === 'repack' ? () => grid._repackProbes( renderer, 0, count ) : () => {

						// A bake is normally requested in a new animation frame. Advance
						// frame-scoped nodes so shadow updates are included in every bake.
						renderer._nodes.nodeFrame.update();
						grid.bake( renderer, scene, { ...options, bounces: 3 } );

					};

					await measure( operation, 1000, 1 );
					const sample = await measure( operation, 5000, kind === 'repack' ? 8 : 1 );
					const result = { name, kind, path: useCompute ? 'compute' : 'raster', ...sample };
					results.throughput.push( result );
					log( JSON.stringify( result ) );

				}

			}

		}

		renderer.setRenderTarget( null );
		grid.dispose();
		gltf.scene.traverse( object => {

			if ( object.isMesh ) {

				object.geometry.dispose();
				for ( const material of Array.isArray( object.material ) ? object.material : [ object.material ] ) material.dispose();

			}

			if ( object.isLight ) object.dispose();

		} );

	}

	await device.queue.onSubmittedWorkDone();
	await new Promise( resolve => setTimeout( resolve, 0 ) );
	if ( errors.length ) throw new Error( errors.join( '\n' ) );
	renderer.dispose();
	return results;

}

run().then( result => {

	window.benchmarkResults = result;
	log( 'PASS' );

} ).catch( error => {

	window.benchmarkError = error.stack;
	log( error.stack );

} );
