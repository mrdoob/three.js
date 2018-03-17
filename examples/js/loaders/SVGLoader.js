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

				default:
					console.log( node );
					break;

			}

			parseNodes( node.childNodes );

		}

		function parsePathNode( node ) {

			var path = new THREE.ShapePath();
			var point = new THREE.Vector2();

			var d = node.getAttribute( 'd' );

			console.log( d );

			var commands = d.match( /[a-df-z][^a-df-z]*/ig );

			for ( var i = 0; i < commands.length; i ++ ) {

				var command = commands[ i ];

				var type = command.charAt( 0 );
				var data = command.substr( 1 );

				switch ( type ) {

					case 'M':
						var numbers = parseFloats( data );
						point.fromArray( numbers );
						path.moveTo( point.x, point.y );
						break;

					case 'H':
						var numbers = parseFloats( data );
						point.x = numbers[ 0 ];
						path.lineTo( point.x, point.y );
						break;

					case 'V':
						var numbers = parseFloats( data );
						point.y = numbers[ 0 ];
						path.lineTo( point.x, point.y );
						break;

					case 'L':
						var numbers = parseFloats( data );
						point.x = numbers[ 0 ];
						point.y = numbers[ 1 ];
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
						point.x = numbers[ 4 ];
						point.y = numbers[ 5 ];
						break;

					case 'h':
						var numbers = parseFloats( data );
						point.x += numbers[ 0 ];
						path.lineTo( point.x, point.y );
						break;

					case 'v':
						var numbers = parseFloats( data );
						point.y += numbers[ 0 ];
						path.lineTo( point.x, point.y );
						break;

					case 'l':
						var numbers = parseFloats( data );
						point.x += numbers[ 0 ];
						point.y += numbers[ 1 ];
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

					case 'Z':
					case 'z':
						path.currentPath.autoClose = true;
						break;

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
