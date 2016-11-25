/**
 * @author takahiro / https://github.com/takahirox
 *
 * CCD Algorithm
 *  https://sites.google.com/site/auraliusproject/ccd-algorithm
 *
 * mesh.geometry needs to have iks array.
 *
 * // ik parameter example
 * //
 * // target, effector, index in links are bone index in skeleton.
 * // the bones relation should be
 * // <-- parent                                  child -->
 * // links[ n ], links[ n - 1 ], ..., links[ 0 ], effector
 * ik = {
 *	target: 1,
 *	effector: 2,
 *	links: [ { index: 5, limitation: new THREE.Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
 *	iteration: 10,
 *	minAngle: 0.0,
 *	maxAngle: 1.0,
 * };
 */

THREE.CCDIKSolver = function ( mesh ) {

	this.mesh = mesh;

	this._valid();

};

THREE.CCDIKSolver.prototype = {

	constructor: THREE.CCDIKSolver,

	_valid: function () {

		var iks = this.mesh.geometry.iks;
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

	},

	/*
	 * save the bone matrices before solving IK.
	 * they're used for generating VMD and VPD.
	 */
	_saveOriginalBonesInfo: function () {

		var bones = this.mesh.skeleton.bones;

		for ( var i = 0, il = bones.length; i < il; i ++ ) {

			var bone = bones[ i ];

			if ( bone.userData.ik === undefined ) bone.userData.ik = {};

			bone.userData.ik.originalMatrix = bone.matrix.toArray();

		}

	},

	update: function ( saveOriginalBones ) {

		var q = new THREE.Quaternion();

		var targetPos = new THREE.Vector3();
		var targetVec = new THREE.Vector3();
		var effectorPos = new THREE.Vector3();
		var effectorVec = new THREE.Vector3();
		var linkPos = new THREE.Vector3();
		var invLinkQ = new THREE.Quaternion();
		var axis = new THREE.Vector3();

		var bones = this.mesh.skeleton.bones;
		var iks = this.mesh.geometry.iks;

		var boneParams = this.mesh.geometry.bones;

		// for reference overhead reduction in loop
		var math = Math;

		this.mesh.updateMatrixWorld( true );

		if ( saveOriginalBones === true ) this._saveOriginalBonesInfo();

		for ( var i = 0, il = iks.length; i < il; i++ ) {

			var ik = iks[ i ];
			var effector = bones[ ik.effector ];
			var target = bones[ ik.target ];

			// don't use getWorldPosition() here for the performance
			// because it calls updateMatrixWorld( true ) inside.
			targetPos.setFromMatrixPosition( target.matrixWorld );

			var links = ik.links;
			var iteration = ik.iteration !== undefined ? ik.iteration : 1;

			for ( var j = 0; j < iteration; j++ ) {

				var rotated = false;

				for ( var k = 0, kl = links.length; k < kl; k++ ) {

					var link = bones[ links[ k ].index ];

					// skip this link and following links.
					// this skip is used for MMD performance optimization.
					if ( links[ k ].enabled === false ) break;

					var limitation = links[ k ].limitation;

					// don't use getWorldPosition/Quaternion() here for the performance
					// because they call updateMatrixWorld( true ) inside.
					linkPos.setFromMatrixPosition( link.matrixWorld );
					invLinkQ.setFromRotationMatrix( link.matrixWorld ).inverse();
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

					} else if ( angle < -1.0 ) {

						angle = -1.0;

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
					rotated = true;

				}

				if ( ! rotated ) break;

			}

		}

		// just in case
		this.mesh.updateMatrixWorld( true );

	}

};


THREE.CCDIKHelper = function ( mesh ) {

	if ( mesh.geometry.iks === undefined || mesh.skeleton === undefined ) {

		throw 'THREE.CCDIKHelper requires iks in mesh.geometry and skeleton in mesh.';

	}

	THREE.Object3D.call( this );

	this.root = mesh;

	this.matrix = mesh.matrixWorld;
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
	this.update();

};

THREE.CCDIKHelper.prototype = Object.create( THREE.Object3D.prototype );
THREE.CCDIKHelper.prototype.constructor = THREE.CCDIKHelper;

THREE.CCDIKHelper.prototype._init = function () {

	var self = this;
	var mesh = this.root;
	var iks = mesh.geometry.iks;

	function createLineGeometry( ik ) {

		var geometry = new THREE.BufferGeometry();
		var vertices = new Float32Array( ( 2 + ik.links.length ) * 3 );
		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

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

};

THREE.CCDIKHelper.prototype.update = function () {

	var offset = 0;

	var mesh = this.root;
	var iks = mesh.geometry.iks;
	var bones = mesh.skeleton.bones;

	var matrixWorldInv = new THREE.Matrix4().getInverse( mesh.matrixWorld );
	var vector = new THREE.Vector3();

	function getPosition( bone ) {

		vector.setFromMatrixPosition( bone.matrixWorld );
		vector.applyMatrix4( matrixWorldInv );

		return vector;

	}

	function setPositionOfBoneToAttributeArray( array, index, bone ) {

		var v = getPosition( bone );

		array[ index * 3 + 0 ] = v.x;
		array[ index * 3 + 1 ] = v.y;
		array[ index * 3 + 2 ] = v.z;

	}

	for ( var i = 0, il = iks.length; i < il; i ++ ) {

		var ik = iks[ i ];

		var targetBone = bones[ ik.target ];
		var effectorBone = bones[ ik.effector ];

		var targetMesh = this.children[ offset ++ ];
		var effectorMesh = this.children[ offset ++ ];

		targetMesh.position.copy( getPosition( targetBone ) );
		effectorMesh.position.copy( getPosition( effectorBone ) );

		for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

			var link = ik.links[ j ];
			var linkBone = bones[ link.index ];

			var linkMesh = this.children[ offset ++ ];

			linkMesh.position.copy( getPosition( linkBone ) );

		}

		var line = this.children[ offset ++ ];
		var array = line.geometry.attributes.position.array;

		setPositionOfBoneToAttributeArray( array, 0, targetBone );
		setPositionOfBoneToAttributeArray( array, 1, effectorBone );

		for ( var j = 0, jl = ik.links.length; j < jl; j ++ ) {

			var link = ik.links[ j ];
			var linkBone = bones[ link.index ];
			setPositionOfBoneToAttributeArray( array, j + 2, linkBone );

		}

		line.geometry.attributes.position.needsUpdate = true;

	}

};
