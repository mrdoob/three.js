/**
 * @author takahiro / http://github.com/takahirox
 *
 * Dependencies
 *  - mmd-parser https://github.com/takahirox/mmd-parser
 */

import {
	Matrix4,
	Quaternion,
	Vector3
} from "../../../build/three.module.js";

var MMDExporter = function () {

	// Unicode to Shift_JIS table
	var u2sTable;

	function unicodeToShiftjis( str ) {

		if ( u2sTable === undefined ) {

			var encoder = new MMDParser.CharsetEncoder();
			var table = encoder.s2uTable;
			u2sTable = {};

			var keys = Object.keys( table );

			for ( var i = 0, il = keys.length; i < il; i ++ ) {

				var key = keys[ i ];

				var value = table[ key ];
				key = parseInt( key );

				u2sTable[ value ] = key;

			}

		}

		var array = [];

		for ( var i = 0, il = str.length; i < il; i ++ ) {

			var code = str.charCodeAt( i );

			var value = u2sTable[ code ];

			if ( value === undefined ) {

				throw 'cannot convert charcode 0x' + code.toString( 16 );

			} else if ( value > 0xff ) {

				array.push( ( value >> 8 ) & 0xff );
				array.push( value & 0xff );

			} else {

				array.push( value & 0xff );

			}

		}

		return new Uint8Array( array );

	}

	function getBindBones( skin ) {

		// any more efficient ways?
		var poseSkin = skin.clone();
		poseSkin.pose();
		return poseSkin.skeleton.bones;

	}

	/* TODO: implement
	// mesh -> pmd
	this.parsePmd = function ( object ) {

	};
	*/

	/* TODO: implement
	// mesh -> pmx
	this.parsePmx = function ( object ) {

	};
	*/

	/*
	 * skeleton -> vpd
	 * Returns Shift_JIS encoded Uint8Array. Otherwise return strings.
	 */
	this.parseVpd = function ( skin, outputShiftJis, useOriginalBones ) {

		if ( skin.isSkinnedMesh !== true ) {

			console.warn( 'THREE.MMDExporter: parseVpd() requires SkinnedMesh instance.' );
			return null;

		}

		function toStringsFromNumber( num ) {

			if ( Math.abs( num ) < 1e-6 ) num = 0;

			var a = num.toString();

			if ( a.indexOf( '.' ) === - 1 ) {

				a += '.';

			}

			a += '000000';

			var index = a.indexOf( '.' );

			var d = a.slice( 0, index );
			var p = a.slice( index + 1, index + 7 );

			return d + '.' + p;

		}

		function toStringsFromArray( array ) {

			var a = [];

			for ( var i = 0, il = array.length; i < il; i ++ ) {

				a.push( toStringsFromNumber( array[ i ] ) );

			}

			return a.join( ',' );

		}

		skin.updateMatrixWorld( true );

		var bones = skin.skeleton.bones;
		var bones2 = getBindBones( skin );

		var position = new Vector3();
		var quaternion = new Quaternion();
		var quaternion2 = new Quaternion();
		var matrix = new Matrix4();

		var array = [];
		array.push( 'Vocaloid Pose Data file' );
		array.push( '' );
		array.push( ( skin.name !== '' ? skin.name.replace( /\s/g, '_' ) : 'skin' ) + '.osm;' );
		array.push( bones.length + ';' );
		array.push( '' );

		for ( var i = 0, il = bones.length; i < il; i ++ ) {

			var bone = bones[ i ];
			var bone2 = bones2[ i ];

			/*
			 * use the bone matrix saved before solving IK.
			 * see CCDIKSolver for the detail.
			 */
			if ( useOriginalBones === true &&
				bone.userData.ik !== undefined &&
				bone.userData.ik.originalMatrix !== undefined ) {

				matrix.fromArray( bone.userData.ik.originalMatrix );

			} else {

				matrix.copy( bone.matrix );

			}

			position.setFromMatrixPosition( matrix );
			quaternion.setFromRotationMatrix( matrix );

			var pArray = position.sub( bone2.position ).toArray();
			var qArray = quaternion2.copy( bone2.quaternion ).conjugate().multiply( quaternion ).toArray();

			// right to left
			pArray[ 2 ] = - pArray[ 2 ];
			qArray[ 0 ] = - qArray[ 0 ];
			qArray[ 1 ] = - qArray[ 1 ];

			array.push( 'Bone' + i + '{' + bone.name );
			array.push( '  ' + toStringsFromArray( pArray ) + ';' );
			array.push( '  ' + toStringsFromArray( qArray ) + ';' );
			array.push( '}' );
			array.push( '' );

		}

		array.push( '' );

		var lines = array.join( '\n' );

		return ( outputShiftJis === true ) ? unicodeToShiftjis( lines ) : lines;

	};

	/* TODO: implement
	// animation + skeleton -> vmd
	this.parseVmd = function ( object ) {

	};
	*/

};

export { MMDExporter };
