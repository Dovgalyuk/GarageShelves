from bs4 import BeautifulSoup
from urllib.request import urlopen

page = urlopen("http://www.museo8bits.com/menu2.php?mn=Marca")
soup = BeautifulSoup(page, "html5lib")

for tag in soup.body:
    if tag.name == 'table':
        print('M:' + tag.string)
    if tag.name == 'p':
        name = tag.string
        url = ''
        if tag.a:
            url = tag.a['href']
        print('C:' + name + ' ' + url)
