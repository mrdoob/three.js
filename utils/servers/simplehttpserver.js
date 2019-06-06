/**
 * a barebones HTTP server in JS
 * to serve three.js easily
 *
 * @author zz85 https://github.com/zz85
 *
 * Usage: node simplehttpserver.js <port number>
 *
 * do not use in production servers
 * and try
 *     npm install http-server -g
 * instead.
 */

var port = 8000,
	http = require( 'http' ),
	urlParser = require( 'url' ),
	fs = require( 'fs' ),
	path = require( 'path' ),
	currentDir = process.cwd(),
	mimeTypes = {
		"html": "text/html",
		"js": "text/javascript",
		"css": "text/css",
		"jpg": "image/jpeg",
		"png": "image/png",
		"gif": "image/gif",
		"ogg": "audio/ogg",
		"mp3": "audio/mpeg",
		"mp4": "video/mp4",
		"txt": "text/plain",
		"bin": "application/octet-stream"
	};

// https://github.com/parshap/node-sanitize-filename/blob/master/index.js#L33-L47
var illegalRe = /[\?<>:\*\|":]/g;
var controlRe = /[\x00-\x1f\x80-\x9f]/g;
var reservedRe = /^\.+$/;
var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
var windowsTrailingRe = /[\. ]+$/;

function sanitize( input ) {

	var sanitized = input
		.replace( /\//g, "\\" )
		.replace( illegalRe, "" )
		.replace( controlRe, "" )
		.replace( reservedRe, "" )
		.replace( windowsReservedRe, "" )
		.replace( windowsTrailingRe, "" );
	return sanitized;

}



port = process.argv[ 2 ] ? parseInt( process.argv[ 2 ], 0 ) : port;

function handleRequest( request, response ) {

	var urlObject = urlParser.parse( request.url, true );
	var pathname = decodeURIComponent( sanitize( urlObject.pathname ) );

	console.log( '[' + ( new Date() ).toUTCString() + '] ' + '"' + request.method + ' ' + pathname + '"' );

	var filePath = path.join( currentDir, pathname );

	fs.stat( filePath, function ( err, stats ) {

		if ( err ) {

			response.writeHead( 404, {} );
			response.end( 'File not found!' );
			return;

		}

		if ( stats.isFile() ) {

			fs.readFile( filePath, function ( err, data ) {

				if ( err ) {

					response.writeHead( 404, {} );
					response.end( 'Opps. Resource not found' );
					return;

				}

				var fileType = filePath.split( '.' ).pop().toLowerCase();

				response.writeHead( 200, {
					"Content-Type": mimeTypes[ fileType ] || mimeTypes[ 'bin' ]
				} );

				response.write( data );
				response.end();

			} );

		} else if ( stats.isDirectory() ) {

			fs.readdir( filePath, function ( error, files ) {

				if ( error ) {

					response.writeHead( 500, {} );
					response.end();
					return;

				}

				var l = pathname.length;
				if ( pathname.substring( l - 1 ) != '/' ) pathname += '/';

				response.writeHead( 200, { 'Content-Type': 'text/html' } );
				response.write( '<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>' + filePath + '</title></head><body>' );
				response.write( '<h1>' + filePath + '</h1>' );
				response.write( '<ul style="list-style:none;font-family:courier new;">' );
				files.unshift( '.', '..' );
				files.forEach( function ( item ) {

				  var urlpath = path.join( pathname, item ),
						itemStats = fs.statSync( path.join( currentDir, urlpath ) );

					if ( itemStats.isDirectory() ) {

						urlpath += '/';
						item += '/';

					}

					response.write( '<li><a href="' + urlpath + '">' + item + '</a></li>' );

				} );

				response.end( '</ul></body></html>' );

			} );

		}

	} );

}

http.createServer( handleRequest ).listen( port );

require( 'dns' ).lookup( require( 'os' ).hostname(), function ( err, addr ) {

 	console.log( 'Running at http://' + addr + ( ( port === 80 ) ? '' : ':' ) + port + '/' );

} );

console.log( 'Three.js server has started...' );
console.log( 'Base directory at ' + currentDir );
