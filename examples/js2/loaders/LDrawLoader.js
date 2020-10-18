"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.LDrawLoader = void 0;

var LDrawLoader = function () {
  var conditionalLineVertShader = "\tattribute vec3 control0;\tattribute vec3 control1;\tattribute vec3 direction;\tvarying float discardFlag;\t#include <common>\t#include <color_pars_vertex>\t#include <fog_pars_vertex>\t#include <logdepthbuf_pars_vertex>\t#include <clipping_planes_pars_vertex>\tvoid main() {\t\t#include <color_vertex>\t\tvec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\t\tgl_Position = projectionMatrix * mvPosition;\t\t\tvec4 c0 = projectionMatrix * modelViewMatrix * vec4( control0, 1.0 );\t\tvec4 c1 = projectionMatrix * modelViewMatrix * vec4( control1, 1.0 );\t\tvec4 p0 = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\t\tvec4 p1 = projectionMatrix * modelViewMatrix * vec4( position + direction, 1.0 );\t\tc0.xy /= c0.w;\t\tc1.xy /= c1.w;\t\tp0.xy /= p0.w;\t\tp1.xy /= p1.w;\t\t\tvec2 dir = p1.xy - p0.xy;\t\tvec2 norm = vec2( -dir.y, dir.x );\t\t\tvec2 c0dir = c0.xy - p1.xy;\t\tvec2 c1dir = c1.xy - p1.xy;\t\t\t\tfloat d0 = dot( normalize( norm ), normalize( c0dir ) );\t\tfloat d1 = dot( normalize( norm ), normalize( c1dir ) );\t\tdiscardFlag = float( sign( d0 ) != sign( d1 ) );\t\t#include <logdepthbuf_vertex>\t\t#include <clipping_planes_vertex>\t\t#include <fog_vertex>\t}\t";
  var conditionalLineFragShader = "\tuniform vec3 diffuse;\tuniform float opacity;\tvarying float discardFlag;\t#include <common>\t#include <color_pars_fragment>\t#include <fog_pars_fragment>\t#include <logdepthbuf_pars_fragment>\t#include <clipping_planes_pars_fragment>\tvoid main() {\t\tif ( discardFlag > 0.5 ) discard;\t\t#include <clipping_planes_fragment>\t\tvec3 outgoingLight = vec3( 0.0 );\t\tvec4 diffuseColor = vec4( diffuse, opacity );\t\t#include <logdepthbuf_fragment>\t\t#include <color_fragment>\t\toutgoingLight = diffuseColor.rgb;\t\tgl_FragColor = vec4( outgoingLight, diffuseColor.a );\t\t#include <tonemapping_fragment>\t\t#include <encodings_fragment>\t\t#include <fog_fragment>\t\t#include <premultiplied_alpha_fragment>\t}\t";
  var tempVec0 = new THREE.Vector3();
  var tempVec1 = new Vector3();

  function smoothNormals(triangles, lineSegments) {
    function hashVertex(v) {
      var x = ~~(v.x * 1e2);
      var y = ~~(v.y * 1e2);
      var z = ~~(v.z * 1e2);
      return "".concat(x, ",").concat(y, ",").concat(z);
    }

    function hashEdge(v0, v1) {
      return "".concat(hashVertex(v0), "_").concat(hashVertex(v1));
    }

    var hardEdges = new Set();
    var halfEdgeList = {};
    var fullHalfEdgeList = {};
    var normals = [];

    for (var i = 0, l = lineSegments.length; i < l; i++) {
      var ls = lineSegments[i];
      var v0 = ls.v0;
      var v1 = ls.v1;
      hardEdges.add(hashEdge(v0, v1));
      hardEdges.add(hashEdge(v1, v0));
    }

    for (var i = 0, l = triangles.length; i < l; i++) {
      var tri = triangles[i];

      for (var i2 = 0, l2 = 3; i2 < l2; i2++) {
        var index = i2;
        var next = (i2 + 1) % 3;
        var v0 = tri["v".concat(index)];
        var v1 = tri["v".concat(next)];
        var hash = hashEdge(v0, v1);
        if (hardEdges.has(hash)) continue;
        halfEdgeList[hash] = tri;
        fullHalfEdgeList[hash] = tri;
      }
    }

    while (true) {
      var halfEdges = Object.keys(halfEdgeList);
      if (halfEdges.length === 0) break;
      var i = 0;
      var queue = [fullHalfEdgeList[halfEdges[0]]];

      while (i < queue.length) {
        var tri = queue[i];
        i++;
        var faceNormal = tri.faceNormal;

        if (tri.n0 === null) {
          tri.n0 = faceNormal.clone();
          normals.push(tri.n0);
        }

        if (tri.n1 === null) {
          tri.n1 = faceNormal.clone();
          normals.push(tri.n1);
        }

        if (tri.n2 === null) {
          tri.n2 = faceNormal.clone();
          normals.push(tri.n2);
        }

        for (var i2 = 0, l2 = 3; i2 < l2; i2++) {
          var index = i2;
          var next = (i2 + 1) % 3;
          var v0 = tri["v".concat(index)];
          var v1 = tri["v".concat(next)];
          var hash = hashEdge(v0, v1);
          delete halfEdgeList[hash];
          var reverseHash = hashEdge(v1, v0);
          var otherTri = fullHalfEdgeList[reverseHash];

          if (otherTri) {
            if (Math.abs(otherTri.faceNormal.dot(tri.faceNormal)) < 0.25) {
              continue;
            }

            if (reverseHash in halfEdgeList) {
              queue.push(otherTri);
              delete halfEdgeList[reverseHash];
            }

            for (var i3 = 0, l3 = 3; i3 < l3; i3++) {
              var otherIndex = i3;
              var otherNext = (i3 + 1) % 3;
              var otherV0 = otherTri["v".concat(otherIndex)];
              var otherV1 = otherTri["v".concat(otherNext)];
              var otherHash = hashEdge(otherV0, otherV1);

              if (otherHash === reverseHash) {
                if (otherTri["n".concat(otherIndex)] === null) {
                  var norm = tri["n".concat(next)];
                  otherTri["n".concat(otherIndex)] = norm;
                  norm.add(otherTri.faceNormal);
                }

                if (otherTri["n".concat(otherNext)] === null) {
                  var norm = tri["n".concat(index)];
                  otherTri["n".concat(otherNext)] = norm;
                  norm.add(otherTri.faceNormal);
                }

                break;
              }
            }
          }
        }
      }
    }

    for (var i = 0, l = normals.length; i < l; i++) {
      normals[i].normalize();
    }
  }

  function isPrimitiveType(type) {
    return /primitive/i.test(type) || type === 'Subpart';
  }

  function LineParser(line, lineNumber) {
    this.line = line;
    this.lineLength = line.length;
    this.currentCharIndex = 0;
    this.currentChar = ' ';
    this.lineNumber = lineNumber;
  }

  LineParser.prototype = {
    constructor: LineParser,
    seekNonSpace: function seekNonSpace() {
      while (this.currentCharIndex < this.lineLength) {
        this.currentChar = this.line.charAt(this.currentCharIndex);

        if (this.currentChar !== ' ' && this.currentChar !== '\t') {
          return;
        }

        this.currentCharIndex++;
      }
    },
    getToken: function getToken() {
      var pos0 = this.currentCharIndex++;

      while (this.currentCharIndex < this.lineLength) {
        this.currentChar = this.line.charAt(this.currentCharIndex);

        if (this.currentChar === ' ' || this.currentChar === '\t') {
          break;
        }

        this.currentCharIndex++;
      }

      var pos1 = this.currentCharIndex;
      this.seekNonSpace();
      return this.line.substring(pos0, pos1);
    },
    getRemainingString: function getRemainingString() {
      return this.line.substring(this.currentCharIndex, this.lineLength);
    },
    isAtTheEnd: function isAtTheEnd() {
      return this.currentCharIndex >= this.lineLength;
    },
    setToEnd: function setToEnd() {
      this.currentCharIndex = this.lineLength;
    },
    getLineNumberString: function getLineNumberString() {
      return this.lineNumber >= 0 ? " at line " + this.lineNumber : "";
    }
  };

  function sortByMaterial(a, b) {
    if (a.colourCode === b.colourCode) {
      return 0;
    }

    if (a.colourCode < b.colourCode) {
      return -1;
    }

    return 1;
  }

  function createObject(elements, elementSize, isConditionalSegments) {
    elements.sort(sortByMaterial);
    var positions = [];
    var normals = [];
    var materials = [];
    var bufferGeometry = new THREE.BufferGeometry();
    var prevMaterial = null;
    var index0 = 0;
    var numGroupVerts = 0;

    for (var iElem = 0, nElem = elements.length; iElem < nElem; iElem++) {
      var elem = elements[iElem];
      var v0 = elem.v0;
      var v1 = elem.v1;
      positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z);

      if (elementSize === 3) {
        positions.push(elem.v2.x, elem.v2.y, elem.v2.z);
        var n0 = elem.n0 || elem.faceNormal;
        var n1 = elem.n1 || elem.faceNormal;
        var n2 = elem.n2 || elem.faceNormal;
        normals.push(n0.x, n0.y, n0.z);
        normals.push(n1.x, n1.y, n1.z);
        normals.push(n2.x, n2.y, n2.z);
      }

      if (prevMaterial !== elem.material) {
        if (prevMaterial !== null) {
          bufferGeometry.addGroup(index0, numGroupVerts, materials.length - 1);
        }

        materials.push(elem.material);
        prevMaterial = elem.material;
        index0 = iElem * elementSize;
        numGroupVerts = elementSize;
      } else {
        numGroupVerts += elementSize;
      }
    }

    if (numGroupVerts > 0) {
      bufferGeometry.addGroup(index0, Infinity, materials.length - 1);
    }

    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    if (elementSize === 3) {
      bufferGeometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    }

    var object3d = null;

    if (elementSize === 2) {
      object3d = new THREE.LineSegments(bufferGeometry, materials);
    } else if (elementSize === 3) {
      object3d = new THREE.Mesh(bufferGeometry, materials);
    }

    if (isConditionalSegments) {
      object3d.isConditionalLine = true;
      var controlArray0 = new Float32Array(elements.length * 3 * 2);
      var controlArray1 = new Float32Array(elements.length * 3 * 2);
      var directionArray = new Float32Array(elements.length * 3 * 2);

      for (var i = 0, l = elements.length; i < l; i++) {
        var os = elements[i];
        var c0 = os.c0;
        var c1 = os.c1;
        var v0 = os.v0;
        var v1 = os.v1;
        var index = i * 3 * 2;
        controlArray0[index + 0] = c0.x;
        controlArray0[index + 1] = c0.y;
        controlArray0[index + 2] = c0.z;
        controlArray0[index + 3] = c0.x;
        controlArray0[index + 4] = c0.y;
        controlArray0[index + 5] = c0.z;
        controlArray1[index + 0] = c1.x;
        controlArray1[index + 1] = c1.y;
        controlArray1[index + 2] = c1.z;
        controlArray1[index + 3] = c1.x;
        controlArray1[index + 4] = c1.y;
        controlArray1[index + 5] = c1.z;
        directionArray[index + 0] = v1.x - v0.x;
        directionArray[index + 1] = v1.y - v0.y;
        directionArray[index + 2] = v1.z - v0.z;
        directionArray[index + 3] = v1.x - v0.x;
        directionArray[index + 4] = v1.y - v0.y;
        directionArray[index + 5] = v1.z - v0.z;
      }

      bufferGeometry.setAttribute('control0', new THREE.BufferAttribute(controlArray0, 3, false));
      bufferGeometry.setAttribute('control1', new BufferAttribute(controlArray1, 3, false));
      bufferGeometry.setAttribute('direction', new BufferAttribute(directionArray, 3, false));
    }

    return object3d;
  }

  function LDrawLoader(manager) {
    Loader.call(this, manager);
    this.parseScopesStack = null;
    this.materials = [];
    this.subobjectCache = {};
    this.fileMap = null;
    this.setMaterials([this.parseColourMetaDirective(new LineParser("Main_Colour CODE 16 VALUE #FF8080 EDGE #333333")), this.parseColourMetaDirective(new LineParser("Edge_Colour CODE 24 VALUE #A0A0A0 EDGE #333333"))]);
    this.separateObjects = false;
    this.smoothNormals = true;
  }

  LDrawLoader.FINISH_TYPE_DEFAULT = 0;
  LDrawLoader.FINISH_TYPE_CHROME = 1;
  LDrawLoader.FINISH_TYPE_PEARLESCENT = 2;
  LDrawLoader.FINISH_TYPE_RUBBER = 3;
  LDrawLoader.FINISH_TYPE_MATTE_METALLIC = 4;
  LDrawLoader.FINISH_TYPE_METAL = 5;
  LDrawLoader.FILE_LOCATION_AS_IS = 0;
  LDrawLoader.FILE_LOCATION_TRY_PARTS = 1;
  LDrawLoader.FILE_LOCATION_TRY_P = 2;
  LDrawLoader.FILE_LOCATION_TRY_MODELS = 3;
  LDrawLoader.FILE_LOCATION_TRY_RELATIVE = 4;
  LDrawLoader.FILE_LOCATION_TRY_ABSOLUTE = 5;
  LDrawLoader.FILE_LOCATION_NOT_FOUND = 6;
  LDrawLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
    constructor: LDrawLoader,
    load: function load(url, onLoad, onProgress, onError) {
      if (!this.fileMap) {
        this.fileMap = {};
      }

      var scope = this;
      var fileLoader = new THREE.FileLoader(this.manager);
      fileLoader.setPath(this.path);
      fileLoader.setRequestHeader(this.requestHeader);
      fileLoader.setWithCredentials(this.withCredentials);
      fileLoader.load(url, function (text) {
        scope.processObject(text, onLoad, null, url);
      }, onProgress, onError);
    },
    parse: function parse(text, path, onLoad) {
      this.processObject(text, onLoad, null, path);
    },
    setMaterials: function setMaterials(materials) {
      this.parseScopesStack = [];
      this.newParseScopeLevel(materials);
      this.getCurrentParseScope().isFromParse = false;
      this.materials = materials;
      return this;
    },
    setFileMap: function setFileMap(fileMap) {
      this.fileMap = fileMap;
      return this;
    },
    newParseScopeLevel: function newParseScopeLevel(materials) {
      var matLib = {};

      if (materials) {
        for (var i = 0, n = materials.length; i < n; i++) {
          var material = materials[i];
          matLib[material.userData.code] = material;
        }
      }

      var topParseScope = this.getCurrentParseScope();
      var newParseScope = {
        lib: matLib,
        url: null,
        subobjects: null,
        numSubobjects: 0,
        subobjectIndex: 0,
        inverted: false,
        category: null,
        keywords: null,
        currentFileName: null,
        mainColourCode: topParseScope ? topParseScope.mainColourCode : '16',
        mainEdgeColourCode: topParseScope ? topParseScope.mainEdgeColourCode : '24',
        currentMatrix: new THREE.Matrix4(),
        matrix: new Matrix4(),
        isFromParse: true,
        triangles: null,
        lineSegments: null,
        conditionalSegments: null,
        startingConstructionStep: false
      };
      this.parseScopesStack.push(newParseScope);
      return newParseScope;
    },
    removeScopeLevel: function removeScopeLevel() {
      this.parseScopesStack.pop();
      return this;
    },
    addMaterial: function addMaterial(material) {
      var matLib = this.getCurrentParseScope().lib;

      if (!matLib[material.userData.code]) {
        this.materials.push(material);
      }

      matLib[material.userData.code] = material;
      return this;
    },
    getMaterial: function getMaterial(colourCode) {
      if (colourCode.startsWith("0x2")) {
        var colour = colourCode.substring(3);
        return this.parseColourMetaDirective(new LineParser("Direct_Color_" + colour + " CODE -1 VALUE #" + colour + " EDGE #" + colour + ""));
      }

      for (var i = this.parseScopesStack.length - 1; i >= 0; i--) {
        var material = this.parseScopesStack[i].lib[colourCode];

        if (material) {
          return material;
        }
      }

      return null;
    },
    getParentParseScope: function getParentParseScope() {
      if (this.parseScopesStack.length > 1) {
        return this.parseScopesStack[this.parseScopesStack.length - 2];
      }

      return null;
    },
    getCurrentParseScope: function getCurrentParseScope() {
      if (this.parseScopesStack.length > 0) {
        return this.parseScopesStack[this.parseScopesStack.length - 1];
      }

      return null;
    },
    parseColourMetaDirective: function parseColourMetaDirective(lineParser) {
      var code = null;
      var colour = 0xFF00FF;
      var edgeColour = 0xFF00FF;
      var alpha = 1;
      var isTransparent = false;
      var luminance = 0;
      var finishType = LDrawLoader.FINISH_TYPE_DEFAULT;
      var canHaveEnvMap = true;
      var edgeMaterial = null;
      var name = lineParser.getToken();

      if (!name) {
        throw 'LDrawLoader: Material name was expected after "!COLOUR tag' + lineParser.getLineNumberString() + ".";
      }

      var token = null;

      while (true) {
        token = lineParser.getToken();

        if (!token) {
          break;
        }

        switch (token.toUpperCase()) {
          case "CODE":
            code = lineParser.getToken();
            break;

          case "VALUE":
            colour = lineParser.getToken();

            if (colour.startsWith('0x')) {
              colour = '#' + colour.substring(2);
            } else if (!colour.startsWith('#')) {
              throw 'LDrawLoader: Invalid colour while parsing material' + lineParser.getLineNumberString() + ".";
            }

            break;

          case "EDGE":
            edgeColour = lineParser.getToken();

            if (edgeColour.startsWith('0x')) {
              edgeColour = '#' + edgeColour.substring(2);
            } else if (!edgeColour.startsWith('#')) {
              edgeMaterial = this.getMaterial(edgeColour);

              if (!edgeMaterial) {
                throw 'LDrawLoader: Invalid edge colour while parsing material' + lineParser.getLineNumberString() + ".";
              }

              edgeMaterial = edgeMaterial.userData.edgeMaterial;
            }

            break;

          case 'ALPHA':
            alpha = parseInt(lineParser.getToken());

            if (isNaN(alpha)) {
              throw 'LDrawLoader: Invalid alpha value in material definition' + lineParser.getLineNumberString() + ".";
            }

            alpha = Math.max(0, Math.min(1, alpha / 255));

            if (alpha < 1) {
              isTransparent = true;
            }

            break;

          case 'LUMINANCE':
            luminance = parseInt(lineParser.getToken());

            if (isNaN(luminance)) {
              throw 'LDrawLoader: Invalid luminance value in material definition' + LineParser.getLineNumberString() + ".";
            }

            luminance = Math.max(0, Math.min(1, luminance / 255));
            break;

          case 'CHROME':
            finishType = LDrawLoader.FINISH_TYPE_CHROME;
            break;

          case 'PEARLESCENT':
            finishType = LDrawLoader.FINISH_TYPE_PEARLESCENT;
            break;

          case 'RUBBER':
            finishType = LDrawLoader.FINISH_TYPE_RUBBER;
            break;

          case 'MATTE_METALLIC':
            finishType = LDrawLoader.FINISH_TYPE_MATTE_METALLIC;
            break;

          case 'METAL':
            finishType = LDrawLoader.FINISH_TYPE_METAL;
            break;

          case 'MATERIAL':
            lineParser.setToEnd();
            break;

          default:
            throw 'LDrawLoader: Unknown token "' + token + '" while parsing material' + lineParser.getLineNumberString() + ".";
            break;
        }
      }

      var material = null;

      switch (finishType) {
        case LDrawLoader.FINISH_TYPE_DEFAULT:
          material = new THREE.MeshStandardMaterial({
            color: colour,
            roughness: 0.3,
            envMapIntensity: 0.3,
            metalness: 0
          });
          break;

        case LDrawLoader.FINISH_TYPE_PEARLESCENT:
          var specular = new THREE.Color(colour);
          var hsl = specular.getHSL({
            h: 0,
            s: 0,
            l: 0
          });
          hsl.h = (hsl.h + 0.5) % 1;
          hsl.l = Math.min(1, hsl.l + (1 - hsl.l) * 0.7);
          specular.setHSL(hsl.h, hsl.s, hsl.l);
          material = new THREE.MeshPhongMaterial({
            color: colour,
            specular: specular,
            shininess: 10,
            reflectivity: 0.3
          });
          break;

        case LDrawLoader.FINISH_TYPE_CHROME:
          material = new MeshStandardMaterial({
            color: colour,
            roughness: 0,
            metalness: 1
          });
          break;

        case LDrawLoader.FINISH_TYPE_RUBBER:
          material = new MeshStandardMaterial({
            color: colour,
            roughness: 0.9,
            metalness: 0
          });
          canHaveEnvMap = false;
          break;

        case LDrawLoader.FINISH_TYPE_MATTE_METALLIC:
          material = new MeshStandardMaterial({
            color: colour,
            roughness: 0.8,
            metalness: 0.4
          });
          break;

        case LDrawLoader.FINISH_TYPE_METAL:
          material = new MeshStandardMaterial({
            color: colour,
            roughness: 0.2,
            metalness: 0.85
          });
          break;

        default:
          break;
      }

      material.transparent = isTransparent;
      material.premultipliedAlpha = true;
      material.opacity = alpha;
      material.depthWrite = !isTransparent;
      material.polygonOffset = true;
      material.polygonOffsetFactor = 1;
      material.userData.canHaveEnvMap = canHaveEnvMap;

      if (luminance !== 0) {
        material.emissive.set(material.color).multiplyScalar(luminance);
      }

      if (!edgeMaterial) {
        edgeMaterial = new THREE.LineBasicMaterial({
          color: edgeColour,
          transparent: isTransparent,
          opacity: alpha,
          depthWrite: !isTransparent
        });
        edgeMaterial.userData.code = code;
        edgeMaterial.name = name + " - Edge";
        edgeMaterial.userData.canHaveEnvMap = false;
        edgeMaterial.userData.conditionalEdgeMaterial = new THREE.ShaderMaterial({
          vertexShader: conditionalLineVertShader,
          fragmentShader: conditionalLineFragShader,
          uniforms: {
            diffuse: {
              value: new Color(edgeColour)
            },
            opacity: {
              value: alpha
            }
          },
          transparent: isTransparent,
          depthWrite: !isTransparent
        });
        edgeMaterial.userData.conditionalEdgeMaterial.userData.canHaveEnvMap = false;
      }

      material.userData.code = code;
      material.name = name;
      material.userData.edgeMaterial = edgeMaterial;
      return material;
    },
    objectParse: function objectParse(text) {
      var parentParseScope = this.getParentParseScope();
      var mainColourCode = parentParseScope.mainColourCode;
      var mainEdgeColourCode = parentParseScope.mainEdgeColourCode;
      var currentParseScope = this.getCurrentParseScope();
      var triangles;
      var lineSegments;
      var conditionalSegments;
      var subobjects = [];
      var category = null;
      var keywords = null;

      if (text.indexOf('\r\n') !== -1) {
        text = text.replace(/\r\n/g, '\n');
      }

      var lines = text.split('\n');
      var numLines = lines.length;
      var lineIndex = 0;
      var parsingEmbeddedFiles = false;
      var currentEmbeddedFileName = null;
      var currentEmbeddedText = null;
      var bfcCertified = false;
      var bfcCCW = true;
      var bfcInverted = false;
      var bfcCull = true;
      var type = '';
      var startingConstructionStep = false;
      var scope = this;

      function parseColourCode(lineParser, forEdge) {
        var colourCode = lineParser.getToken();

        if (!forEdge && colourCode === '16') {
          colourCode = mainColourCode;
        }

        if (forEdge && colourCode === '24') {
          colourCode = mainEdgeColourCode;
        }

        var material = scope.getMaterial(colourCode);

        if (!material) {
          throw 'LDrawLoader: Unknown colour code "' + colourCode + '" is used' + lineParser.getLineNumberString() + ' but it was not defined previously.';
        }

        return material;
      }

      function parseVector(lp) {
        var v = new Vector3(parseFloat(lp.getToken()), parseFloat(lp.getToken()), parseFloat(lp.getToken()));

        if (!scope.separateObjects) {
          v.applyMatrix4(currentParseScope.currentMatrix);
        }

        return v;
      }

      for (lineIndex = 0; lineIndex < numLines; lineIndex++) {
        var line = lines[lineIndex];
        if (line.length === 0) continue;

        if (parsingEmbeddedFiles) {
          if (line.startsWith('0 FILE ')) {
            this.subobjectCache[currentEmbeddedFileName.toLowerCase()] = currentEmbeddedText;
            currentEmbeddedFileName = line.substring(7);
            currentEmbeddedText = '';
          } else {
            currentEmbeddedText += line + '\n';
          }

          continue;
        }

        var lp = new LineParser(line, lineIndex + 1);
        lp.seekNonSpace();

        if (lp.isAtTheEnd()) {
          continue;
        }

        var lineType = lp.getToken();

        switch (lineType) {
          case '0':
            var meta = lp.getToken();

            if (meta) {
              switch (meta) {
                case '!LDRAW_ORG':
                  type = lp.getToken();
                  currentParseScope.triangles = [];
                  currentParseScope.lineSegments = [];
                  currentParseScope.conditionalSegments = [];
                  currentParseScope.type = type;
                  var isRoot = !parentParseScope.isFromParse;

                  if (isRoot || scope.separateObjects && !isPrimitiveType(type)) {
                    currentParseScope.groupObject = new THREE.Group();
                    currentParseScope.groupObject.userData.startingConstructionStep = currentParseScope.startingConstructionStep;
                  }

                  var matrix = currentParseScope.matrix;

                  if (matrix.determinant() < 0 && (scope.separateObjects && isPrimitiveType(type) || !scope.separateObjects)) {
                    currentParseScope.inverted = !currentParseScope.inverted;
                  }

                  triangles = currentParseScope.triangles;
                  lineSegments = currentParseScope.lineSegments;
                  conditionalSegments = currentParseScope.conditionalSegments;
                  break;

                case '!COLOUR':
                  var material = this.parseColourMetaDirective(lp);

                  if (material) {
                    this.addMaterial(material);
                  } else {
                    console.warn('LDrawLoader: Error parsing material' + lp.getLineNumberString());
                  }

                  break;

                case '!CATEGORY':
                  category = lp.getToken();
                  break;

                case '!KEYWORDS':
                  var newKeywords = lp.getRemainingString().split(',');

                  if (newKeywords.length > 0) {
                    if (!keywords) {
                      keywords = [];
                    }

                    newKeywords.forEach(function (keyword) {
                      keywords.push(keyword.trim());
                    });
                  }

                  break;

                case 'FILE':
                  if (lineIndex > 0) {
                    parsingEmbeddedFiles = true;
                    currentEmbeddedFileName = lp.getRemainingString();
                    currentEmbeddedText = '';
                    bfcCertified = false;
                    bfcCCW = true;
                  }

                  break;

                case 'BFC':
                  while (!lp.isAtTheEnd()) {
                    var token = lp.getToken();

                    switch (token) {
                      case 'CERTIFY':
                      case 'NOCERTIFY':
                        bfcCertified = token === 'CERTIFY';
                        bfcCCW = true;
                        break;

                      case 'CW':
                      case 'CCW':
                        bfcCCW = token === 'CCW';
                        break;

                      case 'INVERTNEXT':
                        bfcInverted = true;
                        break;

                      case 'CLIP':
                      case 'NOCLIP':
                        bfcCull = token === 'CLIP';
                        break;

                      default:
                        console.warn('THREE.LDrawLoader: BFC directive "' + token + '" is unknown.');
                        break;
                    }
                  }

                  break;

                case 'STEP':
                  startingConstructionStep = true;
                  break;

                default:
                  break;
              }
            }

            break;

          case '1':
            var material = parseColourCode(lp);
            var posX = parseFloat(lp.getToken());
            var posY = parseFloat(lp.getToken());
            var posZ = parseFloat(lp.getToken());
            var m0 = parseFloat(lp.getToken());
            var m1 = parseFloat(lp.getToken());
            var m2 = parseFloat(lp.getToken());
            var m3 = parseFloat(lp.getToken());
            var m4 = parseFloat(lp.getToken());
            var m5 = parseFloat(lp.getToken());
            var m6 = parseFloat(lp.getToken());
            var m7 = parseFloat(lp.getToken());
            var m8 = parseFloat(lp.getToken());
            var matrix = new Matrix4().set(m0, m1, m2, posX, m3, m4, m5, posY, m6, m7, m8, posZ, 0, 0, 0, 1);
            var fileName = lp.getRemainingString().trim().replace(/\\/g, "/");

            if (scope.fileMap[fileName]) {
              fileName = scope.fileMap[fileName];
            } else {
              if (fileName.startsWith('s/')) {
                fileName = 'parts/' + fileName;
              } else if (fileName.startsWith('48/')) {
                fileName = 'p/' + fileName;
              }
            }

            subobjects.push({
              material: material,
              matrix: matrix,
              fileName: fileName,
              originalFileName: fileName,
              locationState: LDrawLoader.FILE_LOCATION_AS_IS,
              url: null,
              triedLowerCase: false,
              inverted: bfcInverted !== currentParseScope.inverted,
              startingConstructionStep: startingConstructionStep
            });
            bfcInverted = false;
            break;

          case '2':
            var material = parseColourCode(lp, true);
            var segment = {
              material: material.userData.edgeMaterial,
              colourCode: material.userData.code,
              v0: parseVector(lp),
              v1: parseVector(lp)
            };
            lineSegments.push(segment);
            break;

          case '5':
            var material = parseColourCode(lp, true);
            var segment = {
              material: material.userData.edgeMaterial.userData.conditionalEdgeMaterial,
              colourCode: material.userData.code,
              v0: parseVector(lp),
              v1: parseVector(lp),
              c0: parseVector(lp),
              c1: parseVector(lp)
            };
            conditionalSegments.push(segment);
            break;

          case '3':
            var material = parseColourCode(lp);
            var inverted = currentParseScope.inverted;
            var ccw = bfcCCW !== inverted;
            var doubleSided = !bfcCertified || !bfcCull;
            var v0, v1, v2, faceNormal;

            if (ccw === true) {
              v0 = parseVector(lp);
              v1 = parseVector(lp);
              v2 = parseVector(lp);
            } else {
              v2 = parseVector(lp);
              v1 = parseVector(lp);
              v0 = parseVector(lp);
            }

            tempVec0.subVectors(v1, v0);
            tempVec1.subVectors(v2, v1);
            faceNormal = new Vector3().crossVectors(tempVec0, tempVec1).normalize();
            triangles.push({
              material: material,
              colourCode: material.userData.code,
              v0: v0,
              v1: v1,
              v2: v2,
              faceNormal: faceNormal,
              n0: null,
              n1: null,
              n2: null
            });

            if (doubleSided === true) {
              triangles.push({
                material: material,
                colourCode: material.userData.code,
                v0: v0,
                v1: v2,
                v2: v1,
                faceNormal: faceNormal,
                n0: null,
                n1: null,
                n2: null
              });
            }

            break;

          case '4':
            var material = parseColourCode(lp);
            var inverted = currentParseScope.inverted;
            var ccw = bfcCCW !== inverted;
            var doubleSided = !bfcCertified || !bfcCull;
            var v0, v1, v2, v3, faceNormal;

            if (ccw === true) {
              v0 = parseVector(lp);
              v1 = parseVector(lp);
              v2 = parseVector(lp);
              v3 = parseVector(lp);
            } else {
              v3 = parseVector(lp);
              v2 = parseVector(lp);
              v1 = parseVector(lp);
              v0 = parseVector(lp);
            }

            tempVec0.subVectors(v1, v0);
            tempVec1.subVectors(v2, v1);
            faceNormal = new Vector3().crossVectors(tempVec0, tempVec1).normalize();
            triangles.push({
              material: material,
              colourCode: material.userData.code,
              v0: v0,
              v1: v1,
              v2: v2,
              faceNormal: faceNormal,
              n0: null,
              n1: null,
              n2: null
            });
            triangles.push({
              material: material,
              colourCode: material.userData.code,
              v0: v0,
              v1: v2,
              v2: v3,
              faceNormal: faceNormal,
              n0: null,
              n1: null,
              n2: null
            });

            if (doubleSided === true) {
              triangles.push({
                material: material,
                colourCode: material.userData.code,
                v0: v0,
                v1: v2,
                v2: v1,
                faceNormal: faceNormal,
                n0: null,
                n1: null,
                n2: null
              });
              triangles.push({
                material: material,
                colourCode: material.userData.code,
                v0: v0,
                v1: v3,
                v2: v2,
                faceNormal: faceNormal,
                n0: null,
                n1: null,
                n2: null
              });
            }

            break;

          default:
            throw 'LDrawLoader: Unknown line type "' + lineType + '"' + lp.getLineNumberString() + '.';
            break;
        }
      }

      if (parsingEmbeddedFiles) {
        this.subobjectCache[currentEmbeddedFileName.toLowerCase()] = currentEmbeddedText;
      }

      currentParseScope.category = category;
      currentParseScope.keywords = keywords;
      currentParseScope.subobjects = subobjects;
      currentParseScope.numSubobjects = subobjects.length;
      currentParseScope.subobjectIndex = 0;
    },
    computeConstructionSteps: function computeConstructionSteps(model) {
      var stepNumber = 0;
      model.traverse(function (c) {
        if (c.isGroup) {
          if (c.userData.startingConstructionStep) {
            stepNumber++;
          }

          c.userData.constructionStep = stepNumber;
        }
      });
      model.userData.numConstructionSteps = stepNumber + 1;
    },
    processObject: function processObject(text, onProcessed, subobject, url) {
      var scope = this;
      var parseScope = scope.newParseScopeLevel();
      parseScope.url = url;
      var parentParseScope = scope.getParentParseScope();

      if (subobject) {
        parseScope.currentMatrix.multiplyMatrices(parentParseScope.currentMatrix, subobject.matrix);
        parseScope.matrix.copy(subobject.matrix);
        parseScope.inverted = subobject.inverted;
        parseScope.startingConstructionStep = subobject.startingConstructionStep;
      }

      var currentFileName = parentParseScope.currentFileName;

      if (currentFileName !== null) {
        currentFileName = parentParseScope.currentFileName.toLowerCase();
      }

      if (scope.subobjectCache[currentFileName] === undefined) {
        scope.subobjectCache[currentFileName] = text;
      }

      scope.objectParse(text);
      var finishedCount = 0;
      onSubobjectFinish();

      function onSubobjectFinish() {
        finishedCount++;

        if (finishedCount === parseScope.subobjects.length + 1) {
          finalizeObject();
        } else {
          var subobject = parseScope.subobjects[parseScope.subobjectIndex];
          Promise.resolve().then(function () {
            loadSubobject(subobject);
          });
          parseScope.subobjectIndex++;
        }
      }

      function finalizeObject() {
        if (scope.smoothNormals && parseScope.type === 'Part') {
          smoothNormals(parseScope.triangles, parseScope.lineSegments);
        }

        var isRoot = !parentParseScope.isFromParse;

        if (scope.separateObjects && !isPrimitiveType(parseScope.type) || isRoot) {
          var objGroup = parseScope.groupObject;

          if (parseScope.triangles.length > 0) {
            objGroup.add(createObject(parseScope.triangles, 3));
          }

          if (parseScope.lineSegments.length > 0) {
            objGroup.add(createObject(parseScope.lineSegments, 2));
          }

          if (parseScope.conditionalSegments.length > 0) {
            objGroup.add(createObject(parseScope.conditionalSegments, 2, true));
          }

          if (parentParseScope.groupObject) {
            objGroup.name = parseScope.fileName;
            objGroup.userData.category = parseScope.category;
            objGroup.userData.keywords = parseScope.keywords;
            parseScope.matrix.decompose(objGroup.position, objGroup.quaternion, objGroup.scale);
            parentParseScope.groupObject.add(objGroup);
          }
        } else {
          var separateObjects = scope.separateObjects;
          var parentLineSegments = parentParseScope.lineSegments;
          var parentConditionalSegments = parentParseScope.conditionalSegments;
          var parentTriangles = parentParseScope.triangles;
          var lineSegments = parseScope.lineSegments;
          var conditionalSegments = parseScope.conditionalSegments;
          var triangles = parseScope.triangles;

          for (var i = 0, l = lineSegments.length; i < l; i++) {
            var ls = lineSegments[i];

            if (separateObjects) {
              ls.v0.applyMatrix4(parseScope.matrix);
              ls.v1.applyMatrix4(parseScope.matrix);
            }

            parentLineSegments.push(ls);
          }

          for (var i = 0, l = conditionalSegments.length; i < l; i++) {
            var os = conditionalSegments[i];

            if (separateObjects) {
              os.v0.applyMatrix4(parseScope.matrix);
              os.v1.applyMatrix4(parseScope.matrix);
              os.c0.applyMatrix4(parseScope.matrix);
              os.c1.applyMatrix4(parseScope.matrix);
            }

            parentConditionalSegments.push(os);
          }

          for (var i = 0, l = triangles.length; i < l; i++) {
            var tri = triangles[i];

            if (separateObjects) {
              tri.v0 = tri.v0.clone().applyMatrix4(parseScope.matrix);
              tri.v1 = tri.v1.clone().applyMatrix4(parseScope.matrix);
              tri.v2 = tri.v2.clone().applyMatrix4(parseScope.matrix);
              tempVec0.subVectors(tri.v1, tri.v0);
              tempVec1.subVectors(tri.v2, tri.v1);
              tri.faceNormal.crossVectors(tempVec0, tempVec1).normalize();
            }

            parentTriangles.push(tri);
          }
        }

        scope.removeScopeLevel();

        if (!parentParseScope.isFromParse) {
          scope.computeConstructionSteps(parseScope.groupObject);
        }

        if (onProcessed) {
          onProcessed(parseScope.groupObject);
        }
      }

      function loadSubobject(subobject) {
        parseScope.mainColourCode = subobject.material.userData.code;
        parseScope.mainEdgeColourCode = subobject.material.userData.edgeMaterial.userData.code;
        parseScope.currentFileName = subobject.originalFileName;
        var cached = scope.subobjectCache[subobject.originalFileName.toLowerCase()];

        if (cached) {
          scope.processObject(cached, function (subobjectGroup) {
            onSubobjectLoaded(subobjectGroup, subobject);
            onSubobjectFinish();
          }, subobject, url);
          return;
        }

        var subobjectURL = subobject.fileName;
        var newLocationState = LDrawLoader.FILE_LOCATION_NOT_FOUND;

        switch (subobject.locationState) {
          case LDrawLoader.FILE_LOCATION_AS_IS:
            newLocationState = subobject.locationState + 1;
            break;

          case LDrawLoader.FILE_LOCATION_TRY_PARTS:
            subobjectURL = 'parts/' + subobjectURL;
            newLocationState = subobject.locationState + 1;
            break;

          case LDrawLoader.FILE_LOCATION_TRY_P:
            subobjectURL = 'p/' + subobjectURL;
            newLocationState = subobject.locationState + 1;
            break;

          case LDrawLoader.FILE_LOCATION_TRY_MODELS:
            subobjectURL = 'models/' + subobjectURL;
            newLocationState = subobject.locationState + 1;
            break;

          case LDrawLoader.FILE_LOCATION_TRY_RELATIVE:
            subobjectURL = url.substring(0, url.lastIndexOf("/") + 1) + subobjectURL;
            newLocationState = subobject.locationState + 1;
            break;

          case LDrawLoader.FILE_LOCATION_TRY_ABSOLUTE:
            if (subobject.triedLowerCase) {
              newLocationState = LDrawLoader.FILE_LOCATION_NOT_FOUND;
            } else {
              subobject.fileName = subobject.fileName.toLowerCase();
              subobjectURL = subobject.fileName;
              subobject.triedLowerCase = true;
              newLocationState = LDrawLoader.FILE_LOCATION_AS_IS;
            }

            break;

          case LDrawLoader.FILE_LOCATION_NOT_FOUND:
            console.warn('LDrawLoader: Subobject "' + subobject.originalFileName + '" could not be found.');
            return;
        }

        subobject.locationState = newLocationState;
        subobject.url = subobjectURL;
        var fileLoader = new FileLoader(scope.manager);
        fileLoader.setPath(scope.path);
        fileLoader.setRequestHeader(scope.requestHeader);
        fileLoader.setWithCredentials(scope.withCredentials);
        fileLoader.load(subobjectURL, function (text) {
          scope.processObject(text, function (subobjectGroup) {
            onSubobjectLoaded(subobjectGroup, subobject);
            onSubobjectFinish();
          }, subobject, url);
        }, undefined, function (err) {
          onSubobjectError(err, subobject);
        }, subobject);
      }

      function onSubobjectLoaded(subobjectGroup, subobject) {
        if (subobjectGroup === null) {
          loadSubobject(subobject);
          return;
        }

        scope.fileMap[subobject.originalFileName] = subobject.url;
      }

      function onSubobjectError(err, subobject) {
        loadSubobject(subobject);
      }
    }
  });
  return LDrawLoader;
}();

THREE.LDrawLoader = LDrawLoader;