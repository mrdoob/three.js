import math
import mathutils
import bpy
from bpy import data, context, types
from .. import constants, logger, utilities, exceptions
from .constants import (
    MESH,
    EMPTY,
    ARMATURE,
    LAMP,
    SPOT,
    SUN,
    POINT,
    HEMI,
    AREA,
    CAMERA,
    PERSP,
    ORTHO,
    RENDER,
    ZYX,
    NO_SHADOW
)

ROTATE_X_PI2 = mathutils.Quaternion((1.0, 0.0, 0.0), 
    math.radians(-90.0)).to_matrix().to_4x4()


# Blender doesn't seem to have a good way to link a mesh back to the
# objects that are instancing it, or it is bloody obvious and I haven't
# discovered yet. This manifest serves as a way for me to map a mesh
# node to the object nodes that are using it.
_MESH_MAP = {}


def _object(func):

    def inner(name, *args, **kwargs):

        if isinstance(name, types.Object):
            obj = name
        else:
            obj = data.objects[name]

        return func(obj, *args, **kwargs)

    return inner


def assemblies(valid_types):
    logger.debug('object.assemblies(%s)', valid_types)
    for obj in data.objects:
        if not obj.parent and obj.type in valid_types:
            yield obj.name
        elif obj.parent and not obj.parent.parent \
        and obj.parent.type == ARMATURE:
            logger.info('Has armature parent %s', obj.name)
            yield obj.name


@_object
def cast_shadow(obj):
    logger.debug('object.cast_shadow(%s)', obj)
    if obj.type == LAMP:
        if obj.data.type in (SPOT, SUN):
            ret = obj.data.shadow_method != NO_SHADOW
        else:
            logger.info('%s is a lamp but this lamp type does not '\
                'have supported shadows in ThreeJS', obj.name)
            ret = None
        return ret
    elif obj.type == MESH:
        mat = material(obj)
        if mat:
            return data.materials[mat].use_cast_shadows
        else:
            return False


@_object
def children(obj, valid_types):
    logger.debug('object.children(%s, %s)', obj, valid_types)
    for child in obj.children:
        if child.type in valid_types:
            yield child.name


@_object
def material(obj):
    logger.debug('object.material(%s)', obj)
    try:
        return obj.material_slots[0].name
    except IndexError:
        pass


@_object
def mesh(obj, options):
    logger.debug('object.mesh(%s, %s)', obj, options)
    if obj.type != MESH:
        return
    
    for mesh, objects in _MESH_MAP.items():
        if obj in objects:
            return mesh
    else:
        logger.debug('Could not map object, updating manifest')
        mesh = extract_mesh(obj, options)
        if len(mesh.tessfaces) is not 0:
            manifest = _MESH_MAP.setdefault(mesh.name, [])
            manifest.append(obj)
            mesh = mesh.name
        else:
            # possibly just being used as a controller
            logger.info('Object %s has no faces', obj.name)
            mesh = None

    return mesh


@_object
def name(obj):
    return obj.name


@_object
def node_type(obj):
    logger.debug('object.node_type(%s)', obj)
    # standard transformation nodes are inferred
    if obj.type == MESH: 
        return constants.MESH.title()
    elif obj.type == EMPTY:
        return constants.OBJECT.title()

    dispatch = {
        LAMP: {
            POINT: constants.POINT_LIGHT,
            SUN: constants.DIRECTIONAL_LIGHT,
            SPOT: constants.SPOT_LIGHT,
            HEMI: constants.HEMISPHERE_LIGHT,
            AREA: constants.AREA_LIGHT,
        },
        CAMERA: {
            PERSP: constants.PERSPECTIVE_CAMERA,
            ORTHO: constants.ORTHOGRAPHIC_CAMERA
        }
    }
    try:
        return dispatch[obj.type][obj.data.type]
    except AttributeError:
        msg = 'Invalid type: %s' % obj.type
        raise exceptions.UnsupportedObjectType(msg)
 

def nodes(valid_types, options):
    visible_layers = _visible_scene_layers()
    for obj in data.objects:
        # skip objects that are not on visible layers
        if not _on_visible_layer(obj, visible_layers): 
            continue
        try:
            export = obj.THREE_export
        except AttributeError:
            export = True

        mesh_node = mesh(obj, options)
        is_mesh = obj.type == MESH

        # skip objects that a mesh could not be resolved
        if is_mesh and not mesh_node:
            continue

        # secondary test; if a mesh node was resolved but no
        # faces are detected then bow out
        if is_mesh:
            mesh_node = data.meshes[mesh_node]
            if len(mesh_node.tessfaces) is 0:
                continue

        if obj.type in valid_types and export:
            yield obj.name


@_object
def position(obj, options):
    logger.debug('object.position(%s)', obj)
    vector = _matrix(obj)[0]
    vector = (vector.x, vector.y, vector.z)

    round_off, round_val = utilities.rounding(options)
    if round_off:
        vector = utilities.round_off(vector, round_val)

    return vector


@_object
def receive_shadow(obj):
    if obj.type == MESH:
        mat = material(obj)
        if mat:
            return data.materials[mat].use_shadows
        else:
            return False


@_object
def rotation(obj, options):
    logger.debug('object.rotation(%s)', obj)
    vector = _matrix(obj)[1].to_euler(ZYX)
    vector = (vector.x, vector.y, vector.z)

    round_off, round_val = utilities.rounding(options)
    if round_off:
        vector = utilities.round_off(vector, round_val)

    return vector


@_object
def scale(obj, options):
    logger.debug('object.scale(%s)', obj)
    vector = _matrix(obj)[2]
    vector = (vector.x, vector.y, vector.z)

    round_off, round_val = utilities.rounding(options)
    if round_off:
        vector = utilities.round_off(vector, round_val)

    return vector


@_object
def select(obj):
    obj.select = True


@_object
def unselect(obj):
    obj.select = False


@_object
def visible(obj):
    logger.debug('object.visible(%s)', obj)
    return obj.is_visible(context.scene)


def extract_mesh(obj, options, recalculate=False):
    logger.debug('object.extract_mesh(%s, %s)', obj, options)
    mesh = obj.to_mesh(context.scene, True, RENDER)

    # transfer the geometry type to the extracted mesh
    mesh.THREE_geometry_type = obj.data.THREE_geometry_type

    # now determine whether or not to export using the geometry type
    # set globally from the exporter's options or to use the local
    # override on the mesh node itself
    opt_buffer = options.get(constants.GEOMETRY_TYPE) 
    opt_buffer = opt_buffer == constants.BUFFER_GEOMETRY
    prop_buffer = mesh.THREE_geometry_type == constants.BUFFER_GEOMETRY

    # if doing buffer geometry it is imperative to triangulate the mesh
    if opt_buffer or prop_buffer:
        original_mesh = obj.data
        obj.data = mesh
        logger.debug('swapped %s for %s', original_mesh.name, mesh.name)
    
        obj.select = True
        bpy.context.scene.objects.active = obj
        logger.info('Applying triangulation to %s', obj.data.name)
        bpy.ops.object.modifier_add(type='TRIANGULATE')
        bpy.ops.object.modifier_apply(apply_as='DATA', 
            modifier='Triangulate')
        obj.data = original_mesh
        obj.select = False

    # recalculate the normals to face outwards, this is usually
    # best after applying a modifiers, especialy for something 
    # like the mirror
    if recalculate:
        logger.info('Recalculating normals')
        original_mesh = obj.data
        obj.data = mesh

        bpy.context.scene.objects.active = obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.normals_make_consistent()
        bpy.ops.object.editmode_toggle()

        obj.data = original_mesh

    if not options.get(constants.SCENE):
        xrot = mathutils.Matrix.Rotation(-math.pi/2, 4, 'X')
        mesh.transform(xrot * obj.matrix_world)

    # now generate a unique name
    index = 0
    while True:
        if index is 0:
            name = '%sGeometry' % obj.data.name
        else:
            name = '%sGeometry.%d' % (obj.data.name, index)
        try:
            data.meshes[name]
            index += 1
        except KeyError:
            break
    mesh.name = name

    mesh.update(calc_tessface=True)
    mesh.calc_normals()
    mesh.calc_tessface()
    scale = options.get(constants.SCALE, 1)
    mesh.transform(mathutils.Matrix.Scale(scale, 4))

    return mesh


def objects_using_mesh(mesh):
    logger.debug('object.objects_using_mesh(%s)', mesh)
    for name, objects in _MESH_MAP.items():
        if name == mesh.name:
            return objects
    else:
        logger.warning('Could not find mesh mapping')


def prep_meshes(options):
    '''
    Prep the mesh nodes. Preperation includes identifying:
        - nodes that are on visible layers
        - nodes that have export disabled
        - nodes that have modifiers that need to be applied
    '''
    logger.debug('object.prep_meshes(%s)', options)
    mapping = {}

    visible_layers = _visible_scene_layers()
        
    for obj in data.objects:
        if obj.type != MESH: 
            continue

        # this is ideal for skipping controller or proxy nodes
        # that may apply to a Blender but not a 3js scene
        if not _on_visible_layer(obj, visible_layers): 
            logger.info('%s is not on a visible layer', obj.name)
            continue

        # if someone really insists on a visible node not being exportable
        if not obj.THREE_export: 
            logger.info('%s export is disabled', obj.name)
            continue

        # need to apply modifiers before moving on, and before
        # handling instancing. it is possible for 2 or more objects
        # instance the same mesh but to not all use the same modifiers
        # this logic identifies the object with modifiers and extracts
        # the mesh making the mesh unique to this particular object
        if len(obj.modifiers):
            logger.info('%s has modifiers' % obj.name)
            mesh = extract_mesh(obj, options, recalculate=True)
            _MESH_MAP[mesh.name] = [obj]
            continue

        logger.info('adding mesh %s.%s to prep', 
            obj.name, obj.data.name)
        manifest = mapping.setdefault(obj.data.name, [])
        manifest.append(obj)
    
    # now associate the extracted mesh node with all the objects
    # that are instancing it
    for objects in mapping.values():
        mesh = extract_mesh(objects[0], options)
        _MESH_MAP[mesh.name] = objects


def extracted_meshes():
    logger.debug('object.extracted_meshes()')
    return [key for key in _MESH_MAP.keys()]


def _matrix(obj):
    matrix = ROTATE_X_PI2 * obj.matrix_world
    return matrix.decompose()


def _on_visible_layer(obj, visible_layers):
    visible = True
    for index, layer in enumerate(obj.layers):
        if layer and index not in visible_layers:
            logger.info('%s is on a hidden layer', obj.name)
            visible = False
            break
    return visible


def _visible_scene_layers():
    visible_layers = []
    for index, layer in enumerate(context.scene.layers):
        if layer: visible_layers.append(index)
    return visible_layers
