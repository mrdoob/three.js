"""
Module for handling the parsing of skeletal animation data.
updated on 2/07/2016: bones scaling support (@uthor verteAzur verteAzur@multivers3d.fr)
"""

import math
import mathutils
from bpy import data, context, ops
from .. import constants, logger

def pose_animation(armature, options):
    """Query armature animation using pose bones

    :param armature:
    :param options:
    :returns: list dictionaries containing animationdata
    :rtype: [{}, {}, ...]

    """
    logger.debug("animation.pose_animation(%s)", armature)
    func = _parse_pose_action
    return _parse_action(func, armature, options)


def rest_animation(armature, options):
    """Query armature animation (REST position)

    :param armature:
    :param options:
    :returns: list dictionaries containing animationdata
    :rtype: [{}, {}, ...]

    """
    logger.debug("animation.rest_animation(%s)", armature)
    func = _parse_rest_action
    return _parse_action(func, armature, options)


def _parse_action(func, armature, options):
    """

    :param func:
    :param armature:
    :param options:

    """
    animations = []
    logger.info("Parsing %d actions", len(data.actions))
    for action in data.actions:
        logger.info("Parsing action %s", action.name)
        animation = func(action, armature, options)
        animations.append(animation)
    return animations


def _parse_rest_action(action, armature, options):
    """

    :param action:
    :param armature:
    :param options:

    """
    end_frame = action.frame_range[1]
    start_frame = action.frame_range[0]
    frame_length = end_frame - start_frame
    rot = armature.matrix_world.decompose()[1]
    rotation_matrix = rot.to_matrix()
    hierarchy = []
    parent_index = -1
    frame_step = options.get(constants.FRAME_STEP, 1)
    fps = context.scene.render.fps

    start = int(start_frame)
    end = int(end_frame / frame_step) + 1

    for bone in armature.data.bones:
        # I believe this was meant to skip control bones, may
        # not be useful. needs more testing
        if bone.use_deform is False:
            logger.info("Skipping animation data for bone %s", bone.name)
            continue

        logger.info("Parsing animation data for bone %s", bone.name)

        keys = []
        for frame in range(start, end):
            computed_frame = frame * frame_step
            pos, pchange = _position(bone, computed_frame,
                                     action, armature.matrix_world)
            rot, rchange = _rotation(bone, computed_frame,
                                     action, rotation_matrix)
            rot = _normalize_quaternion(rot)

            sca, schange = _scale(bone, computed_frame,
                                     action, armature.matrix_world)

            pos_x, pos_y, pos_z = pos.x, pos.z, -pos.y
            rot_x, rot_y, rot_z, rot_w = rot.x, rot.z, -rot.y, rot.w
            sca_x, sca_y, sca_z = sca.x, sca.z, sca.y

            if frame == start_frame:

                time = (frame * frame_step - start_frame) / fps
                
                keyframe = {
                    constants.TIME: time,
                    constants.POS: [pos_x, pos_y, pos_z],
                    constants.ROT: [rot_x, rot_y, rot_z, rot_w],
                    constants.SCL: [sca_x, sca_y, sca_z]
                }
                keys.append(keyframe)

            # END-FRAME: needs pos, rot and scl attributes
            # with animation length (required frame)

            elif frame == end_frame / frame_step:

                time = frame_length / fps
                keyframe = {
                    constants.TIME: time,
                    constants.POS: [pos_x, pos_y, pos_z],
                    constants.ROT: [rot_x, rot_y, rot_z, rot_w],
                    constants.SCL: [sca_x, sca_y, sca_z]
                }
                keys.append(keyframe)

            # MIDDLE-FRAME: needs only one of the attributes,
            # can be an empty frame (optional frame)

            elif pchange is True or rchange is True or schange is True:

                time = (frame * frame_step - start_frame) / fps

                if pchange is True and rchange is True:
                    keyframe = {
                        constants.TIME: time,
                        constants.POS: [pos_x, pos_y, pos_z],
                        constants.ROT: [rot_x, rot_y, rot_z, rot_w],
                        constants.SCL: [sca_x, sca_y, sca_z]
                    }
                elif pchange is True:
                    keyframe = {
                        constants.TIME: time,
                        constants.POS: [pos_x, pos_y, pos_z]
                    }
                elif rchange is True:
                    keyframe = {
                        constants.TIME: time,
                        constants.ROT: [rot_x, rot_y, rot_z, rot_w]
                    }
                elif schange is True:
                    keyframe = {
                        constants.TIME: time,
                        constants.SCL: [sca_x, sca_y, sca_z]
                    }

                keys.append(keyframe)

        hierarchy.append({
            constants.KEYS: keys,
            constants.PARENT: parent_index
        })
        parent_index += 1

    animation = {
        constants.HIERARCHY: hierarchy,
        constants.LENGTH: frame_length / fps,
        constants.FPS: fps,
        constants.NAME: action.name
    }

    return animation


def _parse_pose_action(action, armature, options):
    """

    :param action:
    :param armature:
    :param options:

    """
    try:
        current_context = context.area.type
    except AttributeError:
        for window in context.window_manager.windows:
            screen = window.screen
            for area in screen.areas:
                if area.type != 'VIEW_3D':
                    continue

                override = {
                    'window': window,
                    'screen': screen,
                    'area': area
                }
                ops.screen.screen_full_area(override)
                break
        current_context = context.area.type

    context.scene.objects.active = armature
    context.area.type = 'DOPESHEET_EDITOR'
    context.space_data.mode = 'ACTION'
    context.area.spaces.active.action = action

    armature_matrix = armature.matrix_world
    fps = context.scene.render.fps

    end_frame = action.frame_range[1]
    start_frame = action.frame_range[0]
    frame_length = end_frame - start_frame

    frame_step = options.get(constants.FRAME_STEP, 1)
    used_frames = int(frame_length / frame_step) + 1

    keys = []
    channels_location = []
    channels_rotation = []
    channels_scale = []

    for pose_bone in armature.pose.bones:
        logger.info("Processing channels for %s",
                    pose_bone.bone.name)
        keys.append([])
        channels_location.append(
            _find_channels(action,
                           pose_bone.bone,
                           'location'))
        channels_rotation.append(
            _find_channels(action,
                           pose_bone.bone,
                           'rotation_quaternion'))
        channels_rotation.append(
            _find_channels(action,
                           pose_bone.bone,
                           'rotation_euler'))
        channels_scale.append(
            _find_channels(action,
                           pose_bone.bone,
                           'scale'))

    frame_step = options[constants.FRAME_STEP]
    frame_index_as_time = options[constants.FRAME_INDEX_AS_TIME]
    for frame_index in range(0, used_frames):
        if frame_index == used_frames - 1:
            frame = end_frame
        else:
            frame = start_frame + frame_index * frame_step

        logger.info("Processing frame %d", frame)

        time = frame - start_frame
        if frame_index_as_time is False:
            time = time / fps

        context.scene.frame_set(frame)

        bone_index = 0

        def has_keyframe_at(channels, frame):
            """

            :param channels:
            :param frame:

            """
            def find_keyframe_at(channel, frame):
                """

                :param channel:
                :param frame:

                """
                for keyframe in channel.keyframe_points:
                    if keyframe.co[0] == frame:
                        return keyframe
                return None

            for channel in channels:
                if not find_keyframe_at(channel, frame) is None:
                    return True
            return False

        for pose_bone in armature.pose.bones:

            logger.info("Processing bone %s", pose_bone.bone.name)
            if pose_bone.parent is None:
                bone_matrix = armature_matrix * pose_bone.matrix
            else:
                parent_matrix = armature_matrix * pose_bone.parent.matrix
                bone_matrix = armature_matrix * pose_bone.matrix
                bone_matrix = parent_matrix.inverted() * bone_matrix

            pos, rot, scl = bone_matrix.decompose()
            rot = _normalize_quaternion(rot)

            pchange = True or has_keyframe_at(
                channels_location[bone_index], frame)
            rchange = True or has_keyframe_at(
                channels_rotation[bone_index], frame)
            schange = True or has_keyframe_at(
                channels_scale[bone_index], frame)

            pos = (pos.x, pos.z, -pos.y)
            rot = (rot.x, rot.z, -rot.y, rot.w)
            scl = (scl.x, scl.z, scl.y)

            keyframe = {constants.TIME: time}
            if frame == start_frame or frame == end_frame:
                keyframe.update({
                    constants.POS: pos,
                    constants.ROT: rot,
                    constants.SCL: scl
                })
            elif any([pchange, rchange, schange]):
                if pchange is True:
                    keyframe[constants.POS] = pos
                if rchange is True:
                    keyframe[constants.ROT] = rot
                if schange is True:
                    keyframe[constants.SCL] = scl

            if len(keyframe.keys()) > 1:
                logger.info("Recording keyframe data for %s %s",
                            pose_bone.bone.name, str(keyframe))
                keys[bone_index].append(keyframe)
            else:
                logger.info("No anim data to record for %s",
                            pose_bone.bone.name)

            bone_index += 1

    hierarchy = []
    bone_index = 0
    for pose_bone in armature.pose.bones:
        hierarchy.append({
            constants.PARENT: bone_index - 1,
            constants.KEYS: keys[bone_index]
        })
        bone_index += 1

    if frame_index_as_time is False:
        frame_length = frame_length / fps

    context.scene.frame_set(start_frame)
    context.area.type = current_context

    animation = {
        constants.HIERARCHY: hierarchy,
        constants.LENGTH: frame_length,
        constants.FPS: fps,
        constants.NAME: action.name
    }

    return animation


def _find_channels(action, bone, channel_type):
    """

    :param action:
    :param bone:
    :param channel_type:

    """
    result = []

    if len(action.groups):

        group_index = -1
        for index, group in enumerate(action.groups):
            if group.name == bone.name:
                group_index = index
                # @TODO: break?

        if group_index > -1:
            for channel in action.groups[group_index].channels:
                if channel_type in channel.data_path:
                    result.append(channel)

    else:
        bone_label = '"%s"' % bone.name
        for channel in action.fcurves:
            data_path = [bone_label in channel.data_path,
                         channel_type in channel.data_path]
            if all(data_path):
                result.append(channel)

    return result


def _position(bone, frame, action, armature_matrix):
    """

    :param bone:
    :param frame:
    :param action:
    :param armature_matrix:

    """

    position = mathutils.Vector((0, 0, 0))
    change = False

    ngroups = len(action.groups)

    if ngroups > 0:

        index = 0

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
                index = i

        for channel in action.groups[index].channels:
            if "location" in channel.data_path:
                has_changed = _handle_position_channel(
                    channel, frame, position)
                change = change or has_changed

    else:

        bone_label = '"%s"' % bone.name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and "location" in data_path:
                has_changed = _handle_position_channel(
                    channel, frame, position)
                change = change or has_changed

    position = position * bone.matrix_local.inverted()

    if bone.parent is None:

        position.x += bone.head.x
        position.y += bone.head.y
        position.z += bone.head.z

    else:

        parent = bone.parent

        parent_matrix = parent.matrix_local.inverted()
        diff = parent.tail_local - parent.head_local

        position.x += (bone.head * parent_matrix).x + diff.x
        position.y += (bone.head * parent_matrix).y + diff.y
        position.z += (bone.head * parent_matrix).z + diff.z

    return armature_matrix*position, change


def _rotation(bone, frame, action, armature_matrix):
    """

    :param bone:
    :param frame:
    :param action:
    :param armature_matrix:

    """

    # TODO: calculate rotation also from rotation_euler channels

    rotation = mathutils.Vector((0, 0, 0, 1))

    change = False

    ngroups = len(action.groups)

    # animation grouped by bones

    if ngroups > 0:

        index = -1

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
                index = i

        if index > -1:
            for channel in action.groups[index].channels:
                if "quaternion" in channel.data_path:
                    has_changed = _handle_rotation_channel(
                        channel, frame, rotation)
                    change = change or has_changed

    # animation in raw fcurves

    else:

        bone_label = '"%s"' % bone.name

        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and "quaternion" in data_path:
                has_changed = _handle_rotation_channel(
                    channel, frame, rotation)
                change = change or has_changed

    rot3 = rotation.to_3d()
    rotation.xyz = rot3 * bone.matrix_local.inverted()
    rotation.xyz = armature_matrix * rotation.xyz

    return rotation, change

def _scale(bone, frame, action, armature_matrix):
    """

    :param bone:
    :param frame:
    :param action:
    :param armature_matrix:

    """
    scale = mathutils.Vector((0.0, 0.0, 0.0))

    change = False

    ngroups = len(action.groups)

    # animation grouped by bones
	
    if ngroups > 0:

        index = -1

        for i in range(ngroups):
            if action.groups[i].name == bone.name:
		
                print(action.groups[i].name)

                index = i

        if index > -1:
            for channel in action.groups[index].channels:
 
                if "scale" in channel.data_path:
                    has_changed = _handle_scale_channel(
                        channel, frame, scale)
                    change = change or has_changed
                    
    # animation in raw fcurves

    else:

        bone_label = '"%s"' % bone.name
	
        for channel in action.fcurves:
            data_path = channel.data_path
            if bone_label in data_path and "scale" in data_path:
                has_changed = _handle_scale_channel(
                    channel, frame, scale)
                change = change or has_changed
    	
   
    #scale.xyz = armature_matrix * scale.xyz

    return scale, change


def _handle_rotation_channel(channel, frame, rotation):
    """

    :param channel:
    :param frame:
    :param rotation:

    """

    change = False

    if channel.array_index in [0, 1, 2, 3]:

        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True

        value = channel.evaluate(frame)

        if channel.array_index == 1:
            rotation.x = value

        elif channel.array_index == 2:
            rotation.y = value

        elif channel.array_index == 3:
            rotation.z = value

        elif channel.array_index == 0:
            rotation.w = value

    return change


def _handle_position_channel(channel, frame, position):
    """

    :param channel:
    :param frame:
    :param position:

    """

    change = False

    if channel.array_index in [0, 1, 2]:
        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True

        value = channel.evaluate(frame)

        if channel.array_index == 0:
            position.x = value

        if channel.array_index == 1:
            position.y = value

        if channel.array_index == 2:
            position.z = value

    return change

def _handle_scale_channel(channel, frame, scale):
    """

    :param channel:
    :param frame:
    :param position:

    """
    change = False

    if channel.array_index in [0, 1, 2]:
        for keyframe in channel.keyframe_points:
            if keyframe.co[0] == frame:
                change = True
       
        value = channel.evaluate(frame)
      
        if channel.array_index == 0:
            scale.x = value

        if channel.array_index == 1:
            scale.y = value

        if channel.array_index == 2:
            scale.z = value

    return change


def _quaternion_length(quat):
    """Calculate the length of a quaternion

    :param quat: Blender quaternion object
    :rtype: float

    """
    return math.sqrt(quat.x * quat.x + quat.y * quat.y +
                     quat.z * quat.z + quat.w * quat.w)


def _normalize_quaternion(quat):
    """Normalize a quaternion

    :param quat: Blender quaternion object
    :returns: generic quaternion enum object with normalized values
    :rtype: object

    """
    enum = type('Enum', (), {'x': 0, 'y': 0, 'z': 0, 'w': 1})
    length = _quaternion_length(quat)
    if length is not 0:
        length = 1 / length
        enum.x = quat.x * length
        enum.y = quat.y * length
        enum.z = quat.z * length
        enum.w = quat.w * length
    return enum
