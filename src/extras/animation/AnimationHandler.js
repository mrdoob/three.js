/**
 * @author mikael emtinger / http://gomo.se/
 */

var Quaternion = require( "../../math/Quaternion" ),
	SkinnedMesh = require( "../../objects/SkinnedMesh" );

module.exports = {

	LINEAR: 0,
	CATMULLROM: 1,
	CATMULLROM_FORWARD: 2,

	//

	add: function () { console.warn( "AnimationHandler.add() has been deprecated." ); },
	get: function () { console.warn( "AnimationHandler.get() has been deprecated." ); },
	remove: function () { console.warn( "AnimationHandler.remove() has been deprecated." ); },

	//

	animations: [],

	init: function ( data ) {

		var h, k, m,
			morphTargetName, usedMorphTargets,
			quat, influences;

		if ( data.initialized === true ) { return data; }

		// loop through all keys

		for ( h = 0; h < data.hierarchy.length; h ++ ) {

			for ( k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				// remove minus times

				if ( data.hierarchy[ h ].keys[ k ].time < 0 ) {

					 data.hierarchy[ h ].keys[ k ].time = 0;

				}

				// create quaternions

				if ( data.hierarchy[ h ].keys[ k ].rot !== undefined &&
				  ! ( data.hierarchy[ h ].keys[ k ].rot instanceof Quaternion ) ) {

					quat = data.hierarchy[ h ].keys[ k ].rot;
					data.hierarchy[ h ].keys[ k ].rot = new Quaternion().fromArray( quat );

				}

			}

			// prepare morph target keys

			if ( data.hierarchy[ h ].keys.length && data.hierarchy[ h ].keys[ 0 ].morphTargets !== undefined ) {

				// get all used

				usedMorphTargets = {};

				for ( k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					for ( m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

						morphTargetName = data.hierarchy[ h ].keys[ k ].morphTargets[ m ];
						usedMorphTargets[ morphTargetName ] = - 1;

					}

				}

				data.hierarchy[ h ].usedMorphTargets = usedMorphTargets;


				// set all used on all frames

				for ( k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

					influences = {};

					for ( morphTargetName in usedMorphTargets ) {

						for ( m = 0; m < data.hierarchy[ h ].keys[ k ].morphTargets.length; m ++ ) {

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

			for ( k = 1; k < data.hierarchy[ h ].keys.length; k ++ ) {

				if ( data.hierarchy[ h ].keys[ k ].time === data.hierarchy[ h ].keys[ k - 1 ].time ) {

					data.hierarchy[ h ].keys.splice( k, 1 );
					k --;

				}

			}


			// set index

			for ( k = 0; k < data.hierarchy[ h ].keys.length; k ++ ) {

				data.hierarchy[ h ].keys[ k ].index = k;

			}

		}

		data.initialized = true;

		return data;

	},

	parse: function ( root ) {

		var parseRecurseHierarchy = function ( root, hierarchy ) {

			hierarchy.push( root );

			for ( var c = 0; c < root.children.length; c ++ ) {

				parseRecurseHierarchy( root.children[ c ], hierarchy );

			}

		};

		// setup hierarchy

		var hierarchy = [];

		if ( root instanceof SkinnedMesh ) {

			for ( var b = 0; b < root.skeleton.bones.length; b ++ ) {

				hierarchy.push( root.skeleton.bones[ b ] );

			}

		} else {

			parseRecurseHierarchy( root, hierarchy );

		}

		return hierarchy;

	},

	play: function ( animation ) {

		if ( this.animations.indexOf( animation ) === - 1 ) {

			this.animations.push( animation );

		}

	},

	stop: function ( animation ) {

		var index = this.animations.indexOf( animation );

		if ( index !== - 1 ) {

			this.animations.splice( index, 1 );

		}

	},

	update: function ( deltaTimeMS ) {

		var i;

		for ( i = 0; i < this.animations.length; i ++ ) {

			this.animations[ i ].resetBlendWeights( );

		}

		for ( i = 0; i < this.animations.length; i ++ ) {

			this.animations[ i ].update( deltaTimeMS );

		}

	}

};
