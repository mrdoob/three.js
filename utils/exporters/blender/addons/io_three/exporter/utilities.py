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


def id_from_name(name):
    """Generate a UUID using a name as the namespace

    :type name: str
    :rtype: str

    """
    return str(uuid.uuid3(uuid.NAMESPACE_DNS, name)).upper()


def rgb2int(rgb):
    """Convert a given rgb value to an integer

    :type rgb: list|tuple
    :rtype: int

    """
    is_tuple = isinstance(rgb, tuple)
    rgb = list(rgb) if is_tuple else rgb

    colour = (int(rgb[0]*255) << 16) + (int(rgb[1]*255) << 8) + int(rgb[2]*255)
    return colour


def round_off(value, ndigits=ROUND):
    """Round off values to specified limit

    :param value: value(s) to round off
    :param ndigits: limit (Default value = ROUND)
    :type value: float|list|tuple
    :return: the same data type that was passed
    :rtype: float|list|tuple

    """
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
    """By evaluation the options determine if precision was
    enabled and what the value is

    :type options: dict
    :rtype: bool, int

    """
    round_off_ = options.get(constants.ENABLE_PRECISION)
    if round_off_:
        round_val = options[constants.PRECISION]
    else:
        round_val = None

    return (round_off_, round_val)
