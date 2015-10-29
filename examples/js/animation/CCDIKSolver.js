/**
 * @author takahiro / https://github.com/takahirox
 *
 * CCD Algorithm
 *  https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * mesh.geometry needs to have iks array.
 *
 * ik parameter example
 *
 * ik = {
 *	target: 1,
 *	effector: 2,
 *	links: [ { index: 5 }, { index: 4, limitation: new THREE.Vector3( 1, 0, 0 ) }, { index : 3 } ],
 *	iteration: 10,
 *	minAngle: 0.0,
 *	maxAngle: 1.0,
 * };
 */

THREE.CCDIKSolver = function ( mesh ) {

	this.mesh = mesh;

};

THREE.CCDIKSolver.prototype = {

	constructor: THREE.CCDIKSolver,

	update: function () {

		var effectorVec = new THREE.Vector3();
		var targetVec = new THREE.Vector3();
		var axis = new THREE.Vector3();
		var q = new THREE.Quaternion();

		var bones = this.mesh.skeleton.bones;
		var iks = this.mesh.geometry.iks;

		// for reference overhead reduction in loop
		var math = Math;

		for ( var i = 0, il = iks.length; i < il; i++ ) {

			var ik = iks[ i ];
			var effector = bones[ ik.effector ];
			var target = bones[ ik.target ];
			var targetPos = target.getWorldPosition();
			var links = ik.links;
			var iteration = ik.iteration !== undefined ? ik.iteration : 1;

			for ( var j = 0; j < iteration; j++ ) {

				for ( var k = 0, kl = links.length; k < kl; k++ ) {

					var link = bones[ links[ k ].index ];
					var limitation = links[ k ].limitation;
					var linkPos = link.getWorldPosition();
					var invLinkQ = link.getWorldQuaternion().inverse();
					var effectorPos = effector.getWorldPosition();

					// work in link world
					effectorVec.subVectors( effectorPos, linkPos );
					effectorVec.applyQuaternion( invLinkQ );
					effectorVec.normalize();

					targetVec.subVectors( targetPos, linkPos );
					targetVec.applyQuaternion( invLinkQ );
					targetVec.normalize();

					var angle = targetVec.dot( effectorVec );

					// TODO: continue (or break) the loop for the performance
					//       if no longer needs to rotate (angle > 1.0-1e-5 ?)

					if ( angle > 1.0 ) {

						angle = 1.0;

					} else if ( angle < -1.0 ) {

						angle = -1.0;

					}

					angle = math.acos( angle );

					if ( ik.minAngle !== undefined && angle < ik.minAngle ) {

						angle = ik.minAngle;

					}

					if ( ik.maxAngle !== undefined && angle > ik.maxAngle ) {

						angle = ik.maxAngle;

					}

					axis.crossVectors( effectorVec, targetVec );
					axis.normalize();

					q.setFromAxisAngle( axis, angle );
					link.quaternion.multiply( q );

					// TODO: re-consider the limitation specification
					if ( limitation !== undefined ) {

						var c = link.quaternion.w;

						if ( c > 1.0 ) {

							c = 1.0;

						}

						var c2 = math.sqrt( 1 - c * c );
						link.quaternion.set( limitation.x * c2,
						                     limitation.y * c2,
						                     limitation.z * c2,
						                     c );

					}

					link.updateMatrixWorld( true );

				}

			}

		}

	},

};

