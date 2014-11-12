import uuid
import hashlib

from .. import constants


ROUND = constants.DEFAULT_PRECISION


def bit_mask(flags):
    bit = 0
    true = lambda x,y: (x | (1 << y))
    false = lambda x,y: (x & (~(1 << y)))

    for mask, position in constants.MASK.items():
        func = true if flags.get(mask) else false
        bit = func(bit, position)

    return bit


def hash(value):
    hash_ = hashlib.md5()
    hash_.update(repr(value).encode('utf8'))
    return hash_.hexdigest()


def id():
    return str(uuid.uuid4()).upper()


def rgb2int(rgb):
    is_tuple = isinstance(rgb, tuple)
    rgb = list(rgb) if is_tuple else rgb

    colour = (int(rgb[0]*255) << 16) + (int(rgb[1]*255) << 8) + int(rgb[2]*255)
    return colour


def round_off(value, ndigits=ROUND):
    is_tuple = isinstance(value, tuple)
    is_list = isinstance(value, list)

    value = list(value) if is_tuple else value
    value = [value] if not is_list and not is_tuple else value

    value = [round(val, ndigits) for val in value]

    if is_tuple:
        value = tuple(value)
    elif not is_list:
        value = value[0]

    return value


def rounding(options):
    round_off = options.get(constants.ENABLE_PRECISION)
    if round_off:
        round_val = options[constants.PRECISION]
    else:
        round_val = None

    return (round_off, round_val)
