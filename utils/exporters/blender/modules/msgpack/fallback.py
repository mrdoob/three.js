"""Fallback pure Python implementation of msgpack"""

import sys
import array
import struct

if sys.version_info[0] == 3:
    PY3 = True
    int_types = int
    Unicode = str
    xrange = range
    def dict_iteritems(d):
        return d.items()
else:
    PY3 = False
    int_types = (int, long)
    Unicode = unicode
    def dict_iteritems(d):
        return d.iteritems()


if hasattr(sys, 'pypy_version_info'):
    # cStringIO is slow on PyPy, StringIO is faster.  However: PyPy's own
    # StringBuilder is fastest.
    from __pypy__ import newlist_hint
    from __pypy__.builders import StringBuilder
    USING_STRINGBUILDER = True
    class StringIO(object):
        def __init__(self, s=b''):
            if s:
                self.builder = StringBuilder(len(s))
                self.builder.append(s)
            else:
                self.builder = StringBuilder()
        def write(self, s):
            self.builder.append(s)
        def getvalue(self):
            return self.builder.build()
else:
    USING_STRINGBUILDER = False
    from io import BytesIO as StringIO
    newlist_hint = lambda size: []

from msgpack.exceptions import (
    BufferFull,
    OutOfData,
    UnpackValueError,
    PackValueError,
    ExtraData)

from msgpack import ExtType


EX_SKIP                 = 0
EX_CONSTRUCT            = 1
EX_READ_ARRAY_HEADER    = 2
EX_READ_MAP_HEADER      = 3

TYPE_IMMEDIATE          = 0
TYPE_ARRAY              = 1
TYPE_MAP                = 2
TYPE_RAW                = 3
TYPE_BIN                = 4
TYPE_EXT                = 5

DEFAULT_RECURSE_LIMIT = 511


def unpack(stream, **kwargs):
    """
    Unpack an object from `stream`.

    Raises `ExtraData` when `packed` contains extra bytes.
    See :class:`Unpacker` for options.
    """
    unpacker = Unpacker(stream, **kwargs)
    ret = unpacker._fb_unpack()
    if unpacker._fb_got_extradata():
        raise ExtraData(ret, unpacker._fb_get_extradata())
    return ret


def unpackb(packed, **kwargs):
    """
    Unpack an object from `packed`.

    Raises `ExtraData` when `packed` contains extra bytes.
    See :class:`Unpacker` for options.
    """
    unpacker = Unpacker(None, **kwargs)
    unpacker.feed(packed)
    try:
        ret = unpacker._fb_unpack()
    except OutOfData:
        raise UnpackValueError("Data is not enough.")
    if unpacker._fb_got_extradata():
        raise ExtraData(ret, unpacker._fb_get_extradata())
    return ret


class Unpacker(object):
    """
    Streaming unpacker.

    `file_like` is a file-like object having a `.read(n)` method.
    When `Unpacker` is initialized with a `file_like`, `.feed()` is not
    usable.

    `read_size` is used for `file_like.read(read_size)`.

    If `use_list` is True (default), msgpack lists are deserialized to Python
    lists.  Otherwise they are deserialized to tuples.

    `object_hook` is the same as in simplejson.  If it is not None, it should
    be callable and Unpacker calls it with a dict argument after deserializing
    a map.

    `object_pairs_hook` is the same as in simplejson.  If it is not None, it
    should be callable and Unpacker calls it with a list of key-value pairs
    after deserializing a map.

    `ext_hook` is callback for ext (User defined) type. It called with two
    arguments: (code, bytes). default: `msgpack.ExtType`

    `encoding` is the encoding used for decoding msgpack bytes.  If it is
    None (default), msgpack bytes are deserialized to Python bytes.

    `unicode_errors` is used for decoding bytes.

    `max_buffer_size` limits the buffer size.  0 means INT_MAX (default).

    Raises `BufferFull` exception when it is unsufficient.

    You should set this parameter when unpacking data from an untrustred source.

    example of streaming deserialization from file-like object::

        unpacker = Unpacker(file_like)
        for o in unpacker:
            do_something(o)

    example of streaming deserialization from socket::

        unpacker = Unpacker()
        while 1:
            buf = sock.recv(1024*2)
            if not buf:
                break
            unpacker.feed(buf)
            for o in unpacker:
                do_something(o)
    """

    def __init__(self, file_like=None, read_size=0, use_list=True,
                 object_hook=None, object_pairs_hook=None, list_hook=None,
                 encoding=None, unicode_errors='strict', max_buffer_size=0,
                 ext_hook=ExtType):
        if file_like is None:
            self._fb_feeding = True
        else:
            if not callable(file_like.read):
                raise TypeError("`file_like.read` must be callable")
            self.file_like = file_like
            self._fb_feeding = False
        self._fb_buffers = []
        self._fb_buf_o = 0
        self._fb_buf_i = 0
        self._fb_buf_n = 0
        self._max_buffer_size = max_buffer_size or 2**31-1
        if read_size > self._max_buffer_size:
            raise ValueError("read_size must be smaller than max_buffer_size")
        self._read_size = read_size or min(self._max_buffer_size, 2048)
        self._encoding = encoding
        self._unicode_errors = unicode_errors
        self._use_list = use_list
        self._list_hook = list_hook
        self._object_hook = object_hook
        self._object_pairs_hook = object_pairs_hook
        self._ext_hook = ext_hook

        if list_hook is not None and not callable(list_hook):
            raise TypeError('`list_hook` is not callable')
        if object_hook is not None and not callable(object_hook):
            raise TypeError('`object_hook` is not callable')
        if object_pairs_hook is not None and not callable(object_pairs_hook):
            raise TypeError('`object_pairs_hook` is not callable')
        if object_hook is not None and object_pairs_hook is not None:
            raise TypeError("object_pairs_hook and object_hook are mutually "
                            "exclusive")
        if not callable(ext_hook):
            raise TypeError("`ext_hook` is not callable")

    def feed(self, next_bytes):
        if isinstance(next_bytes, array.array):
            next_bytes = next_bytes.tostring()
        elif isinstance(next_bytes, bytearray):
            next_bytes = bytes(next_bytes)
        assert self._fb_feeding
        if self._fb_buf_n + len(next_bytes) > self._max_buffer_size:
            raise BufferFull
        self._fb_buf_n += len(next_bytes)
        self._fb_buffers.append(next_bytes)

    def _fb_consume(self):
        self._fb_buffers = self._fb_buffers[self._fb_buf_i:]
        if self._fb_buffers:
            self._fb_buffers[0] = self._fb_buffers[0][self._fb_buf_o:]
        self._fb_buf_o = 0
        self._fb_buf_i = 0
        self._fb_buf_n = sum(map(len, self._fb_buffers))

    def _fb_got_extradata(self):
        if self._fb_buf_i != len(self._fb_buffers):
            return True
        if self._fb_feeding:
            return False
        if not self.file_like:
            return False
        if self.file_like.read(1):
            return True
        return False

    def __iter__(self):
        return self

    def read_bytes(self, n):
        return self._fb_read(n)

    def _fb_rollback(self):
        self._fb_buf_i = 0
        self._fb_buf_o = 0

    def _fb_get_extradata(self):
        bufs = self._fb_buffers[self._fb_buf_i:]
        if bufs:
            bufs[0] = bufs[0][self._fb_buf_o:]
        return b''.join(bufs)

    def _fb_read(self, n, write_bytes=None):
        buffs = self._fb_buffers
        if (write_bytes is None and self._fb_buf_i < len(buffs) and
                self._fb_buf_o + n < len(buffs[self._fb_buf_i])):
            self._fb_buf_o += n
            return buffs[self._fb_buf_i][self._fb_buf_o - n:self._fb_buf_o]

        ret = b''
        while len(ret) != n:
            if self._fb_buf_i == len(buffs):
                if self._fb_feeding:
                    break
                tmp = self.file_like.read(self._read_size)
                if not tmp:
                    break
                buffs.append(tmp)
                continue
            sliced = n - len(ret)
            ret += buffs[self._fb_buf_i][self._fb_buf_o:self._fb_buf_o + sliced]
            self._fb_buf_o += sliced
            if self._fb_buf_o >= len(buffs[self._fb_buf_i]):
                self._fb_buf_o = 0
                self._fb_buf_i += 1
        if len(ret) != n:
            self._fb_rollback()
            raise OutOfData
        if write_bytes is not None:
            write_bytes(ret)
        return ret

    def _read_header(self, execute=EX_CONSTRUCT, write_bytes=None):
        typ = TYPE_IMMEDIATE
        n = 0
        obj = None
        c = self._fb_read(1, write_bytes)
        b = ord(c)
        if   b & 0b10000000 == 0:
            obj = b
        elif b & 0b11100000 == 0b11100000:
            obj = struct.unpack("b", c)[0]
        elif b & 0b11100000 == 0b10100000:
            n = b & 0b00011111
            obj = self._fb_read(n, write_bytes)
            typ = TYPE_RAW
        elif b & 0b11110000 == 0b10010000:
            n = b & 0b00001111
            typ = TYPE_ARRAY
        elif b & 0b11110000 == 0b10000000:
            n = b & 0b00001111
            typ = TYPE_MAP
        elif b == 0xc0:
            obj = None
        elif b == 0xc2:
            obj = False
        elif b == 0xc3:
            obj = True
        elif b == 0xc4:
            typ = TYPE_BIN
            n = struct.unpack("B", self._fb_read(1, write_bytes))[0]
            obj = self._fb_read(n, write_bytes)
        elif b == 0xc5:
            typ = TYPE_BIN
            n = struct.unpack(">H", self._fb_read(2, write_bytes))[0]
            obj = self._fb_read(n, write_bytes)
        elif b == 0xc6:
            typ = TYPE_BIN
            n = struct.unpack(">I", self._fb_read(4, write_bytes))[0]
            obj = self._fb_read(n, write_bytes)
        elif b == 0xc7:  # ext 8
            typ = TYPE_EXT
            L, n = struct.unpack('Bb', self._fb_read(2, write_bytes))
            obj = self._fb_read(L, write_bytes)
        elif b == 0xc8:  # ext 16
            typ = TYPE_EXT
            L, n = struct.unpack('>Hb', self._fb_read(3, write_bytes))
            obj = self._fb_read(L, write_bytes)
        elif b == 0xc9:  # ext 32
            typ = TYPE_EXT
            L, n = struct.unpack('>Ib', self._fb_read(5, write_bytes))
            obj = self._fb_read(L, write_bytes)
        elif b == 0xca:
            obj = struct.unpack(">f", self._fb_read(4, write_bytes))[0]
        elif b == 0xcb:
            obj = struct.unpack(">d", self._fb_read(8, write_bytes))[0]
        elif b == 0xcc:
            obj = struct.unpack("B", self._fb_read(1, write_bytes))[0]
        elif b == 0xcd:
            obj = struct.unpack(">H", self._fb_read(2, write_bytes))[0]
        elif b == 0xce:
            obj = struct.unpack(">I", self._fb_read(4, write_bytes))[0]
        elif b == 0xcf:
            obj = struct.unpack(">Q", self._fb_read(8, write_bytes))[0]
        elif b == 0xd0:
            obj = struct.unpack("b", self._fb_read(1, write_bytes))[0]
        elif b == 0xd1:
            obj = struct.unpack(">h", self._fb_read(2, write_bytes))[0]
        elif b == 0xd2:
            obj = struct.unpack(">i", self._fb_read(4, write_bytes))[0]
        elif b == 0xd3:
            obj = struct.unpack(">q", self._fb_read(8, write_bytes))[0]
        elif b == 0xd4:  # fixext 1
            typ = TYPE_EXT
            n, obj = struct.unpack('b1s', self._fb_read(2, write_bytes))
        elif b == 0xd5:  # fixext 2
            typ = TYPE_EXT
            n, obj = struct.unpack('b2s', self._fb_read(3, write_bytes))
        elif b == 0xd6:  # fixext 4
            typ = TYPE_EXT
            n, obj = struct.unpack('b4s', self._fb_read(5, write_bytes))
        elif b == 0xd7:  # fixext 8
            typ = TYPE_EXT
            n, obj = struct.unpack('b8s', self._fb_read(9, write_bytes))
        elif b == 0xd8:  # fixext 16
            typ = TYPE_EXT
            n, obj = struct.unpack('b16s', self._fb_read(17, write_bytes))
        elif b == 0xd9:
            typ = TYPE_RAW
            n = struct.unpack("B", self._fb_read(1, write_bytes))[0]
            obj = self._fb_read(n, write_bytes)
        elif b == 0xda:
            typ = TYPE_RAW
            n = struct.unpack(">H", self._fb_read(2, write_bytes))[0]
            obj = self._fb_read(n, write_bytes)
        elif b == 0xdb:
            typ = TYPE_RAW
            n = struct.unpack(">I", self._fb_read(4, write_bytes))[0]
            obj = self._fb_read(n, write_bytes)
        elif b == 0xdc:
            n = struct.unpack(">H", self._fb_read(2, write_bytes))[0]
            typ = TYPE_ARRAY
        elif b == 0xdd:
            n = struct.unpack(">I", self._fb_read(4, write_bytes))[0]
            typ = TYPE_ARRAY
        elif b == 0xde:
            n = struct.unpack(">H", self._fb_read(2, write_bytes))[0]
            typ = TYPE_MAP
        elif b == 0xdf:
            n = struct.unpack(">I", self._fb_read(4, write_bytes))[0]
            typ = TYPE_MAP
        else:
            raise UnpackValueError("Unknown header: 0x%x" % b)
        return typ, n, obj

    def _fb_unpack(self, execute=EX_CONSTRUCT, write_bytes=None):
        typ, n, obj = self._read_header(execute, write_bytes)

        if execute == EX_READ_ARRAY_HEADER:
            if typ != TYPE_ARRAY:
                raise UnpackValueError("Expected array")
            return n
        if execute == EX_READ_MAP_HEADER:
            if typ != TYPE_MAP:
                raise UnpackValueError("Expected map")
            return n
        # TODO should we eliminate the recursion?
        if typ == TYPE_ARRAY:
            if execute == EX_SKIP:
                for i in xrange(n):
                    # TODO check whether we need to call `list_hook`
                    self._fb_unpack(EX_SKIP, write_bytes)
                return
            ret = newlist_hint(n)
            for i in xrange(n):
                ret.append(self._fb_unpack(EX_CONSTRUCT, write_bytes))
            if self._list_hook is not None:
                ret = self._list_hook(ret)
            # TODO is the interaction between `list_hook` and `use_list` ok?
            return ret if self._use_list else tuple(ret)
        if typ == TYPE_MAP:
            if execute == EX_SKIP:
                for i in xrange(n):
                    # TODO check whether we need to call hooks
                    self._fb_unpack(EX_SKIP, write_bytes)
                    self._fb_unpack(EX_SKIP, write_bytes)
                return
            if self._object_pairs_hook is not None:
                ret = self._object_pairs_hook(
                    (self._fb_unpack(EX_CONSTRUCT, write_bytes),
                     self._fb_unpack(EX_CONSTRUCT, write_bytes))
                    for _ in xrange(n))
            else:
                ret = {}
                for _ in xrange(n):
                    key = self._fb_unpack(EX_CONSTRUCT, write_bytes)
                    ret[key] = self._fb_unpack(EX_CONSTRUCT, write_bytes)
                if self._object_hook is not None:
                    ret = self._object_hook(ret)
            return ret
        if execute == EX_SKIP:
            return
        if typ == TYPE_RAW:
            if self._encoding is not None:
                obj = obj.decode(self._encoding, self._unicode_errors)
            return obj
        if typ == TYPE_EXT:
            return self._ext_hook(n, obj)
        if typ == TYPE_BIN:
            return obj
        assert typ == TYPE_IMMEDIATE
        return obj

    def next(self):
        try:
            ret = self._fb_unpack(EX_CONSTRUCT, None)
            self._fb_consume()
            return ret
        except OutOfData:
            raise StopIteration
    __next__ = next

    def skip(self, write_bytes=None):
        self._fb_unpack(EX_SKIP, write_bytes)
        self._fb_consume()

    def unpack(self, write_bytes=None):
        ret = self._fb_unpack(EX_CONSTRUCT, write_bytes)
        self._fb_consume()
        return ret

    def read_array_header(self, write_bytes=None):
        ret = self._fb_unpack(EX_READ_ARRAY_HEADER, write_bytes)
        self._fb_consume()
        return ret

    def read_map_header(self, write_bytes=None):
        ret = self._fb_unpack(EX_READ_MAP_HEADER, write_bytes)
        self._fb_consume()
        return ret


class Packer(object):
    """
    MessagePack Packer

    usage:

        packer = Packer()
        astream.write(packer.pack(a))
        astream.write(packer.pack(b))

    Packer's constructor has some keyword arguments:

    :param callable default:
        Convert user type to builtin type that Packer supports.
        See also simplejson's document.
    :param str encoding:
            Convert unicode to bytes with this encoding. (default: 'utf-8')
    :param str unicode_errors:
        Error handler for encoding unicode. (default: 'strict')
    :param bool use_single_float:
        Use single precision float type for float. (default: False)
    :param bool autoreset:
        Reset buffer after each pack and return it's content as `bytes`. (default: True).
        If set this to false, use `bytes()` to get content and `.reset()` to clear buffer.
    :param bool use_bin_type:
        Use bin type introduced in msgpack spec 2.0 for bytes.
        It also enable str8 type for unicode.
    """
    def __init__(self, default=None, encoding='utf-8', unicode_errors='strict',
                 use_single_float=False, autoreset=True, use_bin_type=False):
        self._use_float = use_single_float
        self._autoreset = autoreset
        self._use_bin_type = use_bin_type
        self._encoding = encoding
        self._unicode_errors = unicode_errors
        self._buffer = StringIO()
        if default is not None:
            if not callable(default):
                raise TypeError("default must be callable")
        self._default = default

    def _pack(self, obj, nest_limit=DEFAULT_RECURSE_LIMIT, isinstance=isinstance):
        default_used = False
        while True:
            if nest_limit < 0:
                raise PackValueError("recursion limit exceeded")
            if obj is None:
                return self._buffer.write(b"\xc0")
            if isinstance(obj, bool):
                if obj:
                    return self._buffer.write(b"\xc3")
                return self._buffer.write(b"\xc2")
            if isinstance(obj, int_types):
                if 0 <= obj < 0x80:
                    return self._buffer.write(struct.pack("B", obj))
                if -0x20 <= obj < 0:
                    return self._buffer.write(struct.pack("b", obj))
                if 0x80 <= obj <= 0xff:
                    return self._buffer.write(struct.pack("BB", 0xcc, obj))
                if -0x80 <= obj < 0:
                    return self._buffer.write(struct.pack(">Bb", 0xd0, obj))
                if 0xff < obj <= 0xffff:
                    return self._buffer.write(struct.pack(">BH", 0xcd, obj))
                if -0x8000 <= obj < -0x80:
                    return self._buffer.write(struct.pack(">Bh", 0xd1, obj))
                if 0xffff < obj <= 0xffffffff:
                    return self._buffer.write(struct.pack(">BI", 0xce, obj))
                if -0x80000000 <= obj < -0x8000:
                    return self._buffer.write(struct.pack(">Bi", 0xd2, obj))
                if 0xffffffff < obj <= 0xffffffffffffffff:
                    return self._buffer.write(struct.pack(">BQ", 0xcf, obj))
                if -0x8000000000000000 <= obj < -0x80000000:
                    return self._buffer.write(struct.pack(">Bq", 0xd3, obj))
                raise PackValueError("Integer value out of range")
            if self._use_bin_type and isinstance(obj, bytes):
                n = len(obj)
                if n <= 0xff:
                    self._buffer.write(struct.pack('>BB', 0xc4, n))
                elif n <= 0xffff:
                    self._buffer.write(struct.pack(">BH", 0xc5, n))
                elif n <= 0xffffffff:
                    self._buffer.write(struct.pack(">BI", 0xc6, n))
                else:
                    raise PackValueError("Bytes is too large")
                return self._buffer.write(obj)
            if isinstance(obj, (Unicode, bytes)):
                if isinstance(obj, Unicode):
                    if self._encoding is None:
                        raise TypeError(
                            "Can't encode unicode string: "
                            "no encoding is specified")
                    obj = obj.encode(self._encoding, self._unicode_errors)
                n = len(obj)
                if n <= 0x1f:
                    self._buffer.write(struct.pack('B', 0xa0 + n))
                elif self._use_bin_type and n <= 0xff:
                    self._buffer.write(struct.pack('>BB', 0xd9, n))
                elif n <= 0xffff:
                    self._buffer.write(struct.pack(">BH", 0xda, n))
                elif n <= 0xffffffff:
                    self._buffer.write(struct.pack(">BI", 0xdb, n))
                else:
                    raise PackValueError("String is too large")
                return self._buffer.write(obj)
            if isinstance(obj, float):
                if self._use_float:
                    return self._buffer.write(struct.pack(">Bf", 0xca, obj))
                return self._buffer.write(struct.pack(">Bd", 0xcb, obj))
            if isinstance(obj, ExtType):
                code = obj.code
                data = obj.data
                assert isinstance(code, int)
                assert isinstance(data, bytes)
                L = len(data)
                if L == 1:
                    self._buffer.write(b'\xd4')
                elif L == 2:
                    self._buffer.write(b'\xd5')
                elif L == 4:
                    self._buffer.write(b'\xd6')
                elif L == 8:
                    self._buffer.write(b'\xd7')
                elif L == 16:
                    self._buffer.write(b'\xd8')
                elif L <= 0xff:
                    self._buffer.write(struct.pack(">BB", 0xc7, L))
                elif L <= 0xffff:
                    self._buffer.write(struct.pack(">BH", 0xc8, L))
                else:
                    self._buffer.write(struct.pack(">BI", 0xc9, L))
                self._buffer.write(struct.pack("b", code))
                self._buffer.write(data)
                return
            if isinstance(obj, (list, tuple)):
                n = len(obj)
                self._fb_pack_array_header(n)
                for i in xrange(n):
                    self._pack(obj[i], nest_limit - 1)
                return
            if isinstance(obj, dict):
                return self._fb_pack_map_pairs(len(obj), dict_iteritems(obj),
                                               nest_limit - 1)
            if not default_used and self._default is not None:
                obj = self._default(obj)
                default_used = 1
                continue
            raise TypeError("Cannot serialize %r" % obj)

    def pack(self, obj):
        self._pack(obj)
        ret = self._buffer.getvalue()
        if self._autoreset:
            self._buffer = StringIO()
        elif USING_STRINGBUILDER:
            self._buffer = StringIO(ret)
        return ret

    def pack_map_pairs(self, pairs):
        self._fb_pack_map_pairs(len(pairs), pairs)
        ret = self._buffer.getvalue()
        if self._autoreset:
            self._buffer = StringIO()
        elif USING_STRINGBUILDER:
            self._buffer = StringIO(ret)
        return ret

    def pack_array_header(self, n):
        if n >= 2**32:
            raise ValueError
        self._fb_pack_array_header(n)
        ret = self._buffer.getvalue()
        if self._autoreset:
            self._buffer = StringIO()
        elif USING_STRINGBUILDER:
            self._buffer = StringIO(ret)
        return ret

    def pack_map_header(self, n):
        if n >= 2**32:
            raise ValueError
        self._fb_pack_map_header(n)
        ret = self._buffer.getvalue()
        if self._autoreset:
            self._buffer = StringIO()
        elif USING_STRINGBUILDER:
            self._buffer = StringIO(ret)
        return ret

    def pack_ext_type(self, typecode, data):
        if not isinstance(typecode, int):
            raise TypeError("typecode must have int type.")
        if not 0 <= typecode <= 127:
            raise ValueError("typecode should be 0-127")
        if not isinstance(data, bytes):
            raise TypeError("data must have bytes type")
        L = len(data)
        if L > 0xffffffff:
            raise ValueError("Too large data")
        if L == 1:
            self._buffer.write(b'\xd4')
        elif L == 2:
            self._buffer.write(b'\xd5')
        elif L == 4:
            self._buffer.write(b'\xd6')
        elif L == 8:
            self._buffer.write(b'\xd7')
        elif L == 16:
            self._buffer.write(b'\xd8')
        elif L <= 0xff:
            self._buffer.write(b'\xc7' + struct.pack('B', L))
        elif L <= 0xffff:
            self._buffer.write(b'\xc8' + struct.pack('>H', L))
        else:
            self._buffer.write(b'\xc9' + struct.pack('>I', L))
        self._buffer.write(struct.pack('B', typecode))
        self._buffer.write(data)

    def _fb_pack_array_header(self, n):
        if n <= 0x0f:
            return self._buffer.write(struct.pack('B', 0x90 + n))
        if n <= 0xffff:
            return self._buffer.write(struct.pack(">BH", 0xdc, n))
        if n <= 0xffffffff:
            return self._buffer.write(struct.pack(">BI", 0xdd, n))
        raise PackValueError("Array is too large")

    def _fb_pack_map_header(self, n):
        if n <= 0x0f:
            return self._buffer.write(struct.pack('B', 0x80 + n))
        if n <= 0xffff:
            return self._buffer.write(struct.pack(">BH", 0xde, n))
        if n <= 0xffffffff:
            return self._buffer.write(struct.pack(">BI", 0xdf, n))
        raise PackValueError("Dict is too large")

    def _fb_pack_map_pairs(self, n, pairs, nest_limit=DEFAULT_RECURSE_LIMIT):
        self._fb_pack_map_header(n)
        for (k, v) in pairs:
            self._pack(k, nest_limit - 1)
            self._pack(v, nest_limit - 1)

    def bytes(self):
        return self._buffer.getvalue()

    def reset(self):
        self._buffer = StringIO()
