
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
