/**
 * @author takahiro / https://github.com/takahirox
 *
 * CCD Algorithm
 *  - https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * // ik parameter example
 * //
 * // target, effector, index in links are bone index in skeleton.bones.
 * // the bones relation should be
 * // <-- parent                                  child -->
 * // links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
 * iks = [ {
 *	target: 1,
 *	effector: 2,
 *	links: [ { index: 5, limitation: new THREE.Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
 *	iteration: 10,
 *	minAngle: 0.0,
 *	maxAngle: 1.0,
 * } ];
 */

THREE.CCDIKSolver = ( function () {

	/**
	 * @param {THREE.SkinnedMesh} mesh
	 * @param {Array<Object>} iks
	 */
	function CCDIKSolver( mesh, iks ) {

		this.mesh = mesh;
		this.iks = iks || [];

		this._valid();

	}

	CCDIKSolver.prototype = {

		constructor: CCDIKSolver,

		/**
		 * Update IK bones.
		 *
		 * @return {THREE.CCDIKSolver}
		 */
		update: function () {

			var q = new THREE.Quaternion();
			var targetPos = new THREE.Vector3();
			var targetVec = new THREE.Vector3();
			var effectorPos = new THREE.Vector3();
			var effectorVec = new THREE.Vector3();
			var linkPos = new THREE.Vector3();
			var invLinkQ = new THREE.Quaternion();
			var linkScale = new THREE.Vector3();
			var axis = new THREE.Vector3();
			var vector = new THREE.Vector3();

			return function update() {

				var bones = this.mesh.skeleton.bones;
				var iks = this.iks;

				// for reference overhead reduction in loop
				var math = Math;

				for ( var i = 0, il = iks.length; i < il; i ++ ) {

					var ik = iks[ i ];
					var effector = bones[ ik.effector ];
					var target = bones[ ik.target ];

					// don't use getWorldPosition() here for the performance
					// because it calls updateMatrixWorld( true ) inside.
					targetPos.setFromMatrixPosition( target.matrixWorld );

					var links = ik.links;
					var iteration = ik.iteration !== undefined ? ik.iteration : 1;

					for ( var j = 0; j < iteration; j ++ ) {

						var rotated = false;

						for ( var k = 0, kl = links.length; k < kl; k ++ ) {

							var link = bones[ links[ k ].index ];

							// skip this link and following links.
							// this skip is used for MMD performance optimization.
							if ( links[ k ].enabled === false ) break;

							var limitation = links[ k ].limitation;
							var rotationMin = links[ k ].rotationMin;
							var rotationMax = links[ k ].rotationMax;

							// don't use getWorldPosition/Quaternion() here for the performance
							// because they call updateMatrixWorld( true ) inside.
							link.matrixWorld.decompose( linkPos, invLinkQ, linkScale );
							invLinkQ.inverse();
							effectorPos.setFromMatrixPosition( effector.matrixWorld );

							// work in link world
							effectorVec.subVectors( effectorPos, linkPos );
							effectorVec.applyQuaternion( invLinkQ );
							effectorVec.normalize();

							targetVec.subVectors( targetPos, linkPos );
							targetVec.applyQuaternion( invLinkQ );
							targetVec.normalize();

							var angle = targetVec.dot( effectorVec );

							if ( angle > 1.0 ) {

								angle = 1.0;

							} else if ( angle < - 1.0 ) {

								angle = - 1.0;

							}

							angle = math.acos( angle );

							// skip if changing angle is too small to prevent vibration of bone
							// Refer to http://www20.atpages.jp/katwat/three.js_r58/examples/mytest37/mmd.three.js
							if ( angle < 1e-5 ) continue;

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

								if ( c > 1.0 ) c = 1.0;

								var c2 = math.sqrt( 1 - c * c );
								link.quaternion.set( limitation.x * c2,
								                     limitation.y * c2,
								                     limitation.z * c2,
								                     c );

							}

							if ( rotationMin !== undefined ) {

								link.rotation.setFromVector3(
									link.rotation
										.toVector3( vector )
										.max( rotationMin ) );

							}

							if ( rotationMax !== undefined ) {

								link.rotation.setFromVector3(
									link.rotation
										.toVector3( vector )
										.min( rotationMax ) );

							}

							link.updateMatrixWorld( true );

							rotated = true;

						}

						if ( ! rotated ) break;

					}

				}

				return this;

			};

		}(),

		/**
		 * Creates Helper
		 *
		 * @return {CCDIKHelper}
		 */
		createHelper: function () {

			return new CCDIKHelper( this.mesh, this.mesh.geometry.userData.MMD.iks );

		},

		// private methods

		_valid: function () {

			var iks = this.iks;
			var bones = this.mesh.skeleton.bones;

			for ( var i = 0, il = iks.length; i < il; i ++ ) {

				var ik = iks[ i ];
				var effector = bones[ ik.effector ];
				var links = ik.links;
				var link0, link1;

				link0 = effector;

				for ( var j = 0, jl = links.length; j < jl; j ++ ) {

					link1 = bones[ links[ j ].index ];

					if ( link0.parent !== link1 ) {

						console.warn( 'THREE.CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name );

					}

					link0 = link1;

				}

			}

		}

	};

	/**
	 * Visualize IK bones
	 *
	 * @param {SkinnedMesh} mesh
	 * @param {Array<Object>} iks
	 */
	function CCDIKHelper( mesh, iks ) {

		THREE.Object3D.call( this );

		this.root = mesh;
		this.iks = iks || [];

		this.matrix.copy( mesh.matrixWorld );
		this.matrixAutoUpdate = false;

		this.sphereGeometry = new THREE.SphereBufferGeometry( 0.25, 16, 8 );

		this.targetSphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color( 0xff8888 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.effectorSphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color( 0x88ff88 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.linkSphereMaterial = new THREE.MeshBasicMaterial( {
			color: new THREE.Color( 0x8888ff ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.lineMaterial = new THREE.LineBasicMaterial( {
			color: new THREE.Color( 0xff0000 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this._init();

	}

	CCDIKHelper.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {

		constructor: CCDIKHelper,

		/**
		 * Updates IK bones visualization.
		 */
		updateMatrixWorld: function () {

			var matrix = new THREE.Matrix4();
			var vector = new THREE.Vector3();

			function getPosition( bone, matrixWorldInv ) {

				return vector
					.setFromMatrixPosition( bone.matrixWorld )
					.applyMatrix4( matrixWorldInv );

			}

			function setPositionOfBoneToAttributeArray( array, index, bone, matrixWorldInv ) {

				var v = getPosition( bone, matrixWorldInv );

				array[ index * 3 + 0 ] = v.x;
				array[ index * 3 + 1 ] = v.y;
				array[ index * 3 + 2 ] = v.z;

			}

			return function updateMatrixWorld( force ) {

				var mesh = this.root;

				if ( this.visible ) {

					var offset = 0;

					var iks = this.iks;
					var bones = mesh.skeleton.bones;

					matrix.getInverse( mesh.matrixWorld );

					for ( var i = 0, il = iks.length; i < il; i ++ ) {

						var ik = iks[ i ];

						var targetBone = bones[ ik.target ];
						var effectorBone = bones[ ik.effector ];

						var targetMesh = this.children[ offset ++ ];
						var effectorMesh = this.children[ offset ++ ];

						targetMesh.position.copy( getPosition( targetBone, matrix ) );
						effectorMesh.position.copy( getPosition( effectorBone, matrix ) );

						for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

							var link = ik.links[ j ];
							var linkBone = bones[ link.index ];

							var linkMesh = this.children[ offset ++ ];

							linkMesh.position.copy( getPosition( linkBone, matrix ) );

						}

						var line = this.children[ offset ++ ];
						var array = line.geometry.attributes.position.array;

						setPositionOfBoneToAttributeArray( array, 0, targetBone, matrix );
						setPositionOfBoneToAttributeArray( array, 1, effectorBone, matrix );

						for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

							var link = ik.links[ j ];
							var linkBone = bones[ link.index ];
							setPositionOfBoneToAttributeArray( array, j + 2, linkBone, matrix );

						}

						line.geometry.attributes.position.needsUpdate = true;

					}

				}

				this.matrix.copy( mesh.matrixWorld );

				THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

			};

		}(),

		// private method

		_init: function () {

			var self = this;
			var iks = this.iks;

			function createLineGeometry( ik ) {

				var geometry = new THREE.BufferGeometry();
				var vertices = new Float32Array( ( 2 + ik.links.length ) * 3 );
				geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

				return geometry;

			}

			function createTargetMesh() {

				return new THREE.Mesh( self.sphereGeometry, self.targetSphereMaterial );

			}

			function createEffectorMesh() {

				return new THREE.Mesh( self.sphereGeometry, self.effectorSphereMaterial );

			}

			function createLinkMesh() {

				return new THREE.Mesh( self.sphereGeometry, self.linkSphereMaterial );

			}

			function createLine( ik ) {

				return new THREE.Line( createLineGeometry( ik ), self.lineMaterial );

			}

			for ( var i = 0, il = iks.length; i < il; i ++ ) {

				var ik = iks[ i ];

				this.add( createTargetMesh() );
				this.add( createEffectorMesh() );

				for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

					this.add( createLinkMesh() );

				}

				this.add( createLine( ik ) );

			}

		}

	} );

	return CCDIKSolver;

} )();
