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

import os
import json

import bpy
from bpy_extras.io_utils import ExportHelper
from bpy.props import (
    EnumProperty,
    BoolProperty,
    FloatProperty,
    IntProperty
)

from . import constants

SETTINGS_FILE_EXPORT = 'three_settings_export.js'


bl_info = {
    'name': 'Three.js Format',
    'author': 'Ed Caspersen (repsac)',
    'version': (1, 0, 0),
    'blender': (2, 7, 2),
    'location': 'File > Import-Export',
    'description': 'Export Three.js formatted JSON files.',
    'warning': '',
    'wiki_url': 'https://github.com/mrdoob/three.js/tree/'\
        'master/utils/exporters/blender',
    'tracker_url':  'https://github.com/mrdoob/three.js/issues',
    'category': 'Import-Export'
}

def _geometry_types():
    types = [
        (constants.GLOBAL, constants.GLOBAL.title(), 
        constants.GLOBAL),
        (constants.GEOMETRY, constants.GEOMETRY.title(), 
        constants.GEOMETRY),
        (constants.BUFFER_GEOMETRY, constants.BUFFER_GEOMETRY, 
        constants.BUFFER_GEOMETRY),
    ]

    return types

bpy.types.Mesh.THREE_geometry_type = EnumProperty(
    name='Geometry type',
    description='Geometry type',
    items=_geometry_types(),
    default=constants.GLOBAL)

class MESH_PT_hello(bpy.types.Panel):

    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'data'
    
    def draw(self, context):
        row = self.layout.row()
        if context.mesh:
            row.prop(context.mesh, 'THREE_geometry_type', text='Type')

def _blending_types(index):
    types = (
        constants.BLENDING_TYPES.NONE, 
        constants.BLENDING_TYPES.NORMAL, 
        constants.BLENDING_TYPES.ADDITIVE, 
        constants.BLENDING_TYPES.SUBTRACTIVE, 
        constants.BLENDING_TYPES.MULTIPLY, 
        constants.BLENDING_TYPES.CUSTOM)
    return (types[index], types[index], types[index])

bpy.types.Material.THREE_blending_type = EnumProperty(
    name='Blending type', 
    description='Blending type', 
    items=[_blending_types(x) for x in range(5)], 
    default=constants.BLENDING_TYPES.NORMAL)

bpy.types.Material.THREE_depth_write = BoolProperty(default=True)
bpy.types.Material.THREE_depth_test = BoolProperty(default=True)

class MATERIAL_PT_hello(bpy.types.Panel):

    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'material'
    
    def draw(self, context):
        layout = self.layout
        mat = context.material
    
        if mat is not None:
            row = layout.row()
            row.label(text='Selected material: %s' % mat.name )

            row = layout.row()
            row.prop(mat, 'THREE_blending_type', 
                text='Blending type' )

            row = layout.row()
            row.prop(mat, 'THREE_depth_write', 
                text='Enable depth writing' )

            row = layout.row()
            row.prop(mat, 'THREE_depth_test', 
                text='Enable depth testing' )

def _mag_filters(index):
    types = (constants.LINEAR_FILTERS.LINEAR,
        constants.NEAREST_FILTERS.NEAREST)
    return (types[index], types[index], types[index])

bpy.types.Texture.THREE_mag_filter = EnumProperty(
    name='Mag Filter',
    items = [_mag_filters(x) for x in range(2)],
    default=constants.LINEAR_FILTERS.LINEAR)

def _min_filters(index):
    types = (constants.LINEAR_FILTERS.LINEAR,
        constants.LINEAR_FILTERS.MIP_MAP_NEAREST,
        constants.LINEAR_FILTERS.MIP_MAP_LINEAR,
        constants.NEAREST_FILTERS.NEAREST,
        constants.NEAREST_FILTERS.MIP_MAP_NEAREST,
        constants.NEAREST_FILTERS.MIP_MAP_LINEAR)
    return (types[index], types[index], types[index])

bpy.types.Texture.THREE_min_filter = EnumProperty(
    name='Min Filter',
    items = [_min_filters(x) for x in range(6)],
    default=constants.LINEAR_FILTERS.MIP_MAP_LINEAR)

def _mapping(index):
    types = (constants.MAPPING_TYPES.UV,
        constants.MAPPING_TYPES.CUBE_REFLECTION,
        constants.MAPPING_TYPES.CUBE_REFRACTION,
        constants.MAPPING_TYPES.SPHERICAL_REFLECTION)
    return (types[index], types[index], types[index])

bpy.types.Texture.THREE_mapping = EnumProperty(
    name='Mapping',
    items = [_mapping(x) for x in range(4)],
    default=constants.MAPPING_TYPES.UV)

class TEXTURE_PT_hello(bpy.types.Panel):
    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'texture'

    #@TODO: possible to make cycles compatible?
    def draw(self, context):
        layout = self.layout
        tex = context.texture

        if tex is not None:
            row = layout.row()
            row.prop(tex, 'THREE_mapping', text='Mapping')

            row = layout.row()
            row.prop(tex, 'THREE_mag_filter', text='Mag Filter')

            row = layout.row()
            row.prop(tex, 'THREE_min_filter', text='Min Filter')

bpy.types.Object.THREE_export = bpy.props.BoolProperty(default=True)

class OBJECT_PT_hello(bpy.types.Panel):
    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'object'

    def draw(self, context):
        layout = self.layout
        obj = context.object

        row = layout.row()
        row.prop(obj, 'THREE_export', text='Export')

def get_settings_fullpath():
    return os.path.join(bpy.app.tempdir, SETTINGS_FILE_EXPORT)


def save_settings_export(properties):

    settings = {
        constants.VERTICES: properties.option_vertices,
        constants.FACES: properties.option_faces,
        constants.NORMALS: properties.option_normals,
        constants.SKINNING: properties.option_skinning,
        constants.BONES: properties.option_bones,
        constants.GEOMETRY_TYPE: properties.option_geometry_type,

        constants.MATERIALS: properties.option_materials,
        constants.UVS: properties.option_uv_coords,
        constants.FACE_MATERIALS: properties.option_face_materials,
        constants.MAPS: properties.option_maps,
        constants.COLORS: properties.option_colors,
        constants.MIX_COLORS: properties.option_mix_colors,

        constants.SCALE: properties.option_scale,
        constants.ENABLE_PRECISION: properties.option_round_off,
        constants.PRECISION: properties.option_round_value,
        constants.LOGGING: properties.option_logging,
        constants.COMPRESSION: properties.option_compression,
        constants.COPY_TEXTURES: properties.option_copy_textures,

        constants.SCENE: properties.option_export_scene,
        constants.EMBED_GEOMETRY: properties.option_embed_geometry,
        constants.EMBED_ANIMATION: properties.option_embed_animation,
        constants.LIGHTS: properties.option_lights,
        constants.CAMERAS: properties.option_cameras,

        constants.MORPH_TARGETS: properties.option_animation_morph,
        constants.ANIMATION: properties.option_animation_skeletal,
        constants.FRAME_STEP: properties.option_frame_step,
        constants.INFLUENCES_PER_VERTEX: properties.option_influences
    }

    fname = get_settings_fullpath()
    with open(fname, 'w') as stream:
        json.dump(settings, stream)

    return settings


def restore_settings_export(properties):

    settings = {}

    fname = get_settings_fullpath()
    if os.path.exists(fname) and os.access(fname, os.R_OK):
        f = open(fname, 'r')
        settings = json.load(f)

    ## Geometry {
    properties.option_vertices = settings.get(
        constants.VERTICES, 
        constants.EXPORT_OPTIONS[constants.VERTICES])

    properties.option_faces = settings.get(
        constants.FACES, 
        constants.EXPORT_OPTIONS[constants.FACES])
    properties.option_normals = settings.get(
        constants.NORMALS, 
        constants.EXPORT_OPTIONS[constants.NORMALS])

    properties.option_skinning = settings.get(
        constants.SKINNING, 
        constants.EXPORT_OPTIONS[constants.SKINNING])

    properties.option_bones = settings.get(
        constants.BONES, 
        constants.EXPORT_OPTIONS[constants.BONES])

    properties.option_influences = settings.get(
        constants.INFLUENCES_PER_VERTEX,
        constants.EXPORT_OPTIONS[constants.INFLUENCES_PER_VERTEX])

    properties.option_geometry_type = settings.get(
        constants.GEOMETRY_TYPE,
        constants.EXPORT_OPTIONS[constants.GEOMETRY_TYPE])
    ## }

    ## Materials {
    properties.option_materials = settings.get(
        constants.MATERIALS, 
        constants.EXPORT_OPTIONS[constants.MATERIALS])

    properties.option_uv_coords = settings.get(
        constants.UVS, 
        constants.EXPORT_OPTIONS[constants.UVS])

    properties.option_face_materials = settings.get(
        constants.FACE_MATERIALS, 
        constants.EXPORT_OPTIONS[constants.FACE_MATERIALS])

    properties.option_maps = settings.get(
        constants.MAPS, 
        constants.EXPORT_OPTIONS[constants.MAPS])

    properties.option_colors = settings.get(
        constants.COLORS, 
        constants.EXPORT_OPTIONS[constants.COLORS])

    properties.option_mix_colors = settings.get(
        constants.MIX_COLORS, 
        constants.EXPORT_OPTIONS[constants.MIX_COLORS])
    ## }

    ## Settings {
    properties.option_scale = settings.get(
        constants.SCALE, 
        constants.EXPORT_OPTIONS[constants.SCALE])

    properties.option_round_off = settings.get(
        constants.ENABLE_PRECISION, 
        constants.EXPORT_OPTIONS[constants.ENABLE_PRECISION])

    properties.option_round_value = settings.get(
        constants.PRECISION, 
        constants.EXPORT_OPTIONS[constants.PRECISION])

    properties.option_logging = settings.get(
        constants.LOGGING, 
        constants.EXPORT_OPTIONS[constants.LOGGING])

    properties.option_compression = settings.get(
        constants.COMPRESSION, 
        constants.NONE)

    properties.option_copy_textures = settings.get(
        constants.COPY_TEXTURES, 
        constants.EXPORT_OPTIONS[constants.COPY_TEXTURES])

    properties.option_embed_animation = settings.get(
        constants.EMBED_ANIMATION, 
        constants.EXPORT_OPTIONS[constants.EMBED_ANIMATION])
    ## }

    ## Scene {
    properties.option_export_scene = settings.get(
        constants.SCENE, 
        constants.EXPORT_OPTIONS[constants.SCENE])

    properties.option_embed_geometry = settings.get(
        constants.EMBED_GEOMETRY, 
        constants.EXPORT_OPTIONS[constants.EMBED_GEOMETRY])

    properties.option_lights = settings.get(
        constants.LIGHTS, 
        constants.EXPORT_OPTIONS[constants.LIGHTS])

    properties.option_cameras = settings.get(
        constants.CAMERAS, 
        constants.EXPORT_OPTIONS[constants.CAMERAS])
    ## }

    ## Animation {
    properties.option_animation_morph = settings.get(
        constants.MORPH_TARGETS, 
        constants.EXPORT_OPTIONS[constants.MORPH_TARGETS])

    properties.option_animation_skeletal = settings.get(
        constants.ANIMATION, 
        constants.EXPORT_OPTIONS[constants.ANIMATION])

    properties.option_frame_step = settings.get(
        constants.FRAME_STEP, 
        constants.EXPORT_OPTIONS[constants.FRAME_STEP])
    ## }

def compression_types():
    types = [(constants.NONE, constants.NONE, constants.NONE)]

    try:
        import msgpack
        types.append((constants.MSGPACK, constants.MSGPACK, 
            constants.MSGPACK))
    except ImportError:
        pass

    return types

class ExportThree(bpy.types.Operator, ExportHelper):

    bl_idname='export.three'
    bl_label = 'Export THREE'

    filename_ext = constants.EXTENSION

    option_vertices = BoolProperty(
        name='Vertices', 
        description='Export vertices', 
        default=constants.EXPORT_OPTIONS[constants.VERTICES])

    option_faces = BoolProperty(
        name='Faces', 
        description='Export faces', 
        default=constants.EXPORT_OPTIONS[constants.FACES])

    option_normals = BoolProperty(
        name='Normals', 
        description='Export normals', 
        default=constants.EXPORT_OPTIONS[constants.NORMALS])

    option_colors = BoolProperty(
        name='Colors', 
        description='Export vertex colors', 
        default=constants.EXPORT_OPTIONS[constants.COLORS])

    option_mix_colors = BoolProperty(
        name='Mix Colors',
        description='Mix material and vertex colors',
        default=constants.EXPORT_OPTIONS[constants.MIX_COLORS])

    option_uv_coords = BoolProperty(
        name='UVs', 
        description='Export texture coordinates', 
        default=constants.EXPORT_OPTIONS[constants.UVS])

    option_materials = BoolProperty(
        name='Materials', 
        description='Export materials', 
        default=constants.EXPORT_OPTIONS[constants.MATERIALS])

    option_face_materials = BoolProperty(
        name='Face Materials',
        description='Face mapping materials',
        default=constants.EXPORT_OPTIONS[constants.FACE_MATERIALS])

    option_maps = BoolProperty(
        name='Textures',
        description='Include texture maps',
        default=constants.EXPORT_OPTIONS[constants.MAPS])

    option_skinning = BoolProperty(
        name='Skinning', 
        description='Export skin data', 
        default=constants.EXPORT_OPTIONS[constants.SKINNING])

    option_bones = BoolProperty(
        name='Bones', 
        description='Export bones', 
        default=constants.EXPORT_OPTIONS[constants.BONES])

    option_scale = FloatProperty(
        name='Scale', 
        description='Scale vertices', 
        min=0.01, 
        max=1000.0, 
        soft_min=0.01, 
        soft_max=1000.0, 
        default=constants.EXPORT_OPTIONS[constants.SCALE])

    option_round_off = BoolProperty(
        name='Enable Precision',
        description='Round off floating point values',
        default=constants.EXPORT_OPTIONS[constants.ENABLE_PRECISION])

    option_round_value = IntProperty(
        name='Precision',
        min=0,
        max=16,
        description='Floating point precision',
        default=constants.EXPORT_OPTIONS[constants.PRECISION])

    logging_types = [
        (constants.DEBUG, constants.DEBUG, constants.DEBUG),
        (constants.INFO, constants.INFO, constants.INFO),
        (constants.WARNING, constants.WARNING, constants.WARNING),
        (constants.ERROR, constants.ERROR, constants.ERROR),
        (constants.CRITICAL, constants.CRITICAL, constants.CRITICAL)]

    option_logging = EnumProperty(
        name='Logging', 
        description = 'Logging verbosity level', 
        items=logging_types, 
        default=constants.DEBUG)

    option_geometry_type = EnumProperty(
        name='Type',
        description='Geometry type',
        items=_geometry_types()[1:],
        default=constants.GEOMETRY)

    option_export_scene = BoolProperty(
        name='Scene', 
        description='Export scene', 
        default=constants.EXPORT_OPTIONS[constants.SCENE])

    option_embed_geometry = BoolProperty(
        name='Embed geometry', 
        description='Embed geometry', 
        default=constants.EXPORT_OPTIONS[constants.EMBED_GEOMETRY])

    option_embed_animation = BoolProperty(
        name='Embed animation', 
        description='Embed animation data with the geometry data', 
        default=constants.EXPORT_OPTIONS[constants.EMBED_ANIMATION])

    option_copy_textures = BoolProperty(
        name='Copy textures', 
        description='Copy textures', 
        default=constants.EXPORT_OPTIONS[constants.COPY_TEXTURES])

    option_lights = BoolProperty(
        name='Lights', 
        description='Export default scene lights', 
        default=False)

    option_cameras = BoolProperty(
        name='Cameras', 
        description='Export default scene cameras', 
        default=False)

    option_animation_morph = BoolProperty(
        name='Morph animation', 
        description='Export animation (morphs)', 
        default=constants.EXPORT_OPTIONS[constants.MORPH_TARGETS])

    option_animation_skeletal = BoolProperty(
        name='Skeletal animation', 
        description='Export animation (skeletal)', 
        default=constants.EXPORT_OPTIONS[constants.ANIMATION])

    option_frame_step = IntProperty(
        name='Frame step', 
        description='Animation frame step', 
        min=1, 
        max=1000, 
        soft_min=1, 
        soft_max=1000, 
        default=1)
 
    option_compression = EnumProperty(
        name='Compression', 
        description = 'Compression options', 
        items=compression_types(), 
        default=constants.NONE)

    option_influences = IntProperty(
        name='Influences',
        description='Maximum number of bone influences',
        min=1,
        max=4,
        default=2)

    def invoke(self, context, event):
        restore_settings_export(self.properties)
        return ExportHelper.invoke(self, context, event)

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        if not self.properties.filepath:
            raise Exception('filename not set')

        settings = save_settings_export(self.properties)

        filepath = self.filepath
        if settings[constants.COMPRESSION] == constants.MSGPACK:
            filepath = '%s%s' % (filepath[:-4], constants.PACK)

        from io_three import exporter
        if settings[constants.SCENE]:
            exporter.export_scene(filepath, settings)
        else:
            exporter.export_geometry(filepath, settings)

        return {'FINISHED'}

    def draw(self, context):
        layout = self.layout

        ## Geometry {
        row = layout.row()
        row.label(text='Geometry:')

        row = layout.row()
        row.prop(self.properties, 'option_vertices')
        row.prop(self.properties, 'option_faces')

        row = layout.row()
        row.prop(self.properties, 'option_normals')

        row = layout.row()
        row.prop(self.properties, 'option_bones')
        row.prop(self.properties, 'option_skinning')

        row = layout.row()
        row.prop(self.properties, 'option_geometry_type')

        row = layout.row()
        row.prop(self.properties, 'option_influences')
        ## }

        layout.separator()

        ## Materials {
        row = layout.row()
        row.label(text='Materials:')

        row = layout.row()
        row.prop(self.properties, 'option_materials')
        row.prop(self.properties, 'option_uv_coords')

        row = layout.row()
        row.prop(self.properties, 'option_face_materials')
        row.prop(self.properties, 'option_maps')

        row = layout.row()
        row.prop(self.properties, 'option_colors')
        row.prop(self.properties, 'option_mix_colors')
        ## }
    
        layout.separator()

        ## Settings {
        row = layout.row()
        row.label(text='Settings:')

        row = layout.row()
        row.prop(self.properties, 'option_scale')
        
        row = layout.row()
        row.prop(self.properties, 'option_round_off')
        row.prop(self.properties, 'option_round_value')

        row = layout.row()
        row.prop(self.properties, 'option_logging')

        row = layout.row()
        row.prop(self.properties, 'option_compression')

        row = layout.row()
        row.prop(self.properties, 'option_copy_textures')

        row = layout.row()
        row.prop(self.properties, 'option_embed_animation')
        ## }

        layout.separator()

        ## Scene {
        row = layout.row()
        row.label(text='Scene:')

        row = layout.row()
        row.prop(self.properties, 'option_export_scene')

        row = layout.row()
        row.prop(self.properties, 'option_embed_geometry')

        row = layout.row()
        row.prop(self.properties, 'option_lights')
        row.prop(self.properties, 'option_cameras')
        ## }

        layout.separator()

        ## Animation {
        row = layout.row()
        row.label(text='Animation:')

        row = layout.row()
        row.prop(self.properties, 'option_animation_morph')
        row = layout.row()
        row.prop(self.properties, 'option_animation_skeletal')
        row = layout.row()
        row.prop(self.properties, 'option_frame_step')
        ## }

def menu_func_export(self, context):
    default_path = bpy.data.filepath.replace('.blend', constants.EXTENSION)
    text = 'Three (%s)' % constants.EXTENSION
    operator = self.layout.operator(ExportThree.bl_idname, text=text)
    operator.filepath = default_path


def register():
    bpy.utils.register_module(__name__)
    bpy.types.INFO_MT_file_export.append(menu_func_export)


def unregister():
    bpy.utils.unregister_module(__name__)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)


if __name__ == '__main__':
    register() 
