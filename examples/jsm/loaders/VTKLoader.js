import {
	BufferAttribute,
	BufferGeometry,
	FileLoader,
	Float32BufferAttribute,
	Loader
} from 'three';
import * as fflate from '../libs/fflate.module.js';

class VTKLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

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

	parse( data ) {

		function parseASCII( data ) {

			// connectivity of the triangles
			const indices = [];

			// triangles vertices
			const positions = [];

			// red, green, blue colors in the range 0 to 1
			const colors = [];

			// normal vector, one per vertex
			const normals = [];

			let result;

			// pattern for detecting the end of a number sequence
			const patWord = /^[^\d.\s-]+/;

			// pattern for reading vertices, 3 floats or integers
			const pat3Floats = /(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)/g;

			// pattern for connectivity, an integer followed by any number of ints
			// the first integer is the number of polygon nodes
			const patConnectivity = /^(\d+)\s+([\s\d]*)/;

			// indicates start of vertex data section
			const patPOINTS = /^POINTS /;

			// indicates start of polygon connectivity section
			const patPOLYGONS = /^POLYGONS /;

			// indicates start of triangle strips section
			const patTRIANGLE_STRIPS = /^TRIANGLE_STRIPS /;

			// POINT_DATA number_of_values
			const patPOINT_DATA = /^POINT_DATA[ ]+(\d+)/;

			// CELL_DATA number_of_polys
			const patCELL_DATA = /^CELL_DATA[ ]+(\d+)/;

			// Start of color section
			const patCOLOR_SCALARS = /^COLOR_SCALARS[ ]+(\w+)[ ]+3/;

			// NORMALS Normals float
			const patNORMALS = /^NORMALS[ ]+(\w+)[ ]+(\w+)/;

			let inPointsSection = false;
			let inPolygonsSection = false;
			let inTriangleStripSection = false;
			let inPointDataSection = false;
			let inCellDataSection = false;
			let inColorSection = false;
			let inNormalsSection = false;

			const lines = data.split( '\n' );

			for ( const i in lines ) {

				const line = lines[ i ].trim();

				if ( line.indexOf( 'DATASET' ) === 0 ) {

					const dataset = line.split( ' ' )[ 1 ];

					if ( dataset !== 'POLYDATA' ) throw new Error( 'Unsupported DATASET type: ' + dataset );

				} else if ( inPointsSection ) {

					// get the vertices
					while ( ( result = pat3Floats.exec( line ) ) !== null ) {

						if ( patWord.exec( line ) !== null ) break;

						const x = parseFloat( result[ 1 ] );
						const y = parseFloat( result[ 2 ] );
						const z = parseFloat( result[ 3 ] );
						positions.push( x, y, z );

					}

				} else if ( inPolygonsSection ) {

					if ( ( result = patConnectivity.exec( line ) ) !== null ) {

						// numVertices i0 i1 i2 ...
						const numVertices = parseInt( result[ 1 ] );
						const inds = result[ 2 ].split( /\s+/ );

						if ( numVertices >= 3 ) {

							const i0 = parseInt( inds[ 0 ] );
							let k = 1;
							// split the polygon in numVertices - 2 triangles
							for ( let j = 0; j < numVertices - 2; ++ j ) {

								const i1 = parseInt( inds[ k ] );
								const i2 = parseInt( inds[ k + 1 ] );
								indices.push( i0, i1, i2 );
								k ++;

							}

						}

					}

				} else if ( inTriangleStripSection ) {

					if ( ( result = patConnectivity.exec( line ) ) !== null ) {

						// numVertices i0 i1 i2 ...
						const numVertices = parseInt( result[ 1 ] );
						const inds = result[ 2 ].split( /\s+/ );

						if ( numVertices >= 3 ) {

							// split the polygon in numVertices - 2 triangles
							for ( let j = 0; j < numVertices - 2; j ++ ) {

								if ( j % 2 === 1 ) {

									const i0 = parseInt( inds[ j ] );
									const i1 = parseInt( inds[ j + 2 ] );
									const i2 = parseInt( inds[ j + 1 ] );
									indices.push( i0, i1, i2 );

								} else {

									const i0 = parseInt( inds[ j ] );
									const i1 = parseInt( inds[ j + 1 ] );
									const i2 = parseInt( inds[ j + 2 ] );
									indices.push( i0, i1, i2 );

								}

							}

						}

					}

				} else if ( inPointDataSection || inCellDataSection ) {

					if ( inColorSection ) {

						// Get the colors

						while ( ( result = pat3Floats.exec( line ) ) !== null ) {

							if ( patWord.exec( line ) !== null ) break;

							const r = parseFloat( result[ 1 ] );
							const g = parseFloat( result[ 2 ] );
							const b = parseFloat( result[ 3 ] );
							colors.push( r, g, b );

						}

					} else if ( inNormalsSection ) {

						// Get the normal vectors

						while ( ( result = pat3Floats.exec( line ) ) !== null ) {

							if ( patWord.exec( line ) !== null ) break;

							const nx = parseFloat( result[ 1 ] );
							const ny = parseFloat( result[ 2 ] );
							const nz = parseFloat( result[ 3 ] );
							normals.push( nx, ny, nz );

						}

					}

				}

				if ( patPOLYGONS.exec( line ) !== null ) {

					inPolygonsSection = true;
					inPointsSection = false;
					inTriangleStripSection = false;

				} else if ( patPOINTS.exec( line ) !== null ) {

					inPolygonsSection = false;
					inPointsSection = true;
					inTriangleStripSection = false;

				} else if ( patTRIANGLE_STRIPS.exec( line ) !== null ) {

					inPolygonsSection = false;
					inPointsSection = false;
					inTriangleStripSection = true;

				} else if ( patPOINT_DATA.exec( line ) !== null ) {

					inPointDataSection = true;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				} else if ( patCELL_DATA.exec( line ) !== null ) {

					inCellDataSection = true;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				} else if ( patCOLOR_SCALARS.exec( line ) !== null ) {

					inColorSection = true;
					inNormalsSection = false;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				} else if ( patNORMALS.exec( line ) !== null ) {

					inNormalsSection = true;
					inColorSection = false;
					inPointsSection = false;
					inPolygonsSection = false;
					inTriangleStripSection = false;

				}

			}

			let geometry = new BufferGeometry();
			geometry.setIndex( indices );
			geometry.setAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );

			if ( normals.length === positions.length ) {

				geometry.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

			}

			if ( colors.length !== indices.length ) {

				// stagger

				if ( colors.length === positions.length ) {

					geometry.setAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

				}

			} else {

				// cell

				geometry = geometry.toNonIndexed();
				const numTriangles = geometry.attributes.position.count / 3;

				if ( colors.length === ( numTriangles * 3 ) ) {

					const newColors = [];

					for ( let i = 0; i < numTriangles; i ++ ) {

						const r = colors[ 3 * i + 0 ];
						const g = colors[ 3 * i + 1 ];
						const b = colors[ 3 * i + 2 ];

						newColors.push( r, g, b );
						newColors.push( r, g, b );
						newColors.push( r, g, b );

					}

					geometry.setAttribute( 'color', new Float32BufferAttribute( newColors, 3 ) );

				}

			}

			return geometry;

		}

		function parseBinary( data ) {

			const buffer = new Uint8Array( data );
			const dataView = new DataView( data );

			// Points and normals, by default, are empty
			let points = [];
			let normals = [];
			let indices = [];

			let index = 0;

			function findString( buffer, start ) {

				let index = start;
				let c = buffer[ index ];
				const s = [];
				while ( c !== 10 ) {

					s.push( String.fromCharCode( c ) );
					index ++;
					c = buffer[ index ];

				}

				return { start: start,
					end: index,
					next: index + 1,
					parsedString: s.join( '' ) };

			}

			let state, line;

			while ( true ) {

				// Get a string
				state = findString( buffer, index );
				line = state.parsedString;

				if ( line.indexOf( 'DATASET' ) === 0 ) {

					const dataset = line.split( ' ' )[ 1 ];

					if ( dataset !== 'POLYDATA' ) throw new Error( 'Unsupported DATASET type: ' + dataset );

				} else if ( line.indexOf( 'POINTS' ) === 0 ) {

					// Add the points
					const numberOfPoints = parseInt( line.split( ' ' )[ 1 ], 10 );

					// Each point is 3 4-byte floats
					const count = numberOfPoints * 4 * 3;

					points = new Float32Array( numberOfPoints * 3 );

					let pointIndex = state.next;
					for ( let i = 0; i < numberOfPoints; i ++ ) {

						points[ 3 * i ] = dataView.getFloat32( pointIndex, false );
						points[ 3 * i + 1 ] = dataView.getFloat32( pointIndex + 4, false );
						points[ 3 * i + 2 ] = dataView.getFloat32( pointIndex + 8, false );
						pointIndex = pointIndex + 12;

					}

					// increment our next pointer
					state.next = state.next + count + 1;

				} else if ( line.indexOf( 'TRIANGLE_STRIPS' ) === 0 ) {

					const numberOfStrips = parseInt( line.split( ' ' )[ 1 ], 10 );
					const size = parseInt( line.split( ' ' )[ 2 ], 10 );
					// 4 byte integers
					const count = size * 4;

					indices = new Uint32Array( 3 * size - 9 * numberOfStrips );
					let indicesIndex = 0;

					let pointIndex = state.next;
					for ( let i = 0; i < numberOfStrips; i ++ ) {

						// For each strip, read the first value, then record that many more points
						const indexCount = dataView.getInt32( pointIndex, false );
						const strip = [];
						pointIndex += 4;
						for ( let s = 0; s < indexCount; s ++ ) {

							strip.push( dataView.getInt32( pointIndex, false ) );
							pointIndex += 4;

						}

						// retrieves the n-2 triangles from the triangle strip
						for ( let j = 0; j < indexCount - 2; j ++ ) {

							if ( j % 2 ) {

								indices[ indicesIndex ++ ] = strip[ j ];
								indices[ indicesIndex ++ ] = strip[ j + 2 ];
								indices[ indicesIndex ++ ] = strip[ j + 1 ];

							} else {


								indices[ indicesIndex ++ ] = strip[ j ];
								indices[ indicesIndex ++ ] = strip[ j + 1 ];
								indices[ indicesIndex ++ ] = strip[ j + 2 ];

							}

						}

					}

					// increment our next pointer
					state.next = state.next + count + 1;

				} else if ( line.indexOf( 'POLYGONS' ) === 0 ) {

					const numberOfStrips = parseInt( line.split( ' ' )[ 1 ], 10 );
					const size = parseInt( line.split( ' ' )[ 2 ], 10 );
					// 4 byte integers
					const count = size * 4;

					indices = new Uint32Array( 3 * size - 9 * numberOfStrips );
					let indicesIndex = 0;

					let pointIndex = state.next;
					for ( let i = 0; i < numberOfStrips; i ++ ) {

						// For each strip, read the first value, then record that many more points
						const indexCount = dataView.getInt32( pointIndex, false );
						const strip = [];
						pointIndex += 4;
						for ( let s = 0; s < indexCount; s ++ ) {

							strip.push( dataView.getInt32( pointIndex, false ) );
							pointIndex += 4;

						}

						// divide the polygon in n-2 triangle
						for ( let j = 1; j < indexCount - 1; j ++ ) {

							indices[ indicesIndex ++ ] = strip[ 0 ];
							indices[ indicesIndex ++ ] = strip[ j ];
							indices[ indicesIndex ++ ] = strip[ j + 1 ];

						}

					}

					// increment our next pointer
					state.next = state.next + count + 1;

				} else if ( line.indexOf( 'POINT_DATA' ) === 0 ) {

					const numberOfPoints = parseInt( line.split( ' ' )[ 1 ], 10 );

					// Grab the next line
					state = findString( buffer, state.next );

					// Now grab the binary data
					const count = numberOfPoints * 4 * 3;

					normals = new Float32Array( numberOfPoints * 3 );
					let pointIndex = state.next;
					for ( let i = 0; i < numberOfPoints; i ++ ) {

						normals[ 3 * i ] = dataView.getFloat32( pointIndex, false );
						normals[ 3 * i + 1 ] = dataView.getFloat32( pointIndex + 4, false );
						normals[ 3 * i + 2 ] = dataView.getFloat32( pointIndex + 8, false );
						pointIndex += 12;

					}

					// Increment past our data
					state.next = state.next + count;

				}

				// Increment index
				index = state.next;

				if ( index >= buffer.byteLength ) {

					break;

				}

			}

			const geometry = new BufferGeometry();
			geometry.setIndex( new BufferAttribute( indices, 1 ) );
			geometry.setAttribute( 'position', new BufferAttribute( points, 3 ) );

			if ( normals.length === points.length ) {

				geometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );

			}

			return geometry;

		}

		function Float32Concat( first, second ) {

			const firstLength = first.length, result = new Float32Array( firstLength + second.length );

			result.set( first );
			result.set( second, firstLength );

			return result;

		}

		function Int32Concat( first, second ) {

			const firstLength = first.length, result = new Int32Array( firstLength + second.length );

			result.set( first );
			result.set( second, firstLength );

			return result;

		}

		function parseXML( stringFile ) {

			// Changes XML to JSON, based on https://davidwalsh.name/convert-xml-json

			function xmlToJson( xml ) {

				// Create the return object
				let obj = {};

				if ( xml.nodeType === 1 ) { // element

					// do attributes

					if ( xml.attributes ) {

						if ( xml.attributes.length > 0 ) {

							obj[ 'attributes' ] = {};

							for ( let j = 0; j < xml.attributes.length; j ++ ) {

								const attribute = xml.attributes.item( j );
								obj[ 'attributes' ][ attribute.nodeName ] = attribute.nodeValue.trim();

							}

						}

					}

				} else if ( xml.nodeType === 3 ) { // text

					obj = xml.nodeValue.trim();

				}

				// do children
				if ( xml.hasChildNodes() ) {

					for ( let i = 0; i < xml.childNodes.length; i ++ ) {

						const item = xml.childNodes.item( i );
						const nodeName = item.nodeName;

						if ( typeof obj[ nodeName ] === 'undefined' ) {

							const tmp = xmlToJson( item );

							if ( tmp !== '' ) obj[ nodeName ] = tmp;

						} else {

							if ( typeof obj[ nodeName ].push === 'undefined' ) {

								const old = obj[ nodeName ];
								obj[ nodeName ] = [ old ];

							}

							const tmp = xmlToJson( item );

							if ( tmp !== '' ) obj[ nodeName ].push( tmp );

						}

					}

				}

				return obj;

			}

			// Taken from Base64-js
			function Base64toByteArray( b64 ) {

				const Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
				const revLookup = [];
				const code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

				for ( let i = 0, l = code.length; i < l; ++ i ) {

					revLookup[ code.charCodeAt( i ) ] = i;

				}

				revLookup[ '-'.charCodeAt( 0 ) ] = 62;
				revLookup[ '_'.charCodeAt( 0 ) ] = 63;

				const len = b64.length;

				if ( len % 4 > 0 ) {

					throw new Error( 'Invalid string. Length must be a multiple of 4' );

				}

				const placeHolders = b64[ len - 2 ] === '=' ? 2 : b64[ len - 1 ] === '=' ? 1 : 0;
				const arr = new Arr( len * 3 / 4 - placeHolders );
				const l = placeHolders > 0 ? len - 4 : len;

				let L = 0;
				let i, j;

				for ( i = 0, j = 0; i < l; i += 4, j += 3 ) {

					const tmp = ( revLookup[ b64.charCodeAt( i ) ] << 18 ) | ( revLookup[ b64.charCodeAt( i + 1 ) ] << 12 ) | ( revLookup[ b64.charCodeAt( i + 2 ) ] << 6 ) | revLookup[ b64.charCodeAt( i + 3 ) ];
					arr[ L ++ ] = ( tmp & 0xFF0000 ) >> 16;
					arr[ L ++ ] = ( tmp & 0xFF00 ) >> 8;
					arr[ L ++ ] = tmp & 0xFF;

				}

				if ( placeHolders === 2 ) {

					const tmp = ( revLookup[ b64.charCodeAt( i ) ] << 2 ) | ( revLookup[ b64.charCodeAt( i + 1 ) ] >> 4 );
					arr[ L ++ ] = tmp & 0xFF;

				} else if ( placeHolders === 1 ) {

					const tmp = ( revLookup[ b64.charCodeAt( i ) ] << 10 ) | ( revLookup[ b64.charCodeAt( i + 1 ) ] << 4 ) | ( revLookup[ b64.charCodeAt( i + 2 ) ] >> 2 );
					arr[ L ++ ] = ( tmp >> 8 ) & 0xFF;
					arr[ L ++ ] = tmp & 0xFF;

				}

				return arr;

			}

			function parseDataArray( ele, compressed ) {

				let numBytes = 0;

				if ( json.attributes.header_type === 'UInt64' ) {

					numBytes = 8;

				}	else if ( json.attributes.header_type === 'UInt32' ) {

					numBytes = 4;

				}

				let txt, content;

				// Check the format
				if ( ele.attributes.format === 'binary' && compressed ) {

					if ( ele.attributes.type === 'Float32' ) {

						txt = new Float32Array( );

					} else if ( ele.attributes.type === 'Int32' || ele.attributes.type === 'Int64' ) {

						txt = new Int32Array( );

					}

					// VTP data with the header has the following structure:
					// [#blocks][#u-size][#p-size][#c-size-1][#c-size-2]...[#c-size-#blocks][DATA]
					//
					// Each token is an integer value whose type is specified by "header_type" at the top of the file (UInt32 if no type specified). The token meanings are:
					// [#blocks] = Number of blocks
					// [#u-size] = Block size before compression
					// [#p-size] = Size of last partial block (zero if it not needed)
					// [#c-size-i] = Size in bytes of block i after compression
					//
					// The [DATA] portion stores contiguously every block appended together. The offset from the beginning of the data section to the beginning of a block is
					// computed by summing the compressed block sizes from preceding blocks according to the header.

					const textNode = ele[ '#text' ];
					const rawData = Array.isArray( textNode ) ? textNode[ 0 ] : textNode;

					const byteData = Base64toByteArray( rawData );

					// Each data point consists of 8 bits regardless of the header type
					const dataPointSize = 8;

					let blocks = byteData[ 0 ];
					for ( let i = 1; i < numBytes - 1; i ++ ) {

						blocks = blocks | ( byteData[ i ] << ( i * dataPointSize ) );

					}

					let headerSize = ( blocks + 3 ) * numBytes;
					const padding = ( ( headerSize % 3 ) > 0 ) ? 3 - ( headerSize % 3 ) : 0;
					headerSize = headerSize + padding;

					const dataOffsets = [];
					let currentOffset = headerSize;
					dataOffsets.push( currentOffset );

					// Get the blocks sizes after the compression.
					// There are three blocks before c-size-i, so we skip 3*numBytes
					const cSizeStart = 3 * numBytes;

					for ( let i = 0; i < blocks; i ++ ) {

						let currentBlockSize = byteData[ i * numBytes + cSizeStart ];

						for ( let j = 1; j < numBytes - 1; j ++ ) {

							currentBlockSize = currentBlockSize | ( byteData[ i * numBytes + cSizeStart + j ] << ( j * dataPointSize ) );

						}

						currentOffset = currentOffset + currentBlockSize;
						dataOffsets.push( currentOffset );

					}

					for ( let i = 0; i < dataOffsets.length - 1; i ++ ) {

						const data = fflate.unzlibSync( byteData.slice( dataOffsets[ i ], dataOffsets[ i + 1 ] ) );
						content = data.buffer;

						if ( ele.attributes.type === 'Float32' ) {

							content = new Float32Array( content );
							txt = Float32Concat( txt, content );

						} else if ( ele.attributes.type === 'Int32' || ele.attributes.type === 'Int64' ) {

							content = new Int32Array( content );
							txt = Int32Concat( txt, content );

						}

					}

					delete ele[ '#text' ];

					if ( ele.attributes.type === 'Int64' ) {

						if ( ele.attributes.format === 'binary' ) {

							txt = txt.filter( function ( el, idx ) {

								if ( idx % 2 !== 1 ) return true;

							} );

						}

					}

				} else {

					if ( ele.attributes.format === 'binary' && ! compressed ) {

						content = Base64toByteArray( ele[ '#text' ] );

						//  VTP data for the uncompressed case has the following structure:
						// [#bytes][DATA]
						// where "[#bytes]" is an integer value specifying the number of bytes in the block of data following it.
						content = content.slice( numBytes ).buffer;

					} else {

						if ( ele[ '#text' ] ) {

							content = ele[ '#text' ].split( /\s+/ ).filter( function ( el ) {

								if ( el !== '' ) return el;

							} );

						} else {

							content = new Int32Array( 0 ).buffer;

						}

					}

					delete ele[ '#text' ];

					// Get the content and optimize it
					if ( ele.attributes.type === 'Float32' ) {

						txt = new Float32Array( content );

					} else if ( ele.attributes.type === 'Int32' ) {

						txt = new Int32Array( content );

					} else if ( ele.attributes.type === 'Int64' ) {

						txt = new Int32Array( content );

						if ( ele.attributes.format === 'binary' ) {

							txt = txt.filter( function ( el, idx ) {

								if ( idx % 2 !== 1 ) return true;

							} );

						}

					}

				} // endif ( ele.attributes.format === 'binary' && compressed )

				return txt;

			}

			// Main part
			// Get Dom
			const dom = new DOMParser().parseFromString( stringFile, 'application/xml' );

			// Get the doc
			const doc = dom.documentElement;
			// Convert to json
			const json = xmlToJson( doc );
			let points = [];
			let normals = [];
			let indices = [];

			if ( json.PolyData ) {

				const piece = json.PolyData.Piece;
				const compressed = json.attributes.hasOwnProperty( 'compressor' );

				// Can be optimized
				// Loop through the sections
				const sections = [ 'PointData', 'Points', 'Strips', 'Polys' ];// +['CellData', 'Verts', 'Lines'];
				let sectionIndex = 0;
				const numberOfSections = sections.length;

				while ( sectionIndex < numberOfSections ) {

					const section = piece[ sections[ sectionIndex ] ];

					// If it has a DataArray in it

					if ( section && section.DataArray ) {

						// Depending on the number of DataArrays

						let arr;

						if ( Array.isArray( section.DataArray ) ) {

							arr = section.DataArray;

						} else {

							arr = [ section.DataArray ];

						}

						let dataArrayIndex = 0;
						const numberOfDataArrays = arr.length;

						while ( dataArrayIndex < numberOfDataArrays ) {

							// Parse the DataArray
							if ( ( '#text' in arr[ dataArrayIndex ] ) && ( arr[ dataArrayIndex ][ '#text' ].length > 0 ) ) {

								arr[ dataArrayIndex ].text = parseDataArray( arr[ dataArrayIndex ], compressed );

							}

							dataArrayIndex ++;

						}

						switch ( sections[ sectionIndex ] ) {

							// if iti is point data
							case 'PointData':

								{

									const numberOfPoints = parseInt( piece.attributes.NumberOfPoints );
									const normalsName = section.attributes.Normals;

									if ( numberOfPoints > 0 ) {

										for ( let i = 0, len = arr.length; i < len; i ++ ) {

											if ( normalsName === arr[ i ].attributes.Name ) {

												const components = arr[ i ].attributes.NumberOfComponents;
												normals = new Float32Array( numberOfPoints * components );
												normals.set( arr[ i ].text, 0 );

											}

										}

									}

								}

								break;

							// if it is points
							case 'Points':

								{

									const numberOfPoints = parseInt( piece.attributes.NumberOfPoints );

									if ( numberOfPoints > 0 ) {

										const components = section.DataArray.attributes.NumberOfComponents;
										points = new Float32Array( numberOfPoints * components );
										points.set( section.DataArray.text, 0 );

									}

								}

								break;

							// if it is strips
							case 'Strips':

								{

									const numberOfStrips = parseInt( piece.attributes.NumberOfStrips );

									if ( numberOfStrips > 0 ) {

										const connectivity = new Int32Array( section.DataArray[ 0 ].text.length );
										const offset = new Int32Array( section.DataArray[ 1 ].text.length );
										connectivity.set( section.DataArray[ 0 ].text, 0 );
										offset.set( section.DataArray[ 1 ].text, 0 );

										const size = numberOfStrips + connectivity.length;
										indices = new Uint32Array( 3 * size - 9 * numberOfStrips );

										let indicesIndex = 0;

										for ( let i = 0, len = numberOfStrips; i < len; i ++ ) {

											const strip = [];

											for ( let s = 0, len1 = offset[ i ], len0 = 0; s < len1 - len0; s ++ ) {

												strip.push( connectivity[ s ] );

												if ( i > 0 ) len0 = offset[ i - 1 ];

											}

											for ( let j = 0, len1 = offset[ i ], len0 = 0; j < len1 - len0 - 2; j ++ ) {

												if ( j % 2 ) {

													indices[ indicesIndex ++ ] = strip[ j ];
													indices[ indicesIndex ++ ] = strip[ j + 2 ];
													indices[ indicesIndex ++ ] = strip[ j + 1 ];

												} else {

													indices[ indicesIndex ++ ] = strip[ j ];
													indices[ indicesIndex ++ ] = strip[ j + 1 ];
													indices[ indicesIndex ++ ] = strip[ j + 2 ];

												}

												if ( i > 0 ) len0 = offset[ i - 1 ];

											}

										}

									}

								}

								break;

							// if it is polys
							case 'Polys':

								{

									const numberOfPolys = parseInt( piece.attributes.NumberOfPolys );

									if ( numberOfPolys > 0 ) {

										const connectivity = new Int32Array( section.DataArray[ 0 ].text.length );
										const offset = new Int32Array( section.DataArray[ 1 ].text.length );
										connectivity.set( section.DataArray[ 0 ].text, 0 );
										offset.set( section.DataArray[ 1 ].text, 0 );

										const size = numberOfPolys + connectivity.length;
										indices = new Uint32Array( 3 * size - 9 * numberOfPolys );
										let indicesIndex = 0, connectivityIndex = 0;
										let i = 0, len0 = 0;
										const len = numberOfPolys;

										while ( i < len ) {

											const poly = [];
											let s = 0;
											const len1 = offset[ i ];

											while ( s < len1 - len0 ) {

												poly.push( connectivity[ connectivityIndex ++ ] );
												s ++;

											}

											let j = 1;

											while ( j < len1 - len0 - 1 ) {

												indices[ indicesIndex ++ ] = poly[ 0 ];
												indices[ indicesIndex ++ ] = poly[ j ];
												indices[ indicesIndex ++ ] = poly[ j + 1 ];
												j ++;

											}

											i ++;
											len0 = offset[ i - 1 ];

										}

									}

								}

								break;

							default:
								break;

						}

					}

					sectionIndex ++;

				}

				const geometry = new BufferGeometry();
				geometry.setIndex( new BufferAttribute( indices, 1 ) );
				geometry.setAttribute( 'position', new BufferAttribute( points, 3 ) );

				if ( normals.length === points.length ) {

					geometry.setAttribute( 'normal', new BufferAttribute( normals, 3 ) );

				}

				return geometry;

			} else {

				throw new Error( 'Unsupported DATASET type' );

			}

		}

		const textDecoder = new TextDecoder();

		// get the 5 first lines of the files to check if there is the key word binary
		const meta = textDecoder.decode( new Uint8Array( data, 0, 250 ) ).split( '\n' );

		if ( meta[ 0 ].indexOf( 'xml' ) !== - 1 ) {

			return parseXML( textDecoder.decode( data ) );

		} else if ( meta[ 2 ].includes( 'ASCII' ) ) {

			return parseASCII( textDecoder.decode( data ) );

		} else {

			return parseBinary( data );

		}

	}

}

export { VTKLoader };
