
class Relation:
    # Item and catalog relations
    #    first item is group/kit
    REL_INCLUDES = 1
    NAME_INCLUDES = 'includes'
    # Main item in the kit
    #   first item is kit, second is main
    REL_MAIN_ITEM = 2
    NAME_MAIN_ITEM = 'main'
    # Modification of the catalog item
    #   first item is the common one
    REL_MODIFICATION = 3
    NAME_MODIFICATION = 'modification'
    # Software located on the storage
    #   catalog: disk-software
    #   item: software-disk
    REL_STORES = 4
    NAME_STORES = 'stores'
    # Compatible platforms or other items
    #   first one is platform
    REL_COMPATIBLE = 5
    NAME_COMPATIBLE = 'compatible'
    # Root item in the inclusion chain
    #   first item is root
    REL_ROOT = 6
    NAME_ROOT = 'root'
    # Produced by company
    #   first item is company
    REL_PRODUCED = 7
    NAME_PRODUCED = 'produced'
    # End of relations. May increase when new relations are added.
    REL_END = 8

    @staticmethod
    def get_name(id):
        if id == Relation.REL_INCLUDES:
            return Relation.NAME_INCLUDES
        elif id == Relation.REL_MAIN_ITEM:
            return Relation.NAME_MAIN_ITEM
        elif id == Relation.REL_MODIFICATION:
            return Relation.NAME_MODIFICATION
        elif id == Relation.REL_STORES:
            return Relation.NAME_STORES
        elif id == Relation.REL_COMPATIBLE:
            return Relation.NAME_COMPATIBLE
        elif id == Relation.REL_ROOT:
            return Relation.NAME_ROOT
        elif id == Relation.REL_PRODUCED:
            return Relation.NAME_PRODUCED
        return '%d' % id

    @staticmethod
    def get_id(name):
        try:
            if name == Relation.NAME_MAIN_ITEM:
                return Relation.REL_MAIN_ITEM
            if name == Relation.NAME_MODIFICATION:
                return Relation.REL_MODIFICATION
            if name == Relation.NAME_STORES:
                return Relation.REL_STORES
            if name == Relation.NAME_COMPATIBLE:
                return Relation.REL_COMPATIBLE
            if name == Relation.NAME_ROOT:
                return Relation.REL_ROOT
            if name == Relation.NAME_PRODUCED:
                return Relation.REL_PRODUCED
        except:
            pass

        try:
            id = int(name)
            if id >= Relation.REL_INCLUDES and id <= Relation.REL_PRODUCED:
                return id
        except:
            pass

        return Relation.REL_INCLUDES
