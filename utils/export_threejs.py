__author__ = "Mr.doob"
__url__ = ("http://mrdoob.com")
__version__ = "1"
__bpydoc__ = """\
This script exports the selected object for the three.js engine.
"""

import bpy

def rvec3d(v):
    return round(v[0], 6), round(v[1], 6), round(v[2], 6)


def rvec2d(v):
    return round(v[0], 6), round(v[1], 6)


def write(filename, scene, ob, \
        EXPORT_APPLY_MODIFIERS=True,\
        EXPORT_NORMALS=True,\
        EXPORT_UV=True,\
        EXPORT_COLORS=True):

    if not filename.lower().endswith('.js'):
        filename += '.js'

    if not ob:
        raise Exception("Error, Select the object to export")
        return

    file = open(filename, 'w')

    if EXPORT_APPLY_MODIFIERS:
        mesh = ob.create_mesh(True, 'PREVIEW')
    else:
        mesh = ob.data

    if not mesh:
        raise ("Error, could not get mesh data from selected object")
        return

    faceUV = len(mesh.uv_textures) > 0
    vertexUV = len(mesh.sticky) > 0
    vertexColors = len(mesh.vertex_colors) > 0

    if (not faceUV) and (not vertexUV):
        EXPORT_UV = False
    if not vertexColors:
        EXPORT_COLORS = False

    if not EXPORT_UV:
        faceUV = vertexUV = False
    if not EXPORT_COLORS:
        vertexColors = False

    if faceUV:
        active_uv_layer = mesh.active_uv_texture
        if not active_uv_layer:
            EXPORT_UV = False
            faceUV = None
        else:
            active_uv_layer = active_uv_layer.data

    if vertexColors:
        active_col_layer = mesh.active_vertex_color
        if not active_col_layer:
            EXPORT_COLORS = False
            vertexColors = None
        else:
            active_col_layer = active_col_layer.data

    # incase
    color = uvcoord = uvcoord_key = normal = normal_key = None

    file.write('var %s = function () {\n\n' % filename)

    file.write('\tvar scope = this;\n\n')

    file.write('\tTHREE.Geometry.call(this);\n\n')

    for v in mesh.verts:
        file.write('\tv( %.6f, %.6f, %.6f );\n' % (v.co.x, v.co.z, -v.co.y)) # co
        """
        if EXPORT_NORMALS:
            file.write('%.6f %.6f %.6f ' % v[1]) # no
        if EXPORT_UV:
            file.write('%.6f %.6f ' % v) # uv
        if EXPORT_COLORS:
            file.write('%u %u %u' % v[3]) # col
        """

    file.write('\n')

    for f in mesh.faces:
        if len(f.verts) == 3:
            file.write('\tf3( %d, %d, %d );\n' % (f.verts[0], f.verts[1], f.verts[2]))
        else:
            file.write('\tf4( %d, %d, %d, %d );\n' % (f.verts[0], f.verts[1], f.verts[2], f.verts[3]))

    file.write('\n')

    file.write('\tfunction v( x, y, z ) {\n\n')
    file.write('\t\tscope.vertices.push( new THREE.Vertex( new THREE.Vector3( x, y, z ) ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction f3( a, b, c ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face3( a, b, c ) );\n\n')
    file.write('\t}\n\n')

    file.write('\tfunction f4( a, b, c, d ) {\n\n')
    file.write('\t\tscope.faces.push( new THREE.Face4( a, b, c, d ) );\n\n')
    file.write('\t}\n\n')

    file.write('}\n\n')

    file.write('%s.prototype = new THREE.Geometry();\n' % filename)
    file.write('%s.prototype.constructor = %s;' % (filename, filename))

    file.close()

    print("writing", filename, "done")

    if EXPORT_APPLY_MODIFIERS:
        bpy.data.meshes.remove(mesh)

from bpy.props import *


class ExportTHREEJS(bpy.types.Operator):
    '''TODO'''
    bl_idname = "export.three_js"
    bl_label = "Export three.js"

    # List of operator properties, the attributes will be assigned
    # to the class instance from the operator settings before calling.


    path = StringProperty(name="File Path", description="File path used for exporting the PLY file", maxlen=1024, default="")
    check_existing = BoolProperty(name="Check Existing", description="Check and warn on overwriting existing files", default=True, options={'HIDDEN'})
    use_modifiers = BoolProperty(name="Apply Modifiers", description="Apply Modifiers to the exported mesh", default=True)
    use_normals = BoolProperty(name="Normals", description="Export Normals for smooth and hard shaded faces", default=True)
    use_uvs = BoolProperty(name="UVs", description="Exort the active UV layer", default=True)
    use_colors = BoolProperty(name="Vertex Colors", description="Exort the active vertex color layer", default=True)

    def poll(self, context):
        return context.active_object != None

    def execute(self, context):
        # print("Selected: " + context.active_object.name)

        if not self.properties.path:
            raise Exception("filename not set")

        write(self.properties.path, context.scene, context.active_object,\
            EXPORT_APPLY_MODIFIERS=self.properties.use_modifiers,
            EXPORT_NORMALS=self.properties.use_normals,
            EXPORT_UV=self.properties.use_uvs,
            EXPORT_COLORS=self.properties.use_colors,
        )

        return {'FINISHED'}

    def invoke(self, context, event):
        wm = context.manager
        wm.add_fileselect(self)
        return {'RUNNING_MODAL'}

    def draw(self, context):
        layout = self.layout
        props = self.properties

        row = layout.row()
        row.prop(props, "use_modifiers")
        row.prop(props, "use_normals")
        row = layout.row()
        row.prop(props, "use_uvs")
        row.prop(props, "use_colors")


def menu_func(self, context):
    default_path = bpy.data.filename.replace(".blend", ".js")
    self.layout.operator(ExportTHREEJS.bl_idname, text="three.js (.js)").path = default_path


def register():
    bpy.types.register(ExportTHREEJS)
    bpy.types.INFO_MT_file_export.append(menu_func)


def unregister():
    bpy.types.unregister(ExportTHREEJS)
    bpy.types.INFO_MT_file_export.remove(menu_func)

if __name__ == "__main__":
    register()
