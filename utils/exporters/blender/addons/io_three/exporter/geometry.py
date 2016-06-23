"""
Module for creating Three.js geometry JSON nodes.
"""

import os
from .. import constants, logger
from . import base_classes, io, api


FORMAT_VERSION = 3


class Geometry(base_classes.BaseNode):
    """Class that wraps a single mesh/geometry node."""
    def __init__(self, node, parent=None):
        logger.debug("Geometry().__init__(%s)", node)

#       @TODO: maybe better to have `three` constants for
#              strings that are specific to `three` properties
        geo_type = constants.GEOMETRY.title()
        if parent.options.get(constants.GEOMETRY_TYPE):
            opt_type = parent.options[constants.GEOMETRY_TYPE]
            if opt_type == constants.BUFFER_GEOMETRY:
                geo_type = constants.BUFFER_GEOMETRY
            elif opt_type != constants.GEOMETRY:
                logger.error("Unknown geometry type %s", opt_type)

        logger.info("Setting %s to '%s'", node, geo_type)

        self._defaults[constants.TYPE] = geo_type
        base_classes.BaseNode.__init__(self, node,
                                       parent=parent,
                                       type=geo_type)

    @property
    def animation_filename(self):
        """Calculate the file name for the animation file

        :return: base name for the file
        """
        compression = self.options.get(constants.COMPRESSION)
        if compression in (None, constants.NONE):
            ext = constants.JSON
        elif compression == constants.MSGPACK:
            ext = constants.PACK

        key = ''
        for key in (constants.MORPH_TARGETS, constants.ANIMATION, constants.CLIPS):
            if key in self.keys():
                break
        else:
            logger.info("%s has no animation data", self.node)
            return

        return '%s.%s.%s' % (self.node, key, ext)

    @property
    def face_count(self):
        """Parse the bit masks of the `faces` array.

        :rtype: int

        """
        try:
            faces = self[constants.FACES]
        except KeyError:
            logger.debug("No parsed faces found")
            return 0

        length = len(faces)
        offset = 0

        def bitset(bit, mask):
            """

            :type bit: int
            :type mask: int

            """
            return bit & (1 << mask)

        face_count = 0

        masks = (constants.MASK[constants.UVS],
                 constants.MASK[constants.NORMALS],
                 constants.MASK[constants.COLORS])

        while offset < length:
            bit = faces[offset]
            offset += 1
            face_count += 1

            is_quad = bitset(bit, constants.MASK[constants.QUAD])
            vector = 4 if is_quad else 3
            offset += vector

            if bitset(bit, constants.MASK[constants.MATERIALS]):
                offset += 1

            for mask in masks:
                if bitset(bit, mask):
                    offset += vector

        return face_count

    @property
    def metadata(self):
        """Metadata for the current node.

        :rtype: dict

        """
        metadata = {
            constants.GENERATOR: constants.THREE,
            constants.VERSION: FORMAT_VERSION
        }

        if self[constants.TYPE] == constants.GEOMETRY.title():
            self._geometry_metadata(metadata)
        else:
            self._buffer_geometry_metadata(metadata)

        return metadata

    def copy(self, scene=True):
        """Copy the geometry definitions to a standard dictionary.

        :param scene: toggle for scene formatting
                      (Default value = True)
        :type scene: bool
        :rtype: dict

        """
        logger.debug("Geometry().copy(scene=%s)", scene)
        dispatch = {
            True: self._scene_format,
            False: self._geometry_format
        }
        data = dispatch[scene]()

        try:
            data[constants.MATERIALS] = self[constants.MATERIALS].copy()
        except KeyError:
            logger.debug("No materials to copy")

        return data

    def copy_textures(self, texture_folder=''):
        """Copy the textures to the destination directory."""
        logger.debug("Geometry().copy_textures()")
        if self.options.get(constants.EXPORT_TEXTURES) and not self.options.get(constants.EMBED_TEXTURES):
            texture_registration = self.register_textures()
            if texture_registration:
                logger.info("%s has registered textures", self.node)
                dirname = os.path.dirname(os.path.abspath(self.scene.filepath))
                full_path = os.path.join(dirname, texture_folder)
                io.copy_registered_textures(
                    full_path, texture_registration)

    def parse(self):
        """Parse the current node"""
        logger.debug("Geometry().parse()")
        if self[constants.TYPE] == constants.GEOMETRY.title():
            logger.info("Parsing Geometry format")
            self._parse_geometry()
        else:
            logger.info("Parsing BufferGeometry format")
            self._parse_buffer_geometry()

    def register_textures(self):
        """Obtain a texture registration object.

        :rtype: dict

        """
        logger.debug("Geometry().register_textures()")
        return api.mesh.texture_registration(self.node)

    def write(self, filepath=None):
        """Write the geometry definitions to disk. Uses the
        desitnation path of the scene.

        :param filepath: optional output file path
                        (Default value = None)
        :type filepath: str

        """
        logger.debug("Geometry().write(filepath=%s)", filepath)

        filepath = filepath or self.scene.filepath

        io.dump(filepath, self.copy(scene=False),
                options=self.scene.options)

        if self.options.get(constants.MAPS):
            logger.info("Copying textures for %s", self.node)
            self.copy_textures()

    def write_animation(self, filepath):
        """Write the animation definitions to a separate file
        on disk. This helps optimize the geometry file size.

        :param filepath: destination path
        :type filepath: str

        """
        logger.debug("Geometry().write_animation(%s)", filepath)

        for key in (constants.MORPH_TARGETS, constants.ANIMATION, constants.CLIPS):
            try:
                data = self[key]
                break
            except KeyError:
                pass
        else:
            logger.info("%s has no animation data", self.node)
            return

        filepath = os.path.join(filepath, self.animation_filename)
        if filepath:
            logger.info("Dumping animation data to %s", filepath)
            io.dump(filepath, data, options=self.scene.options)
            return filepath
        else:
            logger.warning("Could not determine a filepath for "
                           "animation data. Nothing written to disk.")

    def _component_data(self):
        """Query the component data only

        :rtype: dict

        """
        logger.debug("Geometry()._component_data()")

        if self[constants.TYPE] != constants.GEOMETRY.title():
            return self[constants.ATTRIBUTES]

        components = [constants.VERTICES, constants.FACES,
                      constants.UVS, constants.COLORS,
                      constants.NORMALS, constants.BONES,
                      constants.SKIN_WEIGHTS,
                      constants.SKIN_INDICES, constants.NAME,
                      constants.INFLUENCES_PER_VERTEX,
                      constants.INDEX]

        data = {}
        anim_components = [constants.MORPH_TARGETS, constants.ANIMATION, constants.MORPH_TARGETS_ANIM, constants.CLIPS]
        if self.options.get(constants.EMBED_ANIMATION):
            components.extend(anim_components)
        else:
            for component in anim_components:
                try:
                    self[component]
                except KeyError:
                    pass
                else:
                    data[component] = os.path.basename(
                        self.animation_filename)
                    break
            else:
                logger.info("No animation data found for %s", self.node)

        option_extra_vgroups = self.options.get(constants.EXTRA_VGROUPS)

        for name, index in api.mesh.extra_vertex_groups(self.node,
                                                        option_extra_vgroups):
            components.append(name)

        for component in components:
            try:
                data[component] = self[component]
            except KeyError:
                logger.debug("Component %s not found", component)

        return data

    def _geometry_format(self):
        """Three.Geometry formatted definitions

        :rtype: dict

        """
        data = self._component_data()

        if self[constants.TYPE] != constants.GEOMETRY.title():
            data = {
                constants.DATA: {constants.ATTRIBUTES: data}
            }

        data[constants.METADATA] = {
            constants.TYPE: self[constants.TYPE]
        }

        data[constants.METADATA].update(self.metadata)

        draw_calls = self.get(constants.DRAW_CALLS)
        if draw_calls is not None:
            data[constants.DRAW_CALLS] = draw_calls

        return data

    def _buffer_geometry_metadata(self, metadata):
        """Three.BufferGeometry metadata

        :rtype: dict

        """
        for key, value in self[constants.ATTRIBUTES].items():
            size = value[constants.ITEM_SIZE]
            array = value[constants.ARRAY]
            metadata[key] = len(array)/size

    def _geometry_metadata(self, metadata):
        """Three.Geometry metadata

        :rtype: dict

        """
        skip = (constants.TYPE, constants.FACES, constants.UUID,
                constants.ANIMATION, constants.SKIN_INDICES,
                constants.SKIN_WEIGHTS, constants.NAME,
                constants.INFLUENCES_PER_VERTEX)
        vectors = (constants.VERTICES, constants.NORMALS)

        for key in self.keys():
            if key in vectors:
                try:
                    metadata[key] = int(len(self[key])/3)
                except KeyError:
                    pass
                continue

            if key in skip:
                continue

            metadata[key] = len(self[key])

        faces = self.face_count
        if faces > 0:
            metadata[constants.FACES] = faces

    def _scene_format(self):
        """Format the output for Scene compatability

        :rtype: dict

        """
        data = {
            constants.UUID: self[constants.UUID],
            constants.TYPE: self[constants.TYPE]
        }

        component_data = self._component_data()
        if self[constants.TYPE] == constants.GEOMETRY.title():
            data[constants.DATA] = component_data
            data[constants.DATA].update({
                constants.METADATA: self.metadata
            })
        else:
            geometry_data = data
            if self.options.get(constants.EMBED_GEOMETRY, True):
                data[constants.DATA] = geometry_data = {}

            geometry_data[constants.ATTRIBUTES] = component_data
            index = self.get(constants.INDEX)
            if index is not None:
                geometry_data[constants.INDEX] = index
            draw_calls = self.get(constants.DRAW_CALLS)
            if draw_calls is not None:
                geometry_data[constants.DRAW_CALLS] = draw_calls

            data[constants.METADATA] = self.metadata
            data[constants.NAME] = self[constants.NAME]

        return data

    def _parse_buffer_geometry(self):
        """Parse the geometry to Three.BufferGeometry specs"""
        self[constants.ATTRIBUTES] = {}

        options_vertices = self.options.get(constants.VERTICES)
        option_normals = self.options.get(constants.NORMALS)
        option_uvs = self.options.get(constants.UVS)
        option_extra_vgroups = self.options.get(constants.EXTRA_VGROUPS)
        option_index_type = self.options.get(constants.INDEX_TYPE)

        pos_tuple = (constants.POSITION, options_vertices,
                     api.mesh.buffer_position, 3)
        uvs_tuple = (constants.UV, option_uvs,
                     api.mesh.buffer_uv, 2)
        uvs2_tuple = (constants.UV2, option_uvs,
                     lambda m: api.mesh.buffer_uv(m, layer=1), 2)
        normals_tuple = (constants.NORMAL, option_normals,
                         api.mesh.buffer_normal, 3)
        dispatch = (pos_tuple, uvs_tuple, uvs2_tuple, normals_tuple)

        for key, option, func, size in dispatch:

            if not option:
                continue

            array = func(self.node) or []
            if not array:
                logger.warning("No array could be made for %s", key)
                continue

            self[constants.ATTRIBUTES][key] = {
                constants.ITEM_SIZE: size,
                constants.TYPE: constants.FLOAT_32,
                constants.ARRAY: array
            }

        for name, index in api.mesh.extra_vertex_groups(self.node,
                                                        option_extra_vgroups):

            logger.info("Exporting extra vertex group %s", name)

            array = api.mesh.buffer_vertex_group_data(self.node, index)
            if not array:
                logger.warning("No array could be made for %s", name)
                continue

            self[constants.ATTRIBUTES][name] = {
                constants.ITEM_SIZE: 1,
                constants.TYPE: constants.FLOAT_32,
                constants.ARRAY: array
            }

        if option_index_type != constants.NONE:

            assert(not (self.get(constants.INDEX) or
                        self.get(constants.DRAW_CALLS)))

            indices_per_face = 3
            index_threshold = 0xffff - indices_per_face
            if option_index_type == constants.UINT_32:
                index_threshold = 0x7fffffff - indices_per_face

            attrib_data_in, attrib_data_out, attrib_keys = [], [], []

            i = 0
            for key, entry in self[constants.ATTRIBUTES].items():

                item_size = entry[constants.ITEM_SIZE]

                attrib_keys.append(key)
                attrib_data_in.append((entry[constants.ARRAY], item_size))
                attrib_data_out.append(([], i, i + item_size))
                i += item_size

            index_data, draw_calls = [], []
            indexed, flush_req, base_vertex = {}, False, 0

            assert(len(attrib_data_in) > 0)
            array, item_size = attrib_data_in[0]
            i, n = 0, len(array) / item_size
            while i < n:

                vertex_data = ()
                for array, item_size in attrib_data_in:
                    vertex_data += tuple(
                            array[i * item_size:(i + 1) * item_size])

                vertex_index = indexed.get(vertex_data)

                if vertex_index is None:

                    vertex_index = len(indexed)
                    flush_req = vertex_index >= index_threshold

                    indexed[vertex_data] = vertex_index
                    for array, i_from, i_to in attrib_data_out:
                        array.extend(vertex_data[i_from:i_to])

                index_data.append(vertex_index)

                i += 1
                if i == n:
                    flush_req = len(draw_calls) > 0
                    assert(i % indices_per_face == 0)

                if flush_req and i % indices_per_face == 0:
                    start, count = 0, len(index_data)
                    if draw_calls:
                        prev = draw_calls[-1]
                        start = (prev[constants.DC_START] +
                                 prev[constants.DC_COUNT])
                        count -= start
                    draw_calls.append({
                        constants.DC_START: start,
                        constants.DC_COUNT: count,
                        constants.DC_INDEX: base_vertex
                    })
                    base_vertex += len(indexed)
                    indexed.clear()
                    flush_req = False

            for i, key in enumerate(attrib_keys):
                array = attrib_data_out[i][0]
                self[constants.ATTRIBUTES][key][constants.ARRAY] = array

            self[constants.INDEX] = {
                constants.ITEM_SIZE: 1,
                constants.TYPE: option_index_type,
                constants.ARRAY: index_data
            }
            if (draw_calls):
                logger.info("draw_calls = %s", repr(draw_calls))
                self[constants.DRAW_CALLS] = draw_calls

    def _parse_geometry(self):
        """Parse the geometry to Three.Geometry specs"""
        if self.options.get(constants.VERTICES):
            logger.info("Parsing %s", constants.VERTICES)
            self[constants.VERTICES] = api.mesh.vertices(self.node) or []

        if self.options.get(constants.NORMALS):
            logger.info("Parsing %s", constants.NORMALS)
            self[constants.NORMALS] = api.mesh.normals(self.node) or []

        if self.options.get(constants.COLORS):
            logger.info("Parsing %s", constants.COLORS)
            self[constants.COLORS] = api.mesh.vertex_colors(
                self.node) or []

        if self.options.get(constants.FACE_MATERIALS):
            logger.info("Parsing %s", constants.FACE_MATERIALS)
            self[constants.MATERIALS] = api.mesh.materials(
                self.node, self.options) or []

        if self.options.get(constants.UVS):
            logger.info("Parsing %s", constants.UVS)
            self[constants.UVS] = api.mesh.uvs(self.node) or []

        if self.options.get(constants.FACES):
            logger.info("Parsing %s", constants.FACES)
            material_list = self.get(constants.MATERIALS)
            self[constants.FACES] = api.mesh.faces(
                self.node, self.options, material_list=material_list) or []

        no_anim = (None, False, constants.OFF)
        if self.options.get(constants.ANIMATION) not in no_anim:
            logger.info("Parsing %s", constants.ANIMATION)
            self[constants.ANIMATION] = api.mesh.skeletal_animation(
                self.node, self.options) or []

#       @TODO: considering making bones data implied when
#              querying skinning data

        bone_map = {}
        if self.options.get(constants.BONES):
            logger.info("Parsing %s", constants.BONES)
            bones, bone_map = api.mesh.bones(self.node, self.options)
            self[constants.BONES] = bones

        if self.options.get(constants.SKINNING):
            logger.info("Parsing %s", constants.SKINNING)
            influences = self.options.get(
                constants.INFLUENCES_PER_VERTEX, 2)
            anim_type = self.options.get(constants.ANIMATION)

            self[constants.INFLUENCES_PER_VERTEX] = influences
            self[constants.SKIN_INDICES] = api.mesh.skin_indices(
                self.node, bone_map, influences, anim_type) or []
            self[constants.SKIN_WEIGHTS] = api.mesh.skin_weights(
                self.node, bone_map, influences, anim_type) or []

        if self.options.get(constants.BLEND_SHAPES):
            logger.info("Parsing %s", constants.BLEND_SHAPES)
            mt = api.mesh.blend_shapes(self.node, self.options) or []
            self[constants.MORPH_TARGETS] = mt
            if len(mt) > 0 and self._scene:  # there's blend shapes, let check for animation
                tracks = api.mesh.animated_blend_shapes(self.node, self[constants.NAME], self.options) or []
                merge = self._scene[constants.ANIMATION][0][constants.KEYFRAMES]
                for track in tracks:
                    merge.append(track)
        elif self.options.get(constants.MORPH_TARGETS):
            logger.info("Parsing %s", constants.MORPH_TARGETS)
            self[constants.MORPH_TARGETS] = api.mesh.morph_targets(
                self.node, self.options) or []

        # In the moment there is no way to add extra data to a Geomtry in
        # Three.js. In case there is some day, here is the code:
        #
        # option_extra_vgroups = self.options.get(constants.EXTRA_VGROUPS)
        #
        # for name, index in api.mesh.extra_vertex_groups(self.node,
        #                                                 option_extra_vgroups):
        #
        #         logger.info("Exporting extra vertex group %s", name)
        #         self[name] = api.mesh.vertex_group_data(self.node, index)
