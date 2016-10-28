/**
 * Not written as a NodeJs module yet, because this would require to use browserify
 * to make it available in the browser, while it is onlly useful in the browser anyway.
 *
 * @copyright Bart McLeod 2016, mcleod@spaceweb.nl
 * @author Bart McLeod / http://spaceweb.nl/
 */
if ( 'undefined' === typeof VrmlParser ) {
  VrmlParser = {};
}

if ( 'undefined' === typeof VrmlParser.Renderer ) {
  VrmlParser.Renderer = {};
}

VrmlParser.Renderer.ThreeJsRenderer = function () {
};

VrmlParser.Renderer.ThreeJsRenderer.prototype = {
  REVISION: 1,
  constructor: VrmlParser.Renderer.ThreeJsRenderer,

  log: function () {
    console.log.apply(console, arguments);
  },

  warn: function () {
    console.warn.apply(console, arguments);
  },

  error: function () {
    console.error.apply(console, arguments);
  },

  /**
   * @param Object nodeTree
   * @param THREE.Scene scene
   */
  render: function (nodeTree, scene) {

    console.log('VrmlParser.Renderer.ThreeJsRenderer ' + this.REVISION);

    /**
     * Colors ar return by the parser as vector{x, y, z}.
     * We want them as color{r, g, b}.
     * @param vector
     */
    var convertVectorToColor = function (vector) {
      return {r: vector.x, g: vector.y, b: vector.z};
    }

    /**
     * Interpolates colors a and b following their relative distance
     * expressed by t.
     *
     * @param float a
     * @param float b
     * @param float t
     * @returns {Color}
     */
    var interpolateColors = function (a, b, t) {
      a = convertVectorToColor(a);
      b = convertVectorToColor(b);
      var deltaR = a.r - b.r;
      var deltaG = a.g - b.g;
      var deltaB = a.b - b.b;

      var c = new THREE.Color();

      c.r = a.r - t * deltaR;
      c.g = a.g - t * deltaG;
      c.b = a.b - t * deltaB;

      return c;

    };

    /**
     * Vertically paints the faces interpolating between the
     * specified colors at the specified angels. This is used for the Background
     * node, but could be applied to other nodes with multiple faces as well.
     *
     * When used with the Background node, default is directionIsDown is true if
     * interpolating the skyColor down from the Zenith. When interpolationg up from
     * the Nadir i.e. interpolating the groundColor, the directionIsDown is false.
     *
     * The first angle is never specified, it is the Zenith (0 rad). Angles are specified
     * in radians. The geometry is thought a sphere, but could be anything. The color interpolation
     * is linear along the Y axis in any case.
     *
     * You must specify one more color than you have angles at the beginning of the colors array.
     * This is the color of the Zenith (the top of the shape).
     *
     * @param geometry
     * @param radius
     * @param angles
     * @param colors
     * @param boolean directionIsDown Whether to work bottom up or top down.
     */
    var paintFaces = function (geometry, radius, angles, colors, directionIsDown) {
      // @todo: while this is all neat and jolly, we really should declare each variable on its own line
      var f, n, p, vertexIndex, color;

      var direction = directionIsDown ? 1 : -1;

      var faceIndices = ['a', 'b', 'c', 'd'];

      var coord = [], aColor, bColor, t = 1, A = {}, B = {}, applyColor = false, colorIndex;

      for ( var k = 0; k < angles.length; k++ ) {

        var vec = {};

        // push the vector at which the color changes
        vec.y = direction * ( Math.cos(angles[k]) * radius );

        vec.x = direction * ( Math.sin(angles[k]) * radius );

        coord.push(vec);

      }

      // painting the colors on the faces
      for ( var i = 0; i < geometry.faces.length; i++ ) {

        f = geometry.faces[i];

        n = ( f instanceof THREE.Face3 ) ? 3 : 4;

        for ( var j = 0; j < n; j++ ) {

          vertexIndex = f[faceIndices[j]];

          p = geometry.vertices[vertexIndex];

          for ( var index = 0; index < colors.length; index++ ) {

            // linear interpolation between aColor and bColor, calculate proportion
            // A is previous point (angle)
            if ( index === 0 ) {

              A.x = 0;
              A.y = directionIsDown ? radius : -1 * radius;

            } else {

              A.x = coord[index - 1].x;
              A.y = coord[index - 1].y;

            }

            // B is current point (angle)
            B = coord[index];

            if ( undefined !== B ) {

              // p has to be between the points A and B which we interpolate
              applyColor = directionIsDown ? p.y <= A.y && p.y > B.y : p.y >= A.y && p.y < B.y;

              if ( applyColor ) {

                bColor = colors[index + 1];

                aColor = colors[index];

                // below is simple linear interpolation
                t = Math.abs(p.y - A.y) / ( A.y - B.y );

                // to make it faster, you can only calculate this if the y coord changes, the color is the same for points with the same y
                color = interpolateColors(aColor, bColor, t);

                f.vertexColors[j] = color;

              }

            } else if ( undefined === f.vertexColors[j] ) {

              colorIndex = directionIsDown ? colors.length - 1 : 0;
              f.vertexColors[j] = convertVectorToColor(colors[colorIndex]);

            }

          }

        }

      }

    };

    /**
     * Utility to quickly and safely check if a given property is
     * present and set on a node.
     *
     * @param string property
     * @return boolean
     */
    var has = function (property) {
      // note that this pull the object the 'has' method is assigned to into this functions scope
      return ('undefined' !== typeof this[property] && null !== this[property]);
    };

    /**
     * Convert VRML node representation into a ThreeJS 3D object.
     *
     * @param object node VRML node as parsed by the VrmlParser.
     * @returns {THREE.Object3D}
     */
    var parseNode = function (node) {
      if ( undefined === node.node ) {
        // not a node, for now, ignore it
        return false;
      }

      // for syntactic sugar only:
      node.has = has;

      // this will be the returned ThreeJS object returned from parseNode, if not overwritten
      var object = new THREE.Object3D();

      switch ( node.node ) {
        case 'Group':
        case 'Transform':
          if ( node.has('children') ) {
            // sugar
            node.children.has = has;
            // children can be a node or an array
            if ( node.children.has('node') ) {
              // children is a node
              object.add(parseNode(node.children));
            } else if ( node.children.has('length') ) {
              // children should be an array
              for ( var i = 0; i < node.children.length; i++ ) {

                var child = node.children[i];
                var threeJsObj = parseNode(child);
                if ( false !== threeJsObj ) {
                  object.add(threeJsObj);
                }

              }
            }
          }

          if ( node.has('translation') ) {

            var t = node.translation;

            object.position.set(t.x, t.y, t.z);

          }

          if ( node.has('rotation') ) {

            var r = node.rotation;

            object.quaternion.setFromAxisAngle(new THREE.Vector3(r.x, r.y, r.z), r.radians);

          }

          if ( node.has('scale') ) {

            var s = node.scale;

            object.scale.set(s.x, s.y, s.z);

          }
          break;

        case 'Shape':
          object = new THREE.Mesh();

          if ( node.has('geometry') ) {
            object.geometry = parseNode(node.geometry);
          }

          if ( node.has('appearance') ) {
            var appearance = node.appearance;

            // sugar
            appearance.has = has;

            if ( appearance.has('material') ) {
              var vrmlMaterial = appearance.material;

              // sugar
              vrmlMaterial.has = has;

              var material = new THREE.MeshPhongMaterial();

              if ( vrmlMaterial.has('diffuseColor') ) {

                var materialColor = convertVectorToColor(vrmlMaterial.diffuseColor);

                material.color.setRGB(materialColor.r, materialColor.g, materialColor.b);

              }

              if ( vrmlMaterial.has('emissiveColor') ) {

                var emissiveColor = convertVectorToColor(vrmlMaterial.emissiveColor);

                material.emissive.setRGB(emissiveColor.r, emissiveColor.g, emissiveColor.b);

              }

              if ( vrmlMaterial.has('specularColor') ) {

                var specularColor = convertVectorToColor(vrmlMaterial.specularColor);

                material.specular.setRGB(specularColor.r, specularColor.g, specularColor.b);

              }

              if ( vrmlMaterial.has('transparency') ) {

                // transparency is opposite of opacity
                material.opacity = Math.abs(1 - vrmlMaterial.transparency);

                material.transparent = true;

              }

            }

            object.material = material;

            if ( 'ImageTexture' === vrmlMaterial.node ) {

              var textureName = vrmlMaterial.textureName;

              if ( textureName ) {

                object.material.name = textureName[1];

                object.material.map = textureLoader.load(texturePath + textureName[1]);

              }

            }

            if ( 'IndexedFaceSet' === node.geometry.node ) {
              //if ( false === node.geometry.node.solid ) {

                object.material.side = THREE.DoubleSide;

             // }
            }

          }

          break;

        case 'Background':
          object = false;

          var segments = 20;

          // sky (full sphere):

          var radius = 2e4;

          var skyGeometry = new THREE.SphereGeometry(radius, segments, segments);
          var skyMaterial = new THREE.MeshBasicMaterial({fog: false, side: THREE.BackSide});

          if ( node.skyColor.length > 1 ) {

            paintFaces(skyGeometry, radius, node.skyAngle, node.skyColor, true);

            skyMaterial.vertexColors = THREE.VertexColors;

          } else {

            var color = convertVectorToColor(node.skyColor[0]);

            skyMaterial.color.setRGB(color.r, color.g, color.b);

          }

          scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

          // ground (half sphere):

          if ( node.has('groundColor') ) {

            radius = 1.2e4;

            var groundGeometry = new THREE.SphereGeometry(radius, segments, segments, 0, 2 * Math.PI, 0.5 * Math.PI, 1.5 * Math.PI);
            var groundMaterial = new THREE.MeshBasicMaterial({
              fog: false,
              side: THREE.BackSide,
              vertexColors: THREE.VertexColors
            });

            paintFaces(groundGeometry, radius, node.groundAngle, node.groundColor, false);

            scene.add(new THREE.Mesh(groundGeometry, groundMaterial));
          }

          break;

        case 'Box':
          var s = node.size;
          object = new THREE.BoxGeometry(s.x, s.y, s.z);
          break;

        case 'Cylinder':
          object = new THREE.CylinderGeometry(node.radius, node.radius, node.height);
          break;

        case 'Cone':
          object = new THREE.CylinderGeometry(node.topRadius, node.bottomRadius, node.height);
          break;

        case 'Sphere':
          object = new THREE.SphereGeometry(node.radius);
          break;

        case 'IndexedFaceSet':

          object = new THREE.Geometry();

          var indexes, uvIndexes, uvs;

          var vec;

          if ( node.has('texCoord') ) {

            uvs = node.texCoord.points;

          }

          if ( node.has('coord') ) {

            for ( var k = 0, l = node.coord.point.length; k < l; k++ ) {

              var point = node.coord.point[k];

              vec = new THREE.Vector3(point.x, point.y, point.z);

              object.vertices.push(vec);

            }

          }

          var skip = 0;

          // some shapes only have vertices for use in other shapes
          if ( node.has('coordIndex') ) {

            // read this: http://math.hws.edu/eck/cs424/notes2013/16_Threejs_Advanced.html
            for ( var i = 0, j = node.coordIndex.length; i < j; i++ ) {

              indexes = node.coordIndex[i];

              if ( node.has('texCoordIndex') ) {
                uvIndexes = node.texCoordIndex[i];
              }

              // vrml support multipoint indexed face sets (more then 3 vertices). You must calculate the composing triangles here
              skip = 0;

              // Face3 only works with triangles, but IndexedFaceSet allows shapes with more then three vertices, build them of triangles
              while ( indexes.length >= 3 && skip < ( indexes.length - 2 ) ) {

                var face = new THREE.Face3(
                  indexes[0],
                  indexes[skip + (node.ccw ? 1 : 2)],
                  indexes[skip + (node.ccw ? 2 : 1)],
                  null // normal, will be added later
                  // todo: pass in the color, if a color index is present
                );

                if ( uvs && uvIndexes ) {
                  object.faceVertexUvs [0].push([
                    new THREE.Vector2(
                      uvs[uvIndexes[0]].x,
                      uvs[uvIndexes[0]].y
                    ),
                    new THREE.Vector2(
                      uvs[uvIndexes[skip + (node.ccw ? 1 : 2)]].x,
                      uvs[uvIndexes[skip + (node.ccw ? 1 : 2)]].y
                    ),
                    new THREE.Vector2(
                      uvs[uvIndexes[skip + (node.ccw ? 2 : 1)]].x,
                      uvs[uvIndexes[skip + (node.ccw ? 2 : 1)]].y
                    )
                  ]);
                }

                skip++;

                object.faces.push(face);

              }

            }

          }

          object.computeFaceNormals();

          //object.computeVertexNormals(); // does not show

          object.computeBoundingSphere();

          break;
      }

      if ( false !== object ) {
        if ( undefined !== object.userData ) {
          // keep the original VRML node for reference
          object.userData.originalVrmlNode = node;
        }

        if ( node.has('name') ) {
          object.name = node.name;
        } else if ( node.has('node') ) {
          object.name = node.node;
        }
        object.castShadow = true;
        object.receiveShadow = true;
      }
      return object;
    };

    for ( var n = 0; n < nodeTree.length; n++ ) {
      var childNode = parseNode(nodeTree[n]);
      if ( false !== childNode ) {
        scene.add(childNode);
      }
    }

    console.log(scene);
    // @todo: parse nodeTree.nodeDefinitions
    // @todo: parse nodeTree.routes

  }

};
