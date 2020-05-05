/**
 * @author herzig / http://github.com/herzig
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Description: reads BVH files and outputs a single THREE.Skeleton and an THREE.AnimationClip
 *
 * Currently only supports bvh files containing a single root.
 *
 */

THREE.BVHLoader = function ( manager ) {

	THREE.Loader.call( this, manager );

	this.animateBonePositions = true;
	this.animateBoneRotations = true;

};

THREE.BVHLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: THREE.BVHLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( text ) {

		/*
			reads a string array (lines) from a BVH file
			and outputs a skeleton structure including motion data

			returns thee root node:
			{ name: '', channels: [], children: [] }
		*/
		function readBvh( lines ) {

			// read model structure

			if ( nextLine( lines ) !== 'HIERARCHY' ) {

				console.error( 'THREE.BVHLoader: HIERARCHY expected.' );

			}

			var list = []; // collects flat array of all bones
			var root = readNode( lines, nextLine( lines ), list );

			// read motion data

			if ( nextLine( lines ) !== 'MOTION' ) {

				console.error( 'THREE.BVHLoader: MOTION expected.' );

			}

			// number of frames

			var tokens = nextLine( lines ).split( /[\s]+/ );
			var numFrames = parseInt( tokens[ 1 ] );

			if ( isNaN( numFrames ) ) {

				console.error( 'THREE.BVHLoader: Failed to read number of frames.' );

			}

			// frame time

			tokens = nextLine( lines ).split( /[\s]+/ );
			var frameTime = parseFloat( tokens[ 2 ] );

			if ( isNaN( frameTime ) ) {

				console.error( 'THREE.BVHLoader: Failed to read frame time.' );

			}

			// read frame data line by line

			for ( var i = 0; i < numFrames; i ++ ) {

				tokens = nextLine( lines ).split( /[\s]+/ );
				readFrameData( tokens, i * frameTime, root );

			}

			return list;

		}

		/*
			Recursively reads data from a single frame into the bone hierarchy.
			The passed bone hierarchy has to be structured in the same order as the BVH file.
			keyframe data is stored in bone.frames.

			- data: splitted string array (frame values), values are shift()ed so
			this should be empty after parsing the whole hierarchy.
			- frameTime: playback time for this keyframe.
			- bone: the bone to read frame data from.
		*/
		function readFrameData( data, frameTime, bone ) {

			// end sites have no motion data

			if ( bone.type === 'ENDSITE' ) return;

			// add keyframe

			var keyframe = {
				time: frameTime,
				position: new THREE.Vector3(),
				rotation: new THREE.Quaternion()
			};

			bone.frames.push( keyframe );

			var quat = new THREE.Quaternion();

			var vx = new THREE.Vector3( 1, 0, 0 );
			var vy = new THREE.Vector3( 0, 1, 0 );
			var vz = new THREE.Vector3( 0, 0, 1 );

			// parse values for each channel in node

			for ( var i = 0; i < bone.channels.length; i ++ ) {

				switch ( bone.channels[ i ] ) {

					case 'Xposition':
						keyframe.position.x = parseFloat( data.shift().trim() );
						break;
					case 'Yposition':
						keyframe.position.y = parseFloat( data.shift().trim() );
						break;
					case 'Zposition':
						keyframe.position.z = parseFloat( data.shift().trim() );
						break;
					case 'Xrotation':
						quat.setFromAxisAngle( vx, parseFloat( data.shift().trim() ) * Math.PI / 180 );
						keyframe.rotation.multiply( quat );
						break;
					case 'Yrotation':
						quat.setFromAxisAngle( vy, parseFloat( data.shift().trim() ) * Math.PI / 180 );
						keyframe.rotation.multiply( quat );
						break;
					case 'Zrotation':
						quat.setFromAxisAngle( vz, parseFloat( data.shift().trim() ) * Math.PI / 180 );
						keyframe.rotation.multiply( quat );
						break;
					default:
						console.warn( 'THREE.BVHLoader: Invalid channel type.' );

				}

			}

			// parse child nodes

			for ( var i = 0; i < bone.children.length; i ++ ) {

				readFrameData( data, frameTime, bone.children[ i ] );

			}

		}

		/*
		 Recursively parses the HIERACHY section of the BVH file

		 - lines: all lines of the file. lines are consumed as we go along.
		 - firstline: line containing the node type and name e.g. 'JOINT hip'
		 - list: collects a flat list of nodes

		 returns: a BVH node including children
		*/
		function readNode( lines, firstline, list ) {

			var node = { name: '', type: '', frames: [] };
			list.push( node );

			// parse node type and name

			var tokens = firstline.split( /[\s]+/ );

			if ( tokens[ 0 ].toUpperCase() === 'END' && tokens[ 1 ].toUpperCase() === 'SITE' ) {

				node.type = 'ENDSITE';
				node.name = 'ENDSITE'; // bvh end sites have no name

			} else {

				node.name = tokens[ 1 ];
				node.type = tokens[ 0 ].toUpperCase();

			}

			if ( nextLine( lines ) !== '{' ) {

				console.error( 'THREE.BVHLoader: Expected opening { after type & name' );

			}

			// parse OFFSET

			tokens = nextLine( lines ).split( /[\s]+/ );

			if ( tokens[ 0 ] !== 'OFFSET' ) {

				console.error( 'THREE.BVHLoader: Expected OFFSET but got: ' + tokens[ 0 ] );

			}

			if ( tokens.length !== 4 ) {

				console.error( 'THREE.BVHLoader: Invalid number of values for OFFSET.' );

			}

			var offset = new THREE.Vector3(
				parseFloat( tokens[ 1 ] ),
				parseFloat( tokens[ 2 ] ),
				parseFloat( tokens[ 3 ] )
			);

			if ( isNaN( offset.x ) || isNaN( offset.y ) || isNaN( offset.z ) ) {

				console.error( 'THREE.BVHLoader: Invalid values of OFFSET.' );

			}

			node.offset = offset;

			// parse CHANNELS definitions

			if ( node.type !== 'ENDSITE' ) {

				tokens = nextLine( lines ).split( /[\s]+/ );

				if ( tokens[ 0 ] !== 'CHANNELS' ) {

					console.error( 'THREE.BVHLoader: Expected CHANNELS definition.' );

				}

				var numChannels = parseInt( tokens[ 1 ] );
				node.channels = tokens.splice( 2, numChannels );
				node.children = [];

			}

			// read children

			while ( true ) {

				var line = nextLine( lines );

				if ( line === '}' ) {

					return node;

				} else {

					node.children.push( readNode( lines, line, list ) );

				}

			}

		}

		/*
			recursively converts the internal bvh node structure to a THREE.Bone hierarchy

			source: the bvh root node
			list: pass an empty array, collects a flat list of all converted THREE.Bones

			returns the root THREE.Bone
		*/
		function toTHREEBone( source, list ) {

			var bone = new THREE.Bone();
			list.push( bone );

			bone.position.add( source.offset );
			bone.name = source.name;

			if ( source.type !== 'ENDSITE' ) {

				for ( var i = 0; i < source.children.length; i ++ ) {

					bone.add( toTHREEBone( source.children[ i ], list ) );

				}

			}

			return bone;

		}

		/*
			builds a THREE.AnimationClip from the keyframe data saved in each bone.

			bone: bvh root node

			returns: a THREE.AnimationClip containing position and quaternion tracks
		*/
		function toTHREEAnimation( bones ) {

			var tracks = [];

			// create a position and quaternion animation track for each node

			for ( var i = 0; i < bones.length; i ++ ) {

				var bone = bones[ i ];

				if ( bone.type === 'ENDSITE' )
					continue;

				// track data

				var times = [];
				var positions = [];
				var rotations = [];

				for ( var j = 0; j < bone.frames.length; j ++ ) {

					var frame = bone.frames[ j ];

					times.push( frame.time );

					// the animation system animates the position property,
					// so we have to add the joint offset to all values

					positions.push( frame.position.x + bone.offset.x );
					positions.push( frame.position.y + bone.offset.y );
					positions.push( frame.position.z + bone.offset.z );

					rotations.push( frame.rotation.x );
					rotations.push( frame.rotation.y );
					rotations.push( frame.rotation.z );
					rotations.push( frame.rotation.w );

				}

				if ( scope.animateBonePositions ) {

					tracks.push( new THREE.VectorKeyframeTrack( '.bones[' + bone.name + '].position', times, positions ) );

				}

				if ( scope.animateBoneRotations ) {

					tracks.push( new THREE.QuaternionKeyframeTrack( '.bones[' + bone.name + '].quaternion', times, rotations ) );

				}

			}

			return new THREE.AnimationClip( 'animation', - 1, tracks );

		}

		/*
			returns the next non-empty line in lines
		*/
		function nextLine( lines ) {

			var line;
			// skip empty lines
			while ( ( line = lines.shift().trim() ).length === 0 ) { }

			return line;

		}

		var scope = this;

		var lines = text.split( /[\r\n]+/g );

		var bones = readBvh( lines );

		var threeBones = [];
		toTHREEBone( bones[ 0 ], threeBones );

		var threeClip = toTHREEAnimation( bones );

		return {
			skeleton: new THREE.Skeleton( threeBones ),
			clip: threeClip
		};

	}

} );
