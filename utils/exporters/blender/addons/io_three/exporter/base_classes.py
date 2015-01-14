import uuid
from .. import constants, exceptions 


class BaseClass(constants.BASE_DICT):
    _defaults = {}

    def __init__(self, parent=None, type=None):
        constants.BASE_DICT.__init__(self)

        self.__type = type

        self.__parent = parent

        constants.BASE_DICT.update(self, self._defaults.copy())
     
    def __setitem__(self, key, value):
        if not isinstance(value, constants.VALID_DATA_TYPES):
            msg = 'Value is an invalid data type: %s' % type(value)
            raise exceptions.ThreeValueError(msg) 
        constants.BASE_DICT.__setitem__(self, key, value)

    @property
    def count(self):
        return len(self.keys())

    @property
    def parent(self):
        return self.__parent

    @property
    def type(self):
        return self.__type
    
    def copy(self):
        data = {}
        def _dict_copy(old, new):
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
    def __init__(self, node, parent, type):
        BaseClass.__init__(self, parent=parent, type=type)
        self.__node = node
        if node is not None:
            self[constants.NAME] = node

        if isinstance(parent, BaseScene):
            scene = parent
        elif parent is not None:
            scene = parent.scene
        else:
            scene = None

        self.__scene = scene

        self[constants.UUID] = str(uuid.uuid4()).upper()
    
    @property
    def node(self):
        return self.__node

    @property
    def scene(self):
        return self.__scene

    @property
    def options(self):
        return self.scene.options


class BaseScene(BaseClass):
    def __init__(self, filepath, options):
        BaseClass.__init__(self, type=constants.SCENE)

        self.__filepath = filepath

        self.__options = options.copy()

    @property
    def filepath(self):
        return self.__filepath

    @property
    def options(self):
        return self.__options
