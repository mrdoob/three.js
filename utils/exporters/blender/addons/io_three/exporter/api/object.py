import math
import mathutils
import bpy
from bpy import data, context, types
from bpy_extras.io_utils import axis_conversion
from .. import constants, logger, utilities, exceptions
from .constants import (
    MESH,
    EMPTY,
    ARMATURE,
    LAMP,
    AREA,
    SPOT,
    SUN,
    POINT,
    HEMI,
    CAMERA,
    PERSP,
    ORTHO,
    RENDER,
    NO_SHADOW,
    ZYX
)
# TODO: RectAreaLight support


# Blender doesn't seem to have a good way to link a mesh back to the
# objects that are instancing it, or it is bloody obvious and I haven't
# discovered yet. This manifest serves as a way for me to map a mesh
# node to the object nodes that are using it.
_MESH_MAP = {}


def _object(func):
    """

    :param func:

    """

    def inner(arg, *args, **kwargs):
        """

        :param arg:
        :param *args:
        :param **kwargs:

        """

        if isinstance(arg, types.Object):
            obj = arg
        else:
            obj = data.objects[arg]

        return func(obj, *args, **kwargs)

    return inner


def clear_mesh_map():
    """Clears the mesh map, required on initialization"""
    _MESH_MAP.clear()


def assemblies(valid_types, options):
    """

    :param valid_types:
    :param options:

    """
    logger.debug('object.assemblies(%s)', valid_types)
    for obj in data.objects:

        # rigged assets are parented under armature nodes
        if obj.parent and obj.parent.type != ARMATURE:
            continue
        if obj.parent and obj.parent.type == ARMATURE:
            logger.info('Has armature parent %s', obj.name)
        if _valid_node(obj, valid_types, options):
            yield obj.name


@_object
def cast_shadow(obj):
    """

    :param obj:

    """
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
        mats = material(obj)
        if mats:
            for m in mats:
                if data.materials[m].use_cast_shadows:
                    return True
        return False


@_object
def children(obj, valid_types):
    """

    :param obj:
    :param valid_types:

    """
    logger.debug('object.children(%s, %s)', obj, valid_types)
    for child in obj.children:
        if child.type in valid_types and child.THREE_export:
            yield child.name


@_object
def material(obj):
    """

    :param obj:

    """
    logger.debug('object.material(%s)', obj)

    try:
        matName = obj.material_slots[0].name # manthrax: Make this throw an error on an empty material array, resulting in non-material
        return [o.name for o in obj.material_slots]
    except IndexError:
        pass

def extract_time(fcurves, start_index):
    time = []
    for xx in fcurves[start_index].keyframe_points:
        time.append(xx.co.x)
    return time

def merge_sorted_lists(l1, l2):
  sorted_list = []
  l1 = l1[:]
  l2 = l2[:]
  while (l1 and l2):
    h1 = l1[0]
    h2 = l2[0]
    if h1 == h2:
      sorted_list.append(h1)
      l1.pop(0)
      l2.pop(0)
    elif h1 < h2:
      l1.pop(0)
      sorted_list.append(h1)
    else:
      l2.pop(0)
      sorted_list.append(h2)
  # Add the remaining of the lists
  sorted_list.extend(l1 if l1 else l2)
  return sorted_list

def appendVec3(track, time, vec3):
    track.append({ "time": time, "value": [ vec3.x, vec3.y, vec3.z ] })

def appendQuat(track, time, quat):
    track.append({ "time": time, "value": [ quat.x, quat.y, quat.z, quat.w ] })

# trackable transform fields ( <output field>, <nb fcurve> )
TRACKABLE_FIELDS = {
    "location": ( ".position", 3, "vector3" ),
    "scale": ( ".scale", 3, "vector3" ),
    "rotation_euler": ( ".rotation", 3, "vector3" ),
    "rotation_quaternion": ( ".quaternion", 4, "quaternion" )
}
EXPORTED_TRACKABLE_FIELDS = [ "location", "scale", "rotation_quaternion" ]

@_object
def animated_xform(obj, options):
    if obj.animation_data is None:
        return []
    fcurves = obj.animation_data
    if not fcurves:
        return []
    if fcurves.action is None:
        return []
    fcurves = fcurves.action.fcurves

    objName = obj.name

    tracks = []
    i = 0
    nb_curves = len(fcurves)

    # extract unique frames
    times = None
    while i < nb_curves:
        field_info = TRACKABLE_FIELDS.get(fcurves[i].data_path)
        if field_info:
            newTimes = extract_time(fcurves, i)
            times = merge_sorted_lists(times, newTimes) if times else newTimes  # merge list
            i += field_info[1]
        else:
            i += 1

    # init tracks
    track_loc = []
    for fld in EXPORTED_TRACKABLE_FIELDS:
        field_info = TRACKABLE_FIELDS[fld]
        track = []
        track_loc.append(track)
        tracks.append({
            constants.NAME: objName+field_info[0],
            constants.TYPE: field_info[2],
            constants.KEYS: track
        })

    # track arrays
    track_sca = track_loc[1]
    track_qua = track_loc[2]
    track_loc = track_loc[0]
    use_inverted = options.get(constants.HIERARCHY, False) and obj.parent

    if times == None:
        logger.info("In animated xform: Unable to extract trackable fields from %s", objName)
        return tracks

    # for each frame
    inverted_fallback = mathutils.Matrix() if use_inverted else None
    convert_matrix = AXIS_CONVERSION    # matrix to convert the exported matrix
    original_frame = context.scene.frame_current

    if options.get(constants.BAKE_KEYFRAMES):
        frame_step = options.get(constants.FRAME_STEP, 1)
        logger.info("Baking keyframes, frame_step=%d", frame_step)
        times = range(context.scene.frame_start, context.scene.frame_end+1, frame_step)

    for time in times:
        context.scene.frame_set(time, 0.0)
        if use_inverted:  # need to use the inverted, parent matrix might have chance
            convert_matrix = obj.parent.matrix_world.inverted(inverted_fallback)
        wm = convert_matrix * obj.matrix_world
        appendVec3(track_loc, time, wm.to_translation())
        appendVec3(track_sca, time, wm.to_scale()      )
        appendQuat(track_qua, time, wm.to_quaternion() )
    context.scene.frame_set(original_frame, 0.0)  # restore to original frame

    # TODO: remove duplicated key frames
    return tracks

@_object
def custom_properties(obj):
    """

    :param obj:

    """
    logger.debug('object.custom_properties(%s)', obj)
    # Grab any properties except those marked private (by underscore
    # prefix) or those with types that would be rejected by the JSON
    # serializer object model.
    return {K: obj[K] for K in obj.keys() if K[:1] != '_' and isinstance(obj[K], constants.VALID_DATA_TYPES)}  # 'Empty' Blender objects do not use obj.data.items() for custom properties, using obj.keys()

@_object
def mesh(obj, options):
    """

    :param obj:
    :param options:

    """
    logger.debug('object.mesh(%s, %s)', obj, options)
    if obj.type != MESH:
        return

    for mesh_, objects in _MESH_MAP.items():
        if obj in objects:
            return mesh_
    else:
        logger.debug('Could not map object, updating manifest')
        mesh_ = extract_mesh(obj, options)
        if len(mesh_.tessfaces) is not 0:
            manifest = _MESH_MAP.setdefault(mesh_.name, [])
            manifest.append(obj)
            mesh_name = mesh_.name
        else:
            # possibly just being used as a controller
            logger.info('Object %s has no faces', obj.name)
            mesh_name = None

    return mesh_name


@_object
def name(obj):
    """

    :param obj:

    """
    return obj.name


@_object
def node_type(obj):
    """

    :param obj:

    """
    logger.debug('object.node_type(%s)', obj)
    # standard transformation nodes are inferred
    if obj.type == MESH:
        return constants.MESH.title()
    elif obj.type == EMPTY:
        return constants.OBJECT.title()

    # TODO: RectAreaLight support
    dispatch = {
        LAMP: {
            POINT: constants.POINT_LIGHT,
            SUN: constants.DIRECTIONAL_LIGHT,
            SPOT: constants.SPOT_LIGHT,
            AREA: constants.RECT_AREA_LIGHT,
            HEMI: constants.HEMISPHERE_LIGHT
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
    """

    :param valid_types:
    :param options:

    """
    for obj in data.objects:
        if _valid_node(obj, valid_types, options):
            yield obj.name

@_object
def position(obj, options):
    """

    :param obj:
    :param options:

    """
    logger.debug('object.position(%s)', obj)
    vector = matrix(obj, options).to_translation()
    return (vector.x, vector.y, vector.z)


@_object
def receive_shadow(obj):
    """

    :param obj:

    """
    if obj.type == MESH:
        mats = material(obj)
        if mats:
            for m in mats:
                if data.materials[m].use_shadows:
                    return True
        return False

AXIS_CONVERSION = axis_conversion(to_forward='Z', to_up='Y').to_4x4() 

@_object
def matrix(obj, options):
    """

    :param obj:
    :param options:

    """
    logger.debug('object.matrix(%s)', obj)
    if options.get(constants.HIERARCHY, False) and obj.parent:
        parent_inverted = obj.parent.matrix_world.inverted(mathutils.Matrix())
        return parent_inverted * obj.matrix_world
    else:
        return AXIS_CONVERSION * obj.matrix_world


@_object
def rotation(obj, options):
    """

    :param obj:
    :param options:

    """
    logger.debug('object.rotation(%s)', obj)
    vector = matrix(obj, options).to_euler(ZYX)
    return (vector.x, vector.y, vector.z)


@_object
def scale(obj, options):
    """

    :param obj:
    :param options:

    """
    logger.debug('object.scale(%s)', obj)
    vector = matrix(obj, options).to_scale()
    return (vector.x, vector.y, vector.z)


@_object
def select(obj):
    """

    :param obj:

    """
    obj.select = True


@_object
def unselect(obj):
    """

    :param obj:

    """
    obj.select = False


@_object
def visible(obj):
    """

    :param obj:

    """
    logger.debug('object.visible(%s)', obj)
    return obj.is_visible(context.scene)


def extract_mesh(obj, options, recalculate=False):
    """

    :param obj:
    :param options:
    :param recalculate:  (Default value = False)

    """
    logger.debug('object.extract_mesh(%s, %s)', obj, options)
    bpy.context.scene.objects.active = obj
    hidden_state = obj.hide
    obj.hide = False

    apply_modifiers = options.get(constants.APPLY_MODIFIERS, True)
    if apply_modifiers:
        bpy.ops.object.mode_set(mode='OBJECT')
    mesh_node = obj.to_mesh(context.scene, apply_modifiers, RENDER)

    # transfer the geometry type to the extracted mesh
    mesh_node.THREE_geometry_type = obj.data.THREE_geometry_type

    # now determine whether or not to export using the geometry type
    # set globally from the exporter's options or to use the local
    # override on the mesh node itself
    opt_buffer = options.get(constants.GEOMETRY_TYPE)
    opt_buffer = opt_buffer == constants.BUFFER_GEOMETRY
    prop_buffer = mesh_node.THREE_geometry_type == constants.BUFFER_GEOMETRY

    # if doing buffer geometry it is imperative to triangulate the mesh
    if opt_buffer or prop_buffer:
        original_mesh = obj.data
        obj.data = mesh_node
        logger.debug('swapped %s for %s',
                     original_mesh.name,
                     mesh_node.name)

        bpy.ops.object.mode_set(mode='OBJECT')
        obj.select = True
        bpy.context.scene.objects.active = obj
        logger.info('Applying triangulation to %s', obj.data.name)
        bpy.ops.object.modifier_add(type='TRIANGULATE')
        bpy.ops.object.modifier_apply(apply_as='DATA',
                                      modifier='Triangulate')
        obj.data = original_mesh
        obj.select = False

    # split sharp edges
    original_mesh = obj.data
    obj.data = mesh_node
    obj.select = True

    logger.info("Applying EDGE_SPLIT modifier....")
    bpy.ops.object.modifier_add(type='EDGE_SPLIT')
    bpy.context.object.modifiers['EdgeSplit'].use_edge_angle = False
    bpy.context.object.modifiers['EdgeSplit'].use_edge_sharp = True
    bpy.ops.object.modifier_apply(apply_as='DATA', modifier='EdgeSplit')

    obj.hide = hidden_state
    obj.select = False
    obj.data = original_mesh

    # recalculate the normals to face outwards, this is usually
    # best after applying a modifiers, especialy for something
    # like the mirror
    if recalculate:
        logger.info('Recalculating normals')
        original_mesh = obj.data
        obj.data = mesh_node

        bpy.context.scene.objects.active = obj
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.normals_make_consistent()
        bpy.ops.object.editmode_toggle()

        obj.data = original_mesh

    if not options.get(constants.SCENE):
        xrot = mathutils.Matrix.Rotation(-math.pi/2, 4, 'X')
        mesh_node.transform(xrot * obj.matrix_world)

    # blend shapes
    if options.get(constants.BLEND_SHAPES) and not options.get(constants.MORPH_TARGETS):
        original_mesh = obj.data
        if original_mesh.shape_keys:
            logger.info('Using blend shapes')
            obj.data = mesh_node  # swap to be able to add the shape keys
            shp = original_mesh.shape_keys

            animCurves = shp.animation_data
            if animCurves:
                animCurves = animCurves.action.fcurves

            src_kbs = shp.key_blocks
            for key in src_kbs.keys():
                logger.info("-- Parsing key %s", key)
                obj.shape_key_add(name=key, from_mix=False)
                src_kb = src_kbs[key].data
                if key == 'Basis':
                    dst_kb = mesh_node.vertices
                else:
                    dst_kb = mesh_node.shape_keys.key_blocks[key].data
                for idx in range(len(src_kb)):
                    dst_kb[idx].co = src_kb[idx].co

                if animCurves:
                    data_path = 'key_blocks["'+key+'"].value'
                    for fcurve in animCurves:
                        if fcurve.data_path == data_path:
                            dst_kb = mesh_node.shape_keys.key_blocks[key]
                            for xx in fcurve.keyframe_points:
                                dst_kb.value = xx.co.y
                                dst_kb.keyframe_insert("value",frame=xx.co.x)
                            pass
                            break  # no need to continue to loop
                    pass
            obj.data = original_mesh

    # now generate a unique name
    index = 0
    while True:
        if index is 0:
            mesh_name = '%sGeometry' % obj.data.name
        else:
            mesh_name = '%sGeometry.%d' % (obj.data.name, index)
        try:
            data.meshes[mesh_name]
            index += 1
        except KeyError:
            break
    mesh_node.name = mesh_name

    mesh_node.update(calc_tessface=True)
    mesh_node.calc_normals()
    mesh_node.calc_tessface()
    scale_ = options.get(constants.SCALE, 1)
    mesh_node.transform(mathutils.Matrix.Scale(scale_, 4))

    return mesh_node


def objects_using_mesh(mesh_node):
    """

    :param mesh_node:
    :return: list of object names

    """
    #manthrax: remove spam
    #logger.debug('object.objects_using_mesh(%s)', mesh_node)
    for mesh_name, objects in _MESH_MAP.items():
        if mesh_name == mesh_node.name:
            return objects
    else:
        logger.warning('Could not find mesh mapping')


def prep_meshes(options):
    """Prep the mesh nodes. Preperation includes identifying:
        - nodes that are on visible layers
        - nodes that have export disabled
        - nodes that have modifiers that need to be applied

    :param options:

    """
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
            mesh_node = extract_mesh(obj, options, recalculate=True)
            _MESH_MAP[mesh_node.name] = [obj]
            continue

        logger.info('adding mesh %s.%s to prep',
                    obj.name, obj.data.name)
        manifest = mapping.setdefault(obj.data.name, [])
        manifest.append(obj)

    # now associate the extracted mesh node with all the objects
    # that are instancing it
    for objects in mapping.values():
        mesh_node = extract_mesh(objects[0], options)
        _MESH_MAP[mesh_node.name] = objects


def extracted_meshes():
    """

    :return: names of extracted mesh nodes

    """
    logger.debug('object.extracted_meshes()')
    return [key for key in _MESH_MAP.keys()]


def _on_visible_layer(obj, visible_layers):
    """

    :param obj:
    :param visible_layers:

    """
    is_visible = False
    for index, layer in enumerate(obj.layers):
        if layer and index in visible_layers:
            is_visible = True
            break

    if not is_visible:
        logger.info('%s is on a hidden layer', obj.name)

    return is_visible


def _visible_scene_layers():
    """

    :return: list of visiible layer indices

    """
    visible_layers = []
    for index, layer in enumerate(context.scene.layers):
        if layer:
            visible_layers.append(index)
    return visible_layers


def _valid_node(obj, valid_types, options):
    """

    :param obj:
    :param valid_types:
    :param options:

    """
    if obj.type not in valid_types:
        return False

    # skip objects that are not on visible layers
    visible_layers = _visible_scene_layers()
    if not _on_visible_layer(obj, visible_layers):
        return False

    try:
        export = obj.THREE_export
    except AttributeError:
        export = True
    if not export:
        return False

    mesh_node = mesh(obj, options)
    is_mesh = obj.type == MESH

    # skip objects that a mesh could not be resolved
    if is_mesh and not mesh_node:
        return False

    # secondary test; if a mesh node was resolved but no
    # faces are detected then bow out
    if is_mesh:
        mesh_node = data.meshes[mesh_node]
        if len(mesh_node.tessfaces) is 0:
            return False

    # if we get this far assume that the mesh is valid
    return True



