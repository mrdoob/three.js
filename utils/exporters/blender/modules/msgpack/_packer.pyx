# coding: utf-8
#cython: embedsignature=True

from cpython cimport *
from libc.stdlib cimport *
from libc.string cimport *
from libc.limits cimport *
from libc.stdint cimport int8_t

from msgpack.exceptions import PackValueError
from msgpack import ExtType


cdef extern from "pack.h":
    struct msgpack_packer:
        char* buf
        size_t length
        size_t buf_size
        bint use_bin_type

    int msgpack_pack_int(msgpack_packer* pk, int d)
    int msgpack_pack_nil(msgpack_packer* pk)
    int msgpack_pack_true(msgpack_packer* pk)
    int msgpack_pack_false(msgpack_packer* pk)
    int msgpack_pack_long(msgpack_packer* pk, long d)
    int msgpack_pack_long_long(msgpack_packer* pk, long long d)
    int msgpack_pack_unsigned_long_long(msgpack_packer* pk, unsigned long long d)
    int msgpack_pack_float(msgpack_packer* pk, float d)
    int msgpack_pack_double(msgpack_packer* pk, double d)
    int msgpack_pack_array(msgpack_packer* pk, size_t l)
    int msgpack_pack_map(msgpack_packer* pk, size_t l)
    int msgpack_pack_raw(msgpack_packer* pk, size_t l)
    int msgpack_pack_bin(msgpack_packer* pk, size_t l)
    int msgpack_pack_raw_body(msgpack_packer* pk, char* body, size_t l)
    int msgpack_pack_ext(msgpack_packer* pk, int8_t typecode, size_t l)

cdef int DEFAULT_RECURSE_LIMIT=511


cdef class Packer(object):
    """
    MessagePack Packer

    usage::

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
    cdef msgpack_packer pk
    cdef object _default
    cdef object _bencoding
    cdef object _berrors
    cdef char *encoding
    cdef char *unicode_errors
    cdef bool use_float
    cdef bint autoreset

    def __cinit__(self):
        cdef int buf_size = 1024*1024
        self.pk.buf = <char*> malloc(buf_size);
        if self.pk.buf == NULL:
            raise MemoryError("Unable to allocate internal buffer.")
        self.pk.buf_size = buf_size
        self.pk.length = 0

    def __init__(self, default=None, encoding='utf-8', unicode_errors='strict',
                 use_single_float=False, bint autoreset=1, bint use_bin_type=0):
        """
        """
        self.use_float = use_single_float
        self.autoreset = autoreset
        self.pk.use_bin_type = use_bin_type
        if default is not None:
            if not PyCallable_Check(default):
                raise TypeError("default must be a callable.")
        self._default = default
        if encoding is None:
            self.encoding = NULL
            self.unicode_errors = NULL
        else:
            if isinstance(encoding, unicode):
                self._bencoding = encoding.encode('ascii')
            else:
                self._bencoding = encoding
            self.encoding = PyBytes_AsString(self._bencoding)
            if isinstance(unicode_errors, unicode):
                self._berrors = unicode_errors.encode('ascii')
            else:
                self._berrors = unicode_errors
            self.unicode_errors = PyBytes_AsString(self._berrors)

    def __dealloc__(self):
        free(self.pk.buf);

    cdef int _pack(self, object o, int nest_limit=DEFAULT_RECURSE_LIMIT) except -1:
        cdef long long llval
        cdef unsigned long long ullval
        cdef long longval
        cdef float fval
        cdef double dval
        cdef char* rawval
        cdef int ret
        cdef dict d
        cdef size_t L
        cdef int default_used = 0

        if nest_limit < 0:
            raise PackValueError("recursion limit exceeded.")

        while True:
            if o is None:
                ret = msgpack_pack_nil(&self.pk)
            elif isinstance(o, bool):
                if o:
                    ret = msgpack_pack_true(&self.pk)
                else:
                    ret = msgpack_pack_false(&self.pk)
            elif PyLong_Check(o):
                # PyInt_Check(long) is True for Python 3.
                # Sow we should test long before int.
                if o > 0:
                    ullval = o
                    ret = msgpack_pack_unsigned_long_long(&self.pk, ullval)
                else:
                    llval = o
                    ret = msgpack_pack_long_long(&self.pk, llval)
            elif PyInt_Check(o):
                longval = o
                ret = msgpack_pack_long(&self.pk, longval)
            elif PyFloat_Check(o):
                if self.use_float:
                   fval = o
                   ret = msgpack_pack_float(&self.pk, fval)
                else:
                   dval = o
                   ret = msgpack_pack_double(&self.pk, dval)
            elif PyBytes_Check(o):
                L = len(o)
                if L > (2**32)-1:
                    raise ValueError("bytes is too large")
                rawval = o
                ret = msgpack_pack_bin(&self.pk, L)
                if ret == 0:
                    ret = msgpack_pack_raw_body(&self.pk, rawval, L)
            elif PyUnicode_Check(o):
                if not self.encoding:
                    raise TypeError("Can't encode unicode string: no encoding is specified")
                o = PyUnicode_AsEncodedString(o, self.encoding, self.unicode_errors)
                L = len(o)
                if L > (2**32)-1:
                    raise ValueError("dict is too large")
                rawval = o
                ret = msgpack_pack_raw(&self.pk, len(o))
                if ret == 0:
                    ret = msgpack_pack_raw_body(&self.pk, rawval, len(o))
            elif PyDict_CheckExact(o):
                d = <dict>o
                L = len(d)
                if L > (2**32)-1:
                    raise ValueError("dict is too large")
                ret = msgpack_pack_map(&self.pk, L)
                if ret == 0:
                    for k, v in d.iteritems():
                        ret = self._pack(k, nest_limit-1)
                        if ret != 0: break
                        ret = self._pack(v, nest_limit-1)
                        if ret != 0: break
            elif PyDict_Check(o):
                L = len(o)
                if L > (2**32)-1:
                    raise ValueError("dict is too large")
                ret = msgpack_pack_map(&self.pk, L)
                if ret == 0:
                    for k, v in o.items():
                        ret = self._pack(k, nest_limit-1)
                        if ret != 0: break
                        ret = self._pack(v, nest_limit-1)
                        if ret != 0: break
            elif isinstance(o, ExtType):
                # This should be before Tuple because ExtType is namedtuple.
                longval = o.code
                rawval = o.data
                L = len(o.data)
                if L > (2**32)-1:
                    raise ValueError("EXT data is too large")
                ret = msgpack_pack_ext(&self.pk, longval, L)
                ret = msgpack_pack_raw_body(&self.pk, rawval, L)
            elif PyTuple_Check(o) or PyList_Check(o):
                L = len(o)
                if L > (2**32)-1:
                    raise ValueError("list is too large")
                ret = msgpack_pack_array(&self.pk, L)
                if ret == 0:
                    for v in o:
                        ret = self._pack(v, nest_limit-1)
                        if ret != 0: break
            elif not default_used and self._default:
                o = self._default(o)
                default_used = 1
                continue
            else:
                raise TypeError("can't serialize %r" % (o,))
            return ret

    cpdef pack(self, object obj):
        cdef int ret
        ret = self._pack(obj, DEFAULT_RECURSE_LIMIT)
        if ret == -1:
            raise MemoryError
        elif ret:  # should not happen.
            raise TypeError
        if self.autoreset:
            buf = PyBytes_FromStringAndSize(self.pk.buf, self.pk.length)
            self.pk.length = 0
            return buf

    def pack_ext_type(self, typecode, data):
        msgpack_pack_ext(&self.pk, typecode, len(data))
        msgpack_pack_raw_body(&self.pk, data, len(data))

    def pack_array_header(self, size_t size):
        if size > (2**32-1):
            raise ValueError
        cdef int ret = msgpack_pack_array(&self.pk, size)
        if ret == -1:
            raise MemoryError
        elif ret:  # should not happen
            raise TypeError
        if self.autoreset:
            buf = PyBytes_FromStringAndSize(self.pk.buf, self.pk.length)
            self.pk.length = 0
            return buf

    def pack_map_header(self, size_t size):
        if size > (2**32-1):
            raise ValueError
        cdef int ret = msgpack_pack_map(&self.pk, size)
        if ret == -1:
            raise MemoryError
        elif ret:  # should not happen
            raise TypeError
        if self.autoreset:
            buf = PyBytes_FromStringAndSize(self.pk.buf, self.pk.length)
            self.pk.length = 0
            return buf

    def pack_map_pairs(self, object pairs):
        """
        Pack *pairs* as msgpack map type.

        *pairs* should sequence of pair.
        (`len(pairs)` and `for k, v in pairs:` should be supported.)
        """
        cdef int ret = msgpack_pack_map(&self.pk, len(pairs))
        if ret == 0:
            for k, v in pairs:
                ret = self._pack(k)
                if ret != 0: break
                ret = self._pack(v)
                if ret != 0: break
        if ret == -1:
            raise MemoryError
        elif ret:  # should not happen
            raise TypeError
        if self.autoreset:
            buf = PyBytes_FromStringAndSize(self.pk.buf, self.pk.length)
            self.pk.length = 0
            return buf

    def reset(self):
        """Clear internal buffer."""
        self.pk.length = 0

    def bytes(self):
        """Return buffer content."""
        return PyBytes_FromStringAndSize(self.pk.buf, self.pk.length)
