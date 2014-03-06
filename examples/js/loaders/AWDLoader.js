/**
 * User: plepers
 * Date: 09/12/2013 17:21
 */

(function (){


  var littleEndian = true;

  THREE.AWDLoader = AWDLoader;

  function AWDLoader( showStatus ) {

    THREE.Loader.call( this, showStatus );

    this.trunk = new THREE.Object3D();

    this.materialFactory = undefined;

    this._data;
    this._ptr = 0;

    this._version =  [];
    this._streaming = false;
    this._optimized_for_accuracy = false;
    this._compression = 0;
    this._bodylen = 0xFFFFFFFF;
    this._cur_block_id = 0x00000000;

    this._blocks = new Array();//AWDBlock
    this._blocks[0] = new AWDBlock();
    this._blocks[0].data = null;

    this._accuracyMatrix = false;
    this._accuracyGeo = false;
    this._accuracyProps = false;


  };


  AWDLoader.prototype = new THREE.Loader();

  AWDLoader.prototype.constructor = AWDLoader;

  AWDLoader.prototype.load = function ( url, callback ) {

    var that = this;
    var xhr = new XMLHttpRequest();
    xhr.open( "GET", url, true );
    xhr.responseType = 'arraybuffer';

    xhr.onreadystatechange = function () {

      if ( xhr.readyState == 4 ) {

        if ( xhr.status == 200 || xhr.status == 0 ) {
          var parseTime = Date.now();
          that.parse( xhr.response );
          parseTime = Date.now() - parseTime;
          callback( that.trunk );

        } else {

          console.error( 'AWDLoader: Couldn\'t load ' + url + ' (' + xhr.status + ')' );

        }

      }

    };

    xhr.send( null );

  };

  AWDLoader.prototype.parse = function ( data ) {

    this._data = new DataView( data );
    var blen = data.byteLength;
    this._ptr = 0;

    this._parseHeader( );

    if( this._compression != 0  ) {
      console.error( 'compressed AWD nor supported' );
    }

    if (!this._streaming && this._bodylen != data.byteLength - this._ptr ) {
      console.error('AWDLoader: body len does not match file length', this._bodylen ,  blen - this._ptr);
    }

    while ( this._ptr < blen ) {
      this.parseNextBlock();
    }

    this.logHeadInfos();
  }



  AWDLoader.prototype.parseNextBlock = function ( ) {

    var assetData;
    var ns, type, len;
    this._cur_block_id = this.readU32();

    ns = this.readU8();
    type = this.readU8();
    flags = this.readU8();
    len = this.readU32();

    var posExpected = this._ptr + len;

    switch (type) {
      case 1:
        assetData = this.parseMeshData(len);
        break;
      case 22:
        assetData = this.parseContainer(len);
        break;
      case 23:
        assetData = this.parseMeshInstance(len);
        break;
      case 81:
        assetData = this.parseMaterial(len);
        break;
      // case 82:
      // 	assetData = parseTexture(len);
      // 	break;
      case 101:
      	assetData = this.parseSkeleton(len);
      	break;

//      case 111:
//        assetData = this.parseMeshPoseAnimation(len, true);
//        break;
      case 112:
        assetData = this.parseMeshPoseAnimation(len, false);
        break;
      case 113:
        assetData = this.parseVertexAnimationSet(len);
        break;
      case 102:
      	assetData = this.parseSkeletonPose(len);
      	break;
      case 103:
      	assetData = this.parseSkeletonAnimation(len);
      	break;
      case 122:
        assetData = this.parseAnimatorSet(len);
        break;
      // case 121:
      // 	assetData = parseUVAnimation(len);
      // 	break;
      default:
        //debug('Ignoring block!',type, len);
        this._ptr += len;
        break;
    }

    // log( "AWDloader.js in block parsed - ptr : " , this._ptr, "expected " , posExpected);


    // Store block reference for later use
    this._blocks[this._cur_block_id] = new AWDBlock();
    this._blocks[this._cur_block_id].data = assetData;
    this._blocks[this._cur_block_id].id = this._cur_block_id;

  }

  AWDLoader.prototype.logHeadInfos = function ( data ) {

    console.log('HEADER:');
    console.log('version:', this._major+"."+this._minor);
    console.log('streaming?', this._streaming);
    console.log('accurate?', this._optimized_for_accuracy);
    console.log('compression:', this._compression);
    console.log('bodylen:', this._bodylen);

  }


  AWDLoader.prototype._parseHeader = function () {


    var awdmagic = 		(this._data.getUint8( this._ptr++ )<<16)
        | 	(this._data.getUint8( this._ptr++, littleEndian )<<8 )
        | 	this._data.getUint8( this._ptr++, littleEndian );

    if( awdmagic != 4282180 ) // utf "AWD"
      console.error( "AWDLoader bad magic" );

    this._version[0] = this.readU8();
    this._version[1] = this.readU8();

    var flags = this.readU16();

    this._streaming 				= (flags & 0x1) == 0x1;

    if ((this._version[0] == 2) && (this._version[1] == 1)) {
      this._accuracyMatrix =  (flags & 0x2) == 0x2;
      this._accuracyGeo =     (flags & 0x4) == 0x4;
      this._accuracyProps =   (flags & 0x8) == 0x8;
    }

    this._geoNrType = FLOAT32;
    if (this._accuracyGeo)
      this._geoNrType = FLOAT64;

    this._matrixNrType = FLOAT32;
    if (this._accuracyMatrix)
      this._matrixNrType = FLOAT64;

    this._propsNrType = FLOAT32;
    if (this._accuracyProps)
      this._propsNrType = FLOAT64;

    this._optimized_for_accuracy 	= (flags & 0x2) == 0x2;

    this._compression = this.readU8();
    this._bodylen = this.readU32();

    // log("Import AWDFile of version = " + this._version[0] + " - " + this._version[1]);
    // log("Global Settings = Compression = " + this._compression + " | Streaming = " + this._streaming + " | Matrix-Precision = " + this._accuracyMatrix + " | Geometry-Precision = " + this._accuracyGeo + " | Properties-Precision = " + this._accuracyProps);

  }


  AWDLoader.prototype.parseContainer = function ( len ) {
    var name;
    var par_id;
    var mtx;
    var ctr;
    var parent;

    ctr = new THREE.Object3D();

    par_id = this.readU32();
    mtx = this.parseMatrix4();
    ctr.name = this.readUTF();

    //log( "AWDLoader parseContainer ", ctr.name );

    ctr.applyMatrix( mtx );

    parent = this._blocks[par_id].data || this.trunk;
    //log( "			p", parent.name );
    parent.add(ctr);

    this.parseProperties({1:this._matrixNrType, 2:this._matrixNrType, 3:this._matrixNrType, 4:UINT8});
    ctr.extra = this.parseUserAttributes();

    //finalizeAsset(ctr, name);

    return ctr;
  }

  AWDLoader.prototype.parseMeshInstance = function ( len ) {
    var name;
    var mesh, geometries;
    var par_id, data_id;
    var mtx;
    var materials;
    var num_materials;
    var materials_parsed;
    var parent;
    var i;

    par_id = this.readU32();
    mtx = this.parseMatrix4();
    name = this.readUTF();

    debug("awd mesh : "+name);

    data_id = this.readU32();
    geometries = this._blocks[data_id].data;

    materials = [];
    num_materials = this.readU16();
    materials_parsed = 0;
    while (materials_parsed < num_materials) {
      var mat_id;
      var mat;
      mat_id = this.readU32();

      mat = this._blocks[mat_id].data;
      materials.push(mat);

      materials_parsed++;
    }

    //log( "AWDLoader parseMeshInstance ", name );
    var meshLen = geometries.length
    var meshes = [];
    if( meshLen  > 1 ) {
      mesh = new THREE.Object3D()
      for ( i = 0; i < meshLen; i++) {
        var sm = new THREE.Mesh( geometries[i] );
        meshes.push( sm );
        mesh.add( sm );
      }
    } else {
      mesh = new THREE.Mesh( geometries[0] );
      meshes.push( mesh );
    }
    mesh.applyMatrix( mtx );
    mesh.name = name;

    // Add to parent if one exists
    parent = this._blocks[par_id].data || this.trunk;
    parent.add(mesh);

    log(materials);
    // TODO check sub geom lenght?
    var matLen = materials.length;
    var maxLen = Math.max( meshLen, matLen);
    for( i = 0; i< maxLen; i++ )
      meshes[i%meshLen].material = new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        color: 0x808080
      });//materials[i‰matLen];


    // Ignore for now
    this.parseProperties(null);
    mesh.extra = this.parseUserAttributes();

    //finalizeAsset(mesh, name);

    return mesh;
  }


  AWDLoader.prototype.parseMaterial = function ( len ) {
    var name;
    var type;
    var props;
    var mat;
    var attributes;
    var finalize;
    var num_methods;
    var methods_parsed;

    name = this.readUTF();
    type = this.readU8();
    num_methods = this.readU8();

    //log( "AWDLoader parseMaterial ",name )

    // Read material numerical properties
    // (1=color, 2=bitmap url, 11=alpha_blending, 12=alpha_threshold, 13=repeat)
    props = this.parseProperties({ 1:AWD_FIELD_INT32, 2:AWD_FIELD_BADDR,
      11:AWD_FIELD_BOOL, 12:AWD_FIELD_FLOAT32, 13:AWD_FIELD_BOOL });

    methods_parsed = 0;

    while (methods_parsed < num_methods) {
      var method_type;

      method_type = this.readU16();
      this.parseProperties(null);
      this.parseUserAttributes();
    }

    attributes = this.parseUserAttributes();

    if( this.materialFactory !== undefined ) {
      mat = this.materialFactory( name );
      if( mat ) return mat;
    }

    if (type == 1) { // Color material
      mat = new THREE.MeshBasicMaterial();
      mat.color = new THREE.Color( props.get(1, 0xcccccc) );
    }
    else if (type == 2) { // Bitmap material

      mat = new THREE.MeshBasicMaterial();

    }

    mat.extra = attributes;
    mat.alphaThreshold = props.get(12, 0.0);
    mat.repeat = props.get(13, false);

    // if (finalize) {
    // 	finalizeAsset(mat, name);
    // }

    return mat;
  }

  AWDLoader.prototype.parseSkeleton = function(len) // Array<Bone>
  {
    var name;
    var num_joints;
    var joints_parsed;
    var skeleton;

    name = this.readUTF();
    num_joints = this.readU16();
    skeleton = []

    // Discard properties for now
    this.parseProperties(null);

    joints_parsed = 0;

    // debug( 'parse Skeleton '+num_joints+ ' joints');

    while (joints_parsed < num_joints) {
      // TODO: not used
      //        var parent_id : uint;
      // TODO: not used
      //var joint_name : String;
      var joint;// : SkeletonJoint;
      var ibp;// : Matrix3D;

      // Ignore joint id
      this.readU16();

      joint = new THREE.Bone();
      joint.parent = this.readU16() - 1; // 0=null in AWD
      joint.name = this.readUTF();

      ibp = this.parseMatrix4();
      joint.skinMatrix = ibp;

      // Ignore joint props/attributes for now
      this.parseProperties(null);
      this.parseUserAttributes();

      skeleton.push(joint);
      joints_parsed++;
    }

    // Discard attributes for now
    this.parseUserAttributes();


    return skeleton;
  }

  AWDLoader.prototype.parseSkeletonPose = function(blockID)
  {
    var name = this.readUTF();


    var num_joints = this.readU16();
    this.parseProperties(null);

    // debug( 'parse Skeleton Pose. joints : ' + num_joints);

    var pose = [];

    var joints_parsed = 0;

    while (joints_parsed < num_joints) {

      var joint_pose;

      var has_transform; //:uint;
      var mtx_data;

      has_transform = this.readU8();

      if (has_transform === 1) {
        mtx_data = this.parseMatrix4();
      } else
      {
        mtx_data = new THREE.Matrix4();
      }
      pose[joints_parsed] = mtx_data;
      joints_parsed++;
    }
    // Skip attributes for now
    this.parseUserAttributes();

    return pose
  }

  AWDLoader.prototype.parseSkeletonAnimation = function(blockID)
  {
    var frame_dur;
    var pose_addr;
    var pose;

    var name = this.readUTF();

    var clip = [];

    var num_frames = this.readU16();
    this.parseProperties(null);

    var frames_parsed = 0;
    var returnedArray;


    // debug( 'parse Skeleton Animation. frames : ' + num_frames);

    while (frames_parsed < num_frames) {
      pose_addr = this.readU32();
      frame_dur = this.readU16();

      pose = this._blocks[pose_addr].data
      // debug( 'pose address ',pose[2].elements[12],pose[2].elements[13],pose[2].elements[14] );
      clip.push( {
        pose : pose,
        duration : frame_dur
      } );

      frames_parsed++;
    }
    if (clip.length == 0) {
      // debug("Could not this SkeletonClipNode, because no Frames where set.");
      return;
    }
    // Ignore attributes for now
    this.parseUserAttributes();
    return clip;
  }



  AWDLoader.prototype.parseVertexAnimationSet = function(len)
  {
    var poseBlockAdress; //:int
    var name = this.readUTF();
    var num_frames = this.readU16();
    var props = this.parseProperties({1:UINT16});
    var frames_parsed = 0;
    var skeletonFrames = []; //:Vector.<SkeletonClipNode> = new Vector.<SkeletonClipNode>;
    //var vertexFrames = [];//:Vector.<VertexClipNode> = new Vector.<VertexClipNode>;
    // debug ( 'parseVertexAnimationSet num_frames: '+num_frames)
    while (frames_parsed < num_frames) {
      poseBlockAdress = this.readU32();
      skeletonFrames.push(this._blocks[poseBlockAdress].data);
      frames_parsed++;
    }

    this.parseUserAttributes();


    return skeletonFrames;
  }


  AWDLoader.prototype.parseAnimatorSet = function(len)
  {
    var targetMesh;

    var animSetBlockAdress; //:int

    var targetAnimationSet; //:AnimationSetBase;
    var outputString = ""; //:String = "";
    var name = this.readUTF();
    var type = this.readU16();

    var props = this.parseProperties({1:BADDR});

    animSetBlockAdress = this.readU32();
    var targetMeshLength = this.readU16();

    var meshAdresses = []; //:Vector.<uint> = new Vector.<uint>;

    for (var i = 0; i < targetMeshLength; i++)
      meshAdresses.push( this.readU32() );

    var activeState = this.readU16();
    var autoplay = Boolean(this.readU8());
    this.parseUserAttributes();
    this.parseUserAttributes();

    var returnedArray;
    var targetMeshes = []; //:Vector.<Mesh> = new Vector.<Mesh>;

    for (i = 0; i < meshAdresses.length; i++) {
//      returnedArray = getAssetByID(meshAdresses[i], [AssetType.MESH]);
//      if (returnedArray[0])
        targetMeshes.push(this._blocks[meshAdresses[i]].data);
    }

    targetAnimationSet = this._blocks[animSetBlockAdress].data
    var thisAnimator;

    if (type == 1) {


      thisAnimator = {
        animationSet : targetAnimationSet,
        skeleton : this._blocks[props.get(1, 0)].data
      };

    } else if (type == 2) {
      // debug( "vertex Anim???");
    }


    for (i = 0; i < targetMeshes.length; i++) {
        targetMeshes[i].animator = thisAnimator;
    }
    // debug("Parsed a Animator: Name = " + name);

    return thisAnimator;
  }







  AWDLoader.prototype.parseMeshData = function ( len ) {

    var name;
    var geom;
    var num_subs;
    var subs_parsed;
    var props;

    var tmparray;
    var skinW, skinI;

    // Read name and sub count
    name = this.readUTF();
    num_subs = this.readU16();

    //log( "AWDloader.js parseMeshData geom name ["+name+"]", num_subs );

    // Read optional properties
    props = this.parseProperties({1:this._geoNrType, 2:this._geoNrType});

    // TODO
    // var geoScaleU:Number = props.get(1, 1);
    // var geoScaleV:Number = props.get(2, 1);

    var geometries = []


    // Loop through sub meshes
    subs_parsed = 0;

    while (subs_parsed < num_subs) {

      var sm_len, sm_end;

      geom = new THREE.BufferGeometry();
      geom.name = name
      geometries.push( geom );


      sm_len = this.readU32();
      sm_end = this._ptr + sm_len;


      // Ignore for now
      this.parseProperties({1:this._geoNrType, 2:this._geoNrType});

      // Loop through data streams
      while ( this._ptr < sm_end ) {


        var idx = 0;

        var str_type, str_ftype, str_len, str_end;

        str_type = this.readU8();
        str_ftype = this.readU8();
        str_len = this.readU32();
        str_end = str_len + this._ptr;

        // TODO ! native typedarray copy (endianness????)
        // debug( "geom stream type : "+ str_type);

        // VERTICES
        // ------------------
        if (str_type == 1) {

          geom.addAttribute( 'position', Float32Array, str_len/12, 3 );
          tmparray = geom.attributes.position.array;
          idx = 0
          while (this._ptr < str_end) {
            tmparray[idx]   = -this.readF32();
            tmparray[idx+1] = this.readF32();
            tmparray[idx+2] = this.readF32();
            idx+=3;
          }
        }


        // INDICES / FACES
        // -----------------
        else if (str_type == 2) {
          // todo ??? item size 1 ?
          geom.addAttribute( 'index', Uint16Array, str_len/2, 1 );

          geom.offsets.push({
            start: 0,
            index: 0,
            count: str_len/2
          });

          tmparray = geom.attributes.index.array
          idx = 0

          while (this._ptr < str_end) {
            tmparray[idx+1]   = this.readU16();
            tmparray[idx]     = this.readU16();
            tmparray[idx+2]   = this.readU16();
            idx+=3;
          }
        }
        // UVS / TEX COORDS
        else if (str_type == 3) {
          geom.addAttribute( 'uv', Float32Array, str_len/8, 2 );
          tmparray = geom.attributes.uv.array
          idx = 0
          while (this._ptr < str_end) {
            tmparray[idx]   = this.readF32();
            tmparray[idx+1] = 1.0-this.readF32();
            idx+=2;
          }
        }
        
        // NORMALS
        else if (str_type == 4) {

          geom.addAttribute( 'normal', Float32Array, str_len/12, 3 );
          tmparray = geom.attributes.normal.array
          idx = 0

          while (this._ptr < str_end) {
            tmparray[idx]   = -this.readF32();
            tmparray[idx+1] = this.readF32();
            tmparray[idx+2] = this.readF32();
            idx+=3;
          }

        }

        else if (str_type == 6) {
          skinI = new Float32Array( str_len>>1 );
          log("parse skin indices");
//          geom.addAttribute( 'skinIndex', Float32Array, str_len/4, 4 );
//          tmparray = geom.attributes.skinIndex.array
          idx = 0

          while (this._ptr < str_end) {
            skinI[idx]   = this.readU16();
            idx++;
          }

        }
        else if (str_type == 7) {
          skinW = new Float32Array( str_len>>2 );

//          geom.addAttribute( 'skinWeight', Float32Array, str_len/8, 4 );
//          tmparray = geom.attributes.skinWeight.array
          log("parse skin weights");
//          console.log( tmparray.length );
          idx = 0;

          while (this._ptr < str_end) {
            skinW[idx]   = this.readF32();
            idx++;

          }
        }
        else {
          this._ptr = str_end;
        }



      }

      if( skinI !== undefined ){

        tmparray = geom.attributes.position.array;
        var nverts = tmparray.length/3;
        var jointsPerVertex = skinW.length / nverts;
        // debug('jointsPerVertex '+jointsPerVertex );

        // if( jointsPerVertex !== 4 )
        //   console.error( "jointsPerVertex must be 4", jointsPerVertex );


        geom.addAttribute( 'skinIndex', Float32Array, nverts, 4 );
        tmparray = geom.attributes.skinIndex.array
        tmparray.set( skinI );

        geom.addAttribute( 'skinWeight', Float32Array, nverts, 4 );
        tmparray = geom.attributes.skinWeight.array
        tmparray.set( skinW );

//        idx = 0;
//        while(idx< skinW.length ) {
//
//          var ccc = 0;
//          for( var i = 0; i< jointsPerVertex; i++) {
//            if( skinW[idx+i]> 0.001 ) ccc++
//          }
//
//          if( ccc > 2 ) {
//
//            console.log('more than 2 '+ccc );
//            for( var i = 0; i< jointsPerVertex; i++) {
//              console.log( skinW[idx+i] );
//            }
//          }
//          idx += jointsPerVertex;
//        }

      }




      this.parseUserAttributes();


      geom.computeBoundingSphere();
      subs_parsed++;
    }


    //geom.computeFaceNormals();


    this.parseUserAttributes();
    //finalizeAsset(geom, name);

    return geometries;
  }

  AWDLoader.prototype.parseMeshPoseAnimation = function(len, poseOnly)
  {
    var num_frames = 1;
    var num_submeshes;
    var frames_parsed;
    var subMeshParsed;
    var frame_dur;
    var x;
    var y;
    var z;
    var str_len;
    var str_end;
    var geometry; //:Geometry
    var subGeom; //:CompactSubGeometry
    var idx = 0;
    var clip = {};//:VertexClipNode = new VertexClipNode();

    var indices; //:Vector.<uint>;
    var verts; //:Vector.<Number>;
    var num_Streams; //:int = 0;
    var streamsParsed; //:int = 0;
    var streamtypes = []; //:Vector.<int> = new Vector.<int>;

    var props;//:AWDProperties;
    var thisGeo; //:Geometry;
    var name = this.readUTF();
    var geoAdress = this.readU32();

    var mesh = this._blocks[geoAdress].data;
    if (mesh == null) {
      console.log( "parseMeshPoseAnimation target mesh not found at:", geoAdress );
      return;
    }
    var geom = mesh.geometry
    geom.morphTargets = []

    if (!poseOnly)
      num_frames = this.readU16();

    num_submeshes = this.readU16();
    num_Streams = this.readU16();

    // debug("VA num_frames : ", num_frames );
    // debug("VA num_submeshes : ", num_submeshes );
    // debug("VA numstreams : ", num_Streams );

    streamsParsed = 0;
    while (streamsParsed < num_Streams) {
      streamtypes.push(this.readU16());
      streamsParsed++;
    }
    props = this.parseProperties({1:BOOL, 2:BOOL});

    clip.looping = props.get(1, true);
    clip.stitchFinalFrame = props.get(2, false);

    frames_parsed = 0;

    while (frames_parsed < num_frames) {

      frame_dur = this.readU16();
      subMeshParsed = 0;

      while (subMeshParsed < num_submeshes) {

        streamsParsed = 0;
        str_len = this.readU32();
        str_end = this._ptr + str_len;

        while (streamsParsed < num_Streams) {

          if (streamtypes[streamsParsed] == 1) {

            //geom.addAttribute( 'morphTarget'+frames_parsed, Float32Array, str_len/12, 3 );
            tmparray = new Float32Array(str_len/4);
            geom.morphTargets.push( {
              array : tmparray
            });

            //tmparray = geom.attributes['morphTarget'+frames_parsed].array
            idx = 0;

            while ( this._ptr < str_end) {
              tmparray[idx]     = this.readF32();
              tmparray[idx+1]   = this.readF32();
              tmparray[idx+2]   = this.readF32();
              idx+=3;
            }



            subMeshParsed++;
          } else
            this._ptr = str_end;
          streamsParsed++;
        }
      }


      frames_parsed++;
    }
    this.parseUserAttributes();

    return null;
  }









  AWDLoader.prototype.parseMatrix4 = function ( ) {
    var mtx = new THREE.Matrix4();
    var e = mtx.elements;

    e[0] = this.readF32();
    e[1] = this.readF32();
    e[2] = this.readF32();
    e[3] = 0.0;
    //e[3] = 0.0;

    e[4] = this.readF32();
    e[5] = this.readF32();
    e[6] = this.readF32();
    //e[7] = this.readF32();
    e[7] = 0.0;

    e[8] = this.readF32();
    e[9] = this.readF32();
    e[10] = this.readF32();
    //e[11] = this.readF32();
    e[11] = 0.0;

    e[12] = -this.readF32();
    e[13] = this.readF32();
    e[14] = this.readF32();
    //e[15] = this.readF32();
    e[15] = 1.0;
    return mtx;
  }


  AWDLoader.prototype.parseProperties = function ( expected ) {
    var list_len = this.readU32();
    var list_end = this._ptr + list_len;

    var props = new AWDProperties();

    if( expected ) {

      while( this._ptr < list_end ) {

        var key = this.readU16();
        var len = this.readU32();
        var type;

        if( expected.hasOwnProperty( key ) ) {
          type = expected[ key ];
          props.set( key, this.parseAttrValue( type, len ) );
        } else {
          this._ptr += len;
        }
      }

    }

    return props;

  };


  AWDLoader.prototype.parseUserAttributes = function ( ) {
    // skip for now
    this._ptr = this.readU32() + this._ptr;
    return null;
  };


  AWDLoader.prototype.parseAttrValue = function ( type, len ) {

    var elem_len;
    var read_func;

    switch (type) {
      case AWD_FIELD_INT8:
        elem_len = 1;
        read_func = this.readI8;
        break;
      case AWD_FIELD_INT16:
        elem_len = 2;
        read_func = this.readI16;
        break;
      case AWD_FIELD_INT32:
        elem_len = 4;
        read_func = this.readI32;
        break;
      case AWD_FIELD_BOOL:
      case AWD_FIELD_UINT8:
        elem_len = 1;
        read_func = this.readU8;
        break;
      case AWD_FIELD_UINT16:
        elem_len = 2;
        read_func = this.readU16;
        break;
      case AWD_FIELD_UINT32:
      case AWD_FIELD_BADDR:
        elem_len = 4;
        read_func = this.readU32;
        break;
      case AWD_FIELD_FLOAT32:
        elem_len = 4;
        read_func = this.readF32;
        break;
      case AWD_FIELD_FLOAT64:
        elem_len = 8;
        read_func = this.readF64;
        break;
      case AWD_FIELD_VECTOR2x1:
      case AWD_FIELD_VECTOR3x1:
      case AWD_FIELD_VECTOR4x1:
      case AWD_FIELD_MTX3x2:
      case AWD_FIELD_MTX3x3:
      case AWD_FIELD_MTX4x3:
      case AWD_FIELD_MTX4x4:
        elem_len = 8;
        read_func = this.readF64;
        break;
    }

    if (elem_len < len) {
      var list;
      var num_read;
      var num_elems;

      list = [];
      num_read = 0;
      num_elems = len / elem_len;

      while (num_read < num_elems) {
        list.push(read_func.call( this ) );
        num_read++;
      }

      return list;
    }
    else {
      return read_func.call( this );
    }

  }


  AWDLoader.prototype.readU8 = function () {
    return this._data.getUint8( this._ptr++, littleEndian );
  }
  AWDLoader.prototype.readI8 = function () {
    return this._data.getInt8( this._ptr++, littleEndian );
  }

  AWDLoader.prototype.readU16 = function () {
    var a = this._data.getUint16( this._ptr, littleEndian );
    this._ptr += 2;
    return a;
  }
  AWDLoader.prototype.readI16 = function () {
    var a = this._data.getInt16( this._ptr, littleEndian );
    this._ptr += 2;
    return a;
  }

  AWDLoader.prototype.readU32 = function () {
    var a = this._data.getUint32( this._ptr, littleEndian );
    this._ptr += 4;
    return a;
  }
  AWDLoader.prototype.readI32 = function () {
    var a = this._data.getInt32( this._ptr, littleEndian );
    this._ptr += 4;
    return a;
  }
  AWDLoader.prototype.readF32 = function () {
    var a = this._data.getFloat32( this._ptr, littleEndian );
    this._ptr += 4;
    return a;
  }
  AWDLoader.prototype.readF64 = function () {
    var a = this._data.getFloat64( this._ptr, littleEndian );
    this._ptr += 8;
    return a;
  }


  /**
   * Converts a UTF-8 byte array to JavaScript's 16-bit Unicode.
   * @param {Array.<number>} bytes UTF-8 byte array.
   * @return {string} 16-bit Unicode string.
   */
  AWDLoader.prototype.readUTF = function () {
    var end = this.readU16();

    // TODO(user): Use native implementations if/when available

    var out = [], c = 0;

    while ( out.length < end ) {
      var c1 = this._data.getUint8( this._ptr++, littleEndian );
      if (c1 < 128) {
        out[c++] = String.fromCharCode(c1);
      } else if (c1 > 191 && c1 < 224) {
        var c2 = this._data.getUint8( this._ptr++, littleEndian );
        out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
      } else {
        var c2 = this._data.getUint8( this._ptr++, littleEndian );
        var c3 = this._data.getUint8( this._ptr++, littleEndian );
        out[c++] = String.fromCharCode(
            (c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63
        );
      }
    }
    return out.join('');
  };


  UNCOMPRESSED = 0;
  DEFLATE = 1;
  LZMA = 2;



  AWD_FIELD_INT8 = 1;
  AWD_FIELD_INT16 = 2;
  AWD_FIELD_INT32 = 3;
  AWD_FIELD_UINT8 = 4;
  AWD_FIELD_UINT16 = 5;
  AWD_FIELD_UINT32 = 6;
  AWD_FIELD_FLOAT32 = 7;
  AWD_FIELD_FLOAT64 = 8;

  AWD_FIELD_BOOL = 21;
  AWD_FIELD_COLOR = 22;
  AWD_FIELD_BADDR = 23;

  AWD_FIELD_STRING = 31;
  AWD_FIELD_BYTEARRAY = 32;

  AWD_FIELD_VECTOR2x1 = 41;
  AWD_FIELD_VECTOR3x1 = 42;
  AWD_FIELD_VECTOR4x1 = 43;
  AWD_FIELD_MTX3x2 = 44;
  AWD_FIELD_MTX3x3 = 45;
  AWD_FIELD_MTX4x3 = 46;
  AWD_FIELD_MTX4x4 = 47;




  BOOL       = 21;
  COLOR      = 22;
  BADDR      = 23;


  INT8    = 1;
  INT16   = 2;
  INT32   = 3;
  UINT8   = 4;
  UINT16  = 5;
  UINT32  = 6;
  FLOAT32 = 7;
  FLOAT64 = 8;


  AWDBlock = function()
  {
    var id;
    var data;
  }

  AWDBlock.prototype.constructor = AWDBlock;


  AWDProperties = function(){}

  AWDProperties.prototype = {


    set : function(key, value)
    {
      this[key] = value;
    },

    get : function(key, fallback)
    {
      if ( this.hasOwnProperty(key) )
        return this[key];
      else return fallback;
    }
  }

  return AWDLoader;

})();