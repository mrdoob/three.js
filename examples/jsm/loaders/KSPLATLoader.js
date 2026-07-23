import {
	BufferAttribute,
	BufferGeometry,
	DataUtils,
	FileLoader,
	Loader
} from 'three';

import { writeColorBytes, writeCovariance } from '../utils/GaussianSplatUtils.js';

const HEADER_SIZE_BYTES = 4096;
const SECTION_HEADER_SIZE_BYTES = 1024;
const CURRENT_VERSION_MAJOR = 0;
const CURRENT_VERSION_MINOR = 1;
const MAX_SPLATS = 10000000;
const SH_DEGREE_TO_COMPONENTS = [ 0, 9, 24, 45 ];
const COMPRESSION_LEVELS = {
	0: {
		bytesPerCenter: 12,
		bytesPerScale: 12,
		bytesPerRotation: 16,
		bytesPerColor: 4,
		bytesPerSphericalHarmonicsComponent: 4,
		scaleOffsetBytes: 12,
		rotationOffsetBytes: 24,
		colorOffsetBytes: 40,
		scaleRange: 1
	},
	1: {
		bytesPerCenter: 6,
		bytesPerScale: 6,
		bytesPerRotation: 8,
		bytesPerColor: 4,
		bytesPerSphericalHarmonicsComponent: 2,
		scaleOffsetBytes: 6,
		rotationOffsetBytes: 12,
		colorOffsetBytes: 20,
		scaleRange: 32767
	},
	2: {
		bytesPerCenter: 6,
		bytesPerScale: 6,
		bytesPerRotation: 8,
		bytesPerColor: 4,
		bytesPerSphericalHarmonicsComponent: 1,
		scaleOffsetBytes: 6,
		rotationOffsetBytes: 12,
		colorOffsetBytes: 20,
		scaleRange: 32767
	}
};

/**
 * A loader for GaussianSplats3D `.ksplat` files.
 *
 * This loader decodes the format into `BufferGeometry` for use with
 * `GaussianSplatMesh`. Spherical harmonics payloads are skipped because the
 * current renderer uses the stored degree-0 color.
 *
 * ```js
 * const loader = new KSPLATLoader();
 * const data = await loader.loadAsync( './models/gsplat/example.ksplat' );
 * scene.add( new GaussianSplatMesh( data ) );
 * ```
 *
 * @augments Loader
 * @three_import import { KSPLATLoader } from 'three/addons/loaders/KSPLATLoader.js';
 */
class KSPLATLoader extends Loader {

	/**
	 * Constructs a new Gaussian splat KSPLAT loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded splat data to
	 * the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(BufferGeometry)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given `.ksplat` data.
	 *
	 * @param {ArrayBuffer} buffer - The raw KSPLAT file as an array buffer.
	 * @return {BufferGeometry} The parsed splat geometry.
	 */
	parse( buffer ) {

		if ( buffer.byteLength < HEADER_SIZE_BYTES ) {

			throw new Error( 'THREE.KSPLATLoader: Invalid KSPLAT header.' );

		}

		const bytes = new Uint8Array( buffer );
		const view = new DataView( buffer );
		const header = parseHeader( view );

		if ( header.versionMajor !== CURRENT_VERSION_MAJOR || header.versionMinor < CURRENT_VERSION_MINOR ) {

			throw new Error( `THREE.KSPLATLoader: Unsupported KSPLAT version ${ header.versionMajor }.${ header.versionMinor }.` );

		}

		if ( header.compressionLevel < 0 || header.compressionLevel > 2 ) {

			throw new Error( `THREE.KSPLATLoader: Unsupported KSPLAT compression level ${ header.compressionLevel }.` );

		}

		if ( header.splatCount > MAX_SPLATS ) {

			throw new Error( `THREE.KSPLATLoader: KSPLAT file contains too many splats (${ header.splatCount }).` );

		}

		const sectionHeadersOffset = HEADER_SIZE_BYTES;
		const sectionDataOffset = HEADER_SIZE_BYTES + header.maxSectionCount * SECTION_HEADER_SIZE_BYTES;

		if ( bytes.byteLength < sectionDataOffset ) {

			throw new Error( 'THREE.KSPLATLoader: Invalid KSPLAT section headers.' );

		}

		const compression = COMPRESSION_LEVELS[ header.compressionLevel ];
		const centers = new Float32Array( header.splatCount * 3 );
		const covariances = new Float32Array( header.splatCount * 6 );
		const colors = new Uint8Array( header.splatCount * 4 );
		let splatOffset = 0;
		let sectionBase = sectionDataOffset;

		for ( let sectionIndex = 0; sectionIndex < header.maxSectionCount; sectionIndex ++ ) {

			const sectionHeaderOffset = sectionHeadersOffset + sectionIndex * SECTION_HEADER_SIZE_BYTES;
			const section = parseSectionHeader( view, sectionHeaderOffset, compression );
			const shComponents = SH_DEGREE_TO_COMPONENTS[ section.sphericalHarmonicsDegree ];

			if ( shComponents === undefined ) {

				throw new Error( `THREE.KSPLATLoader: Unsupported KSPLAT spherical harmonics degree ${ section.sphericalHarmonicsDegree }.` );

			}

			const bytesPerSplat = compression.bytesPerCenter + compression.bytesPerScale + compression.bytesPerRotation + compression.bytesPerColor +
				shComponents * compression.bytesPerSphericalHarmonicsComponent;
			const bucketsMetaDataSizeBytes = section.partiallyFilledBucketCount * 4;
			const bucketsStorageSizeBytes = section.bucketStorageSizeBytes * section.bucketCount + bucketsMetaDataSizeBytes;
			const splatDataStorageSizeBytes = bytesPerSplat * section.maxSplatCount;
			const storageSizeBytes = bucketsStorageSizeBytes + splatDataStorageSizeBytes;

			if ( sectionBase + storageSizeBytes > bytes.byteLength ) {

				throw new Error( 'THREE.KSPLATLoader: Invalid KSPLAT byte length.' );

			}

			if ( section.splatCount > 0 ) {

				readSection(
					view,
					bytes,
					section,
					compression,
					sectionBase,
					bucketsMetaDataSizeBytes,
					bucketsStorageSizeBytes,
					bytesPerSplat,
					splatOffset,
					centers,
					covariances,
					colors
				);

				splatOffset += section.splatCount;

			}

			sectionBase += storageSizeBytes;

		}

		if ( splatOffset !== header.splatCount ) {

			throw new Error( 'THREE.KSPLATLoader: KSPLAT splat count mismatch.' );

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( centers, 3 ) );
		geometry.setAttribute( 'covariance', new BufferAttribute( covariances, 6 ) );
		geometry.setAttribute( 'color', new BufferAttribute( colors, 4, true ) );
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		return geometry;

	}

}

function parseHeader( view ) {

	return {
		versionMajor: view.getUint8( 0 ),
		versionMinor: view.getUint8( 1 ),
		maxSectionCount: view.getUint32( 4, true ),
		sectionCount: view.getUint32( 8, true ),
		maxSplatCount: view.getUint32( 12, true ),
		splatCount: view.getUint32( 16, true ),
		compressionLevel: view.getUint16( 20, true )
	};

}

function parseSectionHeader( view, offset, compression ) {

	return {
		splatCount: view.getUint32( offset, true ),
		maxSplatCount: view.getUint32( offset + 4, true ),
		bucketSize: view.getUint32( offset + 8, true ),
		bucketCount: view.getUint32( offset + 12, true ),
		bucketBlockSize: view.getFloat32( offset + 16, true ),
		bucketStorageSizeBytes: view.getUint16( offset + 20, true ),
		compressionScaleRange: view.getUint32( offset + 24, true ) || compression.scaleRange,
		fullBucketCount: view.getUint32( offset + 32, true ),
		partiallyFilledBucketCount: view.getUint32( offset + 36, true ),
		sphericalHarmonicsDegree: view.getUint16( offset + 40, true )
	};

}

function readSection( view, bytes, section, compression, sectionBase, bucketsMetaDataSizeBytes, bucketsStorageSizeBytes, bytesPerSplat, splatOffset, centers, covariances, colors ) {

	const bucketsBase = sectionBase + bucketsMetaDataSizeBytes;
	const dataBase = sectionBase + bucketsStorageSizeBytes;
	const fullBucketSplats = section.fullBucketCount * section.bucketSize;
	const compressionScaleFactor = section.bucketBlockSize / 2 / section.compressionScaleRange;
	let partialBucketIndex = section.fullBucketCount;
	let partialBucketBase = fullBucketSplats;

	for ( let i = 0; i < section.splatCount; i ++ ) {

		const bucketIndex = getBucketIndex( view, section, sectionBase, i, fullBucketSplats, partialBucketIndex, partialBucketBase );

		if ( bucketIndex.partialBucketIndex !== undefined ) {

			partialBucketIndex = bucketIndex.partialBucketIndex;
			partialBucketBase = bucketIndex.partialBucketBase;

		}

		const rowOffset = dataBase + i * bytesPerSplat;
		const outIndex = splatOffset + i;
		const i3 = outIndex * 3;

		if ( compression.bytesPerCenter === 12 ) {

			centers[ i3 ] = view.getFloat32( rowOffset, true );
			centers[ i3 + 1 ] = view.getFloat32( rowOffset + 4, true );
			centers[ i3 + 2 ] = view.getFloat32( rowOffset + 8, true );

		} else {

			const bucketBase = bucketsBase + bucketIndex.value * section.bucketStorageSizeBytes;
			centers[ i3 ] = ( view.getUint16( rowOffset, true ) - section.compressionScaleRange ) * compressionScaleFactor + view.getFloat32( bucketBase, true );
			centers[ i3 + 1 ] = ( view.getUint16( rowOffset + 2, true ) - section.compressionScaleRange ) * compressionScaleFactor + view.getFloat32( bucketBase + 4, true );
			centers[ i3 + 2 ] = ( view.getUint16( rowOffset + 4, true ) - section.compressionScaleRange ) * compressionScaleFactor + view.getFloat32( bucketBase + 8, true );

		}

		const sx = readCompressedFloat( view, rowOffset + compression.scaleOffsetBytes, compression.bytesPerScale );
		const sy = readCompressedFloat( view, rowOffset + compression.scaleOffsetBytes + compression.bytesPerScale / 3, compression.bytesPerScale );
		const sz = readCompressedFloat( view, rowOffset + compression.scaleOffsetBytes + compression.bytesPerScale / 3 * 2, compression.bytesPerScale );
		const qw = readCompressedFloat( view, rowOffset + compression.rotationOffsetBytes, compression.bytesPerRotation );
		const qx = readCompressedFloat( view, rowOffset + compression.rotationOffsetBytes + compression.bytesPerRotation / 4, compression.bytesPerRotation );
		const qy = readCompressedFloat( view, rowOffset + compression.rotationOffsetBytes + compression.bytesPerRotation / 4 * 2, compression.bytesPerRotation );
		const qz = readCompressedFloat( view, rowOffset + compression.rotationOffsetBytes + compression.bytesPerRotation / 4 * 3, compression.bytesPerRotation );

		writeCovariance( covariances, outIndex * 6, sx, sy, sz, qx, qy, qz, qw );
		writeColorBytes(
			colors,
			outIndex * 4,
			bytes[ rowOffset + compression.colorOffsetBytes ],
			bytes[ rowOffset + compression.colorOffsetBytes + 1 ],
			bytes[ rowOffset + compression.colorOffsetBytes + 2 ],
			bytes[ rowOffset + compression.colorOffsetBytes + 3 ]
		);

	}

}

function getBucketIndex( view, section, sectionBase, splatIndex, fullBucketSplats, partialBucketIndex, partialBucketBase ) {

	if ( section.bucketCount === 0 ) {

		return { value: 0 };

	}

	if ( splatIndex < fullBucketSplats ) {

		return { value: Math.floor( splatIndex / section.bucketSize ) };

	}

	while ( partialBucketIndex < section.bucketCount ) {

		const partialIndex = partialBucketIndex - section.fullBucketCount;
		const bucketLength = view.getUint32( sectionBase + partialIndex * 4, true );

		if ( splatIndex < partialBucketBase + bucketLength ) {

			return { value: partialBucketIndex, partialBucketIndex, partialBucketBase };

		}

		partialBucketIndex ++;
		partialBucketBase += bucketLength;

	}

	throw new Error( 'THREE.KSPLATLoader: Invalid KSPLAT bucket data.' );

}

function readCompressedFloat( view, offset, bytesPerVector ) {

	if ( bytesPerVector === 12 || bytesPerVector === 16 ) {

		return view.getFloat32( offset, true );

	}

	return DataUtils.fromHalfFloat( view.getUint16( offset, true ) );

}

export { KSPLATLoader };
