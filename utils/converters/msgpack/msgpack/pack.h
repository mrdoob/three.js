/*
 * MessagePack for Python packing routine
 *
 * Copyright (C) 2009 Naoki INADA
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

#include <stddef.h>
#include <stdlib.h>
#include "sysdep.h"
#include <limits.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifdef _MSC_VER
#define inline __inline
#endif

typedef struct msgpack_packer {
    char *buf;
    size_t length;
    size_t buf_size;
    bool use_bin_type;
} msgpack_packer;

typedef struct Packer Packer;

static inline int msgpack_pack_int(msgpack_packer* pk, int d);
static inline int msgpack_pack_long(msgpack_packer* pk, long d);
static inline int msgpack_pack_long_long(msgpack_packer* pk, long long d);
static inline int msgpack_pack_unsigned_short(msgpack_packer* pk, unsigned short d);
static inline int msgpack_pack_unsigned_int(msgpack_packer* pk, unsigned int d);
static inline int msgpack_pack_unsigned_long(msgpack_packer* pk, unsigned long d);
//static inline int msgpack_pack_unsigned_long_long(msgpack_packer* pk, unsigned long long d);

static inline int msgpack_pack_uint8(msgpack_packer* pk, uint8_t d);
static inline int msgpack_pack_uint16(msgpack_packer* pk, uint16_t d);
static inline int msgpack_pack_uint32(msgpack_packer* pk, uint32_t d);
static inline int msgpack_pack_uint64(msgpack_packer* pk, uint64_t d);
static inline int msgpack_pack_int8(msgpack_packer* pk, int8_t d);
static inline int msgpack_pack_int16(msgpack_packer* pk, int16_t d);
static inline int msgpack_pack_int32(msgpack_packer* pk, int32_t d);
static inline int msgpack_pack_int64(msgpack_packer* pk, int64_t d);

static inline int msgpack_pack_float(msgpack_packer* pk, float d);
static inline int msgpack_pack_double(msgpack_packer* pk, double d);

static inline int msgpack_pack_nil(msgpack_packer* pk);
static inline int msgpack_pack_true(msgpack_packer* pk);
static inline int msgpack_pack_false(msgpack_packer* pk);

static inline int msgpack_pack_array(msgpack_packer* pk, unsigned int n);

static inline int msgpack_pack_map(msgpack_packer* pk, unsigned int n);

static inline int msgpack_pack_raw(msgpack_packer* pk, size_t l);
static inline int msgpack_pack_bin(msgpack_packer* pk, size_t l);
static inline int msgpack_pack_raw_body(msgpack_packer* pk, const void* b, size_t l);

static inline int msgpack_pack_ext(msgpack_packer* pk, int8_t typecode, size_t l);

static inline int msgpack_pack_write(msgpack_packer* pk, const char *data, size_t l)
{
    char* buf = pk->buf;
    size_t bs = pk->buf_size;
    size_t len = pk->length;

    if (len + l > bs) {
        bs = (len + l) * 2;
        buf = (char*)realloc(buf, bs);
        if (!buf) return -1;
    }
    memcpy(buf + len, data, l);
    len += l;

    pk->buf = buf;
    pk->buf_size = bs;
    pk->length = len;
    return 0;
}

#define msgpack_pack_append_buffer(user, buf, len) \
        return msgpack_pack_write(user, (const char*)buf, len)

#include "pack_template.h"

#ifdef __cplusplus
}
#endif
