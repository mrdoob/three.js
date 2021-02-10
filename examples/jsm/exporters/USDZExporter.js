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

		const files = {};

		for ( const uuid in textures ) {

			const texture = textures[ uuid ];
			files[ 'Texture_' + texture.id + '.jpg' ] = await img2U8( texture.image );

		}

		return zipSync( { 'model.usda': strToU8( output ), 'textures': files }, { level: 0 } );

	}

}

async function img2U8( image ) {

	if ( ( typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement ) ||
		( typeof HTMLCanvasElement !== 'undefined' && image instanceof HTMLCanvasElement ) ||
		( typeof OffscreenCanvas !== 'undefined' && image instanceof OffscreenCanvas ) ||
		( typeof ImageBitmap !== 'undefined' && image instanceof ImageBitmap ) ) {

		const canvas = document.createElement( 'canvas' );
		canvas.width = image.width;
		canvas.height = image.height;

		const context = canvas.getContext( '2d' );
		context.translate( 0, canvas.height );
		context.scale( 1, - 1 );
		context.drawImage( image, 0, 0, canvas.width, canvas.height );

		const blob = await new Promise( resolve => canvas.toBlob( resolve, 'image/jpeg' ) );
		return new Uint8Array( await blob.arrayBuffer() );

	}

}

//

function buildHeader() {

	return `#usda 1.0
(
    doc = "Three.js"
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
            elementSize = 1
            interpolation = "vertex"
        )
        int[] primvars:st:indices
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

		array.push( `(${ data[ i + 0 ] }, ${ data[ i + 1 ] }, ${ data[ i + 2 ] })` );

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

		array.push( `(${ data[ i + 0 ] }, ${ data[ i + 1 ] })` );

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

	const textures = [];

	if ( material.map !== null ) {

		textures.push( `            float3 inputs:diffuseColor.connect = </Textures/Texture_${ material.map.id }.outputs:rgb>` );

	}

	if ( material.normalMap !== null ) {

		textures.push( `            float3 inputs:normal.connect = </Textures/Texture_${ material.normalMap.id }.outputs:rgb>` );

	}

	if ( material.aoMap !== null ) {

		textures.push( `            float inputs:occlusion.connect = </Textures/Texture_${ material.aoMap.id }.outputs:rgb>` );

	}

	if ( material.roughnessMap !== null ) {

		textures.push( `            float inputs:roughness.connect = </Textures/Texture_${ material.roughnessMap.id }.outputs:rgb>` );

	}

	if ( material.metalnessMap !== null ) {

		textures.push( `            float inputs:metalness.connect = </Textures/Texture_${ material.metalnessMap.id }.outputs:rgb>` );

	}

	if ( material.emissiveMap !== null ) {

		textures.push( `            float3 inputs:emissive.connect = </Textures/Texture_${ material.emissiveMap.id }.outputs:rgb>` );

	}


	return `
    def Material "Material_${ material.id }"
    {
        token outputs:surface.connect = </Materials/Material_${ material.id }/PreviewSurface.outputs:surface>

        def Shader "PreviewSurface"
        {
            uniform token info:id = "UsdPreviewSurface"
            float3 inputs:diffuseColor = ${ buildColor( material.color ) }
            float inputs:metallic = ${ material.metalness }
            float inputs:roughness = ${ material.roughness }
${ textures.join( '\n' ) }
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
        token inputs:isSRGB = "auto"
        token inputs:wrapS = "repeat"
        token inputs:wrapT = "repeat"
        float3 outputs:rgb
    }
`;

}

function buildColor( color ) {

	return `(${ color.r }, ${ color.g }, ${ color.b })`;

}

export { USDZExporter };
