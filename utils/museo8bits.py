from bs4 import BeautifulSoup
from urllib.request import urlopen
import re

page = urlopen("http://www.museo8bits.com/menu2.php?mn=Marca")
soup = BeautifulSoup(page, "html5lib")

print('SET @type = (SELECT id FROM catalog_type WHERE title="Computer");')

for tag in soup.body:
    if tag.name == 'table':
        print('INSERT INTO company (title) VALUES ("%s");' % tag.string)
        print('SET @comp = LAST_INSERT_ID();')
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
                    for t in soup2.find_all(True):
                        if re.match('\sLanzamiento', str(t.string)):
                            year = t.next_element.next_element.next_element.next_element.td.a.string
                            break
            except:
                print('; Invalid URL: ' + href)
                desc = ''
        print('INSERT INTO catalog (type_id, title, description, company_id, year)' \
            ' VALUES (@type, "%s", "%s", @comp, "%s");' % (name, desc, year) )
