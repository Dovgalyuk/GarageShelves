
class Type:
    # Abstract catalog items - families and groups
    TYPE_ABSTRACT = 1
    # Physical items - computers/disks/consoles...
    TYPE_PHYSICAL = 2
    # Several items grouped together by the manufacturer/seller
    TYPE_KIT = 3
    # Software or data
    TYPE_BITS = 4
    # Company/manufacturer
    TYPE_COMPANY = 5

    @staticmethod
    def get_id(name):
        try:
            if name == "abstract":
                return Type.TYPE_ABSTRACT
            if name == "physical":
                return Type.TYPE_PHYSICAL
            if name == "kit":
                return Type.TYPE_KIT
            if name == "bits":
                return Type.TYPE_BITS
            if name == "company":
                return Type.TYPE_COMPANY
        except:
            pass

        try:
            id = int(name)
            if id >= Type.TYPE_ABSTRACT and id <= Type.TYPE_COMPANY:
                return id
        except:
            pass

        return -1

    @staticmethod
    def split_string(s):
        type_ids = []
        if s:
            for t in s.split(','):
                try:
                    type_ids.append(Type.get_id(t))
                except:
                    pass # do nothing
        return type_ids
