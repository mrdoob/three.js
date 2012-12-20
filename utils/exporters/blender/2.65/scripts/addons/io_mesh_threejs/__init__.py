# ##### BEGIN GPL LICENSE BLOCK #####
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License
#  as published by the Free Software Foundation; either version 2
#  of the License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software Foundation,
#  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
#
# ##### END GPL LICENSE BLOCK #####

# ################################################################
# Init
# ################################################################


bl_info = {
    "name": "three.js format",
    "author": "mrdoob, kikko, alteredq, remoe, pxf, n3tfr34k",
    "version": (1, 4, 0),
    "blender": (2, 6, 5),
    "api": 35622,
    "location": "File > Import-Export",
    "description": "Import-Export three.js meshes",
    "warning": "",
    "wiki_url": "https://github.com/mrdoob/three.js/tree/master/utils/exporters/blender",
    "tracker_url": "https://github.com/mrdoob/three.js/issues",
    "category": "Import-Export"}

# To support reload properly, try to access a package var,
# if it's there, reload everything

import bpy

if "bpy" in locals():
    import imp
    if "export_threejs" in locals():
        imp.reload(export_threejs)
    if "import_threejs" in locals():
        imp.reload(import_threejs)

from bpy.props import *
from bpy_extras.io_utils import ExportHelper, ImportHelper

# ################################################################
# Custom properties
# ################################################################

bpy.types.Object.THREE_castShadow = bpy.props.BoolProperty()
bpy.types.Object.THREE_receiveShadow = bpy.props.BoolProperty()
bpy.types.Object.THREE_doubleSided = bpy.props.BoolProperty()
bpy.types.Object.THREE_exportGeometry = bpy.props.BoolProperty(default = True)

bpy.types.Material.THREE_useVertexColors = bpy.props.BoolProperty()
bpy.types.Material.THREE_depthWrite = bpy.props.BoolProperty(default = True)
bpy.types.Material.THREE_depthTest = bpy.props.BoolProperty(default = True)

THREE_material_types = [("Basic", "Basic", "Basic"), ("Phong", "Phong", "Phong"), ("Lambert", "Lambert", "Lambert")]
bpy.types.Material.THREE_materialType = EnumProperty(name = "Material type", description = "Material type", items = THREE_material_types, default = "Lambert")

THREE_blending_types = [("NoBlending", "NoBlending", "NoBlending"), ("NormalBlending", "NormalBlending", "NormalBlending"),
                        ("AdditiveBlending", "AdditiveBlending", "AdditiveBlending"), ("SubtractiveBlending", "SubtractiveBlending", "SubtractiveBlending"),
                        ("MultiplyBlending", "MultiplyBlending", "MultiplyBlending"), ("AdditiveAlphaBlending", "AdditiveAlphaBlending", "AdditiveAlphaBlending")]
bpy.types.Material.THREE_blendingType = EnumProperty(name = "Blending type", description = "Blending type", items = THREE_blending_types, default = "NormalBlending")

class OBJECT_PT_hello( bpy.types.Panel ):

    bl_label = "THREE"
    bl_space_type = "PROPERTIES"
    bl_region_type = "WINDOW"
    bl_context = "object"

    def draw(self, context):
        layout = self.layout
        obj = context.object

        row = layout.row()
        row.label(text="Selected object: " + obj.name )

        row = layout.row()
        row.prop( obj, "THREE_exportGeometry", text="Export geometry" )

        row = layout.row()
        row.prop( obj, "THREE_castShadow", text="Casts shadow" )

        row = layout.row()
        row.prop( obj, "THREE_receiveShadow", text="Receives shadow" )

        row = layout.row()
        row.prop( obj, "THREE_doubleSided", text="Double sided" )

class MATERIAL_PT_hello( bpy.types.Panel ):

    bl_label = "THREE"
    bl_space_type = "PROPERTIES"
    bl_region_type = "WINDOW"
    bl_context = "material"

    def draw(self, context):
        layout = self.layout
        mat = context.material

        row = layout.row()
        row.label(text="Selected material: " + mat.name )

        row = layout.row()
        row.prop( mat, "THREE_materialType", text="Material type" )

        row = layout.row()
        row.prop( mat, "THREE_blendingType", text="Blending type" )

        row = layout.row()
        row.prop( mat, "THREE_useVertexColors", text="Use vertex colors" )

        row = layout.row()
        row.prop( mat, "THREE_depthWrite", text="Enable depth writing" )

        row = layout.row()
        row.prop( mat, "THREE_depthTest", text="Enable depth testing" )


# ################################################################
# Importer
# ################################################################

class ImportTHREEJS(bpy.types.Operator, ImportHelper):
    '''Load a Three.js ASCII JSON model'''

    bl_idname = "import.threejs"
    bl_label = "Import Three.js"

    filename_ext = ".js"
    filter_glob = StringProperty(default="*.js", options={'HIDDEN'})

    option_flip_yz = BoolProperty(name="Flip YZ", description="Flip YZ", default=True)
    recalculate_normals = BoolProperty(name="Recalculate normals", description="Recalculate vertex normals", default=True)
    option_worker = BoolProperty(name="Worker", description="Old format using workers", default=False)

    def execute(self, context):
        import io_mesh_threejs.import_threejs
        return io_mesh_threejs.import_threejs.load(self, context, **self.properties)


    def draw(self, context):
        layout = self.layout

        row = layout.row()
        row.prop(self.properties, "option_flip_yz")

        row = layout.row()
        row.prop(self.properties, "recalculate_normals")

        row = layout.row()
        row.prop(self.properties, "option_worker")


# ################################################################
# Exporter - settings
# ################################################################

SETTINGS_FILE_EXPORT = "threejs_settings_export.js"

import os
import json

def file_exists(filename):
    """Return true if file exists and accessible for reading.

    Should be safer than just testing for existence due to links and
    permissions magic on Unix filesystems.

    @rtype: boolean
    """

    try:
        f = open(filename, 'r')
        f.close()
        return True
    except IOError:
        return False

def get_settings_fullpath():
    return os.path.join(bpy.app.tempdir, SETTINGS_FILE_EXPORT)

def save_settings_export(properties):

    settings = {
    "option_export_scene" : properties.option_export_scene,
    "option_embed_meshes" : properties.option_embed_meshes,
    "option_url_base_html" : properties.option_url_base_html,
    "option_copy_textures" : properties.option_copy_textures,

    "option_lights" : properties.option_lights,
    "option_cameras" : properties.option_cameras,

    "option_animation_morph" : properties.option_animation_morph,
    "option_animation_skeletal" : properties.option_animation_skeletal,

    "option_frame_step" : properties.option_frame_step,
    "option_all_meshes" : properties.option_all_meshes,

    "option_flip_yz"      : properties.option_flip_yz,

    "option_materials"       : properties.option_materials,
    "option_normals"         : properties.option_normals,
    "option_colors"          : properties.option_colors,
    "option_uv_coords"       : properties.option_uv_coords,
    "option_faces"           : properties.option_faces,
    "option_vertices"        : properties.option_vertices,

    "option_skinning"        : properties.option_skinning,
    "option_bones"           : properties.option_bones,

    "option_vertices_truncate" : properties.option_vertices_truncate,
    "option_scale"        : properties.option_scale,

    "align_model"         : properties.align_model
    }

    fname = get_settings_fullpath()
    f = open(fname, "w")
    json.dump(settings, f)

def restore_settings_export(properties):

    settings = {}

    fname = get_settings_fullpath()
    if file_exists(fname):
        f = open(fname, "r")
        settings = json.load(f)

    properties.option_vertices = settings.get("option_vertices", True)
    properties.option_vertices_truncate = settings.get("option_vertices_truncate", False)
    properties.option_faces = settings.get("option_faces", True)
    properties.option_normals = settings.get("option_normals", True)

    properties.option_colors = settings.get("option_colors", True)
    properties.option_uv_coords = settings.get("option_uv_coords", True)
    properties.option_materials = settings.get("option_materials", True)

    properties.option_skinning = settings.get("option_skinning", True)
    properties.option_bones = settings.get("option_bones", True)

    properties.align_model = settings.get("align_model", "None")

    properties.option_scale = settings.get("option_scale", 1.0)
    properties.option_flip_yz = settings.get("option_flip_yz", True)

    properties.option_export_scene = settings.get("option_export_scene", False)
    properties.option_embed_meshes = settings.get("option_embed_meshes", True)
    properties.option_url_base_html = settings.get("option_url_base_html", False)
    properties.option_copy_textures = settings.get("option_copy_textures", False)

    properties.option_lights = settings.get("option_lights", False)
    properties.option_cameras = settings.get("option_cameras", False)

    properties.option_animation_morph = settings.get("option_animation_morph", False)
    properties.option_animation_skeletal = settings.get("option_animation_skeletal", False)

    properties.option_frame_step = settings.get("option_frame_step", 1)
    properties.option_all_meshes = settings.get("option_all_meshes", True)

# ################################################################
# Exporter
# ################################################################

class ExportTHREEJS(bpy.types.Operator, ExportHelper):
    '''Export selected object / scene for Three.js (ASCII JSON format).'''

    bl_idname = "export.threejs"
    bl_label = "Export Three.js"

    filename_ext = ".js"

    option_vertices = BoolProperty(name = "Vertices", description = "Export vertices", default = True)
    option_vertices_deltas = BoolProperty(name = "Deltas", description = "Delta vertices", default = False)
    option_vertices_truncate = BoolProperty(name = "Truncate", description = "Truncate vertices", default = False)

    option_faces = BoolProperty(name = "Faces", description = "Export faces", default = True)
    option_faces_deltas = BoolProperty(name = "Deltas", description = "Delta faces", default = False)

    option_normals = BoolProperty(name = "Normals", description = "Export normals", default = True)

    option_colors = BoolProperty(name = "Colors", description = "Export vertex colors", default = True)
    option_uv_coords = BoolProperty(name = "UVs", description = "Export texture coordinates", default = True)
    option_materials = BoolProperty(name = "Materials", description = "Export materials", default = True)

    option_skinning = BoolProperty(name = "Skinning", description = "Export skin data", default = True)
    option_bones = BoolProperty(name = "Bones", description = "Export bones", default = True)

    align_types = [("None","None","None"), ("Center","Center","Center"), ("Bottom","Bottom","Bottom"), ("Top","Top","Top")]
    align_model = EnumProperty(name = "Align model", description = "Align model", items = align_types, default = "None")

    option_scale = FloatProperty(name = "Scale", description = "Scale vertices", min = 0.01, max = 1000.0, soft_min = 0.01, soft_max = 1000.0, default = 1.0)
    option_flip_yz = BoolProperty(name = "Flip YZ", description = "Flip YZ", default = True)

    option_export_scene = BoolProperty(name = "Scene", description = "Export scene", default = False)
    option_embed_meshes = BoolProperty(name = "Embed meshes", description = "Embed meshes", default = True)
    option_copy_textures = BoolProperty(name = "Copy textures", description = "Copy textures", default = False)
    option_url_base_html = BoolProperty(name = "HTML as url base", description = "Use HTML as url base ", default = False)

    option_lights = BoolProperty(name = "Lights", description = "Export default scene lights", default = False)
    option_cameras = BoolProperty(name = "Cameras", description = "Export default scene cameras", default = False)

    option_animation_morph = BoolProperty(name = "Morph animation", description = "Export animation (morphs)", default = False)
    option_animation_skeletal = BoolProperty(name = "Skeletal animation", description = "Export animation (skeletal)", default = False)

    option_frame_step = IntProperty(name = "Frame step", description = "Animation frame step", min = 1, max = 1000, soft_min = 1, soft_max = 1000, default = 1)
    option_all_meshes = BoolProperty(name = "All meshes", description = "All meshes (merged)", default = True)

    def invoke(self, context, event):
        restore_settings_export(self.properties)
        return ExportHelper.invoke(self, context, event)

    @classmethod
    def poll(cls, context):
        return context.active_object != None

    def execute(self, context):
        print("Selected: " + context.active_object.name)

        if not self.properties.filepath:
            raise Exception("filename not set")

        save_settings_export(self.properties)

        filepath = self.filepath

        import io_mesh_threejs.export_threejs
        return io_mesh_threejs.export_threejs.save(self, context, **self.properties)

    def draw(self, context):
        layout = self.layout

        row = layout.row()
        row.label(text="Geometry:")

        row = layout.row()
        row.prop(self.properties, "option_vertices")
        # row = layout.row()
        # row.enabled = self.properties.option_vertices
        # row.prop(self.properties, "option_vertices_deltas")
        row.prop(self.properties, "option_vertices_truncate")
        layout.separator()

        row = layout.row()
        row.prop(self.properties, "option_faces")
        row = layout.row()
        row.enabled = self.properties.option_faces
        # row.prop(self.properties, "option_faces_deltas")
        layout.separator()

        row = layout.row()
        row.prop(self.properties, "option_normals")
        layout.separator()

        row = layout.row()
        row.prop(self.properties, "option_bones")
        row.prop(self.properties, "option_skinning")
        layout.separator()

        row = layout.row()
        row.label(text="Materials:")

        row = layout.row()
        row.prop(self.properties, "option_uv_coords")
        row.prop(self.properties, "option_colors")
        row = layout.row()
        row.prop(self.properties, "option_materials")
        layout.separator()

        row = layout.row()
        row.label(text="Settings:")

        row = layout.row()
        row.prop(self.properties, "align_model")
        row = layout.row()
        row.prop(self.properties, "option_flip_yz")
        row.prop(self.properties, "option_scale")
        layout.separator()

        row = layout.row()
        row.label(text="--------- Experimental ---------")
        layout.separator()

        row = layout.row()
        row.label(text="Scene:")

        row = layout.row()
        row.prop(self.properties, "option_export_scene")
        row.prop(self.properties, "option_embed_meshes")

        row = layout.row()
        row.prop(self.properties, "option_lights")
        row.prop(self.properties, "option_cameras")
        layout.separator()

        row = layout.row()
        row.label(text="Animation:")

        row = layout.row()
        row.prop(self.properties, "option_animation_morph")
        row = layout.row()
        row.prop(self.properties, "option_animation_skeletal")
        row = layout.row()
        row.prop(self.properties, "option_frame_step")
        layout.separator()

        row = layout.row()
        row.label(text="Settings:")

        row = layout.row()
        row.prop(self.properties, "option_all_meshes")

        row = layout.row()
        row.prop(self.properties, "option_copy_textures")

        row = layout.row()
        row.prop(self.properties, "option_url_base_html")

        layout.separator()


# ################################################################
# Common
# ################################################################

def menu_func_export(self, context):
    default_path = bpy.data.filepath.replace(".blend", ".js")
    self.layout.operator(ExportTHREEJS.bl_idname, text="Three.js (.js)").filepath = default_path

def menu_func_import(self, context):
    self.layout.operator(ImportTHREEJS.bl_idname, text="Three.js (.js)")

def register():
    bpy.utils.register_module(__name__)
    bpy.types.INFO_MT_file_export.append(menu_func_export)
    bpy.types.INFO_MT_file_import.append(menu_func_import)

def unregister():
    bpy.utils.unregister_module(__name__)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)
    bpy.types.INFO_MT_file_import.remove(menu_func_import)

if __name__ == "__main__":
    register()
