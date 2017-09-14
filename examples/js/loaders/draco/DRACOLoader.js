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

// |dracoPath| sets the path for the Draco decoder source files. The default
// path is "./". If |dracoDecoderType|.type is set to "js", then DRACOLoader
// will load the Draco JavaScript decoder.
THREE.DRACOLoader = function(dracoPath, dracoDecoderType, manager) {
    this.timeLoaded = 0;
    this.manager = (manager !== undefined) ? manager :
        THREE.DefaultLoadingManager;
    this.materials = null;
    this.verbosity = 0;
    this.attributeOptions = {};
    this.dracoDecoderType =
        (dracoDecoderType !== undefined) ? dracoDecoderType : {};
    this.drawMode = THREE.TrianglesDrawMode;
    this.dracoSrcPath = (dracoPath !== undefined) ? dracoPath : './';
    if (typeof DracoDecoderModule === 'undefined') {
      THREE.DRACOLoader.loadDracoDecoder(this);
    }
};

THREE.DRACOLoader.prototype = {

    constructor: THREE.DRACOLoader,

    load: function(url, onLoad, onProgress, onError) {
        var scope = this;
        var loader = new THREE.FileLoader(scope.manager);
        loader.setPath(this.path);
        loader.setResponseType('arraybuffer');
        if (this.crossOrigin !== undefined) {
          loader.crossOrigin = this.crossOrigin;
        }
        loader.load(url, function(blob) {
            scope.decodeDracoFile(blob, onLoad);
        }, onProgress, onError);
    },

    setPath: function(value) {
        this.path = value;
    },

    setCrossOrigin: function(value) {
        this.crossOrigin = value;
    },

    setVerbosity: function(level) {
        this.verbosity = level;
    },

    /**
     *  Sets desired mode for generated geometry indices.
     *  Can be either:
     *      THREE.TrianglesDrawMode
     *      THREE.TriangleStripDrawMode
     */
    setDrawMode: function(drawMode) {
        this.drawMode = drawMode;
    },

    /**
     * Skips dequantization for a specific attribute.
     * |attributeName| is the THREE.js name of the given attribute type.
     * The only currently supported |attributeName| is 'position', more may be
     * added in future.
     */
    setSkipDequantization: function(attributeName, skip) {
        var skipDequantization = true;
        if (typeof skip !== 'undefined')
          skipDequantization = skip;
        this.getAttributeOptions(attributeName).skipDequantization =
            skipDequantization;
    },

    decodeDracoFile: function(rawBuffer, callback) {
      var scope = this;
      THREE.DRACOLoader.getDecoder(this,
          function(dracoDecoder) {
            scope.decodeDracoFileInternal(rawBuffer, dracoDecoder, callback);
      });
    },

    decodeDracoFileInternal : function(rawBuffer, dracoDecoder, callback) {
      /*
       * Here is how to use Draco Javascript decoder and get the geometry.
       */
      var buffer = new dracoDecoder.DecoderBuffer();
      buffer.Init(new Int8Array(rawBuffer), rawBuffer.byteLength);
      var decoder = new dracoDecoder.Decoder();

      /*
       * Determine what type is this file: mesh or point cloud.
       */
      var geometryType = decoder.GetEncodedGeometryType(buffer);
      if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
        if (this.verbosity > 0) {
          console.log('Loaded a mesh.');
        }
      } else if (geometryType == dracoDecoder.POINT_CLOUD) {
        if (this.verbosity > 0) {
          console.log('Loaded a point cloud.');
        }
      } else {
        var errorMsg = 'THREE.DRACOLoader: Unknown geometry type.'
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      callback(this.convertDracoGeometryTo3JS(dracoDecoder, decoder,
          geometryType, buffer));
    },

    convertDracoGeometryTo3JS: function(dracoDecoder, decoder, geometryType,
                                        buffer) {
        if (this.getAttributeOptions('position').skipDequantization === true) {
          decoder.SkipAttributeTransform(dracoDecoder.POSITION);
        }
        var dracoGeometry;
        var decodingStatus;
        const start_time = performance.now();
        if (geometryType === dracoDecoder.TRIANGULAR_MESH) {
          dracoGeometry = new dracoDecoder.Mesh();
          decodingStatus = decoder.DecodeBufferToMesh(buffer, dracoGeometry);
        } else {
          dracoGeometry = new dracoDecoder.PointCloud();
          decodingStatus =
              decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
        }
        if (!decodingStatus.ok() || dracoGeometry.ptr == 0) {
          var errorMsg = 'THREE.DRACOLoader: Decoding failed: ';
          errorMsg += decodingStatus.error_msg();
          console.error(errorMsg);
          dracoDecoder.destroy(decoder);
          dracoDecoder.destroy(dracoGeometry);
          throw new Error(errorMsg);
        }

        var decode_end = performance.now();
        dracoDecoder.destroy(buffer);
        /*
         * Example on how to retrieve mesh and attributes.
         */
        var numFaces, numPoints;
        var numVertexCoordinates, numTextureCoordinates, numColorCoordinates;
        var numAttributes;
        var numColorCoordinateComponents = 3;
        // For output basic geometry information.
        var geometryInfoStr;
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
        numColorCoordinates = numPoints * 3;
        numAttributes = dracoGeometry.num_attributes();
        if (this.verbosity > 0) {
          console.log('Number of points loaded: ' + numPoints.toString());
          console.log('Number of attributes loaded: ' +
              numAttributes.toString());
        }

        // Get position attribute. Must exists.
        var posAttId = decoder.GetAttributeId(dracoGeometry,
                                                dracoDecoder.POSITION);
        if (posAttId == -1) {
          var errorMsg = 'THREE.DRACOLoader: No position attribute found.';
          console.error(errorMsg);
          dracoDecoder.destroy(decoder);
          dracoDecoder.destroy(dracoGeometry);
          throw new Error(errorMsg);
        }
        var posAttribute = decoder.GetAttribute(dracoGeometry, posAttId);
        var posAttributeData = new dracoDecoder.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints(
            dracoGeometry, posAttribute, posAttributeData);
        // Get color attributes if exists.
        var colorAttId = decoder.GetAttributeId(dracoGeometry,
                                                  dracoDecoder.COLOR);
        var colAttributeData;
        if (colorAttId != -1) {
          if (this.verbosity > 0) {
            console.log('Loaded color attribute.');
          }
          var colAttribute = decoder.GetAttribute(dracoGeometry, colorAttId);
          if (colAttribute.num_components() === 4) {
            numColorCoordinates = numPoints * 4;
            numColorCoordinateComponents = 4;
          }
          colAttributeData = new dracoDecoder.DracoFloat32Array();
          decoder.GetAttributeFloatForAllPoints(dracoGeometry, colAttribute,
                                                colAttributeData);
        }

        // Get normal attributes if exists.
        var normalAttId =
            decoder.GetAttributeId(dracoGeometry, dracoDecoder.NORMAL);
        var norAttributeData;
        if (normalAttId != -1) {
          if (this.verbosity > 0) {
            console.log('Loaded normal attribute.');
          }
          var norAttribute = decoder.GetAttribute(dracoGeometry, normalAttId);
          norAttributeData = new dracoDecoder.DracoFloat32Array();
          decoder.GetAttributeFloatForAllPoints(dracoGeometry, norAttribute,
                                                norAttributeData);
        }

        // Get texture coord attributes if exists.
        var texCoordAttId =
            decoder.GetAttributeId(dracoGeometry, dracoDecoder.TEX_COORD);
        var textCoordAttributeData;
        if (texCoordAttId != -1) {
          if (this.verbosity > 0) {
            console.log('Loaded texture coordinate attribute.');
          }
          var texCoordAttribute = decoder.GetAttribute(dracoGeometry,
                                                         texCoordAttId);
          textCoordAttributeData = new dracoDecoder.DracoFloat32Array();
          decoder.GetAttributeFloatForAllPoints(dracoGeometry,
                                                texCoordAttribute,
                                                textCoordAttributeData);
        }

        // Structure for converting to THREEJS geometry later.
        var geometryBuffer = {
            vertices: new Float32Array(numVertexCoordinates),
            normals: new Float32Array(numVertexCoordinates),
            uvs: new Float32Array(numTextureCoordinates),
            colors: new Float32Array(numColorCoordinates)
        };

        for (var i = 0; i < numVertexCoordinates; i += 3) {
            geometryBuffer.vertices[i] = posAttributeData.GetValue(i);
            geometryBuffer.vertices[i + 1] = posAttributeData.GetValue(i + 1);
            geometryBuffer.vertices[i + 2] = posAttributeData.GetValue(i + 2);
            // Add normal.
            if (normalAttId != -1) {
              geometryBuffer.normals[i] = norAttributeData.GetValue(i);
              geometryBuffer.normals[i + 1] = norAttributeData.GetValue(i + 1);
              geometryBuffer.normals[i + 2] = norAttributeData.GetValue(i + 2);
            }
        }

        // Add color.
        for (var i = 0; i < numColorCoordinates; i += 1) {
          if (colorAttId != -1) {
            // Draco colors are already normalized.
            geometryBuffer.colors[i] = colAttributeData.GetValue(i);
          } else {
            // Default is white. This is faster than TypedArray.fill().
            geometryBuffer.colors[i] = 1.0;
          }
        }

        // Add texture coordinates.
        if (texCoordAttId != -1) {
          for (var i = 0; i < numTextureCoordinates; i += 2) {
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
          if (this.drawMode === THREE.TriangleStripDrawMode) {
            var stripsArray = new dracoDecoder.DracoInt32Array();
            var numStrips = decoder.GetTriangleStripsFromMesh(
                dracoGeometry, stripsArray);
            geometryBuffer.indices = new Uint32Array(stripsArray.size());
            for (var i = 0; i < stripsArray.size(); ++i) {
              geometryBuffer.indices[i] = stripsArray.GetValue(i);
            }
            dracoDecoder.destroy(stripsArray);
          } else {
            var numIndices = numFaces * 3;
            geometryBuffer.indices = new Uint32Array(numIndices);
            var ia = new dracoDecoder.DracoInt32Array();
            for (var i = 0; i < numFaces; ++i) {
              decoder.GetFaceFromMesh(dracoGeometry, i, ia);
              var index = i * 3;
              geometryBuffer.indices[index] = ia.GetValue(0);
              geometryBuffer.indices[index + 1] = ia.GetValue(1);
              geometryBuffer.indices[index + 2] = ia.GetValue(2);
            }
            dracoDecoder.destroy(ia);
         }
        }

        // Import data to Three JS geometry.
        var geometry = new THREE.BufferGeometry();
        geometry.drawMode = this.drawMode;
        if (geometryType == dracoDecoder.TRIANGULAR_MESH) {
          geometry.setIndex(new(geometryBuffer.indices.length > 65535 ?
                THREE.Uint32BufferAttribute : THREE.Uint16BufferAttribute)
              (geometryBuffer.indices, 1));
        }
        geometry.addAttribute('position',
            new THREE.Float32BufferAttribute(geometryBuffer.vertices, 3));
        var posTransform = new dracoDecoder.AttributeQuantizationTransform();
        if (posTransform.InitFromAttribute(posAttribute)) {
          // Quantized attribute. Store the quantization parameters into the
          // THREE.js attribute.
          geometry.attributes['position'].isQuantized = true;
          geometry.attributes['position'].maxRange = posTransform.range();
          geometry.attributes['position'].numQuantizationBits =
              posTransform.quantization_bits();
          geometry.attributes['position'].minValues = new Float32Array(3);
          for (var i = 0; i < 3; ++i) {
            geometry.attributes['position'].minValues[i] =
                posTransform.min_value(i);
          }
        }
        dracoDecoder.destroy(posTransform);
        geometry.addAttribute('color',
            new THREE.Float32BufferAttribute(geometryBuffer.colors,
                                             numColorCoordinateComponents));
        if (normalAttId != -1) {
          geometry.addAttribute('normal',
              new THREE.Float32BufferAttribute(geometryBuffer.normals, 3));
        }
        if (texCoordAttId != -1) {
          geometry.addAttribute('uv',
              new THREE.Float32BufferAttribute(geometryBuffer.uvs, 2));
        }

        dracoDecoder.destroy(decoder);
        dracoDecoder.destroy(dracoGeometry);

        this.decode_time = decode_end - start_time;
        this.import_time = performance.now() - decode_end;

        if (this.verbosity > 0) {
          console.log('Decode time: ' + this.decode_time);
          console.log('Import time: ' + this.import_time);
        }
        return geometry;
    },

    isVersionSupported: function(version, callback) {
        THREE.DRACOLoader.getDecoder(this,
            function(decoder) {
              callback(decoder.isVersionSupported(version));
            });
    },

    getAttributeOptions: function(attributeName) {
        if (typeof this.attributeOptions[attributeName] === 'undefined')
          this.attributeOptions[attributeName] = {};
        return this.attributeOptions[attributeName];
    }
};

// This function loads a JavaScript file and adds it to the page. "path"
// is the path to the JavaScript file. "onLoadFunc" is the function to be
// called when the JavaScript file has been loaded.
THREE.DRACOLoader.loadJavaScriptFile = function(path, onLoadFunc,
    dracoDecoder) {
  var head = document.getElementsByTagName('head')[0];
  var element = document.createElement('script');
  element.id = "decoder_script";
  element.type = 'text/javascript';
  element.src = path;
  if (onLoadFunc !== null) {
    element.onload = onLoadFunc(dracoDecoder);
  } else {
    element.onload = function(dracoDecoder) {
      dracoDecoder.timeLoaded = performance.now();
    };
  }

  var previous_decoder_script = document.getElementById("decoder_script");
  if (previous_decoder_script !== null) {
    previous_decoder_script.parentNode.removeChild(previous_decoder_script);
  }
  head.appendChild(element);
}

THREE.DRACOLoader.loadWebAssemblyDecoder = function(dracoDecoder) {
  dracoDecoder.dracoDecoderType['wasmBinaryFile'] =
      dracoDecoder.dracoSrcPath + 'draco_decoder.wasm';
  var xhr = new XMLHttpRequest();
  xhr.open('GET', dracoDecoder.dracoSrcPath + 'draco_decoder.wasm', true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function() {
    // draco_wasm_wrapper.js must be loaded before DracoDecoderModule is
    // created. The object passed into DracoDecoderModule() must contain a
    // property with the name of wasmBinary and the value must be an
    // ArrayBuffer containing the contents of the .wasm file.
    dracoDecoder.dracoDecoderType['wasmBinary'] = xhr.response;
    dracoDecoder.timeLoaded = performance.now();
  };
  xhr.send(null)
}

// This function will test if the browser has support for WebAssembly. If
// it does it will download the WebAssembly Draco decoder, if not it will
// download the asmjs Draco decoder.
THREE.DRACOLoader.loadDracoDecoder = function(dracoDecoder) {
  if (typeof WebAssembly !== 'object' ||
      dracoDecoder.dracoDecoderType.type === 'js') {
    // No WebAssembly support
    THREE.DRACOLoader.loadJavaScriptFile(dracoDecoder.dracoSrcPath +
        'draco_decoder.js', null, dracoDecoder);
  } else {
    THREE.DRACOLoader.loadJavaScriptFile(dracoDecoder.dracoSrcPath +
        'draco_wasm_wrapper.js',
        function (dracoDecoder) {
          THREE.DRACOLoader.loadWebAssemblyDecoder(dracoDecoder);
        }, dracoDecoder);
  }
}

/**
 * Creates and returns a singleton instance of the DracoDecoderModule.
 * The module loading is done asynchronously for WebAssembly. Initialized module
 * can be accessed through the callback function
 * |onDracoDecoderModuleLoadedCallback|.
 */
THREE.DRACOLoader.getDecoder = (function() {
    var decoder;
    var decoderCreationCalled = false;

    return function(dracoDecoder, onDracoDecoderModuleLoadedCallback) {
        if (typeof decoder !== 'undefined') {
          // Module already initialized.
          if (typeof onDracoDecoderModuleLoadedCallback !== 'undefined') {
            onDracoDecoderModuleLoadedCallback(decoder);
          }
        } else {
          if (typeof DracoDecoderModule === 'undefined') {
            // Wait until the Draco decoder is loaded before starting the error
            // timer.
            if (dracoDecoder.timeLoaded > 0) {
              var waitMs = performance.now() - dracoDecoder.timeLoaded;

              // After loading the Draco JavaScript decoder file, there is still
              // some time before the DracoDecoderModule is defined. So start a
              // loop to check when the DracoDecoderModule gets defined. If the
              // time is hit throw an error.
              if (waitMs > 5000) {
                throw new Error(
                    'THREE.DRACOLoader: DracoDecoderModule not found.');
              }
            }
          } else {
            if (!decoderCreationCalled) {
              decoderCreationCalled = true;
              dracoDecoder.dracoDecoderType['onModuleLoaded'] =
                  function(module) {
                    if (typeof onDracoDecoderModuleLoadedCallback ===
                        'function') {
                      decoder = module;
                    }
                  };
              DracoDecoderModule(dracoDecoder.dracoDecoderType);
            }
          }

          // Either the DracoDecoderModule has not been defined or the decoder
          // has not been created yet. Call getDecoder() again.
          setTimeout(function() {
            THREE.DRACOLoader.getDecoder(dracoDecoder,
                onDracoDecoderModuleLoadedCallback);
          }, 10);
        }
    };

})();
