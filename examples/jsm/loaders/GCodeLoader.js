import {
	BufferGeometry,
	FileLoader,
	Float32BufferAttribute,
	Group,
	LineBasicMaterial,
	LineSegments,
	Loader
} from 'three';

/**
 * A loader for the GCode format.
 *
 * GCode files are usually used for 3D printing or CNC applications.
 *
 * ```js
 * const loader = new GCodeLoader();
 * const object = await loader.loadAsync( 'models/gcode/benchy.gcode' );
 * scene.add( object );
 * ```
 *
 * @augments Loader
 */
class GCodeLoader extends Loader {

	/**
	 * Constructs a new GCode loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Whether to split layers or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.splitLayer = false;

	}

	/**
	 * Starts loading from the given URL and passes the loaded GCode asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Group)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given GCode data and returns a group with lines.
	 *
	 * @param {string} data - The raw Gcode data as a string.
	 * @return {Group} The parsed GCode asset.
	 */
	parse( data ) {

		let state = { x: 0, y: 0, z: 0, e: 0, f: 0, extruding: false, relative: false };
		const layers = [];

		let currentLayer = undefined;

		const pathMaterial = new LineBasicMaterial( { color: 0xFF0000 } );
		pathMaterial.name = 'path';

		const extrudingMaterial = new LineBasicMaterial( { color: 0x00FF00 } );
		extrudingMaterial.name = 'extruded';

		function newLayer( line ) {

			currentLayer = { vertex: [], pathVertex: [], z: line.z };
			layers.push( currentLayer );

		}

		//Create lie segment between p1 and p2
		function addSegment( p1, p2 ) {

			if ( currentLayer === undefined ) {

				newLayer( p1 );

			}

			if ( state.extruding ) {

				currentLayer.vertex.push( p1.x, p1.y, p1.z );
				currentLayer.vertex.push( p2.x, p2.y, p2.z );

			} else {

				currentLayer.pathVertex.push( p1.x, p1.y, p1.z );
				currentLayer.pathVertex.push( p2.x, p2.y, p2.z );

			}

		}

		function delta( v1, v2 ) {

			return state.relative ? v2 : v2 - v1;

		}

		function absolute( v1, v2 ) {

			return state.relative ? v1 + v2 : v2;

		}

		const lines = data.replace( /;.+/g, '' ).split( '\n' );

		for ( let i = 0; i < lines.length; i ++ ) {

			const tokens = lines[ i ].split( ' ' );
			const cmd = tokens[ 0 ].toUpperCase();

			//Arguments
			const args = {};
			tokens.splice( 1 ).forEach( function ( token ) {

				if ( token[ 0 ] !== undefined ) {

					const key = token[ 0 ].toLowerCase();
					const value = parseFloat( token.substring( 1 ) );
					args[ key ] = value;

				}

			} );

			//Process commands
			//G0/G1 – Linear Movement
			if ( cmd === 'G0' || cmd === 'G1' ) {

				const line = {
					x: args.x !== undefined ? absolute( state.x, args.x ) : state.x,
					y: args.y !== undefined ? absolute( state.y, args.y ) : state.y,
					z: args.z !== undefined ? absolute( state.z, args.z ) : state.z,
					e: args.e !== undefined ? absolute( state.e, args.e ) : state.e,
					f: args.f !== undefined ? absolute( state.f, args.f ) : state.f,
				};

				//Layer change detection is or made by watching Z, it's made by watching when we extrude at a new Z position
				if ( delta( state.e, line.e ) > 0 ) {

					state.extruding = delta( state.e, line.e ) > 0;

					if ( currentLayer == undefined || line.z != currentLayer.z ) {

						newLayer( line );

					}

				}

				addSegment( state, line );
				state = line;

			} else if ( cmd === 'G2' || cmd === 'G3' ) {

				//G2/G3 - Arc Movement ( G2 clock wise and G3 counter clock wise )
				//console.warn( 'THREE.GCodeLoader: Arc command not supported' );

			} else if ( cmd === 'G90' ) {

				//G90: Set to Absolute Positioning
				state.relative = false;

			} else if ( cmd === 'G91' ) {

				//G91: Set to state.relative Positioning
				state.relative = true;

			} else if ( cmd === 'G92' ) {

				//G92: Set Position
				const line = state;
				line.x = args.x !== undefined ? args.x : line.x;
				line.y = args.y !== undefined ? args.y : line.y;
				line.z = args.z !== undefined ? args.z : line.z;
				line.e = args.e !== undefined ? args.e : line.e;

			} else {

				//console.warn( 'THREE.GCodeLoader: Command not supported:' + cmd );

			}

		}

		function addObject( vertex, extruding, i ) {

			const geometry = new BufferGeometry();
			geometry.setAttribute( 'position', new Float32BufferAttribute( vertex, 3 ) );
			const segments = new LineSegments( geometry, extruding ? extrudingMaterial : pathMaterial );
			segments.name = 'layer' + i;
			object.add( segments );

		}

		const object = new Group();
		object.name = 'gcode';

		if ( this.splitLayer ) {

			for ( let i = 0; i < layers.length; i ++ ) {

				const layer = layers[ i ];
				addObject( layer.vertex, true, i );
				addObject( layer.pathVertex, false, i );

			}

		} else {

			const vertex = [],
				pathVertex = [];

			for ( let i = 0; i < layers.length; i ++ ) {

				const layer = layers[ i ];
				const layerVertex = layer.vertex;
				const layerPathVertex = layer.pathVertex;

				for ( let j = 0; j < layerVertex.length; j ++ ) {

					vertex.push( layerVertex[ j ] );

				}

				for ( let j = 0; j < layerPathVertex.length; j ++ ) {

					pathVertex.push( layerPathVertex[ j ] );

				}

			}

			addObject( vertex, true, layers.length );
			addObject( pathVertex, false, layers.length );

		}

		object.rotation.set( - Math.PI / 2, 0, 0 );

		return object;

	}

}

export { GCodeLoader };
