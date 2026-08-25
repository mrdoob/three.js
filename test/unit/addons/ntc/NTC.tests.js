import * as THREE from 'three';
import { WebGPURenderer, MeshPhysicalNodeMaterial } from 'three/webgpu';
import { CHANNELS, getChannel, layoutChannels } from '../../../../examples/jsm/ntc/NTCFormat.js';
import { encodeNTC } from '../../../../examples/jsm/ntc/NTCManifest.js';
import { NTCLoader } from '../../../../examples/jsm/loaders/NTCLoader.js';
import { applyNTCToMaterial } from '../../../../examples/jsm/ntc/NTCMLPNode.js';

// Synthesizes a tiny (not remotely trained) but structurally valid NTC CPU
// model: one 2x2 latent grid level (4 channels) feeding a 2-layer MLP
// (4 -> 8 (relu) -> outputSize (linear)), matching the shape a real
// `.ntc` asset's `cpuModel` has. Used to exercise the encode/decode round
// trip and the material-application node graph without depending on a real
// trained asset.
function buildSyntheticCpuModel( activeKeys, seed = 1 ) {

	let s = seed;
	const rand = () => {

		s = ( s * 1103515245 + 12345 ) & 0x7fffffff;
		return ( s / 0x7fffffff ) * 2 - 1;

	};

	const gridChannels = 4;
	const gridData = new Float32Array( 2 * 2 * gridChannels );
	for ( let i = 0; i < gridData.length; i ++ ) gridData[ i ] = rand() * 0.5;

	const activeChannels = layoutChannels( activeKeys.map( ( key ) => getChannel( key ) ) ).channels;
	const outputSize = activeChannels.reduce( ( sum, c ) => sum + c.size, 0 );

	const hiddenSize = 8;

	const layer1Weights = new Float32Array( gridChannels * hiddenSize );
	for ( let i = 0; i < layer1Weights.length; i ++ ) layer1Weights[ i ] = rand() * 0.3;
	const layer1Biases = new Float32Array( hiddenSize );

	const layer2Weights = new Float32Array( hiddenSize * outputSize );
	for ( let i = 0; i < layer2Weights.length; i ++ ) layer2Weights[ i ] = rand() * 0.3;
	const layer2Biases = new Float32Array( outputSize );

	return {
		channels: gridChannels,
		grids: [ { width: 2, height: 2, channels: gridChannels, data: gridData } ],
		decoder: {
			layers: [
				{ inputSize: gridChannels, outputSize: hiddenSize, activation: 'relu', weights: layer1Weights, biases: layer1Biases },
				{ inputSize: hiddenSize, outputSize, activation: 'linear', weights: layer2Weights, biases: layer2Biases }
			]
		},
		outputChannels: outputSize
	};

}

function buildChannelClassification( activeKeys ) {

	const { channels: activeChannels } = layoutChannels( activeKeys.map( ( key ) => getChannel( key ) ) );
	const constantValues = {};

	for ( const channel of CHANNELS ) {

		if ( activeKeys.includes( channel.key ) ) continue;
		constantValues[ channel.key ] = channel.defaultValue;

	}

	return { activeChannels, constantValues, renderFlags: null };

}

export default QUnit.module( 'NTC', () => {

	QUnit.test( 'encodeNTC/NTCLoader round trip preserves grid data, decoder weights and channel layout', ( assert ) => {

		const activeKeys = [ 'albedo', 'roughness', 'metalness' ];
		const cpuModel = buildSyntheticCpuModel( activeKeys );
		const channelClassification = buildChannelClassification( activeKeys );

		const manifest = encodeNTC( cpuModel, channelClassification, { name: 'test-material' } );

		assert.equal( manifest.format, 'three-ntc', 'manifest carries the .ntc format tag' );
		assert.equal( manifest.version, 1, 'manifest carries version 1' );

		const loader = new NTCLoader();
		const loaded = loader.parse( manifest );

		assert.equal( loaded.name, 'test-material', 'name round-trips' );
		assert.deepEqual(
			loaded.channelClassification.activeChannels.map( ( c ) => c.key ),
			activeKeys,
			'active channel keys round-trip in order'
		);

		// Latent grid: uint8-quantized, so compare with a tolerance wide enough
		// to cover one quantization step (range/255) rather than expecting an
		// exact match.
		const originalGrid = cpuModel.grids[ 0 ].data;
		const loadedGrid = loaded.cpuModel.grids[ 0 ].data;
		assert.equal( loadedGrid.length, originalGrid.length, 'grid data length round-trips' );

		let maxGridError = 0;
		for ( let i = 0; i < originalGrid.length; i ++ ) maxGridError = Math.max( maxGridError, Math.abs( originalGrid[ i ] - loadedGrid[ i ] ) );
		assert.ok( maxGridError < 0.01, `latent grid round-trips within uint8 quantization tolerance (max error ${ maxGridError.toFixed( 5 ) })` );

		// Decoder weights/biases: float16-packed, so compare with float16
		// precision tolerance rather than expecting an exact match.
		for ( let l = 0; l < cpuModel.decoder.layers.length; l ++ ) {

			const originalLayer = cpuModel.decoder.layers[ l ];
			const loadedLayer = loaded.cpuModel.decoder.layers[ l ];

			assert.equal( loadedLayer.inputSize, originalLayer.inputSize, `layer ${ l } inputSize round-trips` );
			assert.equal( loadedLayer.outputSize, originalLayer.outputSize, `layer ${ l } outputSize round-trips` );

			let maxWeightError = 0;
			for ( let i = 0; i < originalLayer.weights.length; i ++ ) maxWeightError = Math.max( maxWeightError, Math.abs( originalLayer.weights[ i ] - loadedLayer.weights[ i ] ) );
			assert.ok( maxWeightError < 0.01, `layer ${ l } weights round-trip within float16 tolerance (max error ${ maxWeightError.toFixed( 5 ) })` );

		}

	} );

	QUnit.test( 'NTCLoader rejects a manifest with the wrong format tag', ( assert ) => {

		const loader = new NTCLoader();

		assert.throws(
			() => loader.parse( { format: 'three-neural-material', version: 1 } ),
			/Unsupported format/,
			'a non-.ntc manifest is rejected with a clear error'
		);

	} );

	QUnit.test( 'applyNTCToMaterial builds a renderable MeshPhysicalNodeMaterial from a loaded .ntc asset', async ( assert ) => {

		const activeKeys = [ 'albedo', 'roughness', 'metalness' ];
		const cpuModel = buildSyntheticCpuModel( activeKeys );
		const channelClassification = buildChannelClassification( activeKeys );
		const manifest = encodeNTC( cpuModel, channelClassification );
		const loaded = new NTCLoader().parse( manifest );

		const renderer = new WebGPURenderer( { antialias: false } );

		try {

			await renderer.init();

		} catch ( error ) {

			assert.ok( true, `SKIPPED: no WebGPURenderer backend is available in this environment (${ error.message }).` );
			return;

		}

		try {

			const material = new MeshPhysicalNodeMaterial();
			const { levelTextures } = applyNTCToMaterial( material, loaded.cpuModel, loaded.channelClassification, { renderer } );

			const scene = new THREE.Scene();
			const mesh = new THREE.Mesh( new THREE.BoxGeometry( 1, 1, 1 ), material );
			scene.add( mesh );
			scene.add( new THREE.PointLight( 0xffffff, 1 ) );

			const camera = new THREE.PerspectiveCamera( 50, 1, 0.1, 10 );
			camera.position.set( 0, 0, 3 );

			renderer.setSize( 8, 8 );

			await renderer.render( scene, camera );

			assert.ok( true, 'renders one frame with an NTC-driven MeshPhysicalNodeMaterial without throwing' );

			for ( const levelTexture of levelTextures ) levelTexture.dispose();
			material.dispose();

		} finally {

			renderer.dispose();

		}

	} );

} );
