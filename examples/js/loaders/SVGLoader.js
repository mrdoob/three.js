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

		function parseNodes( nodes ) {

			for ( var i = 0; i < nodes.length; i ++ ) {

				parseNode( nodes[ i ] );

			}

		}

		function parseNode( node ) {

			if ( node.nodeType !== 1 ) return;

			switch ( node.nodeName ) {

				case 'svg':
					break;

				case 'g':
					break;

				case 'path':
					paths.push( parsePathNode( node ) );
					break;

				case 'rect':
					paths.push( parseRectNode( node ) );
					break;

				case 'polygon':
					paths.push( parsePolygonNode( node ) );
					break;

				case 'polyline':
					paths.push( parsePolylineNode( node ) );
					break;

				case 'circle':
					paths.push( parseCircleNode( node ) );
					break;

				case 'ellipse':
					paths.push( parseEllipseNode( node ) );
					break;

				case 'line':
					paths.push( parseLineNode( node ) );
					break;

				default:
					console.log( node );

			}

			parseNodes( node.childNodes );

		}

		function parsePathNode( node ) {

			var path = new THREE.ShapePath();
			var point = new THREE.Vector2();
			var control = new THREE.Vector2();

			var d = node.getAttribute( 'd' );

			// console.log( d );

			var commands = d.match( /[a-df-z][^a-df-z]*/ig );

			for ( var i = 0; i < commands.length; i ++ ) {

				var command = commands[ i ];

				var type = command.charAt( 0 );
				var data = command.substr( 1 );

				switch ( type ) {

					case 'M':
						var numbers = parseFloats( data );
						point.fromArray( numbers );
						control.x = point.x;
						control.y = point.y;
						path.moveTo( point.x, point.y );
						break;

					case 'H':
						var numbers = parseFloats( data );
						point.x = numbers[ 0 ];
						control.x = point.x;
						control.y = point.y;
						path.lineTo( point.x, point.y );
						break;

					case 'V':
						var numbers = parseFloats( data );
						point.y = numbers[ 0 ];
						control.x = point.x;
						control.y = point.y;
						path.lineTo( point.x, point.y );
						break;

					case 'L':
						var numbers = parseFloats( data );
						point.x = numbers[ 0 ];
						point.y = numbers[ 1 ];
						control.x = point.x;
						control.y = point.y;
						path.lineTo( point.x, point.y );
						break;

					case 'C':
						var numbers = parseFloats( data );
						path.bezierCurveTo(
							numbers[ 0 ],
							numbers[ 1 ],
							numbers[ 2 ],
							numbers[ 3 ],
							numbers[ 4 ],
							numbers[ 5 ],
						);
						control.x = numbers[ 2 ];
						control.y = numbers[ 3 ];
						point.x = numbers[ 4 ];
						point.y = numbers[ 5 ];
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
						// TODO:
						break;

					case 'm':
						var numbers = parseFloats( data );
						point.x += numbers[ 0 ];
						point.y += numbers[ 1 ];
						control.x = point.x;
						control.y = point.y;
						path.moveTo( point.x, point.y );
						break;

					case 'h':
						var numbers = parseFloats( data );
						point.x += numbers[ 0 ];
						control.x = point.x;
						control.y = point.y;
						path.lineTo( point.x, point.y );
						break;

					case 'v':
						var numbers = parseFloats( data );
						point.y += numbers[ 0 ];
						control.x = point.x;
						control.y = point.y;
						path.lineTo( point.x, point.y );
						break;

					case 'l':
						var numbers = parseFloats( data );
						point.x += numbers[ 0 ];
						point.y += numbers[ 1 ];
						control.x = point.x;
						control.y = point.y;
						path.lineTo( point.x, point.y );
						break;

					case 'c':
						var numbers = parseFloats( data );
						path.bezierCurveTo(
							point.x + numbers[ 0 ],
							point.y + numbers[ 1 ],
							point.x + numbers[ 2 ],
							point.y + numbers[ 3 ],
							point.x + numbers[ 4 ],
							point.y + numbers[ 5 ],
						);
						point.x += numbers[ 4 ];
						point.y += numbers[ 5 ];
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
						// TODO:
						break;

					case 'Z':
					case 'z':
						path.currentPath.autoClose = true;
						break;

					default:
						console.log( command );

				}

			}

			return path;

		}

		function parseRectNode( node ) {

			var x = parseFloat( node.getAttribute( 'x' ) );
			var y = parseFloat( node.getAttribute( 'y' ) );
			var w = parseFloat( node.getAttribute( 'width' ) );
			var h = parseFloat( node.getAttribute( 'height' ) );

			var path = new THREE.ShapePath();
			path.moveTo( x, y );
			path.lineTo( x + w, y );
			path.lineTo( x + w, y + h );
			path.lineTo( x, y + h );
			return path;

		}

		function parsePolygonNode( node ) {

			function iterator( match, a, b ) {

				var x = parseFloat( a );
				var y = parseFloat( b );

				if ( index === 0 ) {
					path.moveTo( x, y );
				} else {
					path.lineTo( x, y );
				}

				index++;

			}

			var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;
			var path = new THREE.ShapePath();
			var index = 0;

			node.getAttribute( 'points' ).replace(regex, iterator);

			path.currentPath.autoClose = true;

			return path;

		}

		function parsePolylineNode( node ) {

			function iterator( match, a, b ) {

				var x = parseFloat( a );
				var y = parseFloat( b );

				if ( index === 0 ) {
					path.moveTo( x, y );
				} else {
					path.lineTo( x, y );
				}

				index++;

			}

			var regex = /(-?[\d\.?]+)[,|\s](-?[\d\.?]+)/g;
			var path = new THREE.ShapePath();
			var index = 0;

			node.getAttribute( 'points' ).replace(regex, iterator);

			path.currentPath.autoClose = false;

			return path;

		}

		function parseCircleNode( node ) {

			var x = parseFloat( node.getAttribute( 'cx' ) );
			var y = parseFloat( node.getAttribute( 'cy' ) );
			var r = parseFloat( node.getAttribute( 'r' ) );

			var path = new THREE.ShapePath();

			path.currentPath.absarc( x, y, r, 0, Math.PI * 2 );

			return path;

		}

		function parseEllipseNode( node ) {

			var x = parseFloat( node.getAttribute( 'cx' ) );
			var y = parseFloat( node.getAttribute( 'cy' ) );
			var rx = parseFloat( node.getAttribute( 'rx' ) );
			var ry = parseFloat( node.getAttribute( 'ry' ) );

			var path = new THREE.ShapePath();

			path.currentPath.absellipse( x, y, rx, ry, 0, Math.PI * 2 );

			return path;

		}

		function parseLineNode( node ) {

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

		var xml = new DOMParser().parseFromString( text, 'image/svg+xml' ); // application/xml

		var svg = xml.documentElement;

		var paths = [];

		parseNode( svg );

		return paths;

	}

};
