var Editor = function ( scene ) {

  this.geometries = {};
  this.materials = {};
  this.textures = {};
  this.objects = {};

  this.selected = {};
  this.helpers = {};

  this.scene = new THREE.Scene();
  this.scene.name = ( scene && scene.name ) ? scene.name : 'Scene';
  this.addObject( this.scene );
  
  this.sceneHelpers = new THREE.Scene();

  this.defaultMaterial = new THREE.MeshPhongMaterial();
  this.defaultMaterial.name = 'Default Material';
  this.addMaterial( this.defaultMaterial );

}

Editor.prototype = {

  // Assets

  setScene: function( scene ) {

    this.deleteAll(); // WARNING! deletes everything 

    if ( scene ) {

      this.scene.name = scene.name ? scene.name : 'Scene';
      this.scene.userData = JSON.parse( JSON.stringify( scene.userData ) );

      if ( scene.children.length ) this.addObject( scene.children );

    }

    signals.sceneChanged.dispatch( this.scene );

    return this.scene 

  },

  createObject: function( type, parameters, material ) {

    type = type ? type : 'Group';

    var object;
    var geometry;

    material = material ? material : this.defaultMaterial;

    parameters = parameters ? parameters : {};

    var name = parameters.name ? parameters.name : this.incrementName( type, 'object' );
    var color = parameters.color ? parameters.color : null;
    var groundColor = parameters.groundColor ? parameters.groundColor : null;
    var intensity = parameters.intensity ? parameters.intensity : null;
    var distance = parameters.distance ? parameters.distance : null;
    var angle = parameters.angle ? parameters.angle : null;
    var exponent = parameters.exponent ? parameters.exponent : null;

    if ( type == 'Group' ) {

      object = new THREE.Object3D();

    } else if ( type == 'Plane' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );

      object.rotation.x = - Math.PI/2;

    } else if ( type == 'Cube' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );

    } else if ( type == 'Cylinder' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );

    } else if ( type == 'Sphere' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );

    } else if ( type == 'Icosahedron' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );

    } else if ( type == 'Torus' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );
      
    } else if ( type == 'TorusKnot' ) {

      geometry = this.createGeometry( type, parameters );
      object = new THREE.Mesh( geometry, this.defaultMaterial );

    } else if ( type == 'PointLight' ) {

      color = color ? color : 0xffffff;
      intensity = intensity ? intensity : 1;
      distance = distance ? distance : 0;

      object = new THREE.PointLight( color, intensity, distance );

    } else if ( type == 'SpotLight' ) {

      color = color ? color : 0xffffff;
      intensity = intensity ? intensity : 1;
      distance = distance ? distance : 0;
      angle = angle ? angle : Math.PI * 0.1;
      exponent = exponent ? exponent : 10;

      object = new THREE.SpotLight( color, intensity, distance, angle, exponent );
      object.target.name = object.name + ' Target';

      object.position.set( 0, 1, 0 ).multiplyScalar( 200 );

    } else if ( type == 'DirectionalLight' ) {

      color = color ? color : 0xffffff;
      intensity = intensity ? intensity : 1;

      object = new THREE.DirectionalLight( color, intensity );
      object.target.name = object.name + ' Target';

      object.position.set( 1, 1, 1 ).multiplyScalar( 200 );

    } else if ( type == 'HemisphereLight' ) {

      color = color ? color : 0x00aaff;
      groundColor = groundColor ? groundColor : 0xffaa00;
      intensity = intensity ? intensity : 1;

      object = new THREE.HemisphereLight( color, groundColor, intensity );

      object.position.set( 1, 1, 1 ).multiplyScalar( 200 );

    } else if ( type == 'AmbientLight' ) {

      color = color ? color : 0x222222;

      object = new THREE.AmbientLight( color );

    }

    object.name = name;
    this.addObject( object );

    return object;

  },

  createGeometry: function( type, parameters ) {

    type = type ? type : 'Geometry';
    parameters = parameters ? parameters : {};

    var name = parameters.name ? parameters.name : this.incrementName( type + 'Geometry', 'geometry' );
    var width = parameters.width ? parameters.width : null;
    var height = parameters.height ? parameters.height : null;
    var depth = parameters.depth ? parameters.depth : null;
    var widthSegments = parameters.widthSegments ? parameters.widthSegments : null;
    var heightSegments = parameters.heightSegments ? parameters.heightSegments : null;
    var depthSegments = parameters.depthSegments ? parameters.depthSegments : null;
    var radialSegments = parameters.radialSegments ? parameters.radialSegments : null;
    var tubularSegments = parameters.tubularSegments ? parameters.tubularSegments : null;
    var radius = parameters.radius ? parameters.radius : null;
    var radiusTop = parameters.radiusTop ? parameters.radiusTop : null;
    var radiusBottom = parameters.radiusBottom ? parameters.radiusBottom : null;
    var phiStart = parameters.phiStart ? parameters.phiStart : null;
    var phiLength = parameters.phiLength ? parameters.phiLength : null;
    var thetaStart = parameters.thetaStart ? parameters.thetaStart : null;
    var thetaLength = parameters.thetaLength ? parameters.thetaLength : null;
    var tube = parameters.tube ? parameters.tube : null;
    var arc = parameters.arc ? parameters.arc : null;
    var detail = parameters.detail ? parameters.detail : null;
    var p = parameters.p ? parameters.p : null;
    var q = parameters.q ? parameters.q : null;
    var heightScale = parameters.heightScale ? parameters.heightScale : null;
    var openEnded = parameters.openEnded ? parameters.openEnded : false;

    var geometry;

    if ( type == 'Geometry' ) {

      geometry = new THREE.Geometry();

    } else if ( type == 'Plane' ) {

      width = width ? width : 200;
      height = height ? height : 200;
      widthSegments = widthSegments ? widthSegments : 1;
      heightSegments = heightSegments ? heightSegments : 1;

      geometry = new THREE.PlaneGeometry( width, height, widthSegments, heightSegments );

    } else if ( type == 'Cube' ) {

      width = width ? width : 100;
      height = height ? height : 100;
      depth = depth ? depth : 100;
      widthSegments = widthSegments ? widthSegments : 1;
      heightSegments = heightSegments ? heightSegments : 1;
      depthSegments = depthSegments ? depthSegments : 1;

      geometry = new THREE.CubeGeometry( width, height, depth, widthSegments, heightSegments, depthSegments );

    } else if ( type == 'Cylinder' ) {

      radiusTop = radiusTop ? radiusTop : 20;
      radiusBottom = radiusBottom ? radiusBottom : 20;
      height = height ? height : 100;
      radialSegments = radialSegments ? radialSegments : 8;
      heightSegments = heightSegments ? heightSegments : 1;
      openEnded = openEnded ? openEnded : false;

      geometry = new THREE.CylinderGeometry( radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded );

    } else if ( type == 'Sphere' ) {

      radius = radius ? radius : 75;
      widthSegments = widthSegments ? widthSegments : 32;
      heightSegments = heightSegments ? heightSegments : 16;
      widthSegments = widthSegments ? widthSegments : 32;
      heightSegments = heightSegments ? heightSegments : 16;
      phiStart = phiStart ? phiStart : 0;
      phiLength = phiLength ? phiLength : Math.PI * 2;
      thetaStart = thetaStart ? thetaStart : 0;
      thetaLength = thetaLength ? thetaLength : Math.PI;

      geometry = new THREE.SphereGeometry( radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength );

    } else if ( type == 'Icosahedron' ) {

      radius = radius ? radius : 75;
      detail = detail ? detail : 2;

      geometry = new THREE.IcosahedronGeometry ( radius, detail );

    } else if ( type == 'Torus' ) {

      radius = radius ? radius : 100;
      tube = tube ? tube : 40;
      radialSegments = radialSegments ? radialSegments : 8;
      tubularSegments = tubularSegments ? tubularSegments : 6;
      arc = arc ? arc : Math.PI * 2;

      geometry = new THREE.TorusGeometry( radius, tube, radialSegments, tubularSegments, arc );

    } else if ( type == 'TorusKnot' ) {

      radius = radius ? radius : 100;
      tube = tube ? tube : 40;
      radialSegments = radialSegments ? radialSegments : 64;
      tubularSegments = tubularSegments ? tubularSegments : 8;
      p = p ? p : 2;
      q = q ? q : 3;
      heightScale = heightScale ? heightScale : 1;

      geometry = new THREE.TorusKnotGeometry( radius, tube, radialSegments, tubularSegments, p, q, heightScale );

    }

    geometry.name = name;
    geometry.computeBoundingSphere();

    return geometry;

  },

  createMaterial: function( type, parameters ) {
    
    type = type ? type : 'MeshPhongMaterial';

    parameters = parameters ? parameters : {};

    var material;
    var name = parameters.name ? parameters.name : this.incrementName( type, 'material' );

    if ( type == 'MeshPhongMaterial' ) {

      material = new THREE.MeshPhongMaterial( parameters );

    } else if ( type == 'MeshLambertMaterial' ) {

      material = new THREE.MeshLambertMaterial( parameters );

    } else if ( type == 'MeshNormalMaterial' ) {

      material = new THREE.MeshNormalMaterial( parameters );

    } else if ( type == 'MeshBasicMaterial' ) {

      material = new THREE.MeshBasicMaterial( parameters );

    }

    material.name = name;
    this.addMaterial( material );
    return material;

  },

  createTexture: function( image, parameters ) {

    image = image ? image : '../examples/textures/ash_uvgrid01.jpg';

    parameters = parameters ? parameters : {};

    // TODO: implement parameters

    var texture = THREE.ImageUtils.loadTexture( image );
    texture.name = parameters.name ? parameters.name : this.incrementName( 'Texture', 'texture' );

    this.addTexture( texture );
    return texture;

  },

  addObject: function( list, parent ) {

    list = ( list instanceof Array ) ? [].concat( list ) : [ list ];

    parent = parent ? parent : this.scene;

    for ( var i in list ) {

      this.objects[ list[ i ].id ] = list[ i ];
      this.addHelper( list[ i ] );

      if ( list[ i ].target ) {

        this.objects[ list[ i ].target.id ] = list[ i ].target;

      }

      if ( list[ i ].material ) this.addMaterial( list[ i ].material );
      if ( list[ i ].geometry ) this.addGeometry( list[ i ].geometry );

      if ( parent != list[ i ] ) {

        // Add object to the scene

        parent.add( list[ i ] );

        if ( list[ i ] instanceof THREE.Light ) this.updateMaterials();

        signals.objectAdded.dispatch( list[ i ] );

        // Continue adding children

        if ( list[ i ].children && list[ i ].children.length ) {

          this.addObject( list[ i ].children, list[ i ] );

        }

      }

    }

    signals.sceneChanged.dispatch( this.scene );

  },

  addHelper: function( object ) {

    if ( object instanceof THREE.PointLight ) {

      this.helpers[ object.id ] = new THREE.PointLightHelper( object, 10 );
      this.sceneHelpers.add( this.helpers[ object.id ] );
      this.helpers[ object.id ].lightSphere.id = object.id;

    } else if ( object instanceof THREE.DirectionalLight ) {

      this.helpers[ object.id ] = new THREE.DirectionalLightHelper( object, 10 );
      this.sceneHelpers.add( this.helpers[ object.id ] );
      this.helpers[ object.id ].lightSphere.id = object.id;

    } else if ( object instanceof THREE.SpotLight ) {

      this.helpers[ object.id ] = new THREE.SpotLightHelper( object, 10 );
      this.sceneHelpers.add( this.helpers[ object.id ] );
      // this.helpers[ object.id ].lightSphere.id = object.id;

    } else if ( object instanceof THREE.HemisphereLight ) {

      this.helpers[ object.id ] = new THREE.HemisphereLightHelper( object, 10 );
      this.sceneHelpers.add( this.helpers[ object.id ] );
      this.helpers[ object.id ].lightSphere.id = object.id;

    }

    signals.sceneChanged.dispatch( this.scene );

  },

  deleteHelper: function( object ) {

    if ( this.helpers[ object.id ] ) {

      this.helpers[ object.id ].parent.remove( this.helpers[ object.id ] );
      delete this.helpers[ object.id ];

    }

  },

  addGeometry: function( geometry ) {

    this.geometries[ geometry.id ] = geometry;
    signals.geometryAdded.dispatch( geometry );

  },

  addMaterial: function( material ) {

    if ( material.name == 'Default Material' ) {
      this.delete( this.defaultMaterial );
      this.defaultMaterial = material;
    }

    this.materials[ material.id ] = material;
    signals.materialAdded.dispatch( material );
    signals.sceneChanged.dispatch( this.scene );

  },

  addTexture: function( texture ) {

    this.textures[ texture.id ] = texture;
    signals.textureAdded.dispatch( texture );
    signals.sceneChanged.dispatch( this.scene );

  },

  // Selection

  select: function( list, additive ) {

    //TODO toggle

    list = ( list instanceof Array ) ? list : [ list ];

    if ( !additive ) this.selected = {};

    for ( var i in list ) {

      this.selected[ list[ i ].id ] = list[ i ];

    }

    signals.selected.dispatch( this.selected );

  },

  selectById: function( id, additive ) {

    var list = this.list();

    if ( !additive ) this.selected = {};

    for ( var i in list ) {

      if ( list[ i ].id == id ) this.select( list[ i ], true );

    }

  },

  selectByName: function( name, type, additive ) {

    type = type ? type : "all";

    this.select( this.listByName( name, type ), additive );

  },

  selectAll: function( type, additive ) {

    type = type ? type : "all";

    this.select( this.listByName( '*', type ), additive );

  },

  deselect: function( list ) {

    list = ( list instanceof Array ) ? list : [ list ];

    for ( var i in list ) {

      if ( this.selected[ list[ i ].id ] ) delete this.selected[ list[ i ].id ];

    }

    signals.selected.dispatch( this.selected );

  },

  deselectById: function( id ) {

    if ( this.selected[ id ] ) delete this.selected[ id ];

  },

  deselectByName: function( name, type ) {

    type = type ? type : "all";

    this.deselect( this.listByName( name, type ) );

  },

  deselectAll: function( type ) {

    type = type ? type : "all";

    this.deselect( this.list( "all" ) );

  },

  pickWalk: function( direction ) {

    direction = direction.toLowerCase();

    var selection = this.listSelected();
    var newSelection = [];

    if ( direction === 'up' ) {

      for ( var i in selection ) {

        if ( selection[ i ].parent )
          newSelection.push( selection[ i ].parent );
        
        else newSelection.push( selection[ i ] );

      }

    } else if ( direction === 'down' ) {

      for ( var i in selection ) {

        if ( selection[ i ].children && selection[ i ].children.length )
          newSelection.push( selection[ i ].children[0] );
        
        else newSelection.push( selection[ i ] );

      }

    } else if ( direction === 'left' || direction === 'right' ) {

      for ( var i in selection ) {

        var siblings = null;
        var index = null;
        var newIndex = null;

        if ( selection[ i ].parent ) {

          siblings = selection[ i ].parent.children;
          index = selection[ i ].parent.children.indexOf( selection[ i ] );
          newIndex = index;

          if ( siblings.length > 1 && direction === 'left' )
            newIndex = ( index + siblings.length + 1 ) % siblings.length;

          else if ( siblings.length > 1 && direction === 'right' )
            newIndex = ( index + siblings.length - 1 ) % siblings.length;
          
          newSelection.push( siblings[ newIndex ] );

        } else {

          newSelection.push( selection[ i ] );

        }

      }

    }

    if ( newSelection.length ) this.select( newSelection );

  },

  // List

  list: function( type ) {

    type = type ? type : "all";

    var list = this.listByName( '*', type );

    return list;

  },

  listSelected: function( type ) {

    var list = this.listByName( '*', 'selected' );

    if ( type ) {

      var typeList = this.listByName( '*', type );

      var list = list.filter(function(n) {
        if(typeList.indexOf(n) == -1) return false;
        return true;
      });

    } 

    return list;

  },

  listByName: function( name, type ) {

    type = type ? type.toLowerCase() : "all";

    var scope = this;
    var list = [];

    function listFromMap( map, name ) {

      for ( var id in map ) {

        if ( scope.regexMatch( map[ id ].name, name ) ) {

          list.push( map[ id ] );

        }


      }

    }
    
    if ( type == 'all' || type == 'object' ) {

      listFromMap( this.objects, name );

    }

    if ( type == 'all' || type == 'geometry' ) {

      listFromMap( this.geometries, name );

    }

    if ( type == 'all' || type == 'material' ) {

      listFromMap( this.materials, name );

    }

    if ( type == 'all' || type == 'texture' ) {

      listFromMap( this.textures, name );

    }

    if ( type == 'all' || type == 'selected' ) {

      listFromMap( this.selected, name );

    }

    return list;

  },

  // Delete

  delete: function( list ) {

    list = list ? list : this.list( 'selected' );

    list = ( list instanceof Array ) ? list : [ list ];

    this.deselect( list );

    var deletedObjects = {};

    for ( var i in list ) {
      
      if ( this.objects[ list[ i ].id ] && list[ i ] != this.scene ) {

        delete this.objects[ list[ i ].id ];
        this.deleteHelper( list[ i ] );

        deletedObjects[ list[ i ].id ] = list[ i ];

        if ( list[ i ] instanceof THREE.Light ) this.updateMaterials();

        signals.objectDeleted.dispatch();

        if ( list[ i ].children.length ) this.delete( list[ i ].children );
      
      }

      if ( this.geometries[ list[ i ].id ] ) {

        delete this.geometries[ list[ i ].id ];
        signals.objectDeleted.dispatch();

      } 

      if ( this.materials[ list[ i ].id ] ) {
      
        delete this.materials[ list[ i ].id ];
        signals.materialDeleted.dispatch();
      
      }

      if ( this.textures[ list[ i ].id ] ) {

        delete this.textures[ list[ i ].id ];
        signals.textureDeleted.dispatch();

      }

    } 

    for ( var i in deletedObjects ) {

        if ( deletedObjects[ i ].parent ) {
        
          deletedObjects[ i ].parent.remove( deletedObjects[ i ] );
        
        }

    }

    delete deletedObjects;

    signals.sceneChanged.dispatch( this.scene );

  },

  deleteByName: function( name, type ) {

    type = type ? type : "all";

    this.delete( this.listByName( name, type ) );

  },

  deleteAll: function( type ) {

    type = type ? type : 'all';

    this.delete( this.listByName( '*', type ) );

  },

  deleteUnused: function( type ) {

    // TODO: test with textures

    type = type ? type.toLowerCase() : 'all';

    var used = {};

    this.scene.traverse( function( object ) {

      used[ object.id ] = object; 

      if ( object.geometry ) used[ object.geometry.id ] = object.geometry; 

      if ( object.material ) {

        used[ object.material.id ] = object.material;

        for ( var i in object.material ){

          if ( object.material[ i ] instanceof THREE.Texture ) {

            used[ object.material[ i ].id ] = object.material[ i ];

          }

        }

      }

    } );

    if ( !type || type == 'object' ) {
      for ( var id in this.objects ) {
        if ( !used[ id ] ) this.delete( this.objects[ id ] );
      }
    }

    if ( !type || type == 'geometry' ) {
      for ( var id in this.geometries ) {
        if ( !used[ id ] ) this.delete( this.geometries[ id ] );
      }
    }

    if ( !type || type == 'material' ) {
      for ( var id in this.materials ) {
        if ( !used[ id ] ) this.delete( this.materials[ id ] );
      }
    }

    if ( !type || type == 'texture' ) {
      for ( var id in this.textures ) {
        if ( !used[ id ] ) this.delete( this.textures[ id ] );
      }
    }

    delete used;

  },

  // Hierarchy

  clone: function( assets, recursive, deep ) {

    // TODO: consider using list

    // TODO: Implement non-recursive and deep

    var assets = assets ? assets : this.selected;
    // recursive = recursive ? recursive : true;
    // deep = deep ? deep : false;

    var clones = {};

    for ( var i in assets ){

      if ( this.objects[ i ] ) {

        var clonedObject = this.objects[assets[ i ].id ].clone();

        clonedObject.traverse( function( child ) {

          child.name += ' Clone';

        } );

        this.addObject( clonedObject, assets[ i ].parent );
        clones[ clonedObject.id ] = clonedObject;

      }

    }
      
    return clones;

  },

  parent: function( list, parent, locked ) {

    //TODO: implement locked

    list = list ? list : this.list( 'selected' );

    list = ( list instanceof Array ) ? list : [ list ];

    parent = parent ? parent : this.scene;

    for ( var i in list ) {

      if ( list[ i ] !== parent && list[ i ] !== this.scene ) {

        parent.add( list[ i ] );
        signals.objectChanged.dispatch( list[ i ] );

      }

    }

    signals.sceneChanged.dispatch( this.scene );

  },
  
  unparent: function( list ) {

    this.parent( list, this.scene );

  },

  group: function( list ) {

    list = list ? list : this.listSelected( 'objects' );

    list = ( list instanceof Array ) ? list : [ list ];

    var parent = ( list.length && list[0].parent ) ? list[0].parent : this.scene;

    var group = this.createObject();

    this.parent( group, parent );

    this.parent( list, group );

  },

  // Utils

  updateObject: function( object, parameters ) {

    parameters = parameters ? parameters : {};

    if ( parameters.parent && object.parent && object.parent != parameters.parent)
      editor.parent( object, parameters.parent );

    if ( parameters.geometry && object.geometry && object.geometry != parameters.geometry) {
      object.geometry = parameters.geometry;
      this.updateGeometry( object.geometry );
    }

    if ( parameters.material && object.material && object.material != parameters.material)
      object.material = parameters.material;

    if ( parameters.name !== undefined ) object.name = parameters.name;

    if ( parameters.position !== undefined ) object.position = parameters.position;
    if ( parameters.rotation !== undefined ) object.rotation = parameters.rotation;
    if ( parameters.scale !== undefined ) object.scale = parameters.scale;

    if ( object.fov !== undefined && parameters.fov !== undefined ) object.fov = parameters.fov;
    if ( object.near !== undefined && parameters.near !== undefined ) object.near = parameters.near;
    if ( object.far !== undefined && parameters.far !== undefined ) object.far = parameters.far;
    if ( object.intensity !== undefined && parameters.intensity !== undefined ) object.intensity = parameters.intensity;

    if ( object.color && parameters.color !== undefined ) object.color.setHex( parameters.color );
    if ( object.groundColor && parameters.groundColor !== undefined ) object.groundColor.setHex( parameters.groundColor );

    if ( object.distance !== undefined && parameters.distance !== undefined ) object.distance = parameters.distance;
    if ( object.angle !== undefined && parameters.angle !== undefined ) object.angle = parameters.angle;
    if ( object.exponent !== undefined && parameters.exponent !== undefined ) object.exponent = parameters.exponent;
    if ( object.visible !== undefined && parameters.visible !== undefined ) object.visible = parameters.visible;
    
    if ( parameters.userData !== undefined ) {

      try {

        object.userData = JSON.parse( parameters.userData );

      } catch ( error ) {

       console.log( error );

      }

    };

    if ( object.updateProjectionMatrix ) object.updateProjectionMatrix();

    signals.objectChanged.dispatch( object );

  },

  updateMaterials: function( list ) {

    list = list ? list : this.list( 'material' );

    list = ( list instanceof Array ) ? list : [ list ];

    for ( var i in list ) {

      list[ i ].needsUpdate = true;

      if ( list[ i ] instanceof THREE.MeshFaceMaterial ) {

        for ( var j in list[ i ].materials ) {

          list[ i ].materials[ j ].needsUpdate = true;

        }

      }

    }

  },

  updateGeometry: function( geometry, parameters ) {

    parameters = parameters ? parameters : {};

    var id = geometry.id;
    var name = geometry.name;

    if ( geometry instanceof THREE.PlaneGeometry )
      geometry = this.createGeometry( 'plane', parameters );

    if ( geometry instanceof THREE.CubeGeometry )
      geometry = this.createGeometry( 'cube', parameters );

    if ( geometry instanceof THREE.CylinderGeometry )
      geometry = this.createGeometry( 'cylinder', parameters );

    if ( geometry instanceof THREE.SphereGeometry )
      geometry = this.createGeometry( 'sphere', parameters );

    if ( geometry instanceof THREE.IcosahedronGeometry )
      geometry = this.createGeometry( 'icosahedron', parameters );

    if ( geometry instanceof THREE.TorusGeometry )
      geometry = this.createGeometry( 'torus', parameters );

    if ( geometry instanceof THREE.TorusKnotGeometry )
      geometry = this.createGeometry( 'torusknot', parameters );

    geometry.computeBoundingSphere();
    geometry.id = id;
    geometry.name = name;

    for ( var i in editor.objects ) {

      var object = editor.objects[i];

      if ( object.geometry && object.geometry.id == id ) {

        delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)
        object.geometry.dispose();

        object.geometry = geometry;

        signals.objectChanged.dispatch( object );

      }

    }

  },

  setFog: function( parameters ) {

    var fogType = parameters.fogType ? parameters.fogType : null;
    var near = parameters.near ? parameters.near : null;
    var far = parameters.far ? parameters.far : null;
    var density = parameters.density ? parameters.density : null;
    var color = parameters.color ? parameters.color : null;

    if ( fogType ) {

      if ( fogType === "None" ) this.scene.fog = null;

      else if ( fogType === "Fog" ) this.scene.fog = new THREE.Fog();

      else if ( fogType === "FogExp2" ) this.scene.fog = new THREE.FogExp2();

    }

    if ( this.scene.fog ) {

      if ( fogType ) this.scene.fog.fogType = fogType;
      if ( near ) this.scene.fog.near = near;
      if ( far ) this.scene.fog.far = far;
      if ( density ) this.scene.fog.density = density;
      if ( color ) this.scene.fog.color.setHex( color );

    }

    this.updateMaterials();
    signals.fogChanged.dispatch( this.scene.fog );

  },

  regexMatch: function( name, filter ) {

    name = name.toLowerCase();
    filter = '^' + filter.toLowerCase().replace(/\*/g, '.*').replace(/\?/g, '.') + '$';

    var regex = new RegExp(filter);
    return regex.test( name );

  },

  incrementName: function( name, type ) {

    var list = this.listByName( name+'\\d+', type );
    var lastIncrement = 0;

    for ( var i in list ) {
      var Increment = parseFloat( list[i].name.replace( name, '' ) );
      if ( Increment > lastIncrement ) lastIncrement = Increment;
    }
    
    return name + ( lastIncrement + 1 );

  }

}