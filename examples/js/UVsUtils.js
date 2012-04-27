/*
 * @author gyuque / https://github.com/gyuque
 *
 * Cylinder Mapping for ExtrudeGeometry
 *
 */

THREE.UVsUtils = {

};

THREE.UVsUtils.CylinderUVGenerator = function() {
    this.uRepeat = 1;
    this.targetGeometry = null;
    this.lengthCache = null;
};

THREE.UVsUtils.CylinderUVGenerator.prototype = {
    generateTopUV: THREE.ExtrudeGeometry.WorldUVGenerator.generateTopUV,
    generateBottomUV: THREE.ExtrudeGeometry.WorldUVGenerator.generateBottomUV,
    
    generateSideWallUV: function( geometry, extrudedShape, wallContour, extrudeOptions,
                                  indexA, indexB, indexC, indexD, stepIndex, stepsLength,
                                  contourIndex1, contourIndex2 ) {
        // first call
        if (this.targetGeometry !== geometry) {
            this.prepare(geometry, wallContour);
        }

        // generate uv
        var u_list = this.lengthCache;
        var v1 = stepIndex / stepsLength;
        var v2 = ( stepIndex + 1 ) / stepsLength;
        
        var u1 = u_list[contourIndex1];
        var u2 = u_list[contourIndex2];
        if (u1 < u2) {u1 += 1.0;}
        
        u1 *= this.uRepeat;
        u2 *= this.uRepeat;
        return [
            new THREE.UV( u1, v1 ),
            new THREE.UV( u2, v1 ),
            new THREE.UV( u2, v2 ),
            new THREE.UV( u1, v2 )
        ];
    },
    
    prepare: function(geometry, wallContour) {
        var p1, p2;
        var u_list = [];
        var lengthSum = 0;
        var len = wallContour.length;
        for (var i = 0;i < len;i++) {
            p1 = wallContour[ i ];
            p2 = wallContour[ (i+1) % len ];

            var dx = p1.x - p2.x;
            var dy = p1.y - p2.y;
            var segmentLength = Math.sqrt(dx*dx + dy*dy);
            
            u_list.push(lengthSum);
            lengthSum += segmentLength;
        }
        
        this.normalizeArray(u_list, lengthSum);
        this.targetGeometry = geometry;
        this.lengthCache = u_list;
    },
    
    normalizeArray: function(ls, v) {
        var len = ls.length;
        for (var i = 0;i < len;i++) {
            ls[i] /= v;
        }
        
        return ls;
    }
};



/* 
 * @author zz85 / https://github.com/zz85
 *
 * tool for "unwrapping" and debugging three.js 
 * geometries UV mapping
 *
 * Sample usage:
 *	document.body.appendChild(
 *		THREE.UVsDebug(
 *			new THREE.SphereGeometry(10,10,10,10));
 *
 */
 
THREE.UVsDebug = function(geometry) {
    
    var verts = geometry.vertices, 
    faces = geometry.faces, 
    uvs = geometry.faceVertexUvs[0];
    console.log('debugging geometry', geometry);
    
    
    var canvas = document.createElement('canvas');
    var width = 1024;
    var height = 1024;
    canvas.width = width;
    canvas.height = height;
    
    var ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';

    // paint background white
    ctx.fillStyle = 'rgba(255,255,255, 1.0)';
    ctx.fillRect(0, 0, width, height);
    
    var abc = 'abcd';
    
    var uv, u, ax, ay;
    var i, il, j, jl;
    
    var a = new THREE.Vector2();
    var b = new THREE.Vector2();
    
    for (i = 0, il = uvs.length; i < il; i++) {
        uv = uvs[i];
        
        // draw lines
        ctx.beginPath();
        
        a.set(0, 0);
        for (j = 0, jl = uv.length; j < jl; j++) {
            u = uv[j];
            
            a.x += u.u;
            a.y += u.v;
            
            if (j == 0) {
                ctx.moveTo(u.u * width, u.v * height);
            } else {
                ctx.lineTo(u.u * width, u.v * height);
            }
        }
        
        ctx.closePath();
        ctx.stroke();
        
        a.divideScalar(jl);
        
        // label the face number
        ctx.font = "12pt Arial bold";
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillText(i, a.x * width, a.y * height);
        
        ctx.font = "8pt Arial bold";
        ctx.fillStyle = 'rgba(30,30,0,0.8)';
        
        
        // label uv edge orders
        for (j = 0, jl = uv.length; j < jl; j++) {
            u = uv[j];
            b.set(u.u, u.v).subSelf(a).divideScalar(4);
            
            b.x = u.u - b.x;
            b.y = u.v - b.y;
            ctx.fillText(abc[j]
                + ':' + faces[i][abc[j]], b.x * width, b.y * height);
        }
    
    }
    
    return canvas;
}