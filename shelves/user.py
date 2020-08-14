from shelves.db import get_db_cursor

def get_user(id):
    cursor = get_db_cursor()
    cursor.execute(
        'SELECT user.id as id, username, admin, collection.id as col_id,'
        ' email FROM user '
        ' LEFT JOIN collection ON user.id = collection.owner_id'
        ' WHERE user.id = %s',
        (id,)
    )
    return cursor.fetchone()
