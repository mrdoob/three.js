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

		var nobjects = 0;
		var ngeometries = 0;
		var nmaterials = 0;
		var ntextures = 0;

		var objectsArray = [];
		var geometriesArray = [];
		var materialsArray = [];
		var texturesArray = [];
		var fogsArray = [];

		var geometriesMap = {};
		var materialsMap = {};
		var texturesMap = {};

		// extract objects, geometries, materials, textures

		var checkTexture = function ( map ) {

			if ( ! map ) return;

			if ( ! ( map.id in texturesMap ) ) {

				texturesMap[ map.id ] = true;
				texturesArray.push( TextureString( map ) );
				ntextures += 1;

			}

		};

		var linesArray = [];

		function createObjectsList( object, pad ) {

			for ( var i = 0; i < object.children.length; i ++ ) {

				var node = object.children[ i ];

				if ( node instanceof THREE.Mesh ) {

					linesArray.push( MeshString( node, pad ) );
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

					linesArray.push( LightString( node, pad ) );
					nobjects += 1;

				} else if ( node instanceof THREE.Camera ) {

					linesArray.push( CameraString( node, pad ) );
					nobjects += 1;

				} else if ( node instanceof THREE.Object3D ) {

					linesArray.push( ObjectString( node, pad ) );
					nobjects += 1;

				}

				if ( node.children.length > 0 ) {

					linesArray.push( PaddingString( pad + 1 ) + '\t\t"children" : {' );

				}

				createObjectsList( node, pad + 2 );

				if ( node.children.length > 0 ) {

					linesArray.push( PaddingString( pad + 1 ) + "\t\t}" );

				}

				linesArray.push( PaddingString( pad ) + "\t\t}" + ( i < object.children.length - 1 ? ",\n" : "" ) );

			}

		}

		createObjectsList( scene, 0 );

		var objects = linesArray.join( "\n" );

		// extract fog

		if ( scene.fog ) {

			fogsArray.push( FogString( scene.fog ) );

		}

		// generate sections

		var geometries = generateMultiLineString( geometriesArray, ",\n\n\t" );
		var materials = generateMultiLineString( materialsArray, ",\n\n\t" );
		var textures = generateMultiLineString( texturesArray, ",\n\n\t" );
		var fogs = generateMultiLineString( fogsArray, ",\n\n\t" );

		// generate defaults

		var activeCamera = null;

		scene.traverse( function ( node ) {

			if ( node instanceof THREE.Camera && node.userData.active ) {

				activeCamera = node;

			}

		} );

		var defcamera = LabelString( activeCamera ? getObjectName( activeCamera ) : "" );
		var deffog = LabelString( scene.fog ? getFogName( scene.fog ) : "" );

		// templates

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

			var constants = [ "NearestFilter", "NearestMipMapNearestFilter", "NearestMipMapLinearFilter",
							  "LinearFilter", "LinearMipMapNearestFilter", "LinearMipMapLinearFilter" ];

			for ( var i = 0; i < constants.length; i ++ ) {

				if ( THREE[ constants[ i ] ] === c ) return LabelString( constants[ i ] );

			};

			return "";

		}

		function PaddingString( n ) {

			var output = "";

			for ( var i = 0; i < n; i ++ ) output += "\t";

			return output;

		}


		//

		function LightString( o, n ) {

			if ( o instanceof THREE.AmbientLight ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"  : "AmbientLight",',
				'	"color" : ' + o.color.getHex() + ( o.children.length ? ',' : '' )

				];

			} else if ( o instanceof THREE.DirectionalLight ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"      : "DirectionalLight",',
				'	"color"     : ' + o.color.getHex() + ',',
				'	"intensity" : ' + o.intensity + ',',
				'	"direction" : ' + Vector3String( o.position ) + ',',
				'	"target"    : ' + LabelString( getObjectName( o.target ) ) + ( o.children.length ? ',' : '' )

				];

			} else if ( o instanceof THREE.PointLight ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"           : "PointLight",',
				'	"color"          : ' + o.color.getHex() + ',',
				'	"intensity"      : ' + o.intensity + ',',
				'	"position"       : ' + Vector3String( o.position ) + ',',
				'	"decay"          : ' + o.decay + ',',
				'	"distance"       : ' + o.distance + ( o.children.length ? ',' : '' )

				];

			} else if ( o instanceof THREE.SpotLight ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"           : "SpotLight",',
				'	"color"          : ' + o.color.getHex() + ',',
				'	"intensity"      : ' + o.intensity + ',',
				'	"position"       : ' + Vector3String( o.position ) + ',',
				'	"distance"       : ' + o.distance + ',',
				'	"angle"          : ' + o.angle + ',',
				'	"exponent"       : ' + o.exponent + ',',
				'	"decay"          : ' + o.decay + ',',
				'	"target"         : ' + LabelString( getObjectName( o.target ) ) + ( o.children.length ? ',' : '' )

				];

			} else if ( o instanceof THREE.HemisphereLight ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"        : "HemisphereLight",',
				'	"skyColor"    : ' + o.color.getHex() + ',',
				'	"groundColor" : ' + o.groundColor.getHex() + ',',
				'	"intensity"   : ' + o.intensity + ',',
				'	"position"    : ' + Vector3String( o.position ) + ( o.children.length ? ',' : '' )

				];

			} else {

				var output = [];

			}

			return generateMultiLineString( output, '\n\t\t', n );

		}

		function CameraString( o, n ) {

			if ( o instanceof THREE.PerspectiveCamera ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"     : "PerspectiveCamera",',
				'	"fov"      : ' + o.fov + ',',
				'	"aspect"   : ' + o.aspect + ',',
				'	"near"     : ' + o.near + ',',
				'	"far"      : ' + o.far + ',',
				'	"position" : ' + Vector3String( o.position ) + ( o.children.length ? ',' : '' )

				];

			} else if ( o instanceof THREE.OrthographicCamera ) {

				var output = [

				'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
				'	"type"     : "OrthographicCamera",',
				'	"left"     : ' + o.left + ',',
				'	"right"    : ' + o.right + ',',
				'	"top"      : ' + o.top + ',',
				'	"bottom"   : ' + o.bottom + ',',
				'	"near"     : ' + o.near + ',',
				'	"far"      : ' + o.far + ',',
				'	"position" : ' + Vector3String( o.position ) + ( o.children.length ? ',' : '' )

				];

			} else {

				var output = [];

			}

			return generateMultiLineString( output, '\n\t\t', n );

		}

		function ObjectString( o, n ) {

			var output = [

			'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
			'	"position" : ' + Vector3String( o.position ) + ',',
			'	"rotation" : ' + Vector3String( o.rotation ) + ',',
			'	"scale"	   : ' + Vector3String( o.scale ) + ',',
			'	"visible"  : ' + o.visible + ( o.children.length ? ',' : '' )

			];

			return generateMultiLineString( output, '\n\t\t', n );

		}

		function MeshString( o, n ) {

			var output = [

			'\t\t' + LabelString( getObjectName( o ) ) + ' : {',
			'	"geometry" : ' + LabelString( getGeometryName( o.geometry ) ) + ',',
			'	"material" : ' + LabelString( getMaterialName( o.material ) ) + ',',
			'	"position" : ' + Vector3String( o.position ) + ',',
			'	"rotation" : ' + Vector3String( o.rotation ) + ',',
			'	"scale"	   : ' + Vector3String( o.scale ) + ',',
			'	"visible"  : ' + o.visible + ( o.children.length ? ',' : '' )

			];

			return generateMultiLineString( output, '\n\t\t', n );

		}

		//

		function GeometryString( g ) {

			if ( g instanceof THREE.SphereGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "sphere",',
				'	"radius"  : ' 		 + g.parameters.radius + ',',
				'	"widthSegments"  : ' + g.parameters.widthSegments + ',',
				'	"heightSegments" : ' + g.parameters.heightSegments,
				'}'

				];

			} else if ( g instanceof THREE.BoxGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "cube",',
				'	"width"  : '  + g.parameters.width  + ',',
				'	"height"  : ' + g.parameters.height + ',',
				'	"depth"  : '  + g.parameters.depth  + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments + ',',
				'	"depthSegments" : '  + g.depthSegments,
				'}'

				];

			} else if ( g instanceof THREE.PlaneGeometry ) {

				var output = [

				'\t' + LabelString( getGeometryName( g ) ) + ': {',
				'	"type"    : "plane",',
				'	"width"  : '  + g.width  + ',',
				'	"height"  : ' + g.height + ',',
				'	"widthSegments"  : ' + g.widthSegments + ',',
				'	"heightSegments" : ' + g.heightSegments,
				'}'

				];

			} else if ( g instanceof THREE.Geometry ) {

				if ( g.sourceType === "ascii" || g.sourceType === "ctm" || g.sourceType === "stl" || g.sourceType === "vtk" ) {

					var output = [

					'\t' + LabelString( getGeometryName( g ) ) + ': {',
					'	"type" : ' + LabelString( g.sourceType ) + ',',
					'	"url"  : ' + LabelString( g.sourceFile ),
					'}'

					];

				} else {

					var output = [];

				}

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
				'}'

				];


			} else if ( m instanceof THREE.MeshLambertMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshLambertMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',
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
				'}'

				];

			} else if ( m instanceof THREE.MeshPhongMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshPhongMaterial",',
				'	"parameters"  : {',
				'		"color"  : ' 	+ m.color.getHex() + ',',
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
				'}'

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
				'}'

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
				'}'

				];

			} else if ( m instanceof THREE.MeshFaceMaterial ) {

				var output = [

				'\t' + LabelString( getMaterialName( m ) ) + ': {',
				'	"type"    : "MeshFaceMaterial",',
				'	"parameters"  : {}',
				'}'

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
			'}'

			];

			return generateMultiLineString( output, '\n\t\t' );

		}

		//

		function FogString( f ) {

			if ( f instanceof THREE.Fog ) {

				var output = [

				'\t' + LabelString( getFogName( f ) ) + ': {',
				'	"type"  : "linear",',
				'	"color" : ' + ColorString( f.color ) + ',',
				'	"near"  : '  + f.near + ',',
				'	"far"   : '    + f.far,
				'}'

				];

			} else if ( f instanceof THREE.FogExp2 ) {

				var output = [

				'\t' + LabelString( getFogName( f ) ) + ': {',
				'	"type"    : "exp2",',
				'	"color"   : '  + ColorString( f.color ) + ',',
				'	"density" : ' + f.density,
				'}'

				];

			} else {

				var output = [];

			}

			return generateMultiLineString( output, '\n\t\t' );

		}

		//

		function generateMultiLineString( lines, separator, padding ) {

			var cleanLines = [];

			for ( var i = 0; i < lines.length; i ++ ) {

				var line = lines[ i ];

				if ( line ) {

					if ( padding ) line = PaddingString( padding ) + line;
					cleanLines.push(  line );

				}

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

		function getFogName( f ) {

			return f.name ? f.name : "Default fog";

		}

		//

		var output = [
			'{',
			'	"metadata": {',
			'		"formatVersion" : 3.2,',
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

			'	"fogs" :',
			'	{',
			'\t' + 	fogs,
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
			'		"camera"  : ' + defcamera + ',',
			'		"fog"  	  : ' + deffog,
			'	}',
			'}'
		].join( '\n' );

		return JSON.parse( output );

	}

}
