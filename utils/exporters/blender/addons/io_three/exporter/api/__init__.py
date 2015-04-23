import os
import bpy
from . import object as object_, mesh, material, camera, light
from .. import logger


def active_object():
    """

    :return: The actively selected object

    """
    return bpy.context.scene.objects.active


def batch_mode():
    """

    :return: Whether or not the session is interactive
    :rtype: bool

    """
    return bpy.context.area is None


def data(node):
    """

    :param node: name of an object node
    :returns: the data block of the node

    """
    try:
        return bpy.data.objects[node].data
    except KeyError:
        pass

def init():
    """Initializing the api module. Required first step before
    initializing the actual export process.
    """
    logger.debug("Initializing API")
    object_.clear_mesh_map()


def selected_objects(valid_types=None):
    """Selected objects.

    :param valid_types: Filter for valid types (Default value = None)

    """
    logger.debug("api.selected_objects(%s)", valid_types)
    for node in bpy.context.selected_objects:
        if valid_types is None:
            yield node.name
        elif valid_types is not None and node.type in valid_types:
            yield node.name


def set_active_object(obj):
    """Set the object as active in the scene

    :param obj:

    """
    logger.debug("api.set_active_object(%s)", obj)
    bpy.context.scene.objects.active = obj


def scene_name():
    """

    :return: name of the current scene

    """
    return os.path.basename(bpy.data.filepath)

