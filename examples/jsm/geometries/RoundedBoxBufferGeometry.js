import {
	BoxBufferGeometry,
	Vector3
} from "../../../build/three.module.js";

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
		const arcLength = 2 * Math.PI * radius / 4;
		const widthLength = Math.max( width - 2 * radius, 0 );
		const heightLength = Math.max( height - 2 * radius, 0 );
		const depthLength = Math.max( depth - 2 * radius, 0 );

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

					const tempNormal = new Vector3();
					const rightVector = new Vector3( 1, 0, 0 );
					const totArcLength = 2 * Math.PI * radius / 4;

					// length of the planes between the arcs on each axis
					const heightLength = Math.max( height - 2 * radius, 0 );
					const depthLength = Math.max( depth - 2 * radius, 0 );
					const halfArc = Math.PI / 4;

					// Get the vector projected onto the Y plane
					tempNormal.copy( normal );
					tempNormal.y = 0;
					tempNormal.normalize();

					// total amount of UV space alloted to a single arc
					const arcUvRatioZ = 0.5 * totArcLength / ( totArcLength + depthLength );

					// the distance along one arc the point is at
					const arcAngleRatioZ = 1.0 - ( tempNormal.angleTo( rightVector ) / halfArc );

					if ( Math.sign( tempNormal.z ) === 1 ) {

						uvs[ j + 0 ] = arcAngleRatioZ * arcUvRatioZ;

					} else {

						// total amount of UV space alloted to the plane between the arcs
						const lenUv = depthLength / ( totArcLength + depthLength );
						uvs[ j + 0 ] = lenUv + arcUvRatioZ + arcUvRatioZ * ( 1.0 - arcAngleRatioZ );

					}

					tempNormal.copy( normal );
					tempNormal.z = 0;
					tempNormal.normalize();

					const arcUvRatioY = 0.5 * totArcLength / ( totArcLength + heightLength );
					const arcAngleRatioY = 1.0 - ( tempNormal.angleTo( rightVector ) / halfArc );

					if ( Math.sign( tempNormal.y ) === - 1 ) {

						uvs[ j + 1 ] = arcAngleRatioY * arcUvRatioY;

					} else {

						const lenUv = heightLength / ( totArcLength + heightLength );
						uvs[ j + 1 ] = lenUv + arcUvRatioY + arcUvRatioY * ( 1.0 - arcAngleRatioY );

					}

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
