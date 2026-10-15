import { DataTexture, HalfFloatType, LoadingManager } from 'three';
import { NativeHDRLoader } from '../../../../examples/jsm/loaders/NativeHDRLoader.js';

QUnit.module( 'Addons > Loaders > NativeHDRLoader', () => {

	QUnit.test( 'LoadingManager waits for asynchronous decoding', async assert => {

		const manager = new LoadingManager();
		let completed = false;
		manager.onLoad = () => completed = true;
		let finishDecode, startedDecode;
		const started = new Promise( resolve => startedDecode = resolve );
		const decoding = new Promise( resolve => finishDecode = resolve );
		const loader = new NativeHDRLoader( manager );
		loader._decode = buffer => {

			assert.ok( buffer.byteLength > 0, 'Download has completed' );
			startedDecode();
			return decoding;

		};

		const pending = loader.loadAsync( './addons/loaders/fixtures/native-hdr/neutral-pq.avif' );
		await started;
		assert.notOk( completed, 'Manager remains pending while browser decodes' );
		const source = new DataTexture( new Uint16Array( [ 0x4000, 0x4000, 0x4000, 0x3c00 ] ), 1, 1 );
		source.type = HalfFloatType;
		finishDecode( source.image );
		const texture = await pending;
		assert.true( completed, 'Manager finishes after decode' );
		assert.strictEqual( texture.type, HalfFloatType, 'Decoded texture configuration is retained' );
		assert.strictEqual( texture.image.data[ 0 ], 0x4000, 'HDR half-float value is retained' );
		texture.dispose();
		source.dispose();

	} );

	QUnit.test( 'Asynchronous decoder failure rejects loadAsync and completes manager', async assert => {

		const manager = new LoadingManager();
		let completed = false;
		const failures = [];
		manager.onLoad = () => completed = true;
		manager.onError = url => failures.push( url );
		const loader = new NativeHDRLoader( manager );
		loader._decode = async () => {

			throw new Error( 'Decoder rejected HDR image' );

		};

		await assert.rejects( loader.loadAsync( './addons/loaders/fixtures/native-hdr/neutral-pq.jxl' ), /Decoder rejected HDR image/ );
		assert.true( completed, 'Failure does not leave manager pending' );
		assert.strictEqual( failures.length, 1, 'Decoder failure reported once' );

	} );

	QUnit.test( 'abort rejects a pending decode and ignores its late result', async assert => {

		const manager = new LoadingManager();
		let completed = false;
		manager.onLoad = () => completed = true;
		let finishDecode, startedDecode;
		const started = new Promise( resolve => startedDecode = resolve );
		const decoding = new Promise( resolve => finishDecode = resolve );
		const loader = new NativeHDRLoader( manager );
		loader._decode = () => {

			startedDecode();
			return decoding;

		};

		const pending = loader.loadAsync( './addons/loaders/fixtures/native-hdr/neutral-pq.avif' );
		await started;
		loader.abort();
		await assert.rejects( pending, error => error.name === 'AbortError' );
		assert.true( completed, 'Manager completes after cancellation' );
		finishDecode( { data: new Uint16Array( 4 ), width: 1, height: 1 } );
		await Promise.resolve();
		assert.strictEqual( loader._requests.size, 0, 'No pending operation is retained' );

	} );

	QUnit.test( 'parse callback and parseAsync return configured HDR textures', async assert => {

		const loader = new NativeHDRLoader();
		loader._decode = async () => ( { data: new Uint16Array( [ 0x4000, 0x4000, 0x4000, 0x3c00 ] ), width: 1, height: 1 } );
		const texture = await loader.parseAsync( new ArrayBuffer( 0 ) );
		assert.strictEqual( texture.type, HalfFloatType );
		const callbackTexture = await new Promise( ( resolve, reject ) => loader.parse( new ArrayBuffer( 0 ), resolve, reject ) );
		assert.strictEqual( callbackTexture.image.data[ 0 ], 0x4000 );
		texture.dispose();
		callbackTexture.dispose();

	} );

} );

