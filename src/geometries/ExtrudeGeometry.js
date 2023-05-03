/**
 * Creates extruded geometry from a path shape.
 *
 * parameters = {
 *
 *  curveSegments: <int>, // number of points on the curves
 *  steps: <int>, // number of points for z-side extrusions / used for subdividing segments of extrude spline too
 *  depth: <float>, // Depth to extrude the shape
 *
 *  bevelEnabled: <bool>, // turn on bevel
 *  bevelThickness: <float>, // how deep into the original shape bevel goes
 *  bevelSize: <float>, // how far from shape outline (including bevelOffset) is bevel
 *  bevelOffset: <float>, // how far from shape outline does bevel start
 *  bevelSegments: <int>, // number of bevel layers
 *
 *  extrudePath: <THREE.Curve> // curve to extrude shape along
 *
 *  UVGenerator: <Object> // object that provides UV generator functions
 *
 * }
 */

import { BufferGeometry } from '../core/BufferGeometry.js';
import { Float32BufferAttribute } from '../core/BufferAttribute.js';
import * as Curves from '../extras/curves/Curves.js';
import { Vector2 } from '../math/Vector2.js';
import { Vector3 } from '../math/Vector3.js';
import { Shape } from '../extras/core/Shape.js';
import { ShapeUtils } from '../extras/ShapeUtils.js';

class ExtrudeGeometry extends BufferGeometry {

	constructor( shapes = new Shape( [ new Vector2( 0.5, 0.5 ), new Vector2( - 0.5, 0.5 ), new Vector2( - 0.5, - 0.5 ), new Vector2( 0.5, - 0.5 ) ] ), options = {} ) {

		super();

		this.type = 'ExtrudeGeometry';

		this.parameters = {
			shapes: shapes,
			options: options
		};

		shapes = Array.isArray( shapes ) ? shapes : [ shapes ];

		const scope = this;

		const verticesArray = [];
		const uvArray = [];

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];
			addShape( shape );

		}

		// build geometry

		this.setAttribute( 'position', new Float32BufferAttribute( verticesArray, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvArray, 2 ) );

		this.computeVertexNormals();

		// functions

		function addShape( shape ) {

			const placeholder = [];

			// options

			const curveSegments = options.curveSegments !== undefined ? options.curveSegments : 12;
			const steps = options.steps !== undefined ? options.steps : 1;
			const depth = options.depth !== undefined ? options.depth : 1;

			let bevelEnabled = options.bevelEnabled !== undefined ? options.bevelEnabled : true;
			let bevelThickness = options.bevelThickness !== undefined ? options.bevelThickness : 0.2;
			let bevelSize = options.bevelSize !== undefined ? options.bevelSize : bevelThickness - 0.1;
			let bevelOffset = options.bevelOffset !== undefined ? options.bevelOffset : 0;
			let bevelSegments = options.bevelSegments !== undefined ? options.bevelSegments : 3;

			const extrudePath = options.extrudePath;

			const uvgen = options.UVGenerator !== undefined ? options.UVGenerator : WorldUVGenerator;

			//

			let extrudePts, extrudeByPath = false;
			let splineTube, binormal, normal, position2;

			if ( extrudePath ) {

				extrudePts = extrudePath.getSpacedPoints( steps );

				extrudeByPath = true;
				bevelEnabled = false; // bevels not supported for path extrusion

				// SETUP TNB variables

				// TODO1 - have a .isClosed in spline?

				splineTube = extrudePath.computeFrenetFrames( steps, false );

				// console.log(splineTube, 'splineTube', splineTube.normals.length, 'steps', steps, 'extrudePts', extrudePts.length);

				binormal = new Vector3();
				normal = new Vector3();
				position2 = new Vector3();

			}

			// Safeguards if bevels are not enabled

			if ( ! bevelEnabled ) {

				bevelSegments = 0;
				bevelThickness = 0;
				bevelSize = 0;
				bevelOffset = 0;

			}

			// Variables initialization

			const shapePoints = shape.extractPoints( curveSegments );

			let vertices = shapePoints.shape;
			const holes = shapePoints.holes;

			const reverse = ! ShapeUtils.isClockWise( vertices );

			if ( reverse ) {

				vertices = vertices.reverse();

				// Maybe we should also check if holes are in the opposite direction, just to be safe ...

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];

					if ( ShapeUtils.isClockWise( ahole ) ) {

						holes[ h ] = ahole.reverse();

					}

				}

			}


			const faces = ShapeUtils.triangulateShape( vertices, holes );

			/* Vertices */

			const contour = vertices; // vertices has all points but contour has only points of circumference

			for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

				const ahole = holes[ h ];

				vertices = vertices.concat( ahole );

			}


			function scalePt2( pt, vec, size ) {

				if ( ! vec ) console.error( 'THREE.ExtrudeGeometry: vec does not exist' );

				return pt.clone().addScaledVector( vec, size );

			}

			const vlen = vertices.length, flen = faces.length;


			// Find directions for point movement


			function getBevelVec( inPt, inPrev, inNext ) {

				// computes for inPt the corresponding point inPt' on a new contour
				//   shifted by 1 unit (length of normalized vector) to the left
				// if we walk along contour clockwise, this new contour is outside the old one
				//
				// inPt' is the intersection of the two lines parallel to the two
				//  adjacent edges of inPt at a distance of 1 unit on the left side.

				let v_trans_x, v_trans_y, shrink_by; // resulting translation vector for inPt

				// good reading for geometry algorithms (here: line-line intersection)
				// http://geomalgorithms.com/a05-_intersect-1.html

				const v_prev_x = inPt.x - inPrev.x,
					v_prev_y = inPt.y - inPrev.y;
				const v_next_x = inNext.x - inPt.x,
					v_next_y = inNext.y - inPt.y;

				const v_prev_lensq = ( v_prev_x * v_prev_x + v_prev_y * v_prev_y );

				// check for collinear edges
				const collinear0 = ( v_prev_x * v_next_y - v_prev_y * v_next_x );

				if ( Math.abs( collinear0 ) > Number.EPSILON ) {

					// not collinear

					// length of vectors for normalizing

					const v_prev_len = Math.sqrt( v_prev_lensq );
					const v_next_len = Math.sqrt( v_next_x * v_next_x + v_next_y * v_next_y );

					// shift adjacent points by unit vectors to the left

					const ptPrevShift_x = ( inPrev.x - v_prev_y / v_prev_len );
					const ptPrevShift_y = ( inPrev.y + v_prev_x / v_prev_len );

					const ptNextShift_x = ( inNext.x - v_next_y / v_next_len );
					const ptNextShift_y = ( inNext.y + v_next_x / v_next_len );

					// scaling factor for v_prev to intersection point

					const sf = ( ( ptNextShift_x - ptPrevShift_x ) * v_next_y -
							( ptNextShift_y - ptPrevShift_y ) * v_next_x ) /
						( v_prev_x * v_next_y - v_prev_y * v_next_x );

					// vector from inPt to intersection point

					v_trans_x = ( ptPrevShift_x + v_prev_x * sf - inPt.x );
					v_trans_y = ( ptPrevShift_y + v_prev_y * sf - inPt.y );

					// Don't normalize!, otherwise sharp corners become ugly
					//  but prevent crazy spikes
					const v_trans_lensq = ( v_trans_x * v_trans_x + v_trans_y * v_trans_y );
					if ( v_trans_lensq <= 2 ) {

						return new Vector2( v_trans_x, v_trans_y );

					} else {

						shrink_by = Math.sqrt( v_trans_lensq / 2 );

					}

				} else {

					// handle special case of collinear edges

					let direction_eq = false; // assumes: opposite

					if ( v_prev_x > Number.EPSILON ) {

						if ( v_next_x > Number.EPSILON ) {

							direction_eq = true;

						}

					} else {

						if ( v_prev_x < - Number.EPSILON ) {

							if ( v_next_x < - Number.EPSILON ) {

								direction_eq = true;

							}

						} else {

							if ( Math.sign( v_prev_y ) === Math.sign( v_next_y ) ) {

								direction_eq = true;

							}

						}

					}

					if ( direction_eq ) {

						// console.log("Warning: lines are a straight sequence");
						v_trans_x = - v_prev_y;
						v_trans_y = v_prev_x;
						shrink_by = Math.sqrt( v_prev_lensq );

					} else {

						// console.log("Warning: lines are a straight spike");
						v_trans_x = v_prev_x;
						v_trans_y = v_prev_y;
						shrink_by = Math.sqrt( v_prev_lensq / 2 );

					}

				}

				return new Vector2( v_trans_x / shrink_by, v_trans_y / shrink_by );

			}


			const contourMovements = [];

			for ( let i = 0, il = contour.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

				if ( j === il ) j = 0;
				if ( k === il ) k = 0;

				//  (j)---(i)---(k)
				// console.log('i,j,k', i, j , k)

				contourMovements[ i ] = getBevelVec( contour[ i ], contour[ j ], contour[ k ] );

			}

			const holesMovements = [];
			let oneHoleMovements, verticesMovements = contourMovements.concat();

			for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

				const ahole = holes[ h ];

				oneHoleMovements = [];

				for ( let i = 0, il = ahole.length, j = il - 1, k = i + 1; i < il; i ++, j ++, k ++ ) {

					if ( j === il ) j = 0;
					if ( k === il ) k = 0;

					//  (j)---(i)---(k)
					oneHoleMovements[ i ] = getBevelVec( ahole[ i ], ahole[ j ], ahole[ k ] );

				}

				holesMovements.push( oneHoleMovements );
				verticesMovements = verticesMovements.concat( oneHoleMovements );

			}


			// Loop bevelSegments, 1 for the front, 1 for the back

			for ( let b = 0; b < bevelSegments; b ++ ) {

				//for ( b = bevelSegments; b > 0; b -- ) {

				const t = b / bevelSegments;
				const z = bevelThickness * Math.cos( t * Math.PI / 2 );
				const bs = bevelSize * Math.sin( t * Math.PI / 2 ) + bevelOffset;

				// contract shape

				for ( let i = 0, il = contour.length; i < il; i ++ ) {

					const vert = scalePt2( contour[ i ], contourMovements[ i ], bs );

					v( vert.x, vert.y, - z );

				}

				// expand holes

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];
					oneHoleMovements = holesMovements[ h ];

					for ( let i = 0, il = ahole.length; i < il; i ++ ) {

						const vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

						v( vert.x, vert.y, - z );

					}

				}

			}

			const bs = bevelSize + bevelOffset;

			// Back facing vertices

			for ( let i = 0; i < vlen; i ++ ) {

				const vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

				if ( ! extrudeByPath ) {

					v( vert.x, vert.y, 0 );

				} else {

					// v( vert.x, vert.y + extrudePts[ 0 ].y, extrudePts[ 0 ].x );

					normal.copy( splineTube.normals[ 0 ] ).multiplyScalar( vert.x );
					binormal.copy( splineTube.binormals[ 0 ] ).multiplyScalar( vert.y );

					position2.copy( extrudePts[ 0 ] ).add( normal ).add( binormal );

					v( position2.x, position2.y, position2.z );

				}

			}

			// Add stepped vertices...
			// Including front facing vertices

			for ( let s = 1; s <= steps; s ++ ) {

				for ( let i = 0; i < vlen; i ++ ) {

					const vert = bevelEnabled ? scalePt2( vertices[ i ], verticesMovements[ i ], bs ) : vertices[ i ];

					if ( ! extrudeByPath ) {

						v( vert.x, vert.y, depth / steps * s );

					} else {

						// v( vert.x, vert.y + extrudePts[ s - 1 ].y, extrudePts[ s - 1 ].x );

						normal.copy( splineTube.normals[ s ] ).multiplyScalar( vert.x );
						binormal.copy( splineTube.binormals[ s ] ).multiplyScalar( vert.y );

						position2.copy( extrudePts[ s ] ).add( normal ).add( binormal );

						v( position2.x, position2.y, position2.z );

					}

				}

			}


			// Add bevel segments planes

			//for ( b = 1; b <= bevelSegments; b ++ ) {
			for ( let b = bevelSegments - 1; b >= 0; b -- ) {

				const t = b / bevelSegments;
				const z = bevelThickness * Math.cos( t * Math.PI / 2 );
				const bs = bevelSize * Math.sin( t * Math.PI / 2 ) + bevelOffset;

				// contract shape

				for ( let i = 0, il = contour.length; i < il; i ++ ) {

					const vert = scalePt2( contour[ i ], contourMovements[ i ], bs );
					v( vert.x, vert.y, depth + z );

				}

				// expand holes

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];
					oneHoleMovements = holesMovements[ h ];

					for ( let i = 0, il = ahole.length; i < il; i ++ ) {

						const vert = scalePt2( ahole[ i ], oneHoleMovements[ i ], bs );

						if ( ! extrudeByPath ) {

							v( vert.x, vert.y, depth + z );

						} else {

							v( vert.x, vert.y + extrudePts[ steps - 1 ].y, extrudePts[ steps - 1 ].x + z );

						}

					}

				}

			}

			/* Faces */

			// Top and bottom faces

			buildLidFaces();

			// Sides faces

			buildSideFaces();


			/////  Internal functions

			function buildLidFaces() {

				const start = verticesArray.length / 3;

				if ( bevelEnabled ) {

					let layer = 0; // steps + 1
					let offset = vlen * layer;

					// Bottom faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 2 ] + offset, face[ 1 ] + offset, face[ 0 ] + offset );

					}

					layer = steps + bevelSegments * 2;
					offset = vlen * layer;

					// Top faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 0 ] + offset, face[ 1 ] + offset, face[ 2 ] + offset );

					}

				} else {

					// Bottom faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 2 ], face[ 1 ], face[ 0 ] );

					}

					// Top faces

					for ( let i = 0; i < flen; i ++ ) {

						const face = faces[ i ];
						f3( face[ 0 ] + vlen * steps, face[ 1 ] + vlen * steps, face[ 2 ] + vlen * steps );

					}

				}

				scope.addGroup( start, verticesArray.length / 3 - start, 0 );

			}

			// Create faces for the z-sides of the shape

			function buildSideFaces() {

				const start = verticesArray.length / 3;
				let layeroffset = 0;
				sidewalls( contour, layeroffset );
				layeroffset += contour.length;

				for ( let h = 0, hl = holes.length; h < hl; h ++ ) {

					const ahole = holes[ h ];
					sidewalls( ahole, layeroffset );

					//, true
					layeroffset += ahole.length;

				}


				scope.addGroup( start, verticesArray.length / 3 - start, 1 );


			}

			function sidewalls( contour, layeroffset ) {

				let i = contour.length;

				while ( -- i >= 0 ) {

					const j = i;
					let k = i - 1;
					if ( k < 0 ) k = contour.length - 1;

					//console.log('b', i,j, i-1, k,vertices.length);

					for ( let s = 0, sl = ( steps + bevelSegments * 2 ); s < sl; s ++ ) {

						const slen1 = vlen * s;
						const slen2 = vlen * ( s + 1 );

						const a = layeroffset + j + slen1,
							b = layeroffset + k + slen1,
							c = layeroffset + k + slen2,
							d = layeroffset + j + slen2;

						f4( a, b, c, d );

					}

				}

			}

			function v( x, y, z ) {

				placeholder.push( x );
				placeholder.push( y );
				placeholder.push( z );

			}


			function f3( a, b, c ) {

				addVertex( a );
				addVertex( b );
				addVertex( c );

				const nextIndex = verticesArray.length / 3;
				const uvs = uvgen.generateTopUV( scope, verticesArray, nextIndex - 3, nextIndex - 2, nextIndex - 1 );

				addUV( uvs[ 0 ] );
				addUV( uvs[ 1 ] );
				addUV( uvs[ 2 ] );

			}

			function f4( a, b, c, d ) {

				addVertex( a );
				addVertex( b );
				addVertex( d );

				addVertex( b );
				addVertex( c );
				addVertex( d );


				const nextIndex = verticesArray.length / 3;
				const uvs = uvgen.generateSideWallUV( scope, verticesArray, nextIndex - 6, nextIndex - 3, nextIndex - 2, nextIndex - 1 );

				addUV( uvs[ 0 ] );
				addUV( uvs[ 1 ] );
				addUV( uvs[ 3 ] );

				addUV( uvs[ 1 ] );
				addUV( uvs[ 2 ] );
				addUV( uvs[ 3 ] );

			}

			function addVertex( index ) {

				verticesArray.push( placeholder[ index * 3 + 0 ] );
				verticesArray.push( placeholder[ index * 3 + 1 ] );
				verticesArray.push( placeholder[ index * 3 + 2 ] );

			}


			function addUV( vector2 ) {

				uvArray.push( vector2.x );
				uvArray.push( vector2.y );

			}

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	toJSON() {

		const data = super.toJSON();

		const shapes = this.parameters.shapes;
		const options = this.parameters.options;

		return toJSON( shapes, options, data );

	}

	static fromJSON( data, shapes ) {

		const geometryShapes = [];

		for ( let j = 0, jl = data.shapes.length; j < jl; j ++ ) {

			const shape = shapes[ data.shapes[ j ] ];

			geometryShapes.push( shape );

		}

		const extrudePath = data.options.extrudePath;

		if ( extrudePath !== undefined ) {

			data.options.extrudePath = new Curves[ extrudePath.type ]().fromJSON( extrudePath );

		}

		return new ExtrudeGeometry( geometryShapes, data.options );

	}

}

const WorldUVGenerator = {

	generateTopUV: function ( geometry, vertices, indexA, indexB, indexC ) {

		const a_x = vertices[ indexA * 3 ];
		const a_y = vertices[ indexA * 3 + 1 ];
		const b_x = vertices[ indexB * 3 ];
		const b_y = vertices[ indexB * 3 + 1 ];
		const c_x = vertices[ indexC * 3 ];
		const c_y = vertices[ indexC * 3 + 1 ];

		return [
			new Vector2( a_x, a_y ),
			new Vector2( b_x, b_y ),
			new Vector2( c_x, c_y )
		];

	},

	generateSideWallUV: function ( geometry, vertices, indexA, indexB, indexC, indexD ) {

		const a_x = vertices[ indexA * 3 ];
		const a_y = vertices[ indexA * 3 + 1 ];
		const a_z = vertices[ indexA * 3 + 2 ];
		const b_x = vertices[ indexB * 3 ];
		const b_y = vertices[ indexB * 3 + 1 ];
		const b_z = vertices[ indexB * 3 + 2 ];
		const c_x = vertices[ indexC * 3 ];
		const c_y = vertices[ indexC * 3 + 1 ];
		const c_z = vertices[ indexC * 3 + 2 ];
		const d_x = vertices[ indexD * 3 ];
		const d_y = vertices[ indexD * 3 + 1 ];
		const d_z = vertices[ indexD * 3 + 2 ];

		if ( Math.abs( a_y - b_y ) < Math.abs( a_x - b_x ) ) {

			return [
				new Vector2( a_x, 1 - a_z ),
				new Vector2( b_x, 1 - b_z ),
				new Vector2( c_x, 1 - c_z ),
				new Vector2( d_x, 1 - d_z )
			];

		} else {

			return [
				new Vector2( a_y, 1 - a_z ),
				new Vector2( b_y, 1 - b_z ),
				new Vector2( c_y, 1 - c_z ),
				new Vector2( d_y, 1 - d_z )
			];

		}

	}

};

function toJSON( shapes, options, data ) {

	data.shapes = [];

	if ( Array.isArray( shapes ) ) {

		for ( let i = 0, l = shapes.length; i < l; i ++ ) {

			const shape = shapes[ i ];

			data.shapes.push( shape.uuid );

		}

	} else {

		data.shapes.push( shapes.uuid );

	}

	data.options = Object.assign( {}, options );

	if ( options.extrudePath !== undefined ) data.options.extrudePath = options.extrudePath.toJSON();

	return data;

}


export { ExtrudeGeometry };
