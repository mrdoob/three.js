import { zipSync, strToU8 } from '../libs/fflate.module.min.js';

class USDZExporter {

	parse( scene ) {

		let output = buildHeader();

		const materials = {};

		scene.traverse( ( object ) => {

			if ( object.isMesh ) {

				materials[ object.material.uuid ] = object.material;
				output += buildXform( object, buildMesh( object.geometry, object.material ) );

			}

		} );

		output += buildMaterials( materials );

		return zipSync( { 'model.usda': strToU8( output ) }, { level: 0 } );

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

	const name = object.name || 'Xform1';
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

	const name = geometry.name || 'Mesh1';
	const attributes = geometry.attributes;
	const count = attributes.position.count;

	return `def Mesh "${ name }"
    {
        int[] faceVertexCounts = [${ buildMeshVertexCount( geometry ) }]
        int[] faceVertexIndices = [${ buildMeshVertexIndices( geometry ) }]
        rel material:binding = </_materials/Material_${ material.id }>
        normal3f[] normals = [${ buildVector3Array( attributes.normal, count )}] (
            interpolation = "faceVarying"
        )
        point3f[] points = [${ buildVector3Array( attributes.position, count )}]
        texCoord2f[] primvars:UVMap = [${ buildVector2Array( attributes.uv, count )}] (
            interpolation = "faceVarying"
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

	return `def "_materials"
{
${ array.join( '' ) }
}

`;

}

function buildMaterial( material ) {

	return `
    def Material "Material_${ material.id }"
    {
        token outputs:surface.connect = </_materials/Material_${ material.id }/previewShader.outputs:surface>

        def Shader "previewShader"
        {
            uniform token info:id = "UsdPreviewSurface"
            color3f inputs:diffuseColor = ${ buildColor( material.color ) }
            float inputs:metallic = ${ material.metalness }
            float inputs:roughness = ${ material.roughness }
            token outputs:surface
        }
    }
`;

}

function buildColor( color ) {

	return `(${ color.r }, ${ color.g }, ${ color.b })`;

}

export { USDZExporter };
