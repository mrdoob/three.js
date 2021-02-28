import { Color } from '../../math/Color.js';
import { Vector2 } from '../../math/Vector2.js';
import { Path } from './Path.js';
import { Shape } from './Shape.js';
import { ShapeUtils } from '../ShapeUtils.js';
import { Box2 } from '../../../build/three.module.js';

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

	toShapes( fillRule ) {

		const BIGNUMBER = Number.MAX_SAFE_INTEGER;

		const IntersectionLocationType = {
			ORIGIN: 0,
			DESTINATION: 1,
			BETWEEN: 2,
			LEFT: 3,
			RIGHT: 4,
			BEHIND: 5,
			BEYOND: 6
		}

		function findEdgeIntersection(edge1, edge2) {
			var x1 = edge1[0].x;
			var x2 = edge1[1].x;
			var x3 = edge2[0].x;
			var x4 = edge2[1].x;
			var y1 = edge1[0].y;
			var y2 = edge1[1].y;
			var y3 = edge2[0].y;
			var y4 = edge2[1].y;
			var nom1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
			var nom2 = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
			var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
			var t1 = nom1 / denom;
			var t2 = nom2 / denom;
			var interPoints = [];
			//1. lines are parallel or edges don't intersect
			if (((denom === 0) && (nom1 !== 0)) || (t1 <= 0) || (t1 >= 1) || (t2 < 0 ) || (t2 > 1)) {
				return interPoints;
			}
			//2. lines are collinear
			else if ((nom1 === 0) && (denom === 0)) {
				//check if endpoints of edge2 lies on edge1
				for (var i = 0; i < 2; i++) {
					var classify = classifyPoint(edge2[i], edge1);
					//find position of this endpoints relatively to edge1
					if (classify.loc == IntersectionLocationType.ORIGIN || classify.loc == IntersectionLocationType.DESTINATION) {
						interPoints.push({x: edge2[i].x, y: edge2[i].y, t: classify.t});
					}
					else if (classify.loc == IntersectionLocationType.BETWEEN) {
						x = +((x1 + classify.t*(x2 - x1)).toPrecision(10));
						y = +((y1 + classify.t*(y2 - y1)).toPrecision(10));
						interPoints.push({x: x, y: y, t: classify.t});
					}
				}
				return interPoints;
			}
			//3. edges intersect
			else {
				for (var i = 0; i < 2; i++) {
					var classify = classifyPoint(edge2[i], edge1);
					if (classify.loc == IntersectionLocationType.ORIGIN || classify.loc == IntersectionLocationType.DESTINATION) {
						interPoints.push({x: edge2[i].x, y: edge2[i].y, t: classify.t});
					}
				}
				if (interPoints.length > 0) {
					return interPoints;
				}
				var x = +((x1 + t1*(x2 - x1)).toPrecision(10));
				var y = +((y1 + t1*(y2 - y1)).toPrecision(10));
				interPoints.push({x: x, y: y, t: t1});

				return interPoints;
			}
		}
		
		function classifyPoint(p, edge) {
			var ax = edge[1].x - edge[0].x;
			var ay = edge[1].y - edge[0].y;
			var bx = p.x - edge[0].x;
			var by = p.y - edge[0].y;
			var sa = ax * by - bx * ay;
			if ((p.x === edge[0].x) && (p.y === edge[0].y)) {
				return {loc: IntersectionLocationType.ORIGIN, t: 0};
			}
			if ((p.x === edge[1].x) && (p.y === edge[1].y)) {
				return {loc: IntersectionLocationType.DESTINATION, t: 1};
			}
			var theta = (polarAngle([edge[1], edge[0]]) -
			polarAngle([{x: edge[1].x, y: edge[1].y}, {x: p.x, y: p.y}])) % 360;
			if (theta < 0) {
				theta = theta + 360;
			}
			if (sa < -0.0000000001) {
				return {loc: IntersectionLocationType.LEFT, theta: theta};
			}
			if (sa > 0.00000000001) {
				return {loc: IntersectionLocationType.RIGHT, theta: theta};
			}
			if (((ax * bx) < 0) || ((ay * by) < 0)) {
				return {loc: IntersectionLocationType.BEHIND, theta: 0};
			}
			if ((Math.sqrt(ax * ax + ay * ay)) < (Math.sqrt(bx * bx + by * by))) {
				return {loc: IntersectionLocationType.BEYOND, theta: 180};
			}
			var t;
			if (ax !== 0) {
				t = bx/ax;
			} else {
				t = by/ay;
			}
			return {loc: IntersectionLocationType.BETWEEN, t: t};
		}
		
		function polarAngle(edge) {
			var dx = edge[1].x - edge[0].x;
			var dy = edge[1].y - edge[0].y;
			if ((dx === 0) && (dy === 0)) {
			//console.error("Edge has zero length.");
			return false;
			}
			if (dx === 0) {
			return ((dy > 0) ? 90 : 270);
			}
			if (dy === 0) {
			return ((dx > 0) ? 0 : 180);
			}
			var theta = Math.atan(dy/dx)*360/(2*Math.PI);
			if (dx > 0) {
			return ((dy >= 0) ? theta : theta + 360);
			} else {
			return (theta + 180);
			}
		}

		function getIntersections(path1, path2) {
			const intersections = [];

			for (let index = 1; index < path1.length; index++) {
				const path1EdgeStart = path1[index-1];
				const path1EdgeEnd = path1[index];

				for (let index2 = 1; index2 < path2.length; index2++) {
					const path2EdgeStart = path2[index2-1];
					const path2EdgeEnd = path2[index2];
					
					let intersection = findEdgeIntersection([path1EdgeStart, path1EdgeEnd], [path2EdgeStart, path2EdgeEnd]);
					if (intersection.length !== 0) {
						intersections.push(new Vector2(intersection[0].x, intersection[0].y));
					}
				}
			}
			
			return intersections;
		}

		function getScanlineIntersections(scanline, boundingBox, paths) {

			let center = new Vector2();
			boundingBox.getCenter(center);

			let allIntersections = [];

			paths.forEach(path => {
				// check if the center of the bounding box is in the bounding box of the paths.
				// this is a pruning method to limit the search of intersections in paths that can't envelop of the current path.
				// if a path envelops another path. The center of that oter path, has to be inside the bounding box of the enveloping path.
				if (path.boundingBox.containsPoint(center)) {
					let intersections = getIntersections(scanline, path.points);

					intersections.forEach(p => {
						allIntersections.push({ identifier: path.identifier, isCW: path.isCW, point: p });
					})
				}
			});

			allIntersections.sort((i1, i2) => { return i1.point.x - i2.point.x });

			return allIntersections;
		}

		function isHoleTo(simplePath, allPaths, _fillRule) {

			if (_fillRule === null || _fillRule === undefined || _fillRule === '') {
				_fillRule = 'nonzero';
			}

			let centerBoundingBox = new Vector2();
			simplePath.boundingBox.getCenter(centerBoundingBox);

			let scanline = [ new Vector2( -BIGNUMBER, centerBoundingBox.y ), new Vector2( BIGNUMBER, centerBoundingBox.y ) ];

			let scanlineIntersections = getScanlineIntersections( scanline, simplePath.boundingBox, allPaths );

			let baseIntersections = [];
			let otherIntersections = [];

			scanlineIntersections.forEach(i => {
				if (i.identifier === simplePath.identifier) {
					baseIntersections.push(i);
				} else {
					otherIntersections.push(i);
				}
			});
			
			otherIntersections.sort((i1, i2) => { return i1.point.x - i2.point.x });
			baseIntersections.sort((i1, i2) => { return i1.point.x - i2.point.x });
			const firstXOfPath = baseIntersections[0].point.x;

			// build up the path hierarchy
			let stack = [];
			let i = 0;
			while (i < otherIntersections.length && otherIntersections[i].point.x < firstXOfPath) {
				if (stack.length > 0 && stack[stack.length-1] === otherIntersections[i].identifier) {
					stack.pop();
				} else {
					stack.push(otherIntersections[i].identifier);
				}

				i++;
			}

			stack.push(simplePath.identifier);

			if ( _fillRule === 'evenodd' ) {
				let isHole = stack.length % 2 === 0 ? false : true;
				let isHoleFor = stack[stack.length-1];
				
				return { identifier: simplePath.identifier, isHole: isHole, for: isHoleFor };

			} else if ( _fillRule === 'nonzero' ) {

				// check if path is a hole by counting the amount of paths with alternating rotations it has to cross.
				let isHole = true;
				let isHoleFor = null;
				let lastCWValue = null;
				for (let i = 0; i < stack.length; i++) {
					const identifier = stack[i];
					if ( isHole ) {
						lastCWValue = allPaths[identifier].isCW;
						isHole = false;
						isHoleFor = identifier;
					} else if (lastCWValue !== allPaths[identifier].isCW) {
						lastCWValue = allPaths[identifier].isCW;
						isHole = true;
					}
				}
				
				return { identifier: simplePath.identifier, isHole: isHole, for: isHoleFor };

			} else {
				console.warn('fill-rule: "' + _fillRule + '" is currently not implemented.');
			}
		}

		// check for self intersecting paths
		// TODO

		// check intersecting paths
		// TODO

		// prepare paths for hole detection
		let identifier = 0;
		let simplePaths = this.subPaths.map(p => { 
			const points = p.getPoints();
			let maxY = -BIGNUMBER;
			let minY = BIGNUMBER;
			let maxX = -BIGNUMBER;
			let minX = BIGNUMBER;

			points.forEach(p => {
				p.y *= -1;

				if (p.y > maxY) {
					maxY = p.y;
				}
				if (p.y < minY) {
					minY = p.y;
				}
				if (p.x > maxX) {
					maxX = p.x;
				}
				if (p.x < minX) {
					minX = p.x;
				}
			});

			return { points: points, isCW: ShapeUtils.isClockWise(points), identifier: identifier++, boundingBox: new Box2( new Vector2( minX, minY ), new Vector2( maxX, maxY ) ) }; 
		});

		// check if path is solid or a hole
		const isAHole = simplePaths.map(p => isHoleTo(p, simplePaths, fillRule));

		const shapesToReturn = [];
		simplePaths.forEach(p => {
			const amIAHole = isAHole[p.identifier];
			
			if (!amIAHole.isHole) {
				const shape = new Shape(p.points);
				const holes = isAHole.filter(h => h.isHole && h.for === p.identifier);
				holes.forEach(h => {
					const path = simplePaths[h.identifier];
					shape.holes.push(new Path(path.points));
				});
				shapesToReturn.push(shape);
			}
		});

		return shapesToReturn;

	}

}


export { ShapePath };
