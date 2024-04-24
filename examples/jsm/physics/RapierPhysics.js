import {
	Box3,
	BufferGeometry,
	IcosahedronGeometry,
	InstancedMesh,
	Matrix4,
	Mesh,
	Object3D,
	Quaternion,
	SphereGeometry,
	Vector3,
} from "three";

/**
 * @typedef {{} & import('@dimforge/rapier3d')} Rapier
 */

/**
 * @typedef {{
 *   rigidBodyDesc: Rapier.RigidBodyDesc;
 *   rigidBody: Rapier.RigidBody;
 *   colliderDesc: Rapier.ColliderDesc;
 *   collider: Rapier.Collider;
 * }} PhysicProperties
 */

/**
 * @typedef {{
 *   geometry?: BufferGeometry;
 * } & Object3D } Object3DWithGeometry
 */

/**
 * @initial_author mrdoob | info@mrdoob.com
 *
 * @description Physic helper based on `Rapier`
 *
 * @docs https://rapier.rs/docs/api/javascript/JavaScript3D/
 */

const RAPIER_PATH = "https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.12.0";
/** @type {Rapier | null | undefined} */
let RAPIER = null;

export class Physic {
	/** @access private */
	_vector = new Vector3();
	/** @access private */
	_quaternion = new Quaternion();
	/** @access private */
	_matrix = new Matrix4();
	/** @access private */
	_scale = new Vector3(1, 1, 1);

	/**
	 * @description `Rapier3D.js`.
	 *
	 * @type {Rapier}
	 */
	rapier;
	/**
	 * @description {@link Rapier.World} instance.
	 *
	 * @type {Rapier.World}
	 */
	world;
	/**
	 * @description List of {@link Object3D} with physic applied.
	 *
	 * @type {Object3DWithGeometry[]}
	 */
	dynamicObjects = [];
	/**
	 * @description {@link WeakMap} of dynamic objects {@link Rapier.RigidBody}
	 *
	 * @type {WeakMap<WeakKey, Rapier.RigidBody | Rapier.RigidBody[]>}
	 */
	dynamicObjectMap = new WeakMap();

	constructor(rapier) {
		this.rapier = rapier;

		const gravity = new this.rapier.Vector3(0.0, -9.81, 0.0);
		this.world = new this.rapier.World(gravity);
	}

	/**
	 * @description Add the specified `object` to the physic `dynamicObjects` map.
	 *
	 * @param {Object3DWithGeometry} object `Object3D` based.
	 * @param {number} mass Physic object mass.
	 * @param {number} restitution Physic Object restitution.
	 *
	 * @access private
	 */
	_addObject(object, mass = 0, restitution = 0) {
		const { colliderDesc } = this.getShape(object);
		if (!colliderDesc) return;

		colliderDesc.setMass(mass);
		colliderDesc.setRestitution(restitution);

		const physicProperties =
			object instanceof InstancedMesh
				? this.createInstancedPhysicProperties(object, colliderDesc, mass)
				: this.createPhysicProperties(
						colliderDesc,
						object.position,
						object.quaternion,
						mass
				  );

		if (mass > 0) {
			this.dynamicObjects.push(object);
			this.dynamicObjectMap.set(object, physicProperties);
		}

		return physicProperties;
	}

	/**
	 * Add objects children from the specified {@link Object3D} to the physic world using the userData.
	 *
	 * @param {Object3DWithGeometry} object Object3D based.
	 *
	 * @example ```ts
	 *  const floor = new Mesh(
	 *    new BoxGeometry(500, 5, 500),
	 *    new MeshBasicMaterial({})
	 *  );
	 *  floor.position.setY(-10);
	 *  floor.userData.physics = { mass: 0, restitution: restitution };
	 *
	 *  rapierPhysicsHelper?.addToWorld(floor, 0);
	 * ```
	 */
	addSceneToWorld(object) {
		object.traverse((child) => {
			if (!(child instanceof Object3D) || !child.userData.physics) return;

			const physics = child.userData.physics;

			this._addObject(child, physics.mass, physics.restitution);
		});
	}

	/**
	 * @description Apply physic to the specified object. Add the object to the physic `world`.
	 *
	 * @param {Object3D} object Object3D based.
	 * @param {number} mass Physic mass.
	 * @param {number} restitution Physic restitution.
	 */
	addToWorld(object, mass = 0, restitution = 0) {
		if (object instanceof Object3D)
			return this._addObject(object, Number(mass), Number(restitution));
		return undefined;
	}

	/**
	 * @description Retrieve the shape of the passed `object`.
	 *
	 * @param {Object3DWithGeometry} object `Object3D` based.
	 */
	getShape(object) {
		const positions = object?.geometry?.attributes?.position?.array;
		let width = 0;
		let height = 0;
		let depth = 0;
		let halfWidth = 0;
		let halfHeight = 0;
		let halfDepth = 0;
		let radius = 0;
		/** @type {Rapier.ColliderDesc} */
		let colliderDesc;

		if (
			object instanceof Mesh &&
			(object.geometry instanceof SphereGeometry ||
				object.geometry instanceof IcosahedronGeometry)
		) {
			const parameters = object.geometry.parameters;

			radius = parameters.radius ?? 1;
			colliderDesc = this.rapier.ColliderDesc.ball(radius);
		} else if (positions) {
			let minX = 0,
				minY = 0,
				minZ = 0,
				maxX = 0,
				maxY = 0,
				maxZ = 0;

			for (let i = 0; i < positions.length; i += 3) {
				const _vector = new this.rapier.Vector3(
					positions[i],
					positions[i + 1],
					positions[i + 2]
				);

				minX = Math.min(minX, _vector.x);
				minY = Math.min(minY, _vector.y);
				minZ = Math.min(minZ, _vector.z);
				maxX = Math.max(maxX, _vector.x);
				maxY = Math.max(maxY, _vector.y);
				maxZ = Math.max(maxZ, _vector.z);
			}

			width = maxX - minX;
			height = maxY - minY;
			depth = maxZ - minZ;

			halfWidth = width / 2;
			halfHeight = height / 2;
			halfDepth = depth / 2;

			colliderDesc = this.rapier.ColliderDesc.cuboid(
				halfWidth,
				halfHeight,
				halfDepth
			);
		} else {
			const boundingBox = new Box3().setFromObject(object);

			width = boundingBox.max.x - boundingBox.min.x;
			height = boundingBox.max.y - boundingBox.min.y;
			depth = boundingBox.max.z - boundingBox.min.z;

			halfWidth = width / 2;
			halfHeight = height / 2;
			halfDepth = depth / 2;

			colliderDesc = this.rapier.ColliderDesc.cuboid(
				halfWidth,
				halfHeight,
				halfDepth
			);
		}

		return {
			width,
			height,
			depth,
			halfWidth,
			halfHeight,
			halfDepth,
			colliderDesc,
		};
	}

	/**
	 * @description Create {@link Rapier.RigidBody} for each instance of the {@link InstancedMesh} specified mesh
	 *
	 * @param {InstancedMesh} mesh {@link InstancedMesh}
	 * @param {Rapier.ColliderDesc} colliderDesc {@link Rapier.ColliderDesc}
	 * @param {number | undefined} mass
	 */
	createInstancedPhysicProperties(mesh, colliderDesc, mass) {
		const array = mesh.instanceMatrix.array;
		const bodies = [];

		for (let i = 0; i < mesh.count; i++) {
			const position = this._vector.fromArray(array, i * 16 + 12);
			bodies.push(
				this.createPhysicProperties(colliderDesc, position, null, mass)
			);
		}

		return bodies;
	}

	/**
	 * @description Create {@link Rapier.RigidBody} for the specified {@link Rapier.Collider}
	 *
	 * @param {Rapier.ColliderDesc} colliderDesc {@link Rapier.ColliderDesc}
	 * @param {Rapier.Vector3} position {@link Rapier.Vector3}
	 * @param {Rapier.Rotation} rotation {@link Rapier.Rotation}
	 * @param {number | null | undefined} mass
	 */
	createPhysicProperties(colliderDesc, position, rotation, mass = 0) {
		const rigidBodyDesc =
			mass > 0
				? this.rapier.RigidBodyDesc.dynamic()
				: this.rapier.RigidBodyDesc.fixed();
		rigidBodyDesc.setTranslation(position.x, position.y, position.z);
		if (rotation) rigidBodyDesc.setRotation(rotation);

		const rigidBody = this.world.createRigidBody(rigidBodyDesc);
		const collider = this.world.createCollider(colliderDesc, rigidBody);

		return { rigidBodyDesc, rigidBody, colliderDesc, collider };
	}

	/**
	 *
	 * @param {Object3DWithGeometry} object
	 * @param {number | number} index
	 */
	getPhysicPropertiesFromObject(object, index = 0) {
		const _physicProperties = this.dynamicObjectMap.get(object);
		/** @type {PhysicProperties} */
		let body;

		if (!_physicProperties) return undefined;
		if (
			object instanceof InstancedMesh &&
			typeof _physicProperties === "object"
		)
			body = _physicProperties[index];
		else body = _physicProperties;

		return body;
	}

	/**
	 *
	 * @param {Object3DWithGeometry} object
	 * @param {Rapier.Vector3} position
	 * @param {number | undefined} index
	 * @returns
	 */
	setObjectPosition(object, position, index = 0) {
		const physicProperties = this.getPhysicPropertiesFromObject(object, index);
		if (!physicProperties) return;

		const _vectorZero = new this.rapier.Vector3(0, 0, 0);
		physicProperties.rigidBody.setAngvel(_vectorZero, true);
		physicProperties.rigidBody.setLinvel(_vectorZero, true);
		physicProperties.rigidBody.setTranslation(position, true);

		return physicProperties;
	}

	/**
	 *
	 * @param {Object3DWithGeometry} object
	 * @param {Rapier.Vector3} velocity
	 * @param {number | undefined} index
	 */
	setObjectVelocity(object, velocity, index = 0) {
		const physicProperties = this.getPhysicPropertiesFromObject(object, index);
		if (!physicProperties) return;

		physicProperties.rigidBody.setLinvel(velocity, true);

		return physicProperties;
	}

	/**
	 * @description Update the physic world.
	 *
	 * @param {number | undefined} delta
	 */
	step(delta = undefined) {
		this.world.step(delta);

		for (let i = 0, l = this.dynamicObjects.length; i < l; i++) {
			const mesh = this.dynamicObjects[i];

			if (mesh instanceof InstancedMesh) {
				const array = mesh.instanceMatrix.array;
				/** @type {PhysicProperties[]} */
				const bodies = this.dynamicObjectMap.get(mesh);

				for (let j = 0; j < bodies.length; j++) {
					const physicProperties = bodies[j];

					const position = new Vector3().copy(
						physicProperties.rigidBody.translation()
					);
					this._quaternion.copy(physicProperties.rigidBody.rotation());

					this._matrix
						.compose(position, this._quaternion, this._scale)
						.toArray(array, j * 16);
				}

				mesh.instanceMatrix.needsUpdate = true;
				mesh.computeBoundingSphere();
			} else {
				/** @type {PhysicProperties} */
				const physicProperties = this.dynamicObjectMap.get(mesh);

				mesh.position.copy(physicProperties.rigidBody.translation());
				mesh.quaternion.copy(physicProperties.rigidBody.rotation());
			}
		}
	}
}

export async function RapierPhysics() {
	if (RAPIER === null) await (RAPIER = await import(RAPIER_PATH)).init();

	const _rapierPhysics = new Physic(RAPIER);

	return _rapierPhysics;
}
