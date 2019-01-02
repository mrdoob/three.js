/**
 * @author Garrett Johnson / http://gkjohnson.github.io/
 * https://github.com/gkjohnson/collada-exporter-js
 *
 * Usage:
 *  var exporter = new THREE.ColladaExporter();
 *
 *  var data = exporter.parse(mesh);
 *
 * Format Definition:
 *  https://www.khronos.org/collada/
 */

THREE.ColladaExporter = function () {};

THREE.ColladaExporter.prototype = {

	constructor: THREE.ColladaExporter,

	parse: function ( object, onDone, options = {} ) {

		options = Object.assign( {
			version: '1.4.1',
			author: null,
			textureDirectory: '',
		}, options );

		if ( options.textureDirectory !== '' ) {

			options.textureDirectory = `${ options.textureDirectory }/`
				.replace( /\\/g, '/' )
				.replace( /\/+/g, '/' );

		}

		var version = options.version;
		if ( version !== '1.4.1' && version !== '1.5.0' ) {

			console.warn( `ColladaExporter : Version ${ version } not supported for export. Only 1.4.1 and 1.5.0.` );
			return null;

		}

		// Convert the urdf xml into a well-formatted, indented format
		function format( urdf ) {

			var IS_END_TAG = /^<\//;
			var IS_SELF_CLOSING = /(\?>$)|(\/>$)/;
			var HAS_TEXT = /<[^>]+>[^<]*<\/[^<]+>/;

			var pad = ( ch, num ) => ( num > 0 ? ch + pad( ch, num - 1 ) : '' );

			var tagnum = 0;
			return urdf
				.match( /(<[^>]+>[^<]+<\/[^<]+>)|(<[^>]+>)/g )
				.map( tag => {

					if ( ! HAS_TEXT.test( tag ) && ! IS_SELF_CLOSING.test( tag ) && IS_END_TAG.test( tag ) ) {

						tagnum --;

					}

					var res = `${ pad( '  ', tagnum ) }${ tag }`;

					if ( ! HAS_TEXT.test( tag ) && ! IS_SELF_CLOSING.test( tag ) && ! IS_END_TAG.test( tag ) ) {

						tagnum ++;

					}

					return res;

				} )
				.join( '\n' );

		}

		// Convert an image into a png format for saving
		function base64ToBuffer( str ) {

			var b = atob( str );
			var buf = new Uint8Array( b.length );

			for ( var i = 0, l = buf.length; i < l; i ++ ) {

				buf[ i ] = b.charCodeAt( i );

			}

			return buf;

		}

		var canvas, ctx;
		function imageToData( image, ext ) {

			canvas = canvas || document.createElement( 'canvas' );
			ctx = ctx || canvas.getContext( '2d' );

			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;

			ctx.drawImage( image, 0, 0 );

			// Get the base64 encoded data
			var base64data = canvas
				.toDataURL( `image/${ ext }`, 1 )
				.replace( /^data:image\/(png|jpg);base64,/, '' );

			// Convert to a uint8 array
			return base64ToBuffer( base64data );

		}

		// gets the attribute array. Generate a new array if the attribute is interleaved
		var getFuncs = [ 'getX', 'getY', 'getZ', 'getW' ];
		function attrBufferToArray( attr ) {

			if ( attr.isInterleavedBufferAttribute ) {

				// use the typed array constructor to save on memory
				var arr = new attr.array.constructor( attr.count * attr.itemSize );
				var size = attr.itemSize;
				for ( var i = 0, l = attr.count; i < l; i ++ ) {

					for ( var j = 0; j < size; j ++ ) {

						arr[ i * size + j ] = attr[ getFuncs[ j ] ]( i );

					}

				}

				return arr;

			} else {

				return attr.array;

			}

		}

		// Returns an array of the same type starting at the `st` index,
		// and `ct` length
		function subArray( arr, st, ct ) {

			if ( Array.isArray( arr ) ) return arr.slice( st, st + ct );
			else return new arr.constructor( arr.buffer, st * arr.BYTES_PER_ELEMENT, ct );

		}

		// Returns the string for a geometry's attribute
		function getAttribute( attr, name, params, type ) {

			var array = attrBufferToArray( attr );
			var res =
					`<source id="${ name }">` +

					`<float_array id="${ name }-array" count="${ array.length }">` +
					array.join( ' ' ) +
					'</float_array>' +

					'<technique_common>' +
					`<accessor source="#${ name }-array" count="${ Math.floor( array.length / attr.itemSize ) }" stride="${ attr.itemSize }">` +

					params.map( n => `<param name="${ n }" type="${ type }" />` ).join( '' ) +

					'</accessor>' +
					'</technique_common>' +
					'</source>';

			return res;

		}

		// Returns the string for a node's transform information
		var transMat;
		function getTransform( o ) {

			// ensure the object's matrix is up to date
			// before saving the transform
			o.updateMatrix();

			transMat = transMat || new THREE.Matrix4();
			transMat.copy( o.matrix );
			transMat.transpose();
			return `<matrix>${ transMat.toArray().join( ' ' ) }</matrix>`;

		}

		// Process the given piece of geometry into the geometry library
		// Returns the mesh id
		function processGeometry( g ) {

			var info = geometryInfo.get( g );

			if ( ! info ) {

				// convert the geometry to bufferGeometry if it isn't already
				var bufferGeometry = g;
				if ( bufferGeometry instanceof THREE.Geometry ) {

					bufferGeometry = ( new THREE.BufferGeometry() ).fromGeometry( bufferGeometry );

				}

				var meshid = `Mesh${ libraryGeometries.length + 1 }`;

				var indexCount =
					bufferGeometry.index ?
						bufferGeometry.index.count * bufferGeometry.index.itemSize :
						bufferGeometry.attributes.position.count;

				var groups =
					bufferGeometry.groups != null && bufferGeometry.groups.length !== 0 ?
						bufferGeometry.groups :
						[ { start: 0, count: indexCount, materialIndex: 0 } ];

				var gnode = `<geometry id="${ meshid }" name="${ g.name }"><mesh>`;

				// define the geometry node and the vertices for the geometry
				var posName = `${ meshid }-position`;
				var vertName = `${ meshid }-vertices`;
				gnode += getAttribute( bufferGeometry.attributes.position, posName, [ 'X', 'Y', 'Z' ], 'float' );
				gnode += `<vertices id="${ vertName }"><input semantic="POSITION" source="#${ posName }" /></vertices>`;

				// NOTE: We're not optimizing the attribute arrays here, so they're all the same length and
				// can therefore share the same triangle indices. However, MeshLab seems to have trouble opening
				// models with attributes that share an offset.
				// MeshLab Bug#424: https://sourceforge.net/p/meshlab/bugs/424/

				// serialize normals
				var triangleInputs = `<input semantic="VERTEX" source="#${ vertName }" offset="0" />`;
				if ( 'normal' in bufferGeometry.attributes ) {

					var normName = `${ meshid }-normal`;
					gnode += getAttribute( bufferGeometry.attributes.normal, normName, [ 'X', 'Y', 'Z' ], 'float' );
					triangleInputs += `<input semantic="NORMAL" source="#${ normName }" offset="0" />`;

				}

				// serialize uvs
				if ( 'uv' in bufferGeometry.attributes ) {

					var uvName = `${ meshid }-texcoord`;
					gnode += getAttribute( bufferGeometry.attributes.uv, uvName, [ 'S', 'T' ], 'float' );
					triangleInputs += `<input semantic="TEXCOORD" source="#${ uvName }" offset="0" set="0" />`;

				}

				// serialize colors
				if ( 'color' in bufferGeometry.attributes ) {

					var colName = `${ meshid }-color`;
					gnode += getAttribute( bufferGeometry.attributes.color, colName, [ 'X', 'Y', 'Z' ], 'uint8' );
					triangleInputs += `<input semantic="COLOR" source="#${ colName }" offset="0" />`;

				}

				var indexArray = null;
				if ( bufferGeometry.index ) {

					indexArray = attrBufferToArray( bufferGeometry.index );

				} else {

					indexArray = new Array( indexCount );
					for ( var i = 0, l = indexArray.length; i < l; i ++ ) indexArray[ i ] = i;

				}

				for ( var i = 0, l = groups.length; i < l; i ++ ) {

					var group = groups[ i ];
					var subarr = subArray( indexArray, group.start, group.count );
					var polycount = subarr.length / 3;
					gnode += `<triangles material="MESH_MATERIAL_${ group.materialIndex }" count="${ polycount }">`;
					gnode += triangleInputs;

					gnode += `<p>${ subarr.join( ' ' ) }</p>`;
					gnode += '</triangles>';

				}

				gnode += `</mesh></geometry>`;

				libraryGeometries.push( gnode );

				info = { meshid: meshid, bufferGeometry: bufferGeometry };
				geometryInfo.set( g, info );

			}

			return info;

		}

		// Process the given texture into the image library
		// Returns the image library
		function processTexture( tex ) {

			var texid = imageMap.get( tex );
			if ( texid == null ) {

				texid = `image-${ libraryImages.length + 1 }`;

				var ext = 'png';
				var name = tex.name || texid;
				var imageNode = `<image id="${ texid }" name="${ name }">`;

				if ( version === '1.5.0' ) {

					imageNode += `<init_from><ref>${ options.textureDirectory }${ name }.${ ext }</ref></init_from>`;

				} else {

					// version image node 1.4.1
					imageNode += `<init_from>${ options.textureDirectory }${ name }.${ ext }</init_from>`;

				}

				imageNode += '</image>';

				libraryImages.push( imageNode );
				imageMap.set( tex, texid );
				textures.push( {
					directory: options.textureDirectory,
					name,
					ext,
					data: imageToData( tex.image, ext ),
					original: tex
				} );

			}

			return texid;

		}

		// Process the given material into the material and effect libraries
		// Returns the material id
		function processMaterial( m ) {

			var matid = materialMap.get( m );

			if ( matid == null ) {

				matid = `Mat${ libraryEffects.length + 1 }`;

				var type = 'phong';

				if ( m instanceof THREE.MeshLambertMaterial ) {

					type = 'lambert';

				} else if ( m instanceof THREE.MeshBasicMaterial ) {

					type = 'constant';

				}

				var emissive = m.emissive ? m.emissive : new THREE.Color( 0, 0, 0 );
				var diffuse = m.color ? m.color : new THREE.Color( 0, 0, 0 );
				var specular = m.specular ? m.specular : new THREE.Color( 1, 1, 1 );
				var shininess = m.shininess || 0;
				var reflectivity = m.reflectivity || 0;

				// Do not export and alpha map for the reasons mentioned in issue (#13792)
				// in THREE.js alpha maps are black and white, but collada expects the alpha
				// channel to specify the transparency
				var transparencyNode = '';
				if ( m.transparent === true ) {

					transparencyNode +=
						`<transparent>` +
						(
							m.map ?
								`<texture texture="diffuse-sampler"></texture>` :
								'<float>1</float>'
						) +
						'</transparent>';

					if ( m.opacity < 1 ) {

						transparencyNode += `<transparency><float>${ m.opacity }</float></transparency>`;

					}

				}

				var techniqueNode = `<technique sid="common"><${ type }>` +

					'<emission>' +

					(
						m.emissiveMap ?
							'<texture texture="emissive-sampler" texcoord="TEXCOORD" />' :
							`<color sid="emission">${ emissive.r } ${ emissive.g } ${ emissive.b } 1</color>`
					) +

					'</emission>' +

					(
						type !== 'constant' ?
						'<diffuse>' +

						(
							m.map ?
								'<texture texture="diffuse-sampler" texcoord="TEXCOORD" />' :
								`<color sid="diffuse">${ diffuse.r } ${ diffuse.g } ${ diffuse.b } 1</color>`
						) +
						'</diffuse>'
						: ''
					) +

					(
						type === 'phong' ?
						`<specular><color sid="specular">${ specular.r } ${ specular.g } ${ specular.b } 1</color></specular>` +

						'<shininess>' +

						(
							m.specularMap ?
								'<texture texture="specular-sampler" texcoord="TEXCOORD" />' :
								`<float sid="shininess">${ shininess }</float>`
						) +

						'</shininess>' 
						: ''
					) +

					`<reflective><color>${ diffuse.r } ${ diffuse.g } ${ diffuse.b } 1</color></reflective>` +

					`<reflectivity><float>${ reflectivity }</float></reflectivity>` +

					transparencyNode +

					`</${ type }></technique>`;

				var effectnode =
					`<effect id="${ matid }-effect">` +
					'<profile_COMMON>' +

					(
						m.map ?
							'<newparam sid="diffuse-surface"><surface type="2D">' +
							`<init_from>${ processTexture( m.map ) }</init_from>` +
							'</surface></newparam>' +
							'<newparam sid="diffuse-sampler"><sampler2D><source>diffuse-surface</source></sampler2D></newparam>' :
							''
					) +

					(
						m.specularMap ?
							'<newparam sid="specular-surface"><surface type="2D">' +
							`<init_from>${ processTexture( m.specularMap ) }</init_from>` +
							'</surface></newparam>' +
							'<newparam sid="specular-sampler"><sampler2D><source>specular-surface</source></sampler2D></newparam>' :
							''
					) +

					(
						m.emissiveMap ?
							'<newparam sid="emissive-surface"><surface type="2D">' +
							`<init_from>${ processTexture( m.emissiveMap ) }</init_from>` +
							'</surface></newparam>' +
							'<newparam sid="emissive-sampler"><sampler2D><source>emissive-surface</source></sampler2D></newparam>' :
							''
					) +

					techniqueNode +

					(
						m.side === THREE.DoubleSide ?
							`<extra><technique><double_sided sid="double_sided" type="int">1</double_sided></technique></extra>` :
							''
					) +

					'</profile_COMMON>' +

					'</effect>';

				libraryMaterials.push( `<material id="${ matid }" name="${ m.name }"><instance_effect url="#${ matid }-effect" /></material>` );
				libraryEffects.push( effectnode );
				materialMap.set( m, matid );

			}

			return matid;

		}

		// Recursively process the object into a scene
		function processObject( o ) {

			var node = `<node name="${ o.name }">`;

			node += getTransform( o );

			if ( o instanceof THREE.Mesh && o.geometry != null ) {

				// function returns the id associated with the mesh and a "BufferGeometry" version
				// of the geometry in case it's not a geometry.
				var geomInfo = processGeometry( o.geometry );
				var meshid = geomInfo.meshid;
				var geometry = geomInfo.bufferGeometry;

				// ids of the materials to bind to the geometry
				var matids = null;
				var matidsArray = [];

				// get a list of materials to bind to the sub groups of the geometry.
				// If the amount of subgroups is greater than the materials, than reuse
				// the materials.
				var mat = o.material || new THREE.MeshBasicMaterial();
				var materials = Array.isArray( mat ) ? mat : [ mat ];
				if ( geometry.groups.length > materials.length ) {
					matidsArray = new Array( geometry.groups.length );
				} else {
					matidsArray = new Array( materials.length )
				}
				matids = matidsArray.fill()
					.map( ( v, i ) => processMaterial( materials[ i % materials.length ] ) );

				node +=
					`<instance_geometry url="#${ meshid }">` +

					(
						matids != null ?
							'<bind_material><technique_common>' +
							matids.map( ( id, i ) =>

								`<instance_material symbol="MESH_MATERIAL_${ i }" target="#${ id }" >` +

								'<bind_vertex_input semantic="TEXCOORD" input_semantic="TEXCOORD" input_set="0" />' +

								'</instance_material>'
							).join( '' ) +
							'</technique_common></bind_material>' :
							''
					) +

					'</instance_geometry>';

			}

			o.children.forEach( c => node += processObject( c ) );

			node += '</node>';

			return node;

		}

		var geometryInfo = new WeakMap();
		var materialMap = new WeakMap();
		var imageMap = new WeakMap();
		var textures = [];

		var libraryImages = [];
		var libraryGeometries = [];
		var libraryEffects = [];
		var libraryMaterials = [];
		var libraryVisualScenes = processObject( object );

		var specLink = version === '1.4.1' ? 'http://www.collada.org/2005/11/COLLADASchema' : 'https://www.khronos.org/collada/';
		var dae =
			'<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' +
			`<COLLADA xmlns="${ specLink }" version="${ version }">` +
			'<asset>' +
			(
				'<contributor>' +
				'<authoring_tool>THREE.js Collada Exporter</authoring_tool>' +
				( options.author !== null ? `<author>${ options.author }</author>` : '' ) +
				'</contributor>' +
				`<created>${ ( new Date() ).toISOString() }</created>` +
				`<modified>${ ( new Date() ).toISOString() }</modified>` +
				'<up_axis>Y_UP</up_axis>'
			) +
			'</asset>';

		dae += `<library_images>${ libraryImages.join( '' ) }</library_images>`;

		dae += `<library_effects>${ libraryEffects.join( '' ) }</library_effects>`;

		dae += `<library_materials>${ libraryMaterials.join( '' ) }</library_materials>`;

		dae += `<library_geometries>${ libraryGeometries.join( '' ) }</library_geometries>`;

		dae += `<library_visual_scenes><visual_scene id="Scene" name="scene">${ libraryVisualScenes }</visual_scene></library_visual_scenes>`;

		dae += '<scene><instance_visual_scene url="#Scene"/></scene>';

		dae += '</COLLADA>';

		var res = {
			data: format( dae ),
			textures
		};

		if ( typeof onDone === 'function' ) {

			requestAnimationFrame( () => onDone( res ) );

		}

		return res;

	}

};
