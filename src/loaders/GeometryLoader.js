/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.GeometryLoader = function () {

	THREE.EventTarget.call( this );

	this.crossOrigin = null;
	this.path = null;


};

THREE.GeometryLoader.prototype = {

	constructor: THREE.GeometryLoader,

	load: function ( url ) {

		var scope = this;
		var geometry = null;

		if ( scope.path === null ) {

			var parts = url.split( '/' ); parts.pop();
			scope.path = ( parts.length < 1 ? '.' : parts.join( '/' ) );

		}

		//

		var xhr = new XMLHttpRequest();

		xhr.addEventListener( 'load', function ( event ) {

			if ( event.target.responseText ) {

				geometry = scope.parse( JSON.parse( event.target.responseText ), monitor );

			} else {

				scope.dispatchEvent( { type: 'error', message: 'Invalid file [' + url + ']' } );

			}

		}, false );

		xhr.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		xhr.open( 'GET', url, true );
		xhr.send( null );

		//

		var monitor = new THREE.LoadingMonitor();

		monitor.addEventListener( 'load', function ( event ) {

			scope.dispatchEvent( { type: 'load', content: geometry } );

		} );

		monitor.add( xhr );

	},

	parse: function ( data, monitor ) {

		var scope = this;
		var geometry = new THREE.Geometry();

		var scale = ( data.scale !== undefined ) ? 1 / data.scale : 1;

		// materials

		if ( data.materials ) {

			geometry.materials = [];

			for ( var i = 0; i < data.materials.length; ++ i ) {

				var m = data.materials[ i ];

				function isPow2( n ) {

					var l = Math.log( n ) / Math.LN2;
					return Math.floor( l ) == l;

				}

				function nearestPow2( n ) {

					var l = Math.log( n ) / Math.LN2;
					return Math.pow( 2, Math.round(  l ) );

				}

				function createTexture( where, name, sourceFile, repeat, offset, wrap ) {

					where[ name ] = new THREE.Texture();
					where[ name ].sourceFile = sourceFile;

					if ( repeat ) {

						where[ name ].repeat.set( repeat[ 0 ], repeat[ 1 ] );

						if ( repeat[ 0 ] !== 1 ) where[ name ].wrapS = THREE.RepeatWrapping;
						if ( repeat[ 1 ] !== 1 ) where[ name ].wrapT = THREE.RepeatWrapping;

					}

					if ( offset ) {

						where[ name ].offset.set( offset[ 0 ], offset[ 1 ] );

					}

					if ( wrap ) {

						var wrapMap = {

							"repeat": THREE.RepeatWrapping,
							"mirror": THREE.MirroredRepeatWrapping

						}

						if ( wrapMap[ wrap[ 0 ] ] !== undefined ) where[ name ].wrapS = wrapMap[ wrap[ 0 ] ];
						if ( wrapMap[ wrap[ 1 ] ] !== undefined ) where[ name ].wrapT = wrapMap[ wrap[ 1 ] ];

					}

					// load image

					var texture = where[ name ];

					var loader = new THREE.ImageLoader();
					loader.addEventListener( 'load', function ( event ) {

						var image = event.content;

						if ( !isPow2( image.width ) || !isPow2( image.height ) ) {

							var width = nearestPow2( image.width );
							var height = nearestPow2( image.height );

							texture.image = document.createElement( 'canvas' );
							texture.image.width = width;
							texture.image.height = height;
							texture.image.getContext( '2d' ).drawImage( image, 0, 0, width, height );

						} else {

							texture.image = image;

						}

						texture.needsUpdate = true;

					} );
					loader.crossOrigin = scope.crossOrigin;
					loader.load( scope.path + '/' + sourceFile );

					if ( monitor ) monitor.add( loader );

				}

				function rgb2hex( rgb ) {

					return ( rgb[ 0 ] * 255 << 16 ) + ( rgb[ 1 ] * 255 << 8 ) + rgb[ 2 ] * 255;

				}

				// defaults

				var mtype = "MeshLambertMaterial";
				var mpars = { color: 0xeeeeee, opacity: 1.0, map: null, lightMap: null, normalMap: null, bumpMap: null, wireframe: false };

				// parameters from model file

				if ( m.shading ) {

					var shading = m.shading.toLowerCase();

					if ( shading === "phong" ) mtype = "MeshPhongMaterial";
					else if ( shading === "basic" ) mtype = "MeshBasicMaterial";

				}

				if ( m.blending !== undefined && THREE[ m.blending ] !== undefined ) {

					mpars.blending = THREE[ m.blending ];

				}

				if ( m.transparent !== undefined || m.opacity < 1.0 ) {

					mpars.transparent = m.transparent;

				}

				if ( m.depthTest !== undefined ) {

					mpars.depthTest = m.depthTest;

				}

				if ( m.depthWrite !== undefined ) {

					mpars.depthWrite = m.depthWrite;

				}

				if ( m.vertexColors !== undefined ) {

					if ( m.vertexColors == "face" ) {

						mpars.vertexColors = THREE.FaceColors;

					} else if ( m.vertexColors ) {

						mpars.vertexColors = THREE.VertexColors;

					}

				}

				// colors

				if ( m.colorDiffuse ) {

					mpars.color = rgb2hex( m.colorDiffuse );

				} else if ( m.DbgColor ) {

					mpars.color = m.DbgColor;

				}

				if ( m.colorSpecular ) {

					mpars.specular = rgb2hex( m.colorSpecular );

				}

				if ( m.colorAmbient ) {

					mpars.ambient = rgb2hex( m.colorAmbient );

				}

				// modifiers

				if ( m.transparency ) {

					mpars.opacity = m.transparency;

				}

				if ( m.specularCoef ) {

					mpars.shininess = m.specularCoef;

				}

				if ( m.visible !== undefined ) {

					mpars.visible = m.visible;

				}

				if ( m.flipSided !== undefined ) {

					mpars.side = THREE.BackSide;

				}

				if ( m.doubleSided !== undefined ) {

					mpars.side = THREE.DoubleSide;

				}

				if ( m.wireframe !== undefined ) {

					mpars.wireframe = m.wireframe;

				}

				// textures

				if ( m.mapDiffuse ) {

					createTexture( mpars, "map", m.mapDiffuse, m.mapDiffuseRepeat, m.mapDiffuseOffset, m.mapDiffuseWrap );

				}

				if ( m.mapLight ) {

					createTexture( mpars, "lightMap", m.mapLight, m.mapLightRepeat, m.mapLightOffset, m.mapLightWrap );

				}

				if ( m.mapBump ) {

					createTexture( mpars, "bumpMap", m.mapBump, m.mapBumpRepeat, m.mapBumpOffset, m.mapBumpWrap );

				}

				if ( m.mapNormal ) {

					createTexture( mpars, "normalMap", m.mapNormal, m.mapNormalRepeat, m.mapNormalOffset, m.mapNormalWrap );

				}

				if ( m.mapSpecular ) {

					createTexture( mpars, "specularMap", m.mapSpecular, m.mapSpecularRepeat, m.mapSpecularOffset, m.mapSpecularWrap );

				}

				// special case for normal mapped material

				if ( m.mapNormal ) {

					var shader = THREE.ShaderUtils.lib[ "normal" ];
					var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

					uniforms[ "tNormal" ].value = mpars.normalMap;

					if ( m.mapNormalFactor ) {

						uniforms[ "uNormalScale" ].value.set( m.mapNormalFactor, m.mapNormalFactor );

					}

					if ( mpars.map ) {

						uniforms[ "tDiffuse" ].value = mpars.map;
						uniforms[ "enableDiffuse" ].value = true;

					}

					if ( mpars.specularMap ) {

						uniforms[ "tSpecular" ].value = mpars.specularMap;
						uniforms[ "enableSpecular" ].value = true;

					}

					if ( mpars.lightMap ) {

						uniforms[ "tAO" ].value = mpars.lightMap;
						uniforms[ "enableAO" ].value = true;

					}

					// for the moment don't handle displacement texture

					uniforms[ "uDiffuseColor" ].value.setHex( mpars.color );
					uniforms[ "uSpecularColor" ].value.setHex( mpars.specular );
					uniforms[ "uAmbientColor" ].value.setHex( mpars.ambient );

					uniforms[ "uShininess" ].value = mpars.shininess;

					if ( mpars.opacity !== undefined ) {

						uniforms[ "uOpacity" ].value = mpars.opacity;

					}

					var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: true };
					var material = new THREE.ShaderMaterial( parameters );

				} else {

					var material = new THREE[ mtype ]( mpars );

				}

				if ( m.DbgName !== undefined ) material.name = m.DbgName;

				geometry.materials[ i ] = material;

			}

		}

		// geometry

		function isBitSet( value, position ) {

			return value & ( 1 << position );

		}

		var faces = data.faces;
		var vertices = data.vertices;
		var normals = data.normals;
		var colors = data.colors;
		var nUvLayers = 0;

		// disregard empty arrays

		if ( data.uvs ) {

			for ( var i = 0; i < data.uvs.length; i ++ ) {

				if ( data.uvs[ i ].length ) nUvLayers ++;

			}

		}

		for ( var i = 0; i < nUvLayers; i ++ ) {

			geometry.faceUvs[ i ] = [];
			geometry.faceVertexUvs[ i ] = [];

		}

		var offset = 0;
		var zLength = vertices.length;

		while ( offset < zLength ) {

			var vertex = new THREE.Vector3();

			vertex.x = vertices[ offset ++ ] * scale;
			vertex.y = vertices[ offset ++ ] * scale;
			vertex.z = vertices[ offset ++ ] * scale;

			geometry.vertices.push( vertex );

		}

		offset = 0;
		zLength = faces.length;

		while ( offset < zLength ) {

			var type = faces[ offset ++ ];

			var isQuad = isBitSet( type, 0 );

			var hasMaterial = isBitSet( type, 1 );
			var hasFaceUv = isBitSet( type, 2 );
			var hasFaceVertexUv = isBitSet( type, 3 );
			var hasFaceNormal = isBitSet( type, 4 );
			var hasFaceVertexNormal = isBitSet( type, 5 );
			var hasFaceColor = isBitSet( type, 6 );
			var hasFaceVertexColor = isBitSet( type, 7 );

			// console.log("type", type, "bits", isQuad, hasMaterial, hasFaceUv, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);

			if ( isQuad ) {

				var face = new THREE.Face4();

				face.a = faces[ offset ++ ];
				face.b = faces[ offset ++ ];
				face.c = faces[ offset ++ ];
				face.d = faces[ offset ++ ];

				var nVertices = 4;

			} else {

				var face = new THREE.Face3();

				face.a = faces[ offset ++ ];
				face.b = faces[ offset ++ ];
				face.c = faces[ offset ++ ];

				var nVertices = 3;

			}

			if ( hasMaterial ) {

				var materialIndex = faces[ offset ++ ];
				face.materialIndex = materialIndex;

			}

			// to get face <=> uv index correspondence

			var fi = geometry.faces.length;

			if ( hasFaceUv ) {

				for ( var i = 0; i < nUvLayers; i ++ ) {

					var uvLayer = data.uvs[ i ];

					var uvIndex = faces[ offset ++ ];

					var u = uvLayer[ uvIndex * 2 ];
					var v = uvLayer[ uvIndex * 2 + 1 ];

					geometry.faceUvs[ i ][ fi ] = new THREE.UV( u, v );

				}

			}

			if ( hasFaceVertexUv ) {

				for ( var i = 0; i < nUvLayers; i ++ ) {

					var uvLayer = data.uvs[ i ];

					var uvs = [];

					for ( var j = 0; j < nVertices; j ++ ) {

						var uvIndex = faces[ offset ++ ];

						var u = uvLayer[ uvIndex * 2 ];
						var v = uvLayer[ uvIndex * 2 + 1 ];

						uvs[ j ] = new THREE.UV( u, v );

					}

					geometry.faceVertexUvs[ i ][ fi ] = uvs;

				}

			}

			if ( hasFaceNormal ) {

				var normalIndex = faces[ offset ++ ] * 3;

				var normal = new THREE.Vector3();

				normal.x = normals[ normalIndex ++ ];
				normal.y = normals[ normalIndex ++ ];
				normal.z = normals[ normalIndex ];

				face.normal = normal;

			}

			if ( hasFaceVertexNormal ) {

				for ( i = 0; i < nVertices; i ++ ) {

					var normalIndex = faces[ offset ++ ] * 3;

					var normal = new THREE.Vector3();

					normal.x = normals[ normalIndex ++ ];
					normal.y = normals[ normalIndex ++ ];
					normal.z = normals[ normalIndex ];

					face.vertexNormals.push( normal );

				}

			}


			if ( hasFaceColor ) {

				var colorIndex = faces[ offset ++ ];

				face.color = new THREE.Color( colors[ colorIndex ] );

			}


			if ( hasFaceVertexColor ) {

				for ( var i = 0; i < nVertices; i ++ ) {

					var colorIndex = faces[ offset ++ ];

					face.vertexColors.push( new THREE.Color( colors[ colorIndex ] ) );

				}

			}

			geometry.faces.push( face );

		}


		// skin

		if ( data.skinWeights ) {

			for ( var i = 0, l = data.skinWeights.length; i < l; i += 2 ) {

				var x = data.skinWeights[ i ];
				var y = data.skinWeights[ i + 1 ];
				var z = 0;
				var w = 0;

				geometry.skinWeights.push( new THREE.Vector4( x, y, z, w ) );

			}

		}

		if ( data.skinIndices ) {

			for ( var i = 0, l = data.skinIndices.length; i < l; i += 2 ) {

				var a = data.skinIndices[ i ];
				var b = data.skinIndices[ i + 1 ];
				var c = 0;
				var d = 0;

				geometry.skinIndices.push( new THREE.Vector4( a, b, c, d ) );

			}

		}

		geometry.bones = data.bones;
		geometry.animation = data.animation;


		// morphing

		if ( data.morphTargets ) {

			for ( var i = 0, l = data.morphTargets.length; i < l; i ++ ) {

				geometry.morphTargets[ i ] = {};
				geometry.morphTargets[ i ].name = data.morphTargets[ i ].name;
				geometry.morphTargets[ i ].vertices = [];

				var dstVertices = geometry.morphTargets[ i ].vertices;
				var srcVertices = data.morphTargets [ i ].vertices;

				for( var v = 0, vl = srcVertices.length; v < vl; v += 3 ) {

					var vertex = new THREE.Vector3();
					vertex.x = srcVertices[ v ] * scale;
					vertex.y = srcVertices[ v + 1 ] * scale;
					vertex.z = srcVertices[ v + 2 ] * scale;

					dstVertices.push( vertex );

				}

			}

		}

		if ( data.morphColors ) {

			for ( var i = 0, l = data.morphColors.length; i < l; i++ ) {

				geometry.morphColors[ i ] = {};
				geometry.morphColors[ i ].name = data.morphColors[ i ].name;
				geometry.morphColors[ i ].colors = [];

				var dstColors = geometry.morphColors[ i ].colors;
				var srcColors = data.morphColors [ i ].colors;

				for ( var c = 0, cl = srcColors.length; c < cl; c += 3 ) {

					var color = new THREE.Color( 0xffaa00 );
					color.setRGB( srcColors[ c ], srcColors[ c + 1 ], srcColors[ c + 2 ] );

					dstColors.push( color );

				}

			}

		}

		geometry.computeCentroids();
		geometry.computeFaceNormals();

		return geometry;

	}

};
