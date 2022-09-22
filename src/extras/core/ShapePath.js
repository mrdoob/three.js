import { Box2 } from '../../math/Box2.js';
import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Path } from './Path.js';
import { Shape } from './Shape.js';
import { ShapeUtils } from '../ShapeUtils.js';

class ShapePath {

	constructor() {

		this.type = 'ShapePath';

		this.color = new Color();

		this.subPaths = [];
		this.currentPath = null;

	}

	moveTo( x, y ) {

		this.currentPath = new Path();
		this.subPaths.push( this.currentPath );
		this.currentPath.moveTo( x, y );

		return this;

	}

	lineTo( x, y ) {

		this.currentPath.lineTo( x, y );

		return this;

	}

	quadraticCurveTo( aCPx, aCPy, aX, aY ) {

		this.currentPath.quadraticCurveTo( aCPx, aCPy, aX, aY );

		return this;

	}

	bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY ) {

		this.currentPath.bezierCurveTo( aCP1x, aCP1y, aCP2x, aCP2y, aX, aY );

		return this;

	}

	splineThru( pts ) {

		this.currentPath.splineThru( pts );

		return this;

	}

	toShapes() {

		// Param shapePath: a shapepath as returned by the parse function of this class
		// Returns Shape object

		const BIGNUMBER = 999999999;

		const IntersectionLocationType = {
			ORIGIN: 0,
			DESTINATION: 1,
			BETWEEN: 2,
			LEFT: 3,
			RIGHT: 4,
			BEHIND: 5,
			BEYOND: 6
		};

		const classifyResult = {
			loc: IntersectionLocationType.ORIGIN,
			t: 0
		};

		function findEdgeIntersection( a0, a1, b0, b1 ) {

			const x1 = a0.x;
			const x2 = a1.x;
			const x3 = b0.x;
			const x4 = b1.x;
			const y1 = a0.y;
			const y2 = a1.y;
			const y3 = b0.y;
			const y4 = b1.y;
			const nom1 = ( x4 - x3 ) * ( y1 - y3 ) - ( y4 - y3 ) * ( x1 - x3 );
			const nom2 = ( x2 - x1 ) * ( y1 - y3 ) - ( y2 - y1 ) * ( x1 - x3 );
			const denom = ( y4 - y3 ) * ( x2 - x1 ) - ( x4 - x3 ) * ( y2 - y1 );
			const t1 = nom1 / denom;
			const t2 = nom2 / denom;

			if ( ( ( denom === 0 ) && ( nom1 !== 0 ) ) || ( t1 <= 0 ) || ( t1 >= 1 ) || ( t2 < 0 ) || ( t2 > 1 ) ) {

				//1. lines are parallel or edges don't intersect

				return null;

			} else if ( ( nom1 === 0 ) && ( denom === 0 ) ) {

				//2. lines are colinear

				//check if endpoints of edge2 (b0-b1) lies on edge1 (a0-a1)
				for ( let i = 0; i < 2; i ++ ) {

					classifyPoint( i === 0 ? b0 : b1, a0, a1 );
					//find position of this endpoints relatively to edge1
					if ( classifyResult.loc == IntersectionLocationType.ORIGIN ) {

						const point = ( i === 0 ? b0 : b1 );
						return { x: point.x, y: point.y, t: classifyResult.t };

					} else if ( classifyResult.loc == IntersectionLocationType.BETWEEN ) {

						const x = + ( ( x1 + classifyResult.t * ( x2 - x1 ) ).toPrecision( 10 ) );
						const y = + ( ( y1 + classifyResult.t * ( y2 - y1 ) ).toPrecision( 10 ) );
						return { x: x, y: y, t: classifyResult.t, };

					}

				}

				return null;

			} else {

				//3. edges intersect

				for ( let i = 0; i < 2; i ++ ) {

					classifyPoint( i === 0 ? b0 : b1, a0, a1 );

					if ( classifyResult.loc == IntersectionLocationType.ORIGIN ) {

						const point = ( i === 0 ? b0 : b1 );
						return { x: point.x, y: point.y, t: classifyResult.t };

					}

				}

				const x = + ( ( x1 + t1 * ( x2 - x1 ) ).toPrecision( 10 ) );
				const y = + ( ( y1 + t1 * ( y2 - y1 ) ).toPrecision( 10 ) );
				return { x: x, y: y, t: t1 };

			}

		}

		function classifyPoint( p, edgeStart, edgeEnd ) {

			const ax = edgeEnd.x - edgeStart.x;
			const ay = edgeEnd.y - edgeStart.y;
			const bx = p.x - edgeStart.x;
			const by = p.y - edgeStart.y;
			const sa = ax * by - bx * ay;

			if ( ( p.x === edgeStart.x ) && ( p.y === edgeStart.y ) ) {

				classifyResult.loc = IntersectionLocationType.ORIGIN;
				classifyResult.t = 0;
				return;

			}

			if ( ( p.x === edgeEnd.x ) && ( p.y === edgeEnd.y ) ) {

				classifyResult.loc = IntersectionLocationType.DESTINATION;
				classifyResult.t = 1;
				return;

			}

			if ( sa < - Number.EPSILON ) {

				classifyResult.loc = IntersectionLocationType.LEFT;
				return;

			}

			if ( sa > Number.EPSILON ) {

				classifyResult.loc = IntersectionLocationType.RIGHT;
				return;


			}

			if ( ( ( ax * bx ) < 0 ) || ( ( ay * by ) < 0 ) ) {

				classifyResult.loc = IntersectionLocationType.BEHIND;
				return;

			}

			if ( ( Math.sqrt( ax * ax + ay * ay ) ) < ( Math.sqrt( bx * bx + by * by ) ) ) {

				classifyResult.loc = IntersectionLocationType.BEYOND;
				return;

			}

			let t;

			if ( ax !== 0 ) {

				t = bx / ax;

			} else {

				t = by / ay;

			}

			classifyResult.loc = IntersectionLocationType.BETWEEN;
			classifyResult.t = t;

		}

		function getIntersections( path1, path2 ) {

			const intersectionsRaw = [];
			const intersections = [];

			for ( let index = 1; index < path1.length; index ++ ) {

				const path1EdgeStart = path1[ index - 1 ];
				const path1EdgeEnd = path1[ index ];

				for ( let index2 = 1; index2 < path2.length; index2 ++ ) {

					const path2EdgeStart = path2[ index2 - 1 ];
					const path2EdgeEnd = path2[ index2 ];

					const intersection = findEdgeIntersection( path1EdgeStart, path1EdgeEnd, path2EdgeStart, path2EdgeEnd );

					if ( intersection !== null && intersectionsRaw.find( i => i.t <= intersection.t + Number.EPSILON && i.t >= intersection.t - Number.EPSILON ) === undefined ) {

						intersectionsRaw.push( intersection );
						intersections.push( new Vector2( intersection.x, intersection.y ) );

					}

				}

			}

			return intersections;

		}

		function getScanlineIntersections( scanline, boundingBox, paths ) {

			const center = new Vector2();
			boundingBox.getCenter( center );

			const allIntersections = [];

			paths.forEach( path => {

				// check if the center of the bounding box is in the bounding box of the paths.
				// this is a pruning method to limit the search of intersections in paths that can't envelop of the current path.
				// if a path envelops another path. The center of that oter path, has to be inside the bounding box of the enveloping path.
				if ( path.boundingBox.containsPoint( center ) ) {

					const intersections = getIntersections( scanline, path.points );

					intersections.forEach( p => {

						allIntersections.push( { identifier: path.identifier, isCW: path.isCW, point: p } );

					} );

				}

			} );

			allIntersections.sort( ( i1, i2 ) => {

				return i1.point.x - i2.point.x;

			} );

			return allIntersections;

		}

		function isHoleTo( simplePath, allPaths, scanlineMinX, scanlineMaxX, _fillRule ) {

			if ( _fillRule === null || _fillRule === undefined || _fillRule === '' ) {

				_fillRule = 'nonzero';

			}

			const centerBoundingBox = new Vector2();
			simplePath.boundingBox.getCenter( centerBoundingBox );

			const scanline = [ new Vector2( scanlineMinX, centerBoundingBox.y ), new Vector2( scanlineMaxX, centerBoundingBox.y ) ];

			const scanlineIntersections = getScanlineIntersections( scanline, simplePath.boundingBox, allPaths );

			scanlineIntersections.sort( ( i1, i2 ) => {

				return i1.point.x - i2.point.x;

			} );

			const baseIntersections = [];
			const otherIntersections = [];

			scanlineIntersections.forEach( i => {

				if ( i.identifier === simplePath.identifier ) {

					baseIntersections.push( i );

				} else {

					otherIntersections.push( i );

				}

			} );

			const firstXOfPath = baseIntersections[ 0 ].point.x;

			// build up the path hierarchy
			const stack = [];
			let i = 0;

			while ( i < otherIntersections.length && otherIntersections[ i ].point.x < firstXOfPath ) {

				if ( stack.length > 0 && stack[ stack.length - 1 ] === otherIntersections[ i ].identifier ) {

					stack.pop();

				} else {

					stack.push( otherIntersections[ i ].identifier );

				}

				i ++;

			}

			stack.push( simplePath.identifier );

			if ( _fillRule === 'evenodd' ) {

				const isHole = stack.length % 2 === 0 ? true : false;
				const isHoleFor = stack[ stack.length - 2 ];

				return { identifier: simplePath.identifier, isHole: isHole, for: isHoleFor };

			} else if ( _fillRule === 'nonzero' ) {

				// check if path is a hole by counting the amount of paths with alternating rotations it has to cross.
				let isHole = true;
				let isHoleFor = null;
				let lastCWValue = null;

				for ( let i = 0; i < stack.length; i ++ ) {

					const identifier = stack[ i ];
					if ( isHole ) {

						lastCWValue = allPaths[ identifier ].isCW;
						isHole = false;
						isHoleFor = identifier;

					} else if ( lastCWValue !== allPaths[ identifier ].isCW ) {

						lastCWValue = allPaths[ identifier ].isCW;
						isHole = true;

					}

				}

				return { identifier: simplePath.identifier, isHole: isHole, for: isHoleFor };

			} else {

				console.warn( 'fill-rule: "' + _fillRule + '" is currently not implemented.' );

			}

		}

		// check for self intersecting paths
		// TODO

		// check intersecting paths
		// TODO

		// prepare paths for hole detection
		let identifier = 0;

		let scanlineMinX = BIGNUMBER;
		let scanlineMaxX = - BIGNUMBER;

		let simplePaths = this.subPaths.map( p => {

			const points = p.getPoints();
			let maxY = - BIGNUMBER;
			let minY = BIGNUMBER;
			let maxX = - BIGNUMBER;
			let minX = BIGNUMBER;

	      	//points.forEach(p => p.y *= -1);

			for ( let i = 0; i < points.length; i ++ ) {

				const p = points[ i ];

				if ( p.y > maxY ) {

					maxY = p.y;

				}

				if ( p.y < minY ) {

					minY = p.y;

				}

				if ( p.x > maxX ) {

					maxX = p.x;

				}

				if ( p.x < minX ) {

					minX = p.x;

				}

			}

			//
			if ( scanlineMaxX <= maxX ) {

				scanlineMaxX = maxX + 1;

			}

			if ( scanlineMinX >= minX ) {

				scanlineMinX = minX - 1;

			}

			return { curves: p.curves, points: points, isCW: ShapeUtils.isClockWise( points ), identifier: identifier ++, boundingBox: new Box2( new Vector2( minX, minY ), new Vector2( maxX, maxY ) ) };

		} );

		simplePaths = simplePaths.filter( sp => sp.points.length > 1 );

		// check if path is solid or a hole
		const isAHole = simplePaths.map( p => isHoleTo( p, simplePaths, scanlineMinX, scanlineMaxX, this.userData?.style.fillRule ) );

		const shapesToReturn = [];
		simplePaths.forEach( p => {

			const amIAHole = isAHole[ p.identifier ];

			if ( ! amIAHole.isHole ) {

				const shape = new Shape();
				shape.curves = p.curves;
				const holes = isAHole.filter( h => h.isHole && h.for === p.identifier );
				holes.forEach( h => {

					const hole = simplePaths[ h.identifier ];
					const path = new Path();
					path.curves = hole.curves;
					shape.holes.push( path );

				} );
				shapesToReturn.push( shape );

			}

		} );

		return shapesToReturn;

	}

}


export { ShapePath };
