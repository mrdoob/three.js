"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
THREE.VRMLLoader = void 0;

var VRMLLoader = function () {
  if (typeof chevrotain === 'undefined') {
    throw Error('THREE.VRMLLoader: External library chevrotain.min.js required.');
  }

  function VRMLLoader(manager) {
    Loader.call(this, manager);
  }

  VRMLLoader.prototype = Object.assign(Object.create(THREE.Loader.prototype), {
    constructor: VRMLLoader,
    load: function load(url, onLoad, onProgress, onError) {
      var scope = this;
      var path = scope.path === '' ? THREE.LoaderUtils.extractUrlBase(url) : scope.path;
      var loader = new THREE.FileLoader(scope.manager);
      loader.setPath(scope.path);
      loader.setRequestHeader(scope.requestHeader);
      loader.setWithCredentials(scope.withCredentials);
      loader.load(url, function (text) {
        try {
          onLoad(scope.parse(text, path));
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
    parse: function parse(data, path) {
      var nodeMap = {};

      function generateVRMLTree(data) {
        var tokenData = createTokens();
        var lexer = new VRMLLexer(tokenData.tokens);
        var parser = new VRMLParser(tokenData.tokenVocabulary);
        var visitor = createVisitor(parser.getBaseCstVisitorConstructor());
        var lexingResult = lexer.lex(data);
        parser.input = lexingResult.tokens;
        var cstOutput = parser.vrml();

        if (parser.errors.length > 0) {
          console.error(parser.errors);
          throw Error('THREE.VRMLLoader: Parsing errors detected.');
        }

        var ast = visitor.visit(cstOutput);
        return ast;
      }

      function createTokens() {
        var createToken = chevrotain.createToken;
        var RouteIdentifier = createToken({
          name: 'RouteIdentifier',
          pattern: /[^\x30-\x39\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d][^\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]*[\.][^\x30-\x39\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d][^\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]*/
        });
        var Identifier = createToken({
          name: 'Identifier',
          pattern: /[^\x30-\x39\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d][^\0-\x20\x22\x27\x23\x2b\x2c\x2d\x2e\x5b\x5d\x5c\x7b\x7d]*/,
          longer_alt: RouteIdentifier
        });
        var nodeTypes = ['Anchor', 'Billboard', 'Collision', 'Group', 'Transform', 'Inline', 'LOD', 'Switch', 'AudioClip', 'DirectionalLight', 'PointLight', 'Script', 'Shape', 'Sound', 'SpotLight', 'WorldInfo', 'CylinderSensor', 'PlaneSensor', 'ProximitySensor', 'SphereSensor', 'TimeSensor', 'TouchSensor', 'VisibilitySensor', 'Box', 'Cone', 'Cylinder', 'ElevationGrid', 'Extrusion', 'IndexedFaceSet', 'IndexedLineSet', 'PointSet', 'Sphere', 'Color', 'Coordinate', 'Normal', 'TextureCoordinate', 'Appearance', 'FontStyle', 'ImageTexture', 'Material', 'MovieTexture', 'PixelTexture', 'TextureTransform', 'ColorInterpolator', 'CoordinateInterpolator', 'NormalInterpolator', 'OrientationInterpolator', 'PositionInterpolator', 'ScalarInterpolator', 'Background', 'Fog', 'NavigationInfo', 'Viewpoint', 'Text'];
        var Version = createToken({
          name: 'Version',
          pattern: /#VRML.*/,
          longer_alt: Identifier
        });
        var NodeName = createToken({
          name: 'NodeName',
          pattern: new RegExp(nodeTypes.join('|')),
          longer_alt: Identifier
        });
        var DEF = createToken({
          name: 'DEF',
          pattern: /DEF/,
          longer_alt: Identifier
        });
        var USE = createToken({
          name: 'USE',
          pattern: /USE/,
          longer_alt: Identifier
        });
        var ROUTE = createToken({
          name: 'ROUTE',
          pattern: /ROUTE/,
          longer_alt: Identifier
        });
        var TO = createToken({
          name: 'TO',
          pattern: /TO/,
          longer_alt: Identifier
        });
        var StringLiteral = createToken({
          name: "StringLiteral",
          pattern: /"(:?[^\\"\n\r]+|\\(:?[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/
        });
        var HexLiteral = createToken({
          name: 'HexLiteral',
          pattern: /0[xX][0-9a-fA-F]+/
        });
        var NumberLiteral = createToken({
          name: 'NumberLiteral',
          pattern: /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/
        });
        var TrueLiteral = createToken({
          name: 'TrueLiteral',
          pattern: /TRUE/
        });
        var FalseLiteral = createToken({
          name: 'FalseLiteral',
          pattern: /FALSE/
        });
        var NullLiteral = createToken({
          name: 'NullLiteral',
          pattern: /NULL/
        });
        var LSquare = createToken({
          name: 'LSquare',
          pattern: /\[/
        });
        var RSquare = createToken({
          name: 'RSquare',
          pattern: /]/
        });
        var LCurly = createToken({
          name: 'LCurly',
          pattern: /{/
        });
        var RCurly = createToken({
          name: 'RCurly',
          pattern: /}/
        });
        var Comment = createToken({
          name: 'Comment',
          pattern: /#.*/,
          group: chevrotain.Lexer.SKIPPED
        });
        var WhiteSpace = createToken({
          name: 'WhiteSpace',
          pattern: /[ ,\s]/,
          group: chevrotain.Lexer.SKIPPED
        });
        var tokens = [WhiteSpace, NodeName, DEF, USE, ROUTE, TO, TrueLiteral, FalseLiteral, NullLiteral, Version, Identifier, RouteIdentifier, StringLiteral, HexLiteral, NumberLiteral, LSquare, RSquare, LCurly, RCurly, Comment];
        var tokenVocabulary = {};

        for (var i = 0, l = tokens.length; i < l; i++) {
          var token = tokens[i];
          tokenVocabulary[token.name] = token;
        }

        return {
          tokens: tokens,
          tokenVocabulary: tokenVocabulary
        };
      }

      function createVisitor(BaseVRMLVisitor) {
        function VRMLToASTVisitor() {
          BaseVRMLVisitor.call(this);
          this.validateVisitor();
        }

        VRMLToASTVisitor.prototype = Object.assign(Object.create(BaseVRMLVisitor.prototype), {
          constructor: VRMLToASTVisitor,
          vrml: function vrml(ctx) {
            var data = {
              version: this.visit(ctx.version),
              nodes: [],
              routes: []
            };

            for (var i = 0, l = ctx.node.length; i < l; i++) {
              var node = ctx.node[i];
              data.nodes.push(this.visit(node));
            }

            if (ctx.route) {
              for (var i = 0, l = ctx.route.length; i < l; i++) {
                var route = ctx.route[i];
                data.routes.push(this.visit(route));
              }
            }

            return data;
          },
          version: function version(ctx) {
            return ctx.Version[0].image;
          },
          node: function node(ctx) {
            var data = {
              name: ctx.NodeName[0].image,
              fields: []
            };

            if (ctx.field) {
              for (var i = 0, l = ctx.field.length; i < l; i++) {
                var field = ctx.field[i];
                data.fields.push(this.visit(field));
              }
            }

            if (ctx.def) {
              data.DEF = this.visit(ctx.def[0]);
            }

            return data;
          },
          field: function field(ctx) {
            var data = {
              name: ctx.Identifier[0].image,
              type: null,
              values: null
            };
            var result;

            if (ctx.singleFieldValue) {
              result = this.visit(ctx.singleFieldValue[0]);
            }

            if (ctx.multiFieldValue) {
              result = this.visit(ctx.multiFieldValue[0]);
            }

            data.type = result.type;
            data.values = result.values;
            return data;
          },
          def: function def(ctx) {
            return (ctx.Identifier || ctx.NodeName)[0].image;
          },
          use: function use(ctx) {
            return {
              USE: (ctx.Identifier || ctx.NodeName)[0].image
            };
          },
          singleFieldValue: function singleFieldValue(ctx) {
            return processField(this, ctx);
          },
          multiFieldValue: function multiFieldValue(ctx) {
            return processField(this, ctx);
          },
          route: function route(ctx) {
            var data = {
              FROM: ctx.RouteIdentifier[0].image,
              TO: ctx.RouteIdentifier[1].image
            };
            return data;
          }
        });

        function processField(scope, ctx) {
          var field = {
            type: null,
            values: []
          };

          if (ctx.node) {
            field.type = 'node';

            for (var i = 0, l = ctx.node.length; i < l; i++) {
              var node = ctx.node[i];
              field.values.push(scope.visit(node));
            }
          }

          if (ctx.use) {
            field.type = 'use';

            for (var i = 0, l = ctx.use.length; i < l; i++) {
              var use = ctx.use[i];
              field.values.push(scope.visit(use));
            }
          }

          if (ctx.StringLiteral) {
            field.type = 'string';

            for (var i = 0, l = ctx.StringLiteral.length; i < l; i++) {
              var stringLiteral = ctx.StringLiteral[i];
              field.values.push(stringLiteral.image.replace(/'|"/g, ''));
            }
          }

          if (ctx.NumberLiteral) {
            field.type = 'number';

            for (var i = 0, l = ctx.NumberLiteral.length; i < l; i++) {
              var numberLiteral = ctx.NumberLiteral[i];
              field.values.push(parseFloat(numberLiteral.image));
            }
          }

          if (ctx.HexLiteral) {
            field.type = 'hex';

            for (var i = 0, l = ctx.HexLiteral.length; i < l; i++) {
              var hexLiteral = ctx.HexLiteral[i];
              field.values.push(hexLiteral.image);
            }
          }

          if (ctx.TrueLiteral) {
            field.type = 'boolean';

            for (var i = 0, l = ctx.TrueLiteral.length; i < l; i++) {
              var trueLiteral = ctx.TrueLiteral[i];
              if (trueLiteral.image === 'TRUE') field.values.push(true);
            }
          }

          if (ctx.FalseLiteral) {
            field.type = 'boolean';

            for (var i = 0, l = ctx.FalseLiteral.length; i < l; i++) {
              var falseLiteral = ctx.FalseLiteral[i];
              if (falseLiteral.image === 'FALSE') field.values.push(false);
            }
          }

          if (ctx.NullLiteral) {
            field.type = 'null';
            ctx.NullLiteral.forEach(function () {
              field.values.push(null);
            });
          }

          return field;
        }

        return new VRMLToASTVisitor();
      }

      function parseTree(tree) {
        var nodes = tree.nodes;
        var scene = new THREE.Scene();

        for (var i = 0, l = nodes.length; i < l; i++) {
          var node = nodes[i];
          buildNodeMap(node);
        }

        for (var i = 0, l = nodes.length; i < l; i++) {
          var node = nodes[i];
          var object = getNode(node);
          if (object instanceof Object3D) scene.add(object);
          if (node.name === 'WorldInfo') scene.userData.worldInfo = object;
        }

        return scene;
      }

      function buildNodeMap(node) {
        if (node.DEF) {
          nodeMap[node.DEF] = node;
        }

        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];

          if (field.type === 'node') {
            var fieldValues = field.values;

            for (var j = 0, jl = fieldValues.length; j < jl; j++) {
              buildNodeMap(fieldValues[j]);
            }
          }
        }
      }

      function getNode(node) {
        if (node.USE) {
          return resolveUSE(node.USE);
        }

        if (node.build !== undefined) return node.build;
        node.build = buildNode(node);
        return node.build;
      }

      function buildNode(node) {
        var nodeName = node.name;
        var build;

        switch (nodeName) {
          case 'Group':
          case 'Transform':
          case 'Collision':
            build = buildGroupingNode(node);
            break;

          case 'Background':
            build = buildBackgroundNode(node);
            break;

          case 'Shape':
            build = buildShapeNode(node);
            break;

          case 'Appearance':
            build = buildAppearanceNode(node);
            break;

          case 'Material':
            build = buildMaterialNode(node);
            break;

          case 'ImageTexture':
            build = buildImageTextureNode(node);
            break;

          case 'PixelTexture':
            build = buildPixelTextureNode(node);
            break;

          case 'TextureTransform':
            build = buildTextureTransformNode(node);
            break;

          case 'IndexedFaceSet':
            build = buildIndexedFaceSetNode(node);
            break;

          case 'IndexedLineSet':
            build = buildIndexedLineSetNode(node);
            break;

          case 'PointSet':
            build = buildPointSetNode(node);
            break;

          case 'Box':
            build = buildBoxNode(node);
            break;

          case 'Cone':
            build = buildConeNode(node);
            break;

          case 'Cylinder':
            build = buildCylinderNode(node);
            break;

          case 'Sphere':
            build = buildSphereNode(node);
            break;

          case 'ElevationGrid':
            build = buildElevationGridNode(node);
            break;

          case 'Extrusion':
            build = buildExtrusionNode(node);
            break;

          case 'Color':
          case 'Coordinate':
          case 'Normal':
          case 'TextureCoordinate':
            build = buildGeometricNode(node);
            break;

          case 'WorldInfo':
            build = buildWorldInfoNode(node);
            break;

          case 'Anchor':
          case 'Billboard':
          case 'Inline':
          case 'LOD':
          case 'Switch':
          case 'AudioClip':
          case 'DirectionalLight':
          case 'PointLight':
          case 'Script':
          case 'Sound':
          case 'SpotLight':
          case 'CylinderSensor':
          case 'PlaneSensor':
          case 'ProximitySensor':
          case 'SphereSensor':
          case 'TimeSensor':
          case 'TouchSensor':
          case 'VisibilitySensor':
          case 'Text':
          case 'FontStyle':
          case 'MovieTexture':
          case 'ColorInterpolator':
          case 'CoordinateInterpolator':
          case 'NormalInterpolator':
          case 'OrientationInterpolator':
          case 'PositionInterpolator':
          case 'ScalarInterpolator':
          case 'Fog':
          case 'NavigationInfo':
          case 'Viewpoint':
            break;

          default:
            console.warn('THREE.VRMLLoader: Unknown node:', nodeName);
            break;
        }

        return build;
      }

      function buildGroupingNode(node) {
        var object = new THREE.Group();
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'bboxCenter':
              break;

            case 'bboxSize':
              break;

            case 'center':
              break;

            case 'children':
              parseFieldChildren(fieldValues, object);
              break;

            case 'collide':
              break;

            case 'rotation':
              var axis = new THREE.Vector3(fieldValues[0], fieldValues[1], fieldValues[2]);
              var angle = fieldValues[3];
              object.quaternion.setFromAxisAngle(axis, angle);
              break;

            case 'scale':
              object.scale.set(fieldValues[0], fieldValues[1], fieldValues[2]);
              break;

            case 'scaleOrientation':
              break;

            case 'translation':
              object.position.set(fieldValues[0], fieldValues[1], fieldValues[2]);
              break;

            case 'proxy':
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        return object;
      }

      function buildBackgroundNode(node) {
        var group = new Group();
        var groundAngle, groundColor;
        var skyAngle, skyColor;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'groundAngle':
              groundAngle = fieldValues;
              break;

            case 'groundColor':
              groundColor = fieldValues;
              break;

            case 'backUrl':
              break;

            case 'bottomUrl':
              break;

            case 'frontUrl':
              break;

            case 'leftUrl':
              break;

            case 'rightUrl':
              break;

            case 'topUrl':
              break;

            case 'skyAngle':
              skyAngle = fieldValues;
              break;

            case 'skyColor':
              skyColor = fieldValues;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var radius = 10000;

        if (skyColor) {
          var skyGeometry = new THREE.SphereBufferGeometry(radius, 32, 16);
          var skyMaterial = new THREE.MeshBasicMaterial({
            fog: false,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false
          });

          if (skyColor.length > 3) {
            paintFaces(skyGeometry, radius, skyAngle, toColorArray(skyColor), true);
            skyMaterial.vertexColors = true;
          } else {
            skyMaterial.color.setRGB(skyColor[0], skyColor[1], skyColor[2]);
          }

          var sky = new Mesh(skyGeometry, skyMaterial);
          group.add(sky);
        }

        if (groundColor) {
          if (groundColor.length > 0) {
            var groundGeometry = new SphereBufferGeometry(radius, 32, 16, 0, 2 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI);
            var groundMaterial = new MeshBasicMaterial({
              fog: false,
              side: BackSide,
              vertexColors: true,
              depthWrite: false,
              depthTest: false
            });
            paintFaces(groundGeometry, radius, groundAngle, toColorArray(groundColor), false);
            var ground = new Mesh(groundGeometry, groundMaterial);
            group.add(ground);
          }
        }

        group.renderOrder = -Infinity;
        return group;
      }

      function buildShapeNode(node) {
        var fields = node.fields;
        var material = new MeshBasicMaterial({
          color: 0x000000
        });
        var geometry;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'appearance':
              if (fieldValues[0] !== null) {
                material = getNode(fieldValues[0]);
              }

              break;

            case 'geometry':
              if (fieldValues[0] !== null) {
                geometry = getNode(fieldValues[0]);
              }

              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var object;

        if (geometry && geometry.attributes.position) {
          var type = geometry._type;

          if (type === 'points') {
            var pointsMaterial = new THREE.PointsMaterial({
              color: 0xffffff
            });

            if (geometry.attributes.color !== undefined) {
              pointsMaterial.vertexColors = true;
            } else {
              if (material.isMeshPhongMaterial) {
                pointsMaterial.color.copy(material.emissive);
              }
            }

            object = new Points(geometry, pointsMaterial);
          } else if (type === 'line') {
            var lineMaterial = new THREE.LineBasicMaterial({
              color: 0xffffff
            });

            if (geometry.attributes.color !== undefined) {
              lineMaterial.vertexColors = true;
            } else {
              if (material.isMeshPhongMaterial) {
                lineMaterial.color.copy(material.emissive);
              }
            }

            object = new THREE.LineSegments(geometry, lineMaterial);
          } else {
            if (geometry._solid !== undefined) {
              material.side = geometry._solid ? FrontSide : THREE.DoubleSide;
            }

            if (geometry.attributes.color !== undefined) {
              material.vertexColors = true;
            }

            object = new Mesh(geometry, material);
          }
        } else {
          object = new Object3D();
          object.visible = false;
        }

        return object;
      }

      function buildAppearanceNode(node) {
        var material = new THREE.MeshPhongMaterial();
        var transformData;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'material':
              if (fieldValues[0] !== null) {
                var materialData = getNode(fieldValues[0]);
                if (materialData.diffuseColor) material.color.copy(materialData.diffuseColor);
                if (materialData.emissiveColor) material.emissive.copy(materialData.emissiveColor);
                if (materialData.shininess) material.shininess = materialData.shininess;
                if (materialData.specularColor) material.specular.copy(materialData.specularColor);
                if (materialData.transparency) material.opacity = 1 - materialData.transparency;
                if (materialData.transparency > 0) material.transparent = true;
              } else {
                material = new MeshBasicMaterial({
                  color: 0x000000
                });
              }

              break;

            case 'texture':
              var textureNode = fieldValues[0];

              if (textureNode !== null) {
                if (textureNode.name === 'ImageTexture' || textureNode.name === 'PixelTexture') {
                  material.map = getNode(textureNode);
                } else {}
              }

              break;

            case 'textureTransform':
              if (fieldValues[0] !== null) {
                transformData = getNode(fieldValues[0]);
              }

              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        if (material.map) {
          if (material.map.__type) {
            switch (material.map.__type) {
              case TEXTURE_TYPE.INTENSITY_ALPHA:
                material.opacity = 1;
                break;

              case TEXTURE_TYPE.RGB:
                material.color.set(0xffffff);
                break;

              case TEXTURE_TYPE.RGBA:
                material.color.set(0xffffff);
                material.opacity = 1;
                break;

              default:
            }

            delete material.map.__type;
          }

          if (transformData) {
            material.map.center.copy(transformData.center);
            material.map.rotation = transformData.rotation;
            material.map.repeat.copy(transformData.scale);
            material.map.offset.copy(transformData.translation);
          }
        }

        return material;
      }

      function buildMaterialNode(node) {
        var materialData = {};
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'ambientIntensity':
              break;

            case 'diffuseColor':
              materialData.diffuseColor = new THREE.Color(fieldValues[0], fieldValues[1], fieldValues[2]);
              break;

            case 'emissiveColor':
              materialData.emissiveColor = new Color(fieldValues[0], fieldValues[1], fieldValues[2]);
              break;

            case 'shininess':
              materialData.shininess = fieldValues[0];
              break;

            case 'specularColor':
              materialData.emissiveColor = new Color(fieldValues[0], fieldValues[1], fieldValues[2]);
              break;

            case 'transparency':
              materialData.transparency = fieldValues[0];
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        return materialData;
      }

      function parseHexColor(hex, textureType, color) {
        switch (textureType) {
          case TEXTURE_TYPE.INTENSITY:
            var value = parseInt(hex);
            color.r = value;
            color.g = value;
            color.b = value;
            break;

          case TEXTURE_TYPE.INTENSITY_ALPHA:
            var value = parseInt("0x" + hex.substring(2, 4));
            color.r = value;
            color.g = value;
            color.b = value;
            color.a = parseInt("0x" + hex.substring(4, 6));
            break;

          case TEXTURE_TYPE.RGB:
            color.r = parseInt("0x" + hex.substring(2, 4));
            color.g = parseInt("0x" + hex.substring(4, 6));
            color.b = parseInt("0x" + hex.substring(6, 8));
            break;

          case TEXTURE_TYPE.RGBA:
            color.r = parseInt("0x" + hex.substring(2, 4));
            color.g = parseInt("0x" + hex.substring(4, 6));
            color.b = parseInt("0x" + hex.substring(6, 8));
            color.a = parseInt("0x" + hex.substring(8, 10));
            break;

          default:
        }
      }

      function getTextureType(num_components) {
        var type;

        switch (num_components) {
          case 1:
            type = TEXTURE_TYPE.INTENSITY;
            break;

          case 2:
            type = TEXTURE_TYPE.INTENSITY_ALPHA;
            break;

          case 3:
            type = TEXTURE_TYPE.RGB;
            break;

          case 4:
            type = TEXTURE_TYPE.RGBA;
            break;

          default:
        }

        return type;
      }

      function buildPixelTextureNode(node) {
        var texture;
        var wrapS = THREE.RepeatWrapping;
        var wrapT = RepeatWrapping;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'image':
              var width = fieldValues[0];
              var height = fieldValues[1];
              var num_components = fieldValues[2];
              var useAlpha = num_components === 2 || num_components === 4;
              var textureType = getTextureType(num_components);
              var size = (useAlpha === true ? 4 : 3) * (width * height);
              var data = new Uint8Array(size);
              var color = {
                r: 0,
                g: 0,
                b: 0,
                a: 0
              };

              for (var j = 3, k = 0, jl = fieldValues.length; j < jl; j++, k++) {
                parseHexColor(fieldValues[j], textureType, color);

                if (useAlpha === true) {
                  var stride = k * 4;
                  data[stride + 0] = color.r;
                  data[stride + 1] = color.g;
                  data[stride + 2] = color.b;
                  data[stride + 3] = color.a;
                } else {
                  var stride = k * 3;
                  data[stride + 0] = color.r;
                  data[stride + 1] = color.g;
                  data[stride + 2] = color.b;
                }
              }

              texture = new THREE.DataTexture(data, width, height, useAlpha === true ? RGBAFormat : RGBFormat);
              texture.__type = textureType;
              break;

            case 'repeatS':
              if (fieldValues[0] === false) wrapS = THREE.ClampToEdgeWrapping;
              break;

            case 'repeatT':
              if (fieldValues[0] === false) wrapT = ClampToEdgeWrapping;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        if (texture) {
          texture.wrapS = wrapS;
          texture.wrapT = wrapT;
        }

        return texture;
      }

      function buildImageTextureNode(node) {
        var texture;
        var wrapS = RepeatWrapping;
        var wrapT = RepeatWrapping;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'url':
              var url = fieldValues[0];
              if (url) texture = textureLoader.load(url);
              break;

            case 'repeatS':
              if (fieldValues[0] === false) wrapS = ClampToEdgeWrapping;
              break;

            case 'repeatT':
              if (fieldValues[0] === false) wrapT = ClampToEdgeWrapping;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        if (texture) {
          texture.wrapS = wrapS;
          texture.wrapT = wrapT;
        }

        return texture;
      }

      function buildTextureTransformNode(node) {
        var transformData = {
          center: new THREE.Vector2(),
          rotation: new Vector2(),
          scale: new Vector2(),
          translation: new Vector2()
        };
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'center':
              transformData.center.set(fieldValues[0], fieldValues[1]);
              break;

            case 'rotation':
              transformData.rotation = fieldValues[0];
              break;

            case 'scale':
              transformData.scale.set(fieldValues[0], fieldValues[1]);
              break;

            case 'translation':
              transformData.translation.set(fieldValues[0], fieldValues[1]);
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        return transformData;
      }

      function buildGeometricNode(node) {
        return node.fields[0].values;
      }

      function buildWorldInfoNode(node) {
        var worldInfo = {};
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'title':
              worldInfo.title = fieldValues[0];
              break;

            case 'info':
              worldInfo.info = fieldValues;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        return worldInfo;
      }

      function buildIndexedFaceSetNode(node) {
        var color, coord, normal, texCoord;
        var ccw = true,
            solid = true,
            creaseAngle = 0;
        var colorIndex, coordIndex, normalIndex, texCoordIndex;
        var colorPerVertex = true,
            normalPerVertex = true;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'color':
              var colorNode = fieldValues[0];

              if (colorNode !== null) {
                color = getNode(colorNode);
              }

              break;

            case 'coord':
              var coordNode = fieldValues[0];

              if (coordNode !== null) {
                coord = getNode(coordNode);
              }

              break;

            case 'normal':
              var normalNode = fieldValues[0];

              if (normalNode !== null) {
                normal = getNode(normalNode);
              }

              break;

            case 'texCoord':
              var texCoordNode = fieldValues[0];

              if (texCoordNode !== null) {
                texCoord = getNode(texCoordNode);
              }

              break;

            case 'ccw':
              ccw = fieldValues[0];
              break;

            case 'colorIndex':
              colorIndex = fieldValues;
              break;

            case 'colorPerVertex':
              colorPerVertex = fieldValues[0];
              break;

            case 'convex':
              break;

            case 'coordIndex':
              coordIndex = fieldValues;
              break;

            case 'creaseAngle':
              creaseAngle = fieldValues[0];
              break;

            case 'normalIndex':
              normalIndex = fieldValues;
              break;

            case 'normalPerVertex':
              normalPerVertex = fieldValues[0];
              break;

            case 'solid':
              solid = fieldValues[0];
              break;

            case 'texCoordIndex':
              texCoordIndex = fieldValues;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        if (coordIndex === undefined) {
          console.warn('THREE.VRMLLoader: Missing coordIndex.');
          return new THREE.BufferGeometry();
        }

        var triangulatedCoordIndex = triangulateFaceIndex(coordIndex, ccw);
        var positionAttribute;
        var colorAttribute;
        var normalAttribute;
        var uvAttribute;

        if (color) {
          if (colorPerVertex === true) {
            if (colorIndex && colorIndex.length > 0) {
              var triangulatedColorIndex = triangulateFaceIndex(colorIndex, ccw);
              colorAttribute = computeAttributeFromIndexedData(triangulatedCoordIndex, triangulatedColorIndex, color, 3);
            } else {
              colorAttribute = toNonIndexedAttribute(triangulatedCoordIndex, new THREE.Float32BufferAttribute(color, 3));
            }
          } else {
            if (colorIndex && colorIndex.length > 0) {
              var flattenFaceColors = flattenData(color, colorIndex);
              var triangulatedFaceColors = triangulateFaceData(flattenFaceColors, coordIndex);
              colorAttribute = computeAttributeFromFaceData(triangulatedCoordIndex, triangulatedFaceColors);
            } else {
              var triangulatedFaceColors = triangulateFaceData(color, coordIndex);
              colorAttribute = computeAttributeFromFaceData(triangulatedCoordIndex, triangulatedFaceColors);
            }
          }
        }

        if (normal) {
          if (normalPerVertex === true) {
            if (normalIndex && normalIndex.length > 0) {
              var triangulatedNormalIndex = triangulateFaceIndex(normalIndex, ccw);
              normalAttribute = computeAttributeFromIndexedData(triangulatedCoordIndex, triangulatedNormalIndex, normal, 3);
            } else {
              normalAttribute = toNonIndexedAttribute(triangulatedCoordIndex, new Float32BufferAttribute(normal, 3));
            }
          } else {
            if (normalIndex && normalIndex.length > 0) {
              var flattenFaceNormals = flattenData(normal, normalIndex);
              var triangulatedFaceNormals = triangulateFaceData(flattenFaceNormals, coordIndex);
              normalAttribute = computeAttributeFromFaceData(triangulatedCoordIndex, triangulatedFaceNormals);
            } else {
              var triangulatedFaceNormals = triangulateFaceData(normal, coordIndex);
              normalAttribute = computeAttributeFromFaceData(triangulatedCoordIndex, triangulatedFaceNormals);
            }
          }
        } else {
          normalAttribute = computeNormalAttribute(triangulatedCoordIndex, coord, creaseAngle);
        }

        if (texCoord) {
          if (texCoordIndex && texCoordIndex.length > 0) {
            var triangulatedTexCoordIndex = triangulateFaceIndex(texCoordIndex, ccw);
            uvAttribute = computeAttributeFromIndexedData(triangulatedCoordIndex, triangulatedTexCoordIndex, texCoord, 2);
          } else {
            uvAttribute = toNonIndexedAttribute(triangulatedCoordIndex, new Float32BufferAttribute(texCoord, 2));
          }
        }

        var geometry = new BufferGeometry();
        positionAttribute = toNonIndexedAttribute(triangulatedCoordIndex, new Float32BufferAttribute(coord, 3));
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('normal', normalAttribute);
        if (colorAttribute) geometry.setAttribute('color', colorAttribute);
        if (uvAttribute) geometry.setAttribute('uv', uvAttribute);
        geometry._solid = solid;
        geometry._type = 'mesh';
        return geometry;
      }

      function buildIndexedLineSetNode(node) {
        var color, coord;
        var colorIndex, coordIndex;
        var colorPerVertex = true;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'color':
              var colorNode = fieldValues[0];

              if (colorNode !== null) {
                color = getNode(colorNode);
              }

              break;

            case 'coord':
              var coordNode = fieldValues[0];

              if (coordNode !== null) {
                coord = getNode(coordNode);
              }

              break;

            case 'colorIndex':
              colorIndex = fieldValues;
              break;

            case 'colorPerVertex':
              colorPerVertex = fieldValues[0];
              break;

            case 'coordIndex':
              coordIndex = fieldValues;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var colorAttribute;
        var expandedLineIndex = expandLineIndex(coordIndex);

        if (color) {
          if (colorPerVertex === true) {
            if (colorIndex.length > 0) {
              var expandedColorIndex = expandLineIndex(colorIndex);
              colorAttribute = computeAttributeFromIndexedData(expandedLineIndex, expandedColorIndex, color, 3);
            } else {
              colorAttribute = toNonIndexedAttribute(expandedLineIndex, new Float32BufferAttribute(color, 3));
            }
          } else {
            if (colorIndex.length > 0) {
              var flattenLineColors = flattenData(color, colorIndex);
              var expandedLineColors = expandLineData(flattenLineColors, coordIndex);
              colorAttribute = computeAttributeFromLineData(expandedLineIndex, expandedLineColors);
            } else {
              var expandedLineColors = expandLineData(color, coordIndex);
              colorAttribute = computeAttributeFromLineData(expandedLineIndex, expandedLineColors);
            }
          }
        }

        var geometry = new BufferGeometry();
        var positionAttribute = toNonIndexedAttribute(expandedLineIndex, new Float32BufferAttribute(coord, 3));
        geometry.setAttribute('position', positionAttribute);
        if (colorAttribute) geometry.setAttribute('color', colorAttribute);
        geometry._type = 'line';
        return geometry;
      }

      function buildPointSetNode(node) {
        var geometry;
        var color, coord;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'color':
              var colorNode = fieldValues[0];

              if (colorNode !== null) {
                color = getNode(colorNode);
              }

              break;

            case 'coord':
              var coordNode = fieldValues[0];

              if (coordNode !== null) {
                coord = getNode(coordNode);
              }

              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var geometry = new BufferGeometry();
        geometry.setAttribute('position', new Float32BufferAttribute(coord, 3));
        if (color) geometry.setAttribute('color', new Float32BufferAttribute(color, 3));
        geometry._type = 'points';
        return geometry;
      }

      function buildBoxNode(node) {
        var size = new Vector3(2, 2, 2);
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'size':
              size.x = fieldValues[0];
              size.y = fieldValues[1];
              size.z = fieldValues[2];
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var geometry = new THREE.BoxBufferGeometry(size.x, size.y, size.z);
        return geometry;
      }

      function buildConeNode(node) {
        var radius = 1,
            height = 2,
            openEnded = false;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'bottom':
              openEnded = !fieldValues[0];
              break;

            case 'bottomRadius':
              radius = fieldValues[0];
              break;

            case 'height':
              height = fieldValues[0];
              break;

            case 'side':
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var geometry = new THREE.ConeBufferGeometry(radius, height, 16, 1, openEnded);
        return geometry;
      }

      function buildCylinderNode(node) {
        var radius = 1,
            height = 2;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'bottom':
              break;

            case 'radius':
              radius = fieldValues[0];
              break;

            case 'height':
              height = fieldValues[0];
              break;

            case 'side':
              break;

            case 'top':
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var geometry = new THREE.CylinderBufferGeometry(radius, radius, height, 16, 1);
        return geometry;
      }

      function buildSphereNode(node) {
        var radius = 1;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'radius':
              radius = fieldValues[0];
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var geometry = new SphereBufferGeometry(radius, 16, 16);
        return geometry;
      }

      function buildElevationGridNode(node) {
        var color;
        var normal;
        var texCoord;
        var height;
        var colorPerVertex = true;
        var normalPerVertex = true;
        var solid = true;
        var ccw = true;
        var creaseAngle = 0;
        var xDimension = 2;
        var zDimension = 2;
        var xSpacing = 1;
        var zSpacing = 1;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'color':
              var colorNode = fieldValues[0];

              if (colorNode !== null) {
                color = getNode(colorNode);
              }

              break;

            case 'normal':
              var normalNode = fieldValues[0];

              if (normalNode !== null) {
                normal = getNode(normalNode);
              }

              break;

            case 'texCoord':
              var texCoordNode = fieldValues[0];

              if (texCoordNode !== null) {
                texCoord = getNode(texCoordNode);
              }

              break;

            case 'height':
              height = fieldValues;
              break;

            case 'ccw':
              ccw = fieldValues[0];
              break;

            case 'colorPerVertex':
              colorPerVertex = fieldValues[0];
              break;

            case 'creaseAngle':
              creaseAngle = fieldValues[0];
              break;

            case 'normalPerVertex':
              normalPerVertex = fieldValues[0];
              break;

            case 'solid':
              solid = fieldValues[0];
              break;

            case 'xDimension':
              xDimension = fieldValues[0];
              break;

            case 'xSpacing':
              xSpacing = fieldValues[0];
              break;

            case 'zDimension':
              zDimension = fieldValues[0];
              break;

            case 'zSpacing':
              zSpacing = fieldValues[0];
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var vertices = [];
        var normals = [];
        var colors = [];
        var uvs = [];

        for (var i = 0; i < zDimension; i++) {
          for (var j = 0; j < xDimension; j++) {
            var index = i * xDimension + j;
            var x = xSpacing * i;
            var y = height[index];
            var z = zSpacing * j;
            vertices.push(x, y, z);

            if (color && colorPerVertex === true) {
              var r = color[index * 3 + 0];
              var g = color[index * 3 + 1];
              var b = color[index * 3 + 2];
              colors.push(r, g, b);
            }

            if (normal && normalPerVertex === true) {
              var xn = normal[index * 3 + 0];
              var yn = normal[index * 3 + 1];
              var zn = normal[index * 3 + 2];
              normals.push(xn, yn, zn);
            }

            if (texCoord) {
              var s = texCoord[index * 2 + 0];
              var t = texCoord[index * 2 + 1];
              uvs.push(s, t);
            } else {
              uvs.push(i / (xDimension - 1), j / (zDimension - 1));
            }
          }
        }

        var indices = [];

        for (var i = 0; i < xDimension - 1; i++) {
          for (var j = 0; j < zDimension - 1; j++) {
            var a = i + j * xDimension;
            var b = i + (j + 1) * xDimension;
            var c = i + 1 + (j + 1) * xDimension;
            var d = i + 1 + j * xDimension;

            if (ccw === true) {
              indices.push(a, c, b);
              indices.push(c, a, d);
            } else {
              indices.push(a, b, c);
              indices.push(c, d, a);
            }
          }
        }

        var positionAttribute = toNonIndexedAttribute(indices, new Float32BufferAttribute(vertices, 3));
        var uvAttribute = toNonIndexedAttribute(indices, new Float32BufferAttribute(uvs, 2));
        var colorAttribute;
        var normalAttribute;

        if (color) {
          if (colorPerVertex === false) {
            for (var i = 0; i < xDimension - 1; i++) {
              for (var j = 0; j < zDimension - 1; j++) {
                var index = i + j * (xDimension - 1);
                var r = color[index * 3 + 0];
                var g = color[index * 3 + 1];
                var b = color[index * 3 + 2];
                colors.push(r, g, b);
                colors.push(r, g, b);
                colors.push(r, g, b);
                colors.push(r, g, b);
                colors.push(r, g, b);
                colors.push(r, g, b);
              }
            }

            colorAttribute = new Float32BufferAttribute(colors, 3);
          } else {
            colorAttribute = toNonIndexedAttribute(indices, new Float32BufferAttribute(colors, 3));
          }
        }

        if (normal) {
          if (normalPerVertex === false) {
            for (var i = 0; i < xDimension - 1; i++) {
              for (var j = 0; j < zDimension - 1; j++) {
                var index = i + j * (xDimension - 1);
                var xn = normal[index * 3 + 0];
                var yn = normal[index * 3 + 1];
                var zn = normal[index * 3 + 2];
                normals.push(xn, yn, zn);
                normals.push(xn, yn, zn);
                normals.push(xn, yn, zn);
                normals.push(xn, yn, zn);
                normals.push(xn, yn, zn);
                normals.push(xn, yn, zn);
              }
            }

            normalAttribute = new Float32BufferAttribute(normals, 3);
          } else {
            normalAttribute = toNonIndexedAttribute(indices, new Float32BufferAttribute(normals, 3));
          }
        } else {
          normalAttribute = computeNormalAttribute(indices, vertices, creaseAngle);
        }

        var geometry = new BufferGeometry();
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('normal', normalAttribute);
        geometry.setAttribute('uv', uvAttribute);
        if (colorAttribute) geometry.setAttribute('color', colorAttribute);
        geometry._solid = solid;
        geometry._type = 'mesh';
        return geometry;
      }

      function buildExtrusionNode(node) {
        var crossSection = [1, 1, 1, -1, -1, -1, -1, 1, 1, 1];
        var spine = [0, 0, 0, 0, 1, 0];
        var scale;
        var orientation;
        var beginCap = true;
        var ccw = true;
        var creaseAngle = 0;
        var endCap = true;
        var solid = true;
        var fields = node.fields;

        for (var i = 0, l = fields.length; i < l; i++) {
          var field = fields[i];
          var fieldName = field.name;
          var fieldValues = field.values;

          switch (fieldName) {
            case 'beginCap':
              beginCap = fieldValues[0];
              break;

            case 'ccw':
              ccw = fieldValues[0];
              break;

            case 'convex':
              break;

            case 'creaseAngle':
              creaseAngle = fieldValues[0];
              break;

            case 'crossSection':
              crossSection = fieldValues;
              break;

            case 'endCap':
              endCap = fieldValues[0];
              break;

            case 'orientation':
              orientation = fieldValues;
              break;

            case 'scale':
              scale = fieldValues;
              break;

            case 'solid':
              solid = fieldValues[0];
              break;

            case 'spine':
              spine = fieldValues;
              break;

            default:
              console.warn('THREE.VRMLLoader: Unknown field:', fieldName);
              break;
          }
        }

        var crossSectionClosed = crossSection[0] === crossSection[crossSection.length - 2] && crossSection[1] === crossSection[crossSection.length - 1];
        var vertices = [];
        var spineVector = new Vector3();
        var scaling = new Vector3();
        var axis = new Vector3();
        var vertex = new Vector3();
        var quaternion = new THREE.Quaternion();

        for (var i = 0, j = 0, o = 0, il = spine.length; i < il; i += 3, j += 2, o += 4) {
          spineVector.fromArray(spine, i);
          scaling.x = scale ? scale[j + 0] : 1;
          scaling.y = 1;
          scaling.z = scale ? scale[j + 1] : 1;
          axis.x = orientation ? orientation[o + 0] : 0;
          axis.y = orientation ? orientation[o + 1] : 0;
          axis.z = orientation ? orientation[o + 2] : 1;
          var angle = orientation ? orientation[o + 3] : 0;

          for (var k = 0, kl = crossSection.length; k < kl; k += 2) {
            vertex.x = crossSection[k + 0];
            vertex.y = 0;
            vertex.z = crossSection[k + 1];
            vertex.multiply(scaling);
            quaternion.setFromAxisAngle(axis, angle);
            vertex.applyQuaternion(quaternion);
            vertex.add(spineVector);
            vertices.push(vertex.x, vertex.y, vertex.z);
          }
        }

        var indices = [];
        var spineCount = spine.length / 3;
        var crossSectionCount = crossSection.length / 2;

        for (var i = 0; i < spineCount - 1; i++) {
          for (var j = 0; j < crossSectionCount - 1; j++) {
            var a = j + i * crossSectionCount;
            var b = j + 1 + i * crossSectionCount;
            var c = j + (i + 1) * crossSectionCount;
            var d = j + 1 + (i + 1) * crossSectionCount;

            if (j === crossSectionCount - 2 && crossSectionClosed === true) {
              b = i * crossSectionCount;
              d = (i + 1) * crossSectionCount;
            }

            if (ccw === true) {
              indices.push(a, b, c);
              indices.push(c, b, d);
            } else {
              indices.push(a, c, b);
              indices.push(c, d, b);
            }
          }
        }

        if (beginCap === true || endCap === true) {
          var contour = [];

          for (var i = 0, l = crossSection.length; i < l; i += 2) {
            contour.push(new Vector2(crossSection[i], crossSection[i + 1]));
          }

          var faces = THREE.ShapeUtils.triangulateShape(contour, []);
          var capIndices = [];

          for (var i = 0, l = faces.length; i < l; i++) {
            var face = faces[i];
            capIndices.push(face[0], face[1], face[2]);
          }

          if (beginCap === true) {
            for (var i = 0, l = capIndices.length; i < l; i += 3) {
              if (ccw === true) {
                indices.push(capIndices[i + 0], capIndices[i + 1], capIndices[i + 2]);
              } else {
                indices.push(capIndices[i + 0], capIndices[i + 2], capIndices[i + 1]);
              }
            }
          }

          if (endCap === true) {
            var indexOffset = crossSectionCount * (spineCount - 1);

            for (var i = 0, l = capIndices.length; i < l; i += 3) {
              if (ccw === true) {
                indices.push(indexOffset + capIndices[i + 0], indexOffset + capIndices[i + 2], indexOffset + capIndices[i + 1]);
              } else {
                indices.push(indexOffset + capIndices[i + 0], indexOffset + capIndices[i + 1], indexOffset + capIndices[i + 2]);
              }
            }
          }
        }

        var positionAttribute = toNonIndexedAttribute(indices, new Float32BufferAttribute(vertices, 3));
        var normalAttribute = computeNormalAttribute(indices, vertices, creaseAngle);
        var geometry = new BufferGeometry();
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('normal', normalAttribute);
        geometry._solid = solid;
        geometry._type = 'mesh';
        return geometry;
      }

      function resolveUSE(identifier) {
        var node = nodeMap[identifier];
        var build = getNode(node);
        return build.isObject3D || build.isMaterial ? build.clone() : build;
      }

      function parseFieldChildren(children, owner) {
        for (var i = 0, l = children.length; i < l; i++) {
          var object = getNode(children[i]);
          if (object instanceof Object3D) owner.add(object);
        }
      }

      function triangulateFaceIndex(index, ccw) {
        var indices = [];
        var start = 0;

        for (var i = 0, l = index.length; i < l; i++) {
          var i1 = index[start];
          var i2 = index[i + (ccw ? 1 : 2)];
          var i3 = index[i + (ccw ? 2 : 1)];
          indices.push(i1, i2, i3);

          if (index[i + 3] === -1 || i + 3 >= l) {
            i += 3;
            start = i + 1;
          }
        }

        return indices;
      }

      function triangulateFaceData(data, index) {
        var triangulatedData = [];
        var start = 0;

        for (var i = 0, l = index.length; i < l; i++) {
          var stride = start * 3;
          var x = data[stride];
          var y = data[stride + 1];
          var z = data[stride + 2];
          triangulatedData.push(x, y, z);

          if (index[i + 3] === -1 || i + 3 >= l) {
            i += 3;
            start++;
          }
        }

        return triangulatedData;
      }

      function flattenData(data, index) {
        var flattenData = [];

        for (var i = 0, l = index.length; i < l; i++) {
          var i1 = index[i];
          var stride = i1 * 3;
          var x = data[stride];
          var y = data[stride + 1];
          var z = data[stride + 2];
          flattenData.push(x, y, z);
        }

        return flattenData;
      }

      function expandLineIndex(index) {
        var indices = [];

        for (var i = 0, l = index.length; i < l; i++) {
          var i1 = index[i];
          var i2 = index[i + 1];
          indices.push(i1, i2);

          if (index[i + 2] === -1 || i + 2 >= l) {
            i += 2;
          }
        }

        return indices;
      }

      function expandLineData(data, index) {
        var triangulatedData = [];
        var start = 0;

        for (var i = 0, l = index.length; i < l; i++) {
          var stride = start * 3;
          var x = data[stride];
          var y = data[stride + 1];
          var z = data[stride + 2];
          triangulatedData.push(x, y, z);

          if (index[i + 2] === -1 || i + 2 >= l) {
            i += 2;
            start++;
          }
        }

        return triangulatedData;
      }

      var vA = new Vector3();
      var vB = new Vector3();
      var vC = new Vector3();
      var uvA = new Vector2();
      var uvB = new Vector2();
      var uvC = new Vector2();

      function computeAttributeFromIndexedData(coordIndex, index, data, itemSize) {
        var array = [];

        for (var i = 0, l = coordIndex.length; i < l; i += 3) {
          var a = index[i];
          var b = index[i + 1];
          var c = index[i + 2];

          if (itemSize === 2) {
            uvA.fromArray(data, a * itemSize);
            uvB.fromArray(data, b * itemSize);
            uvC.fromArray(data, c * itemSize);
            array.push(uvA.x, uvA.y);
            array.push(uvB.x, uvB.y);
            array.push(uvC.x, uvC.y);
          } else {
            vA.fromArray(data, a * itemSize);
            vB.fromArray(data, b * itemSize);
            vC.fromArray(data, c * itemSize);
            array.push(vA.x, vA.y, vA.z);
            array.push(vB.x, vB.y, vB.z);
            array.push(vC.x, vC.y, vC.z);
          }
        }

        return new Float32BufferAttribute(array, itemSize);
      }

      function computeAttributeFromFaceData(index, faceData) {
        var array = [];

        for (var i = 0, j = 0, l = index.length; i < l; i += 3, j++) {
          vA.fromArray(faceData, j * 3);
          array.push(vA.x, vA.y, vA.z);
          array.push(vA.x, vA.y, vA.z);
          array.push(vA.x, vA.y, vA.z);
        }

        return new Float32BufferAttribute(array, 3);
      }

      function computeAttributeFromLineData(index, lineData) {
        var array = [];

        for (var i = 0, j = 0, l = index.length; i < l; i += 2, j++) {
          vA.fromArray(lineData, j * 3);
          array.push(vA.x, vA.y, vA.z);
          array.push(vA.x, vA.y, vA.z);
        }

        return new Float32BufferAttribute(array, 3);
      }

      function toNonIndexedAttribute(indices, attribute) {
        var array = attribute.array;
        var itemSize = attribute.itemSize;
        var array2 = new array.constructor(indices.length * itemSize);
        var index = 0,
            index2 = 0;

        for (var i = 0, l = indices.length; i < l; i++) {
          index = indices[i] * itemSize;

          for (var j = 0; j < itemSize; j++) {
            array2[index2++] = array[index++];
          }
        }

        return new Float32BufferAttribute(array2, itemSize);
      }

      var ab = new Vector3();
      var cb = new Vector3();

      function computeNormalAttribute(index, coord, creaseAngle) {
        var faces = [];
        var vertexNormals = {};

        for (var i = 0, l = index.length; i < l; i += 3) {
          var a = index[i];
          var b = index[i + 1];
          var c = index[i + 2];
          var face = new Face(a, b, c);
          vA.fromArray(coord, a * 3);
          vB.fromArray(coord, b * 3);
          vC.fromArray(coord, c * 3);
          cb.subVectors(vC, vB);
          ab.subVectors(vA, vB);
          cb.cross(ab);
          cb.normalize();
          face.normal.copy(cb);
          if (vertexNormals[a] === undefined) vertexNormals[a] = [];
          if (vertexNormals[b] === undefined) vertexNormals[b] = [];
          if (vertexNormals[c] === undefined) vertexNormals[c] = [];
          vertexNormals[a].push(face.normal);
          vertexNormals[b].push(face.normal);
          vertexNormals[c].push(face.normal);
          faces.push(face);
        }

        var normals = [];

        for (var i = 0, l = faces.length; i < l; i++) {
          var face = faces[i];
          var nA = weightedNormal(vertexNormals[face.a], face.normal, creaseAngle);
          var nB = weightedNormal(vertexNormals[face.b], face.normal, creaseAngle);
          var nC = weightedNormal(vertexNormals[face.c], face.normal, creaseAngle);
          vA.fromArray(coord, face.a * 3);
          vB.fromArray(coord, face.b * 3);
          vC.fromArray(coord, face.c * 3);
          normals.push(nA.x, nA.y, nA.z);
          normals.push(nB.x, nB.y, nB.z);
          normals.push(nC.x, nC.y, nC.z);
        }

        return new Float32BufferAttribute(normals, 3);
      }

      function weightedNormal(normals, vector, creaseAngle) {
        var normal = new Vector3();

        if (creaseAngle === 0) {
          normal.copy(vector);
        } else {
          for (var i = 0, l = normals.length; i < l; i++) {
            if (normals[i].angleTo(vector) < creaseAngle) {
              normal.add(normals[i]);
            }
          }
        }

        return normal.normalize();
      }

      function toColorArray(colors) {
        var array = [];

        for (var i = 0, l = colors.length; i < l; i += 3) {
          array.push(new Color(colors[i], colors[i + 1], colors[i + 2]));
        }

        return array;
      }

      function paintFaces(geometry, radius, angles, colors, topDown) {
        var thresholds = [];
        var startAngle = topDown === true ? 0 : Math.PI;

        for (var i = 0, l = colors.length; i < l; i++) {
          var angle = i === 0 ? 0 : angles[i - 1];
          angle = topDown === true ? angle : startAngle - angle;
          var point = new Vector3();
          point.setFromSphericalCoords(radius, angle, 0);
          thresholds.push(point);
        }

        var indices = geometry.index;
        var positionAttribute = geometry.attributes.position;
        var colorAttribute = new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3);
        var position = new Vector3();
        var color = new Color();

        for (var i = 0; i < indices.count; i++) {
          var index = indices.getX(i);
          position.fromBufferAttribute(positionAttribute, index);
          var thresholdIndexA, thresholdIndexB;
          var t = 1;

          for (var j = 1; j < thresholds.length; j++) {
            thresholdIndexA = j - 1;
            thresholdIndexB = j;
            var thresholdA = thresholds[thresholdIndexA];
            var thresholdB = thresholds[thresholdIndexB];

            if (topDown === true) {
              if (position.y <= thresholdA.y && position.y > thresholdB.y) {
                t = Math.abs(thresholdA.y - position.y) / Math.abs(thresholdA.y - thresholdB.y);
                break;
              }
            } else {
              if (position.y >= thresholdA.y && position.y < thresholdB.y) {
                t = Math.abs(thresholdA.y - position.y) / Math.abs(thresholdA.y - thresholdB.y);
                break;
              }
            }
          }

          var colorA = colors[thresholdIndexA];
          var colorB = colors[thresholdIndexB];
          color.copy(colorA).lerp(colorB, t);
          colorAttribute.setXYZ(index, color.r, color.g, color.b);
        }

        geometry.setAttribute('color', colorAttribute);
      }

      var textureLoader = new THREE.TextureLoader(this.manager);
      textureLoader.setPath(this.resourcePath || path).setCrossOrigin(this.crossOrigin);

      if (data.indexOf('#VRML V2.0') === -1) {
        throw Error('THREE.VRMLLexer: Version of VRML asset not supported.');
      }

      var tree = generateVRMLTree(data);
      var scene = parseTree(tree);
      return scene;
    }
  });

  function VRMLLexer(tokens) {
    this.lexer = new chevrotain.Lexer(tokens);
  }

  VRMLLexer.prototype = {
    constructor: VRMLLexer,
    lex: function lex(inputText) {
      var lexingResult = this.lexer.tokenize(inputText);

      if (lexingResult.errors.length > 0) {
        console.error(lexingResult.errors);
        throw Error('THREE.VRMLLexer: Lexing errors detected.');
      }

      return lexingResult;
    }
  };

  function VRMLParser(tokenVocabulary) {
    chevrotain.Parser.call(this, tokenVocabulary);
    var $ = this;
    var Version = tokenVocabulary['Version'];
    var LCurly = tokenVocabulary['LCurly'];
    var RCurly = tokenVocabulary['RCurly'];
    var LSquare = tokenVocabulary['LSquare'];
    var RSquare = tokenVocabulary['RSquare'];
    var Identifier = tokenVocabulary['Identifier'];
    var RouteIdentifier = tokenVocabulary['RouteIdentifier'];
    var StringLiteral = tokenVocabulary['StringLiteral'];
    var HexLiteral = tokenVocabulary['HexLiteral'];
    var NumberLiteral = tokenVocabulary['NumberLiteral'];
    var TrueLiteral = tokenVocabulary['TrueLiteral'];
    var FalseLiteral = tokenVocabulary['FalseLiteral'];
    var NullLiteral = tokenVocabulary['NullLiteral'];
    var DEF = tokenVocabulary['DEF'];
    var USE = tokenVocabulary['USE'];
    var ROUTE = tokenVocabulary['ROUTE'];
    var TO = tokenVocabulary['TO'];
    var NodeName = tokenVocabulary['NodeName'];
    $.RULE('vrml', function () {
      $.SUBRULE($.version);
      $.AT_LEAST_ONE(function () {
        $.SUBRULE($.node);
      });
      $.MANY(function () {
        $.SUBRULE($.route);
      });
    });
    $.RULE('version', function () {
      $.CONSUME(Version);
    });
    $.RULE('node', function () {
      $.OPTION(function () {
        $.SUBRULE($.def);
      });
      $.CONSUME(NodeName);
      $.CONSUME(LCurly);
      $.MANY(function () {
        $.SUBRULE($.field);
      });
      $.CONSUME(RCurly);
    });
    $.RULE('field', function () {
      $.CONSUME(Identifier);
      $.OR2([{
        ALT: function ALT() {
          $.SUBRULE($.singleFieldValue);
        }
      }, {
        ALT: function ALT() {
          $.SUBRULE($.multiFieldValue);
        }
      }]);
    });
    $.RULE('def', function () {
      $.CONSUME(DEF);
      $.OR([{
        ALT: function ALT() {
          $.CONSUME(Identifier);
        }
      }, {
        ALT: function ALT() {
          $.CONSUME(NodeName);
        }
      }]);
    });
    $.RULE('use', function () {
      $.CONSUME(USE);
      $.OR([{
        ALT: function ALT() {
          $.CONSUME(Identifier);
        }
      }, {
        ALT: function ALT() {
          $.CONSUME(NodeName);
        }
      }]);
    });
    $.RULE('singleFieldValue', function () {
      $.AT_LEAST_ONE(function () {
        $.OR([{
          ALT: function ALT() {
            $.SUBRULE($.node);
          }
        }, {
          ALT: function ALT() {
            $.SUBRULE($.use);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(StringLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(HexLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(NumberLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(TrueLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(FalseLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(NullLiteral);
          }
        }]);
      });
    });
    $.RULE('multiFieldValue', function () {
      $.CONSUME(LSquare);
      $.MANY(function () {
        $.OR([{
          ALT: function ALT() {
            $.SUBRULE($.node);
          }
        }, {
          ALT: function ALT() {
            $.SUBRULE($.use);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(StringLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(HexLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(NumberLiteral);
          }
        }, {
          ALT: function ALT() {
            $.CONSUME(NullLiteral);
          }
        }]);
      });
      $.CONSUME(RSquare);
    });
    $.RULE('route', function () {
      $.CONSUME(ROUTE);
      $.CONSUME(RouteIdentifier);
      $.CONSUME(TO);
      $.CONSUME2(RouteIdentifier);
    });
    this.performSelfAnalysis();
  }

  VRMLParser.prototype = Object.create(chevrotain.Parser.prototype);
  VRMLParser.prototype.constructor = VRMLParser;

  function Face(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.normal = new Vector3();
  }

  var TEXTURE_TYPE = {
    INTENSITY: 1,
    INTENSITY_ALPHA: 2,
    RGB: 3,
    RGBA: 4
  };
  return VRMLLoader;
}();

THREE.VRMLLoader = VRMLLoader;