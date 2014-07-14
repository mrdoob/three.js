/*
 * MessagePack unpacking routine template
 *
 * Copyright (C) 2008-2010 FURUHASHI Sadayuki
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
#ifndef MSGPACK_UNPACK_DEFINE_H__
#define MSGPACK_UNPACK_DEFINE_H__

#include "msgpack/sysdep.h"
#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif


#ifndef MSGPACK_EMBED_STACK_SIZE
#define MSGPACK_EMBED_STACK_SIZE 32
#endif


// CS is first byte & 0x1f
typedef enum {
    CS_HEADER            = 0x00,  // nil

    //CS_                = 0x01,
    //CS_                = 0x02,  // false
    //CS_                = 0x03,  // true

    CS_BIN_8             = 0x04,
    CS_BIN_16            = 0x05,
    CS_BIN_32            = 0x06,

    CS_EXT_8             = 0x07,
    CS_EXT_16            = 0x08,
    CS_EXT_32            = 0x09,

    CS_FLOAT             = 0x0a,
    CS_DOUBLE            = 0x0b,
    CS_UINT_8            = 0x0c,
    CS_UINT_16           = 0x0d,
    CS_UINT_32           = 0x0e,
    CS_UINT_64           = 0x0f,
    CS_INT_8             = 0x10,
    CS_INT_16            = 0x11,
    CS_INT_32            = 0x12,
    CS_INT_64            = 0x13,

    //CS_FIXEXT1           = 0x14,
    //CS_FIXEXT2           = 0x15,
    //CS_FIXEXT4           = 0x16,
    //CS_FIXEXT8           = 0x17,
    //CS_FIXEXT16          = 0x18,

    CS_RAW_8             = 0x19,
    CS_RAW_16            = 0x1a,
    CS_RAW_32            = 0x1b,
    CS_ARRAY_16          = 0x1c,
    CS_ARRAY_32          = 0x1d,
    CS_MAP_16            = 0x1e,
    CS_MAP_32            = 0x1f,

    ACS_RAW_VALUE,
    ACS_BIN_VALUE,
    ACS_EXT_VALUE,
} msgpack_unpack_state;


typedef enum {
    CT_ARRAY_ITEM,
    CT_MAP_KEY,
    CT_MAP_VALUE,
} msgpack_container_type;


#ifdef __cplusplus
}
#endif

#endif /* msgpack/unpack_define.h */
