/**
 * @author Alexander Gessler / http://www.greentoken.de/
 * https://github.com/acgessler
 *
 * Loader for models imported with Open Asset Import Library (http://assimp.sf.net)
 * through assimp2json (https://github.com/acgessler/assimp2json).
 *
 * Supports any input format that assimp supports, including 3ds, obj, dae, blend,
 * fbx, x, ms3d, lwo (and many more).
 *
 * See webgl_loader_assimp2json example.
 */

import {
	BufferGeometry,
	DefaultLoadingManager,
	FileLoader,
	Float32BufferAttribute,
	LoaderUtils,
	Matrix4,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	RepeatWrapping,
	TextureLoader
} from "../../../build/three.module.js";

var AssimpJSONLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

};

AssimpJSONLoader.prototype = {

	constructor: AssimpJSONLoader,

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var path = ( scope.path === undefined ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		var loader = new FileLoader( this.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			var json = JSON.parse( text );
			var metadata = json.__metadata__;

			// check if __metadata__ meta header is present
			// this header is used to disambiguate between different JSON-based file formats

			if ( typeof metadata !== 'undefined' ) {

				// check if assimp2json at all

				if ( metadata.format !== 'assimp2json' ) {

					onError( 'THREE.AssimpJSONLoader: Not an assimp2json scene.' );
					return;

					// check major format version

				} else if ( metadata.version < 100 && metadata.version >= 200 ) {

					onError( 'THREE.AssimpJSONLoader: Unsupported assimp2json file format version.' );
					return;

				}

			}

			onLoad( scope.parse( json, path ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	setResourcePath: function ( value ) {

		this.resourcePath = value;
		return this;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	parse: function ( json, path ) {

		function parseList( json, handler ) {

			var meshes = new Array( json.length );

			for ( var i = 0; i < json.length; ++ i ) {

				meshes[ i ] = handler.call( this, json[ i ] );

			}

			return meshes;

		}

		function parseMesh( json ) {

			var geometry = new BufferGeometry();

			var i, l, face;

			var indices = [];

			var vertices = json.vertices || [];
			var normals = json.normals || [];
			var uvs = json.texturecoords || [];
			var colors = json.colors || [];

			uvs = uvs[ 0 ] || []; // only support for a single set of uvs

			for ( i = 0, l = json.faces.length; i < l; i ++ ) {

				face = json.faces[ i ];
				indices.push( face[ 0 ], face[ 1 ], face[ 2 ] );

			}

			geometry.setIndex( indices );
			geometry.addAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );

			if ( normals.length > 0 ) {

				geometry.addAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );

			}

			if ( uvs.length > 0 ) {

				geometry.addAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

			}

			if ( colors.length > 0 ) {

				geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

			}

			geometry.computeBoundingSphere();

			return geometry;

		}

		function parseMaterial( json ) {

			var material = new MeshPhongMaterial();

			for ( var i in json.properties ) {

				var property = json.properties[ i ];
				var key = property.key;
				var value = property.value;

				switch ( key ) {

					case '$tex.file': {

						var semantic = property.semantic;

						// prop.semantic gives the type of the texture
						// 1: diffuse
						// 2: specular map
						// 4: emissive map
						// 5: height map (bumps)
						// 6: normal map
						// more values (i.e. environment, etc) are known by assimp and may be relevant

						if ( semantic === 1 || semantic === 2 || semantic === 4 || semantic === 5 || semantic === 6 ) {

							var keyname;

							switch ( semantic ) {

								case 1:
									keyname = 'map';
									break;
								case 2:
									keyname = 'specularMap';
									break;
								case 4:
									keyname = 'emissiveMap';
									break;
								case 5:
									keyname = 'bumpMap';
									break;
								case 6:
									keyname = 'normalMap';
									break;

							}

							var texture = textureLoader.load( value );

							// TODO: read texture settings from assimp.
							// Wrapping is the default, though.

							texture.wrapS = texture.wrapT = RepeatWrapping;

							material[ keyname ] = texture;

						}

						break;

					}

					case '?mat.name':
						material.name = value;
						break;

					case '$clr.diffuse':
						material.color.fromArray( value );
						break;

					case '$clr.specular':
						material.specular.fromArray( value );
						break;

					case '$clr.emissive':
						material.emissive.fromArray( value );
						break;

					case '$mat.shininess':
						material.shininess = value;
						break;

					case '$mat.shadingm':
						// aiShadingMode_Flat
						material.flatShading = ( value === 1 ) ? true : false;
						break;

					case '$mat.opacity':
						if ( value < 1 ) {

							material.opacity = value;
							material.transparent = true;

						}
						break;

				}

			}

			return material;

		}

		function parseObject( json, node, meshes, materials ) {

			var obj = new Object3D(),	i, idx;

			obj.name = node.name || '';
			obj.matrix = new Matrix4().fromArray( node.transformation ).transpose();
			obj.matrix.decompose( obj.position, obj.quaternion, obj.scale );

			for ( i = 0; node.meshes && i < node.meshes.length; i ++ ) {

				idx = node.meshes[ i ];
				obj.add( new Mesh( meshes[ idx ], materials[ json.meshes[ idx ].materialindex ] ) );

			}

			for ( i = 0; node.children && i < node.children.length; i ++ ) {

				obj.add( parseObject( json, node.children[ i ], meshes, materials ) );

			}

			return obj;

		}

		var textureLoader = new TextureLoader( this.manager );
		textureLoader.setPath( this.resourcePath || path ).setCrossOrigin( this.crossOrigin );

		var meshes = parseList( json.meshes, parseMesh );
		var materials = parseList( json.materials, parseMaterial );
		return parseObject( json, json.rootnode, meshes, materials );

	}

};

export { AssimpJSONLoader };
