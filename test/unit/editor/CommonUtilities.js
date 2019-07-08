/**
 * @author lxxxvi / https://github.com/lxxxvi
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

function mergeParams( defaults, customParams ) {

	if ( typeof customParams == "undefined" ) return defaults;

	var defaultKeys = Object.keys( defaults );
	var params = {};

	defaultKeys.map( function( key ) {

		params[ key ] = customParams[ key ] || defaultKeys[ key ];

	} );

	return params;

}


function getGeometryParams( type, customParams ) {

	if ( typeof customParams != "undefined" &&
		typeof customParams.geometry != "undefined" &&
		typeof customParams.geometry.parameters != "undefined" ) {

		var customGeometryParams = customParams.geometry.parameters;

	}

	var defaults = {};

	switch ( type ) {

		case "BoxGeometry":

			defaults = { width: 100, height: 100, depth: 100, widthSegments: 1, heightSegments: 1, depthSegments: 1 };
			break;

		case "SphereGeometry":

			defaults = { radius: 75, widthSegments: 32, heightSegments: 16, phiStart: 0, phiLength: 6.28, thetaStart: 0.00, thetaLength: 3.14 };
			break;

		default:

			console.error( "Type '" + type + "' is not known while creating params" );
			return false;

	}

	return mergeParams( defaults, customGeometryParams );

}

function getGeometry( type, customParams ) {

	var params = getGeometryParams( type, customParams );

	switch ( type ) {

		case "BoxGeometry":

			return new THREE.BoxGeometry(
				params[ 'width' ],
				params[ 'height' ],
				params[ 'depth' ],
				params[ 'widthSegments' ],
				params[ 'heightSegments' ],
				params[ 'depthSegments' ]
			);

		case "SphereGeometry":

			return new THREE.SphereGeometry(
				params[ 'radius' ],
				params[ 'widthSegments' ],
				params[ 'heightSegments' ],
				params[ 'phiStart' ],
				params[ 'phiLength' ],
				params[ 'thetaStart' ],
				params[ 'thetaLength' ]
			);

		default:

			console.error( "Type '" + type + "' is not known while creating geometry " );
			return false;

	}

}

function getObject( name, type, customParams ) {

	var geometry = getGeometry( type, customParams );

	var object = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
	object.name = name || type + " 1";

	return object;

}


function aBox( name, customParams ) {

	return getObject( name, "BoxGeometry", customParams );

}

function aSphere( name, customParams ) {

	return getObject( name, "SphereGeometry", customParams );

}

function aPointlight( name ) {

	var object = new THREE.PointLight( 54321, 1.0, 0.0, 1.0 );
	object.name = name || "PointLight 1";

	return object;

}

function aPerspectiveCamera( name ) {

	var object = new THREE.PerspectiveCamera( 50.1, 0.4, 1.03, 999.05 );
	object.name = name || "PerspectiveCamera 1";

	return object;

}

function getScriptCount( editor ) {

	var scriptsKeys = Object.keys( editor.scripts );
	var scriptCount = 0;

	for ( var i = 0; i < scriptsKeys.length; i ++ ) {

		scriptCount += editor.scripts[ scriptsKeys[ i ] ].length;

	}

	return scriptCount;

}

function exportScene( editor ) {

	var output = editor.scene.toJSON();
	output = JSON.stringify( output, null, '\t' );
	output = output.replace( /[\n\t]+([\d\.e\-\[\]]+)/g, '$1' );
	return output;

}

function importScene( data ) {

	var json = JSON.parse( data );
	var loader = new THREE.ObjectLoader();
	var result = loader.parse( json );

	return result;

}
