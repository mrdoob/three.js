import uuid
import hashlib

from .. import constants


ROUND = constants.DEFAULT_PRECISION


def bit_mask(flags):
    """Generate a bit mask.

    :type flags: dict
    :return: int

    """
    bit = 0
    true = lambda x, y: (x | (1 << y))
    false = lambda x, y: (x & (~(1 << y)))

    for mask, position in constants.MASK.items():
        func = true if flags.get(mask) else false
        bit = func(bit, position)

    return bit


def hash(value):
    """Generate a hash from a given value

    :param value:
    :rtype: str

    """
    hash_ = hashlib.md5()
    hash_.update(repr(value).encode('utf8'))
    return hash_.hexdigest()


def id():
    """Generate a random UUID

    :rtype: str

    """
    return str(uuid.uuid4()).upper()


def rgb2int(rgb):
    """Convert a given rgb value to an integer

    :type rgb: list|tuple
    :rtype: int

    """
    is_tuple = isinstance(rgb, tuple)
    rgb = list(rgb) if is_tuple else rgb

    colour = (int(rgb[0]*255) << 16) + (int(rgb[1]*255) << 8) + int(rgb[2]*255)
    return colour
