INSERT INTO kategoria (nev) VALUES
  ('Edzőterem'),
  ('Pálya'),
  ('Uszoda'),
  ('Sportesemény'),
  ('Stúdió');

INSERT INTO sportag (nev) VALUES
  ('Úszás'),
  ('Konditerem'),
  ('Futás'),
  ('Tenisz'),
  ('Jóga');

INSERT INTO helyszin (varos, cim) VALUES
  ('Budapest', '1138 Budapest, Váci út 144-150.'),
  ('Debrecen', '4025 Debrecen, Piac utca 32.'),
  ('Szeged', '6720 Szeged, Tisza Lajos körút 54.'),
  ('Győr', '9021 Győr, Káptalandomb 3.'),
  ('Pécs', '7621 Pécs, Király utca 12.');

INSERT INTO szervezo (nev, telefon, email, weboldal) VALUES
  ('AquaFit SE', '+36 20 111 1111', 'info@aquafit.hu', 'https://aquafit.hu'),
  ('CityRun Klub', '+36 20 222 2222', 'hello@cityrun.hu', 'https://cityrun.hu'),
  ('Prime Tenisz Kft', '+36 20 333 3333', 'kapcsolat@primetenisz.hu', 'https://primetenisz.hu'),
  ('Urban Gym', '+36 20 444 4444', 'office@urbangym.hu', 'https://urbangym.hu'),
  ('Flow Studio', '+36 20 555 5555', 'studio@flow.hu', 'https://flow.hu');

INSERT INTO felhasznalo (felhasznalonev, email, jelszo_hash, szerepkor) VALUES
  (
    'admin',
    'admin@sporthub.hu',
    'ff8b4656680276a9e2321e40d7ccdeb9:7f27a66eb3689a9325d2535c5faafda14270e4896e5fe0e04582d56896c712809d81be44f6a5f5fb869e48bd7eb96fa530e3ac7cd71017d77d2b3615b2fe455b',
    'admin'
  ),
  (
    'demo',
    'demo@sporthub.hu',
    '0ebb3cce4741d09df2068f33ad4c7a1b:936f5e1fe96665e13cd283eafbeb42a387340d95551cddc4dce8a6f78c2d9c9339018ed4ed9ba64e3522e829eeabed9a69e6ea1007e9e49c946084be5c00f699',
    'user'
  );

INSERT INTO bejelentkezes (felhasznalo_id, bejelentkezes_idopont, ip_cim, sikeres) VALUES
  ((SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu'), NOW() - INTERVAL 3 DAY, '127.0.0.1', 1),
  ((SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu'), NOW() - INTERVAL 1 DAY, '127.0.0.1', 1),
  ((SELECT id FROM felhasznalo WHERE email = 'demo@sporthub.hu'), NOW() - INTERVAL 2 DAY, '127.0.0.1', 1);

INSERT INTO sportlehetosegek (
  nev,
  sportag_id,
  ar,
  korosztaly_min,
  korosztaly_max,
  megjegyzes,
  idoszak,
  nyitvatartas,
  kapcsolat,
  kep_url,
  szervezo_id,
  helyszin_id,
  kategoria_id,
  letrehozo_felhasznalo_id
) VALUES
  (
    'AquaFit Reggeli Úszás',
    (SELECT id FROM sportag WHERE nev = 'Úszás'),
    3500,
    14,
    65,
    'Technika + állóképesség blokk 60 percben.',
    'morning',
    'H-P 06:00-22:00, Szo-V 08:00-20:00',
    'info@aquafit.hu',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1400&q=80',
    (SELECT id FROM szervezo WHERE nev = 'AquaFit SE'),
    (SELECT id FROM helyszin WHERE varos = 'Szeged' AND cim = '6720 Szeged, Tisza Lajos körút 54.'),
    (SELECT id FROM kategoria WHERE nev = 'Uszoda'),
    (SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu')
  ),
  (
    'CityRun Délutáni Futás',
    (SELECT id FROM sportag WHERE nev = 'Futás'),
    0,
    12,
    70,
    'Vezetett városi futás különböző tempószinteken.',
    'afternoon',
    'Kedd-Csütörtök 17:00-19:00',
    'hello@cityrun.hu',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80',
    (SELECT id FROM szervezo WHERE nev = 'CityRun Klub'),
    (SELECT id FROM helyszin WHERE varos = 'Debrecen' AND cim = '4025 Debrecen, Piac utca 32.'),
    (SELECT id FROM kategoria WHERE nev = 'Sportesemény'),
    (SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu')
  ),
  (
    'Prime Tenisz Esti Csoport',
    (SELECT id FROM sportag WHERE nev = 'Tenisz'),
    6900,
    16,
    65,
    'Kiscsoportos tréning játékszituációkkal.',
    'evening',
    'Minden nap 15:00-21:00',
    'kapcsolat@primetenisz.hu',
    'https://images.unsplash.com/photo-1617083934551-54d4dbd8d86a?auto=format&fit=crop&w=1400&q=80',
    (SELECT id FROM szervezo WHERE nev = 'Prime Tenisz Kft'),
    (SELECT id FROM helyszin WHERE varos = 'Budapest' AND cim = '1138 Budapest, Váci út 144-150.'),
    (SELECT id FROM kategoria WHERE nev = 'Pálya'),
    (SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu')
  ),
  (
    'Urban Gym Hétvégi Erőedzés',
    (SELECT id FROM sportag WHERE nev = 'Konditerem'),
    4900,
    14,
    65,
    'Teljes testes alaperő program kezdőknek és haladóknak.',
    'weekend',
    'Szo-V 09:00-18:00',
    'office@urbangym.hu',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
    (SELECT id FROM szervezo WHERE nev = 'Urban Gym'),
    (SELECT id FROM helyszin WHERE varos = 'Győr' AND cim = '9021 Győr, Káptalandomb 3.'),
    (SELECT id FROM kategoria WHERE nev = 'Edzőterem'),
    (SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu')
  ),
  (
    'Flow Studio Reggeli Jóga',
    (SELECT id FROM sportag WHERE nev = 'Jóga'),
    4200,
    12,
    70,
    'Légzésfókuszú mobilizáló óra stresszcsökkentéshez.',
    'morning',
    'H-P 07:00-20:00',
    'studio@flow.hu',
    'https://images.unsplash.com/photo-1549570652-97324981a6fd?auto=format&fit=crop&w=1400&q=80',
    (SELECT id FROM szervezo WHERE nev = 'Flow Studio'),
    (SELECT id FROM helyszin WHERE varos = 'Pécs' AND cim = '7621 Pécs, Király utca 12.'),
    (SELECT id FROM kategoria WHERE nev = 'Stúdió'),
    (SELECT id FROM felhasznalo WHERE email = 'admin@sporthub.hu')
  );
