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
import logging

import bpy
from bpy_extras.io_utils import ExportHelper
from bpy.props import (
    EnumProperty,
    BoolProperty,
    FloatProperty,
    IntProperty,
    StringProperty
)

from . import constants

logging.basicConfig(
    format='%(levelname)s:THREE:%(message)s',
    level=logging.DEBUG)

bl_info = {
    'name': "Three.js Format",
    'author': "repsac, mrdoob, yomotsu, mpk, jpweeks, rkusa, tschw, jackcaron, bhouston",
    'version': (1, 5, 0),
    'blender': (2, 74, 0),
    'location': "File > Export",
    'description': "Export Three.js formatted JSON files.",
    'warning': "Importer not included.",
    'wiki_url': "https://github.com/mrdoob/three.js/tree/"\
        "master/utils/exporters/blender",
    'tracker_url':  "https://github.com/mrdoob/three.js/issues",
    'category': 'Import-Export'
}


def _geometry_types():
    """The valid geometry types that are supported by Three.js

    :return: list of tuples

    """
    keys = (constants.GLOBAL,
            constants.GEOMETRY,
            constants.BUFFER_GEOMETRY)
    types = []
    for key in keys:
        types.append((key, key.title(), key))

    return types

bpy.types.Mesh.THREE_geometry_type = EnumProperty(
    name="Geometry type",
    description="Geometry type",
    items=_geometry_types(),
    default=constants.GLOBAL)

class ThreeMesh(bpy.types.Panel):
    """Creates custom properties on a mesh node"""

    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'data'

    def draw(self, context):
        """

        :param context:

        """
        row = self.layout.row()
        if context.mesh:
            row.prop(context.mesh,
                     'THREE_geometry_type',
                     text="Type")

def _blending_types(index):
    """Supported blending types for Three.js

    :param index:
    :type index: int
    :returns: tuple if types (str, str, str)

    """
    types = (constants.BLENDING_TYPES.NONE,
             constants.BLENDING_TYPES.NORMAL,
             constants.BLENDING_TYPES.ADDITIVE,
             constants.BLENDING_TYPES.SUBTRACTIVE,
             constants.BLENDING_TYPES.MULTIPLY,
             constants.BLENDING_TYPES.CUSTOM)
    return (types[index], types[index], types[index])

bpy.types.Material.THREE_blending_type = EnumProperty(
    name="Blending type",
    description="Blending type",
    items=[_blending_types(x) for x in range(5)],
    default=constants.BLENDING_TYPES.NORMAL)

bpy.types.Material.THREE_depth_write = BoolProperty(default=True)
bpy.types.Material.THREE_depth_test = BoolProperty(default=True)
bpy.types.Material.THREE_double_sided = BoolProperty(default=False)

class ThreeMaterial(bpy.types.Panel):
    """Adds custom properties to the Materials of an object"""

    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'material'

    def draw(self, context):
        """

        :param context:

        """
        layout = self.layout
        mat = context.material

        if mat is not None:
            row = layout.row()
            row.label(text="Selected material: %s" % mat.name)

            row = layout.row()
            row.prop(mat, 'THREE_blending_type',
                     text="Blending type")

            row = layout.row()
            row.prop(mat, 'THREE_depth_write',
                     text="Enable depth writing")

            row = layout.row()
            row.prop(mat, 'THREE_depth_test',
                     text="Enable depth testing")

            row = layout.row()
            row.prop(mat, 'THREE_double_sided',
                     text="Double-sided")

def _mag_filters(index):
    """Three.js mag filters

    :param index:
    :type index: int
    :returns: tuple with the filter values

    """
    types = (constants.LINEAR_FILTERS.LINEAR,
             constants.NEAREST_FILTERS.NEAREST)
    return (types[index], types[index], types[index])

bpy.types.Texture.THREE_mag_filter = EnumProperty(
    name="Mag Filter",
    items=[_mag_filters(x) for x in range(2)],
    default=constants.LINEAR_FILTERS.LINEAR)

def _min_filters(index):
    """Three.js min filters

    :param index:
    :type index: int
    :returns: tuple with the filter values

    """
    types = (constants.LINEAR_FILTERS.LINEAR,
             constants.LINEAR_FILTERS.MIP_MAP_NEAREST,
             constants.LINEAR_FILTERS.MIP_MAP_LINEAR,
             constants.NEAREST_FILTERS.NEAREST,
             constants.NEAREST_FILTERS.MIP_MAP_NEAREST,
             constants.NEAREST_FILTERS.MIP_MAP_LINEAR)
    return (types[index], types[index], types[index])

bpy.types.Texture.THREE_min_filter = EnumProperty(
    name="Min Filter",
    items=[_min_filters(x) for x in range(6)],
    default=constants.LINEAR_FILTERS.MIP_MAP_LINEAR)

def _mapping(index):
    """Three.js texture mappings types

    :param index:
    :type index: int
    :returns: tuple with the mapping values

    """
    types = (constants.MAPPING_TYPES.UV,
             constants.MAPPING_TYPES.CUBE_REFLECTION,
             constants.MAPPING_TYPES.CUBE_REFRACTION,
             constants.MAPPING_TYPES.SPHERICAL_REFLECTION)
    return (types[index], types[index], types[index])

bpy.types.Texture.THREE_mapping = EnumProperty(
    name="Mapping",
    items=[_mapping(x) for x in range(4)],
    default=constants.MAPPING_TYPES.UV)

class ThreeTexture(bpy.types.Panel):
    """Adds custom properties to a texture"""
    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'texture'

    #@TODO: possible to make cycles compatible?
    def draw(self, context):
        """

        :param context:

        """
        layout = self.layout
        tex = context.texture

        if tex is not None:
            row = layout.row()
            row.prop(tex, 'THREE_mapping', text="Mapping")

            row = layout.row()
            row.prop(tex, 'THREE_mag_filter', text="Mag Filter")

            row = layout.row()
            row.prop(tex, 'THREE_min_filter', text="Min Filter")

bpy.types.Object.THREE_export = bpy.props.BoolProperty(default=True)

class ThreeObject(bpy.types.Panel):
    """Adds custom properties to an object"""
    bl_label = 'THREE'
    bl_space_type = 'PROPERTIES'
    bl_region_type = 'WINDOW'
    bl_context = 'object'

    def draw(self, context):
        """

        :param context:

        """
        layout = self.layout
        obj = context.object

        row = layout.row()
        row.prop(obj, 'THREE_export', text='Export')

class ThreeExportSettings(bpy.types.Operator):
    """Save the current export settings (gets saved in .blend)"""
    bl_label = "Save Settings"
    bl_idname = "scene.three_export_settings_set"

    def execute(self, context):
        cycles = context.scene.cycles
        cycles.use_samples_final = True

        context.scene[constants.EXPORT_SETTINGS_KEY] = set_settings(context.active_operator.properties)

        self.report({"INFO"}, "Three Export Settings Saved")

        return {"FINISHED"}

def restore_export_settings(properties, settings):
    """Restore the settings

    :param properties:

    """

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

    properties.option_apply_modifiers = settings.get(
        constants.APPLY_MODIFIERS,
        constants.EXPORT_OPTIONS[constants.APPLY_MODIFIERS])

    properties.option_extra_vgroups = settings.get(
        constants.EXTRA_VGROUPS,
        constants.EXPORT_OPTIONS[constants.EXTRA_VGROUPS])

    properties.option_geometry_type = settings.get(
        constants.GEOMETRY_TYPE,
        constants.EXPORT_OPTIONS[constants.GEOMETRY_TYPE])

    properties.option_index_type = settings.get(
        constants.INDEX_TYPE,
        constants.EXPORT_OPTIONS[constants.INDEX_TYPE])
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

    properties.option_indent = settings.get(
        constants.INDENT,
        constants.EXPORT_OPTIONS[constants.INDENT])

    properties.option_copy_textures = settings.get(
        constants.COPY_TEXTURES,
        constants.EXPORT_OPTIONS[constants.COPY_TEXTURES])

    properties.option_texture_folder = settings.get(
        constants.TEXTURE_FOLDER,
        constants.EXPORT_OPTIONS[constants.TEXTURE_FOLDER])

    properties.option_embed_animation = settings.get(
        constants.EMBED_ANIMATION,
        constants.EXPORT_OPTIONS[constants.EMBED_ANIMATION])
    ## }

    ## Scene {
    properties.option_export_scene = settings.get(
        constants.SCENE,
        constants.EXPORT_OPTIONS[constants.SCENE])

    #properties.option_embed_geometry = settings.get(
    #    constants.EMBED_GEOMETRY,
    #    constants.EXPORT_OPTIONS[constants.EMBED_GEOMETRY])

    properties.option_lights = settings.get(
        constants.LIGHTS,
        constants.EXPORT_OPTIONS[constants.LIGHTS])

    properties.option_cameras = settings.get(
        constants.CAMERAS,
        constants.EXPORT_OPTIONS[constants.CAMERAS])

    properties.option_hierarchy = settings.get(
        constants.HIERARCHY,
        constants.EXPORT_OPTIONS[constants.HIERARCHY])
    ## }

    ## Animation {
    properties.option_animation_morph = settings.get(
        constants.MORPH_TARGETS,
        constants.EXPORT_OPTIONS[constants.MORPH_TARGETS])

    properties.option_blend_shape = settings.get(
        constants.BLEND_SHAPES,
        constants.EXPORT_OPTIONS[constants.BLEND_SHAPES])

    properties.option_animation_skeletal = settings.get(
        constants.ANIMATION,
        constants.EXPORT_OPTIONS[constants.ANIMATION])

    properties.option_keyframes = settings.get(
        constants.KEYFRAMES,
        constants.EXPORT_OPTIONS[constants.KEYFRAMES])

    properties.option_frame_step = settings.get(
        constants.FRAME_STEP,
        constants.EXPORT_OPTIONS[constants.FRAME_STEP])

    properties.option_frame_index_as_time = settings.get(
        constants.FRAME_INDEX_AS_TIME,
        constants.EXPORT_OPTIONS[constants.FRAME_INDEX_AS_TIME])
    ## }

def set_settings(properties):
    """Set the export settings to the correct keys.

    :param properties:
    :returns: settings
    :rtype: dict

    """
    settings = {
        constants.VERTICES: properties.option_vertices,
        constants.FACES: properties.option_faces,
        constants.NORMALS: properties.option_normals,
        constants.SKINNING: properties.option_skinning,
        constants.BONES: properties.option_bones,
        constants.EXTRA_VGROUPS: properties.option_extra_vgroups,
        constants.APPLY_MODIFIERS: properties.option_apply_modifiers,
        constants.GEOMETRY_TYPE: properties.option_geometry_type,
        constants.INDEX_TYPE: properties.option_index_type,

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
        constants.INDENT: properties.option_indent,
        constants.COPY_TEXTURES: properties.option_copy_textures,
        constants.TEXTURE_FOLDER: properties.option_texture_folder,

        constants.SCENE: properties.option_export_scene,
        #constants.EMBED_GEOMETRY: properties.option_embed_geometry,
        constants.EMBED_ANIMATION: properties.option_embed_animation,
        constants.LIGHTS: properties.option_lights,
        constants.CAMERAS: properties.option_cameras,
        constants.HIERARCHY: properties.option_hierarchy,

        constants.MORPH_TARGETS: properties.option_animation_morph,
        constants.BLEND_SHAPES: properties.option_blend_shape,
        constants.ANIMATION: properties.option_animation_skeletal,
        constants.KEYFRAMES: properties.option_keyframes,
        constants.FRAME_STEP: properties.option_frame_step,
        constants.FRAME_INDEX_AS_TIME: properties.option_frame_index_as_time,
        constants.INFLUENCES_PER_VERTEX: properties.option_influences
    }

    return settings


def compression_types():
    """Supported compression formats

    :rtype: tuple

    """
    types = [(constants.NONE, constants.NONE, constants.NONE)]

    try:
        import msgpack
        types.append((constants.MSGPACK, constants.MSGPACK,
                      constants.MSGPACK))
    except ImportError:
        pass

    return types


def animation_options():
    """The supported skeletal animation types

    :returns: list of tuples

    """
    anim = [
        (constants.OFF, constants.OFF.title(), constants.OFF),
        (constants.POSE, constants.POSE.title(), constants.POSE),
        (constants.REST, constants.REST.title(), constants.REST)
    ]

    return anim

class ExportThree(bpy.types.Operator, ExportHelper):
    """Class that handles the export properties"""

    bl_idname = 'export.three'
    bl_label = 'Export THREE'
    bl_options = {'PRESET'}

    filename_ext = constants.EXTENSION

    option_vertices = BoolProperty(
        name="Vertices",
        description="Export vertices",
        default=constants.EXPORT_OPTIONS[constants.VERTICES])

    option_faces = BoolProperty(
        name="Faces",
        description="Export faces",
        default=constants.EXPORT_OPTIONS[constants.FACES])

    option_normals = BoolProperty(
        name="Normals",
        description="Export normals",
        default=constants.EXPORT_OPTIONS[constants.NORMALS])

    option_colors = BoolProperty(
        name="Vertex Colors",
        description="Export vertex colors",
        default=constants.EXPORT_OPTIONS[constants.COLORS])

    option_mix_colors = BoolProperty(
        name="Mix Colors",
        description="Mix material and vertex colors",
        default=constants.EXPORT_OPTIONS[constants.MIX_COLORS])

    option_uv_coords = BoolProperty(
        name="UVs",
        description="Export texture coordinates",
        default=constants.EXPORT_OPTIONS[constants.UVS])

    option_materials = BoolProperty(
        name="Materials",
        description="Export materials",
        default=constants.EXPORT_OPTIONS[constants.MATERIALS])

    option_face_materials = BoolProperty(
        name="Face Materials",
        description="Face mapping materials",
        default=constants.EXPORT_OPTIONS[constants.FACE_MATERIALS])

    option_maps = BoolProperty(
        name="Textures",
        description="Include texture maps",
        default=constants.EXPORT_OPTIONS[constants.MAPS])

    option_skinning = BoolProperty(
        name="Skinning",
        description="Export skin data",
        default=constants.EXPORT_OPTIONS[constants.SKINNING])

    option_bones = BoolProperty(
        name="Bones",
        description="Export bones",
        default=constants.EXPORT_OPTIONS[constants.BONES])

    option_extra_vgroups = StringProperty(
        name="Extra Vertex Groups",
        description="Non-skinning vertex groups to export (comma-separated, w/ star wildcard, BufferGeometry only).",
        default=constants.EXPORT_OPTIONS[constants.EXTRA_VGROUPS])

    option_apply_modifiers = BoolProperty(
        name="Apply Modifiers",
        description="Apply Modifiers to mesh objects",
        default=constants.EXPORT_OPTIONS[constants.APPLY_MODIFIERS]
    )

    index_buffer_types = [
        (constants.NONE,) * 3,
        (constants.UINT_16,) * 3,
        (constants.UINT_32,) * 3]

    option_index_type = EnumProperty(
        name="Index Buffer",
        description="Index buffer type that will be used for BufferGeometry objects.",
        items=index_buffer_types,
        default=constants.EXPORT_OPTIONS[constants.INDEX_TYPE])

    option_scale = FloatProperty(
        name="Scale",
        description="Scale vertices",
        min=0.01,
        max=1000.0,
        soft_min=0.01,
        soft_max=1000.0,
        default=constants.EXPORT_OPTIONS[constants.SCALE])

    option_round_off = BoolProperty(
        name="Enable Precision",
        description="Round off floating point values",
        default=constants.EXPORT_OPTIONS[constants.ENABLE_PRECISION])

    option_round_value = IntProperty(
        name="Precision",
        min=0,
        max=16,
        description="Floating point precision",
        default=constants.EXPORT_OPTIONS[constants.PRECISION])

    logging_types = [
        (constants.DISABLED, constants.DISABLED, constants.DISABLED),
        (constants.DEBUG, constants.DEBUG, constants.DEBUG),
        (constants.INFO, constants.INFO, constants.INFO),
        (constants.WARNING, constants.WARNING, constants.WARNING),
        (constants.ERROR, constants.ERROR, constants.ERROR),
        (constants.CRITICAL, constants.CRITICAL, constants.CRITICAL)]

    option_logging = EnumProperty(
        name="",
        description="Logging verbosity level",
        items=logging_types,
        default=constants.DISABLED)

    option_geometry_type = EnumProperty(
        name="Type",
        description="Geometry type",
        items=_geometry_types()[1:],
        default=constants.EXPORT_OPTIONS[constants.GEOMETRY_TYPE])

    option_export_scene = BoolProperty(
        name="Scene",
        description="Export scene",
        default=constants.EXPORT_OPTIONS[constants.SCENE])

    #@TODO: removing this option since the ObjectLoader doesn't have
    #       support for handling external geometry data
    #option_embed_geometry = BoolProperty(
    #    name="Embed geometry",
    #    description="Embed geometry",
    #    default=constants.EXPORT_OPTIONS[constants.EMBED_GEOMETRY])

    option_embed_animation = BoolProperty(
        name="Embed animation",
        description="Embed animation data with the geometry data",
        default=constants.EXPORT_OPTIONS[constants.EMBED_ANIMATION])

    option_copy_textures = BoolProperty(
        name="Copy textures",
        description="Copy textures",
        default=constants.EXPORT_OPTIONS[constants.COPY_TEXTURES])

    option_texture_folder = StringProperty(
        name="Texture folder",
        description="add this folder to textures path",
        default=constants.EXPORT_OPTIONS[constants.TEXTURE_FOLDER])

    option_lights = BoolProperty(
        name="Lights",
        description="Export default scene lights",
        default=False)

    option_cameras = BoolProperty(
        name="Cameras",
        description="Export default scene cameras",
        default=False)

    option_hierarchy = BoolProperty(
        name="Hierarchy",
        description="Export object hierarchy",
        default=False)

    option_animation_morph = BoolProperty(
        name="Morph animation",
        description="Export animation (morphs)",
        default=constants.EXPORT_OPTIONS[constants.MORPH_TARGETS])

    option_blend_shape = BoolProperty(
        name="Blend Shape animation",
        description="Export Blend Shapes",
        default=constants.EXPORT_OPTIONS[constants.BLEND_SHAPES])

    option_animation_skeletal = EnumProperty(
        name="",
        description="Export animation (skeletal)",
        items=animation_options(),
        default=constants.OFF)

    option_keyframes = BoolProperty(
        name="Keyframe animation",
        description="Export animation (keyframes)",
        default=constants.EXPORT_OPTIONS[constants.KEYFRAMES])

    option_frame_index_as_time = BoolProperty(
        name="Frame index as time",
        description="Use (original) frame index as frame time",
        default=constants.EXPORT_OPTIONS[constants.FRAME_INDEX_AS_TIME])

    option_frame_step = IntProperty(
        name="Frame step",
        description="Animation frame step",
        min=1,
        max=1000,
        soft_min=1,
        soft_max=1000,
        default=1)

    option_indent = BoolProperty(
        name="Indent JSON",
        description="Disable this to reduce the file size",
        default=constants.EXPORT_OPTIONS[constants.INDENT])

    option_compression = EnumProperty(
        name="",
        description="Compression options",
        items=compression_types(),
        default=constants.NONE)

    option_influences = IntProperty(
        name="Influences",
        description="Maximum number of bone influences",
        min=1,
        max=4,
        default=2)

    def invoke(self, context, event):
        settings = context.scene.get(constants.EXPORT_SETTINGS_KEY)
        if settings:
            try:
                restore_export_settings(self.properties, settings)
            except AttributeError as e:
                logging.error("Loading export settings failed:")
                logging.exception(e)
                logging.debug("Removed corrupted settings")

                del context.scene[constants.EXPORT_SETTINGS_KEY]

        return ExportHelper.invoke(self, context, event)

    @classmethod
    def poll(cls, context):
        """

        :param context:

        """
        return context.active_object is not None

    def execute(self, context):
        """

        :param context:

        """
        if not self.properties.filepath:
            raise Exception("filename not set")

        settings = set_settings(self.properties)
        settings['addon_version'] = bl_info['version']

        filepath = self.filepath
        if settings[constants.COMPRESSION] == constants.MSGPACK:
            filepath = "%s%s" % (filepath[:-4], constants.PACK)

        from io_three import exporter
        if settings[constants.SCENE]:
            exporter.export_scene(filepath, settings)
        else:
            exporter.export_geometry(filepath, settings)

        return {'FINISHED'}

    def draw(self, context):
        """

        :param context:

        """
        layout = self.layout

        ## Geometry {
        row = layout.row()
        row.label(text="GEOMETRY:")

        row = layout.row()
        row.prop(self.properties, 'option_vertices')
        row.prop(self.properties, 'option_faces')

        row = layout.row()
        row.prop(self.properties, 'option_normals')
        row.prop(self.properties, 'option_uv_coords')

        row = layout.row()
        row.prop(self.properties, 'option_bones')
        row.prop(self.properties, 'option_skinning')

        row = layout.row()
        row.prop(self.properties, 'option_extra_vgroups')

        row = layout.row()
        row.prop(self.properties, 'option_apply_modifiers')

        row = layout.row()
        row.prop(self.properties, 'option_geometry_type')

        row = layout.row()
        row.prop(self.properties, 'option_index_type')

        ## }

        layout.separator()

        ## Materials {
        row = layout.row()
        row.label(text="- Shading:")

        row = layout.row()
        row.prop(self.properties, 'option_face_materials')

        row = layout.row()
        row.prop(self.properties, 'option_colors')

        row = layout.row()
        row.prop(self.properties, 'option_mix_colors')
        ## }

        layout.separator()

        ## Animation {
        row = layout.row()
        row.label(text="- Animation:")

        row = layout.row()
        row.prop(self.properties, 'option_animation_morph')

        row = layout.row()
        row.prop(self.properties, 'option_blend_shape')

        row = layout.row()
        row.label(text="Skeletal animations:")

        row = layout.row()
        row.prop(self.properties, 'option_animation_skeletal')

        row = layout.row()
        row.label(text="Keyframe animations:")

        row = layout.row()
        row.prop(self.properties, 'option_keyframes')

        layout.row()
        row = layout.row()
        row.prop(self.properties, 'option_influences')

        row = layout.row()
        row.prop(self.properties, 'option_frame_step')

        row = layout.row()
        row.prop(self.properties, 'option_frame_index_as_time')

        row = layout.row()
        row.prop(self.properties, 'option_embed_animation')

        ## }

        layout.separator()

        ## Scene {
        row = layout.row()
        row.label(text="SCENE:")

        row = layout.row()
        row.prop(self.properties, 'option_export_scene')
        row.prop(self.properties, 'option_materials')

        #row = layout.row()
        #row.prop(self.properties, 'option_embed_geometry')

        row = layout.row()
        row.prop(self.properties, 'option_lights')
        row.prop(self.properties, 'option_cameras')
        ## }

        row = layout.row()
        row.prop(self.properties, 'option_hierarchy')

        layout.separator()

        ## Settings {
        row = layout.row()
        row.label(text="SETTINGS:")

        row = layout.row()
        row.prop(self.properties, 'option_maps')

        row = layout.row()
        row.prop(self.properties, 'option_copy_textures')

        row = layout.row()
        row.prop(self.properties, 'option_texture_folder')

        row = layout.row()
        row.prop(self.properties, 'option_scale')

        layout.row()
        row = layout.row()
        row.prop(self.properties, 'option_round_off')
        row = layout.row()
        row.prop(self.properties, 'option_round_value')

        layout.row()
        row = layout.row()
        row.label(text="Logging verbosity:")

        row = layout.row()
        row.prop(self.properties, 'option_logging')

        row = layout.row()
        row.label(text="File compression format:")

        row = layout.row()
        row.prop(self.properties, 'option_compression')

        row = layout.row()
        row.prop(self.properties, 'option_indent')
        ## }

        ## Operators {
        has_settings = context.scene.get(constants.EXPORT_SETTINGS_KEY, False)
        row = layout.row()
        row.operator(
            ThreeExportSettings.bl_idname,
            ThreeExportSettings.bl_label,
            icon="%s" % "PINNED" if has_settings else "UNPINNED")
        ## }



def menu_func_export(self, context):
    """

    :param self:
    :param context:

    """
    default_path = bpy.data.filepath.replace('.blend', constants.EXTENSION)
    text = "Three.js (%s)" % constants.EXTENSION
    operator = self.layout.operator(ExportThree.bl_idname, text=text)
    operator.filepath = default_path


def register():
    """Registers the addon (Blender boilerplate)"""
    bpy.utils.register_module(__name__)
    bpy.types.INFO_MT_file_export.append(menu_func_export)


def unregister():
    """Unregisters the addon (Blender boilerplate)"""
    bpy.utils.unregister_module(__name__)
    bpy.types.INFO_MT_file_export.remove(menu_func_export)


if __name__ == '__main__':
    register()
