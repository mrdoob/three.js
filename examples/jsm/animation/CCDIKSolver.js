import {
	BufferAttribute,
	BufferGeometry,
	Color,
	Line,
	LineBasicMaterial,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Object3D,
	Quaternion,
	SphereGeometry,
	Vector3
} from '../../../build/three.module.js';

const _q = new Quaternion();
const _targetPos = new Vector3();
const _targetVec = new Vector3();
const _effectorPos = new Vector3();
const _effectorVec = new Vector3();
const _linkPos = new Vector3();
const _invLinkQ = new Quaternion();
const _linkScale = new Vector3();
const _axis = new Vector3();
const _vector = new Vector3();
const _matrix = new Matrix4();


/**
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
 *	links: [ { index: 5, limitation: new Vector3( 1, 0, 0 ) }, { index: 4, enabled: false }, { index : 3 } ],
 *	iteration: 10,
 *	minAngle: 0.0,
 *	maxAngle: 1.0,
 * } ];
 */

class CCDIKSolver {

	/**
	 * @param {THREE.SkinnedMesh} mesh
	 * @param {Array<Object>} iks
	 */
	constructor( mesh, iks = [] ) {

		this.mesh = mesh;
		this.iks = iks;

		this._valid();

	}

	/**
	 * Update all IK bones.
	 *
	 * @return {CCDIKSolver}
	 */
	update() {

		const iks = this.iks;

		for ( let i = 0, il = iks.length; i < il; i ++ ) {

			this.updateOne( iks[ i ] );

		}

		return this;

	}

	/**
	 * Update one IK bone
	 *
	 * @param {Object} ik parameter
	 * @return {CCDIKSolver}
	 */
	updateOne( ik ) {

		const bones = this.mesh.skeleton.bones;

		// for reference overhead reduction in loop
		const math = Math;

		const effector = bones[ ik.effector ];
		const target = bones[ ik.target ];

		// don't use getWorldPosition() here for the performance
		// because it calls updateMatrixWorld( true ) inside.
		_targetPos.setFromMatrixPosition( target.matrixWorld );

		const links = ik.links;
		const iteration = ik.iteration !== undefined ? ik.iteration : 1;

		for ( let i = 0; i < iteration; i ++ ) {

			let rotated = false;

			for ( let j = 0, jl = links.length; j < jl; j ++ ) {

				const link = bones[ links[ j ].index ];

				// skip this link and following links.
				// this skip is used for MMD performance optimization.
				if ( links[ j ].enabled === false ) break;

				const limitation = links[ j ].limitation;
				const rotationMin = links[ j ].rotationMin;
				const rotationMax = links[ j ].rotationMax;

				// don't use getWorldPosition/Quaternion() here for the performance
				// because they call updateMatrixWorld( true ) inside.
				link.matrixWorld.decompose( _linkPos, _invLinkQ, _linkScale );
				_invLinkQ.invert();
				_effectorPos.setFromMatrixPosition( effector.matrixWorld );

				// work in link world
				_effectorVec.subVectors( _effectorPos, _linkPos );
				_effectorVec.applyQuaternion( _invLinkQ );
				_effectorVec.normalize();

				_targetVec.subVectors( _targetPos, _linkPos );
				_targetVec.applyQuaternion( _invLinkQ );
				_targetVec.normalize();

				let angle = _targetVec.dot( _effectorVec );

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

				_axis.crossVectors( _effectorVec, _targetVec );
				_axis.normalize();

				_q.setFromAxisAngle( _axis, angle );
				link.quaternion.multiply( _q );

				// TODO: re-consider the limitation specification
				if ( limitation !== undefined ) {

					let c = link.quaternion.w;

					if ( c > 1.0 ) c = 1.0;

					const c2 = math.sqrt( 1 - c * c );
					link.quaternion.set( limitation.x * c2,
					                     limitation.y * c2,
					                     limitation.z * c2,
					                     c );

				}

				if ( rotationMin !== undefined ) {

					link.rotation.setFromVector3(
						link.rotation
							.toVector3( _vector )
							.max( rotationMin ) );

				}

				if ( rotationMax !== undefined ) {

					link.rotation.setFromVector3(
						link.rotation
							.toVector3( _vector )
							.min( rotationMax ) );

				}

				link.updateMatrixWorld( true );

				rotated = true;

			}

			if ( ! rotated ) break;

		}

		return this;

	}

	/**
	 * Creates Helper
	 *
	 * @return {CCDIKHelper}
	 */
	createHelper() {

		return new CCDIKHelper( this.mesh, this.mesh.geometry.userData.MMD.iks );

	}

	// private methods

	_valid() {

		const iks = this.iks;
		const bones = this.mesh.skeleton.bones;

		for ( let i = 0, il = iks.length; i < il; i ++ ) {

			const ik = iks[ i ];
			const effector = bones[ ik.effector ];
			const links = ik.links;
			let link0, link1;

			link0 = effector;

			for ( let j = 0, jl = links.length; j < jl; j ++ ) {

				link1 = bones[ links[ j ].index ];

				if ( link0.parent !== link1 ) {

					console.warn( 'THREE.CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name );

				}

				link0 = link1;

			}

		}

	}

}

function getPosition( bone, matrixWorldInv ) {

	return _vector
		.setFromMatrixPosition( bone.matrixWorld )
		.applyMatrix4( matrixWorldInv );

}

function setPositionOfBoneToAttributeArray( array, index, bone, matrixWorldInv ) {

	const v = getPosition( bone, matrixWorldInv );

	array[ index * 3 + 0 ] = v.x;
	array[ index * 3 + 1 ] = v.y;
	array[ index * 3 + 2 ] = v.z;

}

/**
 * Visualize IK bones
 *
 * @param {SkinnedMesh} mesh
 * @param {Array<Object>} iks
 */
class CCDIKHelper extends Object3D {

	constructor( mesh, iks = [] ) {

		super();

		this.root = mesh;
		this.iks = iks;

		this.matrix.copy( mesh.matrixWorld );
		this.matrixAutoUpdate = false;

		this.sphereGeometry = new SphereGeometry( 0.25, 16, 8 );

		this.targetSphereMaterial = new MeshBasicMaterial( {
			color: new Color( 0xff8888 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.effectorSphereMaterial = new MeshBasicMaterial( {
			color: new Color( 0x88ff88 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.linkSphereMaterial = new MeshBasicMaterial( {
			color: new Color( 0x8888ff ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this.lineMaterial = new LineBasicMaterial( {
			color: new Color( 0xff0000 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this._init();

	}

	/**
	 * Updates IK bones visualization.
	 */
	updateMatrixWorld( force ) {

		const mesh = this.root;

		if ( this.visible ) {

			let offset = 0;

			const iks = this.iks;
			const bones = mesh.skeleton.bones;

			_matrix.copy( mesh.matrixWorld ).invert();

			for ( let i = 0, il = iks.length; i < il; i ++ ) {

				const ik = iks[ i ];

				const targetBone = bones[ ik.target ];
				const effectorBone = bones[ ik.effector ];

				const targetMesh = this.children[ offset ++ ];
				const effectorMesh = this.children[ offset ++ ];

				targetMesh.position.copy( getPosition( targetBone, _matrix ) );
				effectorMesh.position.copy( getPosition( effectorBone, _matrix ) );

				for ( let j = 0, jl = ik.links.length; j < jl; j ++ ) {

					const link = ik.links[ j ];
					const linkBone = bones[ link.index ];

					const linkMesh = this.children[ offset ++ ];

					linkMesh.position.copy( getPosition( linkBone, _matrix ) );

				}

				const line = this.children[ offset ++ ];
				const array = line.geometry.attributes.position.array;

				setPositionOfBoneToAttributeArray( array, 0, targetBone, _matrix );
				setPositionOfBoneToAttributeArray( array, 1, effectorBone, _matrix );

				for ( let j = 0, jl = ik.links.length; j < jl; j ++ ) {

					const link = ik.links[ j ];
					const linkBone = bones[ link.index ];
					setPositionOfBoneToAttributeArray( array, j + 2, linkBone, _matrix );

				}

				line.geometry.attributes.position.needsUpdate = true;

			}

		}

		this.matrix.copy( mesh.matrixWorld );

		super.updateMatrixWorld( force );

	}

	// private method

	_init() {

		const scope = this;
		const iks = this.iks;

		function createLineGeometry( ik ) {

			const geometry = new BufferGeometry();
			const vertices = new Float32Array( ( 2 + ik.links.length ) * 3 );
			geometry.setAttribute( 'position', new BufferAttribute( vertices, 3 ) );

			return geometry;

		}

		function createTargetMesh() {

			return new Mesh( scope.sphereGeometry, scope.targetSphereMaterial );

		}

		function createEffectorMesh() {

			return new Mesh( scope.sphereGeometry, scope.effectorSphereMaterial );

		}

		function createLinkMesh() {

			return new Mesh( scope.sphereGeometry, scope.linkSphereMaterial );

		}

		function createLine( ik ) {

			return new Line( createLineGeometry( ik ), scope.lineMaterial );

		}

		for ( let i = 0, il = iks.length; i < il; i ++ ) {

			const ik = iks[ i ];

			this.add( createTargetMesh() );
			this.add( createEffectorMesh() );

			for ( let j = 0, jl = ik.links.length; j < jl; j ++ ) {

				this.add( createLinkMesh() );

			}

			this.add( createLine( ik ) );

		}

	}

}

export { CCDIKSolver };
