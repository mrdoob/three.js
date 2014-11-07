import os
import bpy
from . import object, mesh, material, camera, light
from .. import logger


def active_object():
    return bpy.context.scene.objects.active


def init():
    logger.debug('Initializing API')
    object._MESH_MAP.clear()


def selected_objects(valid_types=None):
    logger.debug('api.selected_objects(%s)', valid_types)
    for node in bpy.context.selected_objects:
        if valid_types is None:
            yield node.name
        elif valid_types is not None and node.type in valid_types:
            yield node.name


def set_active_object(obj):
    bpy.context.scene.objects.active = obj


def scene_name():
    return os.path.basename(bpy.data.filepath)

