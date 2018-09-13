SET @computer = (SELECT id FROM catalog_type WHERE title="Computer");
SET @console = (SELECT id FROM catalog_type WHERE title="Console");
SET @comp = (SELECT id FROM company WHERE title = "INDUSTRIA ARGENTINA");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "ACTIVISION FAMILY GAME", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1137>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "GORENJE");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "GETI-3220", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1120>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Robotron");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "1715", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "KC 85/1 - HC 9001", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Sanyo");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MBC-1150, MBC-1250", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "brd");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "DOLPHIN", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Audiosonic");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELE-SPORTS IV", "<http://www.old-computers.com/museum/computer.asp?st=2&c=761>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "BINATONE");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "COLOUR TV GAME 4 PLUS 2 (MODEL N° 01 / 4850)", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1032>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "COLOUR TV GAME MK 6 (MODEL N° 01 / 4761)", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1115>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Tesla");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PMI-80", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1016>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Körting");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELE-VIDEO-COMPUTER TVC 4000", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1148>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Unitron (Brasil)");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MAC 512", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Panasonic");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "FS A1 WX / WSX", "<http://www.old-computers.com/museum/computer.asp?st=1&c=621>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Epson");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "HC", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "HC-88 / GENEVA", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "HC 40", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Oki");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if 386 AX 21L(if NOTE)", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if800 model 60", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if800 RX 120F", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if 386 AX 51L", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if800 model 50", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if COM 7H (GA701H)", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "if 386 AX 45L(if NOTE)", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Talent Telematica");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Talent TPC-310 MSX2", "<http://www.museo8bits.com/talent_tpc310.htm>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Orange");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "2", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Merlin");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "M4000", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1258>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "TRIUMPH ADLER");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ALPHATRONIC", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TA-1600", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1304>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ALPHATRONIC MODELL-P3 / P4", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Commodore");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TV GAME 2000K", "<http://www.old-computers.com/museum/computer.asp?st=3&c=676>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "64 G", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "64 ALDI", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "INGERSOLL");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "XK 410C", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1165>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "UNIVERSUM");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TV MULTI-SPIEL (HANDHELD)", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1104>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "MULTISPIEL 2006", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1299>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SANWA");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "9015", "<http://www.old-computers.com/museum/computer.asp?st=2&c=725>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Goldstar");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "FC-200", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Nec");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PC 8801 FA", "<http://www.old-computers.com/museum/computer.asp?st=1&c=399>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "TELENG");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "COLOURSTARS", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1199>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Canon");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Canon V-30 MSX2", "<http://www.museo8bits.com/canon_v30.htm>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "CX-1", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Olivetti");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti ETV 260", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti PCS 86", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Editor S-14", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti M 21", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti M24", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Davinci", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Envison", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "P6040", "<http://www.old-computers.com/museum/computer.asp?st=1&c=836>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Prodest PC128", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti PCS 286", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti M240", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti M19", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti M 15 laptop", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Prodest PC128s", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Programma 101", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti ECHOS", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ETS 1010", "<http://www.old-computers.com/museum/computer.asp?st=1&c=491>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti M 20", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti P 6060", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Olivetti Philos", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MODEL 006A", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Microdigital");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TK3000", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TK-90", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "BRASCOM");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "BR-1000", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SIXPLAY");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "SIXPLAY", "<http://www.old-computers.com/museum/computer.asp?st=3&c=918>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "ADDS");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "M2000", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "CABEL");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "UNIVERSAL GAME COMPUTER", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1166>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "VELEBIT");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ORAO", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "GALEB", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Gakken");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TV-BOY", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "ADD-X Système");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "SMP-5", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "SMP-8", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SNK");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Neo Geo", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Neo Geo CD", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "PALLADIUM");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "VIDEO-COMPUTER-GAME", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1223>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELE-PLAY SR", "<http://www.old-computers.com/museum/computer.asp?st=3&c=735>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Thomson");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Thomson TO 8 D", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Thomson TO 9", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Thomson TO 8", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Thomson TO 9 +", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Thomson MO 6", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Thomson TO 16", "", @comp);
; Junio 1984
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Thomson TO 7 70", "<http://www.museo8bits.com/to770.htm>", @comp, 1984);
SET @comp = (SELECT id FROM company WHERE title = "CODIMEX");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "809", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Billings");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "BC-12", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1046>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "POLYCON");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "PG 7 (PROGRAMMABLE TV GAMES)", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1128>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Fujitsu");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "FM 77 LEVEL 2", "<http://www.old-computers.com/museum/computer.asp?st=1&c=376>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "FM 77 AV SX", "<http://www.old-computers.com/museum/computer.asp?st=1&c=375>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "FM 77 LEVEL 4", "<http://www.old-computers.com/museum/computer.asp?st=1&c=327>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Rollet");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "KC 87", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "VIDEO SECAM SYSTEM (4/303)", "<http://www.old-computers.com/museum/computer.asp?st=2&c=984>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Toshiba");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PC COMPATIBLE LAPTOPS", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "HX-20", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MULTITECH");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MPF 3", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MPF 2", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MPF-1B", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MICROKIT 09", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1133>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MAGNAVOX");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ODYSSEY²", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "PROF80");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PROF80", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Nintendo");
; 21 de Marzo de 2001
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Nintendo Gameboy Advance", "<http://www.museo8bits.com/gba.htm>", @comp, 2001);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Clonicas NES ( Famiclones )", "", @comp);
; 14 de Febrero de 2003
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Nintendo Gameboy Advance SP", "<http://www.museo8bits.com/gbasp.htm>", @comp, 2003);
SET @comp = (SELECT id FROM company WHERE title = "MARQUETTE ELECTRONICS");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "8000 HOLTER SYSTEM", "<http://www.old-computers.com/museum/computer.asp?st=1&c=458>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "ASAFLEX");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "6", "<http://www.old-computers.com/museum/computer.asp?st=3&c=658>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Pioneer");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Pioneer LaserActive", "<http://www.museo8bits.com/laseractive.htm>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Sord");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "M343", "<http://www.old-computers.com/museum/computer.asp?st=1&c=220>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "CONCEPT 2000");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "SPECTRUM 6", "<http://www.old-computers.com/museum/computer.asp?st=3&c=677>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Rockwell");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "KC 87", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Franklin");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ACE 2000", "<http://www.old-computers.com/museum/computer.asp?st=1&c=769>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "NOVOTON");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TJ-141", "<http://www.old-computers.com/museum/computer.asp?st=3&c=865>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Amstrad");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PCW 8256 / 8512", "<http://www.old-computers.com/museum/computer.asp?st=1&c=189>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Amstrad Notepad NC200", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "CPC 664", "<http://www.old-computers.com/museum/computer.asp?st=1&c=112>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "CPC 6128", "<http://www.old-computers.com/museum/computer.asp?st=1&c=111>", @comp);
;  Agosto de 1993
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Amstrad PcW 10", "<http://www.museo8bits.com/pcw10.htm>", @comp, 1993);
SET @comp = (SELECT id FROM company WHERE title = "ABS");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Orb", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Hewlett Packard");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "HP-75C / 75D", "<http://www.old-computers.com/museum/computer.asp?st=1&c=640>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SCHNEIDER (COMPUDATA)");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "CPC-464", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MGT (Miles Gordon Technology)");
SET @comp = (SELECT id FROM company WHERE title = "SONICO");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "406-6 (COLOR TV SPORTS VIDEO GAME)", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1202>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "EDS");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "C64 EDC", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1086>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "ACC");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ACC 8000", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MBO");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELEBALL-CASSETTEN-GAME", "<http://www.old-computers.com/museum/computer.asp?st=2&c=748>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TELEBALL-CASSETTE 1", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Vtech (Video Technology)");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LASER 50 / ONE", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LASER 210", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LASER 100/110", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LASER 350 / 500 / 700 / 750", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LASER 3000", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LASER 310", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "128EX2", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MCM COMPUTERS");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MODEL 782 APL", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "PLAYTECH");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELESPORT", "<http://www.old-computers.com/museum/computer.asp?st=3&c=770>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Bit Corporation");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Bit Amigo", "<http://www.museo8bits.com/bit_amigo.htm>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Intertec");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "HEADSTART", "<http://www.old-computers.com/museum/computer.asp?st=1&c=349>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "TRANSAM");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TUSCAN", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Sharp");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PC-1260 / 1261 / 1262", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "PC 1500 / PC 1500A", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "INTERSTELLAR FIGHTER");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "JN-838", "<http://www.old-computers.com/museum/computer.asp?st=2&c=724>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "POLISTIL");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "V.G. 2", "<http://www.old-computers.com/museum/computer.asp?st=3&c=1198>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SCIENCE FAIR");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MICROCOMPUTER TRAINER", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1053>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "A10");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELESPIEL 9010", "<http://www.old-computers.com/museum/computer.asp?st=3&c=932>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Philips");
; ?
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Philips CDI", "<http://www.museo8bits.com/cdi.htm>", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "VG 8010", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "I.S.T.C. (Informatic Systèmes Télécom)");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "5000", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Czerweny");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "CZ-1000 PLUS", "<http://www.old-computers.com/museum/computer.asp?st=1&c=928>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SMT Goupil");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "GOUPIL 3", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "GOUPIL G4", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "GOUPIL 2", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "H.G.S. Electronic");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "TELESPORT", "<http://www.old-computers.com/museum/computer.asp?st=2&c=786>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SEIKO");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "9100", "<http://www.old-computers.com/museum/computer.asp?st=1&c=893>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Pravetz");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "IMKO-1", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Bull");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TTX-90", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "L'ATTACHÉ", "<http://www.old-computers.com/museum/computer.asp?st=1&c=751>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Apple");
; 14 de Abril de 1994
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Apple Powermac 6100", "<http://www.museo8bits.com/powermac6100.htm>", @comp, 1994);
; 23 de Marzo de 1992
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Apple Macintosh LC II", "<http://www.museo8bits.com/mac_lc2.htm>", @comp, 1992);
SET @comp = (SELECT id FROM company WHERE title = "SUN");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "SUN Sparc-Station IPX 4/50", "<http://www.museo8bits.com/sun_ipx.htm>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "V-MARC");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "88A", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1187>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MUSTANG");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "9016 TELESPIEL COMPUTER", "<http://www.old-computers.com/museum/computer.asp?st=2&c=1163>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Apollo 7");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "SQUALE", "<http://www.old-computers.com/museum/computer.asp?st=1&c=224>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Luxor");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "SPORTSMAN 2001", "<http://www.old-computers.com/museum/computer.asp?st=3&c=689>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "ACT Apricot");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "APRICOT XI", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "APRICOT F2 / F10", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "QI-300", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ACT-800", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "APRICOT PC", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "APRICOT XEN", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "APRICOT PORTABLE", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "APRICOT F1", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Sega");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Mega Drive 3", "<http://www.museo8bits.com/megadrive3.htm>", @comp);
; Noviembre de 1994
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "Sega Saturn", "<http://www.museo8bits.com/saturn.htm>", @comp, year);
SET @comp = (SELECT id FROM company WHERE title = "Psion");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Series 5mx", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Organizer", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Series 7", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Series 3c", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MC 200", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Series 5", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Workabout", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Revo", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Series 3mx", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Series 3a", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MC 600", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Organizer II", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Siena", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MC 400", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Acorn");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes A3000", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ABC 210 / CAMBRIDGE WORKSTATION", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes A7000", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ABC 110", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Model A", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "ABC 310", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes A3020", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes A5000", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Model B+", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Master Turbo", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Master 512", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes A4000", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Model B", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Archimedes A3010", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn Proton", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Master", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Risc PC", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "A4", "", @comp);
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "Acorn BBC Compact", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Fox");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "FOX-640", "<http://www.old-computers.com/museum/computer.asp?st=1&c=457>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "POPPY");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "9015", "<http://www.old-computers.com/museum/computer.asp?st=2&c=743>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "IBM");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "IBM Palm Top PC 110", "<http://www.museo8bits.com/ibm_pc110.htm>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Hitachi");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "S1", "<http://www.old-computers.com/museum/computer.asp?st=1&c=341>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "MERA-ELZAB");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "MERITUM", "<http://www.old-computers.com/museum/computer.asp?st=1&c=497>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SEARS");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "TELE-GAMES PINBALL BREAKAWAY (MODEL 99704)", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "DARLEY");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "DY 80", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "T.R.Q. (Talleres Radioeléctricos Querol)");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "H-21 VIDEO COMPUTER", "<http://www.old-computers.com/museum/computer.asp?st=2&c=723>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "SPICA");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "INES", "<http://www.old-computers.com/museum/computer.asp?st=1&c=964>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "Mattel Electronics");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "AQUARIUS 2", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "S.H.G.");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "BLACK POINT (MODEL FS-1003)", "", @comp);
SET @comp = (SELECT id FROM company WHERE title = "LNW RESEARCH");
; Enero 1983
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "LNW 80 II", "<http://www.museo8bits.com/lnw80_2.htm>", @comp, 1983);
; None
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "LNW80", "<http://www.museo8bits.com/lnw80.htm>", @comp);
; Julio 1983
INSERT INTO catalog (type_id, title, description, company_id, year) VALUES (@computer, "LNW 80 Team", "<http://www.museo8bits.com/lnw80_team.htm>", @comp, 1983);
SET @comp = (SELECT id FROM company WHERE title = "FUJI ELECTRIC");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@console, "SPORTSTRON TV-GAME (COCA-COLA EDITION)", "<http://www.old-computers.com/museum/computer.asp?st=3&c=744>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "BASF");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "7100", "<http://www.old-computers.com/museum/computer.asp?st=1&c=1301>", @comp);
SET @comp = (SELECT id FROM company WHERE title = "OHIO Scientific");
; NULL
INSERT INTO catalog (type_id, title, description, company_id) VALUES (@computer, "C2", "<http://www.old-computers.com/museum/computer.asp?st=1&c=839>", @comp);
