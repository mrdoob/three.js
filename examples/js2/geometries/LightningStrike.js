"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LightningStrike = void 0;

var LightningStrike = function LightningStrike(rayParameters) {
  BufferGeometry.call(this);
  this.type = 'LightningStrike';
  rayParameters = rayParameters || {};
  this.init(LightningStrike.copyParameters(rayParameters, rayParameters));
  this.createMesh();
};

THREE.LightningStrike = LightningStrike;
LightningStrike.prototype = Object.create(THREE.BufferGeometry.prototype);
LightningStrike.prototype.constructor = LightningStrike;
LightningStrike.prototype.isLightningStrike = true;
LightningStrike.RAY_INITIALIZED = 0;
LightningStrike.RAY_UNBORN = 1;
LightningStrike.RAY_PROPAGATING = 2;
LightningStrike.RAY_STEADY = 3;
LightningStrike.RAY_VANISHING = 4;
LightningStrike.RAY_EXTINGUISHED = 5;
LightningStrike.COS30DEG = Math.cos(30 * Math.PI / 180);
LightningStrike.SIN30DEG = Math.sin(30 * Math.PI / 180);

LightningStrike.createRandomGenerator = function () {
  var numSeeds = 2053;
  var seeds = [];

  for (var i = 0; i < numSeeds; i++) {
    seeds.push(Math.random());
  }

  var generator = {
    currentSeed: 0,
    random: function random() {
      var value = seeds[generator.currentSeed];
      generator.currentSeed = (generator.currentSeed + 1) % numSeeds;
      return value;
    },
    getSeed: function getSeed() {
      return generator.currentSeed / numSeeds;
    },
    setSeed: function setSeed(seed) {
      generator.currentSeed = Math.floor(seed * numSeeds) % numSeeds;
    }
  };
  return generator;
};

LightningStrike.copyParameters = function (dest, source) {
  source = source || {};
  dest = dest || {};

  var vecCopy = function vecCopy(v) {
    if (source === dest) {
      return v;
    } else {
      return v.clone();
    }
  };

  dest.sourceOffset = source.sourceOffset !== undefined ? vecCopy(source.sourceOffset) : new THREE.Vector3(0, 100, 0), dest.destOffset = source.destOffset !== undefined ? vecCopy(source.destOffset) : new Vector3(0, 0, 0), dest.timeScale = source.timeScale !== undefined ? source.timeScale : 1, dest.roughness = source.roughness !== undefined ? source.roughness : 0.9, dest.straightness = source.straightness !== undefined ? source.straightness : 0.7, dest.up0 = source.up0 !== undefined ? vecCopy(source.up0) : new Vector3(0, 0, 1);
  dest.up1 = source.up1 !== undefined ? vecCopy(source.up1) : new Vector3(0, 0, 1), dest.radius0 = source.radius0 !== undefined ? source.radius0 : 1, dest.radius1 = source.radius1 !== undefined ? source.radius1 : 1, dest.radius0Factor = source.radius0Factor !== undefined ? source.radius0Factor : 0.5, dest.radius1Factor = source.radius1Factor !== undefined ? source.radius1Factor : 0.2, dest.minRadius = source.minRadius !== undefined ? source.minRadius : 0.2, dest.isEternal = source.isEternal !== undefined ? source.isEternal : source.birthTime === undefined || source.deathTime === undefined, dest.birthTime = source.birthTime, dest.deathTime = source.deathTime, dest.propagationTimeFactor = source.propagationTimeFactor !== undefined ? source.propagationTimeFactor : 0.1, dest.vanishingTimeFactor = source.vanishingTimeFactor !== undefined ? source.vanishingTimeFactor : 0.9, dest.subrayPeriod = source.subrayPeriod !== undefined ? source.subrayPeriod : 4, dest.subrayDutyCycle = source.subrayDutyCycle !== undefined ? source.subrayDutyCycle : 0.6;
  dest.maxIterations = source.maxIterations !== undefined ? source.maxIterations : 9;
  dest.isStatic = source.isStatic !== undefined ? source.isStatic : false;
  dest.ramification = source.ramification !== undefined ? source.ramification : 5;
  dest.maxSubrayRecursion = source.maxSubrayRecursion !== undefined ? source.maxSubrayRecursion : 3;
  dest.recursionProbability = source.recursionProbability !== undefined ? source.recursionProbability : 0.6;
  dest.generateUVs = source.generateUVs !== undefined ? source.generateUVs : false;
  dest.randomGenerator = source.randomGenerator, dest.noiseSeed = source.noiseSeed, dest.onDecideSubrayCreation = source.onDecideSubrayCreation, dest.onSubrayCreation = source.onSubrayCreation;
  return dest;
};

LightningStrike.prototype.update = function (time) {
  if (this.isStatic) return;

  if (this.rayParameters.isEternal || this.rayParameters.birthTime <= time && time <= this.rayParameters.deathTime) {
    this.updateMesh(time);

    if (time < this.subrays[0].endPropagationTime) {
      this.state = LightningStrike.RAY_PROPAGATING;
    } else if (time > this.subrays[0].beginVanishingTime) {
      this.state = LightningStrike.RAY_VANISHING;
    } else {
      this.state = LightningStrike.RAY_STEADY;
    }

    this.visible = true;
  } else {
    this.visible = false;

    if (time < this.rayParameters.birthTime) {
      this.state = LightningStrike.RAY_UNBORN;
    } else {
      this.state = LightningStrike.RAY_EXTINGUISHED;
    }
  }
};

LightningStrike.prototype.init = function (rayParameters) {
  this.rayParameters = rayParameters;
  this.maxIterations = rayParameters.maxIterations !== undefined ? Math.floor(rayParameters.maxIterations) : 9;
  rayParameters.maxIterations = this.maxIterations;
  this.isStatic = rayParameters.isStatic !== undefined ? rayParameters.isStatic : false;
  rayParameters.isStatic = this.isStatic;
  this.ramification = rayParameters.ramification !== undefined ? Math.floor(rayParameters.ramification) : 5;
  rayParameters.ramification = this.ramification;
  this.maxSubrayRecursion = rayParameters.maxSubrayRecursion !== undefined ? Math.floor(rayParameters.maxSubrayRecursion) : 3;
  rayParameters.maxSubrayRecursion = this.maxSubrayRecursion;
  this.recursionProbability = rayParameters.recursionProbability !== undefined ? rayParameters.recursionProbability : 0.6;
  rayParameters.recursionProbability = this.recursionProbability;
  this.generateUVs = rayParameters.generateUVs !== undefined ? rayParameters.generateUVs : false;
  rayParameters.generateUVs = this.generateUVs;

  if (rayParameters.randomGenerator !== undefined) {
    this.randomGenerator = rayParameters.randomGenerator;
    this.seedGenerator = rayParameters.randomGenerator;

    if (rayParameters.noiseSeed !== undefined) {
      this.seedGenerator.setSeed(rayParameters.noiseSeed);
    }
  } else {
    this.randomGenerator = LightningStrike.createRandomGenerator();
    this.seedGenerator = Math;
  }

  if (rayParameters.onDecideSubrayCreation !== undefined) {
    this.onDecideSubrayCreation = rayParameters.onDecideSubrayCreation;
  } else {
    this.createDefaultSubrayCreationCallbacks();

    if (rayParameters.onSubrayCreation !== undefined) {
      this.onSubrayCreation = rayParameters.onSubrayCreation;
    }
  }

  this.state = LightningStrike.RAY_INITIALIZED;
  this.maxSubrays = Math.ceil(1 + Math.pow(this.ramification, Math.max(0, this.maxSubrayRecursion - 1)));
  rayParameters.maxSubrays = this.maxSubrays;
  this.maxRaySegments = 2 * (1 << this.maxIterations);
  this.subrays = [];

  for (var i = 0; i < this.maxSubrays; i++) {
    this.subrays.push(this.createSubray());
  }

  this.raySegments = [];

  for (var i = 0; i < this.maxRaySegments; i++) {
    this.raySegments.push(this.createSegment());
  }

  this.time = 0;
  this.timeFraction = 0;
  this.currentSegmentCallback = null;
  this.currentCreateTriangleVertices = this.generateUVs ? this.createTriangleVerticesWithUVs : this.createTriangleVerticesWithoutUVs;
  this.numSubrays = 0;
  this.currentSubray = null;
  this.currentSegmentIndex = 0;
  this.isInitialSegment = false;
  this.subrayProbability = 0;
  this.currentVertex = 0;
  this.currentIndex = 0;
  this.currentCoordinate = 0;
  this.currentUVCoordinate = 0;
  this.vertices = null;
  this.uvs = null;
  this.indices = null;
  this.positionAttribute = null;
  this.uvsAttribute = null;
  this.simplexX = new THREE.SimplexNoise(this.seedGenerator);
  this.simplexY = new SimplexNoise(this.seedGenerator);
  this.simplexZ = new SimplexNoise(this.seedGenerator);
  this.forwards = new Vector3();
  this.forwardsFill = new Vector3();
  this.side = new Vector3();
  this.down = new Vector3();
  this.middlePos = new Vector3();
  this.middleLinPos = new Vector3();
  this.newPos = new Vector3();
  this.vPos = new Vector3();
  this.cross1 = new Vector3();
};

LightningStrike.prototype.createMesh = function () {
  var maxDrawableSegmentsPerSubRay = 1 << this.maxIterations;
  var maxVerts = 3 * (maxDrawableSegmentsPerSubRay + 1) * this.maxSubrays;
  var maxIndices = 18 * maxDrawableSegmentsPerSubRay * this.maxSubrays;
  this.vertices = new Float32Array(maxVerts * 3);
  this.indices = new Uint32Array(maxIndices);

  if (this.generateUVs) {
    this.uvs = new Float32Array(maxVerts * 2);
  }

  this.fillMesh(0);
  this.setIndex(new THREE.Uint32BufferAttribute(this.indices, 1));
  this.positionAttribute = new THREE.Float32BufferAttribute(this.vertices, 3);
  this.setAttribute('position', this.positionAttribute);

  if (this.generateUVs) {
    this.uvsAttribute = new Float32BufferAttribute(new Float32Array(this.uvs), 2);
    this.setAttribute('uv', this.uvsAttribute);
  }

  if (!this.isStatic) {
    this.index.usage = THREE.DynamicDrawUsage;
    this.positionAttribute.usage = DynamicDrawUsage;

    if (this.generateUVs) {
      this.uvsAttribute.usage = DynamicDrawUsage;
    }
  }

  this.vertices = this.positionAttribute.array;
  this.indices = this.index.array;

  if (this.generateUVs) {
    this.uvs = this.uvsAttribute.array;
  }
};

LightningStrike.prototype.updateMesh = function (time) {
  this.fillMesh(time);
  this.drawRange.count = this.currentIndex;
  this.index.needsUpdate = true;
  this.positionAttribute.needsUpdate = true;

  if (this.generateUVs) {
    this.uvsAttribute.needsUpdate = true;
  }
};

LightningStrike.prototype.fillMesh = function (time) {
  var scope = this;
  this.currentVertex = 0;
  this.currentIndex = 0;
  this.currentCoordinate = 0;
  this.currentUVCoordinate = 0;
  this.fractalRay(time, function fillVertices(segment) {
    var subray = scope.currentSubray;

    if (time < subray.birthTime) {
      return;
    } else if (this.rayParameters.isEternal && scope.currentSubray.recursion == 0) {
      scope.createPrism(segment);
      scope.onDecideSubrayCreation(segment, scope);
    } else if (time < subray.endPropagationTime) {
      if (scope.timeFraction >= segment.fraction0 * subray.propagationTimeFactor) {
        scope.createPrism(segment);
        scope.onDecideSubrayCreation(segment, scope);
      }
    } else if (time < subray.beginVanishingTime) {
      scope.createPrism(segment);
      scope.onDecideSubrayCreation(segment, scope);
    } else {
      if (scope.timeFraction <= subray.vanishingTimeFactor + segment.fraction1 * (1 - subray.vanishingTimeFactor)) {
        scope.createPrism(segment);
      }

      scope.onDecideSubrayCreation(segment, scope);
    }
  });
};

LightningStrike.prototype.addNewSubray = function () {
  return this.subrays[this.numSubrays++];
};

LightningStrike.prototype.initSubray = function (subray, rayParameters) {
  subray.pos0.copy(rayParameters.sourceOffset);
  subray.pos1.copy(rayParameters.destOffset);
  subray.up0.copy(rayParameters.up0);
  subray.up1.copy(rayParameters.up1);
  subray.radius0 = rayParameters.radius0;
  subray.radius1 = rayParameters.radius1;
  subray.birthTime = rayParameters.birthTime;
  subray.deathTime = rayParameters.deathTime;
  subray.timeScale = rayParameters.timeScale;
  subray.roughness = rayParameters.roughness;
  subray.straightness = rayParameters.straightness;
  subray.propagationTimeFactor = rayParameters.propagationTimeFactor;
  subray.vanishingTimeFactor = rayParameters.vanishingTimeFactor;
  subray.maxIterations = this.maxIterations;
  subray.seed = rayParameters.noiseSeed !== undefined ? rayParameters.noiseSeed : 0;
  subray.recursion = 0;
};

LightningStrike.prototype.fractalRay = function (time, segmentCallback) {
  this.time = time;
  this.currentSegmentCallback = segmentCallback;
  this.numSubrays = 0;
  this.initSubray(this.addNewSubray(), this.rayParameters);

  for (var subrayIndex = 0; subrayIndex < this.numSubrays; subrayIndex++) {
    var subray = this.subrays[subrayIndex];
    this.currentSubray = subray;
    this.randomGenerator.setSeed(subray.seed);
    subray.endPropagationTime = THREE.MathUtils.lerp(subray.birthTime, subray.deathTime, subray.propagationTimeFactor);
    subray.beginVanishingTime = MathUtils.lerp(subray.deathTime, subray.birthTime, 1 - subray.vanishingTimeFactor);
    var random1 = this.randomGenerator.random;
    subray.linPos0.set(random1(), random1(), random1()).multiplyScalar(1000);
    subray.linPos1.set(random1(), random1(), random1()).multiplyScalar(1000);
    this.timeFraction = (time - subray.birthTime) / (subray.deathTime - subray.birthTime);
    this.currentSegmentIndex = 0;
    this.isInitialSegment = true;
    var segment = this.getNewSegment();
    segment.iteration = 0;
    segment.pos0.copy(subray.pos0);
    segment.pos1.copy(subray.pos1);
    segment.linPos0.copy(subray.linPos0);
    segment.linPos1.copy(subray.linPos1);
    segment.up0.copy(subray.up0);
    segment.up1.copy(subray.up1);
    segment.radius0 = subray.radius0;
    segment.radius1 = subray.radius1;
    segment.fraction0 = 0;
    segment.fraction1 = 1;
    segment.positionVariationFactor = 1 - subray.straightness;
    this.subrayProbability = this.ramification * Math.pow(this.recursionProbability, subray.recursion) / (1 << subray.maxIterations);
    this.fractalRayRecursive(segment);
  }

  this.currentSegmentCallback = null;
  this.currentSubray = null;
};

LightningStrike.prototype.fractalRayRecursive = function (segment) {
  if (segment.iteration >= this.currentSubray.maxIterations) {
    this.currentSegmentCallback(segment);
    return;
  }

  this.forwards.subVectors(segment.pos1, segment.pos0);
  var lForwards = this.forwards.length();

  if (lForwards < 0.000001) {
    this.forwards.set(0, 0, 0.01);
    lForwards = this.forwards.length();
  }

  var middleRadius = (segment.radius0 + segment.radius1) * 0.5;
  var middleFraction = (segment.fraction0 + segment.fraction1) * 0.5;
  var timeDimension = this.time * this.currentSubray.timeScale * Math.pow(2, segment.iteration);
  this.middlePos.lerpVectors(segment.pos0, segment.pos1, 0.5);
  this.middleLinPos.lerpVectors(segment.linPos0, segment.linPos1, 0.5);
  var p = this.middleLinPos;
  this.newPos.set(this.simplexX.noise4d(p.x, p.y, p.z, timeDimension), this.simplexY.noise4d(p.x, p.y, p.z, timeDimension), this.simplexZ.noise4d(p.x, p.y, p.z, timeDimension));
  this.newPos.multiplyScalar(segment.positionVariationFactor * lForwards);
  this.newPos.add(this.middlePos);
  var newSegment1 = this.getNewSegment();
  newSegment1.pos0.copy(segment.pos0);
  newSegment1.pos1.copy(this.newPos);
  newSegment1.linPos0.copy(segment.linPos0);
  newSegment1.linPos1.copy(this.middleLinPos);
  newSegment1.up0.copy(segment.up0);
  newSegment1.up1.copy(segment.up1);
  newSegment1.radius0 = segment.radius0;
  newSegment1.radius1 = middleRadius;
  newSegment1.fraction0 = segment.fraction0;
  newSegment1.fraction1 = middleFraction;
  newSegment1.positionVariationFactor = segment.positionVariationFactor * this.currentSubray.roughness;
  newSegment1.iteration = segment.iteration + 1;
  var newSegment2 = this.getNewSegment();
  newSegment2.pos0.copy(this.newPos);
  newSegment2.pos1.copy(segment.pos1);
  newSegment2.linPos0.copy(this.middleLinPos);
  newSegment2.linPos1.copy(segment.linPos1);
  this.cross1.crossVectors(segment.up0, this.forwards.normalize());
  newSegment2.up0.crossVectors(this.forwards, this.cross1).normalize();
  newSegment2.up1.copy(segment.up1);
  newSegment2.radius0 = middleRadius;
  newSegment2.radius1 = segment.radius1;
  newSegment2.fraction0 = middleFraction;
  newSegment2.fraction1 = segment.fraction1;
  newSegment2.positionVariationFactor = segment.positionVariationFactor * this.currentSubray.roughness;
  newSegment2.iteration = segment.iteration + 1;
  this.fractalRayRecursive(newSegment1);
  this.fractalRayRecursive(newSegment2);
};

LightningStrike.prototype.createPrism = function (segment) {
  this.forwardsFill.subVectors(segment.pos1, segment.pos0).normalize();

  if (this.isInitialSegment) {
    this.currentCreateTriangleVertices(segment.pos0, segment.up0, this.forwardsFill, segment.radius0, 0);
    this.isInitialSegment = false;
  }

  this.currentCreateTriangleVertices(segment.pos1, segment.up0, this.forwardsFill, segment.radius1, segment.fraction1);
  this.createPrismFaces();
};

LightningStrike.prototype.createTriangleVerticesWithoutUVs = function (pos, up, forwards, radius) {
  this.side.crossVectors(up, forwards).multiplyScalar(radius * LightningStrike.COS30DEG);
  this.down.copy(up).multiplyScalar(-radius * LightningStrike.SIN30DEG);
  var p = this.vPos;
  var v = this.vertices;
  p.copy(pos).sub(this.side).add(this.down);
  v[this.currentCoordinate++] = p.x;
  v[this.currentCoordinate++] = p.y;
  v[this.currentCoordinate++] = p.z;
  p.copy(pos).add(this.side).add(this.down);
  v[this.currentCoordinate++] = p.x;
  v[this.currentCoordinate++] = p.y;
  v[this.currentCoordinate++] = p.z;
  p.copy(up).multiplyScalar(radius).add(pos);
  v[this.currentCoordinate++] = p.x;
  v[this.currentCoordinate++] = p.y;
  v[this.currentCoordinate++] = p.z;
  this.currentVertex += 3;
};

LightningStrike.prototype.createTriangleVerticesWithUVs = function (pos, up, forwards, radius, u) {
  this.side.crossVectors(up, forwards).multiplyScalar(radius * LightningStrike.COS30DEG);
  this.down.copy(up).multiplyScalar(-radius * LightningStrike.SIN30DEG);
  var p = this.vPos;
  var v = this.vertices;
  var uv = this.uvs;
  p.copy(pos).sub(this.side).add(this.down);
  v[this.currentCoordinate++] = p.x;
  v[this.currentCoordinate++] = p.y;
  v[this.currentCoordinate++] = p.z;
  uv[this.currentUVCoordinate++] = u;
  uv[this.currentUVCoordinate++] = 0;
  p.copy(pos).add(this.side).add(this.down);
  v[this.currentCoordinate++] = p.x;
  v[this.currentCoordinate++] = p.y;
  v[this.currentCoordinate++] = p.z;
  uv[this.currentUVCoordinate++] = u;
  uv[this.currentUVCoordinate++] = 0.5;
  p.copy(up).multiplyScalar(radius).add(pos);
  v[this.currentCoordinate++] = p.x;
  v[this.currentCoordinate++] = p.y;
  v[this.currentCoordinate++] = p.z;
  uv[this.currentUVCoordinate++] = u;
  uv[this.currentUVCoordinate++] = 1;
  this.currentVertex += 3;
};

LightningStrike.prototype.createPrismFaces = function (vertex) {
  var indices = this.indices;
  var vertex = this.currentVertex - 6;
  indices[this.currentIndex++] = vertex + 1;
  indices[this.currentIndex++] = vertex + 2;
  indices[this.currentIndex++] = vertex + 5;
  indices[this.currentIndex++] = vertex + 1;
  indices[this.currentIndex++] = vertex + 5;
  indices[this.currentIndex++] = vertex + 4;
  indices[this.currentIndex++] = vertex + 0;
  indices[this.currentIndex++] = vertex + 1;
  indices[this.currentIndex++] = vertex + 4;
  indices[this.currentIndex++] = vertex + 0;
  indices[this.currentIndex++] = vertex + 4;
  indices[this.currentIndex++] = vertex + 3;
  indices[this.currentIndex++] = vertex + 2;
  indices[this.currentIndex++] = vertex + 0;
  indices[this.currentIndex++] = vertex + 3;
  indices[this.currentIndex++] = vertex + 2;
  indices[this.currentIndex++] = vertex + 3;
  indices[this.currentIndex++] = vertex + 5;
};

LightningStrike.prototype.createDefaultSubrayCreationCallbacks = function () {
  var random1 = this.randomGenerator.random;

  this.onDecideSubrayCreation = function (segment, lightningStrike) {
    var subray = lightningStrike.currentSubray;
    var period = lightningStrike.rayParameters.subrayPeriod;
    var dutyCycle = lightningStrike.rayParameters.subrayDutyCycle;
    var phase0 = lightningStrike.rayParameters.isEternal && subray.recursion == 0 ? -random1() * period : MathUtils.lerp(subray.birthTime, subray.endPropagationTime, segment.fraction0) - random1() * period;
    var phase = lightningStrike.time - phase0;
    var currentCycle = Math.floor(phase / period);
    var childSubraySeed = random1() * (currentCycle + 1);
    var isActive = phase % period <= dutyCycle * period;
    var probability = 0;

    if (isActive) {
      probability = lightningStrike.subrayProbability;
    }

    if (subray.recursion < lightningStrike.maxSubrayRecursion && lightningStrike.numSubrays < lightningStrike.maxSubrays && random1() < probability) {
      var childSubray = lightningStrike.addNewSubray();
      var parentSeed = lightningStrike.randomGenerator.getSeed();
      childSubray.seed = childSubraySeed;
      lightningStrike.randomGenerator.setSeed(childSubraySeed);
      childSubray.recursion = subray.recursion + 1;
      childSubray.maxIterations = Math.max(1, subray.maxIterations - 1);
      childSubray.linPos0.set(random1(), random1(), random1()).multiplyScalar(1000);
      childSubray.linPos1.set(random1(), random1(), random1()).multiplyScalar(1000);
      childSubray.up0.copy(subray.up0);
      childSubray.up1.copy(subray.up1);
      childSubray.radius0 = segment.radius0 * lightningStrike.rayParameters.radius0Factor;
      childSubray.radius1 = Math.min(lightningStrike.rayParameters.minRadius, segment.radius1 * lightningStrike.rayParameters.radius1Factor);
      childSubray.birthTime = phase0 + currentCycle * period;
      childSubray.deathTime = childSubray.birthTime + period * dutyCycle;

      if (!lightningStrike.rayParameters.isEternal && subray.recursion == 0) {
        childSubray.birthTime = Math.max(childSubray.birthTime, subray.birthTime);
        childSubray.deathTime = Math.min(childSubray.deathTime, subray.deathTime);
      }

      childSubray.timeScale = subray.timeScale * 2;
      childSubray.roughness = subray.roughness;
      childSubray.straightness = subray.straightness;
      childSubray.propagationTimeFactor = subray.propagationTimeFactor;
      childSubray.vanishingTimeFactor = subray.vanishingTimeFactor;
      lightningStrike.onSubrayCreation(segment, subray, childSubray, lightningStrike);
      lightningStrike.randomGenerator.setSeed(parentSeed);
    }
  };

  var vec1Pos = new Vector3();
  var vec2Forward = new Vector3();
  var vec3Side = new Vector3();
  var vec4Up = new Vector3();

  this.onSubrayCreation = function (segment, parentSubray, childSubray, lightningStrike) {
    lightningStrike.subrayCylinderPosition(segment, parentSubray, childSubray, 0.5, 0.6, 0.2);
  };

  this.subrayConePosition = function (segment, parentSubray, childSubray, heightFactor, sideWidthFactor, minSideWidthFactor) {
    childSubray.pos0.copy(segment.pos0);
    vec1Pos.subVectors(parentSubray.pos1, parentSubray.pos0);
    vec2Forward.copy(vec1Pos).normalize();
    vec1Pos.multiplyScalar(segment.fraction0 + (1 - segment.fraction0) * (random1() * heightFactor));
    var length = vec1Pos.length();
    vec3Side.crossVectors(parentSubray.up0, vec2Forward);
    var angle = 2 * Math.PI * random1();
    vec3Side.multiplyScalar(Math.cos(angle));
    vec4Up.copy(parentSubray.up0).multiplyScalar(Math.sin(angle));
    childSubray.pos1.copy(vec3Side).add(vec4Up).multiplyScalar(length * sideWidthFactor * (minSideWidthFactor + random1() * (1 - minSideWidthFactor))).add(vec1Pos).add(parentSubray.pos0);
  };

  this.subrayCylinderPosition = function (segment, parentSubray, childSubray, heightFactor, sideWidthFactor, minSideWidthFactor) {
    childSubray.pos0.copy(segment.pos0);
    vec1Pos.subVectors(parentSubray.pos1, parentSubray.pos0);
    vec2Forward.copy(vec1Pos).normalize();
    vec1Pos.multiplyScalar(segment.fraction0 + (1 - segment.fraction0) * ((2 * random1() - 1) * heightFactor));
    var length = vec1Pos.length();
    vec3Side.crossVectors(parentSubray.up0, vec2Forward);
    var angle = 2 * Math.PI * random1();
    vec3Side.multiplyScalar(Math.cos(angle));
    vec4Up.copy(parentSubray.up0).multiplyScalar(Math.sin(angle));
    childSubray.pos1.copy(vec3Side).add(vec4Up).multiplyScalar(length * sideWidthFactor * (minSideWidthFactor + random1() * (1 - minSideWidthFactor))).add(vec1Pos).add(parentSubray.pos0);
  };
};

LightningStrike.prototype.createSubray = function () {
  return {
    seed: 0,
    maxIterations: 0,
    recursion: 0,
    pos0: new Vector3(),
    pos1: new Vector3(),
    linPos0: new Vector3(),
    linPos1: new Vector3(),
    up0: new Vector3(),
    up1: new Vector3(),
    radius0: 0,
    radius1: 0,
    birthTime: 0,
    deathTime: 0,
    timeScale: 0,
    roughness: 0,
    straightness: 0,
    propagationTimeFactor: 0,
    vanishingTimeFactor: 0,
    endPropagationTime: 0,
    beginVanishingTime: 0
  };
};

LightningStrike.prototype.createSegment = function () {
  return {
    iteration: 0,
    pos0: new Vector3(),
    pos1: new Vector3(),
    linPos0: new Vector3(),
    linPos1: new Vector3(),
    up0: new Vector3(),
    up1: new Vector3(),
    radius0: 0,
    radius1: 0,
    fraction0: 0,
    fraction1: 0,
    positionVariationFactor: 0
  };
};

LightningStrike.prototype.getNewSegment = function () {
  return this.raySegments[this.currentSegmentIndex++];
};

LightningStrike.prototype.copy = function (source) {
  BufferGeometry.prototype.copy.call(this, source);
  this.init(LightningStrike.copyParameters({}, source.rayParameters));
  return this;
};

LightningStrike.prototype.clone = function () {
  return new this.constructor(LightningStrike.copyParameters({}, this.rayParameters));
};