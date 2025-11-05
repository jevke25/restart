/*
  # Seed Demo Data

  ## Overview
  This migration adds demo data for testing the application with default exercises.

  ## Changes
  - Insert public exercises for various muscle groups
  - These exercises can be used by all trainers when creating training plans
*/

-- Insert demo exercises (public exercises available to all users)
INSERT INTO exercises (name, muscle_group, description, is_public, tips) VALUES
  ('Bench press', 'grudi', 'Klasična vežba za razvijanje prsnih mišića. Leći na klupu sa stopalima čvrsto na podu.', true, ARRAY['Držati šipku sa širinom ramena', 'Spustiti šipku do donjeg dela grudi', 'Zadržati na sekundu zatim podići nazad']),
  ('Kosi bench press', 'grudi', 'Varijacija bench pressa koja više opterećuje gornji deo prsnih mišića.', true, ARRAY['Podesiti kosinu klupe na 30-45 stepeni', 'Fokusirati se na gornji deo grudi']),
  ('Sklekovi', 'grudi', 'Osnovna vežba za prsne mišiće koja se izvodi sopstvenom težinom.', true, ARRAY['Držati telo u ravnoj liniji', 'Spuštati se sve dok grudi ne dođu blizu poda']),
  ('Pec dec mašina', 'grudi', 'Izolaciona vežba za prsne mišiće na mašini.', true, ARRAY['Podesiti sedište za udobnost', 'Spor kontrolisan pokret']),
  
  ('Veslanje u prednjemu', 'ledja', 'Kompleksna vežba za razvijanje leđnih mišića.', true, ARRAY['Držati leđa ravna', 'Povlačiti laktove unazad']),
  ('Mrtvo dizanje', 'ledja', 'Osnovna snažna vežba za celo telo sa fokusom na leđa.', true, ARRAY['Prava leđa tokom celog pokreta', 'Koristiti noge za početni deo pokreta']),
  ('Pull-up', 'ledja', 'Vežba za leđa sopstvenom težinom.', true, ARRAY['Širok hvat', 'Potpuna ekstenzija ruku na dnu']),
  ('Lat pulldown', 'ledja', 'Vežba na mašini za razvijanje širokih leđnih mišića.', true, ARRAY['Povlačiti do gornjeg dela grudi', 'Stegnuti lopatice pri povlačenju']),
  
  ('Čučnjevi', 'noge', 'Kralj svih vežbi za noge.', true, ARRAY['Koljena u liniji sa stopalima', 'Prava leđa', 'Ići duboko koliko je bezbedno']),
  ('Istezanje nogu', 'noge', 'Izolaciona vežba za prednju stranu butina.', true, ARRAY['Kontrolisan pokret', 'Stegnuti mišiće na vrhu']),
  ('Fleksija nogu', 'noge', 'Izolaciona vežba za zadnju stranu butina.', true, ARRAY['Ne dići kukove', 'Spor negativni deo pokreta']),
  ('Hodanje na stepenicama', 'noge', 'Funkcionalna vežba za noge.', true, ARRAY['Držati ravna leđa', 'Koristiti telo težinu ili tegove']),
  
  ('Military press', 'rame', 'Osnovna vežba za ramena.', true, ARRAY['Pokret počinje od ramena', 'Ne pretjerano opterećivati leđa']),
  ('Bocno podizanje', 'rame', 'Izolaciona vežba za bočne delove ramena.', true, ARRAY['Laktovi blago savijeni', 'Podizati samo do visine ramena']),
  ('Prednje podizanje', 'rame', 'Izolaciona vežba za prednji deo ramena.', true, ARRAY['Kontrolisan pokret', 'Ne ljuljati telo']),
  ('Face pull', 'rame', 'Vežba za zadnji deo ramena i gornji deo leđa.', true, ARRAY['Povlačiti ka licu', 'Razdvojiti ruke na kraju pokreta']),
  
  ('Biceps curls', 'biceps', 'Klasična vežba za biceps.', true, ARRAY['Fiksirati laktove', 'Ne ljuljati telo']),
  ('Činjenje sa šipkom', 'biceps', 'Vežba za biceps sa šipkom.', true, ARRAY['EZ šipka može biti lakša za zglobove', 'Potpuni opseg pokreta']),
  ('Koncentrirani biceps', 'biceps', 'Izolaciona vežba koja se izvodi sedeci.', true, ARRAY['Lakat na unutrašnjoj strani butine', 'Fokus na kontrakciji']),
  ('Hammer curls', 'biceps', 'Varijacija curl vežbe sa neutralnim hvatom.', true, ARRAY['Neutralan hvat', 'Aktivira i podlakticu']),
  
  ('Triceps ekstenzija', 'triceps', 'Vežba za izolaciju tricepsa.', true, ARRAY['Fiksirati gornji deo ruke', 'Puna ekstenzija na vrhu']),
  ('Triceps dips', 'triceps', 'Vežba sopstvenom težinom za triceps.', true, ARRAY['Nagnuti se napred malo', 'Kontrolisano spuštanje']),
  ('Triceps pushdown', 'triceps', 'Vežba na sajli za triceps.', true, ARRAY['Fiksirati laktove', 'Potpuna ekstenzija na dnu']),
  ('French press', 'triceps', 'Vežba za triceps sa šipkom ili bučicama.', true, ARRAY['Kontrolisano spuštanje', 'Ne širiti laktove']),
  
  ('Trbušnjaci', 'trbuh', 'Osnovna vežba za trbušne mišiće.', true, ARRAY['Ne vući vrat', 'Dizati lopatice od poda']),
  ('Dizanje nogu', 'trbuh', 'Vežba za donji deo trbuha.', true, ARRAY['Kontrolisan pokret', 'Ne ljuljati noge']),
  ('Plank', 'trbuh', 'Izometrična vežba za trbuh.', true, ARRAY['Telo u ravnoj liniji', 'Aktivirati trbuh']),
  ('Ruski twist', 'trbuh', 'Vežba za bočne trbušne mišiće.', true, ARRAY['Stopala od poda za težu varijantu', 'Rotirati trup'])
ON CONFLICT DO NOTHING;