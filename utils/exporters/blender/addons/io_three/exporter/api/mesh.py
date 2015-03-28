"""
Blender API for querying mesh data. Animation data is also
handled here since Three.js associates the animation (skeletal,
morph targets) with the geometry nodes.
"""

import operator
from bpy import data, types, context
from . import material, texture, animation
from . import object as object_
from .. import constants, utilities, logger, exceptions


def _mesh(func):
    """

    :param func:

    """

    def inner(name, *args, **kwargs):
        """

        :param name:
        :param *args:
        :param **kwargs:

        """

        if isinstance(name, types.Mesh):
            mesh = name
        else:
            mesh = data.meshes[name]

        return func(mesh, *args, **kwargs)

    return inner


@_mesh
def skeletal_animation(mesh, options):
    """

    :param mesh:
    :param options:
    :rtype: []

    """
    logger.debug("mesh.animation(%s, %s)", mesh, options)
    armature = _armature(mesh)

    if not armature:
        logger.warning("No armature found (%s)", mesh)
        return []

    anim_type = options.get(constants.ANIMATION)
#    pose_position = armature.data.pose_position
    dispatch = {
        constants.POSE: animation.pose_animation,
        constants.REST: animation.rest_animation
    }

    func = dispatch[anim_type]
#    armature.data.pose_position = anim_type.upper()
    animations = func(armature, options)
#    armature.data.pose_position = pose_position

    return animations


@_mesh
def bones(mesh, options):
    """

    :param mesh:
    :param options:
    :rtype: [], {}

    """
    logger.debug("mesh.bones(%s)", mesh)
    armature = _armature(mesh)

    if not armature:
        return [], {}

    anim_type = options.get(constants.ANIMATION)
#    pose_position = armature.data.pose_position

    if anim_type == constants.OFF:
        logger.info("Animation type not set, defaulting "
                    "to using REST position for the armature.")
        func = _rest_bones
#        armature.data.pose_position = "REST"
    else:
        dispatch = {
            constants.REST: _rest_bones,
            constants.POSE: _pose_bones
        }
        logger.info("Using %s for the armature", anim_type)
        func = dispatch[anim_type]
#        armature.data.pose_position = anim_type.upper()

    bones_, bone_map = func(armature)
#    armature.data.pose_position = pose_position

    return (bones_, bone_map)


@_mesh
def buffer_normal(mesh):
    """

    :param mesh:
    :rtype: []

    """
    normals_ = []

    for face in mesh.tessfaces:
        vert_count = len(face.vertices)
        if vert_count is not 3:
            msg = "Non-triangulated face detected"
            raise exceptions.BufferGeometryError(msg)

        for vertex_index in face.vertices:
            normal = mesh.vertices[vertex_index].normal
            vector = (normal.x, normal.y, normal.z)
            normals_.extend(vector)

    return normals_


@_mesh
def buffer_position(mesh):
    """

    :param mesh:
    :rtype: []

    """
    position = []

    for face in mesh.tessfaces:
        vert_count = len(face.vertices)
        if vert_count is not 3:
            msg = "Non-triangulated face detected"
            raise exceptions.BufferGeometryError(msg)

        for vertex_index in face.vertices:
            vertex = mesh.vertices[vertex_index]
            vector = (vertex.co.x, vertex.co.y, vertex.co.z)
            position.extend(vector)

    return position


@_mesh
def buffer_uv(mesh):
    """

    :param mesh:
    :rtype: []

    """
    uvs_ = []
    if len(mesh.uv_layers) is 0:
        return uvs_
    elif len(mesh.uv_layers) > 1:
        # if memory serves me correctly buffer geometry
        # only uses one UV layer
        logger.warning("%s has more than 1 UV layer", mesh.name)

    for uv_data in mesh.uv_layers[0].data:
        uv_tuple = (uv_data.uv[0], uv_data.uv[1])
        uvs_.extend(uv_tuple)

    return uvs_


@_mesh
def faces(mesh, options):
    """

    :param mesh:
    :param options:

    """
    logger.debug("mesh.faces(%s, %s)", mesh, options)
    vertex_uv = len(mesh.uv_textures) > 0
    has_colors = len(mesh.vertex_colors) > 0
    logger.info("Has UVs = %s", vertex_uv)
    logger.info("Has vertex colours = %s", has_colors)

    opt_colours = options[constants.COLORS] and has_colors
    opt_uvs = options[constants.UVS] and vertex_uv
    opt_materials = options.get(constants.FACE_MATERIALS)
    opt_normals = options[constants.NORMALS]
    logger.debug("Vertex colours enabled = %s", opt_colours)
    logger.debug("UVS enabled = %s", opt_uvs)
    logger.debug("Materials enabled = %s", opt_materials)
    logger.debug("Normals enabled = %s", opt_normals)

    uv_layers = _uvs(mesh) if opt_uvs else None
    vertex_normals = _normals(mesh) if opt_normals else None
    vertex_colours = vertex_colors(mesh) if opt_colours else None

    faces_data = []

    colour_indices = {}
    if vertex_colours:
        logger.debug("Indexing colours")
        for index, colour in enumerate(vertex_colours):
            colour_indices[str(colour)] = index

    normal_indices = {}
    if vertex_normals:
        logger.debug("Indexing normals")
        for index, normal in enumerate(vertex_normals):
            normal_indices[str(normal)] = index

    logger.info("Parsing %d faces", len(mesh.tessfaces))
    for face in mesh.tessfaces:
        vert_count = len(face.vertices)

        if vert_count not in (3, 4):
            logger.error("%d vertices for face %d detected",
                         vert_count,
                         face.index)
            raise exceptions.NGonError("ngons are not supported")

        mat_index = face.material_index is not None and opt_materials
        mask = {
            constants.QUAD: vert_count is 4,
            constants.MATERIALS: mat_index,
            constants.UVS: False,
            constants.NORMALS: False,
            constants.COLORS: False
        }

        face_data = []

        face_data.extend([v for v in face.vertices])

        if mask[constants.MATERIALS]:
            face_data.append(face.material_index)

        # @TODO: this needs the same optimization as what
        #        was done for colours and normals
        if uv_layers:
            for index, uv_layer in enumerate(uv_layers):
                layer = mesh.tessface_uv_textures[index]

                for uv_data in layer.data[face.index].uv:
                    uv_tuple = (uv_data[0], uv_data[1])
                    face_data.append(uv_layer.index(uv_tuple))
                    mask[constants.UVS] = True

        if vertex_normals:
            for vertex in face.vertices:
                normal = mesh.vertices[vertex].normal
                normal = (normal.x, normal.y, normal.z)
                face_data.append(normal_indices[str(normal)])
                mask[constants.NORMALS] = True

        if vertex_colours:
            colours = mesh.tessface_vertex_colors.active.data[face.index]

            for each in (colours.color1, colours.color2, colours.color3):
                each = utilities.rgb2int(each)
                face_data.append(colour_indices[str(each)])
                mask[constants.COLORS] = True

            if mask[constants.QUAD]:
                colour = utilities.rgb2int(colours.color4)
                face_data.append(colour_indices[str(colour)])

        face_data.insert(0, utilities.bit_mask(mask))
        faces_data.extend(face_data)

    return faces_data


@_mesh
def morph_targets(mesh, options):
    """

    :param mesh:
    :param options:

    """
    logger.debug("mesh.morph_targets(%s, %s)", mesh, options)
    obj = object_.objects_using_mesh(mesh)[0]
    original_frame = context.scene.frame_current
    frame_step = options.get(constants.FRAME_STEP, 1)
    scene_frames = range(context.scene.frame_start,
                         context.scene.frame_end+1,
                         frame_step)

    morphs = []

    for frame in scene_frames:
        logger.info("Processing data at frame %d", frame)
        context.scene.frame_set(frame, 0.0)
        morphs.append([])
        vertices_ = object_.extract_mesh(obj, options).vertices[:]

        for vertex in vertices_:
            morphs[-1].extend([vertex.co.x, vertex.co.y, vertex.co.z])

    context.scene.frame_set(original_frame, 0.0)
    morphs_detected = False
    for index, each in enumerate(morphs):
        if index is 0:
            continue
        morphs_detected = morphs[index-1] != each
        if morphs_detected:
            logger.info("Valid morph target data detected")
            break
    else:
        logger.info("No valid morph data detected")
        return []

    manifest = []
    for index, morph in enumerate(morphs):
        manifest.append({
            constants.NAME: 'animation_%06d' % index,
            constants.VERTICES: morph
        })

    return manifest


@_mesh
def materials(mesh, options):
    """

    :param mesh:
    :param options:

    """
    logger.debug("mesh.materials(%s, %s)", mesh, options)
    indices = set([face.material_index for face in mesh.tessfaces])
    material_sets = [(mesh.materials[index], index) for index in indices]
    materials_ = []

    maps = options.get(constants.MAPS)

    mix = options.get(constants.MIX_COLORS)
    use_colors = options.get(constants.COLORS)
    logger.info("Colour mix is set to %s", mix)
    logger.info("Vertex colours set to %s", use_colors)

    for mat, index in material_sets:
        try:
            dbg_color = constants.DBG_COLORS[index]
        except IndexError:
            dbg_color = constants.DBG_COLORS[0]

        logger.info("Compiling attributes for %s", mat.name)
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
            logger.info("Adding specular attributes")
            attributes.update({
                constants.SPECULAR_COEF: material.specular_coef(mat),
                constants.COLOR_SPECULAR: material.specular_color(mat)
            })

        if mesh.show_double_sided:
            logger.info("Double sided is on")
            attributes[constants.DOUBLE_SIDED] = True

        materials_.append(attributes)

        if not maps:
            continue

        diffuse = _diffuse_map(mat)
        if diffuse:
            logger.info("Diffuse map found")
            attributes.update(diffuse)

        light = _light_map(mat)
        if light:
            logger.info("Light map found")
            attributes.update(light)

        specular = _specular_map(mat)
        if specular:
            logger.info("Specular map found")
            attributes.update(specular)

        if attributes[constants.SHADING] == constants.PHONG:
            normal = _normal_map(mat)
            if normal:
                logger.info("Normal map found")
                attributes.update(normal)

            bump = _bump_map(mat)
            if bump:
                logger.info("Bump map found")
                attributes.update(bump)

    return materials_


@_mesh
def normals(mesh):
    """

    :param mesh:
    :rtype: []

    """
    logger.debug("mesh.normals(%s)", mesh)
    normal_vectors = []

    for vector in _normals(mesh):
        normal_vectors.extend(vector)

    return normal_vectors


@_mesh
def skin_weights(mesh, bone_map, influences):
    """

    :param mesh:
    :param bone_map:
    :param influences:

    """
    logger.debug("mesh.skin_weights(%s)", mesh)
    return _skinning_data(mesh, bone_map, influences, 1)


@_mesh
def skin_indices(mesh, bone_map, influences):
    """

    :param mesh:
    :param bone_map:
    :param influences:

    """
    logger.debug("mesh.skin_indices(%s)", mesh)
    return _skinning_data(mesh, bone_map, influences, 0)


@_mesh
def texture_registration(mesh):
    """

    :param mesh:

    """
    logger.debug("mesh.texture_registration(%s)", mesh)
    materials_ = mesh.materials or []
    registration = {}

    funcs = (
        (constants.MAP_DIFFUSE, material.diffuse_map),
        (constants.SPECULAR_MAP, material.specular_map),
        (constants.LIGHT_MAP, material.light_map),
        (constants.BUMP_MAP, material.bump_map),
        (constants.NORMAL_MAP, material.normal_map)
    )

    def _registration(file_path, file_name):
        """

        :param file_path:
        :param file_name:

        """
        return {
            'file_path': file_path,
            'file_name': file_name,
            'maps': []
        }

    logger.info("found %d materials", len(materials_))
    for mat in materials_:
        for (key, func) in funcs:
            tex = func(mat)
            if tex is None:
                continue

            logger.info("%s has texture %s", key, tex.name)
            file_path = texture.file_path(tex)
            file_name = texture.file_name(tex)

            reg = registration.setdefault(
                utilities.hash(file_path),
                _registration(file_path, file_name))

            reg["maps"].append(key)

    return registration


@_mesh
def uvs(mesh):
    """

    :param mesh:
    :rtype: []

    """
    logger.debug("mesh.uvs(%s)", mesh)
    uvs_ = []
    for layer in _uvs(mesh):
        uvs_.append([])
        logger.info("Parsing UV layer %d", len(uvs_))
        for pair in layer:
            uvs_[-1].extend(pair)
    return uvs_


@_mesh
def vertex_colors(mesh):
    """

    :param mesh:

    """
    logger.debug("mesh.vertex_colors(%s)", mesh)
    vertex_colours = []

    try:
        vertex_colour = mesh.tessface_vertex_colors.active.data
    except AttributeError:
        logger.info("No vertex colours found")
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
def vertices(mesh):
    """

    :param mesh:
    :rtype: []

    """
    logger.debug("mesh.vertices(%s)", mesh)
    vertices_ = []

    for vertex in mesh.vertices:
        vertices_.extend((vertex.co.x, vertex.co.y, vertex.co.z))

    return vertices_


def _normal_map(mat):
    """

    :param mat:

    """
    tex = material.normal_map(mat)
    if tex is None:
        return

    logger.info("Found normal texture map %s", tex.name)

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
    """

    :param mat:

    """
    tex = material.bump_map(mat)
    if tex is None:
        return

    logger.info("Found bump texture map %s", tex.name)

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
    """

    :param mat:

    """
    tex = material.specular_map(mat)
    if tex is None:
        return

    logger.info("Found specular texture map %s", tex.name)

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
    """

    :param mat:

    """
    tex = material.light_map(mat)
    if tex is None:
        return

    logger.info("Found light texture map %s", tex.name)

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
    """

    :param mat:

    """
    tex = material.diffuse_map(mat)
    if tex is None:
        return

    logger.info("Found diffuse texture map %s", tex.name)

    diffuse = {
        constants.MAP_DIFFUSE:
            texture.file_name(tex),
        constants.MAP_DIFFUSE_ANISOTROPY:
            texture.anisotropy(tex),
        constants.MAP_DIFFUSE_WRAP: texture.wrap(tex),
        constants.MAP_DIFFUSE_REPEAT: texture.repeat(tex)
    }

    return diffuse


def _normals(mesh):
    """

    :param mesh:
    :rtype: []

    """
    vectors = []

    vectors_ = {}
    for face in mesh.tessfaces:

        for vertex_index in face.vertices:
            normal = mesh.vertices[vertex_index].normal
            vector = (normal.x, normal.y, normal.z)

            str_vec = str(vector)
            try:
                vectors_[str_vec]
            except KeyError:
                vectors.append(vector)
                vectors_[str_vec] = True

    return vectors


def _uvs(mesh):
    """

    :param mesh:

    """
    uv_layers = []

    for layer in mesh.uv_layers:
        uv_layers.append([])

        for uv_data in layer.data:
            uv_tuple = (uv_data.uv[0], uv_data.uv[1])

            if uv_tuple not in uv_layers[-1]:
                uv_layers[-1].append(uv_tuple)

    return uv_layers


def _armature(mesh):
    """

    :param mesh:

    """
    obj = object_.objects_using_mesh(mesh)[0]
    armature = obj.find_armature()
    if armature:
        logger.info("Found armature %s for %s", armature.name, obj.name)
    else:
        logger.info("Found no armature for %s", obj.name)
    return armature


def _skinning_data(mesh, bone_map, influences, array_index):
    """

    :param mesh:
    :param bone_map:
    :param influences:
    :param array_index:

    """
    armature = _armature(mesh)
    manifest = []
    if not armature:
        return manifest

    obj = object_.objects_using_mesh(mesh)[0]
    logger.debug("Skinned object found %s", obj.name)

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


def _pose_bones(armature):
    """

    :param armature:
    :rtype: [], {}

    """
    bones_ = []
    bone_map = {}
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
        bones_.append({
            constants.PARENT: bone_index,
            constants.NAME: armature_bone.name,
            constants.POS: (pos.x, pos.z, -pos.y),
            constants.ROTQ: (rot.x, rot.z, -rot.y, rot.w),
            constants.SCL: (scl.x, scl.z, scl.y)
        })

    return bones_, bone_map


def _rest_bones(armature):
    """

    :param armature:
    :rtype: [], {}

    """
    bones_ = []
    bone_map = {}
    bone_count = 0
    bone_index_rel = 0

    for bone in armature.data.bones:
        logger.info("Parsing bone %s", bone.name)

        if not bone.use_deform:
            logger.debug("Ignoring bone %s at: %d",
                         bone.name, bone_index_rel)
            continue

        if bone.parent is None:
            bone_pos = bone.head_local
            bone_index = -1
        else:
            bone_pos = bone.head_local - bone.parent.head_local
            bone_index = 0
            index = 0
            for parent in armature.data.bones:
                if parent.name == bone.parent.name:
                    bone_index = bone_map.get(index)
                index += 1

        bone_world_pos = armature.matrix_world * bone_pos
        x_axis = bone_world_pos.x
        y_axis = bone_world_pos.z
        z_axis = -bone_world_pos.y

        logger.debug("Adding bone %s at: %s, %s",
                     bone.name, bone_index, bone_index_rel)
        bone_map[bone_count] = bone_index_rel
        bone_index_rel += 1
        # @TODO: the rotq probably should not have these
        #        hard coded values
        bones_.append({
            constants.PARENT: bone_index,
            constants.NAME: bone.name,
            constants.POS: (x_axis, y_axis, z_axis),
            constants.ROTQ: (0, 0, 0, 1)
        })

        bone_count += 1

    return (bones_, bone_map)
