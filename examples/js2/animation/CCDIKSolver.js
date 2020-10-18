"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.CCDIKSolver = void 0;

var CCDIKSolver = function () {
  function CCDIKSolver(mesh, iks) {
    this.mesh = mesh;
    this.iks = iks || [];

    this._valid();
  }

  CCDIKSolver.prototype = {
    constructor: CCDIKSolver,
    update: function () {
      var q = new THREE.Quaternion();
      var targetPos = new THREE.Vector3();
      var targetVec = new Vector3();
      var effectorPos = new Vector3();
      var effectorVec = new Vector3();
      var linkPos = new Vector3();
      var invLinkQ = new Quaternion();
      var linkScale = new Vector3();
      var axis = new Vector3();
      var vector = new Vector3();
      return function update() {
        var bones = this.mesh.skeleton.bones;
        var iks = this.iks;
        var math = Math;

        for (var i = 0, il = iks.length; i < il; i++) {
          var ik = iks[i];
          var effector = bones[ik.effector];
          var target = bones[ik.target];
          targetPos.setFromMatrixPosition(target.matrixWorld);
          var links = ik.links;
          var iteration = ik.iteration !== undefined ? ik.iteration : 1;

          for (var j = 0; j < iteration; j++) {
            var rotated = false;

            for (var k = 0, kl = links.length; k < kl; k++) {
              var link = bones[links[k].index];
              if (links[k].enabled === false) break;
              var limitation = links[k].limitation;
              var rotationMin = links[k].rotationMin;
              var rotationMax = links[k].rotationMax;
              link.matrixWorld.decompose(linkPos, invLinkQ, linkScale);
              invLinkQ.inverse();
              effectorPos.setFromMatrixPosition(effector.matrixWorld);
              effectorVec.subVectors(effectorPos, linkPos);
              effectorVec.applyQuaternion(invLinkQ);
              effectorVec.normalize();
              targetVec.subVectors(targetPos, linkPos);
              targetVec.applyQuaternion(invLinkQ);
              targetVec.normalize();
              var angle = targetVec.dot(effectorVec);

              if (angle > 1.0) {
                angle = 1.0;
              } else if (angle < -1.0) {
                angle = -1.0;
              }

              angle = math.acos(angle);
              if (angle < 1e-5) continue;

              if (ik.minAngle !== undefined && angle < ik.minAngle) {
                angle = ik.minAngle;
              }

              if (ik.maxAngle !== undefined && angle > ik.maxAngle) {
                angle = ik.maxAngle;
              }

              axis.crossVectors(effectorVec, targetVec);
              axis.normalize();
              q.setFromAxisAngle(axis, angle);
              link.quaternion.multiply(q);

              if (limitation !== undefined) {
                var c = link.quaternion.w;
                if (c > 1.0) c = 1.0;
                var c2 = math.sqrt(1 - c * c);
                link.quaternion.set(limitation.x * c2, limitation.y * c2, limitation.z * c2, c);
              }

              if (rotationMin !== undefined) {
                link.rotation.setFromVector3(link.rotation.toVector3(vector).max(rotationMin));
              }

              if (rotationMax !== undefined) {
                link.rotation.setFromVector3(link.rotation.toVector3(vector).min(rotationMax));
              }

              link.updateMatrixWorld(true);
              rotated = true;
            }

            if (!rotated) break;
          }
        }

        return this;
      };
    }(),
    createHelper: function createHelper() {
      return new CCDIKHelper(this.mesh, this.mesh.geometry.userData.MMD.iks);
    },
    _valid: function _valid() {
      var iks = this.iks;
      var bones = this.mesh.skeleton.bones;

      for (var i = 0, il = iks.length; i < il; i++) {
        var ik = iks[i];
        var effector = bones[ik.effector];
        var links = ik.links;
        var link0, link1;
        link0 = effector;

        for (var j = 0, jl = links.length; j < jl; j++) {
          link1 = bones[links[j].index];

          if (link0.parent !== link1) {
            console.warn('THREE.CCDIKSolver: bone ' + link0.name + ' is not the child of bone ' + link1.name);
          }

          link0 = link1;
        }
      }
    }
  };

  function CCDIKHelper(mesh, iks) {
    Object3D.call(this);
    this.root = mesh;
    this.iks = iks || [];
    this.matrix.copy(mesh.matrixWorld);
    this.matrixAutoUpdate = false;
    this.sphereGeometry = new THREE.SphereBufferGeometry(0.25, 16, 8);
    this.targetSphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xff8888),
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.effectorSphereMaterial = new MeshBasicMaterial({
      color: new Color(0x88ff88),
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.linkSphereMaterial = new MeshBasicMaterial({
      color: new Color(0x8888ff),
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: new Color(0xff0000),
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    this._init();
  }

  CCDIKHelper.prototype = Object.assign(Object.create(THREE.Object3D.prototype), {
    constructor: CCDIKHelper,
    updateMatrixWorld: function () {
      var matrix = new THREE.Matrix4();
      var vector = new Vector3();

      function getPosition(bone, matrixWorldInv) {
        return vector.setFromMatrixPosition(bone.matrixWorld).applyMatrix4(matrixWorldInv);
      }

      function setPositionOfBoneToAttributeArray(array, index, bone, matrixWorldInv) {
        var v = getPosition(bone, matrixWorldInv);
        array[index * 3 + 0] = v.x;
        array[index * 3 + 1] = v.y;
        array[index * 3 + 2] = v.z;
      }

      return function updateMatrixWorld(force) {
        var mesh = this.root;

        if (this.visible) {
          var offset = 0;
          var iks = this.iks;
          var bones = mesh.skeleton.bones;
          matrix.getInverse(mesh.matrixWorld);

          for (var i = 0, il = iks.length; i < il; i++) {
            var ik = iks[i];
            var targetBone = bones[ik.target];
            var effectorBone = bones[ik.effector];
            var targetMesh = this.children[offset++];
            var effectorMesh = this.children[offset++];
            targetMesh.position.copy(getPosition(targetBone, matrix));
            effectorMesh.position.copy(getPosition(effectorBone, matrix));

            for (var j = 0, jl = ik.links.length; j < jl; j++) {
              var link = ik.links[j];
              var linkBone = bones[link.index];
              var linkMesh = this.children[offset++];
              linkMesh.position.copy(getPosition(linkBone, matrix));
            }

            var line = this.children[offset++];
            var array = line.geometry.attributes.position.array;
            setPositionOfBoneToAttributeArray(array, 0, targetBone, matrix);
            setPositionOfBoneToAttributeArray(array, 1, effectorBone, matrix);

            for (var j = 0, jl = ik.links.length; j < jl; j++) {
              var link = ik.links[j];
              var linkBone = bones[link.index];
              setPositionOfBoneToAttributeArray(array, j + 2, linkBone, matrix);
            }

            line.geometry.attributes.position.needsUpdate = true;
          }
        }

        this.matrix.copy(mesh.matrixWorld);
        Object3D.prototype.updateMatrixWorld.call(this, force);
      };
    }(),
    _init: function _init() {
      var scope = this;
      var iks = this.iks;

      function createLineGeometry(ik) {
        var geometry = new THREE.BufferGeometry();
        var vertices = new Float32Array((2 + ik.links.length) * 3);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        return geometry;
      }

      function createTargetMesh() {
        return new Mesh(scope.sphereGeometry, scope.targetSphereMaterial);
      }

      function createEffectorMesh() {
        return new Mesh(scope.sphereGeometry, scope.effectorSphereMaterial);
      }

      function createLinkMesh() {
        return new Mesh(scope.sphereGeometry, scope.linkSphereMaterial);
      }

      function createLine(ik) {
        return new Line(createLineGeometry(ik), scope.lineMaterial);
      }

      for (var i = 0, il = iks.length; i < il; i++) {
        var ik = iks[i];
        this.add(createTargetMesh());
        this.add(createEffectorMesh());

        for (var j = 0, jl = ik.links.length; j < jl; j++) {
          this.add(createLinkMesh());
        }

        this.add(createLine(ik));
      }
    }
  });
  return CCDIKSolver;
}();

THREE.CCDIKSolver = CCDIKSolver;