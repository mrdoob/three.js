/*
 * @author gyuque / http://github.com/gyuque
 * Cylinder Mapping for ExtrudeGeometry
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
            new THREE.Vector2( u1, v1 ),
            new THREE.Vector2( u2, v1 ),
            new THREE.Vector2( u2, v2 ),
            new THREE.Vector2( u1, v2 )
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
 * @author zz85 / http://github.com/zz85
 * @author WestLangley / http://github.com/WestLangley
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
 
THREE.UVsDebug = function( geometry, size ) {

    // handles wrapping of uv.x > 1 only
    
    var abc = 'abcd';

    var uv, u, ax, ay;
    var i, il, j, jl;
    var vnum;

    var a = new THREE.Vector2();
    var b = new THREE.Vector2();

    var faces = geometry.faces;
    var uvs = geometry.faceVertexUvs[ 0 ];

    var canvas = document.createElement( 'canvas' );
    var width = size || 1024;   // power of 2 required for wrapping
    var height = size || 1024;
    canvas.width = width;
    canvas.height = height;

    var ctx = canvas.getContext( '2d' );
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba( 0, 0, 0, 1.0 )';
    ctx.textAlign = 'center';

    // paint background white

    ctx.fillStyle = 'rgba( 255, 255, 255, 1.0 )';
    ctx.fillRect( 0, 0, width, height );

    for ( i = 0, il = uvs.length; i < il; i++ ) {

        uv = uvs[ i ];

        // draw lines

        ctx.beginPath();

        a.set( 0, 0 );

        for ( j = 0, jl = uv.length; j < jl; j++ ) {

            u = uv[ j ];

            a.x += u.x;
            a.y += u.y;

            if ( j == 0 ) {

                ctx.moveTo( u.x * width, ( 1 - u.y ) * height );

            } else {

                ctx.lineTo( u.x * width, ( 1 - u.y ) * height );

            }

        }

        ctx.closePath();
        ctx.stroke();

        a.divideScalar( jl );

        // label the face number

        ctx.font = "12pt Arial bold";
        ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';
        ctx.fillText( i, a.x * width, ( 1 - a.y ) * height );

        if ( a.x > 0.95 ) { // wrap x // 0.95 is arbitrary

            ctx.fillText( i, ( a.x % 1 ) * width, ( 1 - a.y ) * height );

        }

        ctx.font = "8pt Arial bold";
        ctx.fillStyle = 'rgba( 0, 0, 0, 1.0 )';

        // label uv edge orders

        for ( j = 0, jl = uv.length; j < jl; j++ ) {

            u = uv[ j ];
            b.addVectors( a, u ).divideScalar( 2 );

            vnum = faces[ i ][ abc[ j ] ];
            ctx.fillText( abc[ j ] + vnum, b.x * width, ( 1 - b.y ) * height );

            if ( b.x > 0.95 ) {  // wrap x

                ctx.fillText( abc[ j ] + vnum, ( b.x % 1 ) * width, ( 1 - b.y ) * height );

            }

        }

    }

    return canvas;

}

