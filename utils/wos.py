from bs4 import BeautifulSoup
from urllib.request import urlopen, Request
import string
import re
import sys

companies = set()
families = set()
machines = set()
games = []

def wos(url):
    req = Request(url, headers={'User-Agent' : "Magic Browser"}) 
    page = urlopen( req )
    soup = BeautifulSoup(page, "html5lib")

    for a in soup.pre.find_all("a"):
        link = "http://www.worldofspectrum.org" + a.attrs["href"]
        name = a.next
        req = Request(link, headers={'User-Agent' : "Magic Browser"}) 
        fullpage = BeautifulSoup(urlopen(req), "html5lib")
        t = fullpage.find_all(string="Full title")
        table = t[0].parent.parent.parent.parent
        print("# game: ", name)
        company = ""
        family = ""
        machine = ""
        year = ""
        desc = "|Information|  |\n|---|---|\n"
        for row in table.find_all("tr"):
            td = row.td
            if td:
                field = td.get_text().strip()
                value = td.next_sibling.get_text().strip()
                if field != "Score":
                    desc = desc + "|" + field + "|" + value.replace("\n", "<br/>") + "|\n"
                    if field == "Publisher":
                        company = value
                    elif field == "Type":
                        family = value
                    elif field == "Machine type":
                        machine = value
                    elif field == "Year of release":
                        year = value

        desc = desc + "\n\n" + link + ""

        if company not in companies:
            companies.add(company)
        if family not in families:
            families.add(family)
        if machine not in machines:
            machines.add(machine)
        games.append({"name":name, "company":company, "desc":desc,
                      "family": family, "machine":machine, "year": year})


if len(sys.argv) < 2:
    exit

page = sys.argv[1]

#wos('http://www.worldofspectrum.org/games/' + page + '.html')
wos('http://www.worldofspectrum.org/textadv/' + page + '.html')

#f = open("wos_" + page + ".py", "w")
f = open("wos_adv_" + page + ".py", "w")

f.write("# families\n")
f.write("families = %s\n" % families)
f.write("# machines\n")
f.write("machines = %s\n" % machines)
f.write("# companies\n")
f.write("companies = %s\n" % companies)
f.write("# games\n")
f.write("games = %s\n" % games)

f.close()
