from flask_nav import Nav
from flask_nav.elements import Navbar, View, Separator, Text, Subgroup
from flask import (
    g
)

nav = Nav()

@nav.navigation()
def shelvesnavbar():
    concepts = View("All concepts", "concept.index")
    if g.user is None:
        collection = View("All collections", "collection.index")
        register = View("Register", "auth.register")
        login = View("Log in", "auth.login")
        profile = Text("")
    else:
        collection = View("My collection", "collection.view", id=g.user['id'])
        register = Text(g.user['username'])
        login = View("Log out", "auth.logout")
        profile = View("Profile", "auth.profile")
    return Navbar(
        'Garage shelves',
        View('Home', 'index'),
        collection,
        concepts,
        register,
        login,
        profile,
    )
