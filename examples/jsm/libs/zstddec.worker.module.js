/**
 * @author Deepkolos / https://github.com/deepkolos
 */

import { wasm } from './zstddec.module.js';
import { WorkerPool } from './worker-pool.module.js';

export class ZSTDDecoderWorker {

	static Worker () {

		let instance, heap;
		let initPromiseResolve;
		let initPromise = new Promise( ( resolve ) => {

			initPromiseResolve = ( e ) => {

				instance = e.instance;
				importObject.env.emscripten_notify_memory_growth( 0 );
				resolve();

			};

		});

		const importObject = {

			env: {

				emscripten_notify_memory_growth: function ( index ) {

					heap = new Uint8Array( instance.exports.memory.buffer );

				},

			},
		};

		self.addEventListener( 'message', ( e ) => {

			switch ( e.data.type ) {

				case 'init':

					WebAssembly
						.instantiate( e.data.wasmBuffer, importObject )
						.then( initPromiseResolve );

					break;

				case 'decode':

					initPromise.then( () => {

						// Write compressed data into WASM memory.
						let { array, uncompressedSize } = e.data;
						const compressedSize = array.byteLength;
						const compressedPtr = instance.exports.malloc( compressedSize );
						heap.set(array, compressedPtr);

						// Decompress into WASM memory.
						uncompressedSize = uncompressedSize ||
							Number( instance.exports.ZSTD_findDecompressedSize( compressedPtr, compressedSize ) );
						const uncompressedPtr = instance.exports.malloc( uncompressedSize );
						const actualSize = instance.exports.ZSTD_decompress(
							uncompressedPtr,uncompressedSize, compressedPtr, compressedSize );

						// Read decompressed data and free WASM memory.
						const dec = heap.slice( uncompressedPtr, uncompressedPtr + actualSize );
						instance.exports.free( compressedPtr);
						instance.exports.free( uncompressedPtr );

						self.postMessage( { dec }, [ dec.buffer ] );

					} );

					break;

			}

		});

	}

	constructor ( pool = 4 ) {

		this.initPromise = null;
		this.workerPool = new WorkerPool( pool );
		this.wasmBufferPromise = fetch( 'data:application/wasm;base64,' + wasm ).then( res => res.arrayBuffer() );
		this.workerSourceUrl = this.workerPool.createWorkerSourceUrl( ZSTDDecoderWorker.Worker );

	}

	init () {

		if ( !this.initPromise ) {

			this.initPromise = Promise.resolve( this.wasmBufferPromise ).then( ( wasmBuffer ) => {

					this.workerPool.initWorkers( () => {

						const worker = new Worker( this.workerSourceUrl );
						const wasmBufferCopy = wasmBuffer.slice( 0 );

						worker.postMessage( { type: 'init', wasmBuffer: wasmBufferCopy }, [ wasmBufferCopy ] );

						return worker;

					} );

				}

			);

		}

		return this.initPromise;

	}

	decode ( array, uncompressedSize = 0 ) {

		return this.workerPool
			.postMessage( { type: 'decode', array, uncompressedSize }, [ array.buffer ] )
			.then( ( e ) => e.data.dec );

	}

	dispose () {

		URL.revokeObjectURL( this.workerSourceUrl );
		this.workerPool.dispose();

	}

}
