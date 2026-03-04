import {
	NoColorSpace,
	DoubleSide,
	Color,
} from 'three';

import {
	strToU8,
	zipSync,
} from '../libs/fflate.module.js';

class USDNode {

	constructor( name, type = '', metadata = [], properties = [] ) {

		this.name = name;
		this.type = type;
		this.metadata = metadata;
		this.properties = properties;
		this.children = [];

	}

	addMetadata( key, value ) {

		this.metadata.push( { key, value } );

	}

	addProperty( property, metadata = [] ) {

		this.properties.push( { property, metadata } );

	}

	addChild( child ) {

		this.children.push( child );

	}

	toString( indent = 0 ) {

		const pad = '\t'.repeat( indent );

		const formattedMetadata = this.metadata.map( ( item ) => {

			const key = item.key;
			const value = item.value;

			if ( Array.isArray( value ) ) {

				const lines = [];
				lines.push( `${key} = {` );
				value.forEach( ( line ) => {

					lines.push( `${pad}\t\t${line}` );

				} );
				lines.push( `${pad}\t}` );
				return lines.join( '\n' );

			} else {

				return `${key} = ${value}`;

			}

		} );

		const meta = formattedMetadata.length
			? ` (\n${formattedMetadata
				.map( ( l ) => `${pad}\t${l}` )
				.join( '\n' )}\n${pad})`
			: '';

		const properties = this.properties.map( ( l ) => {

			const property = l.property;
			const metadata = l.metadata.length
				? ` (\n${l.metadata.map( ( m ) => `${pad}\t\t${m}` ).join( '\n' )}\n${pad}\t)`
				: '';
			return `${pad}\t${property}${metadata}`;

		} );
		const children = this.children.map( ( c ) => c.toString( indent + 1 ) );

		const bodyLines = [];

		if ( properties.length > 0 ) {

			bodyLines.push( ...properties );

		}

		if ( children.length > 0 ) {

			if ( properties.length > 0 ) {

				bodyLines.push( '' );

			}

			for ( let i = 0; i < children.length; i ++ ) {

				bodyLines.push( children[ i ] );
				if ( i < children.length - 1 ) {

					bodyLines.push( '' );

				}

			}

		}

		const bodyContent = bodyLines.join( '\n' );

		const type = this.type ? this.type + ' ' : '';

		return `${pad}def ${type}"${this.name}"${meta}\n${pad}{\n${bodyContent}\n${pad}}`;

	}

}

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

		options = Object.assign(
			{
				ar: {
					anchoring: { type: 'plane' },
					planeAnchoring: { alignment: 'horizontal' },
				},
				includeAnchoringProperties: true,
				onlyVisible: true,
				quickLookCompatible: false,
				maxTextureSize: 1024,
			},
			options
		);

		const usedNames = new Set();

		const files = {};
		const modelFileName = 'model.usda';

		// model file should be first in USDZ archive so we init it here
		files[ modelFileName ] = null;

		const root = new USDNode( 'Root', 'Xform' );
		const scenesNode = new USDNode( 'Scenes', 'Scope' );
		scenesNode.addMetadata( 'kind', '"sceneLibrary"' );
		root.addChild( scenesNode );

		const sceneName = 'Scene';
		const sceneNode = new USDNode( sceneName, 'Xform' );
		sceneNode.addMetadata( 'customData', [
			'bool preliminary_collidesWithEnvironment = 0',
			`string sceneName = "${sceneName}"`,
		] );
		sceneNode.addMetadata( 'sceneName', `"${sceneName}"` );
		if ( options.includeAnchoringProperties ) {

			sceneNode.addProperty(
				`token preliminary:anchoring:type = "${options.ar.anchoring.type}"`
			);
			sceneNode.addProperty(
				`token preliminary:planeAnchoring:alignment = "${options.ar.planeAnchoring.alignment}"`
			);

		}

		scenesNode.addChild( sceneNode );

		let output;

		const materials = {};
		const textures = {};

		buildHierarchy( scene, sceneNode, materials, usedNames, files, options );

		const materialsNode = buildMaterials(
			materials,
			textures,
			options.quickLookCompatible
		);

		output =
			buildHeader() +
			'\n' +
			root.toString() +
			'\n\n' +
			materialsNode.toString();

		files[ modelFileName ] = strToU8( output );
		output = null;

		for ( const id in textures ) {

			let texture = textures[ id ];

			if ( texture.isCompressedTexture === true ) {

				if ( this.textureUtils === null ) {

					throw new Error(
						'THREE.USDZExporter: setTextureUtils() must be called to process compressed textures.'
					);

				} else {

					texture = await this.textureUtils.decompress( texture );

				}

			}

			const canvas = imageToCanvas(
				texture.image,
				texture.flipY,
				options.maxTextureSize
			);
			const blob = await new Promise( ( resolve ) =>
				canvas.toBlob( resolve, 'image/png', 1 )
			);

			files[ `textures/Texture_${id}.png` ] = new Uint8Array(
				await blob.arrayBuffer()
			);

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

function getName( object, namesSet ) {

	let name = object.name;
	name = name.replace( /[^A-Za-z0-9_]/g, '' );
	if ( /^[0-9]/.test( name ) ) {

		name = '_' + name;

	}

	if ( name === '' ) {

		if ( object.isCamera ) {

			name = 'Camera';

		} else {

			name = 'Object';

		}

	}

	if ( namesSet.has( name ) ) {

		name = name + '_' + object.id;

	}

	namesSet.add( name );

	return name;

}

function imageToCanvas( image, flipY, maxTextureSize ) {

	if (
		( typeof HTMLImageElement !== 'undefined' &&
			image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' &&
			image instanceof HTMLCanvasElement ) ||
		( typeof OffscreenCanvas !== 'undefined' &&
			image instanceof OffscreenCanvas ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap )
	) {

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

		throw new Error(
			'THREE.USDZExporter: No valid image data found. Unable to process texture.'
		);

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

// Xform

function buildHierarchy( object, parentNode, materials, usedNames, files, options ) {

	for ( let i = 0, l = object.children.length; i < l; i ++ ) {

		const child = object.children[ i ];

		if ( child.visible === false && options.onlyVisible === true ) continue;

		let childNode;

		if ( child.isMesh ) {

			const geometry = child.geometry;
			const material = child.material;

			if ( material.isMeshStandardMaterial ) {

				const geometryFileName = 'geometries/Geometry_' + geometry.id + '.usda';

				if ( ! ( geometryFileName in files ) ) {

					const meshObject = buildMeshObject( geometry );
					files[ geometryFileName ] = strToU8(
						buildHeader() + '\n' + meshObject.toString()
					);

				}

				if ( ! ( material.uuid in materials ) ) {

					materials[ material.uuid ] = material;

				}

				childNode = buildMesh(
					child,
					geometry,
					materials[ material.uuid ],
					usedNames
				);

			} else {

				console.warn(
					'THREE.USDZExporter: Unsupported material type (USDZ only supports MeshStandardMaterial)',
					child
				);

			}

		} else if ( child.isCamera ) {

			childNode = buildCamera( child, usedNames );

		} else {

			childNode = buildXform( child, usedNames );

		}

		if ( childNode ) {

			parentNode.addChild( childNode );
			buildHierarchy( child, childNode, materials, usedNames, files, options );

		}

	}

}

function buildXform( object, usedNames ) {

	const name = getName( object, usedNames );

	if ( object.matrix.determinant() < 0 ) {

		console.warn(
			'THREE.USDZExporter: USDZ does not support negative scales',
			object
		);

	}

	const node = new USDNode( name, 'Xform' );

	if ( object.pivot !== null ) {

		// Export with pivot using separate transform ops
		const p = object.position;
		const q = object.quaternion;
		const s = object.scale;
		const piv = object.pivot;

		node.addProperty( `float3 xformOp:translate = (${p.x.toPrecision( PRECISION )}, ${p.y.toPrecision( PRECISION )}, ${p.z.toPrecision( PRECISION )})` );
		node.addProperty( `float3 xformOp:translate:pivot = (${piv.x.toPrecision( PRECISION )}, ${piv.y.toPrecision( PRECISION )}, ${piv.z.toPrecision( PRECISION )})` );
		node.addProperty( `quatf xformOp:orient = (${q.w.toPrecision( PRECISION )}, ${q.x.toPrecision( PRECISION )}, ${q.y.toPrecision( PRECISION )}, ${q.z.toPrecision( PRECISION )})` );
		node.addProperty( `float3 xformOp:scale = (${s.x.toPrecision( PRECISION )}, ${s.y.toPrecision( PRECISION )}, ${s.z.toPrecision( PRECISION )})` );
		node.addProperty( 'uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:translate:pivot", "xformOp:orient", "xformOp:scale", "!invert!xformOp:translate:pivot"]' );

	} else {

		// Export as single transform matrix
		const transform = buildMatrix( object.matrix );
		node.addProperty( `matrix4d xformOp:transform = ${transform}` );
		node.addProperty( 'uniform token[] xformOpOrder = ["xformOp:transform"]' );

	}

	return node;

}

function buildMesh( object, geometry, material, usedNames ) {

	const node = buildXform( object, usedNames );

	node.addMetadata(
		'prepend references',
		`@./geometries/Geometry_${geometry.id}.usda@</Geometry>`
	);
	node.addMetadata( 'prepend apiSchemas', '["MaterialBindingAPI"]' );

	node.addProperty(
		`rel material:binding = </Materials/Material_${material.id}>`
	);

	return node;

}

function buildMatrix( matrix ) {

	const array = matrix.elements;

	return `( ${buildMatrixRow( array, 0 )}, ${buildMatrixRow(
		array,
		4
	)}, ${buildMatrixRow( array, 8 )}, ${buildMatrixRow( array, 12 )} )`;

}

function buildMatrixRow( array, offset ) {

	return `(${array[ offset + 0 ]}, ${array[ offset + 1 ]}, ${array[ offset + 2 ]}, ${
		array[ offset + 3 ]
	})`;

}

// Mesh

function buildMeshObject( geometry ) {

	const node = new USDNode( 'Geometry' );

	const meshNode = buildMeshNode( geometry );
	node.addChild( meshNode );

	return node;

}

function buildMeshNode( geometry ) {

	const name = 'Geometry';
	const attributes = geometry.attributes;
	const count = attributes.position.count;

	const node = new USDNode( name, 'Mesh' );

	node.addProperty(
		`int[] faceVertexCounts = [${buildMeshVertexCount( geometry )}]`
	);
	node.addProperty(
		`int[] faceVertexIndices = [${buildMeshVertexIndices( geometry )}]`
	);
	node.addProperty(
		`normal3f[] normals = [${buildVector3Array( attributes.normal, count )}]`,
		[ 'interpolation = "vertex"' ]
	);
	node.addProperty(
		`point3f[] points = [${buildVector3Array( attributes.position, count )}]`
	);

	for ( let i = 0; i < 4; i ++ ) {

		const id = i > 0 ? i : '';
		const attribute = attributes[ 'uv' + id ];
		if ( attribute !== undefined ) {

			node.addProperty(
				`texCoord2f[] primvars:st${id} = [${buildVector2Array( attribute )}]`,
				[ 'interpolation = "vertex"' ]
			);

		}

	}

	const colorAttribute = attributes.color;
	if ( colorAttribute !== undefined ) {

		node.addProperty(
			`color3f[] primvars:displayColor = [${buildVector3Array(
				colorAttribute,
				count
			)}]`,
			[ 'interpolation = "vertex"' ]
		);

	}

	node.addProperty( 'uniform token subdivisionScheme = "none"' );

	return node;

}

function buildMeshVertexCount( geometry ) {

	const count =
		geometry.index !== null
			? geometry.index.count
			: geometry.attributes.position.count;

	return Array( count / 3 )
		.fill( 3 )
		.join( ', ' );

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

		array.push(
			`(${x.toPrecision( PRECISION )}, ${y.toPrecision(
				PRECISION
			)}, ${z.toPrecision( PRECISION )})`
		);

	}

	return array.join( ', ' );

}

function buildVector2Array( attribute ) {

	const array = [];

	for ( let i = 0; i < attribute.count; i ++ ) {

		const x = attribute.getX( i );
		const y = attribute.getY( i );

		array.push(
			`(${x.toPrecision( PRECISION )}, ${1 - y.toPrecision( PRECISION )})`
		);

	}

	return array.join( ', ' );

}

// Materials

function buildMaterials( materials, textures, quickLookCompatible = false ) {

	const materialsNode = new USDNode( 'Materials' );

	for ( const uuid in materials ) {

		const material = materials[ uuid ];

		materialsNode.addChild(
			buildMaterial( material, textures, quickLookCompatible )
		);

	}

	return materialsNode;

}

function buildMaterial( material, textures, quickLookCompatible = false ) {

	// https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

	const materialNode = new USDNode( `Material_${material.id}`, 'Material' );

	function buildTextureNodes( texture, mapType, color ) {

		const id = texture.source.id + '_' + texture.flipY;

		textures[ id ] = texture;

		const uv = texture.channel > 0 ? 'st' + texture.channel : 'st';

		const WRAPPINGS = {
			1000: 'repeat', // RepeatWrapping
			1001: 'clamp', // ClampToEdgeWrapping
			1002: 'mirror', // MirroredRepeatWrapping
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

		const primvarReaderNode = new USDNode( `PrimvarReader_${mapType}`, 'Shader' );
		primvarReaderNode.addProperty(
			'uniform token info:id = "UsdPrimvarReader_float2"'
		);
		primvarReaderNode.addProperty( 'float2 inputs:fallback = (0.0, 0.0)' );
		primvarReaderNode.addProperty( `string inputs:varname = "${uv}"` );
		primvarReaderNode.addProperty( 'float2 outputs:result' );

		const transform2dNode = new USDNode( `Transform2d_${mapType}`, 'Shader' );
		transform2dNode.addProperty( 'uniform token info:id = "UsdTransform2d"' );
		transform2dNode.addProperty(
			`float2 inputs:in.connect = </Materials/Material_${material.id}/PrimvarReader_${mapType}.outputs:result>`
		);
		transform2dNode.addProperty(
			`float inputs:rotation = ${( rotation * ( 180 / Math.PI ) ).toFixed(
				PRECISION
			)}`
		);
		transform2dNode.addProperty(
			`float2 inputs:scale = ${buildVector2( repeat )}`
		);
		transform2dNode.addProperty(
			`float2 inputs:translation = ${buildVector2( offset )}`
		);
		transform2dNode.addProperty( 'float2 outputs:result' );

		const textureNode = new USDNode(
			`Texture_${texture.id}_${mapType}`,
			'Shader'
		);
		textureNode.addProperty( 'uniform token info:id = "UsdUVTexture"' );
		textureNode.addProperty( `asset inputs:file = @textures/Texture_${id}.png@` );
		textureNode.addProperty(
			`float2 inputs:st.connect = </Materials/Material_${material.id}/Transform2d_${mapType}.outputs:result>`
		);

		if ( color !== undefined ) {

			textureNode.addProperty( `float4 inputs:scale = ${buildColor4( color )}` );

		}

		if ( mapType === 'normal' ) {

			textureNode.addProperty( 'float4 inputs:scale = (2, 2, 2, 1)' );
			textureNode.addProperty( 'float4 inputs:bias = (-1, -1, -1, 0)' );

		}

		textureNode.addProperty(
			`token inputs:sourceColorSpace = "${
				texture.colorSpace === NoColorSpace ? 'raw' : 'sRGB'
			}"`
		);
		textureNode.addProperty(
			`token inputs:wrapS = "${WRAPPINGS[ texture.wrapS ]}"`
		);
		textureNode.addProperty(
			`token inputs:wrapT = "${WRAPPINGS[ texture.wrapT ]}"`
		);
		textureNode.addProperty( 'float outputs:r' );
		textureNode.addProperty( 'float outputs:g' );
		textureNode.addProperty( 'float outputs:b' );
		textureNode.addProperty( 'float3 outputs:rgb' );

		if ( material.transparent || material.alphaTest > 0.0 ) {

			textureNode.addProperty( 'float outputs:a' );

		}

		return [ primvarReaderNode, transform2dNode, textureNode ];

	}

	if ( material.side === DoubleSide ) {

		console.warn(
			'THREE.USDZExporter: USDZ does not support double sided materials',
			material
		);

	}

	const previewSurfaceNode = new USDNode( 'PreviewSurface', 'Shader' );
	previewSurfaceNode.addProperty( 'uniform token info:id = "UsdPreviewSurface"' );

	if ( material.map !== null ) {

		previewSurfaceNode.addProperty(
			`color3f inputs:diffuseColor.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:rgb>`
		);

		if ( material.transparent ) {

			previewSurfaceNode.addProperty(
				`float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:a>`
			);

		} else if ( material.alphaTest > 0.0 ) {

			previewSurfaceNode.addProperty(
				`float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.map.id}_diffuse.outputs:a>`
			);
			previewSurfaceNode.addProperty(
				`float inputs:opacityThreshold = ${material.alphaTest}`
			);

		}

		const textureNodes = buildTextureNodes(
			material.map,
			'diffuse',
			material.color
		);
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	} else {

		previewSurfaceNode.addProperty(
			`color3f inputs:diffuseColor = ${buildColor( material.color )}`
		);

	}

	if ( material.emissiveMap !== null ) {

		previewSurfaceNode.addProperty(
			`color3f inputs:emissiveColor.connect = </Materials/Material_${material.id}/Texture_${material.emissiveMap.id}_emissive.outputs:rgb>`
		);

		const emissiveColor = new Color(
			material.emissive.r * material.emissiveIntensity,
			material.emissive.g * material.emissiveIntensity,
			material.emissive.b * material.emissiveIntensity
		);
		const textureNodes = buildTextureNodes(
			material.emissiveMap,
			'emissive',
			emissiveColor
		);
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	} else if ( material.emissive.getHex() > 0 ) {

		previewSurfaceNode.addProperty(
			`color3f inputs:emissiveColor = ${buildColor( material.emissive )}`
		);

	}

	if ( material.normalMap !== null ) {

		previewSurfaceNode.addProperty(
			`normal3f inputs:normal.connect = </Materials/Material_${material.id}/Texture_${material.normalMap.id}_normal.outputs:rgb>`
		);

		const textureNodes = buildTextureNodes( material.normalMap, 'normal' );
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	}

	if ( material.aoMap !== null ) {

		previewSurfaceNode.addProperty(
			`float inputs:occlusion.connect = </Materials/Material_${material.id}/Texture_${material.aoMap.id}_occlusion.outputs:r>`
		);

		const aoColor = new Color(
			material.aoMapIntensity,
			material.aoMapIntensity,
			material.aoMapIntensity
		);
		const textureNodes = buildTextureNodes(
			material.aoMap,
			'occlusion',
			aoColor
		);
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	}

	if ( material.roughnessMap !== null ) {

		previewSurfaceNode.addProperty(
			`float inputs:roughness.connect = </Materials/Material_${material.id}/Texture_${material.roughnessMap.id}_roughness.outputs:g>`
		);

		const roughnessColor = new Color(
			material.roughness,
			material.roughness,
			material.roughness
		);
		const textureNodes = buildTextureNodes(
			material.roughnessMap,
			'roughness',
			roughnessColor
		);
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	} else {

		previewSurfaceNode.addProperty(
			`float inputs:roughness = ${material.roughness}`
		);

	}

	if ( material.metalnessMap !== null ) {

		previewSurfaceNode.addProperty(
			`float inputs:metallic.connect = </Materials/Material_${material.id}/Texture_${material.metalnessMap.id}_metallic.outputs:b>`
		);

		const metalnessColor = new Color(
			material.metalness,
			material.metalness,
			material.metalness
		);
		const textureNodes = buildTextureNodes(
			material.metalnessMap,
			'metallic',
			metalnessColor
		);
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	} else {

		previewSurfaceNode.addProperty(
			`float inputs:metallic = ${material.metalness}`
		);

	}

	if ( material.alphaMap !== null ) {

		previewSurfaceNode.addProperty(
			`float inputs:opacity.connect = </Materials/Material_${material.id}/Texture_${material.alphaMap.id}_opacity.outputs:r>`
		);
		previewSurfaceNode.addProperty( 'float inputs:opacityThreshold = 0.0001' );

		const textureNodes = buildTextureNodes( material.alphaMap, 'opacity' );
		textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

	} else {

		previewSurfaceNode.addProperty(
			`float inputs:opacity = ${material.opacity}`
		);

	}

	if ( material.isMeshPhysicalMaterial ) {

		if ( material.clearcoatMap !== null ) {

			previewSurfaceNode.addProperty(
				`float inputs:clearcoat.connect = </Materials/Material_${material.id}/Texture_${material.clearcoatMap.id}_clearcoat.outputs:r>`
			);

			const clearcoatColor = new Color(
				material.clearcoat,
				material.clearcoat,
				material.clearcoat
			);
			const textureNodes = buildTextureNodes(
				material.clearcoatMap,
				'clearcoat',
				clearcoatColor
			);
			textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

		} else {

			previewSurfaceNode.addProperty(
				`float inputs:clearcoat = ${material.clearcoat}`
			);

		}

		if ( material.clearcoatRoughnessMap !== null ) {

			previewSurfaceNode.addProperty(
				`float inputs:clearcoatRoughness.connect = </Materials/Material_${material.id}/Texture_${material.clearcoatRoughnessMap.id}_clearcoatRoughness.outputs:g>`
			);

			const clearcoatRoughnessColor = new Color(
				material.clearcoatRoughness,
				material.clearcoatRoughness,
				material.clearcoatRoughness
			);
			const textureNodes = buildTextureNodes(
				material.clearcoatRoughnessMap,
				'clearcoatRoughness',
				clearcoatRoughnessColor
			);
			textureNodes.forEach( ( node ) => materialNode.addChild( node ) );

		} else {

			previewSurfaceNode.addProperty(
				`float inputs:clearcoatRoughness = ${material.clearcoatRoughness}`
			);

		}

		previewSurfaceNode.addProperty( `float inputs:ior = ${material.ior}` );

	}

	previewSurfaceNode.addProperty( 'int inputs:useSpecularWorkflow = 0' );
	previewSurfaceNode.addProperty( 'token outputs:surface' );

	materialNode.addChild( previewSurfaceNode );

	materialNode.addProperty(
		`token outputs:surface.connect = </Materials/Material_${material.id}/PreviewSurface.outputs:surface>`
	);

	return materialNode;

}

function buildColor( color ) {

	return `(${color.r}, ${color.g}, ${color.b})`;

}

function buildColor4( color ) {

	return `(${color.r}, ${color.g}, ${color.b}, 1.0)`;

}

function buildVector2( vector ) {

	return `(${vector.x}, ${vector.y})`;

}

function buildCamera( camera, usedNames ) {

	const name = getName( camera, usedNames );

	const transform = buildMatrix( camera.matrix );

	if ( camera.matrix.determinant() < 0 ) {

		console.warn(
			'THREE.USDZExporter: USDZ does not support negative scales',
			camera
		);

	}

	const node = new USDNode( name, 'Camera' );
	node.addProperty( `matrix4d xformOp:transform = ${transform}` );
	node.addProperty( 'uniform token[] xformOpOrder = ["xformOp:transform"]' );

	const projection = camera.isOrthographicCamera
		? 'orthographic'
		: 'perspective';
	node.addProperty( `token projection = "${projection}"` );

	const clippingRange = `(${camera.near.toPrecision(
		PRECISION
	)}, ${camera.far.toPrecision( PRECISION )})`;
	node.addProperty( `float2 clippingRange = ${clippingRange}` );

	let horizontalAperture;
	if ( camera.isOrthographicCamera ) {

		horizontalAperture = (
			( Math.abs( camera.left ) + Math.abs( camera.right ) ) *
			10
		).toPrecision( PRECISION );

	} else {

		horizontalAperture = camera.getFilmWidth().toPrecision( PRECISION );

	}

	node.addProperty( `float horizontalAperture = ${horizontalAperture}` );

	let verticalAperture;
	if ( camera.isOrthographicCamera ) {

		verticalAperture = (
			( Math.abs( camera.top ) + Math.abs( camera.bottom ) ) *
			10
		).toPrecision( PRECISION );

	} else {

		verticalAperture = camera.getFilmHeight().toPrecision( PRECISION );

	}

	node.addProperty( `float verticalAperture = ${verticalAperture}` );

	if ( camera.isPerspectiveCamera ) {

		const focalLength = camera.getFocalLength().toPrecision( PRECISION );
		node.addProperty( `float focalLength = ${focalLength}` );

		const focusDistance = camera.focus.toPrecision( PRECISION );
		node.addProperty( `float focusDistance = ${focusDistance}` );

	}

	return node;

}

/**
 * Export options of `USDZExporter`.
 *
 * @typedef {Object} USDZExporter~Options
 * @property {number} [maxTextureSize=1024] - The maximum texture size that is going to be exported.
 * @property {boolean} [includeAnchoringProperties=true] - Whether to include anchoring properties or not.
 * @property {boolean} [onlyVisible=true] - Export only visible 3D objects.
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
