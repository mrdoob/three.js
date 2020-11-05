import {
	BoxBufferGeometry,
	Vector3
} from "../../../build/three.module.js";

const tempNormal = new Vector3();
function applyUv( faceDirVector, normal, uvAxis, projectionAxis, radius, sideLength ) {

	const totArcLength = 2 * Math.PI * radius / 4;

	// length of the planes between the arcs on each axis
	const centerLength = Math.max( sideLength - 2 * radius, 0 );
	const halfArc = Math.PI / 4;

	// Get the vector projected onto the Y plane
	tempNormal.copy( normal );
	tempNormal[ projectionAxis ] = 0;
	tempNormal.normalize();

	// total amount of UV space alloted to a single arc
	const arcUvRatio = 0.5 * totArcLength / ( totArcLength + centerLength );

	// the distance along one arc the point is at
	const arcAngleRatio = 1.0 - ( tempNormal.angleTo( faceDirVector ) / halfArc );

	if ( Math.sign( tempNormal[ uvAxis ] ) === 1 ) {

		return arcAngleRatio * arcUvRatio;

	} else {

		// total amount of UV space alloted to the plane between the arcs
		const lenUv = centerLength / ( totArcLength + centerLength );
		return lenUv + arcUvRatio + arcUvRatio * ( 1.0 - arcAngleRatio );

	}

}

class RoundedBoxBufferGeometry extends BoxBufferGeometry {

	constructor( width = 1, height = 1, depth = 1, segments = 1, radius = 1 ) {

		super( 1, 1, 1, segments, segments, segments );

		const geometry2 = this.toNonIndexed();

		this.index = null;
		this.attributes.position = geometry2.attributes.position;
		this.attributes.normal = geometry2.attributes.normal;
		this.attributes.uv = geometry2.attributes.uv;

		//

		const position = new Vector3();
		const normal = new Vector3();

		const box = new Vector3( width, height, depth ).divideScalar( 2 ).subScalar( radius );

		const positions = this.attributes.position.array;
		const normals = this.attributes.normal.array;
		const uvs = this.attributes.uv.array;

		const faceTris = positions.length / 6;
		const faceDirVector = new Vector3();

		for ( let i = 0, j = 0; i < positions.length; i += 3, j += 2 ) {

			position.fromArray( positions, i );
			normal.copy( position ).normalize();

			positions[ i + 0 ] = box.x * Math.sign( position.x ) + normal.x * radius;
			positions[ i + 1 ] = box.y * Math.sign( position.y ) + normal.y * radius;
			positions[ i + 2 ] = box.z * Math.sign( position.z ) + normal.z * radius;

			normals[ i + 0 ] = normal.x;
			normals[ i + 1 ] = normal.y;
			normals[ i + 2 ] = normal.z;

			const side = Math.floor( i / faceTris );

			switch ( side ) {

				case 0: // right

					// generate UVs along Z then Y
					faceDirVector.set( 1, 0, 0 );
					uvs[ j + 0 ] = applyUv( faceDirVector, normal, 'z', 'y', radius, depth );
					uvs[ j + 1 ] = 1.0 - applyUv( faceDirVector, normal, 'y', 'z', radius, height );
					break;


				// case 1: // left
				// 	uvs[ j + 0 ] = 0.5 + ( positions[ i + 2 ] / ( depth - radius ) );
				// 	uvs[ j + 1 ] = 0.5 + ( positions[ i + 1 ] / ( height - radius ) );
				// 	break;
				// case 2: // top
				// 	uvs[ j + 0 ] = 0.5 + ( positions[ i + 0 ] / ( width - radius ) );
				// 	uvs[ j + 1 ] = 0.5 - ( positions[ i + 2 ] / ( depth - radius ) );
				// 	break;
				// case 3: // bottom
				// 	uvs[ j + 0 ] = 0.5 + ( positions[ i + 0 ] / ( width - radius ) );
				// 	uvs[ j + 1 ] = 0.5 + ( positions[ i + 2 ] / ( depth - radius ) );
				// 	break;
				// case 4: // front
				// 	uvs[ j + 0 ] = 0.5 + ( positions[ i + 0 ] / ( width - radius ) );
				// 	uvs[ j + 1 ] = 0.5 + ( positions[ i + 1 ] / ( height - radius ) );
				// 	break;
				// case 5: // back
				// 	uvs[ j + 0 ] = 0.5 - ( positions[ i + 0 ] / ( width - radius ) );
				// 	uvs[ j + 1 ] = 0.5 + ( positions[ i + 1 ] / ( height - radius ) );
				// 	break;

			}

		}

	}

}

export { RoundedBoxBufferGeometry };
