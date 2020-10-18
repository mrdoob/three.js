"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.MMDPhysics = void 0;

var MMDPhysics = function () {
  function MMDPhysics(mesh, rigidBodyParams, constraintParams, params) {
    if (typeof Ammo === 'undefined') {
      throw new Error('THREE.MMDPhysics: Import ammo.js https://github.com/kripken/ammo.js');
    }

    constraintParams = constraintParams || [];
    params = params || {};
    this.manager = new ResourceManager();
    this.mesh = mesh;
    this.unitStep = params.unitStep !== undefined ? params.unitStep : 1 / 65;
    this.maxStepNum = params.maxStepNum !== undefined ? params.maxStepNum : 3;
    this.gravity = new THREE.Vector3(0, -9.8 * 10, 0);
    if (params.gravity !== undefined) this.gravity.copy(params.gravity);
    this.world = params.world !== undefined ? params.world : null;
    this.bodies = [];
    this.constraints = [];

    this._init(mesh, rigidBodyParams, constraintParams);
  }

  MMDPhysics.prototype = {
    constructor: MMDPhysics,
    update: function update(delta) {
      var manager = this.manager;
      var mesh = this.mesh;
      var isNonDefaultScale = false;
      var position = manager.allocThreeVector3();
      var quaternion = manager.allocThreeQuaternion();
      var scale = manager.allocThreeVector3();
      mesh.matrixWorld.decompose(position, quaternion, scale);

      if (scale.x !== 1 || scale.y !== 1 || scale.z !== 1) {
        isNonDefaultScale = true;
      }

      var parent;

      if (isNonDefaultScale) {
        parent = mesh.parent;
        if (parent !== null) mesh.parent = null;
        scale.copy(this.mesh.scale);
        mesh.scale.set(1, 1, 1);
        mesh.updateMatrixWorld(true);
      }

      this._updateRigidBodies();

      this._stepSimulation(delta);

      this._updateBones();

      if (isNonDefaultScale) {
        if (parent !== null) mesh.parent = parent;
        mesh.scale.copy(scale);
      }

      manager.freeThreeVector3(scale);
      manager.freeThreeQuaternion(quaternion);
      manager.freeThreeVector3(position);
      return this;
    },
    reset: function reset() {
      for (var i = 0, il = this.bodies.length; i < il; i++) {
        this.bodies[i].reset();
      }

      return this;
    },
    warmup: function warmup(cycles) {
      for (var i = 0; i < cycles; i++) {
        this.update(1 / 60);
      }

      return this;
    },
    setGravity: function setGravity(gravity) {
      this.world.setGravity(new Ammo.btVector3(gravity.x, gravity.y, gravity.z));
      this.gravity.copy(gravity);
      return this;
    },
    createHelper: function createHelper() {
      return new MMDPhysicsHelper(this.mesh, this);
    },
    _init: function _init(mesh, rigidBodyParams, constraintParams) {
      var manager = this.manager;
      var parent = mesh.parent;
      if (parent !== null) parent = null;
      var currentPosition = manager.allocThreeVector3();
      var currentQuaternion = manager.allocThreeQuaternion();
      var currentScale = manager.allocThreeVector3();
      currentPosition.copy(mesh.position);
      currentQuaternion.copy(mesh.quaternion);
      currentScale.copy(mesh.scale);
      mesh.position.set(0, 0, 0);
      mesh.quaternion.set(0, 0, 0, 1);
      mesh.scale.set(1, 1, 1);
      mesh.updateMatrixWorld(true);

      if (this.world === null) {
        this.world = this._createWorld();
        this.setGravity(this.gravity);
      }

      this._initRigidBodies(rigidBodyParams);

      this._initConstraints(constraintParams);

      if (parent !== null) mesh.parent = parent;
      mesh.position.copy(currentPosition);
      mesh.quaternion.copy(currentQuaternion);
      mesh.scale.copy(currentScale);
      mesh.updateMatrixWorld(true);
      this.reset();
      manager.freeThreeVector3(currentPosition);
      manager.freeThreeQuaternion(currentQuaternion);
      manager.freeThreeVector3(currentScale);
    },
    _createWorld: function _createWorld() {
      var config = new Ammo.btDefaultCollisionConfiguration();
      var dispatcher = new Ammo.btCollisionDispatcher(config);
      var cache = new Ammo.btDbvtBroadphase();
      var solver = new Ammo.btSequentialImpulseConstraintSolver();
      var world = new Ammo.btDiscreteDynamicsWorld(dispatcher, cache, solver, config);
      return world;
    },
    _initRigidBodies: function _initRigidBodies(rigidBodies) {
      for (var i = 0, il = rigidBodies.length; i < il; i++) {
        this.bodies.push(new RigidBody(this.mesh, this.world, rigidBodies[i], this.manager));
      }
    },
    _initConstraints: function _initConstraints(constraints) {
      for (var i = 0, il = constraints.length; i < il; i++) {
        var params = constraints[i];
        var bodyA = this.bodies[params.rigidBodyIndex1];
        var bodyB = this.bodies[params.rigidBodyIndex2];
        this.constraints.push(new Constraint(this.mesh, this.world, bodyA, bodyB, params, this.manager));
      }
    },
    _stepSimulation: function _stepSimulation(delta) {
      var unitStep = this.unitStep;
      var stepTime = delta;
      var maxStepNum = (delta / unitStep | 0) + 1;

      if (stepTime < unitStep) {
        stepTime = unitStep;
        maxStepNum = 1;
      }

      if (maxStepNum > this.maxStepNum) {
        maxStepNum = this.maxStepNum;
      }

      this.world.stepSimulation(stepTime, maxStepNum, unitStep);
    },
    _updateRigidBodies: function _updateRigidBodies() {
      for (var i = 0, il = this.bodies.length; i < il; i++) {
        this.bodies[i].updateFromBone();
      }
    },
    _updateBones: function _updateBones() {
      for (var i = 0, il = this.bodies.length; i < il; i++) {
        this.bodies[i].updateBone();
      }
    }
  };

  function ResourceManager() {
    this.threeVector3s = [];
    this.threeMatrix4s = [];
    this.threeQuaternions = [];
    this.threeEulers = [];
    this.transforms = [];
    this.quaternions = [];
    this.vector3s = [];
  }

  ResourceManager.prototype = {
    constructor: ResourceManager,
    allocThreeVector3: function allocThreeVector3() {
      return this.threeVector3s.length > 0 ? this.threeVector3s.pop() : new Vector3();
    },
    freeThreeVector3: function freeThreeVector3(v) {
      this.threeVector3s.push(v);
    },
    allocThreeMatrix4: function allocThreeMatrix4() {
      return this.threeMatrix4s.length > 0 ? this.threeMatrix4s.pop() : new THREE.Matrix4();
    },
    freeThreeMatrix4: function freeThreeMatrix4(m) {
      this.threeMatrix4s.push(m);
    },
    allocThreeQuaternion: function allocThreeQuaternion() {
      return this.threeQuaternions.length > 0 ? this.threeQuaternions.pop() : new THREE.Quaternion();
    },
    freeThreeQuaternion: function freeThreeQuaternion(q) {
      this.threeQuaternions.push(q);
    },
    allocThreeEuler: function allocThreeEuler() {
      return this.threeEulers.length > 0 ? this.threeEulers.pop() : new THREE.Euler();
    },
    freeThreeEuler: function freeThreeEuler(e) {
      this.threeEulers.push(e);
    },
    allocTransform: function allocTransform() {
      return this.transforms.length > 0 ? this.transforms.pop() : new Ammo.btTransform();
    },
    freeTransform: function freeTransform(t) {
      this.transforms.push(t);
    },
    allocQuaternion: function allocQuaternion() {
      return this.quaternions.length > 0 ? this.quaternions.pop() : new Ammo.btQuaternion();
    },
    freeQuaternion: function freeQuaternion(q) {
      this.quaternions.push(q);
    },
    allocVector3: function allocVector3() {
      return this.vector3s.length > 0 ? this.vector3s.pop() : new Ammo.btVector3();
    },
    freeVector3: function freeVector3(v) {
      this.vector3s.push(v);
    },
    setIdentity: function setIdentity(t) {
      t.setIdentity();
    },
    getBasis: function getBasis(t) {
      var q = this.allocQuaternion();
      t.getBasis().getRotation(q);
      return q;
    },
    getBasisAsMatrix3: function getBasisAsMatrix3(t) {
      var q = this.getBasis(t);
      var m = this.quaternionToMatrix3(q);
      this.freeQuaternion(q);
      return m;
    },
    getOrigin: function getOrigin(t) {
      return t.getOrigin();
    },
    setOrigin: function setOrigin(t, v) {
      t.getOrigin().setValue(v.x(), v.y(), v.z());
    },
    copyOrigin: function copyOrigin(t1, t2) {
      var o = t2.getOrigin();
      this.setOrigin(t1, o);
    },
    setBasis: function setBasis(t, q) {
      t.setRotation(q);
    },
    setBasisFromMatrix3: function setBasisFromMatrix3(t, m) {
      var q = this.matrix3ToQuaternion(m);
      this.setBasis(t, q);
      this.freeQuaternion(q);
    },
    setOriginFromArray3: function setOriginFromArray3(t, a) {
      t.getOrigin().setValue(a[0], a[1], a[2]);
    },
    setOriginFromThreeVector3: function setOriginFromThreeVector3(t, v) {
      t.getOrigin().setValue(v.x, v.y, v.z);
    },
    setBasisFromArray3: function setBasisFromArray3(t, a) {
      var thQ = this.allocThreeQuaternion();
      var thE = this.allocThreeEuler();
      thE.set(a[0], a[1], a[2]);
      this.setBasisFromThreeQuaternion(t, thQ.setFromEuler(thE));
      this.freeThreeEuler(thE);
      this.freeThreeQuaternion(thQ);
    },
    setBasisFromThreeQuaternion: function setBasisFromThreeQuaternion(t, a) {
      var q = this.allocQuaternion();
      q.setX(a.x);
      q.setY(a.y);
      q.setZ(a.z);
      q.setW(a.w);
      this.setBasis(t, q);
      this.freeQuaternion(q);
    },
    multiplyTransforms: function multiplyTransforms(t1, t2) {
      var t = this.allocTransform();
      this.setIdentity(t);
      var m1 = this.getBasisAsMatrix3(t1);
      var m2 = this.getBasisAsMatrix3(t2);
      var o1 = this.getOrigin(t1);
      var o2 = this.getOrigin(t2);
      var v1 = this.multiplyMatrix3ByVector3(m1, o2);
      var v2 = this.addVector3(v1, o1);
      this.setOrigin(t, v2);
      var m3 = this.multiplyMatrices3(m1, m2);
      this.setBasisFromMatrix3(t, m3);
      this.freeVector3(v1);
      this.freeVector3(v2);
      return t;
    },
    inverseTransform: function inverseTransform(t) {
      var t2 = this.allocTransform();
      var m1 = this.getBasisAsMatrix3(t);
      var o = this.getOrigin(t);
      var m2 = this.transposeMatrix3(m1);
      var v1 = this.negativeVector3(o);
      var v2 = this.multiplyMatrix3ByVector3(m2, v1);
      this.setOrigin(t2, v2);
      this.setBasisFromMatrix3(t2, m2);
      this.freeVector3(v1);
      this.freeVector3(v2);
      return t2;
    },
    multiplyMatrices3: function multiplyMatrices3(m1, m2) {
      var m3 = [];
      var v10 = this.rowOfMatrix3(m1, 0);
      var v11 = this.rowOfMatrix3(m1, 1);
      var v12 = this.rowOfMatrix3(m1, 2);
      var v20 = this.columnOfMatrix3(m2, 0);
      var v21 = this.columnOfMatrix3(m2, 1);
      var v22 = this.columnOfMatrix3(m2, 2);
      m3[0] = this.dotVectors3(v10, v20);
      m3[1] = this.dotVectors3(v10, v21);
      m3[2] = this.dotVectors3(v10, v22);
      m3[3] = this.dotVectors3(v11, v20);
      m3[4] = this.dotVectors3(v11, v21);
      m3[5] = this.dotVectors3(v11, v22);
      m3[6] = this.dotVectors3(v12, v20);
      m3[7] = this.dotVectors3(v12, v21);
      m3[8] = this.dotVectors3(v12, v22);
      this.freeVector3(v10);
      this.freeVector3(v11);
      this.freeVector3(v12);
      this.freeVector3(v20);
      this.freeVector3(v21);
      this.freeVector3(v22);
      return m3;
    },
    addVector3: function addVector3(v1, v2) {
      var v = this.allocVector3();
      v.setValue(v1.x() + v2.x(), v1.y() + v2.y(), v1.z() + v2.z());
      return v;
    },
    dotVectors3: function dotVectors3(v1, v2) {
      return v1.x() * v2.x() + v1.y() * v2.y() + v1.z() * v2.z();
    },
    rowOfMatrix3: function rowOfMatrix3(m, i) {
      var v = this.allocVector3();
      v.setValue(m[i * 3 + 0], m[i * 3 + 1], m[i * 3 + 2]);
      return v;
    },
    columnOfMatrix3: function columnOfMatrix3(m, i) {
      var v = this.allocVector3();
      v.setValue(m[i + 0], m[i + 3], m[i + 6]);
      return v;
    },
    negativeVector3: function negativeVector3(v) {
      var v2 = this.allocVector3();
      v2.setValue(-v.x(), -v.y(), -v.z());
      return v2;
    },
    multiplyMatrix3ByVector3: function multiplyMatrix3ByVector3(m, v) {
      var v4 = this.allocVector3();
      var v0 = this.rowOfMatrix3(m, 0);
      var v1 = this.rowOfMatrix3(m, 1);
      var v2 = this.rowOfMatrix3(m, 2);
      var x = this.dotVectors3(v0, v);
      var y = this.dotVectors3(v1, v);
      var z = this.dotVectors3(v2, v);
      v4.setValue(x, y, z);
      this.freeVector3(v0);
      this.freeVector3(v1);
      this.freeVector3(v2);
      return v4;
    },
    transposeMatrix3: function transposeMatrix3(m) {
      var m2 = [];
      m2[0] = m[0];
      m2[1] = m[3];
      m2[2] = m[6];
      m2[3] = m[1];
      m2[4] = m[4];
      m2[5] = m[7];
      m2[6] = m[2];
      m2[7] = m[5];
      m2[8] = m[8];
      return m2;
    },
    quaternionToMatrix3: function quaternionToMatrix3(q) {
      var m = [];
      var x = q.x();
      var y = q.y();
      var z = q.z();
      var w = q.w();
      var xx = x * x;
      var yy = y * y;
      var zz = z * z;
      var xy = x * y;
      var yz = y * z;
      var zx = z * x;
      var xw = x * w;
      var yw = y * w;
      var zw = z * w;
      m[0] = 1 - 2 * (yy + zz);
      m[1] = 2 * (xy - zw);
      m[2] = 2 * (zx + yw);
      m[3] = 2 * (xy + zw);
      m[4] = 1 - 2 * (zz + xx);
      m[5] = 2 * (yz - xw);
      m[6] = 2 * (zx - yw);
      m[7] = 2 * (yz + xw);
      m[8] = 1 - 2 * (xx + yy);
      return m;
    },
    matrix3ToQuaternion: function matrix3ToQuaternion(m) {
      var t = m[0] + m[4] + m[8];
      var s, x, y, z, w;

      if (t > 0) {
        s = Math.sqrt(t + 1.0) * 2;
        w = 0.25 * s;
        x = (m[7] - m[5]) / s;
        y = (m[2] - m[6]) / s;
        z = (m[3] - m[1]) / s;
      } else if (m[0] > m[4] && m[0] > m[8]) {
        s = Math.sqrt(1.0 + m[0] - m[4] - m[8]) * 2;
        w = (m[7] - m[5]) / s;
        x = 0.25 * s;
        y = (m[1] + m[3]) / s;
        z = (m[2] + m[6]) / s;
      } else if (m[4] > m[8]) {
        s = Math.sqrt(1.0 + m[4] - m[0] - m[8]) * 2;
        w = (m[2] - m[6]) / s;
        x = (m[1] + m[3]) / s;
        y = 0.25 * s;
        z = (m[5] + m[7]) / s;
      } else {
        s = Math.sqrt(1.0 + m[8] - m[0] - m[4]) * 2;
        w = (m[3] - m[1]) / s;
        x = (m[2] + m[6]) / s;
        y = (m[5] + m[7]) / s;
        z = 0.25 * s;
      }

      var q = this.allocQuaternion();
      q.setX(x);
      q.setY(y);
      q.setZ(z);
      q.setW(w);
      return q;
    }
  };

  function RigidBody(mesh, world, params, manager) {
    this.mesh = mesh;
    this.world = world;
    this.params = params;
    this.manager = manager;
    this.body = null;
    this.bone = null;
    this.boneOffsetForm = null;
    this.boneOffsetFormInverse = null;

    this._init();
  }

  RigidBody.prototype = {
    constructor: MMDPhysics.RigidBody,
    reset: function reset() {
      this._setTransformFromBone();

      return this;
    },
    updateFromBone: function updateFromBone() {
      if (this.params.boneIndex !== -1 && this.params.type === 0) {
        this._setTransformFromBone();
      }

      return this;
    },
    updateBone: function updateBone() {
      if (this.params.type === 0 || this.params.boneIndex === -1) {
        return this;
      }

      this._updateBoneRotation();

      if (this.params.type === 1) {
        this._updateBonePosition();
      }

      this.bone.updateMatrixWorld(true);

      if (this.params.type === 2) {
        this._setPositionFromBone();
      }

      return this;
    },
    _init: function _init() {
      function generateShape(p) {
        switch (p.shapeType) {
          case 0:
            return new Ammo.btSphereShape(p.width);

          case 1:
            return new Ammo.btBoxShape(new Ammo.btVector3(p.width, p.height, p.depth));

          case 2:
            return new Ammo.btCapsuleShape(p.width, p.height);

          default:
            throw 'unknown shape type ' + p.shapeType;
        }
      }

      var manager = this.manager;
      var params = this.params;
      var bones = this.mesh.skeleton.bones;
      var bone = params.boneIndex === -1 ? new THREE.Bone() : bones[params.boneIndex];
      var shape = generateShape(params);
      var weight = params.type === 0 ? 0 : params.weight;
      var localInertia = manager.allocVector3();
      localInertia.setValue(0, 0, 0);

      if (weight !== 0) {
        shape.calculateLocalInertia(weight, localInertia);
      }

      var boneOffsetForm = manager.allocTransform();
      manager.setIdentity(boneOffsetForm);
      manager.setOriginFromArray3(boneOffsetForm, params.position);
      manager.setBasisFromArray3(boneOffsetForm, params.rotation);
      var vector = manager.allocThreeVector3();
      var boneForm = manager.allocTransform();
      manager.setIdentity(boneForm);
      manager.setOriginFromThreeVector3(boneForm, bone.getWorldPosition(vector));
      var form = manager.multiplyTransforms(boneForm, boneOffsetForm);
      var state = new Ammo.btDefaultMotionState(form);
      var info = new Ammo.btRigidBodyConstructionInfo(weight, state, shape, localInertia);
      info.set_m_friction(params.friction);
      info.set_m_restitution(params.restitution);
      var body = new Ammo.btRigidBody(info);

      if (params.type === 0) {
        body.setCollisionFlags(body.getCollisionFlags() | 2);
        body.setActivationState(4);
      }

      body.setDamping(params.positionDamping, params.rotationDamping);
      body.setSleepingThresholds(0, 0);
      this.world.addRigidBody(body, 1 << params.groupIndex, params.groupTarget);
      this.body = body;
      this.bone = bone;
      this.boneOffsetForm = boneOffsetForm;
      this.boneOffsetFormInverse = manager.inverseTransform(boneOffsetForm);
      manager.freeVector3(localInertia);
      manager.freeTransform(form);
      manager.freeTransform(boneForm);
      manager.freeThreeVector3(vector);
    },
    _getBoneTransform: function _getBoneTransform() {
      var manager = this.manager;
      var p = manager.allocThreeVector3();
      var q = manager.allocThreeQuaternion();
      var s = manager.allocThreeVector3();
      this.bone.matrixWorld.decompose(p, q, s);
      var tr = manager.allocTransform();
      manager.setOriginFromThreeVector3(tr, p);
      manager.setBasisFromThreeQuaternion(tr, q);
      var form = manager.multiplyTransforms(tr, this.boneOffsetForm);
      manager.freeTransform(tr);
      manager.freeThreeVector3(s);
      manager.freeThreeQuaternion(q);
      manager.freeThreeVector3(p);
      return form;
    },
    _getWorldTransformForBone: function _getWorldTransformForBone() {
      var manager = this.manager;
      var tr = this.body.getCenterOfMassTransform();
      return manager.multiplyTransforms(tr, this.boneOffsetFormInverse);
    },
    _setTransformFromBone: function _setTransformFromBone() {
      var manager = this.manager;

      var form = this._getBoneTransform();

      this.body.setCenterOfMassTransform(form);
      this.body.getMotionState().setWorldTransform(form);
      manager.freeTransform(form);
    },
    _setPositionFromBone: function _setPositionFromBone() {
      var manager = this.manager;

      var form = this._getBoneTransform();

      var tr = manager.allocTransform();
      this.body.getMotionState().getWorldTransform(tr);
      manager.copyOrigin(tr, form);
      this.body.setCenterOfMassTransform(tr);
      this.body.getMotionState().setWorldTransform(tr);
      manager.freeTransform(tr);
      manager.freeTransform(form);
    },
    _updateBoneRotation: function _updateBoneRotation() {
      var manager = this.manager;

      var tr = this._getWorldTransformForBone();

      var q = manager.getBasis(tr);
      var thQ = manager.allocThreeQuaternion();
      var thQ2 = manager.allocThreeQuaternion();
      var thQ3 = manager.allocThreeQuaternion();
      thQ.set(q.x(), q.y(), q.z(), q.w());
      thQ2.setFromRotationMatrix(this.bone.matrixWorld);
      thQ2.conjugate();
      thQ2.multiply(thQ);
      thQ3.setFromRotationMatrix(this.bone.matrix);
      this.bone.quaternion.copy(thQ2.multiply(thQ3).normalize());
      manager.freeThreeQuaternion(thQ);
      manager.freeThreeQuaternion(thQ2);
      manager.freeThreeQuaternion(thQ3);
      manager.freeQuaternion(q);
      manager.freeTransform(tr);
    },
    _updateBonePosition: function _updateBonePosition() {
      var manager = this.manager;

      var tr = this._getWorldTransformForBone();

      var thV = manager.allocThreeVector3();
      var o = manager.getOrigin(tr);
      thV.set(o.x(), o.y(), o.z());

      if (this.bone.parent) {
        this.bone.parent.worldToLocal(thV);
      }

      this.bone.position.copy(thV);
      manager.freeThreeVector3(thV);
      manager.freeTransform(tr);
    }
  };

  function Constraint(mesh, world, bodyA, bodyB, params, manager) {
    this.mesh = mesh;
    this.world = world;
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.params = params;
    this.manager = manager;
    this.constraint = null;

    this._init();
  }

  Constraint.prototype = {
    constructor: Constraint,
    _init: function _init() {
      var manager = this.manager;
      var params = this.params;
      var bodyA = this.bodyA;
      var bodyB = this.bodyB;
      var form = manager.allocTransform();
      manager.setIdentity(form);
      manager.setOriginFromArray3(form, params.position);
      manager.setBasisFromArray3(form, params.rotation);
      var formA = manager.allocTransform();
      var formB = manager.allocTransform();
      bodyA.body.getMotionState().getWorldTransform(formA);
      bodyB.body.getMotionState().getWorldTransform(formB);
      var formInverseA = manager.inverseTransform(formA);
      var formInverseB = manager.inverseTransform(formB);
      var formA2 = manager.multiplyTransforms(formInverseA, form);
      var formB2 = manager.multiplyTransforms(formInverseB, form);
      var constraint = new Ammo.btGeneric6DofSpringConstraint(bodyA.body, bodyB.body, formA2, formB2, true);
      var lll = manager.allocVector3();
      var lul = manager.allocVector3();
      var all = manager.allocVector3();
      var aul = manager.allocVector3();
      lll.setValue(params.translationLimitation1[0], params.translationLimitation1[1], params.translationLimitation1[2]);
      lul.setValue(params.translationLimitation2[0], params.translationLimitation2[1], params.translationLimitation2[2]);
      all.setValue(params.rotationLimitation1[0], params.rotationLimitation1[1], params.rotationLimitation1[2]);
      aul.setValue(params.rotationLimitation2[0], params.rotationLimitation2[1], params.rotationLimitation2[2]);
      constraint.setLinearLowerLimit(lll);
      constraint.setLinearUpperLimit(lul);
      constraint.setAngularLowerLimit(all);
      constraint.setAngularUpperLimit(aul);

      for (var i = 0; i < 3; i++) {
        if (params.springPosition[i] !== 0) {
          constraint.enableSpring(i, true);
          constraint.setStiffness(i, params.springPosition[i]);
        }
      }

      for (var i = 0; i < 3; i++) {
        if (params.springRotation[i] !== 0) {
          constraint.enableSpring(i + 3, true);
          constraint.setStiffness(i + 3, params.springRotation[i]);
        }
      }

      if (constraint.setParam !== undefined) {
        for (var i = 0; i < 6; i++) {
          constraint.setParam(2, 0.475, i);
        }
      }

      this.world.addConstraint(constraint, true);
      this.constraint = constraint;
      manager.freeTransform(form);
      manager.freeTransform(formA);
      manager.freeTransform(formB);
      manager.freeTransform(formInverseA);
      manager.freeTransform(formInverseB);
      manager.freeTransform(formA2);
      manager.freeTransform(formB2);
      manager.freeVector3(lll);
      manager.freeVector3(lul);
      manager.freeVector3(all);
      manager.freeVector3(aul);
    }
  };

  function MMDPhysicsHelper(mesh, physics) {
    Object3D.call(this);
    this.root = mesh;
    this.physics = physics;
    this.matrix.copy(mesh.matrixWorld);
    this.matrixAutoUpdate = false;
    this.materials = [];
    this.materials.push(new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff8888),
      wireframe: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0.25,
      transparent: true
    }));
    this.materials.push(new MeshBasicMaterial({
      color: new Color(0x88ff88),
      wireframe: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0.25,
      transparent: true
    }));
    this.materials.push(new MeshBasicMaterial({
      color: new Color(0x8888ff),
      wireframe: true,
      depthTest: false,
      depthWrite: false,
      opacity: 0.25,
      transparent: true
    }));

    this._init();
  }

  MMDPhysicsHelper.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
    constructor: MMDPhysicsHelper,
    updateMatrixWorld: function () {
      var position = new Vector3();
      var quaternion = new Quaternion();
      var scale = new Vector3();
      var matrixWorldInv = new Matrix4();
      return function updateMatrixWorld(force) {
        var mesh = this.root;

        if (this.visible) {
          var bodies = this.physics.bodies;
          matrixWorldInv.copy(mesh.matrixWorld).decompose(position, quaternion, scale).compose(position, quaternion, scale.set(1, 1, 1)).getInverse(matrixWorldInv);

          for (var i = 0, il = bodies.length; i < il; i++) {
            var body = bodies[i].body;
            var child = this.children[i];
            var tr = body.getCenterOfMassTransform();
            var origin = tr.getOrigin();
            var rotation = tr.getRotation();
            child.position.set(origin.x(), origin.y(), origin.z()).applyMatrix4(matrixWorldInv);
            child.quaternion.setFromRotationMatrix(matrixWorldInv).multiply(quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w()));
          }
        }

        this.matrix.copy(mesh.matrixWorld).decompose(position, quaternion, scale).compose(position, quaternion, scale.set(1, 1, 1));
        Object3D.prototype.updateMatrixWorld.call(this, force);
      };
    }(),
    _init: function _init() {
      var bodies = this.physics.bodies;

      function createGeometry(param) {
        switch (param.shapeType) {
          case 0:
            return new THREE.SphereBufferGeometry(param.width, 16, 8);

          case 1:
            return new THREE.BoxBufferGeometry(param.width * 2, param.height * 2, param.depth * 2, 8, 8, 8);

          case 2:
            return new createCapsuleGeometry(param.width, param.height, 16, 8);

          default:
            return null;
        }
      }

      function createCapsuleGeometry(radius, cylinderHeight, segmentsRadius, segmentsHeight) {
        var geometry = new THREE.CylinderBufferGeometry(radius, radius, cylinderHeight, segmentsRadius, segmentsHeight, true);
        var upperSphere = new Mesh(new SphereBufferGeometry(radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, 0, Math.PI / 2));
        var lowerSphere = new Mesh(new SphereBufferGeometry(radius, segmentsRadius, segmentsHeight, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2));
        upperSphere.position.set(0, cylinderHeight / 2, 0);
        lowerSphere.position.set(0, -cylinderHeight / 2, 0);
        upperSphere.updateMatrix();
        lowerSphere.updateMatrix();
        geometry.merge(upperSphere.geometry, upperSphere.matrix);
        geometry.merge(lowerSphere.geometry, lowerSphere.matrix);
        return geometry;
      }

      for (var i = 0, il = bodies.length; i < il; i++) {
        var param = bodies[i].params;
        this.add(new Mesh(createGeometry(param), this.materials[param.type]));
      }
    }
  });
  return MMDPhysics;
}();

THREE.MMDPhysics = MMDPhysics;