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

		}

		function parsePathNode( node, style ) {

			var path = new THREE.ShapePath();
			path.color.setStyle( style.fill );

			var point = new THREE.Vector2();
			var control = new THREE.Vector2();

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
							path.moveTo( point.x, point.y );
						}
						break;

					case 'H':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.x = numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
						}
						break;

					case 'V':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.y = numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
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
						}
						break;

					case 'S':
						var numbers = parseFloats( data );
						path.bezierCurveTo(
							getReflection( point.x, control.x ),
							getReflection( point.y, control.y ),
							numbers[ 0 ],
							numbers[ 1 ],
							numbers[ 2 ],
							numbers[ 3 ]
						);
						control.x = numbers[ 0 ];
						control.y = numbers[ 1 ];
						point.x = numbers[ 2 ];
						point.y = numbers[ 3 ];
						break;

					case 'Q':
						var numbers = parseFloats( data );
						path.quadraticCurveTo(
							numbers[ 0 ],
							numbers[ 1 ],
							numbers[ 2 ],
							numbers[ 3 ]
						);
						control.x = numbers[ 0 ];
						control.y = numbers[ 1 ];
						point.x = numbers[ 2 ];
						point.y = numbers[ 3 ];
						break;

					case 'T':
						var numbers = parseFloats( data );
						var rx = getReflection( point.x, control.x );
						var ry = getReflection( point.y, control.y );
						path.quadraticCurveTo(
							rx,
							ry,
							numbers[ 0 ],
							numbers[ 1 ]
						);
						control.x = rx;
						control.y = ry;
						point.x = numbers[ 0 ];
						point.y = numbers[ 1 ];
						break;

					case 'A':
						console.warn( command );
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {
							// TODO
							point.x = numbers[ j + 5 ];
							point.y = numbers[ j + 6 ];
							control.x = point.x;
							control.y = point.y;
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
							path.moveTo( point.x, point.y );
						}
						break;

					case 'h':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.x += numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
						}
						break;

					case 'v':
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j ++ ) {
							point.y += numbers[ j ];
							control.x = point.x;
							control.y = point.y;
							path.lineTo( point.x, point.y );
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
							point.x += numbers[ j + 4 ];
							point.y += numbers[ j + 5 ];
						}
						break;

					case 's':
						var numbers = parseFloats( data );
						path.bezierCurveTo(
							// TODO: Not sure if point needs
							// to be added to reflection...
							getReflection( point.x, control.x ),
							getReflection( point.y, control.y ),
							point.x + numbers[ 0 ],
							point.y + numbers[ 1 ],
							point.x + numbers[ 2 ],
							point.y + numbers[ 3 ]
						);
						control.x = point.x + numbers[ 0 ];
						control.y = point.y + numbers[ 1 ];
						point.x += numbers[ 2 ];
						point.y += numbers[ 3 ];
						break;

					case 'q':
						var numbers = parseFloats( data );
						path.quadraticCurveTo(
							point.x + numbers[ 0 ],
							point.y + numbers[ 1 ],
							point.x + numbers[ 2 ],
							point.y + numbers[ 3 ]
						);
						control.x = point.x + numbers[ 0 ];
						control.y = point.y + numbers[ 1 ];
						point.x += numbers[ 2 ];
						point.y += numbers[ 3 ];
						break;

					case 't':
						var numbers = parseFloats( data );
						var rx = getReflection( point.x, control.x );
						var ry = getReflection( point.y, control.y );
						path.quadraticCurveTo(
							rx,
							ry,
							point.x + numbers[ 0 ],
							point.y + numbers[ 1 ]
						);
						control.x = rx;
						control.y = ry;
						point.x = point.x + numbers[ 0 ];
						point.y = point.y + numbers[ 1 ];
						break;

					case 'a':
						console.warn( command );
						var numbers = parseFloats( data );
						for ( var j = 0, jl = numbers.length; j < jl; j += 7 ) {
							// TODO
							point.x += numbers[ j + 5 ];
							point.y += numbers[ j + 6 ];
							control.x = point.x;
							control.y = point.y;
						}
						break;

					//

					case 'Z':
					case 'z':
						path.currentPath.autoClose = true;
						break;

					default:
						console.warn( command );

				}

				// console.log( type, parseFloats( data ), parseFloats( data ).length  )

			}

			return path;

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
			path.moveTo( x + 2 * rx, y );
			path.lineTo( x + w - 2 * rx, y );
			if ( rx !== 0 || ry !== 0 ) path.bezierCurveTo( x + w, y, x + w, y, x + w, y + 2 * ry );
			path.lineTo( x + w, y + h - 2 * ry );
			if ( rx !== 0 || ry !== 0 ) path.bezierCurveTo( x + w, y + h, x + w, y + h, x + w - 2 * rx, y + h );
			path.lineTo( x + 2 * rx, y + h );

			if ( rx !== 0 || ry !== 0 ) {

				path.bezierCurveTo( x, y + h, x, y + h, x, y + h - 2 * ry );
				path.lineTo( x, y + 2 * ry );
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

			var subpath = new THREE.Path();
			subpath.absarc( x, y, r, 0, Math.PI * 2 );

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

			return 2 * a - ( b - a );

		}

		function parseFloats( string ) {

			var array = string.split( /[\s,]+|(?=\s?[+\-])/ );

			for ( var i = 0; i < array.length; i ++ ) {

				array[ i ] = parseFloat( array[ i ] );

			}

			return array;

		}

		//

		console.log( 'THREE.SVGLoader' );

		var paths = [];

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
