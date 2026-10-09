import { UltraHDRLoader } from '../../../../examples/jsm/loaders/UltraHDRLoader.js';

const encoder = new TextEncoder();

function concat( ...arrays ) {

	const result = new Uint8Array( arrays.reduce( ( length, array ) => length + array.length, 0 ) );

	let offset = 0;

	for ( const array of arrays ) {

		result.set( array, offset );
		offset += array.length;

	}

	return result;

}

// A JPEG segment: marker (2 bytes), length including the length field (2 bytes), payload.
function segment( markerType, payload ) {

	const bytes = new Uint8Array( 4 + payload.length );

	bytes[ 0 ] = 0xff;
	bytes[ 1 ] = markerType;
	bytes[ 2 ] = ( payload.length + 2 ) >> 8;
	bytes[ 3 ] = ( payload.length + 2 ) & 0xff;
	bytes.set( payload, 4 );

	return bytes;

}

function exifSegment() {

	return segment( 0xe1, concat( encoder.encode( 'Exif\0\0' ), encoder.encode( 'MM\0*\0\0\0\b\0\0' ) ) );

}

function xmpSegment() {

	const xml = '<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>' +
		'<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">' +
		'<rdf:Description xmlns:hdrgm="http://ns.adobe.com/hdr-gain-map/1.0/" hdrgm:Version="1.0" ' +
		'hdrgm:GainMapMin="0" hdrgm:GainMapMax="2" hdrgm:Gamma="1" hdrgm:OffsetSDR="0.015625" ' +
		'hdrgm:OffsetHDR="0.015625" hdrgm:HDRCapacityMin="0" hdrgm:HDRCapacityMax="2"/>' +
		'</rdf:RDF></x:xmpmeta><?xpacket end="w"?>';

	return segment( 0xe1, encoder.encode( 'http://ns.adobe.com/xap/1.0/\0' + xml ) );

}

// ISO 21496-1 metadata with a common denominator of 2: HDR headroom 0 to 2, gain map range 0 to 2, gamma 1, no offsets.
function isoSegment() {

	const data = new DataView( new ArrayBuffer( 5 + 8 * 4 ) );

	data.setUint8( 4, 0x8 ); // flags: use common denominator

	[ 2, 2, 8, 0, 4, 2, 0, 0 ].forEach( ( value, i ) => data.setUint32( 5 + i * 4, value, false ) );

	return segment( 0xe2, concat( encoder.encode( 'urn:iso:std:iso:ts:21496:-1\0' ), new Uint8Array( data.buffer ) ) );

}

// A multi-picture (MPF) segment pointing at a primary image and a gain map image.
function mpfSegment() {

	const payload = new Uint8Array( 86 );
	const view = new DataView( payload.buffer );

	payload.set( encoder.encode( 'MPF\0' ), 0 );
	payload.set( [ 0x49, 0x49, 0x2a, 0x00 ], 4 ); // little endian

	// The offsets are relative to the segment length field, which is 2 bytes before the payload.
	view.setUint32( 58, 100, true ); // primary image size
	view.setUint32( 62, 0, true ); // primary image offset
	view.setUint32( 74, 4, true ); // gain map image size
	view.setUint32( 78, 0, true ); // gain map image offset

	return segment( 0xe2, payload );

}

function createJPEG( ...segments ) {

	return concat( new Uint8Array( [ 0xff, 0xd8 ] ), ...segments, new Uint8Array( 128 ) ).buffer;

}

function parse( buffer ) {

	const loader = new UltraHDRLoader();
	const result = {};

	// Decoding the images needs a browser, only the metadata handling is of interest here.
	loader._applyGainmapToSDR = ( metadata, primaryImage, gainmapImage, onLoad ) => {

		result.metadata = metadata;
		result.primaryImage = primaryImage;
		result.gainmapImage = gainmapImage;

		onLoad( new Float32Array( 4 ), 1, 1 );

	};

	loader.parse( buffer, ( texData ) => {

		result.texData = texData;

	} );

	return result;

}

export default QUnit.module( 'Addons', () => {

	QUnit.module( 'Loaders', () => {

		QUnit.module( 'UltraHDRLoader', () => {

			QUnit.test( 'Instancing', ( assert ) => {

				const loader = new UltraHDRLoader();

				assert.ok( loader instanceof UltraHDRLoader, 'Can instantiate an UltraHDRLoader.' );

			} );

			QUnit.test( 'parse() - XMP metadata', ( assert ) => {

				const { metadata, primaryImage, gainmapImage, texData } = parse( createJPEG( xmpSegment(), mpfSegment() ) );

				assert.strictEqual( metadata.version, '1.0', 'Reads the version.' );
				assert.strictEqual( metadata.gainMapMax, 2, 'Reads the gain map range.' );
				assert.strictEqual( metadata.gamma, 1, 'Reads the gamma.' );
				assert.strictEqual( metadata.offsetSDR, 1, 'Reads the offsets.' );
				assert.strictEqual( metadata.hdrCapacityMax, 2, 'Reads the HDR capacity.' );
				assert.strictEqual( primaryImage.byteLength, 100, 'Finds the primary image through the MPF segment.' );
				assert.strictEqual( gainmapImage.byteLength, 4, 'Finds the gain map image through the MPF segment.' );
				assert.strictEqual( texData.width, 1, 'Calls onLoad.' );

			} );

			QUnit.test( 'parse() - ISO 21496-1 metadata', ( assert ) => {

				const { metadata, texData } = parse( createJPEG( isoSegment(), mpfSegment() ) );

				assert.strictEqual( metadata.version, '1.0', 'Reads ISO metadata that has no XMP counterpart.' );
				assert.strictEqual( metadata.baseRenditionIsHDR, false, 'Reads the base rendition direction.' );
				assert.strictEqual( metadata.gainMapMin, 0, 'Reads the minimum gain.' );
				assert.strictEqual( metadata.gainMapMax, 2, 'Reads the maximum gain.' );
				assert.strictEqual( metadata.gamma, 1, 'Reads the gamma.' );
				assert.strictEqual( metadata.hdrCapacityMin, 0, 'Reads the base HDR headroom.' );
				assert.strictEqual( metadata.hdrCapacityMax, 2, 'Reads the alternate HDR headroom.' );
				assert.strictEqual( texData.width, 1, 'Calls onLoad.' );

			} );

			QUnit.test( 'parse() - EXIF segment', ( assert ) => {

				// An EXIF segment is also an APP1 segment, but it is no XMP packet.
				const { metadata, texData } = parse( createJPEG( exifSegment(), isoSegment(), mpfSegment() ) );

				assert.strictEqual( metadata.version, '1.0', 'Ignores the EXIF segment and reads the ISO metadata.' );
				assert.strictEqual( metadata.gainMapMax, 2, 'Reads the gain map range.' );
				assert.strictEqual( texData.width, 1, 'Calls onLoad.' );

				const withXMP = parse( createJPEG( exifSegment(), xmpSegment(), mpfSegment() ) );

				assert.strictEqual( withXMP.metadata.version, '1.0', 'Ignores the EXIF segment and reads the XMP metadata.' );

			} );

			QUnit.test( 'parse() - missing metadata', ( assert ) => {

				assert.throws(
					() => parse( createJPEG( exifSegment(), mpfSegment() ) ),
					/Not a valid UltraHDR image/,
					'Throws if there is neither XMP nor ISO metadata.'
				);

			} );

		} );

	} );

} );
