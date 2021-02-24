import { zipSync, strToU8 } from '../libs/fflate.module.min.js';

class USDZExporter {

	async parse( scene ) {

		let output = buildHeader();

		const materials = {};
		const textures = {};

		scene.traverse( ( object ) => {

			if ( object.isMesh ) {

				const geometry = object.geometry;
				const material = object.material;

				materials[ material.uuid ] = material;

				if ( material.map !== null ) textures[ material.map.uuid ] = material.map;
				if ( material.normalMap !== null ) textures[ material.normalMap.uuid ] = material.normalMap;
				if ( material.aoMap !== null ) textures[ material.aoMap.uuid ] = material.aoMap;
				if ( material.roughnessMap !== null ) textures[ material.roughnessMap.uuid ] = material.roughnessMap;
				if ( material.metalnessMap !== null ) textures[ material.metalnessMap.uuid ] = material.metalnessMap;
				if ( material.emissiveMap !== null ) textures[ material.emissiveMap.uuid ] = material.emissiveMap;

				output += buildXform( object, buildMesh( geometry, material ) );

			}

		} );

		output += buildMaterials( materials );
		output += buildTextures( textures );

		const files = { 'model.usda': strToU8( output ) };

		for ( const uuid in textures ) {

			const texture = textures[ uuid ];
			files[ 'textures/Texture_' + texture.id + '.jpg' ] = await imgToU8( texture.image );

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

async function imgToU8( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		const scale = 1024 / Math.max( image.width, image.height );

		const canvas = document.createElement( 'canvas' );
		canvas.width = image.width * Math.min( 1, scale );
		canvas.height = image.height * Math.min( 1, scale );

		const context = canvas.getContext( '2d' );
		context.drawImage( image, 0, 0, canvas.width, canvas.height );

		const blob = await new Promise( resolve => canvas.toBlob( resolve, 'image/jpeg', 1 ) );
		return new Uint8Array( await blob.arrayBuffer() );

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
    metersPerUnit = 1
    upAxis = "Y"
)

`;

}

// Xform

function buildXform( object, define ) {

	const name = 'Object_' + object.id;
	const transform = buildMatrix( object.matrixWorld );

	return `def Xform "${ name }"
{
    matrix4d xformOp:transform = ${ transform }
    uniform token[] xformOpOrder = ["xformOp:transform"]

    ${ define }
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

function buildMesh( geometry, material ) {

	const name = 'Geometry_' + geometry.id;
	const attributes = geometry.attributes;
	const count = attributes.position.count;

	if ( 'uv2' in attributes ) {

		console.warn( 'THREE.USDZExporter: uv2 not supported yet.' );

	}

	return `def Mesh "${ name }"
    {
        int[] faceVertexCounts = [${ buildMeshVertexCount( geometry ) }]
        int[] faceVertexIndices = [${ buildMeshVertexIndices( geometry ) }]
        rel material:binding = </Materials/Material_${ material.id }>
        normal3f[] normals = [${ buildVector3Array( attributes.normal, count )}] (
            interpolation = "vertex"
        )
        point3f[] points = [${ buildVector3Array( attributes.position, count )}]
        float2[] primvars:st = [${ buildVector2Array( attributes.uv, count )}] (
            interpolation = "vertex"
        )
        uniform token subdivisionScheme = "none"
    }
`;

}

function buildMeshVertexCount( geometry ) {

	const count = geometry.index !== null ? geometry.index.array.length : geometry.attributes.position.count;

	return Array( count / 3 ).fill( 3 ).join( ', ' );

}

function buildMeshVertexIndices( geometry ) {

	if ( geometry.index !== null ) {

		return geometry.index.array.join( ', ' );

	}

	const array = [];
	const length = geometry.attributes.position.count;

	for ( let i = 0; i < length; i ++ ) {

		array.push( i );

	}

	return array.join( ', ' );

}

function buildVector3Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: Normals missing.' );
		return Array( count ).fill( '(0, 0, 0)' ).join( ', ' );

	}

	const array = [];
	const data = attribute.array;

	for ( let i = 0; i < data.length; i += 3 ) {

		array.push( `(${ data[ i + 0 ].toPrecision( PRECISION ) }, ${ data[ i + 1 ].toPrecision( PRECISION ) }, ${ data[ i + 2 ].toPrecision( PRECISION ) })` );

	}

	return array.join( ', ' );

}

function buildVector2Array( attribute, count ) {

	if ( attribute === undefined ) {

		console.warn( 'USDZExporter: UVs missing.' );
		return Array( count ).fill( '(0, 0)' ).join( ', ' );

	}

	const array = [];
	const data = attribute.array;

	for ( let i = 0; i < data.length; i += 2 ) {

		array.push( `(${ data[ i + 0 ].toPrecision( PRECISION ) }, ${ 1 - data[ i + 1 ].toPrecision( PRECISION ) })` );

	}

	return array.join( ', ' );

}

// Materials

function buildMaterials( materials ) {

	const array = [];

	for ( const uuid in materials ) {

		const material = materials[ uuid ];

		array.push( buildMaterial( material ) );

	}

	return `def "Materials"
{
${ array.join( '' ) }
}

`;

}

function buildMaterial( material ) {

	// https://graphics.pixar.com/usd/docs/UsdPreviewSurface-Proposal.html

	const pad = '            ';
	const parameters = [];

	if ( material.map !== null ) {

		parameters.push( `${ pad }color3f inputs:diffuseColor.connect = </Textures/Texture_${ material.map.id }.outputs:rgb>` );

	} else {

		parameters.push( `${ pad }color3f inputs:diffuseColor = ${ buildColor( material.color ) }` );

	}

	if ( material.emissiveMap !== null ) {

		parameters.push( `${ pad }color3f inputs:emissiveColor.connect = </Textures/Texture_${ material.emissiveMap.id }.outputs:rgb>` );

	} else if ( material.emissive.getHex() > 0 ) {

		parameters.push( `${ pad }color3f inputs:emissiveColor = ${ buildColor( material.emissive ) }` );

	}

	if ( material.normalMap !== null ) {

		parameters.push( `${ pad }normal3f inputs:normal.connect = </Textures/Texture_${ material.normalMap.id }.outputs:rgb>` );

	}

	if ( material.aoMap !== null ) {

		parameters.push( `${ pad }float inputs:occlusion.connect = </Textures/Texture_${ material.aoMap.id }.outputs:r>` );

	}

	if ( material.roughnessMap !== null ) {

		parameters.push( `${ pad }float inputs:roughness.connect = </Textures/Texture_${ material.roughnessMap.id }.outputs:g>` );

	} else {

		parameters.push( `${ pad }float inputs:roughness = ${ material.roughness }` );

	}

	if ( material.metalnessMap !== null ) {

		parameters.push( `${ pad }float inputs:metallic.connect = </Textures/Texture_${ material.metalnessMap.id }.outputs:b>` );

	} else {

		parameters.push( `${ pad }float inputs:metallic = ${ material.metalness }` );

	}

	return `
    def Material "Material_${ material.id }"
    {
        token outputs:surface.connect = </Materials/Material_${ material.id }/PreviewSurface.outputs:surface>

        def Shader "PreviewSurface"
        {
            uniform token info:id = "UsdPreviewSurface"
${ parameters.join( '\n' ) }
            int inputs:useSpecularWorkflow = 0
            token outputs:surface
        }
    }
`;

}

function buildTextures( textures ) {

	const array = [];

	for ( const uuid in textures ) {

		const texture = textures[ uuid ];

		array.push( buildTexture( texture ) );

	}

	return `def "Textures"
{
${ array.join( '' ) }
}

`;

}

function buildTexture( texture ) {

	return `
    def Shader "Texture_${ texture.id }"
    {
        uniform token info:id = "UsdUVTexture"
        asset inputs:file = @textures/Texture_${ texture.id }.jpg@
        token inputs:wrapS = "repeat"
        token inputs:wrapT = "repeat"
        float outputs:r
        float outputs:g
        float outputs:b
        float3 outputs:rgb
    }
`;

}

function buildColor( color ) {

	return `(${ color.r }, ${ color.g }, ${ color.b })`;

}

export { USDZExporter };
