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

#ifndef USE_CASE_RANGE
#if !defined(_MSC_VER)
#define USE_CASE_RANGE
#endif
#endif

typedef struct unpack_stack {
    PyObject* obj;
    size_t size;
    size_t count;
    unsigned int ct;
    PyObject* map_key;
} unpack_stack;

struct unpack_context {
    unpack_user user;
    unsigned int cs;
    unsigned int trail;
    unsigned int top;
    /*
    unpack_stack* stack;
    unsigned int stack_size;
    unpack_stack embed_stack[MSGPACK_EMBED_STACK_SIZE];
    */
    unpack_stack stack[MSGPACK_EMBED_STACK_SIZE];
};


static inline void unpack_init(unpack_context* ctx)
{
    ctx->cs = CS_HEADER;
    ctx->trail = 0;
    ctx->top = 0;
    /*
    ctx->stack = ctx->embed_stack;
    ctx->stack_size = MSGPACK_EMBED_STACK_SIZE;
    */
    ctx->stack[0].obj = unpack_callback_root(&ctx->user);
}

/*
static inline void unpack_destroy(unpack_context* ctx)
{
    if(ctx->stack_size != MSGPACK_EMBED_STACK_SIZE) {
        free(ctx->stack);
    }
}
*/

static inline PyObject* unpack_data(unpack_context* ctx)
{
    return (ctx)->stack[0].obj;
}


template <bool construct>
static inline int unpack_execute(unpack_context* ctx, const char* data, size_t len, size_t* off)
{
    assert(len >= *off);

    const unsigned char* p = (unsigned char*)data + *off;
    const unsigned char* const pe = (unsigned char*)data + len;
    const void* n = NULL;

    unsigned int trail = ctx->trail;
    unsigned int cs = ctx->cs;
    unsigned int top = ctx->top;
    unpack_stack* stack = ctx->stack;
    /*
    unsigned int stack_size = ctx->stack_size;
    */
    unpack_user* user = &ctx->user;

    PyObject* obj;
    unpack_stack* c = NULL;

    int ret;

#define construct_cb(name) \
    construct && unpack_callback ## name

#define push_simple_value(func) \
    if(construct_cb(func)(user, &obj) < 0) { goto _failed; } \
    goto _push
#define push_fixed_value(func, arg) \
    if(construct_cb(func)(user, arg, &obj) < 0) { goto _failed; } \
    goto _push
#define push_variable_value(func, base, pos, len) \
    if(construct_cb(func)(user, \
        (const char*)base, (const char*)pos, len, &obj) < 0) { goto _failed; } \
    goto _push

#define again_fixed_trail(_cs, trail_len) \
    trail = trail_len; \
    cs = _cs; \
    goto _fixed_trail_again
#define again_fixed_trail_if_zero(_cs, trail_len, ifzero) \
    trail = trail_len; \
    if(trail == 0) { goto ifzero; } \
    cs = _cs; \
    goto _fixed_trail_again

#define start_container(func, count_, ct_) \
    if(top >= MSGPACK_EMBED_STACK_SIZE) { goto _failed; } /* FIXME */ \
    if(construct_cb(func)(user, count_, &stack[top].obj) < 0) { goto _failed; } \
    if((count_) == 0) { obj = stack[top].obj; \
        if (construct_cb(func##_end)(user, &obj) < 0) { goto _failed; } \
        goto _push; } \
    stack[top].ct = ct_; \
    stack[top].size  = count_; \
    stack[top].count = 0; \
    ++top; \
    /*printf("container %d count %d stack %d\n",stack[top].obj,count_,top);*/ \
    /*printf("stack push %d\n", top);*/ \
    /* FIXME \
    if(top >= stack_size) { \
        if(stack_size == MSGPACK_EMBED_STACK_SIZE) { \
            size_t csize = sizeof(unpack_stack) * MSGPACK_EMBED_STACK_SIZE; \
            size_t nsize = csize * 2; \
            unpack_stack* tmp = (unpack_stack*)malloc(nsize); \
            if(tmp == NULL) { goto _failed; } \
            memcpy(tmp, ctx->stack, csize); \
            ctx->stack = stack = tmp; \
            ctx->stack_size = stack_size = MSGPACK_EMBED_STACK_SIZE * 2; \
        } else { \
            size_t nsize = sizeof(unpack_stack) * ctx->stack_size * 2; \
            unpack_stack* tmp = (unpack_stack*)realloc(ctx->stack, nsize); \
            if(tmp == NULL) { goto _failed; } \
            ctx->stack = stack = tmp; \
            ctx->stack_size = stack_size = stack_size * 2; \
        } \
    } \
    */ \
    goto _header_again

#define NEXT_CS(p)  ((unsigned int)*p & 0x1f)

#ifdef USE_CASE_RANGE
#define SWITCH_RANGE_BEGIN     switch(*p) {
#define SWITCH_RANGE(FROM, TO) case FROM ... TO:
#define SWITCH_RANGE_DEFAULT   default:
#define SWITCH_RANGE_END       }
#else
#define SWITCH_RANGE_BEGIN     { if(0) {
#define SWITCH_RANGE(FROM, TO) } else if(FROM <= *p && *p <= TO) {
#define SWITCH_RANGE_DEFAULT   } else {
#define SWITCH_RANGE_END       } }
#endif

    if(p == pe) { goto _out; }
    do {
        switch(cs) {
        case CS_HEADER:
            SWITCH_RANGE_BEGIN
            SWITCH_RANGE(0x00, 0x7f)  // Positive Fixnum
                push_fixed_value(_uint8, *(uint8_t*)p);
            SWITCH_RANGE(0xe0, 0xff)  // Negative Fixnum
                push_fixed_value(_int8, *(int8_t*)p);
            SWITCH_RANGE(0xc0, 0xdf)  // Variable
                switch(*p) {
                case 0xc0:  // nil
                    push_simple_value(_nil);
                //case 0xc1:  // never used
                case 0xc2:  // false
                    push_simple_value(_false);
                case 0xc3:  // true
                    push_simple_value(_true);
                case 0xc4:  // bin 8
                    again_fixed_trail(NEXT_CS(p), 1);
                case 0xc5:  // bin 16
                    again_fixed_trail(NEXT_CS(p), 2);
                case 0xc6:  // bin 32
                    again_fixed_trail(NEXT_CS(p), 4);
                case 0xc7:  // ext 8
                    again_fixed_trail(NEXT_CS(p), 1);
                case 0xc8:  // ext 16
                    again_fixed_trail(NEXT_CS(p), 2);
                case 0xc9:  // ext 32
                    again_fixed_trail(NEXT_CS(p), 4);
                case 0xca:  // float
                case 0xcb:  // double
                case 0xcc:  // unsigned int  8
                case 0xcd:  // unsigned int 16
                case 0xce:  // unsigned int 32
                case 0xcf:  // unsigned int 64
                case 0xd0:  // signed int  8
                case 0xd1:  // signed int 16
                case 0xd2:  // signed int 32
                case 0xd3:  // signed int 64
                    again_fixed_trail(NEXT_CS(p), 1 << (((unsigned int)*p) & 0x03));
                case 0xd4:  // fixext 1
                case 0xd5:  // fixext 2
                case 0xd6:  // fixext 4
                case 0xd7:  // fixext 8
                    again_fixed_trail_if_zero(ACS_EXT_VALUE, 
                                              (1 << (((unsigned int)*p) & 0x03))+1,
                                              _ext_zero);
                case 0xd8:  // fixext 16
                    again_fixed_trail_if_zero(ACS_EXT_VALUE, 16+1, _ext_zero);
                case 0xd9:  // str 8
                    again_fixed_trail(NEXT_CS(p), 1);
                case 0xda:  // raw 16
                case 0xdb:  // raw 32
                case 0xdc:  // array 16
                case 0xdd:  // array 32
                case 0xde:  // map 16
                case 0xdf:  // map 32
                    again_fixed_trail(NEXT_CS(p), 2 << (((unsigned int)*p) & 0x01));
                default:
                    goto _failed;
                }
            SWITCH_RANGE(0xa0, 0xbf)  // FixRaw
                again_fixed_trail_if_zero(ACS_RAW_VALUE, ((unsigned int)*p & 0x1f), _raw_zero);
            SWITCH_RANGE(0x90, 0x9f)  // FixArray
                start_container(_array, ((unsigned int)*p) & 0x0f, CT_ARRAY_ITEM);
            SWITCH_RANGE(0x80, 0x8f)  // FixMap
                start_container(_map, ((unsigned int)*p) & 0x0f, CT_MAP_KEY);

            SWITCH_RANGE_DEFAULT
                goto _failed;
            SWITCH_RANGE_END
            // end CS_HEADER


        _fixed_trail_again:
            ++p;

        default:
            if((size_t)(pe - p) < trail) { goto _out; }
            n = p;  p += trail - 1;
            switch(cs) {
            case CS_EXT_8:
                again_fixed_trail_if_zero(ACS_EXT_VALUE, *(uint8_t*)n+1, _ext_zero);
            case CS_EXT_16:
                again_fixed_trail_if_zero(ACS_EXT_VALUE,
                                          _msgpack_load16(uint16_t,n)+1,
                                          _ext_zero);
            case CS_EXT_32:
                again_fixed_trail_if_zero(ACS_EXT_VALUE,
                                          _msgpack_load32(uint32_t,n)+1,
                                          _ext_zero);
            case CS_FLOAT: {
                    union { uint32_t i; float f; } mem;
                    mem.i = _msgpack_load32(uint32_t,n);
                    push_fixed_value(_float, mem.f); }
            case CS_DOUBLE: {
                    union { uint64_t i; double f; } mem;
                    mem.i = _msgpack_load64(uint64_t,n);
#if defined(__arm__) && !(__ARM_EABI__) // arm-oabi
                    // https://github.com/msgpack/msgpack-perl/pull/1
                    mem.i = (mem.i & 0xFFFFFFFFUL) << 32UL | (mem.i >> 32UL);
#endif
                    push_fixed_value(_double, mem.f); }
            case CS_UINT_8:
                push_fixed_value(_uint8, *(uint8_t*)n);
            case CS_UINT_16:
                push_fixed_value(_uint16, _msgpack_load16(uint16_t,n));
            case CS_UINT_32:
                push_fixed_value(_uint32, _msgpack_load32(uint32_t,n));
            case CS_UINT_64:
                push_fixed_value(_uint64, _msgpack_load64(uint64_t,n));

            case CS_INT_8:
                push_fixed_value(_int8, *(int8_t*)n);
            case CS_INT_16:
                push_fixed_value(_int16, _msgpack_load16(int16_t,n));
            case CS_INT_32:
                push_fixed_value(_int32, _msgpack_load32(int32_t,n));
            case CS_INT_64:
                push_fixed_value(_int64, _msgpack_load64(int64_t,n));

            case CS_BIN_8:
                again_fixed_trail_if_zero(ACS_BIN_VALUE, *(uint8_t*)n, _bin_zero);
            case CS_BIN_16:
                again_fixed_trail_if_zero(ACS_BIN_VALUE, _msgpack_load16(uint16_t,n), _bin_zero);
            case CS_BIN_32:
                again_fixed_trail_if_zero(ACS_BIN_VALUE, _msgpack_load32(uint32_t,n), _bin_zero);
            case ACS_BIN_VALUE:
            _bin_zero:
                push_variable_value(_bin, data, n, trail);

            case CS_RAW_8:
                again_fixed_trail_if_zero(ACS_RAW_VALUE, *(uint8_t*)n, _raw_zero);
            case CS_RAW_16:
                again_fixed_trail_if_zero(ACS_RAW_VALUE, _msgpack_load16(uint16_t,n), _raw_zero);
            case CS_RAW_32:
                again_fixed_trail_if_zero(ACS_RAW_VALUE, _msgpack_load32(uint32_t,n), _raw_zero);
            case ACS_RAW_VALUE:
            _raw_zero:
                push_variable_value(_raw, data, n, trail);

            case ACS_EXT_VALUE:
            _ext_zero:
                push_variable_value(_ext, data, n, trail);

            case CS_ARRAY_16:
                start_container(_array, _msgpack_load16(uint16_t,n), CT_ARRAY_ITEM);
            case CS_ARRAY_32:
                /* FIXME security guard */
                start_container(_array, _msgpack_load32(uint32_t,n), CT_ARRAY_ITEM);

            case CS_MAP_16:
                start_container(_map, _msgpack_load16(uint16_t,n), CT_MAP_KEY);
            case CS_MAP_32:
                /* FIXME security guard */
                start_container(_map, _msgpack_load32(uint32_t,n), CT_MAP_KEY);

            default:
                goto _failed;
            }
        }

_push:
    if(top == 0) { goto _finish; }
    c = &stack[top-1];
    switch(c->ct) {
    case CT_ARRAY_ITEM:
        if(construct_cb(_array_item)(user, c->count, &c->obj, obj) < 0) { goto _failed; }
        if(++c->count == c->size) {
            obj = c->obj;
            if (construct_cb(_array_end)(user, &obj) < 0) { goto _failed; }
            --top;
            /*printf("stack pop %d\n", top);*/
            goto _push;
        }
        goto _header_again;
    case CT_MAP_KEY:
        c->map_key = obj;
        c->ct = CT_MAP_VALUE;
        goto _header_again;
    case CT_MAP_VALUE:
        if(construct_cb(_map_item)(user, c->count, &c->obj, c->map_key, obj) < 0) { goto _failed; }
        if(++c->count == c->size) {
            obj = c->obj;
            if (construct_cb(_map_end)(user, &obj) < 0) { goto _failed; }
            --top;
            /*printf("stack pop %d\n", top);*/
            goto _push;
        }
        c->ct = CT_MAP_KEY;
        goto _header_again;

    default:
        goto _failed;
    }

_header_again:
        cs = CS_HEADER;
        ++p;
    } while(p != pe);
    goto _out;


_finish:
    if (!construct)
        unpack_callback_nil(user, &obj);
    stack[0].obj = obj;
    ++p;
    ret = 1;
    /*printf("-- finish --\n"); */
    goto _end;

_failed:
    /*printf("** FAILED **\n"); */
    ret = -1;
    goto _end;

_out:
    ret = 0;
    goto _end;

_end:
    ctx->cs = cs;
    ctx->trail = trail;
    ctx->top = top;
    *off = p - (const unsigned char*)data;

    return ret;
#undef construct_cb
}

#undef SWITCH_RANGE_BEGIN
#undef SWITCH_RANGE
#undef SWITCH_RANGE_DEFAULT
#undef SWITCH_RANGE_END
#undef push_simple_value
#undef push_fixed_value
#undef push_variable_value
#undef again_fixed_trail
#undef again_fixed_trail_if_zero
#undef start_container

template <unsigned int fixed_offset, unsigned int var_offset>
static inline int unpack_container_header(unpack_context* ctx, const char* data, size_t len, size_t* off)
{
    assert(len >= *off);
    uint32_t size;
    const unsigned char *const p = (unsigned char*)data + *off;

#define inc_offset(inc) \
    if (len - *off < inc) \
        return 0; \
    *off += inc;

    switch (*p) {
    case var_offset:
        inc_offset(3);
        size = _msgpack_load16(uint16_t, p + 1);
        break;
    case var_offset + 1:
        inc_offset(5);
        size = _msgpack_load32(uint32_t, p + 1);
        break;
#ifdef USE_CASE_RANGE
    case fixed_offset + 0x0 ... fixed_offset + 0xf:
#else
    case fixed_offset + 0x0:
    case fixed_offset + 0x1:
    case fixed_offset + 0x2:
    case fixed_offset + 0x3:
    case fixed_offset + 0x4:
    case fixed_offset + 0x5:
    case fixed_offset + 0x6:
    case fixed_offset + 0x7:
    case fixed_offset + 0x8:
    case fixed_offset + 0x9:
    case fixed_offset + 0xa:
    case fixed_offset + 0xb:
    case fixed_offset + 0xc:
    case fixed_offset + 0xd:
    case fixed_offset + 0xe:
    case fixed_offset + 0xf:
#endif
        ++*off;
        size = ((unsigned int)*p) & 0x0f;
        break;
    default:
        PyErr_SetString(PyExc_ValueError, "Unexpected type header on stream");
        return -1;
    }
    unpack_callback_uint32(&ctx->user, size, &ctx->stack[0].obj);
    return 1;
}

#undef SWITCH_RANGE_BEGIN
#undef SWITCH_RANGE
#undef SWITCH_RANGE_DEFAULT
#undef SWITCH_RANGE_END

static const execute_fn unpack_construct = &unpack_execute<true>;
static const execute_fn unpack_skip = &unpack_execute<false>;
static const execute_fn read_array_header = &unpack_container_header<0x90, 0xdc>;
static const execute_fn read_map_header = &unpack_container_header<0x80, 0xde>;

#undef NEXT_CS

/* vim: set ts=4 sw=4 sts=4 expandtab  */
