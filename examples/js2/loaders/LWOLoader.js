"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LWOLoader = void 0;
var lwoTree;

var LWOLoader = function LWOLoader(manager, parameters) {
  Loader.call(this, manager);
  parameters = parameters || {};
  this.resourcePath = parameters.resourcePath !== undefined ? parameters.resourcePath : '';
};

THREE.LWOLoader = LWOLoader;
LWOLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
  constructor: LWOLoader,
  load: function load(url, onLoad, onProgress, onError) {
    var scope = this;
    var path = scope.path === '' ? extractParentUrl(url, 'Objects') : scope.path;
    var modelName = url.split(path).pop().split('.')[0];
    var loader = new THREE.FileLoader(this.manager);
    loader.setPath(scope.path);
    loader.setResponseType('arraybuffer');
    loader.load(url, function (buffer) {
      try {
        onLoad(scope.parse(buffer, path, modelName));
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
  parse: function parse(iffBuffer, path, modelName) {
    lwoTree = new THREE.IFFParser().parse(iffBuffer);
    var textureLoader = new THREE.TextureLoader(this.manager).setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);
    return new LWOTreeParser(textureLoader).parse(modelName);
  }
});

function LWOTreeParser(textureLoader) {
  this.textureLoader = textureLoader;
}

LWOTreeParser.prototype = {
  constructor: LWOTreeParser,
  parse: function parse(modelName) {
    this.materials = new MaterialParser(this.textureLoader).parse();
    this.defaultLayerName = modelName;
    this.meshes = this.parseLayers();
    return {
      materials: this.materials,
      meshes: this.meshes
    };
  },
  parseLayers: function parseLayers() {
    var meshes = [];
    var finalMeshes = [];
    var geometryParser = new GeometryParser();
    var scope = this;
    lwoTree.layers.forEach(function (layer) {
      var geometry = geometryParser.parse(layer.geometry, layer);
      var mesh = scope.parseMesh(geometry, layer);
      meshes[layer.number] = mesh;
      if (layer.parent === -1) finalMeshes.push(mesh);else meshes[layer.parent].add(mesh);
    });
    this.applyPivots(finalMeshes);
    return finalMeshes;
  },
  parseMesh: function parseMesh(geometry, layer) {
    var mesh;
    var materials = this.getMaterials(geometry.userData.matNames, layer.geometry.type);
    this.duplicateUVs(geometry, materials);
    if (layer.geometry.type === 'points') mesh = new THREE.Points(geometry, materials);else if (layer.geometry.type === 'lines') mesh = new THREE.LineSegments(geometry, materials);else mesh = new THREE.Mesh(geometry, materials);
    if (layer.name) mesh.name = layer.name;else mesh.name = this.defaultLayerName + '_layer_' + layer.number;
    mesh.userData.pivot = layer.pivot;
    return mesh;
  },
  applyPivots: function applyPivots(meshes) {
    meshes.forEach(function (mesh) {
      mesh.traverse(function (child) {
        var pivot = child.userData.pivot;
        child.position.x += pivot[0];
        child.position.y += pivot[1];
        child.position.z += pivot[2];

        if (child.parent) {
          var parentPivot = child.parent.userData.pivot;
          child.position.x -= parentPivot[0];
          child.position.y -= parentPivot[1];
          child.position.z -= parentPivot[2];
        }
      });
    });
  },
  getMaterials: function getMaterials(namesArray, type) {
    var materials = [];
    var scope = this;
    namesArray.forEach(function (name, i) {
      materials[i] = scope.getMaterialByName(name);
    });

    if (type === 'points' || type === 'lines') {
      materials.forEach(function (mat, i) {
        var spec = {
          color: mat.color
        };

        if (type === 'points') {
          spec.size = 0.1;
          spec.map = mat.map;
          spec.morphTargets = mat.morphTargets;
          materials[i] = new THREE.PointsMaterial(spec);
        } else if (type === 'lines') {
          materials[i] = new THREE.LineBasicMaterial(spec);
        }
      });
    }

    var filtered = materials.filter(Boolean);
    if (filtered.length === 1) return filtered[0];
    return materials;
  },
  getMaterialByName: function getMaterialByName(name) {
    return this.materials.filter(function (m) {
      return m.name === name;
    })[0];
  },
  duplicateUVs: function duplicateUVs(geometry, materials) {
    var duplicateUVs = false;

    if (!Array.isArray(materials)) {
      if (materials.aoMap) duplicateUVs = true;
    } else {
      materials.forEach(function (material) {
        if (material.aoMap) duplicateUVs = true;
      });
    }

    if (!duplicateUVs) return;
    geometry.setAttribute('uv2', new THREE.BufferAttribute(geometry.attributes.uv.array, 2));
  }
};

function MaterialParser(textureLoader) {
  this.textureLoader = textureLoader;
}

MaterialParser.prototype = {
  constructor: MaterialParser,
  parse: function parse() {
    var materials = [];
    this.textures = {};

    for (var name in lwoTree.materials) {
      if (lwoTree.format === 'LWO3') {
        materials.push(this.parseMaterial(lwoTree.materials[name], name, lwoTree.textures));
      } else if (lwoTree.format === 'LWO2') {
        materials.push(this.parseMaterialLwo2(lwoTree.materials[name], name, lwoTree.textures));
      }
    }

    return materials;
  },
  parseMaterial: function parseMaterial(materialData, name, textures) {
    var params = {
      name: name,
      side: this.getSide(materialData.attributes),
      flatShading: this.getSmooth(materialData.attributes)
    };
    var connections = this.parseConnections(materialData.connections, materialData.nodes);
    var maps = this.parseTextureNodes(connections.maps);
    this.parseAttributeImageMaps(connections.attributes, textures, maps, materialData.maps);
    var attributes = this.parseAttributes(connections.attributes, maps);
    this.parseEnvMap(connections, maps, attributes);
    params = Object.assign(maps, params);
    params = Object.assign(params, attributes);
    var materialType = this.getMaterialType(connections.attributes);
    return new materialType(params);
  },
  parseMaterialLwo2: function parseMaterialLwo2(materialData, name) {
    var params = {
      name: name,
      side: this.getSide(materialData.attributes),
      flatShading: this.getSmooth(materialData.attributes)
    };
    var attributes = this.parseAttributes(materialData.attributes, {});
    params = Object.assign(params, attributes);
    return new THREE.MeshPhongMaterial(params);
  },
  getSide: function getSide(attributes) {
    if (!attributes.side) return THREE.BackSide;

    switch (attributes.side) {
      case 0:
      case 1:
        return BackSide;

      case 2:
        return THREE.FrontSide;

      case 3:
        return THREE.DoubleSide;
    }
  },
  getSmooth: function getSmooth(attributes) {
    if (!attributes.smooth) return true;
    return !attributes.smooth;
  },
  parseConnections: function parseConnections(connections, nodes) {
    var materialConnections = {
      maps: {}
    };
    var inputName = connections.inputName;
    var inputNodeName = connections.inputNodeName;
    var nodeName = connections.nodeName;
    var scope = this;
    inputName.forEach(function (name, index) {
      if (name === 'Material') {
        var matNode = scope.getNodeByRefName(inputNodeName[index], nodes);
        materialConnections.attributes = matNode.attributes;
        materialConnections.envMap = matNode.fileName;
        materialConnections.name = inputNodeName[index];
      }
    });
    nodeName.forEach(function (name, index) {
      if (name === materialConnections.name) {
        materialConnections.maps[inputName[index]] = scope.getNodeByRefName(inputNodeName[index], nodes);
      }
    });
    return materialConnections;
  },
  getNodeByRefName: function getNodeByRefName(refName, nodes) {
    for (var name in nodes) {
      if (nodes[name].refName === refName) return nodes[name];
    }
  },
  parseTextureNodes: function parseTextureNodes(textureNodes) {
    var maps = {};

    for (var name in textureNodes) {
      var node = textureNodes[name];
      var path = node.fileName;
      if (!path) return;
      var texture = this.loadTexture(path);
      if (node.widthWrappingMode !== undefined) texture.wrapS = this.getWrappingType(node.widthWrappingMode);
      if (node.heightWrappingMode !== undefined) texture.wrapT = this.getWrappingType(node.heightWrappingMode);

      switch (name) {
        case 'Color':
          maps.map = texture;
          break;

        case 'Roughness':
          maps.roughnessMap = texture;
          maps.roughness = 0.5;
          break;

        case 'Specular':
          maps.specularMap = texture;
          maps.specular = 0xffffff;
          break;

        case 'Luminous':
          maps.emissiveMap = texture;
          maps.emissive = 0x808080;
          break;

        case 'Luminous THREE.Color':
          maps.emissive = 0x808080;
          break;

        case 'Metallic':
          maps.metalnessMap = texture;
          maps.metalness = 0.5;
          break;

        case 'Transparency':
        case 'Alpha':
          maps.alphaMap = texture;
          maps.transparent = true;
          break;

        case 'Normal':
          maps.normalMap = texture;
          if (node.amplitude !== undefined) maps.normalScale = new THREE.Vector2(node.amplitude, node.amplitude);
          break;

        case 'Bump':
          maps.bumpMap = texture;
          break;
      }
    }

    if (maps.roughnessMap && maps.specularMap) delete maps.specularMap;
    return maps;
  },
  parseAttributeImageMaps: function parseAttributeImageMaps(attributes, textures, maps) {
    for (var name in attributes) {
      var attribute = attributes[name];

      if (attribute.maps) {
        var mapData = attribute.maps[0];
        var path = this.getTexturePathByIndex(mapData.imageIndex, textures);
        if (!path) return;
        var texture = this.loadTexture(path);
        if (mapData.wrap !== undefined) texture.wrapS = this.getWrappingType(mapData.wrap.w);
        if (mapData.wrap !== undefined) texture.wrapT = this.getWrappingType(mapData.wrap.h);

        switch (name) {
          case 'Color':
            maps.map = texture;
            break;

          case 'Diffuse':
            maps.aoMap = texture;
            break;

          case 'Roughness':
            maps.roughnessMap = texture;
            maps.roughness = 1;
            break;

          case 'Specular':
            maps.specularMap = texture;
            maps.specular = 0xffffff;
            break;

          case 'Luminosity':
            maps.emissiveMap = texture;
            maps.emissive = 0x808080;
            break;

          case 'Metallic':
            maps.metalnessMap = texture;
            maps.metalness = 1;
            break;

          case 'Transparency':
          case 'Alpha':
            maps.alphaMap = texture;
            maps.transparent = true;
            break;

          case 'Normal':
            maps.normalMap = texture;
            break;

          case 'Bump':
            maps.bumpMap = texture;
            break;
        }
      }
    }
  },
  parseAttributes: function parseAttributes(attributes, maps) {
    var params = {};

    if (attributes.Color && !maps.map) {
      params.color = new Color().fromArray(attributes.Color.value);
    } else params.color = new Color();

    if (attributes.Transparency && attributes.Transparency.value !== 0) {
      params.opacity = 1 - attributes.Transparency.value;
      params.transparent = true;
    }

    if (attributes['Bump Height']) params.bumpScale = attributes['Bump Height'].value * 0.1;
    if (attributes['Refraction Index']) params.refractionRatio = 1 / attributes['Refraction Index'].value;
    this.parsePhysicalAttributes(params, attributes, maps);
    this.parseStandardAttributes(params, attributes, maps);
    this.parsePhongAttributes(params, attributes, maps);
    return params;
  },
  parsePhysicalAttributes: function parsePhysicalAttributes(params, attributes) {
    if (attributes.Clearcoat && attributes.Clearcoat.value > 0) {
      params.clearcoat = attributes.Clearcoat.value;

      if (attributes['Clearcoat Gloss']) {
        params.clearcoatRoughness = 0.5 * (1 - attributes['Clearcoat Gloss'].value);
      }
    }
  },
  parseStandardAttributes: function parseStandardAttributes(params, attributes, maps) {
    if (attributes.Luminous) {
      params.emissiveIntensity = attributes.Luminous.value;

      if (attributes['Luminous Color'] && !maps.emissive) {
        params.emissive = new Color().fromArray(attributes['Luminous Color'].value);
      } else {
        params.emissive = new Color(0x808080);
      }
    }

    if (attributes.Roughness && !maps.roughnessMap) params.roughness = attributes.Roughness.value;
    if (attributes.Metallic && !maps.metalnessMap) params.metalness = attributes.Metallic.value;
  },
  parsePhongAttributes: function parsePhongAttributes(params, attributes, maps) {
    if (attributes.Diffuse) params.color.multiplyScalar(attributes.Diffuse.value);

    if (attributes.Reflection) {
      params.reflectivity = attributes.Reflection.value;
      params.combine = THREE.AddOperation;
    }

    if (attributes.Luminosity) {
      params.emissiveIntensity = attributes.Luminosity.value;

      if (!maps.emissiveMap && !maps.map) {
        params.emissive = params.color;
      } else {
        params.emissive = new Color(0x808080);
      }
    }

    if (!attributes.Roughness && attributes.Specular && !maps.specularMap) {
      if (attributes['Color Highlight']) {
        params.specular = new Color().setScalar(attributes.Specular.value).lerp(params.color.clone().multiplyScalar(attributes.Specular.value), attributes['Color Highlight'].value);
      } else {
        params.specular = new Color().setScalar(attributes.Specular.value);
      }
    }

    if (params.specular && attributes.Glossiness) params.shininess = 7 + Math.pow(2, attributes.Glossiness.value * 12 + 2);
  },
  parseEnvMap: function parseEnvMap(connections, maps, attributes) {
    if (connections.envMap) {
      var envMap = this.loadTexture(connections.envMap);

      if (attributes.transparent && attributes.opacity < 0.999) {
        envMap.mapping = THREE.EquirectangularRefractionMapping;

        if (attributes.reflectivity !== undefined) {
          delete attributes.reflectivity;
          delete attributes.combine;
        }

        if (attributes.metalness !== undefined) {
          delete attributes.metalness;
        }
      } else envMap.mapping = THREE.EquirectangularReflectionMapping;

      maps.envMap = envMap;
    }
  },
  getTexturePathByIndex: function getTexturePathByIndex(index) {
    var fileName = '';
    if (!lwoTree.textures) return fileName;
    lwoTree.textures.forEach(function (texture) {
      if (texture.index === index) fileName = texture.fileName;
    });
    return fileName;
  },
  loadTexture: function loadTexture(path) {
    if (!path) return null;
    var texture;
    texture = this.textureLoader.load(path, undefined, undefined, function () {
      console.warn('LWOLoader: non-standard resource hierarchy. Use \`resourcePath\` parameter to specify root content directory.');
    });
    return texture;
  },
  getWrappingType: function getWrappingType(num) {
    switch (num) {
      case 0:
        console.warn('LWOLoader: "Reset" texture wrapping type is not supported in three.js');
        return THREE.ClampToEdgeWrapping;

      case 1:
        return THREE.RepeatWrapping;

      case 2:
        return THREE.MirroredRepeatWrapping;

      case 3:
        return ClampToEdgeWrapping;
    }
  },
  getMaterialType: function getMaterialType(nodeData) {
    if (nodeData.Clearcoat && nodeData.Clearcoat.value > 0) return THREE.MeshPhysicalMaterial;
    if (nodeData.Roughness) return THREE.MeshStandardMaterial;
    return MeshPhongMaterial;
  }
};

function GeometryParser() {}

GeometryParser.prototype = {
  constructor: GeometryParser,
  parse: function parse(geoData, layer) {
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(geoData.points, 3));
    var indices = this.splitIndices(geoData.vertexIndices, geoData.polygonDimensions);
    geometry.setIndex(indices);
    this.parseGroups(geometry, geoData);
    geometry.computeVertexNormals();
    this.parseUVs(geometry, layer, indices);
    this.parseMorphTargets(geometry, layer, indices);
    geometry.translate(-layer.pivot[0], -layer.pivot[1], -layer.pivot[2]);
    return geometry;
  },
  splitIndices: function splitIndices(indices, polygonDimensions) {
    var remappedIndices = [];
    var i = 0;
    polygonDimensions.forEach(function (dim) {
      if (dim < 4) {
        for (var k = 0; k < dim; k++) {
          remappedIndices.push(indices[i + k]);
        }
      } else if (dim === 4) {
        remappedIndices.push(indices[i], indices[i + 1], indices[i + 2], indices[i], indices[i + 2], indices[i + 3]);
      } else if (dim > 4) {
        for (var k = 1; k < dim - 1; k++) {
          remappedIndices.push(indices[i], indices[i + k], indices[i + k + 1]);
        }

        console.warn('LWOLoader: polygons with greater than 4 sides are not supported');
      }

      i += dim;
    });
    return remappedIndices;
  },
  parseGroups: function parseGroups(geometry, geoData) {
    var tags = lwoTree.tags;
    var matNames = [];
    var elemSize = 3;
    if (geoData.type === 'lines') elemSize = 2;
    if (geoData.type === 'points') elemSize = 1;
    var remappedIndices = this.splitMaterialIndices(geoData.polygonDimensions, geoData.materialIndices);
    var indexNum = 0;
    var indexPairs = {};
    var prevMaterialIndex;
    var prevStart = 0;
    var currentCount = 0;

    for (var i = 0; i < remappedIndices.length; i += 2) {
      var materialIndex = remappedIndices[i + 1];
      if (i === 0) matNames[indexNum] = tags[materialIndex];
      if (prevMaterialIndex === undefined) prevMaterialIndex = materialIndex;

      if (materialIndex !== prevMaterialIndex) {
        var currentIndex;

        if (indexPairs[tags[prevMaterialIndex]]) {
          currentIndex = indexPairs[tags[prevMaterialIndex]];
        } else {
          currentIndex = indexNum;
          indexPairs[tags[prevMaterialIndex]] = indexNum;
          matNames[indexNum] = tags[prevMaterialIndex];
          indexNum++;
        }

        geometry.addGroup(prevStart, currentCount, currentIndex);
        prevStart += currentCount;
        prevMaterialIndex = materialIndex;
        currentCount = 0;
      }

      currentCount += elemSize;
    }

    if (geometry.groups.length > 0) {
      var currentIndex;

      if (indexPairs[tags[materialIndex]]) {
        currentIndex = indexPairs[tags[materialIndex]];
      } else {
        currentIndex = indexNum;
        indexPairs[tags[materialIndex]] = indexNum;
        matNames[indexNum] = tags[materialIndex];
      }

      geometry.addGroup(prevStart, currentCount, currentIndex);
    }

    geometry.userData.matNames = matNames;
  },
  splitMaterialIndices: function splitMaterialIndices(polygonDimensions, indices) {
    var remappedIndices = [];
    polygonDimensions.forEach(function (dim, i) {
      if (dim <= 3) {
        remappedIndices.push(indices[i * 2], indices[i * 2 + 1]);
      } else if (dim === 4) {
        remappedIndices.push(indices[i * 2], indices[i * 2 + 1], indices[i * 2], indices[i * 2 + 1]);
      } else {
        for (var k = 0; k < dim - 2; k++) {
          remappedIndices.push(indices[i * 2], indices[i * 2 + 1]);
        }
      }
    });
    return remappedIndices;
  },
  parseUVs: function parseUVs(geometry, layer) {
    var remappedUVs = Array.from(Array(geometry.attributes.position.count * 2), function () {
      return 0;
    });

    for (var name in layer.uvs) {
      var uvs = layer.uvs[name].uvs;
      var uvIndices = layer.uvs[name].uvIndices;
      uvIndices.forEach(function (i, j) {
        remappedUVs[i * 2] = uvs[j * 2];
        remappedUVs[i * 2 + 1] = uvs[j * 2 + 1];
      });
    }

    geometry.setAttribute('uv', new Float32BufferAttribute(remappedUVs, 2));
  },
  parseMorphTargets: function parseMorphTargets(geometry, layer) {
    var num = 0;

    for (var name in layer.morphTargets) {
      var remappedPoints = geometry.attributes.position.array.slice();
      if (!geometry.morphAttributes.position) geometry.morphAttributes.position = [];
      var morphPoints = layer.morphTargets[name].points;
      var morphIndices = layer.morphTargets[name].indices;
      var type = layer.morphTargets[name].type;
      morphIndices.forEach(function (i, j) {
        if (type === 'relative') {
          remappedPoints[i * 3] += morphPoints[j * 3];
          remappedPoints[i * 3 + 1] += morphPoints[j * 3 + 1];
          remappedPoints[i * 3 + 2] += morphPoints[j * 3 + 2];
        } else {
          remappedPoints[i * 3] = morphPoints[j * 3];
          remappedPoints[i * 3 + 1] = morphPoints[j * 3 + 1];
          remappedPoints[i * 3 + 2] = morphPoints[j * 3 + 2];
        }
      });
      geometry.morphAttributes.position[num] = new Float32BufferAttribute(remappedPoints, 3);
      geometry.morphAttributes.position[num].name = name;
      num++;
    }

    geometry.morphTargetsRelative = false;
  }
};

function extractParentUrl(url, dir) {
  var index = url.indexOf(dir);
  if (index === -1) return './';
  return url.substr(0, index);
}