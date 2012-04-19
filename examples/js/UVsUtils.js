/* 
 * @author https://github.com/zz85 | @blurspline
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