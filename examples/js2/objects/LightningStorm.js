"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LightningStorm = void 0;

var LightningStorm = function LightningStorm(stormParams) {
  Object3D.call(this);
  stormParams = stormParams || {};
  this.stormParams = stormParams;
  stormParams.size = stormParams.size !== undefined ? stormParams.size : 1000.0;
  stormParams.minHeight = stormParams.minHeight !== undefined ? stormParams.minHeight : 80.0;
  stormParams.maxHeight = stormParams.maxHeight !== undefined ? stormParams.maxHeight : 100.0;
  stormParams.maxSlope = stormParams.maxSlope !== undefined ? stormParams.maxSlope : 1.1;
  stormParams.maxLightnings = stormParams.maxLightnings !== undefined ? stormParams.maxLightnings : 3;
  stormParams.lightningMinPeriod = stormParams.lightningMinPeriod !== undefined ? stormParams.lightningMinPeriod : 3.0;
  stormParams.lightningMaxPeriod = stormParams.lightningMaxPeriod !== undefined ? stormParams.lightningMaxPeriod : 7.0;
  stormParams.lightningMinDuration = stormParams.lightningMinDuration !== undefined ? stormParams.lightningMinDuration : 1.0;
  stormParams.lightningMaxDuration = stormParams.lightningMaxDuration !== undefined ? stormParams.lightningMaxDuration : 2.5;
  this.lightningParameters = THREE.LightningStrike.copyParameters(stormParams.lightningParameters, stormParams.lightningParameters);
  this.lightningParameters.isEternal = false;
  this.lightningMaterial = stormParams.lightningMaterial !== undefined ? stormParams.lightningMaterial : new THREE.MeshBasicMaterial({
    color: 0xB0FFFF
  });

  if (stormParams.onRayPosition !== undefined) {
    this.onRayPosition = stormParams.onRayPosition;
  } else {
    this.onRayPosition = function (source, dest) {
      dest.set((Math.random() - 0.5) * stormParams.size, 0, (Math.random() - 0.5) * stormParams.size);
      var height = THREE.MathUtils.lerp(stormParams.minHeight, stormParams.maxHeight, Math.random());
      source.set(stormParams.maxSlope * (2 * Math.random() - 1), 1, stormParams.maxSlope * (2 * Math.random() - 1)).multiplyScalar(height).add(dest);
    };
  }

  this.onLightningDown = stormParams.onLightningDown;
  this.inited = false;
  this.nextLightningTime = 0;
  this.lightningsMeshes = [];
  this.deadLightningsMeshes = [];

  for (var i = 0; i < this.stormParams.maxLightnings; i++) {
    var lightning = new LightningStrike(LightningStrike.copyParameters({}, this.lightningParameters));
    var mesh = new Mesh(lightning, this.lightningMaterial);
    this.deadLightningsMeshes.push(mesh);
  }
};

THREE.LightningStorm = LightningStorm;
LightningStorm.prototype = Object.create(THREE.Object3D.prototype);
LightningStorm.prototype.constructor = LightningStorm;
LightningStorm.prototype.isLightningStorm = true;

LightningStorm.prototype.update = function (time) {
  if (!this.inited) {
    this.nextLightningTime = this.getNextLightningTime(time) * Math.random();
    this.inited = true;
  }

  if (time >= this.nextLightningTime) {
    var lightningMesh = this.deadLightningsMeshes.pop();

    if (lightningMesh) {
      var lightningParams1 = LightningStrike.copyParameters(lightningMesh.geometry.rayParameters, this.lightningParameters);
      lightningParams1.birthTime = time;
      lightningParams1.deathTime = time + MathUtils.lerp(this.stormParams.lightningMinDuration, this.stormParams.lightningMaxDuration, Math.random());
      this.onRayPosition(lightningParams1.sourceOffset, lightningParams1.destOffset);
      lightningParams1.noiseSeed = Math.random();
      this.add(lightningMesh);
      this.lightningsMeshes.push(lightningMesh);
    }

    this.nextLightningTime = this.getNextLightningTime(time);
  }

  var i = 0,
      il = this.lightningsMeshes.length;

  while (i < il) {
    var mesh = this.lightningsMeshes[i];
    var lightning = mesh.geometry;
    var prevState = lightning.state;
    lightning.update(time);

    if (prevState === LightningStrike.RAY_PROPAGATING && lightning.state > prevState) {
      if (this.onLightningDown) {
        this.onLightningDown(lightning);
      }
    }

    if (lightning.state === LightningStrike.RAY_EXTINGUISHED) {
      this.lightningsMeshes.splice(this.lightningsMeshes.indexOf(mesh), 1);
      this.deadLightningsMeshes.push(mesh);
      this.remove(mesh);
      il--;
    } else {
      i++;
    }
  }
};

LightningStorm.prototype.getNextLightningTime = function (currentTime) {
  return currentTime + MathUtils.lerp(this.stormParams.lightningMinPeriod, this.stormParams.lightningMaxPeriod, Math.random()) / (this.stormParams.maxLightnings + 1);
};

LightningStorm.prototype.copy = function (source) {
  Object3D.prototype.copy.call(this, source);
  this.stormParams.size = source.stormParams.size;
  this.stormParams.minHeight = source.stormParams.minHeight;
  this.stormParams.maxHeight = source.stormParams.maxHeight;
  this.stormParams.maxSlope = source.stormParams.maxSlope;
  this.stormParams.maxLightnings = source.stormParams.maxLightnings;
  this.stormParams.lightningMinPeriod = source.stormParams.lightningMinPeriod;
  this.stormParams.lightningMaxPeriod = source.stormParams.lightningMaxPeriod;
  this.stormParams.lightningMinDuration = source.stormParams.lightningMinDuration;
  this.stormParams.lightningMaxDuration = source.stormParams.lightningMaxDuration;
  this.lightningParameters = LightningStrike.copyParameters({}, source.lightningParameters);
  this.lightningMaterial = source.stormParams.lightningMaterial;
  this.onLightningDown = source.onLightningDown;
  return this;
};

LightningStrike.prototype.clone = function () {
  return new this.constructor(this.stormParams).copy(this);
};