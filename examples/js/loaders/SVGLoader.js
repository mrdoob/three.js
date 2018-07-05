/**
 * @author mrdoob / http://mrdoob.com/
 * @author zz85 / http://joshuakoo.com/
 */

THREE.SVGLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.SVGLoader.prototype = {

	constructor: THREE.SVGLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( text ) {

		function parseNode( node, style ) {

			if ( node.nodeType !== 1 ) return;

			var transform = null;
			if ( node.hasAttribute( 'transform' ) ) {

				transform = parseTransformNode( node );

				if ( transform ) {

					if ( transformStack.length > 0 ) {
						multiplyTransforms( transform, transformStack[ transformStack.length - 1 ], tempTransform );
						copyTransform( tempTransform, transform );
					}

					copyTransform( transform, currentTransform );
					transformStack.push( transform );

				}
	
			}

			switch ( node.nodeName ) {

				case 'svg':
					break;

				case 'g':
					style = parseStyle( node, style );
					break;

				case 'path':
					style = parseStyle( node, style );
					if ( node.hasAttribute( 'd' ) && isVisible( style ) ) paths.push( parsePathNode( node, style ) );
					break;

				case 'rect':
					style = parseStyle( node, style );
					if ( isVisible( style ) ) paths.push( parseRectNode( node, style ) );
					break;

				case 'polygon':
					style = parseStyle( node, style );
					if ( isVisible( style ) ) paths.push( parsePolygonNode( node, style ) );
					break;

				case 'polyline':
					style = parseStyle( node, style );
					if ( isVisible( style ) ) paths.push( parsePolylineNode( node, style ) );
					break;

				case 'circle':
					style = parseStyle( node, style );
					if ( isVisible( style ) ) paths.push( parseCircleNode( node, style ) );
					break;

				case 'ellipse':
					style = parseStyle( node, style );
					if ( isVisible( style ) ) paths.push( parseEllipseNode( node, style ) );
					break;

				case 'line':
					style = parseStyle( node, style );
					if ( isVisible( style ) ) paths.push( parseLineNode( node, style ) );
					break;

				default:
					console.log( node );

			}

			var nodes = node.childNodes;

			for ( var i = 0; i < nodes.length; i ++ ) {

				parseNode( nodes[ i ], style );

			}

			if ( transform ) {

				copyTransform( transformStack.pop(), currentTransform );

			}

		}

		function parsePathNode( node, style ) {

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );

			var point = new THREE.Vector2();
			var control = new THREE.Vector2();
			var control2 = new THREE.Vector2();

			var transfPoint = new THREE.Vector2();
			var transfControl = new THREE.Vector2();
			var transfControl2 = new THREE.Vector2();

			var reflected = new THREE.Vector2();
			var firstPoint = new THREE.Vector2();
			var isFirstPoint = true;

			function setFirstPoint() {

				if ( isFirstPoint ) {

					firstPoint.x = point.x;
					firstPoint.y = point.y;
					isFirstPoint = false;

				}

			}

			var d = node.getAttribute( 'd' );

			// console.log( d );

			var commands = d.match( /[a-df-z][^a-df-z]*/ig );

			for ( var i = 0, l = commands.length; i < l; i ++ ) {

				var command = commands[ i ];

				var type = command.charAt( 0 );
				var data = command.substr( 1 ).trim();

				switch ( type ) {

					case 'M':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x = numbers[ j + 0 ];
							point.y = numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							if ( j === 0 ) {
								path.moveTo( transfPoint.x, transfPoint.y );
							}
							else {
								path.lineTo( transfPoint.x, transfPoint.y );
							}
						}
						break;

					case 'H':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.x = numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.lineTo( transfPoint.x, transfPoint.y );
						}
						break;

					case 'V':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.y = numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.lineTo( transfPoint.x, transfPoint.y );
						}
						break;

					case 'L':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x = numbers[ j + 0 ];
							point.y = numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.lineTo( transfPoint.x, transfPoint.y );
						}
						break;

					case 'C':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 6 ) {
							control2.set( numbers[ j + 0 ], numbers[ j + 1 ] );
							control.set( numbers[ j + 2 ], numbers[ j + 3 ] );
							point.set( numbers[ j + 4 ], numbers[ j + 5 ] );
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							transfVec2( control2, currentTransform, transfControl2 );
							setFirstPoint();
							path.bezierCurveTo(
								transfControl2.x,
								transfControl2.y,
								transfControl.x,
								transfControl.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 'S':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							reflected.set(
								getReflection( transfPoint.x, transfControl.x ),
								getReflection( transfPoint.y, transfControl.y )
							);
							control.set( numbers[ j + 0 ], numbers[ j + 1 ] );
							point.set( numbers[ j + 2 ], numbers[ j + 3 ] );
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.bezierCurveTo(
								reflected.x,
								reflected.y,
								transfControl.x,
								transfControl.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 'Q':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							control.set( numbers[ j + 0 ], numbers[ j + 1 ] );
							point.set( numbers[ j + 2 ], numbers[ j + 3 ] );
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.quadraticCurveTo(
								transfControl.x,
								transfControl.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 'T':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							reflected.set(
								getReflection( transfPoint.x, transfControl.x ),
								getReflection( transfPoint.y, transfControl.y )
							);
							control.set( reflected.x, reflected.y );
							point.set( numbers[ j + 0 ], numbers[ j + 1 ] );
							transfVec2( point, currentTransform, transfPoint );
							setFirstPoint();
							path.quadraticCurveTo(
								reflected.x,
								reflected.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 'A':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {
							var transfStart = transfPoint.clone();
							point.set( numbers[ j + 5 ], numbers[ j + 6 ] );
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							setFirstPoint();
							var rx = numbers[ j + 0 ] * getTransformScaleX( currentTransform );
							var ry = numbers[ j + 1 ] * getTransformScaleX( currentTransform );
							if ( isTransformRotated( currentTransform ) && rx !== ry ) {
								console.warn( "SVGLoader: Elliptic arc rotation or skewing is not implemented." );
							}
							parseArcCommand(
								path,
								rx,
								ry,
								numbers[ j + 2 ],
								numbers[ j + 3 ],
								numbers[ j + 4 ],
								transfStart,
								transfPoint
							);
						}
						break;

					//

					case 'm':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x += numbers[ j + 0 ];
							point.y += numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							if ( j === 0 ) {
								path.moveTo( transfPoint.x, transfPoint.y );
							}
							else {
								path.lineTo( transfPoint.x, transfPoint.y );
							}
						}
						break;

					case 'h':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.x += numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.lineTo( transfPoint.x, transfPoint.y );
						}
						break;

					case 'v':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.y += numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.lineTo( transfPoint.x, transfPoint.y );
						}
						break;

					case 'l':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x += numbers[ j + 0 ];
							point.y += numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.lineTo( transfPoint.x, transfPoint.y );
						}
						break;

					case 'c':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 6 ) {
							control2.set( point.x + numbers[ j + 0 ], point.y + numbers[ j + 1 ] );
							control.set( point.x + numbers[ j + 2 ], point.y + numbers[ j + 3 ] );
							point.x += numbers[ j + 4 ];
							point.y += numbers[ j + 5 ];
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							transfVec2( control2, currentTransform, transfControl2 );
							setFirstPoint();
							path.bezierCurveTo(
								transfControl2.x,
								transfControl2.y,
								transfControl.x,
								transfControl.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 's':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							reflected.set(
								getReflection( transfPoint.x, transfControl.x ),
								getReflection( transfPoint.y, transfControl.y )
							);
							control.set( point.x + numbers[ j + 0 ], point.y + numbers[ j + 1 ] );
							point.x += numbers[ j + 2 ];
							point.y += numbers[ j + 3 ];
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.bezierCurveTo(
								reflected.x,
								reflected.y,
								transfControl.x,
								transfControl.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 'q':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							control.set( point.x + numbers[ j + 0 ], point.y + numbers[ j + 1 ] );
							point.x += numbers[ j + 2 ];
							point.y += numbers[ j + 3 ];
							transfVec2( point, currentTransform, transfPoint );
							transfVec2( control, currentTransform, transfControl );
							setFirstPoint();
							path.quadraticCurveTo(
								transfControl.x,
								transfControl.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 't':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							reflected.set(
								getReflection( transfPoint.x, transfControl.x ),
								getReflection( transfPoint.y, transfControl.y )
							);
							control.set( reflected.x, reflected.y );
							point.x += numbers[ j + 0 ];
							point.y += numbers[ j + 1 ];
							transfVec2( point, currentTransform, transfPoint );
							setFirstPoint();
							path.quadraticCurveTo(
								reflected.x,
								reflected.y,
								transfPoint.x,
								transfPoint.y
							);
						}
						break;

					case 'a':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {
							var transfStart = transfPoint.clone();
							point.x += numbers[ j + 5 ];
							point.y += numbers[ j + 6 ];
							control.x = point.x;
							control.y = point.y;
							transfVec2( point, currentTransform, transfPoint );
							setFirstPoint();
							var rx = numbers[ j + 0 ] * getTransformScaleX( currentTransform );
							var ry = numbers[ j + 1 ] * getTransformScaleX( currentTransform );
							if ( isTransformRotated( currentTransform ) && rx !== ry ) {
								console.warn( "SVGLoader: Elliptic arc rotation or skewing is not implemented." );
							}
							parseArcCommand(
								path,
								rx,
								ry,
								numbers[ j + 2 ],
								numbers[ j + 3 ],
								numbers[ j + 4 ],
								transfStart,
								transfPoint
							);
						}
						break;

					//

					case 'Z':
					case 'z':
						path.currentPath.autoClose = true;
						if ( path.currentPath.curves.length > 0 ) {
							// Reset point to beginning of Path
							point.x = firstPoint.x;
							point.y = firstPoint.y;
							transfVec2( point, currentTransform, transfPoint );
							path.currentPath.currentPoint.copy( transfPoint );
							isFirstPoint = true;
						}
						break;

					default:
						console.warn( command );

				}

				// console.log( type, parseFloats( data ), parseFloats( data ).length  )

			}

			return path;

		}

		/**
		 * https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
		 * https://mortoray.com/2017/02/16/rendering-an-svg-elliptical-arc-as-bezier-curves/ Appendix: Endpoint to center arc conversion
		 * From
		 * rx ry x-axis-rotation large-arc-flag sweep-flag x y
		 * To
		 * aX, aY, xRadius, yRadius, aStartAngle, aEndAngle, aClockwise, aRotation
		 */

		function parseArcCommand( path, rx, ry, x_axis_rotation, large_arc_flag, sweep_flag, start, end ) {

			x_axis_rotation = x_axis_rotation * Math.PI / 180;

			// Ensure radii are positive
			rx = Math.abs( rx );
			ry = Math.abs( ry );

			// Compute (x1′, y1′)
			var dx2 = ( start.x - end.x ) / 2.0;
			var dy2 = ( start.y - end.y ) / 2.0;
			var x1p = Math.cos( x_axis_rotation ) * dx2 + Math.sin( x_axis_rotation ) * dy2;
			var y1p = - Math.sin( x_axis_rotation ) * dx2 + Math.cos( x_axis_rotation ) * dy2;

			// Compute (cx′, cy′)
			var rxs = rx * rx;
			var rys = ry * ry;
			var x1ps = x1p * x1p;
			var y1ps = y1p * y1p;

			// Ensure radii are large enough
			var cr = x1ps / rxs + y1ps / rys;

			if ( cr > 1 ) {

				// scale up rx,ry equally so cr == 1
				var s = Math.sqrt( cr );
				rx = s * rx;
				ry = s * ry;
				rxs = rx * rx;
				rys = ry * ry;

			}

			var dq = ( rxs * y1ps + rys * x1ps );
			var pq = ( rxs * rys - dq ) / dq;
			var q = Math.sqrt( Math.max( 0, pq ) );
			if ( large_arc_flag === sweep_flag ) q = - q;
			var cxp = q * rx * y1p / ry;
			var cyp = - q * ry * x1p / rx;

			// Step 3: Compute (cx, cy) from (cx′, cy′)
			var cx = Math.cos( x_axis_rotation ) * cxp - Math.sin( x_axis_rotation ) * cyp + ( start.x + end.x ) / 2;
			var cy = Math.sin( x_axis_rotation ) * cxp + Math.cos( x_axis_rotation ) * cyp + ( start.y + end.y ) / 2;

			// Step 4: Compute θ1 and Δθ
			var theta = svgAngle( 1, 0, ( x1p - cxp ) / rx, ( y1p - cyp ) / ry );
			var delta = svgAngle( ( x1p - cxp ) / rx, ( y1p - cyp ) / ry, ( - x1p - cxp ) / rx, ( - y1p - cyp ) / ry ) % ( Math.PI * 2 );

			path.currentPath.absellipse( cx, cy, rx, ry, theta, theta + delta, sweep_flag === 0, x_axis_rotation );

		}

		function svgAngle( ux, uy, vx, vy ) {

			var dot = ux * vx + uy * vy;
			var len = Math.sqrt( ux * ux + uy * uy ) *  Math.sqrt( vx * vx + vy * vy );
			var ang = Math.acos( Math.max( -1, Math.min( 1, dot / len ) ) ); // floating point precision, slightly over values appear
			if ( ( ux * vy - uy * vx ) < 0 ) ang = - ang;
			return ang;

		}

		/*
		* According to https://www.w3.org/TR/SVG/shapes.html#RectElementRXAttribute
		* rounded corner should be rendered to elliptical arc, but bezier curve does the job well enough
		*/
		function parseRectNode( node, style ) {

			var x = parseFloat( node.getAttribute( 'x' ) || 0 );
			var y = parseFloat( node.getAttribute( 'y' ) || 0 );
			var rx = parseFloat( node.getAttribute( 'rx' ) || 0 );
			var ry = parseFloat( node.getAttribute( 'ry' ) || 0 );
			var w = parseFloat( node.getAttribute( 'width' ) );
			var h = parseFloat( node.getAttribute( 'height' ) );

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );
			
			tempVecA.set( x + 2 * rx, y );
			transfVec2( tempVecA, currentTransform, tempVecB );
			path.moveTo( tempVecB.x, tempVecB.y );

			tempVecA.set( x + w - 2 * rx, y );
			transfVec2( tempVecA, currentTransform, tempVecB );
			path.lineTo( tempVecB.x, tempVecB.y );

			if ( rx !== 0 || ry !== 0 ) {
				tempVecA.set( x + w, y );
				transfVec2( tempVecA, currentTransform, tempVecB );
				tempVecA.set( x + w, y + 2 * ry );
				transfVec2( tempVecA, currentTransform, tempVecC );
				path.bezierCurveTo( tempVecB.x, tempVecB.y, tempVecB.x, tempVecB.y, tempVecC.x, tempVecC.y );
			}
			
			tempVecA.set( x + w, y + h - 2 * ry );
			transfVec2( tempVecA, currentTransform, tempVecB );
			path.lineTo( tempVecB.x, tempVecB.y );

			if ( rx !== 0 || ry !== 0 ) {
				
				tempVecA.set( x + w, y + h );
				transfVec2( tempVecA, currentTransform, tempVecB );
				tempVecA.set( x + w - 2 * rx, y + h );
				transfVec2( tempVecA, currentTransform, tempVecC );
				path.bezierCurveTo( tempVecB.x, tempVecB.y, tempVecB.x, tempVecB.y, tempVecC.x, tempVecC.y );

			}

			tempVecA.set( x + 2 * rx, y + h );
			transfVec2( tempVecA, currentTransform, tempVecB );
			path.lineTo( tempVecB.x, tempVecB.y );

			if ( rx !== 0 || ry !== 0 ) {

				tempVecA.set( x, y + h );
				transfVec2( tempVecA, currentTransform, tempVecB );
				tempVecA.set( x, y + h - 2 * ry );
				transfVec2( tempVecA, currentTransform, tempVecC );
				path.bezierCurveTo( tempVecB.x, tempVecB.y, tempVecB.x, tempVecB.y, tempVecC.x, tempVecC.y );

			}


			tempVecA.set( x, y + 2 * ry );
			transfVec2( tempVecA, currentTransform, tempVecB );
			path.lineTo( tempVecB.x, tempVecB.y );

			if ( rx !== 0 || ry !== 0 ) {

				tempVecA.set( x, y );
				transfVec2( tempVecA, currentTransform, tempVecB );
				tempVecA.set( x + 2 * rx, y );
				transfVec2( tempVecA, currentTransform, tempVecC );
				path.bezierCurveTo( tempVecB.x, tempVecB.y, tempVecB.x, tempVecB.y, tempVecC.x, tempVecC.y );

			}

			return path;

		}

		function parsePolygonNode( node, style ) {

			function iterator( match, a, b ) {

				var x = parseFloat( a );
				var y = parseFloat( b );

				tempVecA.set( x, y );
				transfVec2( tempVecA, currentTransform, tempVecB );
				x = tempVecB.x;
				y = tempVecB.y;

				if ( index === 0 ) {
					path.moveTo( x, y );
				} else {
					path.lineTo( x, y );
				}

				index ++;

			}

			var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );

			var index = 0;

			node.getAttribute( 'points' ).replace(regex, iterator);

			path.currentPath.autoClose = true;

			return path;

		}

		function parsePolylineNode( node, style ) {

			function iterator( match, a, b ) {

				var x = parseFloat( a );
				var y = parseFloat( b );

				tempVecA.set( x, y );
				transfVec2( tempVecA, currentTransform, tempVecB );
				x = tempVecB.x;
				y = tempVecB.y;

				if ( index === 0 ) {
					path.moveTo( x, y );
				} else {
					path.lineTo( x, y );
				}

				index ++;

			}

			var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );

			var index = 0;

			node.getAttribute( 'points' ).replace(regex, iterator);

			path.currentPath.autoClose = false;

			return path;

		}

		function parseCircleNode( node, style ) {

			var x = parseFloat( node.getAttribute( 'cx' ) );
			var y = parseFloat( node.getAttribute( 'cy' ) );
			var r = parseFloat( node.getAttribute( 'r' ) );

			// Transform of center
			tempVecA.set( x, y );
			transfVec2( tempVecA, currentTransform, tempVecB );
			x = tempVecB.x;
			y = tempVecB.y;

			// Scale
			var scaleX = getTransformScaleX( currentTransform );
			var scaleY = getTransformScaleY( currentTransform );

			var subpath = new THREE.Path();

			if ( Math.abs( scaleX - scaleY ) > 0.00000001 ) {

				// Circle sclaed differently in x and y becomes an ellipse

				subpath.absellipse( x, y, r * scaleX, r * scaleY, 0, Math.PI * 2 );
			}
			else {
				subpath.absarc( x, y, r, 0, Math.PI * 2 );
			}

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );
			path.subPaths.push( subpath );

			return path;

		}

		function parseEllipseNode( node, style ) {

			var x = parseFloat( node.getAttribute( 'cx' ) );
			var y = parseFloat( node.getAttribute( 'cy' ) );
			var rx = parseFloat( node.getAttribute( 'rx' ) );
			var ry = parseFloat( node.getAttribute( 'ry' ) );

			// Transform of center
			tempVecA.set( x, y );
			transfVec2( tempVecA, currentTransform, tempVecB );
			x = tempVecB.x;
			y = tempVecB.y;

			// Rotation
			if ( isTransformRotated( currentTransform ) ) {
				console.warn( "SVGLoader: Ellipse rotation or skewing is not implemented." );
			}

			// Scale
			rx *= getTransformScaleX( currentTransform );
			ry *= getTransformScaleY( currentTransform );

			var subpath = new THREE.Path();
			subpath.absellipse( x, y, rx, ry, 0, Math.PI * 2 );

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );
			path.subPaths.push( subpath );

			return path;

		}

		function parseLineNode( node, style ) {

			var x1 = parseFloat( node.getAttribute( 'x1' ) );
			var y1 = parseFloat( node.getAttribute( 'y1' ) );
			var x2 = parseFloat( node.getAttribute( 'x2' ) );
			var y2 = parseFloat( node.getAttribute( 'y2' ) );
			
			tempVecA.set( x1, y1 );
			transfVec2( tempVecA, currentTransform, tempVecB );
			x1 = tempVecB.x;
			y1 = tempVecB.y;

			tempVecA.set( x2, y2 );
			transfVec2( tempVecA, currentTransform, tempVecB );
			x2 = tempVecB.x;
			y2 = tempVecB.y;

			var path = new THREE.ShapePath();
			path.moveTo( x1, y1 );
			path.lineTo( x2, y2 );
			path.currentPath.autoClose = false;

			return path;

		}

		//

		function parseStyle( node, style ) {

			style = Object.assign( {}, style ); // clone style

			if ( node.hasAttribute( 'fill' ) ) style.fill = node.getAttribute( 'fill' );
			if ( node.style.fill !== '' ) style.fill = node.style.fill;

			return style;

		}

		function isVisible( style ) {

			return style.fill !== 'none' && style.fill !== 'transparent';

		}

		// http://www.w3.org/TR/SVG11/implnote.html#PathElementImplementationNotes

		function getReflection( a, b ) {

			return a - ( b - a );

		}

		function parseFloats( string ) {

			var array = string.split( /[\s,]+|(?=\s?[+\-])/ );

			for ( var i = 0; i < array.length; i ++ ) {

				var number = array[ i ];

				// Handle values like 48.6037.7.8
				// TODO Find a regex for this

				if ( number.indexOf( '.' ) !== number.lastIndexOf( '.' ) ) {

					var split = number.split( '.' );

					for ( var s = 2; s < split.length; s ++ ) {

						array.splice( i + s - 1, 0, '0.' + split[ s ] );

					}

				}

				array[ i ] = parseFloat( number );

			}

			return array;


		}

		function parseTransformNode( node ) {

			var transformAttr = node.getAttribute( 'transform' );
			var transform = null;
			var openParPos = transformAttr.indexOf( "(" );
			var closeParPos = transformAttr.indexOf( ")" );

			if ( openParPos > 0 && openParPos < closeParPos ) {

				var transformType = transformAttr.substr( 0, openParPos );
				
				var array = parseFloats( transformAttr.substr( openParPos + 1, closeParPos - openParPos - 1 ) );

				switch ( transformType ) {
					
					case "translate":

						if ( array.length >= 1 ) {

							transform = createIdTransform();

							// Translation X
							transform[ 4 ] = array[ 0 ];

						}

						if ( array.length >= 2 ) {

							// Translation Y
							transform[ 5 ] = array[ 1 ];

						}

						break;

					case "rotate":

						if ( array.length >= 1 ) {
							
							var angle = 0;
							var cx = 0;
							var cy = 0;

							transform = createIdTransform();

							// Angle
							angle = array[ 0 ] * Math.PI / 180;

							if ( array.length >= 3 ) {

								// Center x, y
								cx = array[ 1 ];
								cy = array[ 2 ];

							}

							// Rotate around center (cx, cy)

							var traslation = createIdTransform();
							traslation[ 4 ] = -cx;
							traslation[ 5 ] = -cy;

							var rotation = createRotationTransform( angle );

							var traslRot = createIdTransform();
							multiplyTransforms( traslation, rotation, traslRot );

							traslation[ 4 ] = cx;
							traslation[ 5 ] = cy;
							multiplyTransforms( traslRot, traslation, transform );

						}

						break;

					case "scale":

						if ( array.length >= 1 ) {

							transform = createIdTransform();

							var scaleX = array[ 0 ];
							var scaleY = scaleX;

							if ( array.length >= 2 ) {
								scaleY = array[ 1 ];
							}

							transform[ 0 ] = scaleX;
							transform[ 3 ] = scaleY;

						}

						break;

					case "matrix":

						if ( array.length === 6 ) {

							transform = createIdTransform();

							copyTransform( array, transform );

						}

						break;
				}

			}
			
			return transform;

		}

		function createIdTransform( m ) {

			// 2 x 3 matrix:
			// 1  0
			// 0  1
			// tx ty

			if ( ! m ) {
				m = [];
			}

			m[ 0 ] = 1;
			m[ 1 ] = 0;
			m[ 2 ] = 0;
			m[ 3 ] = 1;
			m[ 4 ] = 0;
			m[ 5 ] = 0;

			return m;

		}

		function copyTransform( orig, dest ) {

			for ( var i = 0; i < 6; i++ ) {
				dest[ i ] = orig[ i ]
			}

		}

		function transfVec2( v, m, r ) {

			r.x = v.x * m[ 0 ] + v.y * m[ 2 ] + m[ 4 ];
			r.y = v.x * m[ 1 ] + v.y * m[ 3 ] + m[ 5 ];

		}

		function multiplyTransforms( a, b, r ) {

			r[ 0 ] = a[ 0 ] * b[ 0 ] + a[ 1 ] * b[ 2 ];
			r[ 1 ] = a[ 0 ] * b[ 1 ] + a[ 1 ] * b[ 3 ];
			r[ 2 ] = a[ 2 ] * b[ 0 ] + a[ 3 ] * b[ 2 ];
			r[ 3 ] = a[ 2 ] * b[ 1 ] + a[ 3 ] * b[ 3 ];
			r[ 4 ] = a[ 4 ] * b[ 0 ] + a[ 5 ] * b[ 2 ] + b[ 4 ];
			r[ 5 ] = a[ 4 ] * b[ 1 ] + a[ 5 ] * b[ 3 ] + b[ 5 ];

		}

		function isTransformRotated( m ) {
			return m[ 1 ] !== 0 || m[ 2 ] !== 0;
		}

		function getTransformScaleX( m ) {
			return Math.sqrt( m[ 0 ] * m[ 0 ] + m[ 1 ] * m[ 1 ] )
		}

		function getTransformScaleY( m ) {
			return Math.sqrt( m[ 2 ] * m[ 2 ] + m[ 3 ] * m[ 3 ] )
		}

		function createRotationTransform( angle ) {

			var rotation = createIdTransform();

			rotation[ 0 ] = Math.cos( angle );
			rotation[ 1 ] = Math.sin( angle );
			rotation[ 2 ] = -Math.sin( angle );
			rotation[ 3 ] = Math.cos( angle );
			
			return rotation;

		}

		//

		console.log( 'THREE.SVGLoader' );

		var paths = [];

		var transformStack = [];

		var currentTransform = createIdTransform();
		
		var tempTransform = createIdTransform();
		var tempVecA = new THREE.Vector2();
		var tempVecB = new THREE.Vector2();
		var tempVecC = new THREE.Vector2();

		console.time( 'THREE.SVGLoader: DOMParser' );

		var xml = new DOMParser().parseFromString( text, 'image/svg+xml' ); // application/xml

		console.timeEnd( 'THREE.SVGLoader: DOMParser' );

		console.time( 'THREE.SVGLoader: Parse' );

		parseNode( xml.documentElement, { fill: '#000' } );

		// console.log( paths );

		console.timeEnd( 'THREE.SVGLoader: Parse' );

		return paths;

	}

};
