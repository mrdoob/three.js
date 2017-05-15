function obj2bin(input) {
    // simple benchmarking
    var overAllStartTime;
    var startTime;
    function start() {
        startTime = new Date().getTime();
    }
    function duration() {
        return new Date().getTime() - startTime;
    }

    function status(msg) {
        console.log(msg);
    }
    
    overAllStartTime = new Date().getTime();
    status("Converting 1st pass");

    // faces: find blocks for handling relative indexing
    var faceblocks = [];
    var faceblock_idx = 0;
    var faceblock;
    pattern = /(f[\s\d-\/]+[\n\r])+/g;
    while ( ( result = pattern.exec( input ) ) != null ) {
    	faceblocks.push({v:-1, vn:-1, vt:-1, pos:pattern.lastIndex - result[0].length});
    }
    faceblocks.push({v:-1, vn:-1, vt:-1, pos:input.length});
    
    // positions
    start();
    faceblock_idx = 0;
    faceblock = faceblocks[0];
    // v float float float
    pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)[ \\\n\r]+([\d|\.|\+|\-|e]+)/g;
    var vcount = 0;
    while ( ( result = pattern.exec( input ) ) != null ) {
    	while ( pattern.lastIndex > faceblock.pos ) {
    		faceblock = faceblocks[++faceblock_idx];
    		faceblock.v = vcount;
    	}
        ++vcount;
    }
    faceblocks[++faceblock_idx].v = vcount;
    console.log("vcount: " + vcount);
    console.log(" duration: " + duration());
    
    // normals
    start();
    faceblock_idx = 0;
    faceblock = faceblocks[0];
    // vn float float float
    pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)[ \\\n\r]+([\d|\.|\+|\-|e]+)/g;
    var ncount = 0;
    while ( ( result = pattern.exec( input ) ) != null ) {
    	while ( pattern.lastIndex > faceblock.pos ) {
    		faceblock = faceblocks[++faceblock_idx];
    		faceblock.vn = ncount;
    	}
        ++ncount;
    }
    faceblocks[++faceblock_idx].vn = ncount;
    console.log("ncount: " + ncount);
    console.log(" duration: " + duration());

    // texcoords
    start();
    faceblock_idx = 0;
    faceblock = faceblocks[0];
    // vt float float
    pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;
    var tcount = 0;
    while ( ( result = pattern.exec( input ) ) != null ) {
    	while ( pattern.lastIndex > faceblock.pos ) {
    		faceblock = faceblocks[++faceblock_idx];
    		faceblock.vt = tcount;
    	}
        ++tcount;
    }
    faceblocks[++faceblock_idx].vt = tcount;
    console.log("tcount: " + tcount);
    console.log(" duration: " + duration());

    // materials
    pattern = /usemtl (.+)/g;
    var materials = [];
    var material_pos = [];
    while ( ( result = pattern.exec( input ) ) != null ) {
        var name = result[1];
        var index = materials.indexOf(name);
        if(index < 0) {
            index = materials.length;
            materials.push(name);
        }
        material_pos.push({index:index, pos:pattern.lastIndex});
    }
    material_pos.push({index:0, pos:input.length});
    console.log('materials: ' + JSON.stringify(materials));
    console.log('material_pos: ' + JSON.stringify(material_pos));
    
    console.log('faceblocks: ' + JSON.stringify(faceblocks));

    // faces:
    start();
    // f pos/uv?/normal? pos/uv?/normal? ...
    pattern = /f +((-?\d+(\/(-?\d+)?)?(\/-?\d+)?[ \\\n\r]*)+)/g;
    var f3_count = [0, 0, 0, 0];
    var f4_count = [0, 0, 0, 0];
    
    var FTYPE_POS = 0;
    var FTYPE_POS_UV = 1;
    var FTYPE_POS_NORM = 2;
    var FTYPE_POS_UV_NORM = 3;

    var verts;
    var vert;
    var type;
    
    while ( ( result = pattern.exec( input ) ) != null ) {
        verts = result[1].trim().split(/[ \\\n\r]+/);
        vert = verts[0].split('/');
        
        type = 0;
        if(!!vert[1]) type |= FTYPE_POS_UV;
        if(!!vert[2]) type |= FTYPE_POS_NORM;
        
        if(verts.length == 3) {
            ++f3_count[type];
        } else if (verts.length == 4) {
            ++f4_count[type];
        } else if (verts.length > 4) {
            f3_count[type] += verts.length - 2;
        }
    }
    
    console.log("tris (pos): " + f3_count[FTYPE_POS]);
    console.log("quads (pos): " + f4_count[FTYPE_POS]);
    console.log("tris (pos,uv): " + f3_count[FTYPE_POS_UV]);
    console.log("quads (pos,uv): " + f4_count[FTYPE_POS_UV]);
    console.log("tris (pos,norm): " + f3_count[FTYPE_POS_NORM]);
    console.log("quads (pos,norm): " + f4_count[FTYPE_POS_NORM]);
    console.log("tris (pos,uv,norm): " + f3_count[FTYPE_POS_UV_NORM]);
    console.log("quads (pos,uv,norm): " + f4_count[FTYPE_POS_UV_NORM]);

    console.log(" duration: " + duration());

    status("Converting 2nd pass");
    // PASS 2
    function handlePadding( n ) {
        return ( n % 4 ) ? ( 4 - n % 4 ) : 0;
    }
    
    function addPadding(size) {
        return size + handlePadding(size);
    }
    
    function writeString(buffer, offset, str) {
        var charArray = new Uint8Array(buffer, offset, str.length);
        for(var i = 0; i < str.length; ++i) {
            charArray[i] = str.charCodeAt(i);
        }
    }
    
    function writeUint8(buffer, offset, value) {
        var charArray = new Uint8Array(buffer, offset, 1);
        charArray[0] = value;
    }
    
    function writeUint32(buffer, offset, value) {
        var intArray = new Uint32Array(buffer, offset, 1);
        intArray[0] = value;
    }
    
    var total_size = 0x40; // header
    var pos_start = total_size;
    total_size += (3 * 4) * vcount;
    var norm_start = total_size;
    total_size += addPadding(3 * ncount);
    var uv_start = total_size;
    total_size += (2 * 4) * tcount;
    
    var f3_start = [0,0,0,0];
    var f4_start = [0,0,0,0];
    
    f3_start[FTYPE_POS] = total_size;
    total_size += addPadding((3 * 4 + 2) * f3_count[FTYPE_POS]);
    f3_start[FTYPE_POS_NORM] = total_size;
    total_size += addPadding((3 * (4 + 4) + 2) * f3_count[FTYPE_POS_NORM]);
    f3_start[FTYPE_POS_UV] = total_size;
    total_size += addPadding((3 * (4 + 4) + 2) * f3_count[FTYPE_POS_UV]);
    f3_start[FTYPE_POS_UV_NORM] = total_size;
    total_size += addPadding((3 * (4 + 4 + 4) + 2) * f3_count[FTYPE_POS_UV_NORM]);
    
    f4_start[FTYPE_POS] = total_size;
    total_size += addPadding((4 * 4 + 2) * f4_count[FTYPE_POS]);
    f4_start[FTYPE_POS_NORM] = total_size;
    total_size += addPadding((4 * (4 + 4) + 2) * f4_count[FTYPE_POS_NORM]);
    f4_start[FTYPE_POS_UV] = total_size;
    total_size += addPadding((4 * (4 + 4) + 2) * f4_count[FTYPE_POS_UV]);
    f4_start[FTYPE_POS_UV_NORM] = total_size;
    total_size += addPadding((4 * (4 + 4 + 4) + 2) * f4_count[FTYPE_POS_UV_NORM]);
    console.log("total size: " + total_size);
    var buffer = new ArrayBuffer(total_size);
    
    // header
    writeString(buffer, 0, "Three.js 003");
    writeUint8(buffer, 12, 64); // header bytes
    
    writeUint8(buffer, 13, 4); // pos bytes
    writeUint8(buffer, 14, 1); // normal bytes
    writeUint8(buffer, 15, 4); // uv bytes
    
    writeUint8(buffer, 16, 4); // pos index bytes
    writeUint8(buffer, 17, 4); // normal index bytes
    writeUint8(buffer, 18, 4); // uv index bytes
    writeUint8(buffer, 19, 2); // mat index bytes
    
    writeUint32(buffer, 20 + 4*0, vcount); // pos count
    writeUint32(buffer, 20 + 4*1, ncount); // normal count
    writeUint32(buffer, 20 + 4*2, tcount); // uv count
    
    writeUint32(buffer, 20 + 4*3, f3_count[FTYPE_POS]);
    writeUint32(buffer, 20 + 4*4, f3_count[FTYPE_POS_NORM]);
    writeUint32(buffer, 20 + 4*5, f3_count[FTYPE_POS_UV]);
    writeUint32(buffer, 20 + 4*6, f3_count[FTYPE_POS_UV_NORM]);
    
    writeUint32(buffer, 20 + 4*7, f4_count[FTYPE_POS]);
    writeUint32(buffer, 20 + 4*8, f4_count[FTYPE_POS_NORM]);
    writeUint32(buffer, 20 + 4*9, f4_count[FTYPE_POS_UV]);
    writeUint32(buffer, 20 + 4*10, f4_count[FTYPE_POS_UV_NORM]);
    
    // pos
    start();
    var posArray = new Float32Array(buffer, pos_start, 3 * vcount);
    var i = 0;
    // v float float float
    pattern = /v( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)[ \\\n\r]+([\d|\.|\+|\-|e]+)/g;
    var x, y, z;
    var xmin = ymin = zmin = Infinity;
    var xmax = ymax = zmax = -Infinity;
    while ( ( result = pattern.exec( input ) ) != null ) {
    	x = parseFloat( result[ 1 ] );
    	y = parseFloat( result[ 2 ] );
    	z = parseFloat( result[ 3 ] );
        posArray[i++] = x;
        posArray[i++] = y;
        posArray[i++] = z;
        xmin = Math.min(xmin, x);
        ymin = Math.min(ymin, y);
        zmin = Math.min(zmin, z);
        xmax = Math.max(xmax, x);
        ymax = Math.max(ymax, y);
        zmax = Math.max(zmax, z);
    }
    console.log("wrote positions: " + vcount);
    console.log(" duration: " + duration());
    var center_x = (xmin + xmax) / 2.0;
    var center_y = (ymin + ymax) / 2.0;
    var center_z = (zmin + zmax) / 2.0;
    console.log(" center: " + center_x + ", " + center_y + ", " + center_z);
    for(i = 0; i < 3 * vcount;) {
        posArray[i++] -= center_x;
        posArray[i++] -= center_y;
        posArray[i++] -= center_z;
    }

    // normals
    if(ncount > 0) {
        start();
        var normArray = new Int8Array(buffer, norm_start, 3 * ncount);
        var i = 0;
        var nx, ny, nz, nlen;
        // vn float float float
        pattern = /vn( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)[ \\\n\r]+([\d|\.|\+|\-|e]+)/g;
        while ( ( result = pattern.exec( input ) ) != null ) {
            nx = parseFloat( result[ 1 ] );
            ny = parseFloat( result[ 2 ] );
            nz = parseFloat( result[ 3 ] );
            nlen = nx * nx + ny * ny + nz * nz;
            if ( nlen > 0 ) {
                nlen = Math.sqrt(nlen);
            }
            normArray[i++] = nx / nlen * 127;
            normArray[i++] = ny / nlen * 127;
            normArray[i++] = nz / nlen * 127;
        }
        console.log("wrote normals: " + ncount);
        console.log(" duration: " + duration());
    }

    // uvs
    if(tcount > 0) {
        start();
        var uvArray = new Float32Array(buffer, uv_start, 2 * tcount);
        var i = 0;
        // vt float float
        pattern = /vt( +[\d|\.|\+|\-|e]+)( [\d|\.|\+|\-|e]+)/g;
        while ( ( result = pattern.exec( input ) ) != null ) {
            uvArray[i++] = parseFloat( result[ 1 ] );
            uvArray[i++] = 1.0 - parseFloat( result[ 2 ] );
        }
        console.log("wrote uvs: " + tcount);
        console.log(" duration: " + duration());
    }

    // faces
    start();
    var f3_pos_array = new Array(4);
    var f3_pos_offset = [0,0,0,0];
    var f3_norm_array = new Array(4);
    var f3_norm_offset = [0,0,0,0];
    var f3_uv_array = new Array(4);
    var f3_uv_offset = [0,0,0,0];
    var f3_mat_array = new Array(4);
    var f3_mat_offset = [0,0,0,0];
    
    var f4_pos_array = new Array(4);
    var f4_pos_offset = [0,0,0,0];
    var f4_norm_array = new Array(4);
    var f4_norm_offset = [0,0,0,0];
    var f4_uv_array = new Array(4);
    var f4_uv_offset = [0,0,0,0];
    var f4_mat_array = new Array(4);
    var f4_mat_offset = [0,0,0,0];
    
    var mat_index;
    var mat_pos_index;
    var next_mat_pos;
    
    // handles relative(negative) indices
    function calcIdx(str, offset) {
    	var idx = parseInt(str);
    	return idx > 0 ? idx -1 : idx + offset;
    }

    // setup arrays
    if(f3_count[FTYPE_POS] > 0 || f4_count[FTYPE_POS] > 0) {
        // pos
        f3_pos_array[FTYPE_POS] = new Uint32Array(buffer, f3_start[FTYPE_POS], f3_count[FTYPE_POS] * 3);
        f3_mat_array[FTYPE_POS] = new Uint16Array(buffer, f3_start[FTYPE_POS] + f3_count[FTYPE_POS] * 3 * 4, f3_count[FTYPE_POS]);
        f4_pos_array[FTYPE_POS] = new Uint32Array(buffer, f4_start[FTYPE_POS], f4_count[FTYPE_POS] * 4);
        f4_mat_array[FTYPE_POS] = new Uint16Array(buffer, f4_start[FTYPE_POS] + f4_count[FTYPE_POS] * 4 * 4, f4_count[FTYPE_POS]);
    }
    
    if(f3_count[FTYPE_POS_NORM] > 0 || f4_count[FTYPE_POS_NORM] > 0) {
        // pos, norm
        f3_pos_array[FTYPE_POS_NORM] = new Uint32Array(buffer, f3_start[FTYPE_POS_NORM], f3_count[FTYPE_POS_NORM] * 3);
        f3_norm_array[FTYPE_POS_NORM] = new Uint32Array(buffer, f3_start[FTYPE_POS_NORM] + f3_count[FTYPE_POS_NORM] * 3 * 4, f3_count[FTYPE_POS_NORM] * 3);
        f3_mat_array[FTYPE_POS_NORM] = new Uint16Array(buffer, f3_start[FTYPE_POS_NORM] + f3_count[FTYPE_POS_NORM] * 6 * 4, f3_count[FTYPE_POS_NORM]);
        f4_pos_array[FTYPE_POS_NORM] = new Uint32Array(buffer, f4_start[FTYPE_POS_NORM], f4_count[FTYPE_POS_NORM] * 4);
        f4_norm_array[FTYPE_POS_NORM] = new Uint32Array(buffer, f4_start[FTYPE_POS_NORM] + f4_count[FTYPE_POS_NORM] * 4 * 4, f4_count[FTYPE_POS_NORM] * 4);
        f4_mat_array[FTYPE_POS_NORM] = new Uint16Array(buffer, f4_start[FTYPE_POS_NORM] + f4_count[FTYPE_POS_NORM] * 8 * 4, f4_count[FTYPE_POS_NORM]);
    }
    
    if(f3_count[FTYPE_POS_UV] > 0 || f4_count[FTYPE_POS_UV] > 0) {
        // pos, uv
        f3_pos_array[FTYPE_POS_UV] = new Uint32Array(buffer, f3_start[FTYPE_POS_UV], f3_count[FTYPE_POS_UV] * 3);
        f3_uv_array[FTYPE_POS_UV] = new Uint32Array(buffer, f3_start[FTYPE_POS_UV] + f3_count[FTYPE_POS_UV] * 3 * 4, f3_count[FTYPE_POS_UV] * 3);
        f3_mat_array[FTYPE_POS_UV] = new Uint16Array(buffer, f3_start[FTYPE_POS_UV] + f3_count[FTYPE_POS_UV] * 6 * 4, f3_count[FTYPE_POS_UV]);
        f4_pos_array[FTYPE_POS_UV] = new Uint32Array(buffer, f4_start[FTYPE_POS_UV], f4_count[FTYPE_POS_UV] * 4);
        f4_uv_array[FTYPE_POS_UV] = new Uint32Array(buffer, f4_start[FTYPE_POS_UV] + f4_count[FTYPE_POS_UV] * 4 * 4, f4_count[FTYPE_POS_UV] * 4);
        f4_mat_array[FTYPE_POS_UV] = new Uint16Array(buffer, f4_start[FTYPE_POS_UV] + f4_count[FTYPE_POS_UV] * 8 * 4, f4_count[FTYPE_POS_UV]);
    }
    
    if(f3_count[FTYPE_POS_UV_NORM] > 0 || f4_count[FTYPE_POS_UV_NORM] > 0) {
        // pos, uv, norm
        f3_pos_array[FTYPE_POS_UV_NORM] = new Uint32Array(buffer, f3_start[FTYPE_POS_UV_NORM], f3_count[FTYPE_POS_UV_NORM] * 3);
        f3_norm_array[FTYPE_POS_UV_NORM] = new Uint32Array(buffer, f3_start[FTYPE_POS_UV_NORM] + f3_count[FTYPE_POS_UV_NORM] * 3 * 4, f3_count[FTYPE_POS_UV_NORM] * 3);
        f3_uv_array[FTYPE_POS_UV_NORM] = new Uint32Array(buffer, f3_start[FTYPE_POS_UV_NORM] + f3_count[FTYPE_POS_UV_NORM] * 6 * 4, f3_count[FTYPE_POS_UV_NORM] * 3);
        f3_mat_array[FTYPE_POS_UV_NORM] = new Uint16Array(buffer, f3_start[FTYPE_POS_UV_NORM] + f3_count[FTYPE_POS_UV_NORM] * 9 * 4, f3_count[FTYPE_POS_UV_NORM]);
        f4_pos_array[FTYPE_POS_UV_NORM] = new Uint32Array(buffer, f4_start[FTYPE_POS_UV_NORM], f4_count[FTYPE_POS_UV_NORM] * 4);
        f4_norm_array[FTYPE_POS_UV_NORM] = new Uint32Array(buffer, f4_start[FTYPE_POS_UV_NORM] + f4_count[FTYPE_POS_UV_NORM] * 4 * 4, f4_count[FTYPE_POS_UV_NORM] * 4);
        f4_uv_array[FTYPE_POS_UV_NORM] = new Uint32Array(buffer, f4_start[FTYPE_POS_UV_NORM] + f4_count[FTYPE_POS_UV_NORM] * 8 * 4, f4_count[FTYPE_POS_UV_NORM] * 4);
        f4_mat_array[FTYPE_POS_UV_NORM] = new Uint16Array(buffer, f4_start[FTYPE_POS_UV_NORM] + f4_count[FTYPE_POS_UV_NORM] * 12 * 4, f4_count[FTYPE_POS_UV_NORM]);
    }
    
    mat_index = 0;
    mat_pos_index = 0;
    next_mat_pos = material_pos[mat_pos_index].pos;

    faceblock_idx = 0;
    faceblock = faceblocks[0];
    
    var vert2;
    var vert3;
    var vertlen;

    // f pos/uv?/normal? pos/uv?/normal? ...
    pattern = /f +((-?\d+(\/(-?\d+)?)?(\/-?\d+)?[ \\\n\r]*)+)/g;
    while ( ( result = pattern.exec( input ) ) != null ) {
        if(pattern.lastIndex > next_mat_pos) {
            mat_index = material_pos[mat_pos_index].index;
            next_mat_pos = material_pos[++mat_pos_index].pos;
        }
        if ( pattern.lastIndex > faceblock.pos ) {
            faceblock = faceblocks[++faceblock_idx];
        }

        verts = result[1].trim().split(/[ \\\n\r]+/);
        vertlen = verts.length;
        vert = verts[0].split('/');
        
        type = 0;
        if(!!vert[1]) type |= FTYPE_POS_UV;
        if(!!vert[2]) type |= FTYPE_POS_NORM;
        
        if(vertlen == 3) {
            for(var i = 0; i < 3; ++i) {
                if(i > 0) vert = verts[i].split('/');
                f3_pos_array[type][f3_pos_offset[type]++] = calcIdx(vert[0], faceblock.v);
                if(type & FTYPE_POS_NORM) f3_norm_array[type][f3_norm_offset[type]++] = calcIdx(vert[2], faceblock.vn);
                if(type & FTYPE_POS_UV) f3_uv_array[type][f3_uv_offset[type]++] = calcIdx(vert[1], faceblock.vt);
            }
            f3_mat_array[type][f3_mat_offset[type]++] = mat_index;
        } else if (vertlen == 4) {
            for(var i = 0; i < 4; ++i) {
                if(i > 0) vert = verts[i].split('/');
                f4_pos_array[type][f4_pos_offset[type]++] = calcIdx(vert[0], faceblock.v);
                if(type & FTYPE_POS_NORM) f4_norm_array[type][f4_norm_offset[type]++] = calcIdx(vert[2], faceblock.vn);
                if(type & FTYPE_POS_UV) f4_uv_array[type][f4_uv_offset[type]++] = calcIdx(vert[1], faceblock.vt);
            }
            f4_mat_array[type][f4_mat_offset[type]++] = mat_index;
        } else if (vertlen > 4) {
            for(var i = 0, il = vertlen - 2; i < il; ++i) {
                f3_pos_array[type][f3_pos_offset[type]++] = calcIdx(vert[0], faceblock.v);
                if(type & FTYPE_POS_NORM) f3_norm_array[type][f3_norm_offset[type]++] = calcIdx(vert[2], faceblock.vn);
                if(type & FTYPE_POS_UV) f3_uv_array[type][f3_uv_offset[type]++] = calcIdx(vert[1], faceblock.vt);

                vert2 = verts[i + 1].split('/');
                f3_pos_array[type][f3_pos_offset[type]++] = calcIdx(vert2[0], faceblock.v);
                if(type & FTYPE_POS_NORM) f3_norm_array[type][f3_norm_offset[type]++] = calcIdx(vert2[2], faceblock.vn);
                if(type & FTYPE_POS_UV) f3_uv_array[type][f3_uv_offset[type]++] = calcIdx(vert2[1], faceblock.vt);

                vert3 = verts[i + 2].split('/');
                f3_pos_array[type][f3_pos_offset[type]++] = calcIdx(vert3[0], faceblock.v);
                if(type & FTYPE_POS_NORM) f3_norm_array[type][f3_norm_offset[type]++] = calcIdx(vert3[2], faceblock.vn);
                if(type & FTYPE_POS_UV) f3_uv_array[type][f3_uv_offset[type]++] = calcIdx(vert3[1], faceblock.vt);

                f3_mat_array[type][f3_mat_offset[type]++] = mat_index;
            }
        }
    }
    console.log("wrote faces");
    console.log(" duration: " + duration());

    // conversion done
    var overAllDuration = new Date().getTime() - overAllStartTime;
    console.log("over all conversion time: " + overAllDuration);
    status("Conversion done, duration: " + overAllDuration + "ms");

    var meta = {
    	    "metadata" :
    	    {
    	        "formatVersion" : 3,
    	        "sourceFile"    : ".obj",
    	        "generatedBy"   : "JS OBJConverter",
    	        "vertices"      : vcount,
    	        "faces"         : f3_count[FTYPE_POS] + f4_count[FTYPE_POS] +
    	        	f3_count[FTYPE_POS_NORM] + f4_count[FTYPE_POS_NORM] +
    	        	f3_count[FTYPE_POS_UV] + f4_count[FTYPE_POS_UV] +
    	        	f3_count[FTYPE_POS_UV_NORM] + f4_count[FTYPE_POS_UV_NORM],
    	        "normals"       : ncount,
    	        "uvs"           : tcount,
    	        "materials"     : materials.length
    	    },

    	    "materials": [],

    	    "buffers": ".bin"
    };
    for(var i = 0; i < materials.length; ++i) {
    	meta.materials.push({
            "DbgColor": 0xffffff,
            "DbgIndex": 0,
            "DbgName": materials[i]
        });
    }

    
    return {binary:buffer, meta:meta};
}

// for node.js support
if(typeof(exports) != 'undefined') {
    exports.obj2bin = obj2bin;
}
