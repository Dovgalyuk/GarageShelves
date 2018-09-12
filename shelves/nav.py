from flask_nav import Nav
from flask_nav.elements import Navbar, View, Separator, Text, Subgroup
from flask import (
    g
)
import sys

nav = Nav()

@nav.navigation()
def shelvesnavbar():
    caption = 'Garage shelves'
    home = View('Home', 'index')
    catalogs = View("Catalog", "catalog.index")
    companies = View("Companies", "company.index")
    collections = View("All collections", "collection.index")
    if g.user is None:
        return Navbar(
            caption,
            home,
            collections,
            catalogs,
            companies,
            View("Register", "auth.register"),
            View("Log in", "auth.login")
        )
    else:
        return Navbar(
            caption,
            home,
            collections,
            View("My collection", "collection.view", id=g.user['id']),
            catalogs,
            companies,
            Text(g.user['username']),
            View("Log out", "auth.logout"),
            View("Profile", "auth.profile")
        )
