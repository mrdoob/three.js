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
} from 'three';

const _quaternion = new Quaternion();
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
 * This class solves the Inverse Kinematics Problem with a [CCD Algorithm](https://web.archive.org/web/20221206080850/https://sites.google.com/site/auraliusproject/ccd-algorithm).
 *
 * `CCDIKSolver` is designed to work with instances of {@link SkinnedMesh}.
 *
 * @three_import import { CCDIKSolver } from 'three/addons/animation/CCDIKSolver.js';
 */
class CCDIKSolver {

	/**
	 * @param {SkinnedMesh} mesh - The skinned mesh.
	 * @param {Array<CCDIKSolver~IK>} [iks=[]] - The IK objects.
	 */
	constructor( mesh, iks = [] ) {

		/**
		 * The skinned mesh.
		 *
		 * @type {SkinnedMesh}
		 */
		this.mesh = mesh;

		/**
		 * The IK objects.
		 *
		 * @type {SkinnedMesh}
		 */
		this.iks = iks;

		this._initialQuaternions = [];
		this._workingQuaternion = new Quaternion();

		for ( const ik of iks ) {

			const chainQuats = [];
			for ( let i = 0; i < ik.links.length; i ++ ) {

			  chainQuats.push( new Quaternion() );

			}

			this._initialQuaternions.push( chainQuats );

		}

		this._valid();

	}

	/**
	 * Updates all IK bones by solving the CCD algorithm.
	 *
	 * @param {number} [globalBlendFactor=1.0] - Blend factor applied if an IK chain doesn't have its own .blendFactor.
	 * @return {CCDIKSolver} A reference to this instance.
	 */
	update( globalBlendFactor = 1.0 ) {

		const iks = this.iks;

		for ( let i = 0, il = iks.length; i < il; i ++ ) {

			this.updateOne( iks[ i ], globalBlendFactor );

		}

		return this;

	}

	/**
	 * Updates one IK bone solving the CCD algorithm.
	 *
	 * @param {CCDIKSolver~IK} ik - The IK to update.
	 * @param {number} [overrideBlend=1.0] - If the IK object does not define `blendFactor`, this value is used.
	 * @return {CCDIKSolver} A reference to this instance.
	 */
	updateOne( ik, overrideBlend = 1.0 ) {

		const chainBlend = ik.blendFactor !== undefined ? ik.blendFactor : overrideBlend;
		const bones = this.mesh.skeleton.bones;
		const chainIndex = this.iks.indexOf( ik );
		const initialQuaternions = this._initialQuaternions[ chainIndex ];

		// for reference overhead reduction in loop
		const math = Math;

		const effector = bones[ ik.effector ];
		const target = bones[ ik.target ];

		// don't use getWorldPosition() here for the performance
		// because it calls updateMatrixWorld( true ) inside.
		_targetPos.setFromMatrixPosition( target.matrixWorld );

		const links = ik.links;
		const iteration = ik.iteration !== undefined ? ik.iteration : 1;

		if ( chainBlend < 1.0 ) {

			for ( let j = 0; j < links.length; j ++ ) {

			  const linkIndex = links[ j ].index;
			  initialQuaternions[ j ].copy( bones[ linkIndex ].quaternion );

			}

		}

		for ( let i = 0; i < iteration; i ++ ) {

			let rotated = false;

			for ( let j = 0, jl = links.length; j < jl; j ++ ) {

				const link = bones[ links[ j ].index ];

				// skip this link and following links
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
				if ( angle < 1e-5 ) continue;

				if ( ik.minAngle !== undefined && angle < ik.minAngle ) {

					angle = ik.minAngle;

				}

				if ( ik.maxAngle !== undefined && angle > ik.maxAngle ) {

					angle = ik.maxAngle;

				}

				_axis.crossVectors( _effectorVec, _targetVec );
				_axis.normalize();

				_quaternion.setFromAxisAngle( _axis, angle );
				link.quaternion.multiply( _quaternion );

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

					link.rotation.setFromVector3( _vector.setFromEuler( link.rotation ).max( rotationMin ) );

				}

				if ( rotationMax !== undefined ) {

					link.rotation.setFromVector3( _vector.setFromEuler( link.rotation ).min( rotationMax ) );

				}

				link.updateMatrixWorld( true );

				rotated = true;

			}

			if ( ! rotated ) break;

		}

		if ( chainBlend < 1.0 ) {

			for ( let j = 0; j < links.length; j ++ ) {

			  const linkIndex = links[ j ].index;
			  const link = bones[ linkIndex ];

			  this._workingQuaternion.copy( initialQuaternions[ j ] ).slerp( link.quaternion, chainBlend );

			  link.quaternion.copy( this._workingQuaternion );
			  link.updateMatrixWorld( true );

			}

		}

		  return this;

	}

	/**
	 * Creates a helper for visualizing the CCDIK.
	 *
	 * @param {number} sphereSize - The sphere size.
	 * @return {CCDIKHelper} The created helper.
	 */
	createHelper( sphereSize ) {

		return new CCDIKHelper( this.mesh, this.iks, sphereSize );

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
 * Helper for visualizing IK bones.
 *
 * @augments Object3D
 * @three_import import { CCDIKHelper } from 'three/addons/animation/CCDIKSolver.js';
 */
class CCDIKHelper extends Object3D {

	/**
	 * @param {SkinnedMesh} mesh - The skinned mesh.
 	 * @param {Array<CCDIKSolver~IK>} [iks=[]] - The IK objects.
 	 * @param {number} [sphereSize=0.25] - The sphere size.
	 */
	constructor( mesh, iks = [], sphereSize = 0.25 ) {

		super();

		/**
		 * The skinned mesh this helper refers to.
		 *
		 * @type {SkinnedMesh}
		 */
		this.root = mesh;

		/**
		 * The IK objects.
		 *
		 * @type {Array<CCDIKSolver~IK>}
		 */
		this.iks = iks;

		this.matrix.copy( mesh.matrixWorld );
		this.matrixAutoUpdate = false;

		/**
		 * The helpers sphere geometry.
		 *
		 * @type {SkinnedMesh}
		 */
		this.sphereGeometry = new SphereGeometry( sphereSize, 16, 8 );

		/**
		 * The material for the target spheres.
		 *
		 * @type {MeshBasicMaterial}
		 */
		this.targetSphereMaterial = new MeshBasicMaterial( {
			color: new Color( 0xff8888 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		/**
		 * The material for the effector spheres.
		 *
		 * @type {MeshBasicMaterial}
		 */
		this.effectorSphereMaterial = new MeshBasicMaterial( {
			color: new Color( 0x88ff88 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		/**
		 * The material for the link spheres.
		 *
		 * @type {MeshBasicMaterial}
		 */
		this.linkSphereMaterial = new MeshBasicMaterial( {
			color: new Color( 0x8888ff ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		/**
		 * A global line material.
		 *
		 * @type {LineBasicMaterial}
		 */
		this.lineMaterial = new LineBasicMaterial( {
			color: new Color( 0xff0000 ),
			depthTest: false,
			depthWrite: false,
			transparent: true
		} );

		this._init();

	}

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

	/**
	 * Frees the GPU-related resources allocated by this instance.
	 * Call this method whenever this instance is no longer used in your app.
	 */
	dispose() {

		this.sphereGeometry.dispose();

		this.targetSphereMaterial.dispose();
		this.effectorSphereMaterial.dispose();
		this.linkSphereMaterial.dispose();
		this.lineMaterial.dispose();

		const children = this.children;

		for ( let i = 0; i < children.length; i ++ ) {

			const child = children[ i ];

			if ( child.isLine ) child.geometry.dispose();

		}

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

/**
 * This type represents IK configuration objects.
 *
 * @typedef {Object} CCDIKSolver~IK
 * @property {number} target - The target bone index which refers to a bone in the `Skeleton.bones` array.
 * @property {number} effector - The effector bone index which refers to a bone in the `Skeleton.bones` array.
 * @property {Array<CCDIKSolver~BoneLink>} links - An array of bone links.
 * @property {number} [iteration=1] - Iteration number of calculation. Smaller is faster but less precise.
 * @property {number} [minAngle] - Minimum rotation angle in a step in radians.
 * @property {number} [maxAngle] - Minimum rotation angle in a step in radians.
 * @property {number} [blendFactor] - The blend factor.
 **/

/**
 * This type represents bone links.
 *
 * @typedef {Object} CCDIKSolver~BoneLink
 * @property {number} index - The index of a linked bone which refers to a bone in the `Skeleton.bones` array.
 * @property {number} [limitation] - Rotation axis.
 * @property {number} [rotationMin] - Rotation minimum limit.
 * @property {number} [rotationMax] - Rotation maximum limit.
 * @property {boolean} [enabled=true] - Whether the link is enabled or not.
 **/


export { CCDIKSolver, CCDIKHelper };
