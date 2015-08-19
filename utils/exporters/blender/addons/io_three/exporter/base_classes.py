from . import utilities
from .. import constants, exceptions


class BaseClass(constants.BASE_DICT):
    """Base class which inherits from a base dictionary object."""
    _defaults = {}

    def __init__(self, parent=None, type=None):
        constants.BASE_DICT.__init__(self)

        self._type = type

        self._parent = parent

        constants.BASE_DICT.update(self, self._defaults.copy())
        BaseClass._defaults = {}

    def __setitem__(self, key, value):
        if not isinstance(value, constants.VALID_DATA_TYPES):
            msg = "Value is an invalid data type: %s" % type(value)
            raise exceptions.ThreeValueError(msg)
        constants.BASE_DICT.__setitem__(self, key, value)

    @property
    def count(self):
        """

        :return: number of keys
        :rtype: int

        """
        return len(self.keys())

    @property
    def parent(self):
        """

        :return: parent object

        """
        return self._parent

    @property
    def type(self):
        """

        :return: the type (if applicable)

        """
        return self._type

    def copy(self):
        """Copies the items to a standard dictionary object.

        :rtype: dict

        """
        data = {}

        def _dict_copy(old, new):
            """Recursive function for processing all values

            :param old:
            :param new:

            """
            for key, value in old.items():
                if isinstance(value, (str, list)):
                    new[key] = value[:]
                elif isinstance(value, tuple):
                    new[key] = value+tuple()
                elif isinstance(value, dict):
                    new[key] = {}
                    _dict_copy(value, new[key])
                else:
                    new[key] = value

        _dict_copy(self, data)

        return data


class BaseNode(BaseClass):
    """Base class for all nodes for the current platform."""
    def __init__(self, node, parent, type):
        BaseClass.__init__(self, parent=parent, type=type)
        self._node = node
        if node is None:
            self[constants.UUID] = utilities.id()
        else:
            self[constants.NAME] = node
            self[constants.UUID] = utilities.id_from_name(node)

        if isinstance(parent, BaseScene):
            scene = parent
        elif parent is not None:
            scene = parent.scene
        else:
            scene = None

        self._scene = scene

    @property
    def node(self):
        """

        :return: name of the node

        """
        return self._node

    @property
    def scene(self):
        """

        :return: returns the scene point

        """

        return self._scene

    @property
    def options(self):
        """

        :return: export options
        :retype: dict

        """
        return self.scene.options


class BaseScene(BaseClass):
    """Base class that scenes inherit from."""
    def __init__(self, filepath, options):
        BaseClass.__init__(self, type=constants.SCENE)

        self._filepath = filepath

        self._options = options.copy()

    @property
    def filepath(self):
        return self._filepath

    @property
    def options(self):
        return self._options
