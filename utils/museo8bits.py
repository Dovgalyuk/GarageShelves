from bs4 import BeautifulSoup
from urllib.request import urlopen
import string
import re

companies = {}

def get_id(name):
    return ''.join(name.split()).upper()

def museo8():
    page = urlopen("http://www.museo8bits.com/menu2.php?mn=Marca")
    soup = BeautifulSoup(page, "html5lib")

    for tag in soup.body:
        if tag.name == 'table':
            company = get_id(tag.string)
            companies[company] = { '_name': tag.string }
        if tag.name == 'p':
            name = tag.string
            desc = ''
            year = 'NULL'
            if tag.a:
                href = 'http://www.museo8bits.com/' + tag.a['href']
                desc = '<' + href + '>'
                # parse computer page if possible
                try:
                    with urlopen(href) as page2:
                        soup2 = BeautifulSoup(page2, "html5lib")
                        for t in soup2.find_all(string=re.compile('\sLanzamiento')):
                            year = t.parent.parent.next_sibling.next_sibling.td.a.string
                            break
                except:
                    desc = ''
            companies[company][get_id(name)] = { 'title': name, 'year': year, 'desc': desc }

def old_computers(url, console):
    for letter in string.ascii_lowercase + string.digits:
        page = urlopen(url + letter)
        soup = BeautifulSoup(page, 'html5lib')
        for t in soup.find_all(string=re.compile('SYSTEMS STARTING WITH.*'))[0].parent.next_siblings:
            if t.name == 'table':
                params = t.find_all('a')
                title = params[1].string
                desc = '<http://www.old-computers.com/museum/' + params[1]['href'] + '>'
                company = params[2].string.strip()
                try:
                    year = params[3].string
                    if not re.match('[0-9]{4}', year):
                        year = 'NULL'
                except:
                    year = 'NULL'
                company_id = get_id(company)
                system_id = get_id(title)
                if company_id not in companies:
                    companies[company_id] = { '_name': company }
                if system_id in companies[company_id]:
                    companies[company_id][system_id]['desc'] += desc
                    if companies[company_id][system_id]['year'] == 'NULL':
                        companies[company_id][system_id]['year'] = year
                else:
                    companies[company_id][system_id] = { 'title': title, 'year': year, 'desc': desc }
                if console:
                    companies[company_id][system_id]['console'] = True

def out_sql():
    print('SET @computer = (SELECT id FROM catalog_type WHERE title="Computer");')
    print('SET @console = (SELECT id FROM catalog_type WHERE title="Console");')
    for company, items in companies.items():
        print('INSERT INTO company (title) VALUES ("%s");' % items['_name'])
        print('SET @comp = LAST_INSERT_ID();')
        for name, params in items.items():
            if name != '_name':
                t = '@computer'
                if 'console' in params:
                    t = '@console'
                print('INSERT INTO catalog (type_id, title, description, company_id, year)' \
                    ' VALUES (%s, "%s", "%s", @comp, "%s");' % (t, params['title'], params['desc'], params['year']) )

museo8()
old_computers('http://www.old-computers.com/museum/name.asp?st=1&l=', False)
old_computers('http://www.old-computers.com/museum/name.asp?st=2&l=', True)
old_computers('http://www.old-computers.com/museum/name.asp?st=3&l=', True)
#print(companies)
out_sql()
