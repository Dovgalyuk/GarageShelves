import os

machines_all = set()
games_all = []
companies_all = set()
families_all = set()

def update():
    machines_all.update(machines)
    companies_all.update(companies)
    families_all.update(families)
    for game in games:
        try:
            y = int(game['year'])
        except:
            y = -1
        if y < 1900 or y > 2100:
            game['year'] = None
        if game['company'] == 'unknown':
            game['company'] = None
        games_all.append(game)

        # if m == 'ZX Spectrum 48K':
        #     m = 'ZX Spectrum 48k'
        # elif m == 'ZX Spectrum 128K':
        #     m = 'ZX Spectrum 128k'
        # else
        #     print("Unsupported machine ", m)

names = "1abcdefghijklmnopqrstuvwxyz"
for n in names:
    exec(open("wos_" + n + ".py").read())
    update()
    exec(open("wos_adv_" + n + ".py").read())
    update()

print("machines = ", machines_all)
print("families = ", families_all)
print("companies = ", companies_all)
print("games = ", games_all)
