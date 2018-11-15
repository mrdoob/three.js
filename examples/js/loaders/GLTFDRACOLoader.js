/**
 * @author Don McCurdy / https://www.donmccurdy.com
 */

THREE.GLTFDRACOLoader = function(manager) {

  this.manager = manager || THREE.DefaultLoadingManager;

  this.decoderPath = '';
  this.decoderConfig = {};

  this.workerLimit = 4;
  this.workerPool = [];
  this.workerNextTaskID = 1;
  this.workerSourceURL = '';

};

THREE.GLTFDRACOLoader.prototype = {

  constructor: THREE.GLTFDRACOLoader,

  decodeDracoFile: function ( rawBuffer, callback, attributeIDs, attributeTypes ) {

    var taskID = this.workerNextTaskID++;
    var worker = this.getWorker();
    worker._callbacks[ taskID ] = callback;
    worker._taskCosts[ taskID ] = rawBuffer.byteLength;
    worker._taskLoad += worker._taskCosts[ taskID ];
    worker._taskCount++;

    var attributeTypesSerialized = {};

    for ( var name in attributeTypes ) {

      attributeTypesSerialized[ name ] = attributeTypes[ name ].name;

    }

    worker.postMessage( {
      type: 'decode',
      id: taskID,
      rawBuffer: rawBuffer,
      attributeIDs: attributeIDs,
      attributeTypes: attributeTypesSerialized
    } );

  },

  setDecoderPath: function ( path ) {

    this.decoderPath = path;

  },

  setDecoderConfig: function ( config ) {

    this.decoderConfig = config || {};

  },

  setWorkerLimit: function ( count ) {

    this.workerLimit = count;

  },

  getWorker: function () {

    if ( this.workerPool.length < this.workerLimit ) {

      if ( !this.workerSourceURL ) {

        var fn = GLTFDRACOWorker.toString();
        var body = fn.substring( fn.indexOf( '{' ) + 1, fn.lastIndexOf( '}' ) );
        this.workerSourceURL = URL.createObjectURL( new Blob( [ body ] ) );

      }

      var worker = new Worker( this.workerSourceURL );

      worker._callbacks = {};
      worker._taskCosts = {};
      worker._taskLoad = 0;
      worker._taskCount = 0;

      worker.postMessage( {
        type: 'init',
        decoderPath: new URL( this.decoderPath, window.location.href ).href, // TODO: Fails in IE11.
        decoderConfig: this.decoderConfig
      } );

      worker.onmessage = function ( e ) {

        var message = e.data;

        switch ( message.type ) {

          case 'decode': 
            var geometry = new THREE.BufferGeometry();
            geometry.setIndex( new THREE.BufferAttribute( message.mesh.index.buffer, 1 ) );
            for ( var i = 0; i < message.mesh.attributes.length; i++ ) {
              var attribute = message.mesh.attributes[ i ];
              geometry.addAttribute( attribute.name, new THREE.BufferAttribute( attribute.buffer, attribute.itemSize ) );
            }
            worker._callbacks[ message.id ]( geometry );
            worker._taskLoad -= worker._taskCosts[ message.id ];
            delete worker._callbacks[ message.id ];
            delete worker._taskCosts[ message.id ];
            break;

          default:
            throw new Error( 'THREE.GLTFDRACOLoader: Unexpected message, "' + message.type + '"' );

        }

      }

      this.workerPool.push( worker );

    } else {

      this.workerPool.sort( function ( a, b ) { return a._taskLoad > b._taskLoad ? -1 : 1; } );

    }

    return this.workerPool[ this.workerPool.length - 1 ];

  },

  dispose: function () {

    for ( var i = 0; i < this.workerPool.length; i++ ) {

      this.workerPool[ i ].terminate();

    }

    this.workerPool.length = 0;

  }

};

function GLTFDRACOWorker () {

  var decoderPath;
  var decoderConfig;
  var decoderModulePromise;

  onmessage = function ( e ) {

    var message = e.data;

    switch ( message.type ) {

      case 'init':
        decoderPath = message.decoderPath;
        decoderConfig = message.decoderConfig;
        getDecoderModule();
        break;

      case 'decode':
        decode( message.rawBuffer, message.attributeIDs, message.attributeTypes )
          .then( function ( mesh ) {

            var buffers = [ mesh.index.buffer.buffer ];

            for ( var i = 0; i < mesh.attributes.length; i++ ) {

              buffers.push( mesh.attributes[ i ].buffer.buffer );

            }

            self.postMessage( { type: 'decode', id: message.id, mesh: mesh }, buffers );

          } );
        break;

      default:
        throw new Error( 'THREE.GLTFDRACOLoader: Unexpected message type.' );

    }

  };

  function getDecoderModule () {
    if ( decoderModulePromise ) return decoderModulePromise;

    var promise;

    if ( typeof WebAssembly !== 'object' || decoderConfig.type === 'js' ) {
      // Load with asm.js.
      self.importScripts( decoderPath + 'draco_decoder.js' );
      promise = Promise.resolve();
    } else {
      // Load with WebAssembly.
      self.importScripts( decoderPath + 'draco_wasm_wrapper.js' );
      decoderConfig.wasmBinaryFile = decoderPath + 'draco_decoder.wasm';
      promise = fetch( decoderConfig.wasmBinaryFile )
        .then( function ( wasmResponse ) { return wasmResponse.arrayBuffer(); } )
        .then( function ( wasmBinary ) { decoderConfig.wasmBinary = wasmBinary; } );
    }

    // Wait for source files, then create and return a decoder.
    promise = promise.then( function () {
      return new Promise( function ( resolve ) {
        decoderConfig.onModuleLoaded = function ( draco ) {
          // Module is Promise-like. Wrap before resolving to avoid loop.
          resolve( { draco: draco } );
        };
        DracoDecoderModule( decoderConfig );
      } );
    } );

    decoderModulePromise = promise;
    return promise;

  }

  function decode ( rawBuffer, attributeIDs, attributeTypes ) {

    return getDecoderModule().then( function ( module ) {

      var draco = module.draco;
      var decoder = new draco.Decoder();

      var buffer = new draco.DecoderBuffer();
      buffer.Init( new Int8Array( rawBuffer ), rawBuffer.byteLength );

      try {

        return this.decodeGeometry( draco, decoder, buffer, attributeIDs, attributeTypes );

      } finally {

        draco.destroy( buffer );
        draco.destroy( decoder );

      }

    } );

  }

  function decodeGeometry ( draco, decoder, buffer, attributeIDs, attributeTypes ) {

    var dracoGeometry = new draco.Mesh();
    var decodingStatus = decoder.DecodeBufferToMesh( buffer, dracoGeometry );

    if ( !decodingStatus.ok() || dracoGeometry.ptr == 0 ) {

      throw new Error( 'THREE.GLTFDRACOLoader: Decoding failed: ' + decodingStatus.error_msg() );

    }

    var geometry = { index: null, attributes: [] };
    
    var numFaces = dracoGeometry.num_faces();
    var numPoints = dracoGeometry.num_points();
    var numAttributes = dracoGeometry.num_attributes();

    // Add attributes of user specified unique id.
    for (var attributeName in attributeIDs) {
      var attributeType = self[ attributeTypes[ attributeName ] ];
      var attributeId = attributeIDs[attributeName];
      var attribute = decoder.GetAttributeByUniqueId( dracoGeometry, attributeId );
      geometry.attributes.push( this.decodeAttribute( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) );
    }

    // Generate mesh faces.
    var numIndices = numFaces * 3;
    var index = new Uint32Array(numIndices);
    var indexArray = new draco.DracoInt32Array();
    for (var i = 0; i < numFaces; ++i) {
      decoder.GetFaceFromMesh(dracoGeometry, i, indexArray);
      index[i * 3] = indexArray.GetValue(0);
      index[i * 3 + 1] = indexArray.GetValue(1);
      index[i * 3 + 2] = indexArray.GetValue(2);
    }
    geometry.index = { buffer: index, itemSize: 1 };

    draco.destroy( indexArray );
    draco.destroy( dracoGeometry );

    return geometry;

  }

  function decodeAttribute ( draco, decoder, dracoGeometry, attributeName, attributeType, attribute ) {

    var numComponents = attribute.num_components();
    var numPoints = dracoGeometry.num_points();
    var numValues = numPoints * numComponents;
    var dracoArray;

    var buffer;

    switch ( attributeType ) {

      case Float32Array:
        dracoArray = new draco.DracoFloat32Array();
        decoder.GetAttributeFloatForAllPoints( dracoGeometry, attribute, dracoArray );
        buffer = new Float32Array( numValues );
        break;

      case Int8Array:
        dracoArray = new draco.DracoInt8Array();
        decoder.GetAttributeInt8ForAllPoints( dracoGeometry, attribute, dracoArray  );
        buffer = new Int8Array( numValues );
        break;

      case Int16Array:
        dracoArray = new draco.DracoInt16Array();
        decoder.GetAttributeInt16ForAllPoints( dracoGeometry, attribute, dracoArray );
        buffer = new Int16Array( numValues );
        break;

      case Int32Array:
        dracoArray = new draco.DracoInt32Array();
        decoder.GetAttributeInt32ForAllPoints( dracoGeometry, attribute, dracoArray );
        buffer = new Int32Array( numValues );
        break;

      case Uint8Array:
        dracoArray = new draco.DracoUInt8Array();
        decoder.GetAttributeUInt8ForAllPoints( dracoGeometry, attribute, dracoArray );
        buffer = new Uint8Array( numValues );
        break;

      case Uint16Array:
        dracoArray = new draco.DracoUInt16Array();
        decoder.GetAttributeUInt16ForAllPoints( dracoGeometry, attribute, dracoArray );
        buffer = new Uint16Array( numValues );
        break;

      case Uint32Array:
        dracoArray = new draco.DracoUInt32Array();
        decoder.GetAttributeUInt32ForAllPoints( dracoGeometry, attribute, dracoArray );
        buffer = new Uint32Array( numValues );
        break;

      default:
        throw new Error( 'THREE.GLTFDRACOLoader: Unexpected attribute type.' );

    }

    for ( var i = 0; i < numValues; i++ ) {

      buffer[ i ] = dracoArray.GetValue( i );

    }

    draco.destroy( dracoArray );

    return {
      name: attributeName,
      buffer: buffer,
      itemSize: numComponents
    };
    
  };

};
