import { BufferAttribute, BufferGeometry, Vector3 } from "../../../build/three.module.js";
import { BufferGeometryUtils } from "../utils/BufferGeometryUtils.js";


export function EdgeSplitModifier() {

	const A = new Vector3();
	const B = new Vector3();
	const C = new Vector3();

	let positions, normals;
	let indexes;
	let pointToIndexMap, splitIndexes;


	function computeNormals() {

		normals = new Float32Array( indexes.length * 3 );

		for ( let i = 0; i < indexes.length; i += 3 ) {

			let index = indexes[ i ];
			A.set(
				positions[ 3 * index ],
				positions[ 3 * index + 1 ],
				positions[ 3 * index + 2 ] );

			index = indexes[ i + 1 ];
			B.set(
				positions[ 3 * index ],
				positions[ 3 * index + 1 ],
				positions[ 3 * index + 2 ] );

			index = indexes[ i + 2 ];
			C.set(
				positions[ 3 * index ],
				positions[ 3 * index + 1 ],
				positions[ 3 * index + 2 ] );

			C.sub( B );
			A.sub( B );

			const normal = C.cross( A ).normalize();

			for ( let j = 0; j < 3; j ++ ) {

				normals[ 3 * ( i + j ) ] = normal.x;
				normals[ 3 * ( i + j ) + 1 ] = normal.y;
				normals[ 3 * ( i + j ) + 2 ] = normal.z;

			}

		}

	}


	function mapPositionsToIndexes() {

		pointToIndexMap = Array( positions.length / 3 );

		for ( let i = 0; i < indexes.length; i ++ ) {

			const index = indexes[ i ];

			if ( pointToIndexMap[ index ] == null )
				pointToIndexMap[ index ] = [];

			pointToIndexMap[ index ].push( i );

		}

	}


	function edgeSplitToGroups( indexes, cutOff, firstIndex ) {

		A.set( normals[ 3 * firstIndex ], normals[ 3 * firstIndex + 1 ], normals[ 3 * firstIndex + 2 ] )
			.normalize();

		const result = {
			splitGroup: [],
			currentGroup: [ firstIndex ]
		};

		for ( const j of indexes ) {

			if ( j !== firstIndex ) {

				B.set( normals[ 3 * j ], normals[ 3 * j + 1 ], normals[ 3 * j + 2 ] )
					.normalize();

				if ( B.dot( A ) < cutOff )
					result.splitGroup.push( j );

				else
					result.currentGroup.push( j );

			}

		}

		return result;

	}


	function edgeSplit( indexes, cutOff, original = null ) {

		if ( indexes.length === 0 )
			return;

		const groupResults = [];
		for ( const index of indexes )
			groupResults.push( edgeSplitToGroups( indexes, cutOff, index ) );

		let result = groupResults[ 0 ];
		for ( const groupResult of groupResults )
			if ( groupResult.currentGroup.length > result.currentGroup.length )
				result = groupResult;

		if ( original != null )
			splitIndexes.push( {
				original: original,
				indexes: result.currentGroup
			} );

		if ( result.splitGroup.length )
			edgeSplit( result.splitGroup, cutOff, original || result.currentGroup[ 0 ] );

	}


	this.modify = function ( geometry, cutOffAngle ) {

		if ( ! geometry.isBufferGeometry ) {

			geometry = new BufferGeometry().fromGeometry( geometry );

		}


		if ( geometry.index == null )
			geometry = BufferGeometryUtils.mergeVertices( geometry );


		indexes = geometry.index.array;
		positions = geometry.getAttribute( "position" ).array;

		computeNormals();


		mapPositionsToIndexes();


		splitIndexes = [];

		for ( const vertexIndexes of pointToIndexMap )
			edgeSplit( vertexIndexes, Math.cos( cutOffAngle ) - 0.001 );


		const newPositions = new Float32Array( positions.length + 3 * splitIndexes.length );
		newPositions.set( positions );
		const offset = positions.length;

		const newIndexes = new Uint32Array( indexes.length );
		newIndexes.set( indexes );

		for ( let i = 0; i < splitIndexes.length; i ++ ) {

			const split = splitIndexes[ i ];
			const index = indexes[ split.original ];

			newPositions[ offset + 3 * i ] = positions[ 3 * index ];
			newPositions[ offset + 3 * i + 1 ] = positions[ 3 * index + 1 ];
			newPositions[ offset + 3 * i + 2 ] = positions[ 3 * index + 2 ];

			for ( const j of split.indexes )
				newIndexes[ j ] = offset / 3 + i;

		}

		geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( newPositions, 3, true ) );
		geometry.setIndex( new BufferAttribute( newIndexes, 1 ) );

		return geometry;

	};

}
