import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import { Vector4 } from '../math/Vector4.js';
import { Vector3 } from '../math/Vector3.js';
import { Vector2 } from '../math/Vector2.js';

class CapsuleGeometry extends BufferGeometry {

	constructor( radius = 1, height = 3, radialSegments = 8, bodySegments = 1, capSegments = 4, thetaStart = 0, thetaLength = Math.PI * 2 ) {

		super();
		this.type = 'CapsuleGeometry';

		this.parameters = {
			radius: radius,
			height: height,
			radialSegments: radialSegments,
			bodySegments: bodySegments,
			capSegments: capSegments,
			thetaStart: thetaStart,
			thetaLength: thetaLength
		};

		const isSolid = false;

		height = Math.max( height, 2 * radius );
		bodySegments = Math.max( bodySegments, 1 );
		thetaLength = Math.max( 0, Math.min( 6.283185307179586, thetaLength ) );

		// buffers
		const indices = new Array();
		const vertices = new Array();
		const normals = new Array();
		const uvs = new Array();
		const mirroredCapVertices = new Array();
		const mirroredCapNormals = new Array();
		const mirroredCapUvs = new Array();

		// helper variables
		const PID2 = 1.5707963267948966;
		const phiStart2 = 0;
		const phiLength2 = PID2;
		const bodyHeight = height - 2 * radius;
		const halfBodyHeight = bodyHeight / 2;
		const deltaBodyLen = bodyHeight / bodySegments;
		const deltaTheta = thetaLength / radialSegments;
		const deltaPhi2 = phiLength2 / capSegments;
		const deltaU = 1 / radialSegments;
		const halfCircumference = Math.PI * radius;
		const capDeltaV = ( halfCircumference / 2 / capSegments ) / ( halfCircumference + bodyHeight );
		const bodyDeltaV = ( bodyHeight / bodySegments ) / ( halfCircumference + bodyHeight );

		const vertex = new Vector3();
		const normal = new Vector3();
		const uv = new Vector2();

		// generate geometry


		//Building poles.
		/** Top pole. */
		vertex.set( 0, height / 2, 0 );
		vertices.push( vertex.x, vertex.y, vertex.z );
		normal.copy( vertex ).normalize();
		normals.push( normal.x, normal.y, normal.z );
		uv.set( 0.5, 1 );
		uvs.push( uv.x, uv.y );
		/** Bottom pole */
		vertices.push( vertex.x, - vertex.y, vertex.z );
		normals.push( normal.x, - normal.y, normal.z );
		uv.set( 0.5, 0 );
		uvs.push( uv.x, uv.y );
		const quadFace = new Vector4();
		const poleOffset = 2;
		const mirroredCapIndexOffset = capSegments + bodySegments - 1;
		const pointsPerRadialSeg = 2 * capSegments + bodySegments - 1;
		for ( let i = 0; i <= radialSegments; ++ i ) {

			const theta = thetaStart + i * deltaTheta;
			const sinTheta = Math.sin( theta );
			const cosTheta = Math.cos( theta );
			uv.setX( 1 - i * deltaU );
			//Building caps.
			mirroredCapVertices.length = 0;
			mirroredCapNormals.length = 0;
			mirroredCapUvs.length = 0;
			for ( let j = 0; j < capSegments; ++ j ) {

				const phi = phiStart2 + j * deltaPhi2;
				const sinPhi = Math.sin( phi );
				const cosPhi = Math.cos( phi );
				vertex.x = cosPhi * radius * cosTheta;
				vertex.y = sinPhi * radius + halfBodyHeight;
				vertex.z = cosPhi * radius * sinTheta;
				/** Top cap. */
				vertices.push( vertex.x, vertex.y, vertex.z );
				normal.copy( vertex ).normalize();
				normals.push( normal.x, normal.y, normal.z );
				uv.setY( ( capSegments - j ) * capDeltaV );
				uvs.push( uv.x, 1 - uv.y );
				/** Buffer mirrored cap. */
				mirroredCapVertices.push( vertex.x, - vertex.y, vertex.z );
				mirroredCapNormals.push( normal.x, - normal.y, normal.z );
				mirroredCapUvs.push( uv.x, uv.y );
				//Building indices.
				if ( ! isSolid && 0 === i ) {

					continue;

				}

				const currentIndex = i * pointsPerRadialSeg + j;
				const rightNeighborIndex = 0 === i ?
					radialSegments * pointsPerRadialSeg + j :
					( i - 1 ) * pointsPerRadialSeg + j;
				if ( 0 === j ) {

					//Capping.
					indices.push(
						//Top capping.
						currentIndex + capSegments - 1 + poleOffset, rightNeighborIndex + capSegments - 1 + poleOffset, 0,
						//Bottom capping.
						rightNeighborIndex + mirroredCapIndexOffset + capSegments - 1 + poleOffset, currentIndex + mirroredCapIndexOffset + capSegments - 1 + poleOffset, 1 );

				} else {

					quadFace.set( currentIndex - 1, rightNeighborIndex - 1, rightNeighborIndex, currentIndex );
					quadFace.addScalar( poleOffset );
					/**
					 * Top cap faces.
					 * w __ z
					 * |    |
					 * x __ y
					 */
					indices.push( quadFace.x, quadFace.y, quadFace.w, quadFace.y, quadFace.z, quadFace.w );
					quadFace.addScalar( mirroredCapIndexOffset );
					/**
					 * Bottom cap faces.
					 * x __ y
					 * |    |
					 * w __ z
					 */
					indices.push( quadFace.w, quadFace.z, quadFace.x, quadFace.z, quadFace.y, quadFace.x );

				}

			}

			/** Building body. */
			for ( let j = 0; j < bodySegments; ++ j ) {

				if ( j > 0 ) {

					//Needs segment.
					vertex.set( cosTheta, halfBodyHeight - j * deltaBodyLen, sinTheta );
					vertices.push( vertex.x, vertex.y, vertex.z );
					normal.copy( vertex ).normalize();
					normals.push( normal.x, normal.y, normal.z );
					uv.setY( capSegments * capDeltaV + j * bodyDeltaV );
					uvs.push( uv.x, 1 - uv.y );

				}

				if ( ! isSolid && 0 === i ) {

					continue;

				}

				/**
				 * Body segment faces.
				 * x __ y
				 * |    |
				 * w __ z
				 */
				const baseIndexOffset = 0 === j ? 0 : capSegments - 1 + j;
				const bottomEdgeIndexOffset = 0 === j ? capSegments : 1;
				const currentIndex = i * pointsPerRadialSeg + baseIndexOffset;
				const rightNeighborIndex = 0 === i ?
					radialSegments * pointsPerRadialSeg + baseIndexOffset :
					( i - 1 ) * pointsPerRadialSeg + baseIndexOffset;
				quadFace.set( currentIndex, rightNeighborIndex, rightNeighborIndex + bottomEdgeIndexOffset, currentIndex + bottomEdgeIndexOffset );
				quadFace.addScalar( poleOffset );
				indices.push( quadFace.w, quadFace.z, quadFace.x, quadFace.z, quadFace.y, quadFace.x );

			}

			/** Mirrored Bottom cap. */
			vertices.push( ...mirroredCapVertices );
			normals.push( ...mirroredCapNormals );
			uvs.push( ...mirroredCapUvs );

		}


		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

	}

}


export { CapsuleGeometry, CapsuleGeometry as CapsuleBufferGeometry };
