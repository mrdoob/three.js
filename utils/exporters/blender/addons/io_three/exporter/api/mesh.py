import operator
import mathutils
from bpy import data, types, context
from . import material, texture
from . import object as object_
from .. import constants, utilities, logger, exceptions


def _mesh(func):

    def inner(name, *args, **kwargs):

        if isinstance(name, types.Mesh):
            mesh = name
        else:
            mesh = data.meshes[name] 

        return func(mesh, *args, **kwargs)

    return inner


@_mesh
def animation(mesh, options):
    logger.debug('mesh.animation(%s, %s)', mesh, options)
    armature = _armature(mesh)
    animations = []
    if armature:
        for action in data.actions:
            logger.info('Processing action %s', action.name)
            animations.append(
                _skeletal_animations(action, armature, options))
    else:
        logger.warning('No armature found')
        
    return animations


@_mesh
def bones(mesh):
    logger.debug('mesh.bones(%s)', mesh)
    armature = _armature(mesh)
    bones = []
    bone_map = {}

    if not armature: 
        return bones, bone_map

    bone_count = 0

    armature_matrix = armature.matrix_world
    for bone_count, pose_bone in enumerate(armature.pose.bones):
        armature_bone = pose_bone.bone
        bone_index = None

        if armature_bone.parent is None:
            bone_matrix = armature_matrix * armature_bone.matrix_local
            bone_index = -1
        else:
            parent_bone = armature_bone.parent
            parent_matrix = armature_matrix * parent_bone.matrix_local
            bone_matrix = armature_matrix * armature_bone.matrix_local
            bone_matrix = parent_matrix.inverted() * bone_matrix
            bone_index = index = 0

            for pose_parent in armature.pose.bones:
                armature_parent = pose_parent.bone.name
                if armature_parent == parent_bone.name:
                    bone_index = index
                index += 1

        bone_map[bone_count] = bone_count

        pos, rot, scl = bone_matrix.decompose()
        bones.append({
            constants.PARENT: bone_index,
            constants.NAME: armature_bone.name,
            constants.POS: (pos.x, pos.z, -pos.y),
            constants.ROTQ: (rot.x, rot.z, -rot.y, rot.w),
            'scl': (scl.x, scl.z, scl.y)
        })

    return (bones, bone_map)


@_mesh
def buffer_normal(mesh, options):
    normals_ = []
    round_off, round_val = utilities.rounding(options)

    for face in mesh.tessfaces:
        vert_count = len(face.vertices)
        if vert_count is not 3:
            msg = 'Non-triangulated face detected'
            raise exceptions.BufferGeometryError(msg)

        for vertex_index in face.vertices:
            normal = mesh.vertices[vertex_index].normal
            vector = (normal.x, normal.y, normal.z)
            if round_off:
                vector = utilities.round_off(vector, round_val)

            normals_.extend(vector)

    return normals_


@_mesh
def buffer_position(mesh, options):
    position = []
    round_off, round_val = utilities.rounding(options)

    for face in mesh.tessfaces:
        vert_count = len(face.vertices)
        if vert_count is not 3:
            msg = 'Non-triangulated face detected'
            raise exceptions.BufferGeometryError(msg)

        for vertex_index in face.vertices:
            vertex = mesh.vertices[vertex_index]
            vector = (vertex.co.x, vertex.co.y, vertex.co.z)
            if round_off:
                vector = utilities.round_off(vector, round_val)

            position.extend(vector)

    return position


@_mesh
def buffer_uv(mesh, options):
    if len(mesh.uv_layers) is 0:
        return
    elif len(mesh.uv_layers) > 1:
        # if memory serves me correctly buffer geometry
        # only uses one UV layer
        logger.warning('%s has more than 1 UV layer', mesh.name )

    round_off, round_val = utilities.rounding(options)
    uvs_ = []
    for uv in mesh.uv_layers[0].data:
        uv = (uv.uv[0], uv.uv[1])
        if round_off:
            uv = utilities.round_off(uv, round_val)
        uvs_.extend(uv)
    
    return uvs_

@_mesh
def faces(mesh, options):
    logger.debug('mesh.faces(%s, %s)', mesh, options)
    vertex_uv = len(mesh.uv_textures) > 0
    has_colors = len(mesh.vertex_colors) > 0
    logger.info('Has UVs = %s', vertex_uv)
    logger.info('Has vertex colours = %s', has_colors)


    round_off, round_val = utilities.rounding(options)
    if round_off:
        logger.debug('Rounding off of vectors set to %s', round_off)

    opt_colours = options[constants.COLORS] and has_colors
    opt_uvs = options[constants.UVS] and vertex_uv
    opt_materials = options.get(constants.FACE_MATERIALS)
    opt_normals = options[constants.NORMALS]
    logger.debug('Vertex colours enabled = %s', opt_colours)
    logger.debug('UVS enabled = %s', opt_uvs)
    logger.debug('Materials enabled = %s', opt_materials)
    logger.debug('Normals enabled = %s', opt_normals)

    uv_layers = _uvs(mesh, options) if opt_uvs else None
    vertex_normals = _normals(mesh, options) if opt_normals else None
    vertex_colours = vertex_colors(mesh) if opt_colours else None

    face_data = []

    logger.info('Parsing %d faces', len(mesh.tessfaces))
    for face in mesh.tessfaces:
        vert_count = len(face.vertices)

        if vert_count not in (3, 4):
            logger.error('%d vertices for face %d detected', 
                vert_count, face.index)
            raise exceptions.NGonError('ngons are not supported')

        materials = face.material_index is not None and opt_materials
        mask = {
            constants.QUAD: vert_count is 4,
            constants.MATERIALS: materials,
            constants.UVS: opt_uvs,
            constants.NORMALS: opt_normals,
            constants.COLORS: opt_colours
        }

        face_data.append(utilities.bit_mask(mask))
        
        face_data.extend([v for v in face.vertices])
        
        if mask[constants.MATERIALS]:
            face_data.append(face.material_index)
        
        if mask[constants.UVS] and uv_layers:

            for index, uv_layer in enumerate(uv_layers):
                layer = mesh.tessface_uv_textures[index]

                for uv_data in layer.data[face.index].uv:
                    uv = (uv_data[0], uv_data[1])
                    if round_off:
                        uv = utilities.round_off(uv, round_val)
                    face_data.append(uv_layer.index(uv))

        if mask[constants.NORMALS] and vertex_normals:
            for vertex in face.vertices:
                normal = mesh.vertices[vertex].normal
                normal = (normal.x, normal.y, normal.z)
                if round_off:
                    normal = utilities.round_off(normal, round_val)
                face_data.append(vertex_normals.index(normal))
        
        if mask[constants.COLORS]:
            colours = mesh.tessface_vertex_colors.active.data[face.index]

            for each in (colours.color1, colours.color2, colours.color3):
                each = utilities.rgb2int(each)
                face_data.append(vertex_colours.index(each))

            if mask[constants.QUAD]:
                colour = utilities.rgb2int(colours.color4)
                face_data.append(vertex_colours.index(colour))

    return face_data
 

@_mesh
def morph_targets(mesh, options):
    logger.debug('mesh.morph_targets(%s, %s)', mesh, options)
    #@TODO: consider an attribute for the meshes for determining
    #       morphs, which would save on so much overhead
    obj = object_.objects_using_mesh(mesh)[0]
    original_frame = context.scene.frame_current
    frame_step = options.get(constants.FRAME_STEP, 1)
    scene_frames = range(context.scene.frame_start,
        context.scene.frame_end+1, frame_step)

    morphs = []
    for frame in scene_frames:
        logger.info('Processing data at frame %d', frame)
        context.scene.frame_set(frame, 0.0)
        morphs.append([])
        vertices = object_.extract_mesh(obj, options).vertices[:]

        for vertex in vertices:
            vectors = [round(vertex.co.x, 6), round(vertex.co.y, 6), 
                round(vertex.co.z, 6)]
            morphs[-1].extend(vectors)
    
    context.scene.frame_set(original_frame, 0.0)
    morphs_detected = False
    for index, each in enumerate(morphs):
        if index is 0: continue
        morphs_detected = morphs[index-1] != each
        if morphs_detected: 
            logger.info('Valid morph target data detected')
            break
    else: 
        logger.info('No valid morph data detected')
        return

    manifest = []
    for index,morph in enumerate(morphs):
        manifest.append({
            constants.NAME: 'animation_%06d' % index,
            constants.VERTICES: morph
        })

    return manifest


@_mesh
def materials(mesh, options):
    logger.debug('mesh.materials(%s, %s)', mesh, options)
    indices = set([face.material_index for face in mesh.tessfaces])
    material_sets = [(mesh.materials[index], index) for index in indices]
    materials = []

    maps = options.get(constants.MAPS)

    mix = options.get(constants.MIX_COLORS)
    use_colors = options.get(constants.COLORS)
    logger.info('Colour mix is set to %s', mix)
    logger.info('Vertex colours set to %s', use_colors)

    for mat, index in material_sets:
        try:
            dbg_color = constants.DBG_COLORS[index]
        except IndexError:
            dbg_color = constants.DBG_COLORS[0]
        
        logger.info('Compiling attributes for %s', mat.name)
        attributes = {
            constants.COLOR_AMBIENT: material.ambient_color(mat),
            constants.COLOR_EMISSIVE: material.emissive_color(mat),
            constants.SHADING: material.shading(mat),
            constants.OPACITY: material.opacity(mat),
            constants.TRANSPARENT: material.transparent(mat),
            constants.VISIBLE: material.visible(mat),
            constants.WIREFRAME: material.wireframe(mat),
            constants.BLENDING: material.blending(mat),
            constants.DEPTH_TEST: material.depth_test(mat),
            constants.DEPTH_WRITE: material.depth_write(mat),
            constants.DBG_NAME: mat.name,
            constants.DBG_COLOR: dbg_color,
            constants.DBG_INDEX: index
        }

        if use_colors:
            colors = material.use_vertex_colors(mat)
            attributes[constants.VERTEX_COLORS] = colors
                
        if (use_colors and mix) or (not use_colors):
            colors = material.diffuse_color(mat)
            attributes[constants.COLOR_DIFFUSE] = colors

        if attributes[constants.SHADING] == constants.PHONG:
            logger.info('Adding specular attributes')
            attributes.update({
                constants.SPECULAR_COEF: material.specular_coef(mat),
                constants.COLOR_SPECULAR: material.specular_color(mat)
            })

        if mesh.show_double_sided:
            logger.info('Double sided is on')
            attributes[constants.DOUBLE_SIDED] = True

        materials.append(attributes)

        if not maps: continue

        diffuse = _diffuse_map(mat)
        if diffuse:
            logger.info('Diffuse map found')
            attributes.update(diffuse)
        
        light = _light_map(mat)
        if light:
            logger.info('Light map found')
            attributes.update(light)

        specular = _specular_map(mat)
        if specular:
            logger.info('Specular map found')
            attributes.update(specular)

        if attributes[constants.SHADING] == constants.PHONG:
            normal = _normal_map(mat)
            if normal:
                logger.info('Normal map found')
                attributes.update(normal)

            bump = _bump_map(mat)
            if bump:
                logger.info('Bump map found')
                attributes.update(bump)

    return materials


@_mesh
def normals(mesh, options):
    logger.debug('mesh.normals(%s, %s)', mesh, options)
    normal_vectors = []

    for vector in _normals(mesh, options):
        normal_vectors.extend(vector)

    return normal_vectors


@_mesh
def skin_weights(mesh, bone_map, influences):
    logger.debug('mesh.skin_weights(%s)', mesh)
    return _skinning_data(mesh, bone_map, influences, 1)


@_mesh
def skin_indices(mesh, bone_map, influences):
    logger.debug('mesh.skin_indices(%s)', mesh)
    return _skinning_data(mesh, bone_map, influences, 0)


@_mesh
def texture_registration(mesh):
    logger.debug('mesh.texture_registration(%s)', mesh)
    materials = mesh.materials or []
    registration = {}

    funcs = (
        (constants.MAP_DIFFUSE, material.diffuse_map), 
        (constants.SPECULAR_MAP, material.specular_map),
        (constants.LIGHT_MAP, material.light_map), 
        (constants.BUMP_MAP, material.bump_map), 
        (constants.NORMAL_MAP, material.normal_map)
    )
    
    def _registration(file_path, file_name):
        return {
            'file_path': file_path,
            'file_name': file_name,
            'maps': []
        }

    logger.info('found %d materials', len(materials))
    for mat in materials:
        for (key, func) in funcs:
            tex = func(mat)
            if tex is None: continue

            logger.info('%s has texture %s', key, tex.name)
            file_path = texture.file_path(tex)
            file_name = texture.file_name(tex)

            hash_ = utilities.hash(file_path)

            reg = registration.setdefault(hash_, 
                _registration(file_path, file_name))

            reg['maps'].append(key)

    return registration


@_mesh
def uvs(mesh, options):
    logger.debug('mesh.uvs(%s, %s)', mesh, options)
    uvs = []
    for layer in _uvs(mesh, options):
        uvs.append([])
        logger.info('Parsing UV layer %d', len(uvs))
        for pair in layer:
            uvs[-1].extend(pair)
    return uvs


@_mesh
def vertex_colors(mesh):
    logger.debug('mesh.vertex_colors(%s)', mesh)
    vertex_colours = []

    try:
        vertex_colour = mesh.tessface_vertex_colors.active.data
    except AttributeError:
        logger.info('No vertex colours found')
        return

    for face in mesh.tessfaces:

        colours = (vertex_colour[face.index].color1,
            vertex_colour[face.index].color2,
            vertex_colour[face.index].color3,
            vertex_colour[face.index].color4)

        for colour in colours:
            colour = utilities.rgb2int((colour.r, colour.g, colour.b))

            if colour not in vertex_colours:
                vertex_colours.append(colour)

    return vertex_colours


@_mesh
def vertices(mesh, options):
    logger.debug('mesh.vertices(%s, %s)', mesh, options)
    vertices = []

    round_off, round_val = utilities.rounding(options)

    for vertex in mesh.vertices:
        vector = (vertex.co.x, vertex.co.y, vertex.co.z)
        if round_off:
            vector = utilities.round_off(vector, round_val)

        vertices.extend(vector)

    return vertices


def _normal_map(mat):
    tex = material.normal_map(mat)
    if tex is None:
        return

    logger.info('Found normal texture map %s', tex.name)

    normal = {
        constants.MAP_NORMAL: 
            texture.file_name(tex),
        constants.MAP_NORMAL_FACTOR:
            material.normal_scale(mat), 
        constants.MAP_NORMAL_ANISOTROPY: 
            texture.anisotropy(tex),
        constants.MAP_NORMAL_WRAP: texture.wrap(tex), 
        constants.MAP_NORMAL_REPEAT: texture.repeat(tex)
    }

    return normal


def _bump_map(mat):
    tex = material.bump_map(mat)
    if tex is None:
        return

    logger.info('Found bump texture map %s', tex.name)

    bump = {
        constants.MAP_BUMP: 
            texture.file_name(tex),
        constants.MAP_BUMP_ANISOTROPY: 
            texture.anisotropy(tex),
        constants.MAP_BUMP_WRAP: texture.wrap(tex),
        constants.MAP_BUMP_REPEAT: texture.repeat(tex),
        constants.MAP_BUMP_SCALE:
            material.bump_scale(mat), 
    }

    return bump


def _specular_map(mat):
    tex = material.specular_map(mat)
    if tex is None:
        return 

    logger.info('Found specular texture map %s', tex.name)

    specular = {
        constants.MAP_SPECULAR: 
            texture.file_name(tex),
        constants.MAP_SPECULAR_ANISOTROPY: 
            texture.anisotropy(tex),
        constants.MAP_SPECULAR_WRAP: texture.wrap(tex),
        constants.MAP_SPECULAR_REPEAT: texture.repeat(tex)
    }

    return specular 


def _light_map(mat):
    tex = material.light_map(mat)
    if tex is None:
        return 

    logger.info('Found light texture map %s', tex.name)

    light = {
        constants.MAP_LIGHT: 
            texture.file_name(tex),
        constants.MAP_LIGHT_ANISOTROPY: 
            texture.anisotropy(tex),
        constants.MAP_LIGHT_WRAP: texture.wrap(tex),
        constants.MAP_LIGHT_REPEAT: texture.repeat(tex)
    }

    return light 


def _diffuse_map(mat):
    tex = material.diffuse_map(mat)
    if tex is None:
        return 

    logger.info('Found diffuse texture map %s', tex.name)

    diffuse = {
        constants.MAP_DIFFUSE: 
            texture.file_name(tex),
        constants.MAP_DIFFUSE_ANISOTROPY: 
            texture.anisotropy(tex),
        constants.MAP_DIFFUSE_WRAP: texture.wrap(tex),
        constants.MAP_DIFFUSE_REPEAT: texture.repeat(tex)
    }

    return diffuse


def _normals(mesh, options):
    vectors = []
    round_off, round_val = utilities.rounding(options)

    for face in mesh.tessfaces:

        for vertex_index in face.vertices:
            normal = mesh.vertices[vertex_index].normal
            vector = (normal.x, normal.y, normal.z)
            if round_off:
                vector = utilities.round_off(vector, round_val)

            if vector not in vectors:
                vectors.append(vector)

    return vectors


def _uvs(mesh, options):
    uv_layers = []
    round_off, round_val = utilities.rounding(options)

    for layer in mesh.uv_layers:
        uv_layers.append([])

        for uv in layer.data:
            uv = (uv.uv[0], uv.uv[1])
            if round_off:
                uv = utilities.round_off(uv, round_val)

            if uv not in uv_layers[-1]:
                uv_layers[-1].append(uv)

    return uv_layers


def _armature(mesh):
    obj = object_.objects_using_mesh(mesh)[0]
    armature = obj.find_armature()
    if armature:
        logger.info('Found armature %s for %s', armature.name, obj.name)
    else:
        logger.info('Found no armature for %s', obj.name)
    return armature


def _skinning_data(mesh, bone_map, influences, array_index):
    armature = _armature(mesh)
    manifest = []
    if not armature: 
        return manifest

    obj = object_.objects_using_mesh(mesh)[0]
    logger.debug('Skinned object found %s', obj.name)

    for vertex in mesh.vertices:
        bone_array = []
        for group in vertex.groups:
            bone_array.append((group.group, group.weight))

        bone_array.sort(key=operator.itemgetter(1), reverse=True)

        for index in range(influences):
            if index >= len(bone_array):
                manifest.append(0)
                continue
            name = obj.vertex_groups[bone_array[index][0]].name
            for bone_index, bone in enumerate(armature.pose.bones):
                if bone.name != name:
                    continue
                if array_index is 0:
                    entry = bone_map.get(bone_index, -1)
                else:
                    entry = bone_array[index][1]

                manifest.append(entry)
                break
            else:
                manifest.append(0)

    return manifest


def _find_channels(action, bone, channel_type):
    result = []

    if len(action.groups):
        
        group_index = -1
        for index, group in enumerate(action.groups):
            if group.name == bone.name:
                group_index = index
                #@TODO: break?

        if group_index > -1:
            for channel in action.groups[group_index].channels:
                if channel_type in channel.data_path:
                    result.append(channel)

    else:
        bone_label = '"%s"' % bone.name
        for channel in action.fcurves:
            data_path = [bone_label in channel.data_path,
                channel_type in channel.data_path]
            if all(data_path):
                result.append(channel)

    return result


def _skeletal_animations(action, armature, options):
    try:
        current_context = context.area.type
    except AttributeError:
        logger.warning('No context, possibly running in batch mode')
    else:
        context.area.type = 'DOPESHEET_EDITOR'
        context.space_data.mode = 'ACTION'
        context.area.spaces.active.action = action
    
    armature_matrix = armature.matrix_world
    fps = context.scene.render.fps

    end_frame = action.frame_range[1]
    start_frame = action.frame_range[0]
    frame_length = end_frame - start_frame

    frame_step = options.get(constants.FRAME_STEP, 1)
    used_frames = int(frame_length / frame_step) + 1

    keys = []
    channels_location = []
    channels_rotation = []
    channels_scale = []

    for pose_bone in armature.pose.bones:
        logger.info('Processing channels for %s', 
                    pose_bone.bone.name)
        keys.append([])
        channels_location.append(
            _find_channels(action, 
                           pose_bone.bone,
                           'location'))
        channels_rotation.append(
            _find_channels(action, 
                           pose_bone.bone,
                           'rotation_quaternion'))
        channels_rotation.append(
            _find_channels(action, 
                           pose_bone.bone,
                           'rotation_euler'))
        channels_scale.append(
            _find_channels(action, 
                           pose_bone.bone,
                           'scale'))

    frame_step = options[constants.FRAME_STEP]
    frame_index_as_time = options[constants.FRAME_INDEX_AS_TIME]
    for frame_index in range(0, used_frames):
        if frame_index == used_frames - 1:
            frame = end_frame
        else:
            frame = start_frame + frame_index * frame_step

        logger.info('Processing frame %d', frame)

        time = frame - start_frame
        if frame_index_as_time is False:
            time = time / fps

        context.scene.frame_set(frame)

        bone_index = 0

        def has_keyframe_at(channels, frame):
            def find_keyframe_at(channel, frame):
                for keyframe in channel.keyframe_points:
                    if keyframe.co[0] == frame:
                        return keyframe
                return None

            for channel in channels:
                if not find_keyframe_at(channel, frame) is None:
                    return True
            return False

        for pose_bone in armature.pose.bones:
            logger.info('Processing bone %s', pose_bone.bone.name)
            if pose_bone.parent is None:
                bone_matrix = armature_matrix * pose_bone.matrix
            else:
                parent_matrix = armature_matrix * pose_bone.parent.matrix
                bone_matrix = armature_matrix * pose_bone.matrix
                bone_matrix = parent_matrix.inverted() * bone_matrix

            pos, rot, scl = bone_matrix.decompose()
            
            pchange = True or has_keyframe_at(
                channels_location[bone_index], frame)
            rchange = True or has_keyframe_at(
                channels_rotation[bone_index], frame)
            schange = True or has_keyframe_at(
                channels_scale[bone_index], frame)

            px, py, pz = pos.x, pos.z, -pos.y
            rx, ry, rz, rw = rot.x, rot.z, -rot.y, rot.w
            sx, sy, sz = scl.x, scl.z, scl.y

            keyframe = {constants.TIME: time}
            if frame == start_frame or frame == end_frame:
                keyframe.update({
                    constants.POS: [px, py, pz],
                    constants.ROT: [rx, ry, rz, rw],
                    constants.SCL: [sx, sy, sz]
                })
            elif any([pchange, rchange, schange]):
                if pchange is True:
                    keyframe[constants.POS] = [px, py, pz]
                if rchange is True:
                    keyframe[constants.ROT] = [rx, ry, rz, rw]
                if schange is True:
                    keyframe[constants.SCL] = [sx, sy, sz]

            if len(keyframe.keys()) > 1:
                logger.info('Recording keyframe data for %s %s',
                            pose_bone.bone.name, str(keyframe))
                keys[bone_index].append(keyframe)
            else:
                logger.info('No anim data to record for %s',
                            pose_bone.bone.name)

            bone_index += 1
    
    hierarchy = []
    bone_index = 0
    for pose_bone in armature.pose.bones:
        hierarchy.append({
            constants.PARENT: bone_index - 1,
            constants.KEYS: keys[bone_index]
        })
        bone_index += 1

    if frame_index_as_time is False:
        frame_length = frame_length / fps

    context.scene.frame_set(start_frame)
    if context.area:
        context.area.type = current_context
    
    animation = {
        constants.HIERARCHY: hierarchy, 
        constants.LENGTH:frame_length,
        constants.FPS: fps,
        constants.NAME: action.name
    }

    return animation


def _position(bone, frame, action, armature_matrix):

    position = mathutils.Vector((0,0,0))
    change = False

    ngroups = len(action.groups)

    if ngroups > 0:

        index = 0

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
                index = i

        for channel in action.groups[index].channels:
            if "location" in channel.data_path:
                has_changed = _handle_position_channel(
                    channel, frame, position)
                change = change or has_changed

    else:

        bone_label = '"%s"' % bone.name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and \
            "location" in data_path:
                has_changed = _handle_position_channel(
                    channel, frame, position)
                change = change or has_changed

    position = position * bone.matrix_local.inverted()

    if bone.parent is None:

        position.x += bone.head.x
        position.y += bone.head.y
        position.z += bone.head.z

    else:

        parent = bone.parent

        parent_matrix = parent.matrix_local.inverted()
        diff = parent.tail_local - parent.head_local

        position.x += (bone.head * parent_matrix).x + diff.x
        position.y += (bone.head * parent_matrix).y + diff.y
        position.z += (bone.head * parent_matrix).z + diff.z

    return armature_matrix*position, change


def _rotation(bone, frame, action, armature_matrix):

    # TODO: calculate rotation also from rotation_euler channels

    rotation = mathutils.Vector((0,0,0,1))

    change = False

    ngroups = len(action.groups)

    # animation grouped by bones

    if ngroups > 0:

        index = -1

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
                index = i

        if index > -1:
            for channel in action.groups[index].channels:
                if "quaternion" in channel.data_path:
                    has_changed = _handle_rotation_channel(
                        channel, frame, rotation)
                    change = change or has_changed

    # animation in raw fcurves

    else:

        bone_label = '"%s"' % bone.name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and \
            "quaternion" in data_path:
                has_changed = _handle_rotation_channel(
                    channel, frame, rotation)
                change = change or has_changed

    rot3 = rotation.to_3d()
    rotation.xyz = rot3 * bone.matrix_local.inverted()
    rotation.xyz = armature_matrix * rotation.xyz

    return rotation, change


def _handle_rotation_channel(channel, frame, rotation):

    change = False

    if channel.array_index in [0, 1, 2, 3]:

        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True

        value = channel.evaluate(frame)

        if channel.array_index == 1:
            rotation.x = value

        elif channel.array_index == 2:
            rotation.y = value

        elif channel.array_index == 3:
            rotation.z = value

        elif channel.array_index == 0:
            rotation.w = value

    return change


def _handle_position_channel(channel, frame, position):

    change = False

    if channel.array_index in [0, 1, 2]:
        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True

        value = channel.evaluate(frame)

        if channel.array_index == 0:
            position.x = value

        if channel.array_index == 1:
            position.y = value

        if channel.array_index == 2:
            position.z = value

    return change
