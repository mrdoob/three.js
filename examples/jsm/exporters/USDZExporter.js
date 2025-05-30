import {
	NoColorSpace,
	DoubleSide,
	Color,
} from 'three';

import {
	strToU8,
	zipSync,
} from '../libs/fflate.module.js';

/**
 * An exporter for USDZ.
 *
 * ```js
 * const exporter = new USDZExporter();
 * const arraybuffer = await exporter.parseAsync( scene );
 * ```
 *
 * @three_import import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
 */
class USDZExporter {

	/**
	 * Constructs a new USDZ exporter.
	 */
	constructor() {

		/**
		 * A reference to a texture utils module.
		 *
		 * @type {?(WebGLTextureUtils|WebGPUTextureUtils)}
		 * @default null
		 */
		this.textureUtils = null;

	}

	/**
	 * Sets the texture utils for this exporter. Only relevant when compressed textures have to be exported.
	 *
	 * Depending on whether you use {@link WebGLRenderer} or {@link WebGPURenderer}, you must inject the
	 * corresponding texture utils {@link WebGLTextureUtils} or {@link WebGPUTextureUtils}.
	 *
	 * @param {WebGLTextureUtils|WebGPUTextureUtils} utils - The texture utils.
	 */
	setTextureUtils( utils ) {

		this.textureUtils = utils;

	}

	/**
	 * Parse the given 3D object and generates the USDZ output.
	 *
	 * @param {Object3D} scene - The 3D object to export.
	 * @param {USDZExporter~OnDone} onDone - A callback function that is executed when the export has finished.
	 * @param {USDZExporter~OnError} onError - A callback function that is executed when an error happens.
	 * @param {USDZExporter~Options} options - The export options.
	 */
	parse( scene, onDone, onError, options ) {

		this.parseAsync( scene, options ).then( onDone ).catch( onError );

	}

	/**
	 * Async version of {@link USDZExporter#parse}.
	 *
	 * @async
	 * @param {Object3D} scene - The 3D object to export.
	 * @param {USDZExporter~Options} options - The export options.
	 * @return {Promise<ArrayBuffer>} A Promise that resolved with the exported USDZ data.
	 */
	async parseAsync( scene, options = {} ) {

		options = Object.assign( {
			ar: {
				anchoring: { type: 'plane' },
				planeAnchoring: { alignment: 'horizontal' }
			},
			includeAnchoringProperties: true,
			quickLookCompatible: false,
			maxTextureSize: 1024,
		}, options );

		const files = {};
		const modelFileName = 'model.usda';

		// model file should be first in USDZ archive so we init it here
		files[ modelFileName ] = null;

		let output = buildHeader();

		output += buildSceneStart( options );

		const materials = {};
		const textures = {};

		scene.traverseVisible( ( object ) => {

			if ( object.isMesh ) {

				const geometry = object.geometry;
				const material = object.material;

				if ( material.isMeshStandardMaterial ) {

					const geometryFileName = 'geometries/Geometry_' + geometry.id + '.usda';

					if ( ! ( geometryFileName in files ) ) {

						const meshObject = buildMeshObject( geometry );
						files[ geometryFileName ] = buildUSDFileAsString( meshObject );

					}

					if ( ! ( material.uuid in materials ) ) {

						materials[ material.uuid ] = material;

					}

					output += buildXform( object, geometry, materials[ material.uuid ] );

				} else {

					console.warn( 'THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)', object );

				}

			} else if ( object.isCamera ) {

				output += buildCamera( object );

			}

		} );


		output += buildSceneEnd();

		output += buildMaterials( materials, textures, options.quickLookCompatible );

		files[ modelFileName ] = strToU8( output );
		output = null;

		for ( const id in textures ) {

			let texture = textures[ id ];

			if ( texture.isCompressedTexture === true ) {

				if ( this.textureUtils === null ) {

					throw new Error( 'THREE.USDZExporter: setTextureUtils() must be called to process compressed textures.' );

				} else {

					texture = await this.textureUtils.decompress( texture );

				}

			}

			const canvas = imageToCanvas( texture.image, texture.flipY, options.maxTextureSize );
			const blob = await new Promise( resolve => canvas.toBlob( resolve, 'image/png', 1 ) );

			files[ `textures/Texture_${ id }.png` ] = new Uint8Array( await blob.arrayBuffer() );

		}

		// 64 byte alignment
		// https://github.com/101arrowz/fflate/issues/39#issuecomment-777263109

		let offset = 0;

		for ( const filename in files ) {

			const file = files[ filename ];
			const headerSize = 34 + filename.length;

			offset += headerSize;

			const offsetMod64 = offset & 63;

			if ( offsetMod64 !== 4 ) {

				const padLength = 64 - offsetMod64;
				const padding = new Uint8Array( padLength );

				files[ filename ] = [ file, { extra: { 12345: padding } } ];

			}

			offset = file.length;

		}

		return zipSync( files, { level: 0 } );

	}

}

function imageToCanvas( image, flipY, maxTextureSize ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		const scale = maxTextureSize / Math.max( image.width, image.height );

		const canvas = document.createElement( 'canvas' );
		canvas.width = image.width * Math.min( 1, scale );
		canvas.height = image.height * Math.min( 1, scale );

		const context = canvas.getContext( '2d' );

		// TODO: We should be able to do this in the UsdTransform2d?

		if ( flipY === true ) {

			context.translate( 0, canvas.height );
			context.scale( 1, - 1 );

		}

		context.drawImage( image, 0, 0, canvas.width, canvas.height );

		return canvas;

	} else {

		throw new Error( 'THREE.USDZExporter: No valid image data found. Unable to process texture.' );

	}

}

//

const PRECISION = 7;

function buildHeader() {

	return `#usda 1.0
(
	customLayerData = {
		string creator = "Three.js USDZExporter"
	}
	defaultPrim = "Root"
	metersPerUnit = 1
	upAxis = "Y"
)

`;

}

function buildSceneStart( options ) {

	const alignment = options.includeAnchoringProperties === true ? `
		token preliminary:anchoring:type = "${options.ar.anchoring.type}"
		token preliminary:planeAnchoring:alignment = "${options.ar.planeAnchoring.alignment}"
	` : '';
	return `def Xform "Root"
{
	def Scope "Scenes" (
		kind = "sceneLibrary"
	)
	{
		def Xform "Scene" (
			customData = {
				bool preliminary_collidesWithEnvironment = 0
				string sceneName = "Scene"
			}
			sceneName = "Scene"
		)
		{${alignment}
`;

}

function buildSceneEnd() {

	return `
		}
	}
}

`;

}

function buildUSDFileAsString( dataToInsert ) {

	let output = buildHeader();
	output += dataToInsert;
	return strToU8( output );

}

// Xform

function buildXform( object, geometry, material ) {

	const name = 'Object_' + object.id;
	const transform = buildMatrix( object.matrixWorld );

	if ( object.matrixWorld.determinant() < 0 ) {

		console.warn( 'THREE.USDZExporter: USDZ does not support negative scales', object );

	}

	return `			def Xform "${ name }" (
				prepend references = @./geometries/Geometry_${ geometry.id }.usda@</Geometry>
				prepend apiSchemas = ["MaterialBindingAPI"]
			)
			{
				matrix4d xformOp:transform = ${ transform }
				uniform token[] xformOpOrder = ["xformOp:transform"]

				rel material:binding = </Materials/Material_${ material.id }>
			}

`;

}

function buildMatrix( matrix ) {

	const array = matrix.elements;

	return `( ${ buildMatrixRow( array, 0 ) }, ${ buildMatrixRow( array, 4 ) }, ${ buildMatrixRow( array, 8 ) }, ${ buildMatrixRow( array, 12 ) } )`;

}

function buildMatrixRow( array, offset ) {

	return `(${ array[ offset + 0 ] }, ${ array[ offset + 1 ] }, ${ array[ offset + 2 ] }, ${ array[ offset + 3 ] })`;

}

// Mesh

function buildMeshObject( geometry ) {

	const mesh = buildMesh( geometry );
	return `
def "Geometry"
{
${mesh}
}
`;

}

function buildMesh( geometry ) {

	const name = 'Geometry';
	const attributes = geometry.attributes;
	const count = attributes.position.count;

	return `
	def Mesh "${ name }"
	{
		int[] faceVertexCounts = [${ buildMeshVertexCount( geometry ) }]
		int[] faceVertexIndices = [${ buildMeshVertexIndices( geometry ) }]
		normal3f[] normals = [${ buildVector3Array( attributes.normal, count )}] (
			interpolation = "vertex"
		)
		point3f[] points = [${ buildVector3Array( attributes.position, count )}]
${ buildPrimvars( attributes ) }
		uniform token subdivisionScheme = "none"
	}
`;

}

function buildMeshVertexCount( geometry ) {

	const count = geometry.index !== null ? geometry.index.count : geometry.attributes.position.count;

	return Array( count / 3 ).fill( 3 ).join( ', ' );

}

function buildMeshVertexIndices( geometry ) {

	const index = geometry.index;
	const array = [];

	if ( index !== null ) {

		for ( let i = 0; i < index.count; i ++ ) {

			array.push( index.getX( i ) );

		}

	} else {

		const length = geometry.attributes.position.count;

		for ( let i = 0; i < length; i ++ ) {

			array.push( i );

		}

	}

	return array.join( ', ' );

}

function buildVector3Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: Normals missing.' );
		return Array( count ).fill( '(0, 0, 0)' ).join( ', ' );

	}

	const array = [];

	for ( let i = 0; i < attribute.count; i ++ ) {

		const x = attribute.getX( i );
		const y = attribute.getY( i );
		const z = attribute.getZ( i );

		array.push( `(${ x.toPrecision( PRECISION ) }, ${ y.toPrecision( PRECISION ) }, ${ z.toPrecision( PRECISION ) })` );

	}

	return array.join( ', ' );

}

function buildVector2Array( attribute ) {

	const array = [];

	for ( let i = 0; i < attribute.count; i ++ ) {

		const x = attribute.getX( i );
		const y = attribute.getY( i );

		array.push( `(${ x.toPrecision( PRECISION ) }, ${ 1 - y.toPrecision( PRECISION ) })` );

	}

	return array.join( ', ' );

}

function buildPrimvars( attributes ) {

	let string = '';

	for ( let i = 0; i < 4; i ++ ) {

		const id = ( i > 0 ? i : '' );
		const attribute = attributes[ 'uv' + id ];

		if ( attribute !== undefined ) {

			string += `
		texCoord2f[] primvars:st${ id } = [${ buildVector2Array( attribute )}] (
			interpolation = "vertex"
		)`;

		}

	}

	// vertex colors

	const colorAttribute = attributes.color;

	if ( colorAttribute !== undefined ) {

		const count = colorAttribute.count;

		string += `
	color3f[] primvars:displayColor = [${buildVector3Array( colorAttribute, count )}] (
		interpolation = "vertex"
		)`;

	}

	return string;

}

// Materials

function buildMaterials( materials, textures, quickLookCompatible = false ) {

	const array = [];

	for ( const uuid in materials ) {

		const material = materials[ uuid ];

		array.push( buildMaterial( material, textures, quickLookCompatible ) );

	}

	return `def "Materials"
{
${ array.join( '' ) }
}

`;

}

function buildMaterial( material, textures, quickLookCompatible = false ) {

	// https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

	const pad = '			';
	const inputs = [];
	const samplers = [];

	function buildTexture( texture, mapType, color ) {

		const id = texture.source.id + '_' + texture.flipY;

		textures[ id ] = texture;

		const uv = texture.channel > 0 ? 'st' + texture.channel : 'st';

		const WRAPPINGS = {
			1000: 'repeat', // RepeatWrapping
			1001: 'clamp', // ClampToEdgeWrapping
			1002: 'mirror' // MirroredRepeatWrapping
		};

		const repeat = texture.repeat.clone();
		const offset = texture.offset.clone();
		const rotation = texture.rotation;

		// rotation is around the wrong point. after rotation we need to shift offset again so that we're rotating around the right spot
		const xRotationOffset = Math.sin( rotation );
		const yRotationOffset = Math.cos( rotation );

		// texture coordinates start in the opposite corner, need to correct
		offset.y = 1 - offset.y - repeat.y;

		// turns out QuickLook is buggy and interprets texture repeat inverted/applies operations in a different order.
		// Apple Feedback: 	FB10036297 and FB11442287
		if ( quickLookCompatible ) {

			// This is NOT correct yet in QuickLook, but comes close for a range of models.
			// It becomes more incorrect the bigger the offset is

			offset.x = offset.x / repeat.x;
			offset.y = offset.y / repeat.y;

			offset.x += xRotationOffset / repeat.x;
			offset.y += yRotationOffset - 1;

		} else {

			// results match glTF results exactly. verified correct in usdview.
			offset.x += xRotationOffset * repeat.x;
			offset.y += ( 1 - yRotationOffset ) * repeat.y;

		}

		return `
		def Shader "PrimvarReader_${ mapType }"
		{
			uniform token info:id = "UsdPrimvarReader_float2"
			float2 inputs:fallback = (0.0, 0.0)
			token inputs:varname = "${ uv }"
			float2 outputs:result
		}

		def Shader "Transform2d_${ mapType }"
		{
			uniform token info:id = "UsdTransform2d"
			token inputs:in.connect = </Materials/Material_${ material.id }/PrimvarReader_${ mapType }.outputs:result>
			float inputs:rotation = ${ ( rotation * ( 180 / Math.PI ) ).toFixed( PRECISION ) }
			float2 inputs:scale = ${ buildVector2( repeat ) }
			float2 inputs:translation = ${ buildVector2( offset ) }
			float2 outputs:result
		}

		def Shader "Texture_${ texture.id }_${ mapType }"
		{
			uniform token info:id = "UsdUVTexture"
			asset inputs:file = @textures/Texture_${ id }.png@
			float2 inputs:st.connect = </Materials/Material_${ material.id }/Transform2d_${ mapType }.outputs:result>
			${ color !== undefined ? 'float4 inputs:scale = ' + buildColor4( color ) : '' }
			token inputs:sourceColorSpace = "${ texture.colorSpace === NoColorSpace ? 'raw' : 'sRGB' }"
			token inputs:wrapS = "${ WRAPPINGS[ texture.wrapS ] }"
			token inputs:wrapT = "${ WRAPPINGS[ texture.wrapT ] }"
			float outputs:r
			float outputs:g
			float outputs:b
			float3 outputs:rgb
			${ material.transparent || material.alphaTest > 0.0 ? 'float outputs:a' : '' }
		}`;

	}


	if ( material.side === DoubleSide ) {

		console.warn( 'THREE.USDZExporter: USDZ does not support double sided materials', material );

	}

	if ( material.map !== null ) {

		inputs.push( `${ pad }color3f inputs:diffuseColor.connect = </Materials/Material_${ material.id }/Texture_${ material.map.id }_diffuse.outputs:rgb>` );

		if ( material.transparent ) {

			inputs.push( `${ pad }float inputs:opacity.connect = </Materials/Material_${ material.id }/Texture_${ material.map.id }_diffuse.outputs:a>` );

		} else if ( material.alphaTest > 0.0 ) {

			inputs.push( `${ pad }float inputs:opacity.connect = </Materials/Material_${ material.id }/Texture_${ material.map.id }_diffuse.outputs:a>` );
			inputs.push( `${ pad }float inputs:opacityThreshold = ${material.alphaTest}` );

		}

		samplers.push( buildTexture( material.map, 'diffuse', material.color ) );

	} else {

		inputs.push( `${ pad }color3f inputs:diffuseColor = ${ buildColor( material.color ) }` );

	}

	if ( material.emissiveMap !== null ) {

		inputs.push( `${ pad }color3f inputs:emissiveColor.connect = </Materials/Material_${ material.id }/Texture_${ material.emissiveMap.id }_emissive.outputs:rgb>` );

		samplers.push( buildTexture( material.emissiveMap, 'emissive', new Color( material.emissive.r * material.emissiveIntensity, material.emissive.g * material.emissiveIntensity, material.emissive.b * material.emissiveIntensity ) ) );

	} else if ( material.emissive.getHex() > 0 ) {

		inputs.push( `${ pad }color3f inputs:emissiveColor = ${ buildColor( material.emissive ) }` );

	}

	if ( material.normalMap !== null ) {

		inputs.push( `${ pad }normal3f inputs:normal.connect = </Materials/Material_${ material.id }/Texture_${ material.normalMap.id }_normal.outputs:rgb>` );

		samplers.push( buildTexture( material.normalMap, 'normal' ) );

	}

	if ( material.aoMap !== null ) {

		inputs.push( `${ pad }float inputs:occlusion.connect = </Materials/Material_${ material.id }/Texture_${ material.aoMap.id }_occlusion.outputs:r>` );

		samplers.push( buildTexture( material.aoMap, 'occlusion', new Color( material.aoMapIntensity, material.aoMapIntensity, material.aoMapIntensity ) ) );

	}

	if ( material.roughnessMap !== null ) {

		inputs.push( `${ pad }float inputs:roughness.connect = </Materials/Material_${ material.id }/Texture_${ material.roughnessMap.id }_roughness.outputs:g>` );

		samplers.push( buildTexture( material.roughnessMap, 'roughness', new Color( material.roughness, material.roughness, material.roughness ) ) );

	} else {

		inputs.push( `${ pad }float inputs:roughness = ${ material.roughness }` );

	}

	if ( material.metalnessMap !== null ) {

		inputs.push( `${ pad }float inputs:metallic.connect = </Materials/Material_${ material.id }/Texture_${ material.metalnessMap.id }_metallic.outputs:b>` );

		samplers.push( buildTexture( material.metalnessMap, 'metallic', new Color( material.metalness, material.metalness, material.metalness ) ) );

	} else {

		inputs.push( `${ pad }float inputs:metallic = ${ material.metalness }` );

	}

	if ( material.alphaMap !== null ) {

		inputs.push( `${pad}float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.alphaMap.id}_opacity.outputs:r>` );
		inputs.push( `${pad}float inputs:opacityThreshold = 0.0001` );

		samplers.push( buildTexture( material.alphaMap, 'opacity' ) );

	} else {

		inputs.push( `${pad}float inputs:opacity = ${material.opacity}` );

	}

	if ( material.isMeshPhysicalMaterial ) {

		if ( material.clearcoatMap !== null ) {

			inputs.push( `${pad}float inputs:clearcoat.connect = </Materials/Material_${material.id}/Texture_${material.clearcoatMap.id}_clearcoat.outputs:r>` );
			samplers.push( buildTexture( material.clearcoatMap, 'clearcoat', new Color( material.clearcoat, material.clearcoat, material.clearcoat ) ) );

		} else {

			inputs.push( `${pad}float inputs:clearcoat = ${material.clearcoat}` );

		}

		if ( material.clearcoatRoughnessMap !== null ) {

			inputs.push( `${pad}float inputs:clearcoatRoughness.connect = </Materials/Material_${material.id}/Texture_${material.clearcoatRoughnessMap.id}_clearcoatRoughness.outputs:g>` );
			samplers.push( buildTexture( material.clearcoatRoughnessMap, 'clearcoatRoughness', new Color( material.clearcoatRoughness, material.clearcoatRoughness, material.clearcoatRoughness ) ) );

		} else {

			inputs.push( `${pad}float inputs:clearcoatRoughness = ${material.clearcoatRoughness}` );

		}

		inputs.push( `${ pad }float inputs:ior = ${ material.ior }` );

	}

	return `
	def Material "Material_${ material.id }"
	{
		def Shader "PreviewSurface"
		{
			uniform token info:id = "UsdPreviewSurface"
${ inputs.join( '\n' ) }
			int inputs:useSpecularWorkflow = 0
			token outputs:surface
		}

		token outputs:surface.connect = </Materials/Material_${ material.id }/PreviewSurface.outputs:surface>

${ samplers.join( '\n' ) }

	}
`;

}

function buildColor( color ) {

	return `(${ color.r }, ${ color.g }, ${ color.b })`;

}

function buildColor4( color ) {

	return `(${ color.r }, ${ color.g }, ${ color.b }, 1.0)`;

}

function buildVector2( vector ) {

	return `(${ vector.x }, ${ vector.y })`;

}


function buildCamera( camera ) {

	const name = camera.name ? camera.name : 'Camera_' + camera.id;

	const transform = buildMatrix( camera.matrixWorld );

	if ( camera.matrixWorld.determinant() < 0 ) {

		console.warn( 'THREE.USDZExporter: USDZ does not support negative scales', camera );

	}

	if ( camera.isOrthographicCamera ) {

		return `def Camera "${name}"
		{
			matrix4d xformOp:transform = ${ transform }
			uniform token[] xformOpOrder = ["xformOp:transform"]

			float2 clippingRange = (${ camera.near.toPrecision( PRECISION ) }, ${ camera.far.toPrecision( PRECISION ) })
			float horizontalAperture = ${ ( ( Math.abs( camera.left ) + Math.abs( camera.right ) ) * 10 ).toPrecision( PRECISION ) }
			float verticalAperture = ${ ( ( Math.abs( camera.top ) + Math.abs( camera.bottom ) ) * 10 ).toPrecision( PRECISION ) }
			token projection = "orthographic"
		}

	`;

	} else {

		return `def Camera "${name}"
		{
			matrix4d xformOp:transform = ${ transform }
			uniform token[] xformOpOrder = ["xformOp:transform"]

			float2 clippingRange = (${ camera.near.toPrecision( PRECISION ) }, ${ camera.far.toPrecision( PRECISION ) })
			float focalLength = ${ camera.getFocalLength().toPrecision( PRECISION ) }
			float focusDistance = ${ camera.focus.toPrecision( PRECISION ) }
			float horizontalAperture = ${ camera.getFilmWidth().toPrecision( PRECISION ) }
			token projection = "perspective"
			float verticalAperture = ${ camera.getFilmHeight().toPrecision( PRECISION ) }
		}

	`;

	}

}

/**
 * Export options of `USDZExporter`.
 *
 * @typedef {Object} USDZExporter~Options
 * @property {number} [maxTextureSize=1024] - The maximum texture size that is going to be exported.
 * @property {boolean} [includeAnchoringProperties=true] - Whether to include anchoring properties or not.
 * @property {Object} [ar] - If `includeAnchoringProperties` is set to `true`, the anchoring type and alignment
 * can be configured via `ar.anchoring.type` and `ar.planeAnchoring.alignment`.
 * @property {boolean} [quickLookCompatible=false] - Whether to make the exported USDZ compatible to QuickLook
 * which means the asset is modified to accommodate the bugs FB10036297 and FB11442287 (Apple Feedback).
 **/

/**
 * onDone callback of `USDZExporter`.
 *
 * @callback USDZExporter~OnDone
 * @param {ArrayBuffer} result - The generated USDZ.
 */

/**
 * onError callback of `USDZExporter`.
 *
 * @callback USDZExporter~OnError
 * @param {Error} error - The error object.
 */

export { USDZExporter };
