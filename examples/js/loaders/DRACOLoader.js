// Copyright 2016 The Draco Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
'use strict';

THREE.DRACOLoader = function(manager) {
    this.manager = (manager !== undefined) ? manager :
        THREE.DefaultLoadingManager;
    this.materials = null;
    this.verbosity = 0;
};


THREE.DRACOLoader.prototype = {

    constructor: THREE.DRACOLoader,

    load: function(url, onLoad, onProgress, onError) {
        const scope = this;
        const loader = new THREE.FileLoader(scope.manager);
        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');
        loader.load(url, function(blob) {
            onLoad(scope.decodeDracoFile(blob));
        }, onProgress, onError);
    },

    setPath: function(value) {
        this.path = value;
    },

    setVerbosity: function(level) {
        this.verbosity = level;
    },

    decodeDracoFile: ( function() {
        let dracoDecoder;

        if (typeof DracoModule === 'function') {
          dracoDecoder = DracoModule();
        } else {
          console.error('THREE.DRACOLoader: DracoModule not found.');
          return;
        }

        return function(rawBuffer) {
          const scope = this;
          /*
           * Here is how to use Draco Javascript decoder and get the geometry.
           */
          const buffer = new dracoDecoder.DecoderBuffer();
          buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
          const wrapper = new dracoDecoder.WebIDLWrapper();

          /*
           * Determine what type is this file: mesh or point cloud.
           */
          const geometryType = wrapper.GetEncodedGeometryType(buffer);
          if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
            if (this.verbosity > 0) {
              console.log('Loaded a mesh.');
            }
          } else if (geometryType == dracoDecoder.POINT_CLOUD) {
            if (this.verbosity > 0) {
              console.log('Loaded a point cloud.');
            }
          } else {
            const errorMsg = 'THREE.DRACOLoader: Unknown geometry type.'
            console.error(errorMsg);
            throw new Error(errorMsg);
          }
          return scope.convertDracoGeometryTo3JS(wrapper, geometryType, buffer,
                                                 dracoDecoder);
        }
    } )(),

    convertDracoGeometryTo3JS: function(wrapper, geometryType, buffer,
                                        dracoDecoder) {
        let dracoGeometry;
        const start_time = performance.now();
        if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
          dracoGeometry = wrapper.DecodeMeshFromBuffer(buffer);
        } else {
          dracoGeometry = wrapper.DecodePointCloudFromBuffer(buffer);
        }
        const decode_end = performance.now();
        dracoDecoder.destroy(buffer);
        /*
         * Example on how to retrieve mesh and attributes.
         */
        let numFaces, numPoints;
        let numVertexCoordinates, numTextureCoordinates, numAttributes;
        // For output basic geometry information.
        let geometryInfoStr;
        if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
          numFaces = dracoGeometry.num_faces();
          if (this.verbosity > 0) {
            console.log('Number of faces loaded: ' + numFaces.toString());
          }
        } else {
          numFaces = 0;
        }
        numPoints = dracoGeometry.num_points();
        numVertexCoordinates = numPoints * 3;
        numTextureCoordinates = numPoints * 2;
        numAttributes = dracoGeometry.num_attributes();
        if (this.verbosity > 0) {
          console.log('Number of points loaded: ' + numPoints.toString());
          console.log('Number of attributes loaded: ' +
              numAttributes.toString());
        }

        // Get position attribute. Must exists.
        const posAttId = wrapper.GetAttributeId(dracoGeometry,
                                                dracoDecoder.POSITION);
        if (posAttId == -1) {
          const errorMsg = 'THREE.DRACOLoader: No position attribute found.';
          console.error(errorMsg);
          dracoDecoder.destroy(wrapper);
          dracoDecoder.destroy(dracoGeometry);
          throw new Error(errorMsg);
        }
        const posAttribute = wrapper.GetAttribute(dracoGeometry, posAttId);
        const posAttributeData = new dracoDecoder.DracoFloat32Array();
        wrapper.GetAttributeFloatForAllPoints(
            dracoGeometry, posAttribute, posAttributeData);
        // Get color attributes if exists.
        const colorAttId = wrapper.GetAttributeId(dracoGeometry,
                                                  dracoDecoder.COLOR);
        let colAttributeData;
        if (colorAttId != -1) {
          if (this.verbosity > 0) {
            console.log('Loaded color attribute.');
          }
          const colAttribute = wrapper.GetAttribute(dracoGeometry, colorAttId);
          colAttributeData = new dracoDecoder.DracoFloat32Array();
          wrapper.GetAttributeFloatForAllPoints(dracoGeometry, colAttribute,
                                                colAttributeData);
        }

        // Get normal attributes if exists.
        const normalAttId =
            wrapper.GetAttributeId(dracoGeometry, dracoDecoder.NORMAL);
        let norAttributeData;
        if (normalAttId != -1) {
          if (this.verbosity > 0) {
            console.log('Loaded normal attribute.');
          }
          const norAttribute = wrapper.GetAttribute(dracoGeometry, normalAttId);
          norAttributeData = new dracoDecoder.DracoFloat32Array();
          wrapper.GetAttributeFloatForAllPoints(dracoGeometry, norAttribute,
                                                norAttributeData);
        }

        // Get texture coord attributes if exists.
        const texCoordAttId =
            wrapper.GetAttributeId(dracoGeometry, dracoDecoder.TEX_COORD);
        let textCoordAttributeData;
        if (texCoordAttId != -1) {
          if (this.verbosity > 0) {
            console.log('Loaded texture coordinate attribute.');
          }
          const texCoordAttribute = wrapper.GetAttribute(dracoGeometry,
                                                         texCoordAttId);
          textCoordAttributeData = new dracoDecoder.DracoFloat32Array();
          wrapper.GetAttributeFloatForAllPoints(dracoGeometry,
                                                texCoordAttribute,
                                                textCoordAttributeData);
        }

        // Structure for converting to THREEJS geometry later.
        const numIndices = numFaces * 3;
        const geometryBuffer = {
            indices: new Uint32Array(numIndices),
            vertices: new Float32Array(numVertexCoordinates),
            normals: new Float32Array(numVertexCoordinates),
            uvs: new Float32Array(numTextureCoordinates),
            colors: new Float32Array(numVertexCoordinates)
        };

        for (let i = 0; i < numVertexCoordinates; i += 3) {
            geometryBuffer.vertices[i] = posAttributeData.GetValue(i);
            geometryBuffer.vertices[i + 1] = posAttributeData.GetValue(i + 1);
            geometryBuffer.vertices[i + 2] = posAttributeData.GetValue(i + 2);
            // Add color.
            // ThreeJS vertex colors need to be normalized to properly display
            if (colorAttId != -1) {
              geometryBuffer.colors[i] = colAttributeData.GetValue(i) / 255;
              geometryBuffer.colors[i + 1] =
                  colAttributeData.GetValue(i + 1) / 255;
              geometryBuffer.colors[i + 2] =
                  colAttributeData.GetValue(i + 2) / 255;
            } else {
              // Default is white. This is faster than TypedArray.fill().
              geometryBuffer.colors[i] = 1.0;
              geometryBuffer.colors[i + 1] = 1.0;
              geometryBuffer.colors[i + 2] = 1.0;
            }
            // Add normal.
            if (normalAttId != -1) {
              geometryBuffer.normals[i] = norAttributeData.GetValue(i);
              geometryBuffer.normals[i + 1] = norAttributeData.GetValue(i + 1);
              geometryBuffer.normals[i + 2] = norAttributeData.GetValue(i + 2);
            }
        }

        // Add texture coordinates.
        if (texCoordAttId != -1) {
          for (let i = 0; i < numTextureCoordinates; i += 2) {
            geometryBuffer.uvs[i] = textCoordAttributeData.GetValue(i);
            geometryBuffer.uvs[i + 1] = textCoordAttributeData.GetValue(i + 1);
          }
        }

        dracoDecoder.destroy(posAttributeData);
        if (colorAttId != -1)
          dracoDecoder.destroy(colAttributeData);
        if (normalAttId != -1)
          dracoDecoder.destroy(norAttributeData);
        if (texCoordAttId != -1)
          dracoDecoder.destroy(textCoordAttributeData);

        // For mesh, we need to generate the faces.
        if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
          const ia = new dracoDecoder.DracoInt32Array();
          for (let i = 0; i < numFaces; ++i) {
            wrapper.GetFaceFromMesh(dracoGeometry, i, ia);
            const index = i * 3;
            geometryBuffer.indices[index] = ia.GetValue(0);
            geometryBuffer.indices[index + 1] = ia.GetValue(1);
            geometryBuffer.indices[index + 2] = ia.GetValue(2);
          }
          dracoDecoder.destroy(ia);
        }
        dracoDecoder.destroy(wrapper);
        dracoDecoder.destroy(dracoGeometry);

        // Import data to Three JS geometry.
        const geometry = new THREE.BufferGeometry();
        if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
          geometry.setIndex(new(geometryBuffer.indices.length > 65535 ?
                THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute)
              (geometryBuffer.indices, 1));
        }
        geometry.addAttribute('position',
            new THREE.Float32BufferAttribute(geometryBuffer.vertices, 3));
        geometry.addAttribute('color',
            new THREE.Float32BufferAttribute(geometryBuffer.colors, 3));
        if (normalAttId != -1) {
          geometry.addAttribute('normal',
              new THREE.Float32BufferAttribute(geometryBuffer.normals, 3));
        }
        if (texCoordAttId != -1) {
          geometry.addAttribute('uv',
              new THREE.Float32BufferAttribute(geometryBuffer.uvs, 2));
        }
        this.decode_time = decode_end - start_time;
        this.import_time = performance.now() - decode_end;

        if (this.verbosity > 0) {
          console.log('Decode time: ' + this.decode_time);
          console.log('Import time: ' + this.import_time);
        }
        return geometry;
    }
};