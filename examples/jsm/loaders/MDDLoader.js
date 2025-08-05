import {
	AnimationClip,
	BufferAttribute,
	FileLoader,
	Loader,
	NumberKeyframeTrack
} from 'three';

/**
 * A loader for the MDD format.
 *
 * MDD stores a position for every vertex in a model for every frame in an animation.
 * Similar to BVH, it can be used to transfer animation data between different 3D applications or engines.
 *
 * MDD stores its data in binary format (big endian) in the following way:
 *
 * - number of frames (a single uint32)
 * - number of vertices (a single uint32)
 * - time values for each frame (sequence of float32)
 * - vertex data for each frame (sequence of float32)
 *
 * ```js
 * const loader = new MDDLoader();
 * const result = await loader.loadAsync( 'models/mdd/cube.mdd' );
 *
 * const morphTargets = result.morphTargets;
 * const clip = result.clip;
 * // clip.optimize(); // optional
 *
 * const geometry = new THREE.BoxGeometry();
 * geometry.morphAttributes.position = morphTargets; // apply morph targets (vertex data must match)
 *
 * const material = new THREE.MeshBasicMaterial();
 *
 * const mesh = new THREE.Mesh( geometry, material );
 * scene.add( mesh );
 *
 * const mixer = new THREE.AnimationMixer( mesh );
 * mixer.clipAction( clip ).play();
 * ```
 *
 * @augments Loader
 * @three_import import { MDDLoader } from 'three/addons/loaders/MDDLoader.js';
 */
class MDDLoader extends Loader {

	/**
	 * Constructs a new MDD loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded MDD asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function({clip:AnimationClip, morphTargets:Array<BufferAttribute>})} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( data ) {

			onLoad( scope.parse( data ) );

		}, onProgress, onError );

	}

	/**
	 * Parses the given MDD data and returns an object holding the animation clip and the respective
	 * morph targets.
	 *
	 * @param {ArrayBuffer} data - The raw XYZ data as an array buffer.
	 * @return {{clip:AnimationClip, morphTargets:Array<BufferAttribute>}} The result object.
	 */
	parse( data ) {

		const view = new DataView( data );

		const totalFrames = view.getUint32( 0 );
		const totalPoints = view.getUint32( 4 );

		let offset = 8;

		// animation clip

		const times = new Float32Array( totalFrames );
		const values = new Float32Array( totalFrames * totalFrames ).fill( 0 );

		for ( let i = 0; i < totalFrames; i ++ ) {

			times[ i ] = view.getFloat32( offset ); offset += 4;
			values[ ( totalFrames * i ) + i ] = 1;

		}

		const track = new NumberKeyframeTrack( '.morphTargetInfluences', times, values );
		const clip = new AnimationClip( 'default', times[ times.length - 1 ], [ track ] );

		// morph targets

		const morphTargets = [];

		for ( let i = 0; i < totalFrames; i ++ ) {

			const morphTarget = new Float32Array( totalPoints * 3 );

			for ( let j = 0; j < totalPoints; j ++ ) {

				const stride = ( j * 3 );

				morphTarget[ stride + 0 ] = view.getFloat32( offset ); offset += 4; // x
				morphTarget[ stride + 1 ] = view.getFloat32( offset ); offset += 4; // y
				morphTarget[ stride + 2 ] = view.getFloat32( offset ); offset += 4; // z

			}

			const attribute = new BufferAttribute( morphTarget, 3 );
			attribute.name = 'morph_' + i;

			morphTargets.push( attribute );

		}

		return {
			morphTargets: morphTargets,
			clip: clip
		};

	}

}

export { MDDLoader };
