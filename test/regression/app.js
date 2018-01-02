var express = require( 'express' );
var multiparty = require( 'multiparty' );
var fs = require( 'fs' );
var path = require( 'path' );

const TestPath = 'test/regression/';

var app = express();
app.use( express.static( path.join( __dirname, '../../' ) ) );
app.route( '/' + TestPath + 'uploadImage' ).post( function ( req, res ) {

	var form = new multiparty.Form();
	form.parse( req, function ( err, fields, files ) {

		var filename = TestPath + fields.filename[ 0 ];
		var imageData = fields.imagedata[ 0 ].replace( /^data:image\/\w+;base64,/, '' );
		var dataBuffer = new Buffer( imageData, 'base64' );
		fs.writeFile( filename, dataBuffer, function ( err ) {

			if ( err ) {

				res.send( err );
				console.log( err );

			} else {

				res.send( 'okay!' );

			}

		} );

	} );

} );

var server = app.listen( 8080, function () {

	console.log( 'Please navigate your browser to: localhost:8080/' + TestPath + ' to run test.' );

} );
