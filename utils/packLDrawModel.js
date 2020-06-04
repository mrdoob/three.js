/**
 * @author yomboprime / https://github.com/yomboprime/
 *
 * LDraw object packer
 *
 * Usage:
 *
 * - Download official parts library from LDraw.org and unzip in a directory (e.g. ldraw/)
 *
 * - Download your desired model file and place in the ldraw/models/ subfolder.
 *
 * - Place this script also in ldraw/
 *
 * - Issue command 'node packLDrawModel models/<modelFileName>'
 *
 * The packed object will be in ldraw/models/<modelFileName>_Packed.mpd and will contain all the object subtree as embedded files.
 *
 *
 */

var ldrawPath = './';
var materialsFileName = 'LDConfig.ldr';


var fs = require( 'fs' );
var path = require( 'path' );

if ( process.argv.length !== 3 ) {

	console.log( "Usage: node packLDrawModel <modelFilePath>" );
	exit( 0 );

}
var fileName = process.argv[ 2 ];

var materialsFilePath = path.join( ldrawPath, materialsFileName );

console.log( 'Loading materials file "' + materialsFilePath + '"...' );
var materialsContent = fs.readFileSync( materialsFilePath, { encoding: "utf8" } );

console.log( 'Packing "' + fileName + '"...' );

var objectsPaths = [];
var objectsContents = [];
var pathMap = {};
var listOfNotFound = [];

// Parse object tree
parseObject( fileName, true );

// Check if previously files not found are found now
// (if so, probably they were already embedded)
var someNotFound = false;
for ( var i = 0; i < listOfNotFound.length; i ++ ) {

	if ( ! pathMap[ listOfNotFound[ i ] ] ) {

		someNotFound = true;
		console.log( 'Error: File object not found: "' + fileName + '".' );

	}

}

if ( someNotFound ) {

	console.log( "Some files were not found, aborting." );
	process.exit( - 1 );

}

// Obtain packed content
var packedContent = materialsContent + "\n";
for ( var i = objectsPaths.length - 1; i >= 0; i -- ) {

	packedContent += objectsContents[ i ];

}
packedContent += "\n";

// Save output file
var outPath = fileName + "_Packed.mpd";
console.log( 'Writing "' + outPath + '"...' );
fs.writeFileSync( outPath, packedContent );

console.log( 'Done.' );


//

function parseObject( fileName, isRoot ) {

	// Returns the located path for fileName or null if not found

	console.log( 'Adding "' + fileName + '".' );

	var originalFileName = fileName;

	var prefix = "";
	var objectContent = null;
	for ( var attempt = 0; attempt < 2; attempt ++ ) {

		prefix = "";

		if ( attempt === 1 ) {

			fileName = fileName.toLowerCase();

		}

		if ( fileName.startsWith( '48/' ) ) {

			prefix = "p/";

		} else if ( fileName.startsWith( 's/' ) ) {

			prefix = "parts/";

		}

		var absoluteObjectPath = path.join( ldrawPath, fileName );

		try {

			objectContent = fs.readFileSync( absoluteObjectPath, { encoding: "utf8" } );
			break;

		} catch ( e ) {

			prefix = "parts/";
			absoluteObjectPath = path.join( ldrawPath, prefix, fileName );

			try {

				objectContent = fs.readFileSync( absoluteObjectPath, { encoding: "utf8" } );
				break;

			} catch ( e ) {

				prefix = "p/";
				absoluteObjectPath = path.join( ldrawPath, prefix, fileName );

				try {

					objectContent = fs.readFileSync( absoluteObjectPath, { encoding: "utf8" } );
					break;

				} catch ( e ) {

					try {

						prefix = "models/";
						absoluteObjectPath = path.join( ldrawPath, prefix, fileName );

						objectContent = fs.readFileSync( absoluteObjectPath, { encoding: "utf8" } );
						break;

					} catch ( e ) {

						if ( attempt === 1 ) {

							// The file has not been found, add to list of not found
							listOfNotFound.push( originalFileName );

						}

					}

				}

			}

		}

	}

	var objectPath = path.join( prefix, fileName );

	if ( ! objectContent ) {

		// File was not found, but could be a referenced embedded file.
		return null;

	}

	if ( objectContent.indexOf( '\r\n' ) !== - 1 ) {

		// This is faster than String.split with regex that splits on both
		objectContent = objectContent.replace( /\r\n/g, '\n' );

	}

	var processedObjectContent = isRoot ? "" : "0 FILE " + objectPath + "\n";

	var lines = objectContent.split( "\n" );

	for ( var i = 0, n = lines.length; i < n; i ++ ) {

		var line = lines[ i ];
		var lineLength = line.length;

		// Skip spaces/tabs
		var charIndex = 0;
		while ( ( line.charAt( charIndex ) === ' ' || line.charAt( charIndex ) === '\t' ) && charIndex < lineLength ) {

			charIndex ++;

		}
		line = line.substring( charIndex );
		lineLength = line.length;
		charIndex = 0;


		if ( line.startsWith( '0 FILE ' ) ) {

			if ( i === 0 ) {

				// Ignore first line FILE meta directive
				continue;

			}

			// Embedded object was found, add to path map

			var subobjectFileName = line.substring( charIndex ).trim().replace( /\\/g, '/' );

			if ( subobjectFileName ) {

				// Find name in path cache
				var subobjectPath = pathMap[ subobjectFileName ];

				if ( ! subobjectPath ) {

					pathMap[ subobjectFileName ] = subobjectFileName;

				}

			}

		}

		if ( line.startsWith( '1 ' ) ) {

			// Subobject, add it
			charIndex = 2;

			// Skip material, position and transform
			for ( var token = 0; token < 13 && charIndex < lineLength; token ++ ) {

				// Skip token
				while ( line.charAt( charIndex ) !== ' ' && line.charAt( charIndex ) !== '\t' && charIndex < lineLength ) {

					charIndex ++;

				}

				// Skip spaces/tabs
				while ( ( line.charAt( charIndex ) === ' ' || line.charAt( charIndex ) === '\t' ) && charIndex < lineLength ) {

					charIndex ++;

				}

			}

			var subobjectFileName = line.substring( charIndex ).trim().replace( /\\/g, '/' );

			if ( subobjectFileName ) {

				// Find name in path cache
				var subobjectPath = pathMap[ subobjectFileName ];

				if ( ! subobjectPath ) {

					// Add new object
					subobjectPath = parseObject( subobjectFileName );

				}

				pathMap[ subobjectFileName ] = subobjectPath ? subobjectPath : subobjectFileName;

				processedObjectContent += line.substring( 0, charIndex ) + pathMap[ subobjectFileName ] + "\n";

			}

		} else {

			processedObjectContent += line + "\n";

		}

	}

	if ( objectsPaths.indexOf( objectPath ) < 0 ) {

		objectsPaths.push( objectPath );
		objectsContents.push( processedObjectContent );

	}

	return objectPath;

}
