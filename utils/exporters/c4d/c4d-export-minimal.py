import c4d
import re

from c4d import documents, UVWTag, storage, plugins, gui, modules, bitmaps, utils
from c4d.utils import *

# utils
clean = lambda varStr: re.sub('\W|^(?=\d)','_', varStr)

if op.GetType() != 5100:
    print 'Selected Object is not an editable mesh'
    exit

classname = clean(op.GetName()+'Minimal')

code  = 'var %s = function () {\n\n\tvar scope = this;\n\n\tTHREE.Geometry.call(this);\n\n' % classname

for v in op.GetAllPoints():
    code += '\tv( %.6f, %.6f, %.6f );\n' % (-(v.x), v.y, v.z)

code    += '\n'
ncount  = 0
uvcount = 0
faces   = op.GetAllPolygons()
hasUV = False

for tag in op.GetTags():
    if tag.GetName() == "UVW":
        uvw = tag
        hasUV = True

for f in faces:
    if(f.d == f.c):
        code += '\tf3( %d, %d, %d );\n' % (f.a, f.b, f.c)
    else:
        code += '\tf4( %d, %d, %d, %d );\n' % (f.a, f.b, f.c, f.d)
    if hasUV:
        uv = uvw.GetSlow(uvcount);
        if len(uv) == 4:
            code += '\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n ' % ( uv['a'].x,  uv['a'].y,  uv['b'].x, uv['b'].y,  uv['c'].x, uv['c'].y, uv['d'].x, uv['d'].y)
        else:
            print 'has 3'
            code += '\tuv( %.6f, %.6f, %.6f, %.6f, %.6f, %.6f);\n' % (uv['a'].x, uv['a'].y, uv['b'].x, uv['b'].y, uv['c'].x, uv['c'].y)
        uvcount += 1

code +='\n\tthis.computeCentroids();\n\tthis.computeFaceNormals();\n'

code+="""

    function v( x, y, z ) {
        scope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );
    }
    function f3( a, b, c, nx, ny, nz ) {
        scope.faces.push( new THREE.Face3( a, b, c, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );
    }
    function f4( a, b, c, d, nx, ny, nz ) {
        scope.faces.push( new THREE.Face4( a, b, c, d, nx && ny && nz ? new THREE.Vector3( nx, ny, nz ) : null ) );
    }
    function uv( u1, v1, u2, v2, u3, v3, u4, v4 ) {
        var uv = [];
        uv.push( new THREE.UV( u1, v1 ) );
        uv.push( new THREE.UV( u2, v2 ) );
        uv.push( new THREE.UV( u3, v3 ) );
        if ( u4 && v4 ) uv.push( new THREE.UV( u4, v4 ) );
        scope.faceVertexUvs[ 0 ].push( uv );
    }
}

"""

code += '%s.prototype = new THREE.Geometry();\n' % classname
code += '%s.prototype.constructor = %s;' % (classname, classname)


docPath = doc.GetDocumentPath() 
jspath = docPath+'/'+classname+'.js'
file = open(jspath,'w')
file.write(code)
file.close()

print ' Minimal Export Complete! Model is in' + docPath
