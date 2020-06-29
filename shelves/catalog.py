from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, jsonify,
    Response
)
from werkzeug.exceptions import abort
import re
from json import dumps

from shelves.auth import (login_required, admin_required)
from shelves.db import get_db_cursor, db_commit, db_rollback
from shelves.collection import get_user_collection
from shelves.uploads import upload_image, upload_file
from shelves.relation import Relation
from shelves.attribute import Attribute
from shelves.type import Type

bp = Blueprint('catalog', __name__, url_prefix='/catalog')


def get_catalog_root(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT catalog_id1 FROM catalog_relation'
        ' WHERE catalog_id2 = %s AND type = %s',
        (id, Relation.REL_ROOT))
    try:
        res = cursor.fetchone()['catalog_id1']
    except:
        res = -1
    return res

def get_catalog_none(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, c.title_eng, c.description, c.created,'
        ' IF(c.type = %s, 1, 0) AS is_physical,'
        ' IF(c.type = %s, 1, 0) AS is_group,'
        ' IF(c.type = %s, 1, 0) AS is_kit,'
        ' IF(c.type = %s, 1, 0) AS is_bits,'
        ' IF(c.type = %s, 1, 0) AS is_company,'
        ' IFNULL(c.year, "") as year,'
        ' ccomp.title_eng as company, ccomp.id as company_id,'
        ' c.type, rr.catalog_id1 AS root,'
        ' cr.title_eng AS root_title'
        ' FROM catalog c'
        ' LEFT JOIN catalog_relation rr ON rr.catalog_id2 = c.id AND rr.type = %s'
        ' LEFT JOIN catalog cr ON rr.catalog_id1 = cr.id'
        ' LEFT JOIN catalog_relation rcomp ON rcomp.catalog_id2 = c.id AND rcomp.type = %s'
        ' LEFT JOIN catalog ccomp ON rcomp.catalog_id1 = ccomp.id'
        ' WHERE c.id = %s',
        (Type.TYPE_PHYSICAL, Type.TYPE_ABSTRACT, Type.TYPE_KIT,
         Type.TYPE_BITS, Type.TYPE_COMPANY,
         Relation.REL_ROOT, Relation.REL_PRODUCED,
         id,)
    )
    return cursor.fetchone()

def get_catalog_full(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT c.id, c.title, c.title_eng, c.description, c.created,'
        ' IF(c.type = %s, 1, 0) AS is_physical,'
        ' IF(c.type = %s, 1, 0) AS is_group,'
        ' IF(c.type = %s, 1, 0) AS is_kit,'
        ' IF(c.type = %s, 1, 0) AS is_bits,'
        ' IF(c.type = %s, 1, 0) AS is_company,'
        ' IFNULL(c.year, "") as year,'
        ' ccomp.title_eng as company, ccomp.id as company_id,'
        ' c.type,'
        ' rr.catalog_id1 AS root, cr.title_eng AS root_title'
        ' FROM catalog c'
        ' LEFT JOIN catalog_relation rr ON rr.catalog_id2 = c.id AND rr.type = %s'
        ' LEFT JOIN catalog cr ON rr.catalog_id1 = cr.id'
        ' LEFT JOIN catalog_relation rcomp ON rcomp.catalog_id2 = c.id AND rcomp.type = %s'
        ' LEFT JOIN catalog ccomp ON rcomp.catalog_id1 = ccomp.id'
        ' WHERE c.id = %s',
        (Type.TYPE_PHYSICAL, Type.TYPE_ABSTRACT, Type.TYPE_KIT,
         Type.TYPE_BITS, Type.TYPE_COMPANY,
         Relation.REL_ROOT,
         Relation.REL_PRODUCED, id,)
    )
    return cursor.fetchone()

def get_catalog(id):
    catalog = get_catalog_none(id)
    if catalog is None:
        abort(403, "Catalog id {0} doesn't exist.".format(id))

    return catalog

def get_catalog_images(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT img.id, img.filename, img.description'
        ' FROM catalog c JOIN catalog_attribute a ON c.id = a.catalog_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = %s AND c.id = %s',
        (Attribute.ATTR_IMAGE, id,)
    )
    images = cursor.fetchall()
    return images

def get_catalog_logo_own(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT img.id'
        ' FROM catalog c JOIN catalog_attribute a ON c.id = a.catalog_id'
        ' JOIN image img ON a.value_id = img.id'
        ' WHERE a.type = %s AND c.id = %s',
        (Attribute.ATTR_LOGO, id,)
    )
    res = cursor.fetchone()
    if res:
        return res['id']
    return None

def get_catalog_logo(id):
    res = get_catalog_logo_own(id)
    if res:
        return res

    # try with root
    root = get_catalog_root(id)
    if root != -1:
        return get_catalog_logo(root)

    return -1


def create_catalog(cursor, type_id, title, title_eng, description, year, root_id):
    cursor.execute(
        'INSERT INTO catalog (type, title, title_eng, description, year)'
        ' VALUES (%s, %s, %s, %s, %s)',
        (type_id, title, title_eng, description, year)
    )
    catalog_id = cursor.lastrowid
    if root_id != -1:
        cursor.execute(
            'INSERT INTO catalog_relation'
            ' (catalog_id1, catalog_id2, type)'
            ' VALUES (%s, %s, %s)',
            (root_id, catalog_id, Relation.REL_ROOT)
        )
    if not g.user['admin']:
        cursor.execute(
            'INSERT INTO catalog_history'
            ' (catalog_id, user_id, field, value, old_value)'
            ' VALUES (%s, %s, %s, %s, %s)',
            (catalog_id, g.user['id'], "create", "", "")
        )
    return catalog_id

# insert ownership record for the specified item
def add_ownership(cursor, id, internal_id, collection_id):
    cursor.execute(
        'INSERT INTO item (catalog_id, internal_id, description, collection_id)'
        ' VALUES (%s, %s, %s, %s)',
        (id, internal_id, '', collection_id)
    )
    item_id = cursor.lastrowid
    # check if there was software on the data storage catalog item
    cursor.execute(
        'SELECT catalog_id2 AS id FROM catalog_relation'
        ' WHERE type = %s AND catalog_id1 = %s',
        (Relation.REL_STORES, id,)
    )
    for soft in cursor.fetchall():
        cursor.execute(
            'INSERT INTO catalog_item_relation (catalog_id, item_id, type)'
            '    VALUES (%s, %s, %s)',
            (soft['id'], item_id, Relation.REL_STORES,)
        )

    return item_id

# insert ownership record for the specified item
# if item is kit, also own all its subitems
def add_ownership_all(cursor, id, internal_id, collection_id):
    item_id = add_ownership(cursor, id, internal_id, collection_id)
    # check subitems
    catalog = get_catalog(id)
    if catalog['is_kit']:
        cursor.execute(
            'SELECT catalog_id2 AS id FROM catalog_relation'
            ' WHERE type = %s AND catalog_id1 = %s',
            (Relation.REL_INCLUDES, id,)
        )
        subitems = cursor.fetchall()
        for sub in subitems:
            subitem = get_catalog(sub['id'])
            if subitem['is_physical']:
                subitem_id = add_ownership_all(cursor, sub['id'], '', collection_id)
                # add relation
                cursor.execute(
                    'INSERT INTO item_relation (item_id1, item_id2, type)'
                    ' VALUES (%s, %s, %s)',
                    (item_id, subitem_id, Relation.REL_INCLUDES)
                )

    return item_id

# function for checking existing dependencies
# returns False if subitem is already parent of main item
def check_parent_loops(main_id, subitem_id):
    checked = set()
    queue = {main_id}
    cursor = get_db_cursor()
    while queue:
        next = queue.pop()
        if next == subitem_id:
            return False
        if next not in checked:
            checked.add(next)
            # TODO: other relations?
            cursor.execute(
                'SELECT catalog_id1 FROM catalog_relation'
                ' WHERE (type = %s OR type = %s OR type = %s)'
                '   AND catalog_id2 = %s',
                (Relation.REL_INCLUDES, Relation.REL_MAIN_ITEM,
                 Relation.REL_MODIFICATION, next,)
            )
            for v in cursor.fetchall():
                queue.add(v['catalog_id1'])
    #
    return True

###############################################################################
# API Routes
###############################################################################

@bp.route('/_get_logo')
def _get_logo():
    id = request.args.get('id', -1, type=int)

    cursor = get_db_cursor()
    cursor.execute(
        'SELECT'
        ' IF(c.type = %s, 1, 0) AS is_physical,'
        ' IF(c.type = %s, 1, 0) AS is_group,'
        ' IF(c.type = %s, 1, 0) AS is_kit,'
        ' IF(c.type = %s, 1, 0) AS is_bits,'
        ' IF(c.type = %s, 1, 0) AS is_company'
        ' FROM catalog c WHERE id = %s',
        (Type.TYPE_PHYSICAL, Type.TYPE_ABSTRACT, Type.TYPE_KIT,
         Type.TYPE_BITS, Type.TYPE_COMPANY,
         id,)
    )
    res = cursor.fetchone()
    res['logo'] = get_catalog_logo(id)

    return jsonify(res)

@bp.route('/_get')
def _get():
    id = request.args.get('id', -1, type=int)

    catalog = get_catalog_full(id)
    if catalog is None:
        return jsonify(error="Catalog item doesn't exist")

    return jsonify(catalog)

@bp.route('/_get_main')
def _get_main():
    id = request.args.get('id', -1, type=int)

    cursor = get_db_cursor()
    cursor.execute(
        'SELECT r.catalog_id1 AS id FROM catalog c'
        ' LEFT JOIN catalog_relation r ON c.id = r.catalog_id2'
        ' WHERE r.type = %s AND c.id = %s',
        (Relation.REL_MODIFICATION, id,))
    res = cursor.fetchone()
    if res is None:
        return jsonify(data=None)

    catalog = get_catalog_full(res['id'])
    return jsonify(catalog)

def filtered_query(args, count):
    parent_id = args.get('parent', -1, type=int)
    # many different parent categories
    category_ids = []
    categories = args.get('categories')
    if categories:
        for c in categories.split(','):
            try:
                category_ids.append(int(c))
            except:
                pass # do nothing

    includes_id = args.get('includes', -1, type=int)
    title = args.get('title')
    noparent = args.get('noparent', False, type=bool)
    noparent_rel = Relation.get_id(args.get('noparent_rel'))

    latest = args.get('latest', -1, type=int)
    if latest > 100:
        return abort(400)

    types = args.get('type')
    type_ids = []
    if types:
        for t in types.split(','):
            try:
                type_ids.append(Type.get_id(t))
            except:
                pass # do nothing

    catalog_not_type = Type.get_id(args.get('not_type'))
    parent_rel = Relation.get_id(args.get('parent_rel'))
    parents = args.get('parent_name')
    parent_names = []
    if parents:
        parent_names = parents.split(',')
    child_rel = Relation.get_id(args.get('child_rel'))

    storage_item_id = args.get('storage_item', -1, type=int)

    limitFirst = args.get('limitFirst', -1, type=int)
    limitPage = args.get('limitPage', -1, type=int)

    suffix = ''
    where = ' WHERE 1 = 1'
    if count:
        query = 'SELECT COUNT(*) as count'                                 \
                ' FROM catalog c '
        params = ()
    else:
        query = 'SELECT c.id, c.title, c.title_eng, c.created,'
        if parent_id != -1 or parent_names:
            query += "crp.id AS list_id, "
        else:
            query += "c.id AS list_id, "
        query += ' IF(c.type = %s, 1, 0) AS is_physical,'                  \
                ' IF(c.type = %s, 1, 0) AS is_group,'                      \
                ' IF(c.type = %s, 1, 0) AS is_kit,'                        \
                ' IF(c.type = %s, 1, 0) AS is_bits,'                       \
                ' IF(c.type = %s, 1, 0) AS is_company,'                    \
                ' c.year, '                                                \
                ' ccomp.title_eng as company, ccomp.id as company_id,'     \
                ' (SELECT COUNT(*) FROM catalog cc'                        \
                '   JOIN catalog_relation r WHERE cc.id=r.catalog_id2'     \
                '   AND c.id=r.catalog_id1 AND r.type=%s) AS count,'       \
                ' rr.catalog_id1 AS root, cr.title_eng AS root_title'      \
                ' FROM catalog c'\
                ' LEFT JOIN catalog_relation rr ON rr.catalog_id2 = c.id AND rr.type= %s'  \
                ' LEFT JOIN catalog cr ON rr.catalog_id1 = cr.id' \
                ' LEFT JOIN catalog_relation rcomp ON rcomp.catalog_id2 = c.id AND rcomp.type = %s' \
                ' LEFT JOIN catalog ccomp ON rcomp.catalog_id1 = ccomp.id'
        suffix = ' ORDER BY IFNULL(c.title_eng, c.title)'
        # parameters are integer - insert them without escaping
        # TODO: remove limit from latest
        if latest > 0:
            suffix = ' ORDER BY c.created DESC LIMIT %d' % latest
        elif limitFirst >= 0 and limitPage > 0:
            suffix += ' LIMIT %d,%d' % (limitFirst, limitPage)
        params = (Type.TYPE_PHYSICAL, Type.TYPE_ABSTRACT,
                  Type.TYPE_KIT, Type.TYPE_BITS, Type.TYPE_COMPANY,
                  Relation.REL_INCLUDES,
                  Relation.REL_ROOT,
                  Relation.REL_PRODUCED, )

    if parent_id != -1:
        query += ' JOIN catalog_relation crp ON c.id = crp.catalog_id2'
        where += ' AND crp.catalog_id1 = %s AND crp.type = %s'
        params = (*params, parent_id, parent_rel,)
    elif parent_names:
        query += ' JOIN catalog_relation crp ON c.id = crp.catalog_id2' \
                 ' JOIN catalog cp ON crp.catalog_id1 = cp.id'
        where += ' AND ('
        first = True
        for p in parent_names:
            if not first:
                where += ' OR '
            where += ' cp.title_eng = %s'
            params = (*params, p,)
            first = False
        where += ') AND crp.type = %s'
        params = (*params, parent_rel,)
    if category_ids:
        where += ' AND ('
        first = True
        for c in category_ids:
            if not first:
                where += ' OR '
            where += ' EXISTS (SELECT 1 FROM catalog_relation' \
                     '      WHERE catalog_id1 = %s AND catalog_id2 = c.id' \
                     '      AND type = %s)'
            params = (*params, c, Relation.REL_COMPATIBLE,)
            first = False
        where += ')'
    if includes_id != -1:
        where += ' AND EXISTS (SELECT 1 FROM catalog_relation' \
                 '      WHERE catalog_id1 = c.id AND catalog_id2 = %s' \
                 '      AND type = %s)'
        params = (*params, includes_id, child_rel,)
    if type_ids:
        where += ' AND ('
        first = True
        for t in type_ids:
            if not first:
                where += ' OR '
            where += ' c.type = %s'
            params = (*params, t,)
            first = False
        where += ')'
    if catalog_not_type != -1:
        where += ' AND c.type <> %s'
        params = (*params, catalog_not_type)
    if noparent:
        where += ' AND NOT EXISTS (SELECT 1 FROM catalog_relation' \
                 '      WHERE catalog_id2 = c.id AND type = %s)'
        params = (*params, noparent_rel)
    if title:
        # TODO: spaces are not supported in the template?
        where += ' AND (c.title LIKE %s OR c.title_eng LIKE %s)'
        params = (*params, '%' + title + '%', '%' + title + '%')

    if storage_item_id != -1:
        where += ' AND EXISTS (SELECT 1 FROM catalog_item_relation' \
                 '      WHERE catalog_id = c.id AND item_id = %s AND type = %s)'
        params = (*params, storage_item_id, Relation.REL_STORES,)

    #print(query + where + suffix)
    #print(params)
    return {"query":query + where + suffix, "params":params}

@bp.route('/_filtered_list')
def _filtered_list():
    q = filtered_query(request.args, False)
    cursor = get_db_cursor()
    cursor.execute(q['query'], q['params'])
    result = cursor.fetchall()

    return jsonify(result)

@bp.route('/_filtered_count')
def _filtered_count():
    q = filtered_query(request.args, True)
    cursor = get_db_cursor()
    cursor.execute(q['query'], q['params'])
    result = cursor.fetchone()

    return jsonify(result)

@bp.route('/_images')
def _images():
    id = request.args.get('id', -1, type=int)
    return jsonify(get_catalog_images(id))

@bp.route('/_attachments')
def _attachments():
    id = request.args.get('id', -1, type=int)
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT att.id, att.filename, att.description'
        ' FROM catalog c JOIN catalog_attribute a ON c.id = a.catalog_id'
        ' JOIN attachment att ON a.value_id = att.id'
        ' WHERE a.type = %s AND c.id = %s',
        (Attribute.ATTR_ATTACH, id,)
    )
    return jsonify(cursor.fetchall())

@bp.route('/_upload_image', methods=('POST',))
@login_required
@admin_required
def _upload_image():
    id = request.form.get('id', -1, type=int)
    get_catalog(id)

    if 'file' not in request.files:
        return abort(400)

    file = request.files['file']
    if file:
        file_id = upload_image(file, request.form.get('desc'))
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
            ' VALUES (%s, %s, %s)',
            (Attribute.ATTR_IMAGE, id, file_id,)
        )
        db_commit()
        cursor.execute('SELECT id, filename FROM image WHERE id = %s',
            (file_id,))
        return jsonify(cursor.fetchone())

    return abort(400)

@bp.route('/_upload_file', methods=('POST',))
@login_required
@admin_required
def _upload_file():
    id = request.form.get('id', -1, type=int)
    get_catalog(id)

    if 'file' not in request.files:
        return abort(400)

    file = request.files['file']
    if file:
        file_id = upload_file(file, request.form.get('desc'))
        cursor = get_db_cursor()
        cursor.execute(
            'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
            ' VALUES (%s, %s, %s)',
            (Attribute.ATTR_ATTACH, id, file_id,)
        )
        db_commit()
        cursor.execute('SELECT id, filename FROM attachment WHERE id = %s',
            (file_id,))
        return jsonify(cursor.fetchone())

    return abort(400)

@bp.route('/_delete_image')
@login_required
@admin_required
def _delete_image():
    id = request.args.get('id', -1, type=int)
    get_catalog(id)

    img = request.args.get('img', -1, type=int)

    if img == -1:
        return abort(400)

    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM catalog_attribute WHERE type = %s'
        ' AND catalog_id = %s AND value_id = %s',
        (Attribute.ATTR_IMAGE, id, img,)
    )
    db_commit()

    return jsonify(result='success')

# input: id + json
# json: {[id] = {internal, use} ...}
@bp.route('/_own', methods=('POST',))
@login_required
def _own():
    id = int(request.args['id'])
    catalog = get_catalog(id)

    if not catalog['is_physical'] and not catalog['is_kit']:
        abort(403)

    collection = get_user_collection(g.user['id'])
    try:
        main = request.json["-1"]
        iid = ''
        if 'internal' in main:
            iid = main['internal']
        cursor = get_db_cursor()
        item_id = add_ownership(cursor, id, iid, collection['id'])

        for xxx, attr in request.json.items():
            subitem = attr['id']
            subid = int(subitem)
            if id == subid:
                continue
            if attr['use']:
                # assert that catalog item exists
                get_catalog(subid)
                iid = ''
                if 'internal' in attr:
                    iid = attr['internal']
                subitem_id = add_ownership_all(cursor, subid, iid, collection['id'])
                cursor.execute(
                    'INSERT INTO item_relation (item_id1, item_id2, type)'
                    ' VALUES (%s, %s, %s)',
                    (item_id, subitem_id, Relation.REL_INCLUDES)
                )

        db_commit()
    except:
        db_rollback()
        abort(500)

    return jsonify(result='success')

@bp.route('/_update', methods=('POST',))
@login_required
def _update():
    id = int(request.args['id'])
    catalog = get_catalog(id)
    try:
        field = request.json['field']
        value = request.json['value']
        if field not in ['title', 'title_eng', 'description',
            'year']:
            abort(403)
        if field == 'year':
            year = int(value)
            if year < 1500 or year > 2100:
                abort(403)
        cursor = get_db_cursor()
        # field is validated, use concatenation here
        cursor.execute(
            'UPDATE catalog SET ' + field + ' = %s WHERE id = %s',
            (value, id)
        )
        if not g.user['admin']:
            cursor.execute(
                'INSERT INTO catalog_history'
                ' (catalog_id, user_id, field, value, old_value)'
                ' VALUES (%s, %s, %s, %s, %s)',
                (id, g.user['id'], field, value, catalog[field])
            )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_create', methods=('POST',))
@login_required
def _create():
    error = None
    type_id = Type.get_id(request.json['type'])
    if type_id == -1:
        error = 'Invalid type'
    title = request.json['title']
    title_eng = request.json['title_eng']
    description = request.json['description']
    year = None
    if request.json['year'] != '':
        try:
            year = int(request.json['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year'
        except:
            error = 'Invalid year'

    try:
        parent_id = int(request.json['parent'])
        parent = get_catalog(parent_id)
        root_id = get_catalog_root(parent_id)
        # parent is itself a root
        if root_id == -1:
            root_id = parent_id
            #parent_id = -1
    except:
        error = 'Invalid parent id'

    # override root, if specified
    try:
        id = int(request.json['root'])
        #print(id)
        if id != -1:
            root = get_catalog(id)
            #print(root)
            if root['is_group'] == 0:
                raise Exception
            root_id = id
    except:
        error = 'Invalid root id'

    if parent['is_group'] != 1 and type == Type.TYPE_ABSTRACT:
        error = 'Cannot add group not to group'

    if title_eng is None or title_eng == "":
        error = 'title_eng is required'

    if error is not None:
        print(error)
        abort(403, error)

    try:
        cursor = get_db_cursor()
        catalog_id = create_catalog(cursor,
            type_id, title, title_eng, description, year, root_id)

        if parent_id != -1:
            cursor.execute(
                'INSERT INTO catalog_relation'
                ' (catalog_id1, catalog_id2, type)'
                ' VALUES (%s, %s, %s)',
                (parent_id, catalog_id, Relation.REL_INCLUDES)
            )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success', id=catalog_id)

@bp.route('/_create_modification', methods=('POST',))
@login_required
def _create_modification():
    error = None
    id = int(request.args['id'])
    catalog = get_catalog(id)
    title = request.json['title']
    title_eng = request.json['title_eng']
    description = request.json['description']
    year = None
    if request.json['year'] != '':
        try:
            year = int(request.json['year'])
            if year < 1500 or year > 2100:
                error = 'Invalid year'
        except:
            error = 'Invalid year'

    if title_eng is None or title_eng == "":
        error = 'title_eng is required'

    if error is not None:
        abort(403)

    try:
        cursor = get_db_cursor()
        catalog_id = create_catalog(cursor,
            catalog['type'], title, title_eng, description,
            year, get_catalog_root(id))

        cursor.execute(
            'INSERT INTO catalog_relation'
            ' (catalog_id1, catalog_id2, type)'
            ' VALUES (%s, %s, %s)',
            (id, catalog_id, Relation.REL_MODIFICATION)
        )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_create_kit', methods=('POST',))
@login_required
def _create_kit():
    id = int(request.args['id'])
    catalog = get_catalog(id)
    # TODO
    if not catalog['is_physical'] and catalog['root_title'] != 'Software':
        abort(403)

    kit_type = Type.TYPE_KIT

    title = request.json['title']
    title_eng = request.json['title_eng']
    if not title_eng:
        abort(403)

    try:
        cursor = get_db_cursor()

        cursor.execute('SELECT id FROM catalog WHERE title_eng = "Kit"')
        root = cursor.fetchone()

        kit_id = create_catalog(cursor,
            kit_type, title, title_eng, '', None,
            root['id'])

        # Add main item into the kit
        cursor.execute(
            'INSERT INTO catalog_relation'
            ' (catalog_id1, catalog_id2, type)'
            ' VALUES (%s, %s, %s), (%s, %s, %s)',
            (kit_id, id, Relation.REL_INCLUDES,
             kit_id, id, Relation.REL_MAIN_ITEM,)
        )

        # for item in request.json['items']:
        #     title_item = item['title']
        #     item_id = create_catalog(cursor,
        #         Type.TYPE_PHYSICAL, title_item, '', '', None, catalog['company_id'])
        #     cursor.execute(
        #         'INSERT INTO catalog_relation'
        #         ' (catalog_id1, catalog_id2, type)'
        #         ' VALUES (%s, %s, %s)',
        #         (kit_id, item_id, Relation.REL_INCLUDES,)
        #     )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

@bp.route('/_relation_remove', methods=('POST',))
@admin_required
def _relation_remove():
    id1 = int(request.json['id1'])
    id2 = int(request.json['id2'])
    rel = request.json['rel']
    rel_id = -1
    if rel == 'includes':
        rel_id = Relation.REL_INCLUDES
    elif rel == 'compatible':
        rel_id = Relation.REL_COMPATIBLE
    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM catalog_relation'
        ' WHERE catalog_id1=%s AND catalog_id2=%s AND type=%s',
        (id1, id2, rel_id,)
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/_family_add', methods=('POST',))
@admin_required
def _family_add():
    id1 = int(request.json['id1'])
    id2 = int(request.json['id2'])

    # assert the ids
    get_catalog(id1)
    get_catalog(id2)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
        ' VALUES (%s, %s, %s)',
        (id1, id2, Relation.REL_INCLUDES,)
    )

    # TODO: correct roots?

    db_commit()
    return jsonify(result='success')

@bp.route('/_compatible_add', methods=('POST',))
@admin_required
def _compatible_add():
    id1 = int(request.json['id1'])
    id2 = int(request.json['id2'])

    # assert the ids
    get_catalog(id1)
    get_catalog(id2)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
        ' VALUES (%s, %s, %s)',
        (id1, id2, Relation.REL_COMPATIBLE,)
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/_software_add', methods=('POST',))
@admin_required
def _software_add():
    id = int(request.json['id'])
    software = int(request.json['software'])

    # assert the ids
    get_catalog(id)
    soft = get_catalog(software)
    if soft['type'] != Type.TYPE_BITS:
        abort(403)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
        ' VALUES (%s, %s, %s)',
        (id, software, Relation.REL_STORES,)
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/_subitem_add', methods=('POST',))
@admin_required
def _subitem_add():
    id = int(request.json['id'])
    subitem = int(request.json['subitem'])

    # assert the ids
    main = get_catalog(id)
    get_catalog(subitem)
    if not main['is_kit'] and not main['is_group']:
        abort(403)

    # assert that this does not create a loop
    if not check_parent_loops(id, subitem) or id == subitem:
        # TODO: return readable error
        abort(403)

    cursor = get_db_cursor()
    cursor.execute(
        'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
        ' VALUES (%s, %s, %s)',
        (id, subitem, Relation.REL_INCLUDES,)
    )
    db_commit()
    return jsonify(result='success')

@bp.route('/_company_set', methods=('POST',))
@admin_required
def _company_set():
    id1 = int(request.json['id1'])
    id2 = int(request.json['id2'])

    # assert the ids
    get_catalog(id2)

    cursor = get_db_cursor()
    cursor.execute(
        'DELETE FROM catalog_relation'
        ' WHERE catalog_id2=%s AND type=%s',
        (id2, Relation.REL_PRODUCED,)
    )
    if id1 != -1:
        get_catalog(id1)
        cursor.execute(
            'INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)'
            ' VALUES (%s, %s, %s)',
            (id1, id2, Relation.REL_PRODUCED,)
        )
    db_commit()
    return jsonify(result='success')

@bp.route('/_set_logo', methods=('POST',))
@login_required
@admin_required
def _set_logo():
    try:
        id = int(request.form['id'])
        get_catalog(id)

        file = request.files['file']
        file_id = upload_image(file, width=64, height=64)
        if file_id is None:
            # Only 64x64 images can be used as a logo
            abort(400)

        cursor = get_db_cursor()
        cursor.execute(
            'DELETE FROM catalog_attribute'
            ' WHERE type=%s AND catalog_id=%s',
            (Attribute.ATTR_LOGO, id,)
        )
        cursor.execute(
            'INSERT INTO catalog_attribute (type, catalog_id, value_id)'
            ' VALUES (%s, %s, %s)',
            (Attribute.ATTR_LOGO, id, file_id,)
        )
        db_commit()
    except:
        db_rollback()
        abort(403)

    return jsonify(result='success')

def success():
    return jsonify(result="success", error="")

def error(err):
    return jsonify(result="error", error=err)

@bp.route('/_join', methods=('POST',))
@login_required
@admin_required
def _join():
    data = request.get_json(force=True)
    cursor = get_db_cursor()
    try:
        id1 = int(data['id1'])
        id2 = int(data['id2'])
        if id1 == id2:
            return error("can't join the item with itself")

        title = data['title']
        title_eng = data['title_eng']
        year = data['year']
        description = data['description']

        if not title_eng or title_eng == '':
            return error("title_eng wasn't specified")
        if not title or title == '':
            title = title_eng

        if year == '':
            year = None

        # assert that catalog items exist
        c1 = get_catalog(id1)
        c2 = get_catalog(id2)

        if c1['company_id'] != c2['company_id']:
            return error("TODO: companies should match")

        if c1['root'] != c2['root']:
            return error("roots should match")

        if c1['type'] != c2['type']:
            return error("types should match")

        if get_catalog_logo_own(id1) or get_catalog_logo_own(id2):
            return error("TODO: can't join items with logo")

        cursor.execute('SELECT * FROM catalog_relation'
            ' WHERE catalog_id1 = %s AND catalog_id2 = %s',
            (id1, id2,))
        if cursor.fetchone():
            return error("items relate to each other")

        cursor.execute('SELECT * FROM catalog_relation'
            ' WHERE catalog_id1 = %s AND catalog_id2 = %s',
            (id2, id1,))
        if cursor.fetchone():
            return error("items relate to each other")

        cursor.execute('SELECT * FROM page_catalog_section'
            ' WHERE parent = %s OR parent = %s',
            (id1, id2,))
        if cursor.fetchone():
            return error("can't join page directory items")

        # Set new parameters of the catalog item
        cursor.execute(
            'UPDATE catalog SET title = %s, title_eng = %s, description = %s,'
            ' year = %s'
            ' WHERE id = %s',
            (title, title_eng, description, year, id1,)
        )

        # Redirect items
        cursor.execute(
            'UPDATE item SET catalog_id = %s WHERE catalog_id = %s',
            (id1, id2, )
        )

        # Redirect attributes
        cursor.execute(
            'UPDATE catalog_attribute SET catalog_id = %s WHERE catalog_id = %s',
            (id1, id2, )
        )

        # Delete duplicate relations
        for rel in range(Relation.REL_END):
            cursor.execute(
                'DELETE FROM catalog_relation WHERE catalog_id1 = %s AND type = %s'
                ' AND catalog_id2 IN (SELECT DISTINCT catalog_id2 FROM'
                                    ' (SELECT * FROM catalog_relation'
                                    ' WHERE catalog_id1 = %s AND type = %s) AS tmp)',
                (id2, rel, id1, rel,)
            )
            cursor.execute(
                'DELETE FROM catalog_relation WHERE catalog_id2 = %s AND type = %s'
                ' AND catalog_id1 IN (SELECT DISTINCT catalog_id1 FROM'
                                    ' (SELECT * FROM catalog_relation'
                                    ' WHERE catalog_id2 = %s AND type = %s) AS tmp)',
                (id2, rel, id1, rel,)
            )

        # Redirect relations
        cursor.execute(
            'UPDATE catalog_relation SET catalog_id1 = %s WHERE catalog_id1 = %s',
            (id1, id2, )
        )
        cursor.execute(
            'UPDATE catalog_relation SET catalog_id2 = %s WHERE catalog_id2 = %s',
            (id1, id2, )
        )

        # Redirect catalog history
        cursor.execute(
            'UPDATE catalog_history SET catalog_id = %s WHERE catalog_id = %s',
            (id1, id2, )
        )

        # Redirect catalog item relations
        cursor.execute(
            'UPDATE catalog_item_relation SET catalog_id = %s WHERE catalog_id = %s',
            (id1, id2, )
        )

        # Redirect comment relations
        cursor.execute(
            'UPDATE catalog_comment SET ref_id = %s WHERE ref_id = %s',
            (id1, id2, )
        )

        # Delete old catalog item
        cursor.execute('DELETE FROM catalog WHERE id = %s', (id2,))

        # Commit all the changes
        db_commit()

    except:
        db_rollback()
        return error("uknown error")

    return success()

###############################################################################
# Routes
###############################################################################

# @bp.route('/<int:id>/_delete')
# @login_required
# @admin_required
# def _delete(id):
#     # assert id is correct
#     catalog = get_catalog(id)

#     cursor = get_db_cursor()
#     # delete attributes
#     cursor.execute(
#         'DELETE FROM catalog_attribute WHERE catalog_id = %s',
#         (id,)
#     )
#     # delete relations
#     cursor.execute(
#         'DELETE FROM catalog_relation WHERE catalog_id1 = %s OR catalog_id2 = %s',
#         (id, id,)
#     )
#     # delete item
#     cursor.execute('DELETE FROM catalog WHERE id = %s', (id,));

#     # TODO: delete child items for the kit?

#     db_commit()

#     return redirect(url_for('catalog.index'))
