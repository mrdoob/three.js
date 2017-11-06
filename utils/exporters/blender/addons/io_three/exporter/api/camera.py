import math
from bpy import data, types, context
from .. import logger


def _camera(func):
    """

    :param func:

    """

    def inner(name, *args, **kwargs):
        """

        :param name:
        :param *args:
        :param **kwargs:

        """

        if isinstance(name, types.Camera):
            camera = name
        else:
            camera = data.cameras[name]

        return func(camera, *args, **kwargs)

    return inner


@_camera
def aspect(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.aspect(%s)", camera)
    render = context.scene.render
    return render.resolution_x/render.resolution_y


@_camera
def bottom(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.bottom(%s)", camera)
    return -(camera.angle_y * camera.ortho_scale)


@_camera
def far(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.far(%s)", camera)
    return camera.clip_end


@_camera
def fov(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.fov(%s)", camera)
    fov_in_radians = camera.angle
    aspect_ratio = aspect(camera)
    if aspect_ratio > 1:
        fov_in_radians = 2 * math.atan(math.tan(fov_in_radians / 2) / aspect_ratio)
    return math.degrees(fov_in_radians)


@_camera
def left(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.left(%s)", camera)
    return -(camera.angle_x * camera.ortho_scale)


@_camera
def near(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.near(%s)", camera)
    return camera.clip_start


@_camera
def right(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.right(%s)", camera)
    return camera.angle_x * camera.ortho_scale


@_camera
def top(camera):
    """

    :param camera:
    :rtype: float

    """
    logger.debug("camera.top(%s)", camera)
    return camera.angle_y * camera.ortho_scale
