from bpy import data, types 
from .. import utilities, logger


def _lamp(func):

    def inner(name, *args, **kwargs):

        if isinstance(name, types.Lamp):
            lamp = name
        else:
            lamp = data.lamps[name] 

        return func(lamp, *args, **kwargs)

    return inner


@_lamp
def angle(lamp):
    logger.debug('light.angle(%s)', lamp)
    return lamp.spot_size


@_lamp
def color(lamp):
    logger.debug('light.color(%s)', lamp)
    colour = (lamp.color.r, lamp.color.g, lamp.color.b)
    return utilities.rgb2int(colour)


@_lamp
def distance(lamp):
    logger.debug('light.distance(%s)', lamp)
    return lamp.distance


@_lamp
def intensity(lamp):
    logger.debug('light.intensity(%s)', lamp)
    return round(lamp.energy, 2)
