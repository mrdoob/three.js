import os
import sys
import traceback
from .. import constants, logger, exceptions
from . import scene, geometry, api, base_classes


def _error_handler(func):
    
    def inner(filepath, options, *args, **kwargs):
        level = options.get(constants.LOGGING, constants.DEBUG)
        logger.init('io_three.export.log', level=level)
        api.init()
        
        try:
            func(filepath, options, *args, **kwargs)
        except:
            info = sys.exc_info()
            trace = traceback.format_exception(
                info[0], info[1], info[2].tb_next)
            trace = ''.join(trace)
            logger.error(trace)
            
            print('Error recorded to %s' % logger.LOG_FILE)

            raise
        else:
            print('Log: %s' % logger.LOG_FILE)

    return inner


@_error_handler
def export_scene(filepath, options):
    selected = []

    # during scene exports unselect everything. this is needed for
    # applying modifiers, if it is necessary
    # record the selected nodes so that selection is restored later
    for obj in api.selected_objects():
        api.object.unselect(obj)
        selected.append(obj)
    active = api.active_object()

    try:
        scene_ = scene.Scene(filepath, options=options)
        scene_.parse()
        scene_.write()
    except:
        _restore_selection(selected, active)
        raise
        
    _restore_selection(selected, active)


@_error_handler
def export_geometry(filepath, options, node=None):
    if node is None:
        node = api.active_object()
        if node is None:
            msg = 'Nothing selected'
            logger.error(msg)
            raise exceptions.SelectionError(msg)
        if node.type != 'MESH':
            msg = 'Not a valid mesh object'
            raise exceptions.GeometryError(msg)
    
    mesh = api.object.mesh(node, options)
    parent = base_classes.BaseScene(filepath, options)
    geo = geometry.Geometry(mesh, parent)
    geo.parse()
    geo.write()
    
    if not options.get(constants.EMBED_ANIMATION, True):
        geo.write_animation(os.path.dirname(filepath))


def _restore_selection(objects, active):
    for obj in objects:
        api.object.select(obj)

    api.set_active_object(active)
