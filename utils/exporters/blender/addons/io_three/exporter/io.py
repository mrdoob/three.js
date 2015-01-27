import os
import sys
import shutil
import traceback
from .. import constants, logger
from . import _json


def copy_registered_textures(dest, registration):
    logger.debug('io.copy_registered_textures(%s, %s)', dest, registration)
    for value in registration.values():
        copy(value['file_path'], dest)


def copy(src, dst):
    logger.debug('io.copy(%s, %s)' % (src, dst))
    if os.path.isfile(src):
        file_name = os.path.basename(src)
        dst = os.path.join(dst, file_name)

    if os.path.exists(dst):

        logger.info('Destination file exists, attempting to remove %s', dst)
        try:
            os.remove(dst)
        except:
            logger.error('Failed to remove destination file')
            info = sys.exc_info()
            trace = traceback.format_exception(
                info[0], info[1], info[2].tb_next)
            trace = ''.join(trace)
            logger.error(trace)
            raise

    shutil.copy(src, dst)


def dump(filepath, data, options=None):
    options = options or {}
    logger.debug('io.dump(%s, data, options=%s)', filepath, options)

    compress = options.get(constants.COMPRESSION, constants.NONE)
    if compress == constants.MSGPACK:
        try:
            import msgpack
        except ImportError:
            logger.error('msgpack module not found')
            raise

        logger.info('Dumping to msgpack')
        func = lambda x,y: msgpack.dump(x, y)
        mode = 'wb'
    else:
        round_off = options.get(constants.ENABLE_PRECISION)
        if round_off:
            _json.ROUND = options[constants.PRECISION]
        else:
            _json.ROUND = None

        logger.info('Dumping to JSON')
        func = lambda x,y: _json.json.dump(x, y, indent=4)
        mode = 'w'

    logger.info('Writing to %s', filepath)
    with open(filepath, mode=mode) as stream:
        func(data, stream)


def load(filepath, options):
    logger.debug('io.load(%s, %s)', filepath, options)
    compress = options.get(constants.COMPRESSION, constants.NONE)
    if compress == constants.MSGPACK:
        try:
            import msgpack
        except ImportError:
            logger.error('msgpack module not found')
            raise
        module = msgpack
        mode = 'rb'
    else:
        logger.info('Loading JSON')
        module = _json.json
        mode = 'r'

    with open(filepath, mode=mode) as stream:
        data = module.load(stream)

    return data
