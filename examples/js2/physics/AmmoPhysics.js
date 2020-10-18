"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.AmmoPhysics = AmmoPhysics;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function AmmoPhysics() {
  return _AmmoPhysics.apply(this, arguments);
}

function _AmmoPhysics() {
  _AmmoPhysics = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var AmmoLib, frameRate, collisionConfiguration, dispatcher, broadphase, solver, world, worldTransform, getShape, meshes, meshMap, addMesh, handleMesh, handleInstancedMesh, setMeshPosition, lastTime, step;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            step = function _step() {
              var time = performance.now();

              if (lastTime > 0) {
                var delta = (time - lastTime) / 1000;
                world.stepSimulation(delta, 10);
              }

              lastTime = time;

              for (var i = 0, l = meshes.length; i < l; i++) {
                var mesh = meshes[i];

                if (mesh.isInstancedMesh) {
                  var array = mesh.instanceMatrix.array;
                  var bodies = meshMap.get(mesh);

                  for (var j = 0; j < bodies.length; j++) {
                    var body = bodies[j];
                    var motionState = body.getMotionState();
                    motionState.getWorldTransform(worldTransform);
                    var position = worldTransform.getOrigin();
                    var quaternion = worldTransform.getRotation();
                    compose(position, quaternion, array, j * 16);
                  }

                  mesh.instanceMatrix.needsUpdate = true;
                } else if (mesh.isMesh) {
                  var _body2 = meshMap.get(mesh);

                  var _motionState = _body2.getMotionState();

                  _motionState.getWorldTransform(worldTransform);

                  var _position = worldTransform.getOrigin();

                  var _quaternion = worldTransform.getRotation();

                  mesh.position.set(_position.x(), _position.y(), _position.z());
                  mesh.quaternion.set(_quaternion.x(), _quaternion.y(), _quaternion.z(), _quaternion.w());
                }
              }
            };

            setMeshPosition = function _setMeshPosition(mesh, position) {
              var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

              if (mesh.isInstancedMesh) {
                var bodies = meshMap.get(mesh);
                var body = bodies[index];
                body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
                body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));
                worldTransform.setIdentity();
                worldTransform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
                body.setWorldTransform(worldTransform);
              } else if (mesh.isMesh) {
                var _body = meshMap.get(mesh);

                _body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));

                _body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));

                worldTransform.setIdentity();
                worldTransform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));

                _body.setWorldTransform(worldTransform);
              }
            };

            handleInstancedMesh = function _handleInstancedMesh(mesh, mass, shape) {
              var array = mesh.instanceMatrix.array;
              var bodies = [];

              for (var i = 0; i < mesh.count; i++) {
                var index = i * 16;
                var transform = new AmmoLib.btTransform();
                transform.setFromOpenGLMatrix(array.slice(index, index + 16));
                var motionState = new AmmoLib.btDefaultMotionState(transform);
                var localInertia = new AmmoLib.btVector3(0, 0, 0);
                shape.calculateLocalInertia(mass, localInertia);
                var rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
                var body = new AmmoLib.btRigidBody(rbInfo);
                world.addRigidBody(body);
                bodies.push(body);
              }

              if (mass > 0) {
                mesh.instanceMatrix.setUsage(35048);
                meshes.push(mesh);
                meshMap.set(mesh, bodies);
              }
            };

            handleMesh = function _handleMesh(mesh, mass, shape) {
              var position = mesh.position;
              var quaternion = mesh.quaternion;
              var transform = new AmmoLib.btTransform();
              transform.setIdentity();
              transform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
              transform.setRotation(new AmmoLib.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));
              var motionState = new AmmoLib.btDefaultMotionState(transform);
              var localInertia = new AmmoLib.btVector3(0, 0, 0);
              shape.calculateLocalInertia(mass, localInertia);
              var rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
              var body = new AmmoLib.btRigidBody(rbInfo);
              world.addRigidBody(body);

              if (mass > 0) {
                meshes.push(mesh);
                meshMap.set(mesh, body);
              }
            };

            addMesh = function _addMesh(mesh) {
              var mass = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
              var shape = getShape(mesh.geometry);

              if (shape !== null) {
                if (mesh.isInstancedMesh) {
                  handleInstancedMesh(mesh, mass, shape);
                } else if (mesh.isMesh) {
                  handleMesh(mesh, mass, shape);
                }
              }
            };

            getShape = function _getShape(geometry) {
              var parameters = geometry.parameters;

              if (geometry.type === 'BoxBufferGeometry') {
                var sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
                var sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
                var sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;
                var shape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(sx, sy, sz));
                shape.setMargin(0.05);
                return shape;
              } else if (geometry.type === 'SphereBufferGeometry' || geometry.type === 'IcosahedronBufferGeometry') {
                var radius = parameters.radius !== undefined ? parameters.radius : 1;

                var _shape = new AmmoLib.btSphereShape(radius);

                _shape.setMargin(0.05);

                return _shape;
              }

              return null;
            };

            if (!('Ammo' in window === false)) {
              _context.next = 9;
              break;
            }

            console.error('AmmoPhysics: Couldn\'t find Ammo.js');
            return _context.abrupt("return");

          case 9:
            _context.next = 11;
            return Ammo();

          case 11:
            AmmoLib = _context.sent;
            frameRate = 60;
            collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
            dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
            broadphase = new AmmoLib.btDbvtBroadphase();
            solver = new AmmoLib.btSequentialImpulseConstraintSolver();
            world = new AmmoLib.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
            world.setGravity(new AmmoLib.btVector3(0, -9.8, 0));
            worldTransform = new AmmoLib.btTransform();
            meshes = [];
            meshMap = new WeakMap();
            lastTime = 0;
            setInterval(step, 1000 / frameRate);
            return _context.abrupt("return", {
              addMesh: addMesh,
              setMeshPosition: setMeshPosition
            });

          case 25:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _AmmoPhysics.apply(this, arguments);
}

function compose(position, quaternion, array, index) {
  var x = quaternion.x(),
      y = quaternion.y(),
      z = quaternion.z(),
      w = quaternion.w();
  var x2 = x + x,
      y2 = y + y,
      z2 = z + z;
  var xx = x * x2,
      xy = x * y2,
      xz = x * z2;
  var yy = y * y2,
      yz = y * z2,
      zz = z * z2;
  var wx = w * x2,
      wy = w * y2,
      wz = w * z2;
  array[index + 0] = 1 - (yy + zz);
  array[index + 1] = xy + wz;
  array[index + 2] = xz - wy;
  array[index + 3] = 0;
  array[index + 4] = xy - wz;
  array[index + 5] = 1 - (xx + zz);
  array[index + 6] = yz + wx;
  array[index + 7] = 0;
  array[index + 8] = xz + wy;
  array[index + 9] = yz - wx;
  array[index + 10] = 1 - (xx + yy);
  array[index + 11] = 0;
  array[index + 12] = position.x();
  array[index + 13] = position.y();
  array[index + 14] = position.z();
  array[index + 15] = 1;
}