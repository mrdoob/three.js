/**
 * @author mrdoob / http://mrdoob.com/
 * @author zz85 / http://joshuakoo.com/
 * @author yomboprime / https://yombo.org
 */

THREE.SVGLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.SVGLoader.prototype = {

	constructor: THREE.SVGLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	parse: function ( text ) {

		function parseNode( node, style ) {

			if ( node.nodeType !== 1 ) return;

			var transform = getNodeTransform( node );

			var path = null;

			switch ( node.nodeName ) {

				case 'svg':
					break;

				case 'g':
					style = parseStyle( node, style );
					break;

				case 'path':
					style = parseStyle( node, style );
					if ( node.hasAttribute( 'd' ) ) path = parsePathNode( node, style );
					break;

				case 'rect':
					style = parseStyle( node, style );
					path = parseRectNode( node, style );
					break;

				case 'polygon':
					style = parseStyle( node, style );
					path = parsePolygonNode( node, style );
					break;

				case 'polyline':
					style = parseStyle( node, style );
					path = parsePolylineNode( node, style );
					break;

				case 'circle':
					style = parseStyle( node, style );
					path = parseCircleNode( node, style );
					break;

				case 'ellipse':
					style = parseStyle( node, style );
					path = parseEllipseNode( node, style );
					break;

				case 'line':
					style = parseStyle( node, style );
					path = parseLineNode( node, style );
					break;

				default:
					console.log( node );

			}

			if ( path ) {

				if ( style.fill !== undefined && style.fill !== 'none' ) {

					path.color.setStyle( style.fill );

				}

				transformPath( path, currentTransform );

				paths.push( path );

				path.userData = { node: node, style: style };

			}

			var nodes = node.childNodes;

			for ( var i = 0; i < nodes.length; i ++ ) {

				parseNode( nodes[ i ], style );

			}

			if ( transform ) {

				currentTransform.copy( transformStack.pop() );

			}

		}

		function parsePathNode( node, style ) {

			var path = new THREE.ShapePath();

			var point = new THREE.Vector2();
			var control = new THREE.Vector2();

			var firstPoint = new THREE.Vector2();
			var isFirstPoint = true;
			var doSetFirstPoint = false;

			var d = node.getAttribute( 'd' );

			// console.log( d );

			var commands = d.match( /[a-df-z][^a-df-z]*/ig );

			for ( var i = 0, l = commands.length; i < l; i ++ ) {

				var command = commands[ i ];

				var type = command.charAt( 0 );
				var data = command.substr( 1 ).trim();

				if ( isFirstPoint === true ) {
					doSetFirstPoint = true;
					isFirstPoint = false;
				}

				switch ( type ) {

					case 'M':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x = numbers[ j + 0 ];
							point.y = numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							if ( j === 0 ) {
								path.moveTo( point.x, point.y );
							} else {
								path.lineTo( point.x, point.y );
							}
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'H':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.x = numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'V':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.y = numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'L':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x = numbers[ j + 0 ];
							point.y = numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'C':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 6 ) {
							path.bezierCurveTo(
								numbers[ j + 0 ],
								numbers[ j + 1 ],
								numbers[ j + 2 ],
								numbers[ j + 3 ],
								numbers[ j + 4 ],
								numbers[ j + 5 ]
							);
							control.x = numbers[ j + 2 ];
							control.y = numbers[ j + 3 ];
							point.x = numbers[ j + 4 ];
							point.y = numbers[ j + 5 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'S':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							path.bezierCurveTo(
								getReflection( point.x, control.x ),
								getReflection( point.y, control.y ),
								numbers[ j + 0 ],
								numbers[ j + 1 ],
								numbers[ j + 2 ],
								numbers[ j + 3 ]
							);
							control.x = numbers[ j + 0 ];
							control.y = numbers[ j + 1 ];
							point.x = numbers[ j + 2 ];
							point.y = numbers[ j + 3 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'Q':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							path.quadraticCurveTo(
								numbers[ j + 0 ],
								numbers[ j + 1 ],
								numbers[ j + 2 ],
								numbers[ j + 3 ]
							);
							control.x = numbers[ j + 0 ];
							control.y = numbers[ j + 1 ];
							point.x = numbers[ j + 2 ];
							point.y = numbers[ j + 3 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'T':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							var rx = getReflection( point.x, control.x );
							var ry = getReflection( point.y, control.y );
							path.quadraticCurveTo(
								rx,
								ry,
								numbers[ j + 0 ],
								numbers[ j + 1 ]
							);
							control.x = rx;
							control.y = ry;
							point.x = numbers[ j + 0 ];
							point.y = numbers[ j + 1 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'A':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {
							var start = point.clone();
							point.x = numbers[ j + 5 ];
							point.y = numbers[ j + 6 ];
							control.x = point.x;
							control.y = point.y;
							parseArcCommand(
								path, numbers[ j ], numbers[ j + 1 ], numbers[ j + 2 ], numbers[ j + 3 ], numbers[ j + 4 ], start, point
							);
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
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
							if ( j === 0 ) {
								path.moveTo( point.x, point.y );
							} else {
								path.lineTo( point.x, point.y );
							}
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'h':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.x += numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'v':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.y += numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'l':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							point.x += numbers[ j + 0 ];
							point.y += numbers[ j + 1 ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'c':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 6 ) {
							path.bezierCurveTo(
								point.x + numbers[ j + 0 ],
								point.y + numbers[ j + 1 ],
								point.x + numbers[ j + 2 ],
								point.y + numbers[ j + 3 ],
								point.x + numbers[ j + 4 ],
								point.y + numbers[ j + 5 ]
							);
							control.x = point.x + numbers[ j + 2 ];
							control.y = point.y + numbers[ j + 3 ];
							point.x += numbers[ j + 4 ];
							point.y += numbers[ j + 5 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 's':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							path.bezierCurveTo(
								getReflection( point.x, control.x ),
								getReflection( point.y, control.y ),
								point.x + numbers[ j + 0 ],
								point.y + numbers[ j + 1 ],
								point.x + numbers[ j + 2 ],
								point.y + numbers[ j + 3 ]
							);
							control.x = point.x + numbers[ j + 0 ];
							control.y = point.y + numbers[ j + 1 ];
							point.x += numbers[ j + 2 ];
							point.y += numbers[ j + 3 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'q':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 4 ) {
							path.quadraticCurveTo(
								point.x + numbers[ j + 0 ],
								point.y + numbers[ j + 1 ],
								point.x + numbers[ j + 2 ],
								point.y + numbers[ j + 3 ]
							);
							control.x = point.x + numbers[ j + 0 ];
							control.y = point.y + numbers[ j + 1 ];
							point.x += numbers[ j + 2 ];
							point.y += numbers[ j + 3 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 't':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 2 ) {
							var rx = getReflection( point.x, control.x );
							var ry = getReflection( point.y, control.y );
							path.quadraticCurveTo(
								rx,
								ry,
								point.x + numbers[ j + 0 ],
								point.y + numbers[ j + 1 ]
							);
							control.x = rx;
							control.y = ry;
							point.x = point.x + numbers[ j + 0 ];
							point.y = point.y + numbers[ j + 1 ];
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					case 'a':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {
							var start = point.clone();
							point.x += numbers[ j + 5 ];
							point.y += numbers[ j + 6 ];
							control.x = point.x;
							control.y = point.y;
							parseArcCommand(
								path, numbers[ j ], numbers[ j + 1 ], numbers[ j + 2 ], numbers[ j + 3 ], numbers[ j + 4 ], start, point
							);
							if ( j === 0 && doSetFirstPoint === true ) firstPoint.copy( point );
						}
						break;

					//

					case 'Z':
					case 'z':
						path.currentPath.autoClose = true;
						if ( path.currentPath.curves.length > 0 ) {
							// Reset point to beginning of Path
							point.copy( firstPoint );
							path.currentPath.currentPoint.copy( point );
							isFirstPoint = true;
						}
						break;

					default:
						console.warn( command );

				}

				// console.log( type, parseFloats( data ), parseFloats( data ).length  )

				doSetFirstPoint = false;

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
			path.moveTo( x + 2 * rx, y );
			path.lineTo( x + w - 2 * rx, y );
			if ( rx !== 0 || ry !== 0 ) path.bezierCurveTo( x + w, y, x + w, y, x + w, y + 2 * ry );
			path.lineTo( x + w, y + h - 2 * ry );
			if ( rx !== 0 || ry !== 0 ) path.bezierCurveTo( x + w, y + h, x + w, y + h, x + w - 2 * rx, y + h );
			path.lineTo( x + 2 * rx, y + h );

			if ( rx !== 0 || ry !== 0 ) {

				path.bezierCurveTo( x, y + h, x, y + h, x, y + h - 2 * ry );

			}

			path.lineTo( x, y + 2 * ry );

			if ( rx !== 0 || ry !== 0 ) {

				path.bezierCurveTo( x, y, x, y, x + 2 * rx, y );

			}

			return path;

		}

		function parsePolygonNode( node, style ) {

			function iterator( match, a, b ) {

				var x = parseFloat( a );
				var y = parseFloat( b );

				if ( index === 0 ) {
					path.moveTo( x, y );
				} else {
					path.lineTo( x, y );
				}

				index ++;

			}

			var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

			var path = new THREE.ShapePath();

			var index = 0;

			node.getAttribute( 'points' ).replace(regex, iterator);

			path.currentPath.autoClose = true;

			return path;

		}

		function parsePolylineNode( node, style ) {

			function iterator( match, a, b ) {

				var x = parseFloat( a );
				var y = parseFloat( b );

				if ( index === 0 ) {
					path.moveTo( x, y );
				} else {
					path.lineTo( x, y );
				}

				index ++;

			}

			var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;

			var path = new THREE.ShapePath();

			var index = 0;

			node.getAttribute( 'points' ).replace(regex, iterator);

			path.currentPath.autoClose = false;

			return path;

		}

		function parseCircleNode( node, style ) {

			var x = parseFloat( node.getAttribute( 'cx' ) );
			var y = parseFloat( node.getAttribute( 'cy' ) );
			var r = parseFloat( node.getAttribute( 'r' ) );

			var subpath = new THREE.Path();
			subpath.absarc( x, y, r, 0, Math.PI * 2 );

			var path = new THREE.ShapePath();
			path.subPaths.push( subpath );

			return path;

		}

		function parseEllipseNode( node, style ) {

			var x = parseFloat( node.getAttribute( 'cx' ) );
			var y = parseFloat( node.getAttribute( 'cy' ) );
			var rx = parseFloat( node.getAttribute( 'rx' ) );
			var ry = parseFloat( node.getAttribute( 'ry' ) );

			var subpath = new THREE.Path();
			subpath.absellipse( x, y, rx, ry, 0, Math.PI * 2 );

			var path = new THREE.ShapePath();
			path.subPaths.push( subpath );

			return path;

		}

		function parseLineNode( node, style ) {

			var x1 = parseFloat( node.getAttribute( 'x1' ) );
			var y1 = parseFloat( node.getAttribute( 'y1' ) );
			var x2 = parseFloat( node.getAttribute( 'x2' ) );
			var y2 = parseFloat( node.getAttribute( 'y2' ) );

			var path = new THREE.ShapePath();
			path.moveTo( x1, y1 );
			path.lineTo( x2, y2 );
			path.currentPath.autoClose = false;

			return path;

		}

		//

		function parseStyle( node, style ) {

			style = Object.assign( {}, style ); // clone style

			function addStyle( svgName, jsName, adjustFunction ) {

				if ( adjustFunction === undefined ) adjustFunction = function copy( v ) { return v; };

				if ( node.hasAttribute( svgName ) ) style[ jsName ] = adjustFunction( node.getAttribute( svgName ) );
				if ( node.style[ svgName ] !== '' ) style[ jsName ] = adjustFunction( node.style[ svgName ] );

			}

			function clamp( v ) {

				return Math.max( 0, Math.min( 1, v ) );

			}

			function positive( v ) {

				return Math.max( 0, v );

			}

			addStyle( 'fill', 'fill' );
			addStyle( 'fill-opacity', 'fillOpacity', clamp );
			addStyle( 'stroke', 'stroke' );
			addStyle( 'stroke-opacity', 'strokeOpacity', clamp );
			addStyle( 'stroke-width', 'strokeWidth', positive );
			addStyle( 'stroke-linejoin', 'strokeLineJoin' );
			addStyle( 'stroke-linecap', 'strokeLineCap' );
			addStyle( 'stroke-miterlimit', 'strokeMiterLimit', positive );

			return style;

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

		function getNodeTransform( node ) {

			if ( ! node.hasAttribute( 'transform' ) ) {
				return null;
			}

			var transform = parseNodeTransform( node );

			if ( transform ) {

				if ( transformStack.length > 0 ) {
					transform.premultiply( transformStack[ transformStack.length - 1 ] );
				}

				currentTransform.copy( transform );
				transformStack.push( transform );

			}

			return transform;

		}

		function parseNodeTransform( node ) {

			var transform = new THREE.Matrix3();
			var currentTransform = tempTransform0;
			var transformsTexts = node.getAttribute( 'transform' ).split( ' ' );

			for ( var tIndex = transformsTexts.length - 1; tIndex >= 0; tIndex -- ) {

				var transformText = transformsTexts[ tIndex ];
				var openParPos = transformText.indexOf( "(" );
				var closeParPos = transformText.indexOf( ")" );

				if ( openParPos > 0 && openParPos < closeParPos ) {

					var transformType = transformText.substr( 0, openParPos );

					var array = parseFloats( transformText.substr( openParPos + 1, closeParPos - openParPos - 1 ) );

					currentTransform.identity();

					switch ( transformType ) {

						case "translate":

							if ( array.length >= 1 ) {

								var tx = array[ 0 ];
								var ty = tx;

								if ( array.length >= 2 ) {

									ty = array[ 1 ];

								}

								currentTransform.translate( tx, ty );

							}

							break;

						case "rotate":

							if ( array.length >= 1 ) {

								var angle = 0;
								var cx = 0;
								var cy = 0;

								// Angle
								angle = - array[ 0 ] * Math.PI / 180;

								if ( array.length >= 3 ) {

									// Center x, y
									cx = array[ 1 ];
									cy = array[ 2 ];

								}

								// Rotate around center (cx, cy)
								tempTransform1.identity().translate( -cx, -cy );
								tempTransform2.identity().rotate( angle );
								tempTransform3.multiplyMatrices( tempTransform2, tempTransform1 );
								tempTransform1.identity().translate( cx, cy );
								currentTransform.multiplyMatrices( tempTransform1, tempTransform3 );

							}

							break;

						case "scale":

							if ( array.length >= 1 ) {

								var scaleX = array[ 0 ];
								var scaleY = scaleX;

								if ( array.length >= 2 ) {
									scaleY = array[ 1 ];
								}

								currentTransform.scale( scaleX, scaleY );

							}

							break;

						case "skewX":

							if ( array.length === 1 ) {

								currentTransform.set(
									1, Math.tan( array[ 0 ] * Math.PI / 180 ), 0,
									0, 1, 0,
									0, 0, 1
								);

							}

							break;

						case "skewY":

							if ( array.length === 1 ) {

								currentTransform.set(
									1, 0, 0,
									Math.tan( array[ 0 ] * Math.PI / 180 ), 1, 0,
									0, 0, 1
								);

							}

							break;

						case "matrix":

							if ( array.length === 6 ) {

								currentTransform.set(
									array[ 0 ], array[ 2 ], array[ 4 ],
									array[ 1 ], array[ 3 ], array[ 5 ],
									0, 0, 1
								);

							}

							break;
					}

				}

				transform.premultiply( currentTransform );

			}

			return transform;

		}

		function transformPath( path, m ) {

			function transfVec2( v2 ) {

				tempV3.set( v2.x, v2.y, 1 ).applyMatrix3( m );

				v2.set( tempV3.x, tempV3.y );

			}

			var isRotated = isTransformRotated( m );

			var subPaths = path.subPaths;

			for ( var i = 0, n = subPaths.length; i < n; i++ ) {

				var subPath = subPaths[ i ];
				var curves = subPath.curves;

				for ( var j = 0; j < curves.length; j++ ) {

					var curve = curves[ j ];

					if ( curve.isLineCurve ) {

						transfVec2( curve.v1 );
						transfVec2( curve.v2 );

					} else if ( curve.isCubicBezierCurve ) {

						transfVec2( curve.v0 );
						transfVec2( curve.v1 );
						transfVec2( curve.v2 );
						transfVec2( curve.v3 );

					} else if ( curve.isQuadraticBezierCurve ) {

						transfVec2( curve.v0 );
						transfVec2( curve.v1 );
						transfVec2( curve.v2 );

					} else if ( curve.isEllipseCurve ) {

						if ( isRotated ) {
							console.warn( "SVGLoader: Elliptic arc or ellipse rotation or skewing is not implemented." );
						}

						tempV2.set( curve.aX, curve.aY );
						transfVec2( tempV2 );
						curve.aX = tempV2.x;
						curve.aY = tempV2.y;

						curve.xRadius *= getTransformScaleX( m );
						curve.yRadius *= getTransformScaleY( m );

					}

				}

			}

		}

		function isTransformRotated( m ) {
			return m.elements[ 1 ] !== 0 || m.elements[ 3 ] !== 0;
		}

		function getTransformScaleX( m ) {
			var te = m.elements;
			return Math.sqrt( te[ 0 ] * te[ 0 ] + te[ 1 ] * te[ 1 ] )
		}

		function getTransformScaleY( m ) {
			var te = m.elements;
			return Math.sqrt( te[ 3 ] * te[ 3 ] + te[ 4 ] * te[ 4 ] )
		}

		//

		console.log( 'THREE.SVGLoader' );

		var paths = [];

		var transformStack = [];

		var tempTransform0 = new THREE.Matrix3();
		var tempTransform1 = new THREE.Matrix3();
		var tempTransform2 = new THREE.Matrix3();
		var tempTransform3 = new THREE.Matrix3();
		var tempV2 = new THREE.Vector2();
		var tempV3 = new THREE.Vector3();

		var currentTransform = new THREE.Matrix3();

		var scope = this;

		console.time( 'THREE.SVGLoader: DOMParser' );

		var xml = new DOMParser().parseFromString( text, 'image/svg+xml' ); // application/xml

		console.timeEnd( 'THREE.SVGLoader: DOMParser' );

		console.time( 'THREE.SVGLoader: Parse' );

		parseNode( xml.documentElement, {
			fill: '#000',
			fillOpacity: 1,
			strokeOpacity: 1,
			strokeWidth: 1,
			strokeLineJoin: 'miter',
			strokeLineCap: 'butt',
			strokeMiterLimit: 4
		} );

		var data = { paths: paths, xml: xml.documentElement };

		// console.log( paths );


		console.timeEnd( 'THREE.SVGLoader: Parse' );

		return data;

	}

};

THREE.SVGLoader.getStrokeStyle = function ( width, color, opacity, lineJoin, lineCap,  miterLimit ) {

	// Param width: Stroke width
	// Param color: As returned by THREE.Color.getStyle()
	// Param opacity: 0 (transparent) to 1 (opaque)
	// Param lineJoin: One of "round", "bevel", "miter" or "miter-limit"
	// Param lineCap: One of "round", "square" or "butt"
	// Param miterLimit: Maximum join length, in multiples of the "width" parameter (join is truncated if it exceeds that distance)
	// Returns style object

	width = width !== undefined ? width : 1;
	color = color !== undefined ? color : '#000';
	opacity = opacity !== undefined ? opacity : 1;
	lineJoin = lineJoin !== undefined ? lineJoin : 'miter';
	lineCap = lineCap !== undefined ? lineCap : 'butt';
	miterLimit = miterLimit !== undefined ? miterLimit : 4;

	return {
		strokeColor: color,
		strokeWidth: width,
		strokeLineJoin: lineJoin,
		strokeLineCap: lineCap,
		strokeMiterLimit: miterLimit
	};

};

THREE.SVGLoader.pointsToStroke = function ( points, style, arcDivisions, minDistance ) {

	// Generates a stroke with some witdh around the given path.
	// The path can be open or closed (last point equals to first point)
	// Param points: Array of Vector2D (the path). Minimum 2 points.
	// Param style: Object with SVG properties as returned by SVGLoader.getStrokeStyle(), or SVGLoader.parse() in the path.userData.style object
	// Params arcDivisions: Arc divisions for round joins and endcaps. (Optional)
	// Param minDistance: Points closer to this distance will be merged. (Optional)
	// Returns BufferGeometry with stroke triangles (In plane z = 0). UV coordinates are generated ('u' along path. 'v' across it, from left to right)

	var vertices = [];
	var normals = [];
	var uvs = [];

	if ( THREE.SVGLoader.pointsToStrokeWithBuffers( points, style, arcDivisions, minDistance, vertices, normals, uvs ) === 0 ) {

		return null;

	}

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

	return geometry;

};

THREE.SVGLoader.pointsToStrokeWithBuffers = function () {

	var tempV2_1 = new THREE.Vector2();
	var tempV2_2 = new THREE.Vector2();
	var tempV2_3 = new THREE.Vector2();
	var tempV2_4 = new THREE.Vector2();
	var tempV2_5 = new THREE.Vector2();
	var tempV2_6 = new THREE.Vector2();
	var tempV2_7 = new THREE.Vector2();
	var tempV3_1 = new THREE.Vector3();
	var lastPointL = new THREE.Vector2();
	var lastPointR = new THREE.Vector2();
	var point0L = new THREE.Vector2();
	var point0R = new THREE.Vector2();
	var currentPointL = new THREE.Vector2();
	var currentPointR = new THREE.Vector2();
	var nextPointL = new THREE.Vector2();
	var nextPointR = new THREE.Vector2();
	var innerPoint = new THREE.Vector2();
	var outerPoint = new THREE.Vector2();
	var tempTransform0 = new THREE.Matrix3();
	var tempTransform1 = new THREE.Matrix3();
	var tempTransform2 = new THREE.Matrix3();

	return function ( points, style, arcDivisions, minDistance, vertices, normals, uvs, vertexOffset ) {

		// This function can be called to update existing arrays or buffers.
		// Accepts same parameters as pointsToStroke, plus the buffers and optional offset.
		// Param vertexOffset: Offset vertices to start writing in the buffers (3 elements/vertex for vertices and normals, and 2 elements/vertex for uvs)
		// Returns number of written vertices / normals / uvs
		// if 'vertices' parameter is undefined no triangles will be generated, but the returned vertices count will still be valid (useful to preallocate the buffers)

		arcLengthDivisions = arcDivisions !== undefined ? arcDivisions : 12;
		minDistance = minDistance !== undefined ? minDistance : 0.001;
		vertexOffset = vertexOffset !== undefined ? vertexOffset : 0;

		// First ensure there are no duplicated points
		points = removeDuplicatedPoints( points );

		var numPoints = points.length;

		if ( numPoints < 2 ) return 0;

		var isClosed = points[ 0 ].equals( points[ numPoints - 1 ] );

		var currentPoint;
		var previousPoint = points[ 0 ];
		var nextPoint;

		var strokeWidth2 = style.strokeWidth / 2;

		var deltaU = 1 / ( numPoints - 1 );
		var u0 = 0;

		var innerSideModified;
		var joinIsOnLeftSide;
		var isMiter;
		var initialJoinIsOnLeftSide = false;

		var numVertices = 0;
		var currentCoordinate = vertexOffset * 3;
		var currentCoordinateUV = vertexOffset * 2;

		// Get initial left and right stroke points
		getNormal( points[ 0 ], points[ 1 ], tempV2_1 ).multiplyScalar( strokeWidth2 );
		lastPointL.copy( points[ 0 ] ).sub( tempV2_1 );
		lastPointR.copy( points[ 0 ] ).add( tempV2_1 );
		point0L.copy( lastPointL );
		point0R.copy( lastPointR );

		for ( var iPoint = 1; iPoint < numPoints; iPoint ++ ) {

			currentPoint = points[ iPoint ];

			// Get next point
			if ( iPoint === numPoints - 1 ) {

				if ( isClosed ) {

					// Skip duplicated initial point
					nextPoint = points[ 1 ];

				}
				else nextPoint = undefined;

			}
			else {

				nextPoint = points[ iPoint + 1 ];

			}

			// Normal of previous segment in tempV2_1
			var normal1 = tempV2_1;
			getNormal( previousPoint, currentPoint, normal1 );

			tempV2_3.copy( normal1 ).multiplyScalar( strokeWidth2 );
			currentPointL.copy( currentPoint ).sub( tempV2_3 );
			currentPointR.copy( currentPoint ).add( tempV2_3 );

			var u1 = u0 + deltaU;

			innerSideModified = false;

			if ( nextPoint !== undefined ) {

				// Normal of next segment in tempV2_2
				getNormal( currentPoint, nextPoint, tempV2_2 );

				tempV2_3.copy( tempV2_2 ).multiplyScalar( strokeWidth2 );
				nextPointL.copy( currentPoint ).sub( tempV2_3 );
				nextPointR.copy( currentPoint ).add( tempV2_3 );

				joinIsOnLeftSide = true;
				tempV2_3.subVectors( nextPoint, previousPoint );
				if ( normal1.dot( tempV2_3 ) < 0 ) {

					joinIsOnLeftSide = false;

				}
				if ( iPoint === 1 ) initialJoinIsOnLeftSide = joinIsOnLeftSide;

				tempV2_3.subVectors( nextPoint, currentPoint )
				var maxInnerDistance = tempV2_3.normalize();
				var dot = Math.abs( normal1.dot( tempV2_3 ) );

				// If path is straight, don't create join
				if ( dot !== 0 ) {

					// Compute inner and outer segment intersections
					var miterSide = strokeWidth2 / dot;
					tempV2_3.multiplyScalar( - miterSide );
					tempV2_4.subVectors( currentPoint, previousPoint );
					tempV2_5.copy( tempV2_4 ).setLength( miterSide ).add( tempV2_3 );
					innerPoint.copy( tempV2_5 ).negate();
					var miterLength2 = tempV2_5.length();
					var segmentLengthPrev = tempV2_4.length();
					tempV2_4.divideScalar( segmentLengthPrev );
					tempV2_6.subVectors( nextPoint, currentPoint );
					var segmentLengthNext = tempV2_6.length();
					tempV2_6.divideScalar( segmentLengthNext );
					// Check that previous and next segments doesn't overlap with the innerPoint of intersection
					if ( tempV2_4.dot( innerPoint ) < segmentLengthPrev && tempV2_6.dot( innerPoint ) < segmentLengthNext ) {

						innerSideModified = true;

					}
					outerPoint.copy( tempV2_5 ).add( currentPoint );
					innerPoint.add( currentPoint );

					isMiter = false;

					if ( innerSideModified ) {

						if ( joinIsOnLeftSide ) {

							nextPointR.copy( innerPoint );
							currentPointR.copy( innerPoint );

						}
						else {

							nextPointL.copy( innerPoint );
							currentPointL.copy( innerPoint );

						}

					}
					else {

						// The segment triangles are generated here if there was overlapping

						makeSegmentTriangles();

					}

					switch ( style.strokeLineJoin ) {

						case 'bevel':

							makeSegmentWithBevelJoin( joinIsOnLeftSide, innerSideModified, u1 );

							break;

						case 'round':

							// Segment triangles

							createSegmentTrianglesWithMiddleSection( joinIsOnLeftSide, innerSideModified );

							// Join triangles

							if ( joinIsOnLeftSide ) {

								makeCircularSector( currentPoint, currentPointL, nextPointL, u1, 0 );

							}
							else {

								makeCircularSector( currentPoint, nextPointR, currentPointR, u1, 1 );

							}

							break;

						case 'miter':
						case 'miter-clip':
						default:

							var miterFraction = ( strokeWidth2 * style.strokeMiterLimit ) / miterLength2;

							if ( miterFraction < 1 ) {

								// The join miter length exceeds the miter limit

								if ( style.strokeLineJoin !== 'miter-clip' ) {

									makeSegmentWithBevelJoin( joinIsOnLeftSide, innerSideModified, u1 );
									break;

								}
								else {

									// Segment triangles

									createSegmentTrianglesWithMiddleSection( joinIsOnLeftSide, innerSideModified );

									// Miter-clip join triangles

									if ( joinIsOnLeftSide ) {

										tempV2_6.subVectors( outerPoint, currentPointL ).multiplyScalar( miterFraction ).add( currentPointL );
										tempV2_7.subVectors( outerPoint, nextPointL ).multiplyScalar( miterFraction ).add( nextPointL );

										addVertex( currentPointL, u1, 0 );
										addVertex( tempV2_6, u1, 0 );
										addVertex( currentPoint, u1, 0.5 );

										addVertex( currentPoint, u1, 0.5 );
										addVertex( tempV2_6, u1, 0 );
										addVertex( tempV2_7, u1, 0 );

										addVertex( currentPoint, u1, 0.5 );
										addVertex( tempV2_7, u1, 0 );
										addVertex( nextPointL, u1, 0 );

									}
									else {

										tempV2_6.subVectors( outerPoint, currentPointR ).multiplyScalar( miterFraction ).add( currentPointR );
										tempV2_7.subVectors( outerPoint, nextPointR ).multiplyScalar( miterFraction ).add( nextPointR );

										addVertex( currentPointR, u1, 1 );
										addVertex( tempV2_6, u1, 1 );
										addVertex( currentPoint, u1, 0.5 );

										addVertex( currentPoint, u1, 0.5 );
										addVertex( tempV2_6, u1, 1 );
										addVertex( tempV2_7, u1, 1 );

										addVertex( currentPoint, u1, 0.5 );
										addVertex( tempV2_7, u1, 1 );
										addVertex( nextPointR, u1, 1 );

									}

								}

							}
							else {

								// Miter join segment triangles

								if ( innerSideModified ) {

									// Optimized segment + join triangles

									if ( joinIsOnLeftSide ) {

										addVertex( lastPointR, u0, 1 );
										addVertex( lastPointL, u0, 0 );
										addVertex( outerPoint, u1, 0 );

										addVertex( lastPointR, u0, 1 );
										addVertex( outerPoint, u1, 0 );
										addVertex( innerPoint, u1, 1 );

									}
									else {

										addVertex( lastPointR, u0, 1 );
										addVertex( lastPointL, u0, 0 );
										addVertex( outerPoint, u1, 1 );

										addVertex( lastPointL, u0, 0 );
										addVertex( innerPoint, u1, 0 );
										addVertex( outerPoint, u1, 1 );

									}


									if ( joinIsOnLeftSide ) {

										nextPointL.copy( outerPoint );

									}
									else {

										nextPointR.copy( outerPoint );

									}


								}
								else {

									// Add extra miter join triangles

									if ( joinIsOnLeftSide ) {

										addVertex( currentPointL, u1, 0 );
										addVertex( outerPoint, u1, 0 );
										addVertex( currentPoint, u1, 0.5 );

										addVertex( currentPoint, u1, 0.5 );
										addVertex( outerPoint, u1, 0 );
										addVertex( nextPointL, u1, 0 );

									}
									else {

										addVertex( currentPointR, u1, 1 );
										addVertex( outerPoint, u1, 1 );
										addVertex( currentPoint, u1, 0.5 );

										addVertex( currentPoint, u1, 0.5 );
										addVertex( outerPoint, u1, 1 );
										addVertex( nextPointR, u1, 1 );

									}

								}

								isMiter = true;

							}

							break;

					}

				}
				else {

					// The segment triangles are generated here when two consecutive points are collinear

					makeSegmentTriangles();

				}

			}
			else {

				// The segment triangles are generated here if it is the ending segment

				makeSegmentTriangles();

			}

			if ( ! isClosed && iPoint === numPoints - 1 ) {

				// Start line endcap
				addCapGeometry( points[ 0 ], point0L, point0R, joinIsOnLeftSide, true, u0 );

			}

			// Increment loop variables

			u0 = u1;

			previousPoint = currentPoint;

			lastPointL.copy( nextPointL );
			lastPointR.copy( nextPointR );

		}

		if ( ! isClosed ) {

			// Ending line endcap
			addCapGeometry( currentPoint, currentPointL, currentPointR, joinIsOnLeftSide, false, u1 );

		}
		else if ( innerSideModified && vertices ) {

			// Modify path first segment vertices to adjust to the segments inner and outer intersections

			var lastOuter = outerPoint;
			var lastInner = innerPoint;
			if ( initialJoinIsOnLeftSide !== joinIsOnLeftSide) {
				lastOuter = innerPoint;
				lastInner = outerPoint;
			}

			if ( joinIsOnLeftSide ) {

				lastInner.toArray( vertices, 0 * 3 );
				lastInner.toArray( vertices, 3 * 3 );

				if ( isMiter ) {

					lastOuter.toArray( vertices, 1 * 3 );
				}

			}
			else {

				lastInner.toArray( vertices, 1 * 3 );
				lastInner.toArray( vertices, 3 * 3 );

				if ( isMiter ) {

					lastOuter.toArray( vertices, 0 * 3 );
				}

			}

		}

		return numVertices;

		// -- End of algorithm

		// -- Functions

		function getNormal( p1, p2, result ) {

			result.subVectors( p2, p1 );
			return result.set( - result.y, result.x ).normalize();

		}

		function addVertex( position, u, v ) {

			if ( vertices ) {

				vertices[ currentCoordinate ] = position.x;
				vertices[ currentCoordinate + 1 ] = position.y;
				vertices[ currentCoordinate + 2 ] = 0;

				normals[ currentCoordinate ] = 0;
				normals[ currentCoordinate + 1 ] = 0;
				normals[ currentCoordinate + 2 ] = 1;

				uvs[ currentCoordinateUV ] = u;
				uvs[ currentCoordinateUV + 1 ] = v;

				currentCoordinate += 3;
				currentCoordinateUV += 2;

			}

			numVertices += 3;

		}

		function makeCircularSector( center, p1, p2, u, v ) {

			// param p1, p2: Points in the circle arc.
			// p1 and p2 are in clockwise direction.

			tempV2_1.copy( p1 ).sub( center ).normalize();
			tempV2_2.copy( p2 ).sub( center ).normalize();

			var angle = Math.PI;
			var dot = tempV2_1.dot( tempV2_2 );
			if ( Math.abs( dot ) < 1 ) angle = Math.abs( Math.acos( dot ) );

			angle /= arcLengthDivisions;

			tempV2_3.copy( p1 );

			for ( var i = 0, il = arcLengthDivisions - 1; i < il; i++ ) {

				tempV2_4.copy( tempV2_3 ).rotateAround( center, angle );

				addVertex( tempV2_3, u, v );
				addVertex( tempV2_4, u, v );
				addVertex( center, u, 0.5 );

				tempV2_3.copy( tempV2_4 );
			}

			addVertex( tempV2_4, u, v );
			addVertex( p2, u, v );
			addVertex( center, u, 0.5 );

		}

		function makeSegmentTriangles() {

			addVertex( lastPointR, u0, 1 );
			addVertex( lastPointL, u0, 0 );
			addVertex( currentPointL, u1, 0 );

			addVertex( lastPointR, u0, 1 );
			addVertex( currentPointL, u1, 1 );
			addVertex( currentPointR, u1, 0 );

		}

		function makeSegmentWithBevelJoin( joinIsOnLeftSide, innerSideModified, u ) {

			if ( innerSideModified ) {

				// Optimized segment + bevel triangles

				if ( joinIsOnLeftSide ) {

					// Path segments triangles

					addVertex( lastPointR, u0, 1 );
					addVertex( lastPointL, u0, 0 );
					addVertex( currentPointL, u1, 0 );

					addVertex( lastPointR, u0, 1 );
					addVertex( currentPointL, u1, 0 );
					addVertex( innerPoint, u1, 1 );

					// Bevel join triangle

					addVertex( currentPointL, u, 0 );
					addVertex( nextPointL, u, 0 );
					addVertex( innerPoint, u, 0.5 );

				}
				else {

					// Path segments triangles

					addVertex( lastPointR, u0, 1 );
					addVertex( lastPointL, u0, 0 );
					addVertex( currentPointR, u1, 1 );

					addVertex( lastPointL, u0, 0 );
					addVertex( innerPoint, u1, 0 );
					addVertex( currentPointR, u1, 1 );

					// Bevel join triangle

					addVertex( currentPointR, u, 1 );
					addVertex( nextPointR, u, 0 );
					addVertex( innerPoint, u, 0.5 );

				}

			}
			else {

				// Bevel join triangle. The segment triangles are done in the main loop

				if ( joinIsOnLeftSide ) {

					addVertex( currentPointL, u, 0 );
					addVertex( nextPointL, u, 0 );
					addVertex( currentPoint, u, 0.5 );

				}
				else {

					addVertex( currentPointR, u, 1 );
					addVertex( nextPointR, u, 0 );
					addVertex( currentPoint, u, 0.5 );

				}

			}

		}

		function createSegmentTrianglesWithMiddleSection( joinIsOnLeftSide, innerSideModified ) {

			if ( innerSideModified ) {

				if ( joinIsOnLeftSide ) {

					addVertex( lastPointR, u0, 1 );
					addVertex( lastPointL, u0, 0 );
					addVertex( currentPointL, u1, 0 );

					addVertex( lastPointR, u0, 1 );
					addVertex( currentPointL, u1, 0 );
					addVertex( innerPoint, u1, 1 );

					addVertex( currentPointL, u0, 0 );
					addVertex( currentPoint, u1, 0.5 );
					addVertex( innerPoint, u1, 1 );

					addVertex( currentPoint, u1, 0.5 );
					addVertex( nextPointL, u0, 0 );
					addVertex( innerPoint, u1, 1 );

				}
				else {

					addVertex( lastPointR, u0, 1 );
					addVertex( lastPointL, u0, 0 );
					addVertex( currentPointR, u1, 1 );

					addVertex( lastPointL, u0, 0 );
					addVertex( innerPoint, u1, 0 );
					addVertex( currentPointR, u1, 1 );

					addVertex( currentPointR, u0, 1 );
					addVertex( innerPoint, u1, 0 );
					addVertex( currentPoint, u1, 0.5 );

					addVertex( currentPoint, u1, 0.5 );
					addVertex( innerPoint, u1, 0 );
					addVertex( nextPointR, u0, 1 );

				}

			}

		}

		function addCapGeometry( center, p1, p2, joinIsOnLeftSide, start, u ) {

			// param center: End point of the path
			// param p1, p2: Left and right cap points

			switch ( style.strokeLineCap ) {

				case 'round':

					if ( start ) {

						makeCircularSector( center, p2, p1, u, 0.5 );

					}
					else {

						makeCircularSector( center, p1, p2, u, 0.5 );

					}

					break;

				case 'square':

					if ( start ) {

						tempV2_1.subVectors( p1, center );
						tempV2_2.set( tempV2_1.y, - tempV2_1.x );

						tempV2_3.addVectors( tempV2_1, tempV2_2 ).add( center );
						tempV2_4.subVectors( tempV2_2, tempV2_1 ).add( center );

						// Modify already existing vertices
						if ( joinIsOnLeftSide ) {

							tempV2_3.toArray( vertices, 1 * 3 );
							tempV2_4.toArray( vertices, 0 * 3 );
							tempV2_4.toArray( vertices, 3 * 3 );

						}
						else {

							tempV2_3.toArray( vertices, 1 * 3 );
							tempV2_3.toArray( vertices, 3 * 3 );
							tempV2_4.toArray( vertices, 0 * 3 );

						}

					}
					else {

						tempV2_1.subVectors( p2, center );
						tempV2_2.set( tempV2_1.y, - tempV2_1.x );

						tempV2_3.addVectors( tempV2_1, tempV2_2 ).add( center );
						tempV2_4.subVectors( tempV2_2, tempV2_1 ).add( center );

						var vl = vertices.length;

						// Modify already existing vertices
						if ( joinIsOnLeftSide ) {

							tempV2_3.toArray( vertices, vl - 1 * 3 );
							tempV2_4.toArray( vertices, vl - 2 * 3 );
							tempV2_4.toArray( vertices, vl - 4 * 3 );

						}
						else {

							tempV2_3.toArray( vertices, vl - 2 * 3 );
							tempV2_4.toArray( vertices, vl - 1 * 3 );
							tempV2_4.toArray( vertices, vl - 4 * 3 );

						}

					}

					break;

				case 'butt':
				default:

					// Nothing to do here
					break;

			}

		}

		function removeDuplicatedPoints( points ) {

			// Creates a new array if necessary with duplicated points removed.
			// This does not remove duplicated initial and ending points of a closed path.

			var dupPoints = false;
			for ( var i = 1, n = points.length - 1; i < n; i ++ ) {

				if ( points[ i ].distanceTo( points[ i + 1 ] ) < minDistance ) {

					dupPoints = true;
					break;

				}

			}

			if ( ! dupPoints ) return points;

			var newPoints = [];
			newPoints.push( points[ 0 ] );

			for ( var i = 1, n = points.length - 1; i < n; i ++ ) {

				if ( points[ i ].distanceTo( points[ i + 1 ] ) >= minDistance ) {

					newPoints.push( points[ i ] );

				}
			}

			newPoints.push( points[ points.length - 1 ] );

			return newPoints;

		}
	};

}();
