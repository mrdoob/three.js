from bpy import data, types
from .. import constants, logger
from .constants import MULTIPLY, WIRE, IMAGE


def _material(func):
    """

    :param func:

    """

    def inner(name, *args, **kwargs):
        """

        :param name:
        :param *args:
        :param **kwargs:

        """

        if isinstance(name, types.Material):
            material = name
        else:
            material = data.materials[name]

        return func(material, *args, **kwargs)

    return inner


@_material
def ambient_color(material):
    """

    :param material:
    :return: rgb value
    :rtype: tuple

    """
    logger.debug("material.ambient_color(%s)", material)
    diffuse = diffuse_color(material)
    return (material.ambient * diffuse[0],
            material.ambient * diffuse[1],
            material.ambient * diffuse[2])


@_material
def blending(material):
    """

    :param material:
    :return: THREE_blending_type value

    """
    logger.debug("material.blending(%s)", material)
    try:
        blend = material.THREE_blending_type
    except AttributeError:
        logger.debug("No THREE_blending_type attribute found")
        blend = constants.NORMAL_BLENDING
    return blend


@_material
def bump_map(material):
    """

    :param material:
    :return: texture node for bump

    """
    logger.debug("material.bump_map(%s)", material)
    for texture in _valid_textures(material):
        if texture.use_map_normal and not \
           texture.texture.use_normal_map:
            return texture.texture


@_material
def bump_scale(material):
    """

    :param material:
    :rtype: float

    """
    return normal_scale(material)


@_material
def depth_test(material):
    """

    :param material:
    :return: THREE_depth_test value
    :rtype: bool

    """
    logger.debug("material.depth_test(%s)", material)
    try:
        test = material.THREE_depth_test
    except AttributeError:
        logger.debug("No THREE_depth_test attribute found")
        test = True
    return test


@_material
def depth_write(material):
    """

    :param material:
    :return: THREE_depth_write value
    :rtype: bool

    """
    logger.debug("material.depth_write(%s)", material)
    try:
        write = material.THREE_depth_write
    except AttributeError:
        logger.debug("No THREE_depth_write attribute found")
        write = True
    return write


@_material
def double_sided(material):
    """

    :param material:
    :return: THREE_double_sided value
    :rtype: bool

    """
    logger.debug("material.double_sided(%s)", material)
    try:
        write = material.THREE_double_sided
    except AttributeError:
        logger.debug("No THREE_double_sided attribute found")
        write = False
    return write


@_material
def diffuse_color(material):
    """

    :param material:
    :return: rgb value
    :rtype: tuple

    """
    logger.debug("material.diffuse_color(%s)", material)
    return (material.diffuse_intensity * material.diffuse_color[0],
            material.diffuse_intensity * material.diffuse_color[1],
            material.diffuse_intensity * material.diffuse_color[2])


@_material
def diffuse_map(material):
    """

    :param material:
    :return: texture node for map

    """
    logger.debug("material.diffuse_map(%s)", material)
    for texture in _valid_textures(material):
        if texture.use_map_color_diffuse and not \
           texture.blend_type == MULTIPLY:
            return texture.texture


@_material
def emissive_color(material):
    """

    :param material:
    :return: rgb value
    :rtype: tuple

    """
    logger.debug("material.emissive_color(%s)", material)
    diffuse = diffuse_color(material)
    return (material.emit * diffuse[0],
            material.emit * diffuse[1],
            material.emit * diffuse[2])


@_material
def light_map(material):
    """

    :param material:
    :return: texture node for light maps

    """
    logger.debug("material.light_map(%s)", material)
    for texture in _valid_textures(material, strict_use=False):
        if texture.use_map_color_diffuse and \
           texture.blend_type == MULTIPLY:
            return texture.texture


@_material
def normal_scale(material):
    """

    :param material:
    :rtype: float

    """
    logger.debug("material.normal_scale(%s)", material)
    for texture in _valid_textures(material):
        if texture.use_map_normal:
            return texture.normal_factor


@_material
def normal_map(material):
    """

    :param material:
    :return: texture node for normals

    """
    logger.debug("material.normal_map(%s)", material)
    for texture in _valid_textures(material):
        if texture.use_map_normal and \
           texture.texture.use_normal_map:
            return texture.texture


@_material
def opacity(material):
    """

    :param material:
    :rtype: float

    """
    logger.debug("material.opacity(%s)", material)
    return round(material.alpha, 2)


@_material
def shading(material):
    """

    :param material:
    :return: shading type (phong or lambert)

    """
    logger.debug("material.shading(%s)", material)
    dispatch = {
        True: constants.PHONG,
        False: constants.LAMBERT
    }

    return dispatch[material.specular_intensity > 0.0]


@_material
def specular_coef(material):
    """

    :param material:
    :rtype: float

    """
    logger.debug("material.specular_coef(%s)", material)
    return material.specular_hardness


@_material
def specular_color(material):
    """

    :param material:
    :return: rgb value
    :rtype: tuple

    """
    logger.debug("material.specular_color(%s)", material)
    return (material.specular_intensity * material.specular_color[0],
            material.specular_intensity * material.specular_color[1],
            material.specular_intensity * material.specular_color[2])


@_material
def specular_map(material):
    """

    :param material:
    :return: texture node for specular

    """
    logger.debug("material.specular_map(%s)", material)
    for texture in _valid_textures(material):
        if texture.use_map_specular:
            return texture.texture


@_material
def transparent(material):
    """

    :param material:
    :rtype: bool

    """
    logger.debug("material.transparent(%s)", material)
    return material.use_transparency


@_material
def type(material):
    """

    :param material:
    :return: THREE compatible shader type

    """
    logger.debug("material.type(%s)", material)
    if material.diffuse_shader != 'LAMBERT':
        material_type = constants.BASIC
    elif material.specular_intensity > 0:
        material_type = constants.PHONG
    else:
        material_type = constants.LAMBERT

    return material_type


@_material
def use_vertex_colors(material):
    """

    :param material:
    :rtype: bool

    """
    logger.debug("material.use_vertex_colors(%s)", material)
    return material.use_vertex_color_paint


def used_materials():
    """

    :return: list of materials that are in use
    :rtype: generator

    """
    logger.debug("material.used_materials()")
    for material in data.materials:
        if material.users > 0:
            yield material.name


@_material
def visible(material):
    """

    :param material:
    :return: THREE_visible value
    :rtype: bool

    """
    logger.debug("material.visible(%s)", material)
    try:
        vis = material.THREE_visible
    except AttributeError:
        logger.debug("No THREE_visible attribute found")
        vis = True

    return vis


@_material
def wireframe(material):
    """

    :param material:
    :rtype: bool

    """
    logger.debug("material.wireframe(%s)", material)
    return material.type == WIRE


def _valid_textures(material, strict_use=True):
    """

    :param material:
    :rtype: generator

    """
    for texture in material.texture_slots:
        if not texture:
            continue
        if strict_use:
            in_use = texture.use
        else:
            in_use = True
        if not in_use:
            continue
        if not texture.texture or texture.texture.type != IMAGE:
            logger.warning("Unable to export non-image texture %s", texture)
            continue
        logger.debug("Valid texture found %s", texture)
        yield texture
