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
		var materialsArray = [];
		var texturesArray = [];

		var geometriesMap = {};
		var materialsMap = {};
		var texturesMap = {};

		// todo: make object creation properly recursive

		var checkTexture = function ( map ) {

			if ( ! map ) return;

			if ( ! ( map.id in texturesMap ) ) {

				texturesMap[ map.id ] = true;
				texturesArray.push( TextureString( map ) );
				ntextures += 1;

			}

		};

		scene.traverse( function ( node ) {

			if ( node instanceof THREE.Mesh ) {

				objectsArray.push( ObjectString( node ) );
				nobjects += 1;

				if ( ! ( node.geometry.id in geometriesMap ) ) {

					geometriesMap[ node.geometry.id ] = true;
					geometriesArray.push( GeometryString( node.geometry ) );
					ngeometries += 1;

				}

				if ( ! ( node.material.id in materialsMap ) ) {

					materialsMap[ node.material.id ] = true;
					materialsArray.push( MaterialString( node.material ) );
					nmaterials += 1;

					checkTexture( node.material.map );
					checkTexture( node.material.envMap );
					checkTexture( node.material.lightMap );
					checkTexture( node.material.specularMap );
					checkTexture( node.material.bumpMap );
					checkTexture( node.material.normalMap );

				}

			} else if ( node instanceof THREE.Light ) {

				objectsArray.push( LightString( node ) );
				nobjects += 1;

			} else if ( node instanceof THREE.Camera ) {

				objectsArray.push( CameraString( node ) );
				nobjects += 1;

			}

		} );

		var objects = generateMultiLineString( objectsArray, ",\n\n\t" );
		var geometries = generateMultiLineString( geometriesArray, ",\n\n\t" );
		var materials = generateMultiLineString( materialsArray, ",\n\n\t" );
		var textures = generateMultiLineString( texturesArray, ",\n\n\t" );

		// todo: get somehow these from Viewport's renderer

		var bgcolor = ColorString( new THREE.Color( 0xaaaaaa ) );
		var bgalpha = 1.0;
		var defcamera = LabelString( "default_camera" );

		//

		function Vector2String( v ) {

			return "[" + v.x + "," + v.y + "]";

		}

		function Vector3String( v ) {

			return "[" + v.x + "," + v.y + "," + v.z + "]";

		}

		function ColorString( c ) {

			return "[" + c.r.toFixed( 3 ) + "," + c.g.toFixed( 3 ) + "," + c.b.toFixed( 3 ) + "]";

		}

		function LabelString( s ) {

			return '"' + s + '"';

		}

		function NumConstantString( c ) {

			var constants = [ "NearestFilter", "NearestMipMapNearestFilter" , "NearestMipMapLinearFilter",
							  "LinearFilter", "LinearMipMapNearestFilter", "LinearMipMapLinearFilter" ];

			for ( var i = 0; i < constants.length; i ++ ) {

				if ( THREE[ constants[ i ] ] === c ) return LabelString( constants[ i ] );

			};

			return "";

		}

		//

		function LightString( l ) {

			if ( l instanceof THREE.AmbientLight ) {

				var output = [

				'\t' + LabelString( getObjectName( l ) ) + ' : {',
				'	"type" : AmbientLight,',
				'	"color"  : ' + l.color.getHex(),
				'}'

				];

			} else if ( l instanceof THREE.DirectionalLight ) {

				var output = [

				'\t' + LabelString( getObjectName( l ) ) + ' : {',
				'	"type" : DirectionalLight,',
				'	"color"  : ' + l.color.getHex() + ',',
				'	"intensity"  : ' + l.intensity + ',',
				'	"direction" : ' + Vector3String( l.position ),
				'}'

				];

			} else if ( l instanceof THREE.PointLight ) {

				var output = [

				'\t' + LabelString( getObjectName( l ) ) + ' : {',
				'	"type" : PointLight,',
				'	"color"  : ' + l.color.getHex() + ',',
				'	"intensity"  : ' + l.intensity + ',',
				'	"position" : ' + Vector3String( l.position ) + ',',
				'	"distance"  : ' + l.distance,
				'}'

				];

			} else if ( l instanceof THREE.SpotLight ) {

				var output = [

				'\t' + LabelString( getObjectName( l ) ) + ' : {',
				'	"type" : SpotLight,',
				'	"color"  : ' + l.color.getHex() + ',',
				'	"intensity"  : ' + l.intensity + ',',
				'	"position" : ' + Vector3String( l.position ) + ',',
				'	"distance"  : ' + l.distance + ',',
				'	"angle"  : ' + l.angle + ',',
				'	"exponent"  : ' + l.exponent,
				'}'

				];

			} else if ( l instanceof THREE.HemisphereLight ) {

				var output = [

				'\t' + LabelString( getObjectName( l ) ) + ' : {',
				'	"type" : HemisphereLight,',
				'	"skyColor"  : ' + l.color.getHex() + ',',
				'	"groundColor"  : ' + l.groundColor.getHex() + ',',
				'	"intensity"  : ' + l.intensity + ',',
				'	"position" : ' + Vector3String( l.position ),
				'}'

				];

			} else {

				var output = [];

			}

			return output.join( '\n\t\t' );

		}

		function CameraString( c ) {

			if ( c instanceof THREE.PerspectiveCamera ) {

				var output = [

				'\t' + LabelString( getObjectName( c ) ) + ' : {',
				'	"type" : PerspectiveCamera,',
				'	"fov": ' + c.fov + ',',
				'	"aspect": ' + c.aspect + ',',
				'	"near": ' + c.near + ',',
				'	"far": ' + c.far + ',',
				'	"position" : ' + Vector3String( c.position ),
				'}'

				];

			} else if ( c instanceof THREE.OrthographicCamera ) {

				var output = [

				'\t' + LabelString( getObjectName( c ) ) + ' : {',
				'	"type" : OrthographicCamera,',
				'	"left": ' + c.left + ',',
				'	"right": ' + c.right + ',',
				'	"top": ' + c.top + ',',
				'	"bottom": ' + c.bottom + ',',
				'	"near": ' + c.near + ',',
				'	"far": ' + c.far + ',',
				'	"position" : ' + Vector3String( c.position ),
				'}'

				];

			} else {

				var output = [];

			}

			return output.join( '\n\t\t' );

		}

		function ObjectString( o ) {

			var output = [

			'\t' + LabelString( getObjectName( o ) ) + ' : {',
			'	"geometry" : '   + LabelString( getGeometryName( o.geometry ) ) + ',',
			'	"materials": [ ' + LabelString( getMaterialName( o.material ) ) + ' ],',
			'	"position" : ' + Vector3String( o.position ) + ',',
			'	"rotation" : ' + Vector3String( o.rotation ) + ',',
			'	"scale"	   : ' + Vector3String( o.scale ) + ',',
			'	"visible"  : ' + o.visible,
			'}'

			];

			return output.join( '\n\t\t' );

		}

		function GeometryString( g ) {

			if ( g instanceof THREE.SphereGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "sphere",',
				'	"radius"  : ' 		 + g.radius + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'}',

				];

			} else if ( g instanceof THREE.CubeGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "cube",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"depth"  : '  + g.depth  + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'	"depthSegments" : '  + g.depthSegments + ',',
				'}',

				];

			} else if ( g instanceof THREE.PlaneGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "plane",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'}',

				];

			} else {

				var output = [];

			}

			return generateMultiLineString( output, '\n\t\t' );

		}

		function MaterialString( m ) {

			if ( m instanceof THREE.MeshBasicMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshBasicMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',

				m.map ? 		'		"map" : ' + LabelString( getTextureName( m.map ) ) + ',' : '',
				m.envMap ? 		'		"envMap" : ' + LabelString( getTextureName( m.envMap ) ) + ',' : '',
				m.specularMap ? '		"specularMap" : ' + LabelString( getTextureName( m.specularMap ) ) + ',' : '',
				m.lightMap ? 	'		"lightMap" : ' + LabelString( getTextureName( m.lightMap ) ) + ',' : '',

				'		"reflectivity"  : ' + m.reflectivity + ',',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];


			} else if ( m instanceof THREE.MeshLambertMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshLambertMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',
				'		"ambient"  : ' 	+ m.ambient.getHex() + ',',
				'		"emissive"  : ' + m.emissive.getHex() + ',',

				m.map ? 		'		"map" : ' + LabelString( getTextureName( m.map ) ) + ',' : '',
				m.envMap ? 		'		"envMap" : ' + LabelString( getTextureName( m.envMap ) ) + ',' : '',
				m.specularMap ? '		"specularMap" : ' + LabelString( getTextureName( m.specularMap ) ) + ',' : '',
				m.lightMap ? 	'		"lightMap" : ' + LabelString( getTextureName( m.lightMap ) ) + ',' : '',

				'		"reflectivity"  : ' + m.reflectivity + ',',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshPhongMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshPhongMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',
				'		"ambient"  : ' 	+ m.ambient.getHex() + ',',
				'		"emissive"  : ' + m.emissive.getHex() + ',',
				'		"specular"  : ' + m.specular.getHex() + ',',
				'		"shininess" : ' + m.shininess + ',',

				m.map ? 		'		"map" : ' + LabelString( getTextureName( m.map ) ) + ',' : '',
				m.envMap ? 		'		"envMap" : ' + LabelString( getTextureName( m.envMap ) ) + ',' : '',
				m.specularMap ? '		"specularMap" : ' + LabelString( getTextureName( m.specularMap ) ) + ',' : '',
				m.lightMap ? 	'		"lightMap" : ' + LabelString( getTextureName( m.lightMap ) ) + ',' : '',
				m.normalMap ? 	'		"normalMap" : ' + LabelString( getTextureName( m.normalMap ) ) + ',' : '',
				m.bumpMap ? 	'		"bumpMap" : ' + LabelString( getTextureName( m.bumpMap ) ) + ',' : '',

				'		"bumpScale"  : ' + m.bumpScale + ',',
				'		"reflectivity"  : ' + m.reflectivity + ',',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshDepthMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshDepthMaterial",',
				'	"parameters"  : {',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshNormalMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshNormalMaterial",',
				'	"parameters"  : {',
				'		"transparent" : ' + m.transparent + ',',
				'		"opacity" : ' 	+ m.opacity + ',',
				'		"wireframe" : ' + m.wireframe + ',',
				'		"wireframeLinewidth" : ' + m.wireframeLinewidth,
				'	}',
				'}',

				];

			} else if ( m instanceof THREE.MeshFaceMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshFaceMaterial",',
				'	"parameters"  : {}',
				'}',

				];

			}

			return generateMultiLineString( output, '\n\t\t' );

		}

		function TextureString( t ) {

			// here would be also an option to use data URI
			// with embedded image from "t.image.src"
			// (that's a side effect of using FileReader to load images)

			var output = [

			'\t' + LabelString( getTextureName( t ) ) + ': {',
			'	"url"    : "' + t.sourceFile + '",',
			'	"repeat" : ' + Vector2String( t.repeat ) + ',',
			'	"offset" : ' + Vector2String( t.offset ) + ',',
			'	"magFilter" : ' + NumConstantString( t.magFilter ) + ',',
			'	"minFilter" : ' + NumConstantString( t.minFilter ) + ',',
			'	"anisotropy" : ' + t.anisotropy,
			'}',

			];

			return generateMultiLineString( output, '\n\t\t' );

		}

		//

		function generateMultiLineString( lines, separator ) {

			var cleanLines = [];

			for ( var i = 0; i < lines.length; i ++ ) {

				if ( lines[ i ] ) cleanLines.push( lines[ i ] );

			}

			return cleanLines.join( separator );

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

		function getTextureName( t ) {

			return t.name ? t.name : "Texture_" + t.id;

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
			'\t' + objects,
			'	},',
			'',

			'	"geometries" :',
			'	{',
			'\t' + 	geometries,
			'	},',
			'',

			'	"materials" :',
			'	{',
			'\t' + 	materials,
			'	},',
			'',

			'	"textures" :',
			'	{',
			'\t' + 	textures,
			'	},',
			'',

			'	"transform" :',
			'	{',
			'		"position"  : ' + position + ',',
			'		"rotation"  : ' + rotation + ',',
			'		"scale"     : ' + scale,
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
