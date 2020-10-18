"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.BVHLoader = void 0;

var BVHLoader = function BVHLoader(manager) {
  Loader.call(this, manager);
  this.animateBonePositions = true;
  this.animateBoneRotations = true;
};

THREE.BVHLoader = BVHLoader;
BVHLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: BVHLoader,
  load: function load(url, onLoad, onProgress, onError) {
    var scope = this;
    var loader = new THREE.FileLoader(scope.manager);
    loader.setPath(scope.path);
    loader.setRequestHeader(scope.requestHeader);
    loader.setWithCredentials(scope.withCredentials);
    loader.load(url, function (text) {
      try {
        onLoad(scope.parse(text));
      } catch (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }

        scope.manager.itemError(url);
      }
    }, onProgress, onError);
  },
  parse: function parse(text) {
    function readBvh(lines) {
      if (nextLine(lines) !== 'HIERARCHY') {
        console.error('THREE.BVHLoader: HIERARCHY expected.');
      }

      var list = [];
      var root = readNode(lines, nextLine(lines), list);

      if (nextLine(lines) !== 'MOTION') {
        console.error('THREE.BVHLoader: MOTION expected.');
      }

      var tokens = nextLine(lines).split(/[\s]+/);
      var numFrames = parseInt(tokens[1]);

      if (isNaN(numFrames)) {
        console.error('THREE.BVHLoader: Failed to read number of frames.');
      }

      tokens = nextLine(lines).split(/[\s]+/);
      var frameTime = parseFloat(tokens[2]);

      if (isNaN(frameTime)) {
        console.error('THREE.BVHLoader: Failed to read frame time.');
      }

      for (var i = 0; i < numFrames; i++) {
        tokens = nextLine(lines).split(/[\s]+/);
        readFrameData(tokens, i * frameTime, root);
      }

      return list;
    }

    function readFrameData(data, frameTime, bone) {
      if (bone.type === 'ENDSITE') return;
      var keyframe = {
        time: frameTime,
        position: new THREE.Vector3(),
        rotation: new THREE.Quaternion()
      };
      bone.frames.push(keyframe);
      var quat = new Quaternion();
      var vx = new Vector3(1, 0, 0);
      var vy = new Vector3(0, 1, 0);
      var vz = new Vector3(0, 0, 1);

      for (var i = 0; i < bone.channels.length; i++) {
        switch (bone.channels[i]) {
          case 'Xposition':
            keyframe.position.x = parseFloat(data.shift().trim());
            break;

          case 'Yposition':
            keyframe.position.y = parseFloat(data.shift().trim());
            break;

          case 'Zposition':
            keyframe.position.z = parseFloat(data.shift().trim());
            break;

          case 'Xrotation':
            quat.setFromAxisAngle(vx, parseFloat(data.shift().trim()) * Math.PI / 180);
            keyframe.rotation.multiply(quat);
            break;

          case 'Yrotation':
            quat.setFromAxisAngle(vy, parseFloat(data.shift().trim()) * Math.PI / 180);
            keyframe.rotation.multiply(quat);
            break;

          case 'Zrotation':
            quat.setFromAxisAngle(vz, parseFloat(data.shift().trim()) * Math.PI / 180);
            keyframe.rotation.multiply(quat);
            break;

          default:
            console.warn('THREE.BVHLoader: Invalid channel type.');
        }
      }

      for (var i = 0; i < bone.children.length; i++) {
        readFrameData(data, frameTime, bone.children[i]);
      }
    }

    function readNode(lines, firstline, list) {
      var node = {
        name: '',
        type: '',
        frames: []
      };
      list.push(node);
      var tokens = firstline.split(/[\s]+/);

      if (tokens[0].toUpperCase() === 'END' && tokens[1].toUpperCase() === 'SITE') {
        node.type = 'ENDSITE';
        node.name = 'ENDSITE';
      } else {
        node.name = tokens[1];
        node.type = tokens[0].toUpperCase();
      }

      if (nextLine(lines) !== '{') {
        console.error('THREE.BVHLoader: Expected opening { after type & name');
      }

      tokens = nextLine(lines).split(/[\s]+/);

      if (tokens[0] !== 'OFFSET') {
        console.error('THREE.BVHLoader: Expected OFFSET but got: ' + tokens[0]);
      }

      if (tokens.length !== 4) {
        console.error('THREE.BVHLoader: Invalid number of values for OFFSET.');
      }

      var offset = new Vector3(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));

      if (isNaN(offset.x) || isNaN(offset.y) || isNaN(offset.z)) {
        console.error('THREE.BVHLoader: Invalid values of OFFSET.');
      }

      node.offset = offset;

      if (node.type !== 'ENDSITE') {
        tokens = nextLine(lines).split(/[\s]+/);

        if (tokens[0] !== 'CHANNELS') {
          console.error('THREE.BVHLoader: Expected CHANNELS definition.');
        }

        var numChannels = parseInt(tokens[1]);
        node.channels = tokens.splice(2, numChannels);
        node.children = [];
      }

      while (true) {
        var line = nextLine(lines);

        if (line === '}') {
          return node;
        } else {
          node.children.push(readNode(lines, line, list));
        }
      }
    }

    function toTHREEBone(source, list) {
      var bone = new THREE.Bone();
      list.push(bone);
      bone.position.add(source.offset);
      bone.name = source.name;

      if (source.type !== 'ENDSITE') {
        for (var i = 0; i < source.children.length; i++) {
          bone.add(toTHREEBone(source.children[i], list));
        }
      }

      return bone;
    }

    function toTHREEAnimation(bones) {
      var tracks = [];

      for (var i = 0; i < bones.length; i++) {
        var bone = bones[i];
        if (bone.type === 'ENDSITE') continue;
        var times = [];
        var positions = [];
        var rotations = [];

        for (var j = 0; j < bone.frames.length; j++) {
          var frame = bone.frames[j];
          times.push(frame.time);
          positions.push(frame.position.x + bone.offset.x);
          positions.push(frame.position.y + bone.offset.y);
          positions.push(frame.position.z + bone.offset.z);
          rotations.push(frame.rotation.x);
          rotations.push(frame.rotation.y);
          rotations.push(frame.rotation.z);
          rotations.push(frame.rotation.w);
        }

        if (scope.animateBonePositions) {
          tracks.push(new THREE.VectorKeyframeTrack('.bones[' + bone.name + '].position', times, positions));
        }

        if (scope.animateBoneRotations) {
          tracks.push(new THREE.QuaternionKeyframeTrack('.bones[' + bone.name + '].quaternion', times, rotations));
        }
      }

      return new THREE.AnimationClip('animation', -1, tracks);
    }

    function nextLine(lines) {
      var line;

      while ((line = lines.shift().trim()).length === 0) {}

      return line;
    }

    var scope = this;
    var lines = text.split(/[\r\n]+/g);
    var bones = readBvh(lines);
    var threeBones = [];
    toTHREEBone(bones[0], threeBones);
    var threeClip = toTHREEAnimation(bones);
    return {
      skeleton: new THREE.Skeleton(threeBones),
      clip: threeClip
    };
  }
});