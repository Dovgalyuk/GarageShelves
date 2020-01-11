
class Relation:
    # Item and catalog relations
    #    first item is group/kit
    REL_INCLUDES = 1
    # Main item in the kit
    #   first item is kit, second is main
    REL_MAIN_ITEM = 2
    # Modification of the catalog item
    #   first item is the common one
    REL_MODIFICATION = 3
    # Software located on the storage
    #   catalog: disk-software
    #   item: software-disk
    REL_STORES = 4
    # Compatible platforms or other items
    #   first one is platform
    REL_COMPATIBLE = 5
    # Root item in the inclusion chain
    #   first item is root
    REL_ROOT = 6

    @staticmethod
    def get_id(name):
        try:
            if name == "main":
                return Relation.REL_MAIN_ITEM
            if name == "modification":
                return Relation.REL_MODIFICATION
            if name == "stores":
                return Relation.REL_STORES
            if name == "compatible":
                return Relation.REL_COMPATIBLE
            if name == "root":
                return Relation.REL_ROOT
        except:
            pass

        try:
            id = int(name)
            if id >= Relation.REL_INCLUDES and id <= Relation.REL_ROOT:
                return id
        except:
            pass

        return Relation.REL_INCLUDES
