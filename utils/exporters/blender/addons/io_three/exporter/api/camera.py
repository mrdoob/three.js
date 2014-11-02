from bpy import data, types, context
from .. import logger


def _camera(func):

    def inner(name, *args, **kwargs):

        if isinstance(name, types.Camera):
            camera = name
        else:
            camera = data.cameras[name] 

        return func(camera, *args, **kwargs)

    return inner


@_camera
def aspect(camera):
    logger.debug('camera.aspect(%s)', camera)
    render = context.scene.render
    return render.resolution_x/render.resolution_y


@_camera
def bottom(camera):
    logger.debug('camera.bottom(%s)', camera)
    return  -(camera.angle_y * camera.ortho_scale)


@_camera
def far(camera):
    logger.debug('camera.far(%s)', camera)
    return camera.clip_end


@_camera
def fov(camera):
    logger.debug('camera.fov(%s)', camera)
    return camera.lens


@_camera
def left(camera):
    logger.debug('camera.left(%s)', camera)
    return -(camera.angle_x * camera.ortho_scale)


@_camera
def near(camera):
    logger.debug('camera.near(%s)', camera)
    return camera.clip_start


@_camera
def right(camera):
    logger.debug('camera.right(%s)', camera)
    return camera.angle_x * camera.ortho_scale


@_camera
def top(camera):
    logger.debug('camera.top(%s)', camera)
    return camera.angle_y * camera.ortho_scale
