/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ColladaLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ColladaLoader.prototype = {

	constructor: THREE.ColladaLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.load( url, function ( text ) {

			scope.parse( text, url, function ( data ) {

				onLoad( data );

			} )

		}, onProgress, onError );

	},

	options: {

		set convertUpAxis ( value ) {

			console.log( 'ColladaLoder.options.convertUpAxis: TODO' );

		}

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( text, url, cb ) {

		var scope = this;

		function getElementsByTagName( xml, name ) {

			// Non recursive xml.getElementsByTagName() ...

			var array = [];
			var childNodes = xml.childNodes;

			for ( var i = 0, l = childNodes.length; i < l; i ++ ) {

				var child = childNodes[ i ];

				if ( child.nodeName === name ) {

					array.push( child );

				}

			}

			return array;

		}

		/**
		 * used to have a common callback, after a set of callbacks executes
		 * usage: var queue = callbackQueue(whenDoneAll);
		 * queue.enqueue(); //for each async method
		 * asyncMethod().onDone(queue.dequeue);
		 * queue.start();
		 * @param cb
		 * @returns {{enqueue: enqueue, dequeue: dequeue, start: start}}
		 * @private
		 */
		function callbackQueue( cb ) {

			var counter = 1; //1 to prevent cb execution on only sync dequeues

			return {
				enqueue: function () {

					counter ++;

				},

				dequeue: function () {

					counter --;

					if ( counter == 0 ) {

						counter -= 20; //to not execute on check again

						cb();

					}

				},

				start: function () { //if queue is empty, execute callback

					this.dequeue();

				}
			};

		}

		function parseFloats( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseFloat( parts[ i ] );

			}

			return array;

		}

		function parseInts( text ) {

			if ( text.length === 0 ) return [];

			var parts = text.trim().split( /\s+/ );
			var array = new Array( parts.length );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {

				array[ i ] = parseInt( parts[ i ] );

			}

			return array;

		}

		function parseId( text ) {

			return ( text.charAt( 0 ) != '#' ) ? text : text.substring( 1 );

		}

		// asset

		function parseAsset( xml ) {

			return {
				unit: parseAssetUnit( getElementsByTagName( xml, 'unit' )[ 0 ] ),
				upAxis: parseAssetUpAxis( getElementsByTagName( xml, 'up_axis' )[ 0 ] )
			};

		}

		function parseAssetUnit( xml ) {

			return xml !== undefined ? parseFloat( xml.getAttribute( 'meter' ) ) : 1;

		}

		function parseAssetUpAxis( xml ) {

			return xml !== undefined ? xml.textContent : 'Y_UP';

		}

		// library

		function parseLibrary( xml, libraryName, nodeName, parser ) {

			var library = getElementsByTagName( xml, libraryName )[ 0 ];

			if ( library !== undefined ) {

				var elements = getElementsByTagName( library, nodeName );

				for ( var i = 0; i < elements.length; i ++ ) {

					parser( elements[ i ] );

				}

			}

		}

		function buildLibrary( data, builder ) {

			for ( var name in data ) {

				var object = data[ name ];
				object.build = builder( data[ name ] );

			}

		}

		// get

		function getBuild( data, builder, cb ) {

			if ( data.build !== undefined ) return data.build;

			data.build = builder( data, cb );

			return data.build;

		}

		// image

		var imageLoader = new THREE.ImageLoader();

		if ( this.crossOrigin ) {

			imageLoader.crossOrigin = this.crossOrigin;

		}

		function parseImage( xml ) {

			var data = {
				init_from: getElementsByTagName( xml, 'init_from' )[ 0 ].textContent
			};

			library.images[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildImage( data ) {

			if ( data.build !== undefined ) return data.build;

			var url = data.init_from;

			if ( baseUrl !== undefined ) url = baseUrl + url;

			return imageLoader.load( url );

		}

		function getImage( id ) {

			return getBuild( library.images[ id ], buildImage );

		}

		// effect

		function parseEffect( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'profile_COMMON':
						data.profile = parseEffectProfileCOMMON( child );
						break;

				}

			}

			library.effects[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseEffectProfileCOMMON( xml ) {

			var data = {
				surfaces: {},
				samplers: {}
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'newparam':
						parseEffectNewparam( child, data );
						break;

					case 'technique':
						data.technique = parseEffectTechnique( child );
						break;

				}

			}

			return data;

		}

		function parseEffectNewparam( xml, data ) {

			var sid = xml.getAttribute( 'sid' );

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'surface':
						data.surfaces[ sid ] = parseEffectSurface( child );
						break;

					case 'sampler2D':
						data.samplers[ sid ] = parseEffectSampler( child );
						break;

				}

			}

		}

		function parseEffectSurface( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'init_from':
						data.init_from = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectSampler( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'source':
						data.source = child.textContent;
						break;

				}

			}

			return data;

		}

		function parseEffectTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'constant':
					case 'lambert':
					case 'blinn':
					case 'phong':
						data.type = child.nodeName;
						data.parameters = parseEffectParameters( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameters( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'emission':
					case 'diffuse':
					case 'specular':
					case 'shininess':
					case 'transparency':
						data[ child.nodeName ] = parseEffectParameter( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameter( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						data[ child.nodeName ] = parseFloats( child.textContent );
						break;

					case 'float':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'texture':
						data[ child.nodeName ] = { id: child.getAttribute( 'texture' ), extra: parseEffectParameterTexture( child ) };
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTexture( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'extra':
						data = parseEffectParameterTextureExtra( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtra( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique':
						data[ child.nodeName ] = parseEffectParameterTextureExtraTechnique( child );
						break;

				}

			}

			return data;

		}

		function parseEffectParameterTextureExtraTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'repeatU':
					case 'repeatV':
					case 'offsetU':
					case 'offsetV':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

					case 'wrapU':
					case 'wrapV':
						data[ child.nodeName ] = parseInt( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildEffect( data ) {

			return data;

		}

		function getEffect( id ) {

			return getBuild( library.effects[ id ], buildEffect );

		}

		// material

		function parseMaterial( xml ) {

			var data = {
				name: xml.getAttribute( 'name' )
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'instance_effect':
						data.url = parseId( child.getAttribute( 'url' ) );
						break;

				}

			}

			library.materials[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildMaterial( data ) {

			var effect = getEffect( data.url );
			var technique = effect.profile.technique;

			var material;

			switch ( technique.type ) {

				case 'phong':
				case 'blinn':
					material = new THREE.MeshPhongMaterial();
					break;

				case 'lambert':
					material = new THREE.MeshLambertMaterial();
					break;

				default:
					material = new THREE.MeshBasicMaterial();
					break;

			}

			material.name = data.name;

			function getTexture( textureObject ) {

				var sampler = effect.profile.samplers[ textureObject.id ];

				if ( sampler !== undefined ) {

					var surface = effect.profile.surfaces[ sampler.source ];

					var texture = new THREE.Texture( getImage( surface.init_from ) );

					var extra = textureObject.extra;

					if ( extra !== undefined && extra.technique !== undefined ) {

						var technique = extra.technique;

						texture.wrapS = technique.wrapU ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
						texture.wrapT = technique.wrapV ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;

						texture.offset.set( technique.offsetU, technique.offsetV );
						texture.repeat.set( technique.repeatU, technique.repeatV );

					} else {

						texture.wrapS = THREE.RepeatWrapping;
						texture.wrapT = THREE.RepeatWrapping;

					}

					texture.needsUpdate = true;

					return texture;

				}

				console.error( 'ColladaLoder: Undefined sampler', textureObject.id );

				return null;

			}

			var parameters = technique.parameters;

			for ( var key in parameters ) {

				var parameter = parameters[ key ];

				switch ( key ) {
					case 'diffuse':
						if ( parameter.color ) material.color.fromArray( parameter.color );
						if ( parameter.texture ) material.map = getTexture( parameter.texture );
						break;
					case 'specular':
						if ( parameter.color && material.specular )
							material.specular.fromArray( parameter.color );
						break;
					case 'shininess':
						if ( parameter.float && material.shininess )
							material.shininess = parameter.float;
						break;
					case 'emission':
						if ( parameter.color && material.emissive )
							material.emissive.fromArray( parameter.color );
						break;
					case 'transparency':
						if ( parameter.float )
							material.opacity = parameter.float;
						if ( parameter.float !== 1 )
							material.transparent = true;
						break;
				}

			}

			return material;

		}

		function getMaterial( id, cb ) {

			return getBuild( library.materials[ id ], buildMaterial, cb );

		}

		function getInstanceMaterial( url, cb ) {

			return getInstanceBuild( library.materials, url, getMaterial, cb );

		}

		// camera

		function parseCamera( xml ) {

			var data = {
				name: xml.getAttribute( 'name' )
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'optics':
						data.optics = parseCameraOptics( child );
						break;

				}

			}

			library.cameras[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseCameraOptics( xml ) {

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'technique_common':
						return parseCameraTechnique( child );

				}

			}

			return {};

		}

		function parseCameraTechnique( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'perspective':
					case 'orthographic':

						data.technique = child.nodeName;
						data.parameters = parseCameraParameters( child );

						break;

				}

			}

			return data;

		}

		function parseCameraParameters( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				switch ( child.nodeName ) {

					case 'xfov':
					case 'yfov':
					case 'xmag':
					case 'ymag':
					case 'znear':
					case 'zfar':
					case 'aspect_ratio':
						data[ child.nodeName ] = parseFloat( child.textContent );
						break;

				}

			}

			return data;

		}

		function buildCamera( data ) {

			var camera;

			switch ( data.optics.technique ) {

				case 'perspective':
					camera = new THREE.PerspectiveCamera(
						data.optics.parameters.yfov,
						data.optics.parameters.aspect_ratio,
						data.optics.parameters.znear,
						data.optics.parameters.zfar
					);
					break;

				case 'orthographic':
					camera = new THREE.OrthographicCamera( /* TODO */ );
					break;

				default:
					camera = new THREE.PerspectiveCamera();
					break;

			}

			camera.name = data.name;

			return camera;

		}


		function getCamera( id ) {

			return getBuild( library.cameras[ id ], buildCamera );

		}

		// light

		function parseLight( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'technique_common':
						data = parseLightTechnique( child );
						break;

				}

			}

			library.lights[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseLightTechnique( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'directional':
					case 'point':
					case 'spot':
					case 'ambient':

						data.technique = child.nodeName;
						data.parameters = parseLightParameters( child );

				}

			}

			return data;

		}

		function parseLightParameters( xml ) {

			var data = {};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'color':
						var array = parseFloats( child.textContent );
						data.color = new THREE.Color().fromArray( array );
						break;

					case 'falloff_angle':
						data.falloffAngle = parseFloat( child.textContent );
						break;

					case 'quadratic_attenuation':
						var f = parseFloat( child.textContent );
						data.distance = f ? Math.sqrt( 1 / f ) : 0;
						break;

				}

			}

			return data;

		}

		function buildLight( data ) {

			var light;

			switch ( data.technique ) {

				case 'directional':
					light = new THREE.DirectionalLight();
					break;

				case 'point':
					light = new THREE.PointLight();
					break;

				case 'spot':
					light = new THREE.SpotLight();
					break;

				case 'ambient':
					light = new THREE.AmbientLight();
					break;

			}

			if ( data.parameters.color ) light.color.copy( data.parameters.color );
			if ( data.parameters.distance ) light.distance = data.parameters.distance;

			return light;

		}

		function getLight( id ) {

			return getBuild( library.lights[ id ], buildLight );

		}

		// geometry

		function parseGeometry( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				sources: {},
				vertices: {},
				primitives: []
			};

			var mesh = getElementsByTagName( xml, 'mesh' )[ 0 ];

			for ( var i = 0; i < mesh.childNodes.length; i ++ ) {

				var child = mesh.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				var id = child.getAttribute( 'id' );

				switch ( child.nodeName ) {

					case 'source':
						data.sources[ id ] = parseGeometrySource( child );
						break;

					case 'vertices':
						// data.sources[ id ] = data.sources[ parseId( getElementsByTagName( child, 'input' )[ 0 ].getAttribute( 'source' ) ) ];
						data.vertices = parseGeometryVertices( child );
						break;

					case 'polygons':
						console.log( 'ColladaLoader: Unsupported primitive type: ', child.nodeName );
						break;

					case 'lines':
					case 'linestrips':
					case 'polylist':
					case 'triangles':
						data.primitives.push( parseGeometryPrimitive( child ) );
						break;

					default:
						console.log( child );

				}

			}

			library.geometries[ xml.getAttribute( 'id' ) ] = data;

		}

		function parseGeometrySource( xml ) {

			var data = {
				array: [],
				stride: 3
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'float_array':
						data.array = parseFloats( child.textContent );
						break;

					case 'technique_common':
						var accessor = getElementsByTagName( child, 'accessor' )[ 0 ];

						if ( accessor !== undefined ) {

							data.stride = parseInt( accessor.getAttribute( 'stride' ) );

						}
						break;

					default:
						console.log( child );

				}

			}

			return data;

		}

		function parseGeometryVertices( xml ) {

			var data = {};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				data[ child.getAttribute( 'semantic' ) ] = parseId( child.getAttribute( 'source' ) );

			}

			return data;

		}

		function parseGeometryPrimitive( xml ) {

			var primitive = {
				type: xml.nodeName,
				material: xml.getAttribute( 'material' ),
				inputs: {},
				stride: 0
			};

			for ( var i = 0, l = xml.childNodes.length; i < l; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'input':
						var id = parseId( child.getAttribute( 'source' ) );
						var semantic = child.getAttribute( 'semantic' );
						var offset = parseInt( child.getAttribute( 'offset' ) );
						primitive.inputs[ semantic ] = { id: id, offset: offset };
						primitive.stride = Math.max( primitive.stride, offset + 1 );
						break;

					case 'vcount':
						primitive.vcount = parseInts( child.textContent );
						break;

					case 'p':
						primitive.p = parseInts( child.textContent );
						break;

				}

			}

			return primitive;

		}

		var DEFAULT_LINEMATERIAL = new THREE.LineBasicMaterial();
		var DEFAULT_MESHMATERIAL = new THREE.MeshPhongMaterial();

		function buildGeometry( data ) {

			var group = {};

			var sources = data.sources;
			var vertices = data.vertices;
			var primitives = data.primitives;

			if ( primitives.length === 0 ) return group;

			for ( var p = 0; p < primitives.length; p ++ ) {

				var primitive = primitives[ p ];
				var inputs = primitive.inputs;

				var geometry = new THREE.BufferGeometry();

				if ( data.name ) geometry.name = data.name;

				for ( var name in inputs ) {

					var input = inputs[ name ];

					switch ( name )	{

						case 'VERTEX':
							for ( var key in vertices ) {

								geometry.addAttribute( key.toLowerCase(), buildGeometryAttribute( primitive, sources[ vertices[ key ] ], input.offset ) );

							}
							break;

						case 'NORMAL':
							geometry.addAttribute( 'normal', buildGeometryAttribute( primitive, sources[ input.id ], input.offset ) );
							break;

						case 'COLOR':
							geometry.addAttribute( 'color', buildGeometryAttribute( primitive, sources[ input.id ], input.offset ) );
							break;

						case 'TEXCOORD':
							geometry.addAttribute( 'uv', buildGeometryAttribute( primitive, sources[ input.id ], input.offset ) );
							break;

					}

				}

				var object;

				switch ( primitive.type ) {

					case 'lines':
						object = new THREE.LineSegments( geometry, DEFAULT_LINEMATERIAL );
						break;

					case 'linestrips':
						object = new THREE.Line( geometry, DEFAULT_LINEMATERIAL );
						break;

					case 'triangles':
					case 'polylist':
						object = new THREE.Mesh( geometry, DEFAULT_MESHMATERIAL );
						break;

				}

				group[ primitive.material ] = object;

			}

			return group;

		}

		function buildGeometryAttribute( primitive, source, offset ) {

			var indices = primitive.p;
			var stride = primitive.stride;
			var vcount = primitive.vcount;

			function pushVector( i ) {

				var index = indices[ i + offset ] * sourceStride;
				var length = index + sourceStride;

				for ( ; index < length; index ++ ) {

					array.push( sourceArray[ index ] );

				}

			}

			var maxcount = 0;

			var sourceArray = source.array;
			var sourceStride = source.stride;

			var array = [];

			if ( primitive.vcount !== undefined ) {

				var index = 0;

				for ( var i = 0, l = vcount.length; i < l; i ++ ) {

					var count = vcount[ i ];

					if ( count === 4 ) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;
						var d = index + stride * 3;

						pushVector( a ); pushVector( b ); pushVector( d );
						pushVector( b ); pushVector( c ); pushVector( d );

					} else if ( count === 3 ) {

						var a = index + stride * 0;
						var b = index + stride * 1;
						var c = index + stride * 2;

						pushVector( a ); pushVector( b ); pushVector( c );

					} else {

						maxcount = Math.max( maxcount, count );

					}

					index += stride * count;

				}

				if ( maxcount > 0 ) {

					console.log( 'ColladaLoader: Geometry has faces with more than 4 vertices.' );

				}

			} else {

				for ( var i = 0, l = indices.length; i < l; i += stride ) {

					pushVector( i );

				}

			}

			return new THREE.Float32Attribute( array, sourceStride );

		}

		function getGeometry( id, cb ) {

			return getBuild( library.geometries[ id ], buildGeometry, cb );

		}

		function getInstanceGeometry( url, cb ) {

			return getInstanceBuild( library.geometries, url, getGeometry, cb );

		}

		// nodes

		var matrix = new THREE.Matrix4();
		var vector = new THREE.Vector3();

		function parseNode( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				id: xml.getAttribute( 'id' ), //used to reference a node inside a dae file
				matrix: new THREE.Matrix4(),
				nodes: [],
				instanceCameras: [],
				instanceLights: [],
				instanceGeometries: [],
				instanceNodes: []
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeType !== 1 ) continue;

				switch ( child.nodeName ) {

					case 'node':
						parseNode( child );
						data.nodes.push( child.getAttribute( 'id' ) );
						break;

					case 'instance_camera':
						data.instanceCameras.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_light':
						data.instanceLights.push( parseId( child.getAttribute( 'url' ) ) );
						break;

					case 'instance_geometry':
						data.instanceGeometries.push( parseNodeInstanceGeometry( child ) );
						break;

					case 'instance_node':
						data.instanceNodes.push( child.getAttribute( 'url' ) );
						break;

					case 'matrix':
						var array = parseFloats( child.textContent );
						data.matrix.multiply( matrix.fromArray( array ).transpose() ); // .transpose() when Z_UP?
						break;

					case 'translate':
						var array = parseFloats( child.textContent );
						vector.fromArray( array );
						data.matrix.multiply( matrix.makeTranslation( vector.x, vector.y, vector.z ) );
						break;

					case 'rotate':
						var array = parseFloats( child.textContent );
						var angle = THREE.Math.degToRad( array[ 3 ] );
						data.matrix.multiply( matrix.makeRotationAxis( vector.fromArray( array ), angle ) );
						break;

					case 'scale':
						var array = parseFloats( child.textContent );
						data.matrix.scale( vector.fromArray( array ) );
						break;

					case 'extra':
						break;

					default:
						console.log( child );

				}

			}

			if ( xml.getAttribute( 'id' ) !== null ) {

				library.nodes[ xml.getAttribute( 'id' ) ] = data;

			}

			return data;

		}

		function parseNodeInstanceGeometry( xml ) {

			var data = {
				id: xml.getAttribute( 'url' ),
				materials: {}
			};

			for ( var i = 0; i < xml.childNodes.length; i ++ ) {

				var child = xml.childNodes[ i ];

				if ( child.nodeName === 'bind_material' ) {

					var instances = child.getElementsByTagName( 'instance_material' );

					for ( var j = 0; j < instances.length; j ++ ) {

						var instance = instances[ j ];
						var symbol = instance.getAttribute( 'symbol' );
						var target = instance.getAttribute( 'target' );

						data.materials[ symbol ] = target;

					}

					break;

				}

			}

			return data;

		}

		function buildNode( data, cb ) {

			var objects = [];

			var matrix = data.matrix;
			var nodes = data.nodes;
			var instanceCameras = data.instanceCameras;
			var instanceLights = data.instanceLights;
			var instanceGeometries = data.instanceGeometries;
			var instanceNodes = data.instanceNodes;

			function done() {

				var object;

				if ( nodes.length === 0 && objects.length === 1 ) {

					object = objects[ 0 ];

				} else {

					object = new THREE.Group();

					for ( var i = 0; i < objects.length; i ++ ) {

						object.add( objects[ i ] );

					}

				}

				object.name = data.name;
				matrix.decompose( object.position, object.quaternion, object.scale );

				object.userData._id = data.id; //store the id to be able to reference the node
				object.userData._fileName = fileName; //id might not be unique across files

				cb( object );

			}

			var promises = new callbackQueue( done );

			for ( var i = 0, l = nodes.length; i < l; i ++ ) {

				promises.enqueue();

				getNode( nodes[ i ], function ( node ) {

					objects.push( node.clone() );
					promises.dequeue();

				} );

			}

			for ( var i = 0, l = instanceCameras.length; i < l; i ++ ) {

				objects.push( getCamera( instanceCameras[ i ] ).clone() );

			}

			for ( var i = 0, l = instanceLights.length; i < l; i ++ ) {

				objects.push( getLight( instanceLights[ i ] ).clone() );

			}

			for ( var i = 0, l = instanceGeometries.length; i < l; i ++ ) {

				promises.enqueue();

				var instance = instanceGeometries[ i ];

				( function ( instance ) {

					getInstanceGeometry( instance.id, function ( geometries ) {

						var waitForMaterials = new callbackQueue( promises.dequeue );

						for ( var key in geometries ) {

							var object = geometries[ key ].clone();

							if ( instance.materials[ key ] !== undefined ) {

								waitForMaterials.enqueue();

								( function ( object ) {

									getInstanceMaterial( instance.materials[ key ], function ( material ) {

										object.material = material;
										objects.push( object );
										waitForMaterials.dequeue();

									} );

								} )( object )

							}

						}

						waitForMaterials.start();

					} );

				} )( instance )

			}

			for ( var i = 0, l = instanceNodes.length; i < l; i ++ ) {

				promises.enqueue();

				getInstanceNode( instanceNodes[ i ], function ( node ) {

					objects.push( node ); //todo why not use clone()?
					promises.dequeue();

				} );

			}

			promises.start();

		}

		function getNode( id, cb ) {

			return getBuild( library.nodes[ id ], buildNode, cb );

		}

		/**
		 * Returns the build from the cache or creates it
		 *
		 * @param library
		 * @param url
		 * @param cb
		 * @param builder
		 */
		function getInstanceBuild( library, url, builder, cb ) {

			if ( ! library[ url ] ) { //add the instance to the library, if it does not exist

				library[ url ] = {};

			}

			var data = library[ url ];

			if ( data.build !== undefined ) {

				cb( data.build );

			} else {

				( function ( data ) { //capture the state, since the vars may change when cache is called

					function cache( node ) {

						data.build = node;
						cb( node );

					}

					if ( url.charAt( 0 ) == '#' ) { //relative url

						var res = builder( url.substr( 1 ), cache );

						if ( res ) { //builder is sync

							cache( res );

						}

					} else if ( url.indexOf( 'dae' ) > 0 ) { //absolute url

						loadInstance( url, function ( node ) {

							cache( node )

						} );

					} else {

						console.log( 'unknown reference: ' + url );

					}

				} )( data );

			}

		}

		var files = {};

		function getCachedInstanceByUrl( url, cb ) {

			function CachedColladaLoader( url ) {

				var data = null;
				var queue = [];

				var loader = new THREE.ColladaLoader( scope.manager );

				loader.load( baseUrl + url, function ( res ) {

					data = res;

					for ( var i = 0; i < queue.length; i ++ ) {

						var callback = queue[ i ];
						callback( res );

					}

				} );

				return {

					get: function ( callback ) {

						if ( data ) {

							callback( data );

						} else {

							queue.push( callback );

						}

					}

				};

			}

			var filename = getFilename( url );

			if ( ! files[ filename ] ) {

				files[ filename ] = new CachedColladaLoader( url );

			}

			files[ filename ].get( function ( data ) {

				data.reference( getRefId( url ), cb );

			} )

		}

		/**
		 * Loads a collada file from an url and returns the scene or url specified node (file.dae#nodeId)
		 *
		 * @param url
		 * @param cb
		 */
		function loadInstance( url, cb ) {

			getCachedInstanceByUrl( url, cb );

		}

		function getInstanceNode( url, cb ) {

			return getInstanceBuild( library.nodes, url, getNode, cb );

		}

		// visual scenes

		function parseVisualScene( xml ) {

			var data = {
				name: xml.getAttribute( 'name' ),
				children: []
			};

			var elements = getElementsByTagName( xml, 'node' );

			for ( var i = 0; i < elements.length; i ++ ) {

				data.children.push( parseNode( elements[ i ] ) );

			}

			library.visualScenes[ xml.getAttribute( 'id' ) ] = data;

		}

		function buildVisualScene( data, cb ) {

			var group = new THREE.Group();
			group.name = data.name;

			var children = data.children;

			var counter = new callbackQueue( function () {

				cb( group );

			} );

			for ( var i = 0; i < children.length; i ++ ) {

				counter.enqueue();

				buildNode( children[ i ], function ( node ) {

					group.add( node );
					counter.dequeue();

				} );

			}

			counter.start();

		}

		function getVisualScene( id, cb ) {

			console.time( 'ColladaLoader: getVisualScene: ' + id );

			return getBuild( library.visualScenes[ id ], buildVisualScene, function ( data ) {

				console.timeEnd( 'ColladaLoader: getVisualScene: ' + id );
				cb( data );

			} );

		}

		function getMainVisualScene( cb ) {

			var instance = getElementsByTagName( getElementsByTagName( collada, 'scene' )[ 0 ], 'instance_visual_scene' )[ 0 ];

			/**
			 * Spec:
			 * Each instance inherits the local coordinate system from its parent, including the applicable <unit> and
			 * <up_axis> settings, to determine its position, orientation, and scale.
			 *
			 * not 100% clear to me. I assume ip_axis and unit are used only from the main doc
			 */

			getVisualScene( parseId( instance.getAttribute( 'url' ) ), function ( scene ) {

				var asset = parseAsset( getElementsByTagName( collada, 'asset' )[ 0 ] );

				if ( asset.upAxis === 'Z_UP' ) {

					//scene.rotation.x = - Math.PI / 2;

				}

				scene.scale.multiplyScalar( asset.unit );

				cb( scene );

			} );

		}

		// scenes

		console.time( 'ColladaLoader: DOMParser' );

		var xml = new DOMParser().parseFromString( text, 'application/xml' );

		console.timeEnd( 'ColladaLoader: DOMParser' );

		var collada = getElementsByTagName( xml, 'COLLADA' )[ 0 ];

		// metadata

		var version = collada.getAttribute( 'version' );
		console.log( 'ColladaLoader: File version', version );

		//

		var library = {
			images: {},
			effects: {},
			materials: {},
			cameras: {},
			lights: {},
			geometries: {},
			nodes: {},
			visualScenes: {}
		};

		console.time( 'ColladaLoader: Parse' );

		parseLibrary( collada, 'library_images', 'image', parseImage );
		parseLibrary( collada, 'library_effects', 'effect', parseEffect );
		parseLibrary( collada, 'library_materials', 'material', parseMaterial );
		parseLibrary( collada, 'library_cameras', 'camera', parseCamera );
		parseLibrary( collada, 'library_lights', 'light', parseLight );
		parseLibrary( collada, 'library_geometries', 'geometry', parseGeometry );
		parseLibrary( collada, 'library_nodes', 'node', parseNode );
		parseLibrary( collada, 'library_visual_scenes', 'visual_scene', parseVisualScene );

		console.timeEnd( 'ColladaLoader: Parse' );

		// --- BUILD ---

		function getFilename( url ) {

			url = url.split( '#' ).shift(); //remove the refId to prevent capturing until '.dae' in a refId
			var match = url.match( /(?:.*\/)?(.*\.dae)/i );
			return ( match ) ? match[ 1 ] : '';

		}

		function getBaseUrl( url ) {

			var parts = url.split( '/' );
			parts.pop();
			return ( parts.length < 1 ? '.' : parts.join( '/' ) ) + '/';

		}

		function getRefId( url ) {

			return ( url.indexOf( '#' ) >= 0 ) ? url.split( '#' ).pop() : '';

		}

		if ( ! url ) url = '';

		var baseUrl = getBaseUrl( url ).trim();
		var fileName = getFilename( url ).trim();
		var refId = getRefId( url ).trim();

		var result = {};

		function getElement( refId, cb ) {

			if ( library.nodes.hasOwnProperty( refId ) ) {

				getNode( refId, cb );

			} else if ( library.geometries.hasOwnProperty( refId ) ) {

				cb( getGeometry( refId ) );

			} else if ( library.materials.hasOwnProperty( refId ) ) {

				cb( getMaterial( refId ) );

			} else {

				console.log( 'Node: ' + refId + ' can not be found in:' + fileName );

			}

		}

		if ( refId.length == 0 ) { //no refId give, build the Main visual scene

			getMainVisualScene( function ( scene ) {

				result = {
					animations: [],
					kinematics: { joints: [] },
					scene: scene,
					reference: getElement
				};

				if ( cb ) { // just return the result, if no cb is given

					cb( result );

				}

			} );

		} else {

			getElement( refId, function ( node ) {

				result = {
					animations: [],
					kinematics: { joints: [] },
					node: node,
					reference: getElement
				};

				if ( cb ) {

					cb( result );

				}

			} );


		}



		if ( ! cb && ! result ) {

			console.log( 'use the async version of parse, if your file contains references to other files, or specify not to load references in the Manager (not implemented)' );

		}

		return result;

	}

};
