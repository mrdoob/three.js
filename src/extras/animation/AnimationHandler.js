/**
 * @author mikael emtinger / http://gomo.se/
 */

THREE.AnimationHandler = ( function () {

	var playing = [];
	var library = {};
	var that    = {};

	that.update = function ( deltaTimeMS ) {

		for ( var i = 0; i < playing.length; i ++ ) {

			playing[ i ].update( deltaTimeMS );

		}

	};

	that.addToUpdate = function ( animation ) {

		if ( playing.indexOf( animation ) === -1 ) {

			playing.push( animation );

		}

	};

	that.removeFromUpdate = function ( animation ) {

		var index = playing.indexOf( animation );

		if ( index !== -1 ) {

			playing.splice( index, 1 );

		}

	};

	that.add = function ( data ) {

		if ( library[ data.name ] !== undefined ) {

			console.log( "THREE.AnimationHandler.add: Warning! " + data.name + " already exists in library. Overwriting." );

		}

		library[ data.name ] = data;
		initData( data );

	};

	that.remove = function ( name ) {

		if ( library[ name ] === undefined ) {

			console.log( "THREE.AnimationHandler.add: Warning! " + name + " doesn't exists in library. Doing nothing." );

		}

		library[ name ] = undefined;

	};

	that.get = function ( name ) {

		if ( typeof name === "string" ) {

			if ( library[ name ] ) {

				return library[ name ];

			} else {

				return null;

			}

		} else {

			// todo: add simple tween library

		}

	};

	that.parse = function ( root ) {

		// setup hierarchy

		var hierarchy = [];

		if ( root instanceof THREE.SkinnedMesh ) {

			for ( var b = 0; b < root.skeleton.bones.length; b++ ) {

				hierarchy.push( root.skeleton.bones[ b ] );

			}

		} else {

			parseRecurseHierarchy( root, hierarchy );

		}

		return hierarchy;

	};

	var parseRecurseHierarchy = function ( root, hierarchy ) {

		hierarchy.push( root );

		for ( var c = 0; c < root.children.length; c++ )
			parseRecurseHierarchy( root.children[ c ], hierarchy );

	}

	var initData = function ( data ) {

		if ( data.initialized === true )
			return;


		// loop through all keys

		for ( var h = 0; h < data.hierarchy.length; h ++ ) {

			for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				// remove minus times

				if ( data.hierarchy[ h ].keys[ k ].time < 0 ) {

					 data.hierarchy[ h ].keys[ k ].time = 0;

				}

				// create quaternions

				if ( data.hierarchy[ h ].keys[ k ].rot !== undefined &&
				  !( data.hierarchy[ h ].keys[ k ].rot instanceof THREE.Quaternion ) ) {

					var quat = data.hierarchy[ h ].keys[ k ].rot;
					data.hierarchy[ h ].keys[ k ].rot = new THREE.Quaternion().fromArray( quat );

				}

			}

			// prepare morph target keys

			if ( data.hierarchy[ h ].keys.length && data.hierarchy[ h ].keys[ 0 ].morphTargets !== undefined ) {

				// get all used

				var usedMorphTargets = {};

				for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					for ( var m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

						var morphTargetName = data.hierarchy[ h ].keys[ k ].morphTargets[ m ];
						usedMorphTargets[ morphTargetName ] = -1;

					}

				}

				data.hierarchy[ h ].usedMorphTargets = usedMorphTargets;


				// set all used on all frames

				for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					var influences = {};

					for ( var morphTargetName in usedMorphTargets ) {

						for ( var m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

							if ( data.hierarchy[ h ].keys[ k ].morphTargets[ m ] === morphTargetName ) {

								influences[ morphTargetName ] = data.hierarchy[ h ].keys[ k ].morphTargetsInfluences[ m ];
								break;

							}

						}

						if ( m === data.hierarchy[ h ].keys[ k ].morphTargets.length ) {

							influences[ morphTargetName ] = 0;

						}

					}

					data.hierarchy[ h ].keys[ k ].morphTargetsInfluences = influences;

				}

			}


			// remove all keys that are on the same time

			for ( var k = 1; k < data.hierarchy[ h ].keys.length; k ++ ) {

				if ( data.hierarchy[ h ].keys[ k ].time === data.hierarchy[ h ].keys[ k - 1 ].time ) {

					data.hierarchy[ h ].keys.splice( k, 1 );
					k --;

				}

			}


			// set index

			for ( var k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				data.hierarchy[ h ].keys[ k ].index = k;

			}

		}

		data.initialized = true;

	};


	// interpolation types

	that.LINEAR = 0;
	that.CATMULLROM = 1;
	that.CATMULLROM_FORWARD = 2;

	return that;

}() );
