from bpy import data, types
from .. import constants, logger
from .constants import IMAGE, MAG_FILTER, MIN_FILTER, MAPPING
from . import image


def _texture(func):

    def inner(name, *args, **kwargs):

        if isinstance(name, types.Texture):
            texture = name
        else:
            texture = data.textures[name] 

        return func(texture, *args, **kwargs)

    return inner


@_texture
def anisotropy(texture):
    logger.debug('texture.file_path(%s)', texture)
    return texture.filter_size


@_texture
def file_name(texture):
    logger.debug('texture.file_name(%s)', texture)
    if texture.image:
        return image.file_name(texture.image)


@_texture
def file_path(texture):
    logger.debug('texture.file_path(%s)', texture)
    if texture.image:
        return image.file_path(texture.image)


@_texture
def image_node(texture):
    logger.debug('texture.image_node(%s)', texture)
    return texture.image


@_texture
def mag_filter(texture):
    logger.debug('texture.mag_filter(%s)', texture)
    try:
        val = texture.THREE_mag_filter
    except AttributeError:
        logger.debug('No THREE_mag_filter attribute found')
        val = MAG_FILTER

    return val


@_texture
def mapping(texture):
    logger.debug('texture.mapping(%s)', texture)
    try:
        val = texture.THREE_mapping
    except AttributeError:
        logger.debug('No THREE_mapping attribute found')
        val = MAPPING

    return val
@_texture
def min_filter(texture):
    logger.debug('texture.min_filter(%s)', texture)
    try:
        val = texture.THREE_min_filter
    except AttributeError:
        logger.debug('No THREE_min_filter attribute found')
        val = MIN_FILTER 

    return val


@_texture
def repeat(texture):
    logger.debug('texture.repeat(%s)', texture)
    return (texture.repeat_x, texture.repeat_y)


@_texture
def wrap(texture):
    logger.debug('texture.wrap(%s)', texture)
    wrapping = {
        True: constants.WRAPPING.MIRROR, 
        False: constants.WRAPPING.REPEAT
    }
    return (wrapping[texture.use_mirror_x], wrapping[texture.use_mirror_y])


def textures():
    logger.debug('texture.textures()')
    for texture in data.textures:
        if texture.type == IMAGE:
            yield texture.name
