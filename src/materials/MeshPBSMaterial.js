THREE.MeshPBSMaterial = function ( parameters ) {

    THREE.Material.call( this );

    this.type = 'MeshPBSMaterial';

    this.environment = {'map': null, 'intensity' : 1 };
    this.albedo = new THREE.Color( 0xffffff );
    this.roughness = 0.1;
    this.lightRoughnessOffset = 0;
    this.f0 = new THREE.Color( 0x191919 );

    this.mainmaps = {
        'albedo' : {'map': null, 'blend' : 0, 'blendop' : 0 },
        'normalr' : {'map': null, 'blend1' : 0, 'blend2' : 0 },
        'f0' : {'map': null, 'blend' : 0, 'blendop' : 0 },
        'tiling' : new THREE.Vector2(1, 1),
        'offset' : new THREE.Vector2(0, 0),
        'uvset' : {'slot' : 0 }
    };

    this.detailmap0 = {
        'enabled' : false,
        'albedo' : {'map': null, 'blend' : 0, 'blendop' : 0 },
        'normalr' : {'map': null, 'blend1' : 0, 'blend2' : 0 },
        'f0' : {'map': null, 'blend' : 0, 'blendop' : 0 },
        'tiling' : new THREE.Vector2(1, 1),
        'offset' : new THREE.Vector2(0, 0),
        'uvset' : {'slot' : 0 }
    };

    this.detailmap1 = {
        'enabled' : false,
        'albedo' : {'map': null, 'blend' : 0, 'blendop' : 0 },
        'normalr' : {'map': null, 'blend1' : 0, 'blend2' : 0 },
        'f0' : {'map': null, 'blend' : 0, 'blendop' : 0 },
        'tiling' : new THREE.Vector2(1, 1),
        'offset' : new THREE.Vector2(0, 0),
        'uvset' : {'slot' : 0 }
    };


    this.shading = THREE.SmoothShading;

    this.wireframe = false;
    this.wireframeLinewidth = 1;
    this.wireframeLinecap = 'round';
    this.wireframeLinejoin = 'round';

    this.vertexColors = THREE.NoColors;

    this.skinning = false;
    this.morphTargets = false;
    this.morphNormals = false;

    this.setValues( parameters );

};

THREE.MeshPBSMaterial.prototype = Object.create( THREE.Material.prototype );
THREE.MeshPBSMaterial.prototype.constructor = THREE.MeshPBSMaterial;

THREE.MeshPBSMaterial.prototype.clone = function () {

    var material = new THREE.MeshPBSMaterial();

    THREE.Material.prototype.clone.call( this, material );

    material.environment = this.environment;
    material.albedo.copy(this.albedo);
    material.roughness = this.roughness;
    material.lightRoughnessOffset = this.lightRoughnessOffset;
    material.f0.copy(this.f0);

    material.mainmaps = {
        'albedo' : {'map': this.mainmaps.albedo.map, 'wrapt' : this.mainmaps.albedo.wrapt, 'wraps' : this.mainmaps.albedo.wraps, 'blend' : this.mainmaps.albedo.blend, 'blendop' : this.mainmaps.albedo.blendop },
        'normalr' : {'map': this.mainmaps.normalr.map, 'wrapt' : this.mainmaps.normalr.wrapt, 'wraps' : this.mainmaps.normalr.wraps, 'blend1' : this.mainmaps.normalr.blend1, 'blend2' : this.mainmaps.normalr.blend2 },
        'f0' : {'map': this.mainmaps.f0.map, 'wrapt' : this.mainmaps.f0.wrapt, 'wraps' : this.mainmaps.f0.wraps, 'blend' : this.mainmaps.f0.blend, 'blendop' : this.mainmaps.f0.blendop },
        'tiling' : {'x': this.mainmaps.tiling.x, 'y': this.mainmaps.tiling.y},
        'offset' : {'x': this.mainmaps.offset.x, 'y': this.mainmaps.offset.y},
        'uvset' : {'slot' : this.mainmaps.uvset.slot }
    };

    material.detailmap0 = {
        'enabled' : false,
        'albedo' : {'map': this.detailmap0.albedo.map, 'wrapt' : this.detailmap0.albedo.wrapt, 'wraps' : this.detailmap0.albedo.wraps, 'blend' : this.detailmap0.albedo.blend, 'blendop' : this.detailmap0.albedo.blendop },
        'normalr' : {'map': this.detailmap0.normalr.map, 'wrapt' : this.detailmap0.normalr.wrapt, 'wraps' : this.detailmap0.normalr.wraps, 'blend1' : this.detailmap0.normalr.blend1, 'blend2' : this.detailmap0.normalr.blend2 },
        'f0' : {'map': this.detailmap0.f0.map, 'wrapt' : this.detailmap0.f0.wrapt, 'wraps' : this.detailmap0.f0.wraps, 'blend' : this.detailmap0.f0.blend, 'blendop' : this.detailmap0.f0.blendop },
        'tiling' : {'x': this.detailmap0.tiling.x, 'y': this.detailmap0.tiling.y},
        'offset' : {'x': this.detailmap0.offset.x, 'y': this.detailmap0.offset.y},
        'uvset' : {'slot' : this.detailmap0.uvset.slot }
    };

    material.detailmap1 = {
        'enabled' : false,
        'albedo' : {'map': this.detailmap1.albedo.map, 'wrapt' : this.detailmap1.albedo.wrapt, 'wraps' : this.detailmap1.albedo.wraps, 'blend' : this.detailmap1.albedo.blend, 'blendop' : this.detailmap1.albedo.blendop },
        'normalr' : {'map': this.detailmap1.normalr.map, 'wrapt' : this.detailmap1.normalr.wrapt, 'wraps' : this.detailmap1.normalr.wraps, 'blend1' : this.detailmap1.normalr.blend1, 'blend2' : this.detailmap1.normalr.blend2 },
        'f0' : {'map': this.detailmap1.f0.map, 'wrapt' : this.detailmap1.f0.wrapt, 'wraps' : this.detailmap1.f0.wraps, 'blend' : this.detailmap1.f0.blend, 'blendop' : this.detailmap1.f0.blendop },
        'tiling' : {'x': this.detailmap1.tiling.x, 'y': this.detailmap1.tiling.y},
        'offset' : {'x': this.detailmap1.offset.x, 'y': this.detailmap1.offset.y},
        'uvset' : {'slot' : this.detailmap1.uvset.slot }
    };

    material.shading = this.shading;

    material.wireframe = this.wireframe;
    material.wireframeLinewidth = this.wireframeLinewidth;
    material.wireframeLinecap = this.wireframeLinecap;
    material.wireframeLinejoin = this.wireframeLinejoin;

    material.vertexColors = this.vertexColors;

    material.skinning = this.skinning;
    material.morphTargets = this.morphTargets;
    material.morphNormals = this.morphNormals;

    return material;

};