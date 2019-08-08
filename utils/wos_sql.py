def fixDesc(desc):
    dd = desc.split("|")
    dd.pop(0)
    z = []
    for d in dd[:-1]:
        z.append('|')
        if d != "\n":
            d = d.replace("\n", "<br/>")
        z.append(d)
    z.append('|')
    last = dd[-1]
    last = "\n\n" + last[4:-1]
    z.append(last)
    return ''.join(z)

def outFamilies():
    print('SET @family = (SELECT id FROM catalog_type WHERE title="Software family");')
    print('SET @game = (SELECT id FROM catalog WHERE title_eng="Game" AND type_id=@family);')
    for family in families:
        print('INSERT INTO catalog (type_id, title_eng, description) VALUES (@family, "%s", "");' % (family))
        print('SET @f = LAST_INSERT_ID();')
        print('INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)' \
            ' VALUES (@game, @f, 1);')

def outCompanies():
    for company in companies:
        print('INSERT INTO company (title) VALUES ("%s");'
              % company.replace("\"", "\\\""))

# def outMachines():
#     print('SET @zx = (SELECT id FROM catalog WHERE title_eng="ZX Spectrum");')
#     print('SET @family = (SELECT id FROM catalog_type WHERE title="Computer family");')
#     for machine in machines:
#         print('INSERT INTO catalog (type_id, title_eng, description) VALUES (@family, "%s", "");' % (machine))
#         print('SET @f = LAST_INSERT_ID();')
#         print('INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)' \
#             ' VALUES (@zx, @f, 1);')

def outRelMachine(m):
    print('SET @mach = (SELECT id FROM catalog WHERE title_eng="%s" LIMIT 1);' % m)
    print('INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)' \
          ' VALUES (@mach, @game, 5);')

def outGames():
    print('SET @soft = (SELECT id FROM catalog_type WHERE title="Software");')
    for game in games:
        comp = game['company']
        if comp:
            comp = comp.replace('\"', "\\\"")
        print('SET @comp = (SELECT id FROM company WHERE title="%s" LIMIT 1);'
            % comp)
        y = game['year']
        if y is None:
            y = "NULL"
        name = game['name'].replace('\"', "\\\"")
        desc = fixDesc(game['desc']).replace('\"', "\\\"")
        print('INSERT INTO catalog (type_id, title_eng, description, company_id, year)' \
                ' VALUES (@soft, "%s", "%s", @comp, %s);' \
                    % (name, desc, y))
        print('SET @game = LAST_INSERT_ID();')
        # family
        print('SET @fam = (SELECT id FROM catalog WHERE title_eng="%s" LIMIT 1);' % (game['family']))
        print('INSERT INTO catalog_relation (catalog_id1, catalog_id2, type)' \
            ' VALUES (@fam, @game, 1);')
        # machine
        m = game['machine']
        if m == 'ZX Spectrum 48K/128K':
            outRelMachine('ZX Spectrum 128k')
            outRelMachine('ZX Spectrum 48k')
        elif m == 'ZX Spectrum 128 +3':
            outRelMachine('ZX Spectrum +3')
        elif m == 'Pentagon 128':
            outRelMachine('Pentagon 128')
        elif m == 'ZX Spectrum 48K':
            outRelMachine('ZX Spectrum 48k')
        elif m == 'ZX Spectrum 128K (load in USR0 mode)':
            outRelMachine('ZX Spectrum 128k')
        elif m == 'ZX Spectrum 128 +2A/+3':
            outRelMachine('ZX Spectrum +2A')
            outRelMachine('ZX Spectrum +3')
        elif m == 'ZX Spectrum +2A':
            outRelMachine('ZX Spectrum +2A')
        elif m == 'ZX Spectrum 126':
            outRelMachine('ZX Spectrum 128k')
        elif m == 'ZX Spectrum 16K':
            outRelMachine('ZX Spectrum 16k')
        elif m == 'ZX Spectrum 16K/48K':
            outRelMachine('ZX Spectrum 16k')
            outRelMachine('ZX Spectrum 48k')

exec(open("wos_all.py").read())

outCompanies()
outFamilies()
#outMachines()
outGames()
