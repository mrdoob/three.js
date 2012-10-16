/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SceneExporter = function () {};

THREE.SceneExporter.prototype = {

	constructor: THREE.SceneExporter,

	parse: function ( scene ) {

		var position = Vector3String( scene.position );
		var rotation = Vector3String( scene.rotation );
		var scale = Vector3String( scene.scale );

		// todo: extract all scene elements

		var nobjects = 0;
		var ngeometries = 0;
		var nmaterials = 0;
		var ntextures = 0;

		var objectsArray = [];
		var geometriesArray = [];

		var geometriesMap = {};

		// todo: make object creation properly recursive

		scene.traverse( function ( node ) {

			if ( node instanceof THREE.Mesh ) {

				objectsArray.push( ObjectString( node ) );
				nobjects += 1;

				if ( ! ( node.geometry.id in geometriesMap ) ) {

					geometriesMap[ node.geometry.id ] = true;
					geometriesArray.push( GeometryString( node.geometry ) );
					ngeometries += 1;

				}

			}

		} );

		var objects = objectsArray.join( ",\n\t" );
		var geometries = geometriesArray.join( ",\n\t" );

		var materials = "";
		var textures = "";
		var cameras = "";
		var lights = "";

		// todo: get somehow these from Viewport's renderer

		var bgcolor = ColorString( new THREE.Color( 0xaaaaaa ) );
		var bgalpha = 1.0;
		var defcamera = LabelString( "default_camera" );

		//

		function Vector3String( v ) {

			return "[" + v.x + "," + v.y + "," + v.z + "]";

		}

		function ColorString( c ) {

			return "[" + c.r.toFixed( 3 ) + "," + c.g.toFixed( 3 ) + "," + c.b.toFixed( 3 ) + "]";

		}

		function LabelString( s ) {

			return '"' + s + '"';

		}

		//

		function ObjectString( o ) {

			var output = [

			'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
			'	"geometry" : '   + LabelString( getGeometryName( o.geometry ) ) + ',',
			'	"materials": [ ' + LabelString( getMaterialName( o.material ) ) + ' ],',
			'	"position" : ' + Vector3String( o.position ) + ',',
			'	"rotation" : ' + Vector3String( o.rotation ) + ',',
			'	"scale"	   : ' + Vector3String( o.scale ) + ',',
			'	"visible"  : ' + o.visible,
			'}'

			].join( '\n\t\t' );

			return output;

		}

		function GeometryString( g ) {

			if ( g instanceof THREE.SphereGeometry ) {

				var output = [

				'\t\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "sphere",',
				'	"radius"  : ' 		 + g.radius + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'}',

				].join( '\n\t\t' );

			} else if ( g instanceof THREE.CubeGeometry ) {

				var output = [

				'\t\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "cube",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"depth"  : '  + g.depth  + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'	"depthSegments" : '  + g.depthSegments + ',',
				'}',

				].join( '\n\t\t' );

			} else if ( g instanceof THREE.PlaneGeometry ) {

				var output = [

				'\t\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "plane",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'}',

				].join( '\n\t\t' );

			}

			return output;

		}

		function getObjectName( o ) {

			return o.name ? o.name : "Object_" + o.id;

		}

		function getGeometryName( g ) {

			return g.name ? g.name : "Geometry_" + g.id;

		}

		function getMaterialName( m ) {

			return m.name ? m.name : "Material_" + m.id;

		}

		//

		var output = [
			'{',
			'	"metadata": {',
			'		"formatVersion" : 3.1,',
			'		"type"		: "scene",',
			'		"generatedBy"	: "SceneExporter",',
			'		"objects"       : ' + nobjects + ',',
			'		"geometries"    : ' + ngeometries + ',',
			'		"materials"     : ' + nmaterials + ',',
			'		"textures"      : ' + ntextures,
			'	},',
			'',
			'	"urlBaseType": "relativeToScene",',
			'',

			'	"objects" :',
			'	{',
				objects,
			'	},',
			'',

			'	"geometries" :',
			'	{',
				geometries,
			'	},',
			'',

			'	"materials" :',
			'	{',
				materials,
			'	},',
			'',

			'	"textures" :',
			'	{',
				textures,
			'	},',
			'',

			'	"cameras" :',
			'	{',
				cameras,
			'	},',
			'',

			'	"lights" :',
			'	{',
				lights,
			'	},',
			'',

			'	"transform" :',
			'	{',
			'		"position"  : ' + position + ',',
			'		"rotation"  : ' + rotation + ',',
			'		"scale"     : ' + scale + ',',
			'	},',
			'',
			'	"defaults" :',
			'	{',
			'		"bgcolor" : ' + bgcolor + ',',
			'		"bgalpha" : ' + bgalpha + ',',
			'		"camera"  : ' + defcamera,
			'	}',
			'}'
		].join( '\n' );

		return output;

	}

}
