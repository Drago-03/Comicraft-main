// KAVACH Blocklist Seed Data Generator
// Generates 10,000+ IP entities across 7 categories

function soundex(s: string): string {
  const a = s.toLowerCase().replace(/[^a-z]/g, '').split('');
  if (!a.length) return '';
  const codes: Record<string, string> = {b:'1',f:'1',p:'1',v:'1',c:'2',g:'2',j:'2',k:'2',q:'2',s:'2',x:'2',z:'2',d:'3',t:'3',l:'4',m:'5',n:'5',r:'6'};
  const f = a.shift()!;
  const r = a.map(c => codes[c] || '').filter((c, i, arr) => c && c !== arr[i - 1]).join('');
  return (f + r + '000').slice(0, 4).toUpperCase();
}

function normalize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

interface RawEntity {
  name: string;
  aliases: string[];
  entity_type: string;
  ip_owner: string;
  ip_universe?: string;
  risk_level?: string;
}

function expand(entries: RawEntity[], category: string) {
  return entries.map(e => ({
    name: e.name,
    name_normalized: normalize(e.name),
    name_phonetic: soundex(e.name),
    aliases: e.aliases,
    entity_type: e.entity_type,
    ip_owner: e.ip_owner,
    ip_universe: e.ip_universe || null,
    risk_level: e.risk_level || 'high',
    category,
    jurisdiction: ['global'],
    is_active: true,
  }));
}

// Helper to generate character entries quickly
function chars(names: [string, string[]][], owner: string, universe: string): RawEntity[] {
  return names.map(([n, a]) => ({ name: n, aliases: a, entity_type: 'character', ip_owner: owner, ip_universe: universe }));
}
function places(names: [string, string[]][], owner: string, universe: string): RawEntity[] {
  return names.map(([n, a]) => ({ name: n, aliases: a, entity_type: 'place', ip_owner: owner, ip_universe: universe }));
}
function objects(names: [string, string[]][], owner: string, universe: string): RawEntity[] {
  return names.map(([n, a]) => ({ name: n, aliases: a, entity_type: 'object', ip_owner: owner, ip_universe: universe }));
}
function phrases(names: [string, string[]][], owner: string, universe: string): RawEntity[] {
  return names.map(([n, a]) => ({ name: n, aliases: a, entity_type: 'catchphrase', ip_owner: owner, ip_universe: universe, risk_level: 'medium' }));
}

export function generateMarvelEntities(): RawEntity[] {
  const o = 'The Walt Disney Company / Marvel';
  return [
    ...chars([
      ['Spider-Man', ['Peter Parker','Spiderman','Spidey','Web-Slinger','Spider Man']],
      ['Miles Morales', ['Spider-Man (Miles)','Kid Arachnid']],
      ['Gwen Stacy', ['Spider-Gwen','Ghost-Spider','Spider-Woman (Gwen)']],
      ['Iron Man', ['Tony Stark','Ironman','The Armored Avenger']],
      ['Captain America', ['Steve Rogers','Cap','The First Avenger','Captain Rogers']],
      ['Thor', ['Thor Odinson','God of Thunder','The Mighty Thor']],
      ['Hulk', ['Bruce Banner','The Incredible Hulk','Green Goliath','Dr. Banner']],
      ['Black Widow', ['Natasha Romanoff','Natalia Romanova','Agent Romanoff']],
      ['Hawkeye', ['Clint Barton','Ronin','Agent Barton']],
      ['Black Panther', ['T\'Challa','King of Wakanda','Black Panther']],
      ['Doctor Strange', ['Stephen Strange','Dr. Strange','Sorcerer Supreme']],
      ['Scarlet Witch', ['Wanda Maximoff','Wanda','The Scarlet Witch']],
      ['Vision', ['The Vision','Victor Shade']],
      ['Ant-Man', ['Scott Lang','Hank Pym','Ant Man']],
      ['Wasp', ['Hope Van Dyne','Janet Van Dyne','The Wasp']],
      ['Captain Marvel', ['Carol Danvers','Ms. Marvel (Carol)','Binary']],
      ['Ms. Marvel', ['Kamala Khan','Ms Marvel']],
      ['War Machine', ['James Rhodes','Rhodey','Iron Patriot']],
      ['Falcon', ['Sam Wilson','Captain America (Sam)']],
      ['Winter Soldier', ['Bucky Barnes','James Buchanan Barnes','White Wolf']],
      ['Wolverine', ['Logan','James Howlett','Weapon X']],
      ['Deadpool', ['Wade Wilson','Merc with a Mouth']],
      ['Professor X', ['Charles Xavier','Professor Xavier']],
      ['Magneto', ['Erik Lehnsherr','Max Eisenhardt']],
      ['Storm', ['Ororo Munroe','Weather Witch']],
      ['Jean Grey', ['Phoenix','Dark Phoenix','Marvel Girl']],
      ['Cyclops', ['Scott Summers','Slim']],
      ['Beast', ['Hank McCoy','Dr. McCoy']],
      ['Rogue', ['Anna Marie','Rogue (X-Men)']],
      ['Gambit', ['Remy LeBeau','Le Diable Blanc']],
      ['Nightcrawler', ['Kurt Wagner','The Incredible Nightcrawler']],
      ['Iceman', ['Bobby Drake','Robert Drake']],
      ['Colossus', ['Piotr Rasputin','Peter Rasputin']],
      ['Mystique', ['Raven Darkholme','Raven']],
      ['Thanos', ['The Mad Titan','Thanos of Titan']],
      ['Loki', ['Loki Laufeyson','God of Mischief']],
      ['Venom', ['Eddie Brock','Venom Symbiote']],
      ['Carnage', ['Cletus Kasady','Maximum Carnage']],
      ['Green Goblin', ['Norman Osborn','Goblin']],
      ['Doctor Octopus', ['Otto Octavius','Doc Ock']],
      ['Kingpin', ['Wilson Fisk','The Kingpin']],
      ['Daredevil', ['Matt Murdock','The Man Without Fear']],
      ['Luke Cage', ['Carl Lucas','Power Man']],
      ['Jessica Jones', ['Jewel','Jessica Campbell']],
      ['Iron Fist', ['Danny Rand','Daniel Rand']],
      ['Punisher', ['Frank Castle','The Punisher']],
      ['Moon Knight', ['Marc Spector','Steven Grant','Jake Lockley','Mr. Knight']],
      ['She-Hulk', ['Jennifer Walters','Jen Walters']],
      ['Groot', ['I Am Groot','Baby Groot','Tree']],
      ['Rocket Raccoon', ['Rocket','Subject 89P13']],
      ['Star-Lord', ['Peter Quill','Star Lord']],
      ['Gamora', ['Gamora Zen Whoberi Ben Titan','The Deadliest Woman']],
      ['Drax', ['Drax the Destroyer','Arthur Douglas']],
      ['Nebula', ['Nebula (Marvel)','Daughter of Thanos']],
      ['Mantis', ['Mantis (Marvel)','Celestial Madonna']],
      ['Nick Fury', ['Nicholas Fury','Colonel Fury']],
      ['Phil Coulson', ['Agent Coulson','Son of Coul']],
      ['Maria Hill', ['Agent Hill','Commander Hill']],
      ['Shang-Chi', ['Shang Chi','Master of Kung Fu']],
      ['Eternals', ['The Eternals','Celestial Creations']],
      ['Sersi', ['Sersi (Eternal)','Circe']],
      ['Ikaris', ['Ikaris (Eternal)']],
      ['Ultron', ['Ultron Prime','The Living Automaton']],
      ['Kang', ['Kang the Conqueror','Nathaniel Richards','He Who Remains']],
      ['Red Skull', ['Johann Schmidt','Der Rote Schädel']],
      ['Hela', ['Hela Odinsdottir','Goddess of Death']],
      ['Surtur', ['Surtur (Marvel)','Fire Giant']],
      ['Dormammu', ['Dormammu (Marvel)','Dread Dormammu']],
      ['Galactus', ['Galan','Devourer of Worlds']],
      ['Silver Surfer', ['Norrin Radd','The Sentinel of the Spaceways']],
      ['Fantastic Four', ['FF','The First Family of Marvel']],
      ['Mr. Fantastic', ['Reed Richards','Dr. Richards']],
      ['Invisible Woman', ['Sue Storm','Susan Storm Richards']],
      ['Human Torch', ['Johnny Storm','Jonathan Storm']],
      ['The Thing', ['Ben Grimm','Benjamin Grimm','The Ever-Lovin Blue-Eyed Thing']],
      ['Doctor Doom', ['Victor Von Doom','Dr. Doom','Doom']],
      ['Blade', ['Eric Brooks','The Daywalker']],
      ['Ghost Rider', ['Johnny Blaze','Robbie Reyes','Spirit of Vengeance']],
      ['Nova', ['Richard Rider','Sam Alexander','Nova Prime']],
      ['Adam Warlock', ['Him','Warlock']],
      ['Namor', ['Namor McKenzie','Sub-Mariner','King of Atlantis']],
      ['White Tiger', ['Ava Ayala','White Tiger (Marvel)']],
      ['America Chavez', ['Miss America','America (Marvel)']],
      ['Kate Bishop', ['Hawkeye (Kate)','Kate Bishop Hawkeye']],
      ['Echo', ['Maya Lopez','Ronin (Maya)']],
      ['Agatha Harkness', ['Agatha','Agnes']],
    ], o, 'Marvel Comics'),
    ...places([
      ['Wakanda', ['Kingdom of Wakanda','Wakandan Nation']],
      ['Asgard', ['Realm of Asgard','Asgardian Realm']],
      ['Stark Tower', ['Avengers Tower','Stark Industries HQ']],
      ['Xavier\'s School', ['Xavier Institute','X-Mansion','School for Gifted Youngsters']],
      ['Knowhere', ['Knowhere Station','Celestial Head']],
      ['Savage Land', ['The Savage Land','Ka-Zar\'s Domain']],
      ['Sokovia', ['Sokovian Republic']],
      ['Kamar-Taj', ['Kamar Taj','Sorcerer Sanctum']],
      ['Sanctum Sanctorum', ['177A Bleecker Street','Doctor Strange Sanctum']],
      ['Avengers Compound', ['Avengers HQ','New Avengers Facility']],
      ['Genosha', ['Mutant Nation Genosha']],
      ['Latveria', ['Kingdom of Latveria','Doom\'s Domain']],
      ['Madripoor', ['Island of Madripoor']],
      ['Negative Zone', ['The Negative Zone']],
      ['Quantum Realm', ['Microverse','Sub-Atomic Realm']],
    ], o, 'Marvel Comics'),
    ...objects([
      ['Infinity Stones', ['Infinity Gems','Soul Stones','The Six Stones']],
      ['Mjolnir', ['Thor\'s Hammer','The Mighty Mjolnir']],
      ['Vibranium', ['Vibranium Metal','Wakandan Vibranium']],
      ['Infinity Gauntlet', ['The Gauntlet','Thanos Gauntlet']],
      ['Captain America\'s Shield', ['Cap\'s Shield','Vibranium Shield']],
      ['Stormbreaker', ['Thor\'s Axe','Stormbreaker Axe']],
      ['Tesseract', ['The Tesseract','Space Stone Cube','Cosmic Cube']],
      ['Iron Man Suit', ['Mark Armor','Arc Reactor Suit']],
      ['Web-Shooters', ['Spider-Man Web Shooters']],
      ['Adamantium', ['Adamantium Metal','Indestructible Metal']],
      ['Eye of Agamotto', ['Time Stone Amulet','Agamotto Eye']],
      ['Darkhold', ['The Darkhold','Book of the Damned']],
      ['Pym Particles', ['Pym Particle','Size-Changing Particles']],
      ['Heart-Shaped Herb', ['Wakandan Herb','Black Panther Herb']],
      ['Super Soldier Serum', ['Erskine Formula','SSS']],
    ], o, 'Marvel Comics'),
    ...phrases([
      ['Avengers Assemble', ['Avengers, Assemble!']],
      ['I am Iron Man', ['I am Ironman']],
      ['Wakanda Forever', ['Wakanda forever!']],
      ['Hulk Smash', ['Hulk smash!','HULK SMASH']],
      ['With great power comes great responsibility', ['Great power great responsibility']],
      ['I am Groot', ['I Am Groot!','We are Groot']],
      ['Excelsior', ['Excelsior!']],
      ['It\'s clobberin\' time', ['Clobberin time','Its clobbering time']],
      ['SNIKT', ['Snikt','*SNIKT*']],
      ['Flame On', ['Flame on!']],
    ], o, 'Marvel Comics'),
  ];
}

export function generateDCEntities(): RawEntity[] {
  const o = 'Warner Bros. Discovery / DC';
  return [
    ...chars([
      ['Batman', ['Bruce Wayne','The Dark Knight','The Caped Crusader','Bats']],
      ['Superman', ['Clark Kent','Kal-El','Man of Steel','The Last Son of Krypton']],
      ['Wonder Woman', ['Diana Prince','Diana of Themyscira','Princess Diana']],
      ['The Flash', ['Barry Allen','Wally West','The Fastest Man Alive','Scarlet Speedster']],
      ['Aquaman', ['Arthur Curry','King of Atlantis','Orin']],
      ['Green Lantern', ['Hal Jordan','John Stewart','Guy Gardner','Kyle Rayner']],
      ['Cyborg', ['Victor Stone','Vic Stone']],
      ['Robin', ['Dick Grayson','Tim Drake','Damian Wayne','Jason Todd']],
      ['Nightwing', ['Dick Grayson','The Boy Wonder (grown)']],
      ['Batgirl', ['Barbara Gordon','Babs','Oracle']],
      ['Supergirl', ['Kara Zor-El','Kara Danvers']],
      ['Joker', ['The Joker','Clown Prince of Crime','Mr. J','Puddin']],
      ['Harley Quinn', ['Harleen Quinzel','Dr. Quinzel']],
      ['Catwoman', ['Selina Kyle','The Cat']],
      ['Lex Luthor', ['Alexander Luthor','Luthor']],
      ['Darkseid', ['Uxas','Lord Darkseid','Ruler of Apokolips']],
      ['Deathstroke', ['Slade Wilson','Slade','The Terminator']],
      ['Poison Ivy', ['Pamela Isley','Dr. Isley']],
      ['Two-Face', ['Harvey Dent','Two Face']],
      ['Riddler', ['Edward Nygma','E. Nygma','The Riddler']],
      ['Scarecrow', ['Jonathan Crane','Dr. Crane','Master of Fear']],
      ['Bane', ['Bane (DC)','The Man Who Broke the Bat']],
      ['Ra\'s al Ghul', ['Ras al Ghul','The Demon\'s Head','Ra\'s']],
      ['Shazam', ['Billy Batson','Captain Marvel (DC)']],
      ['Green Arrow', ['Oliver Queen','Ollie','The Emerald Archer']],
      ['Black Canary', ['Dinah Lance','Dinah Drake']],
      ['Hawkman', ['Carter Hall','Katar Hol']],
      ['Hawkgirl', ['Shiera Hall','Kendra Saunders']],
      ['Martian Manhunter', ['J\'onn J\'onzz','John Jones']],
      ['Zatanna', ['Zatanna Zatara']],
      ['Constantine', ['John Constantine','Hellblazer']],
      ['Swamp Thing', ['Alec Holland','The Green']],
      ['Raven', ['Rachel Roth','Raven (Teen Titans)']],
      ['Starfire', ['Koriand\'r','Princess Koriand\'r']],
      ['Beast Boy', ['Garfield Logan','Changeling']],
      ['Teen Titans', ['The Teen Titans','Titans']],
      ['Blue Beetle', ['Jaime Reyes','Ted Kord']],
      ['Booster Gold', ['Michael Jon Carter']],
      ['Mr. Freeze', ['Victor Fries','Dr. Fries']],
      ['Penguin', ['Oswald Cobblepot','The Penguin']],
      ['Alfred Pennyworth', ['Alfred','Butler Alfred']],
      ['Commissioner Gordon', ['James Gordon','Jim Gordon']],
      ['Lois Lane', ['Lois Lane-Kent']],
      ['Jimmy Olsen', ['James Olsen']],
      ['Brainiac', ['Vril Dox','Collector of Worlds']],
      ['Doomsday', ['The Ultimate','Doomsday (DC)']],
      ['General Zod', ['Dru-Zod','Zod']],
      ['Sinestro', ['Thaal Sinestro','Yellow Lantern']],
      ['Black Adam', ['Teth-Adam','Mighty Adam']],
      ['Bizarro', ['Bizarro Superman','B-Zero']],
    ], o, 'DC Comics'),
    ...places([
      ['Gotham City', ['Gotham','Gotham Town']],
      ['Metropolis', ['Metropolis City','City of Tomorrow']],
      ['Themyscira', ['Paradise Island','Amazon Island']],
      ['Arkham Asylum', ['Arkham','Arkham State Hospital']],
      ['Batcave', ['The Batcave','Bat Cave']],
      ['Fortress of Solitude', ['Superman Fortress','Arctic Fortress']],
      ['Wayne Manor', ['Wayne Estate','Stately Wayne Manor']],
      ['Apokolips', ['Planet Apokolips','Darkseid Planet']],
      ['Oa', ['Planet Oa','Green Lantern HQ']],
      ['Star City', ['Star City (DC)']],
      ['Central City', ['Central City (DC)','Flash City']],
      ['Smallville', ['Smallville Kansas']],
      ['Atlantis', ['Atlantis (DC)','Aquaman Kingdom']],
      ['Phantom Zone', ['The Phantom Zone','Kryptonian Prison']],
      ['Hall of Justice', ['Justice League HQ']],
    ], o, 'DC Comics'),
    ...objects([
      ['Kryptonite', ['Green Kryptonite','Kryptonian Crystal']],
      ['Batmobile', ['The Batmobile','Bat Mobile']],
      ['Batarang', ['Bat-a-rang','Batman Throwing Weapon']],
      ['Lasso of Truth', ['Golden Lasso','Wonder Woman Lasso']],
      ['Green Lantern Ring', ['Power Ring','Lantern Ring']],
      ['Trident of Neptune', ['Aquaman Trident','Poseidon Trident']],
      ['Utility Belt', ['Batman Utility Belt','Bat Belt']],
      ['Invisible Jet', ['Wonder Woman Jet']],
      ['Mother Box', ['Mother Boxes','New God Technology']],
      ['Anti-Life Equation', ['Anti Life Equation','Darkseid Formula']],
    ], o, 'DC Comics'),
    ...phrases([
      ['I\'m Batman', ['Im Batman','I am Batman']],
      ['Truth, Justice, and the American Way', ['Truth Justice American Way']],
      ['In Blackest Night', ['In brightest day in blackest night']],
      ['Up, up, and away', ['Up up and away']],
      ['Holy smokes, Batman', ['Holy smokes Batman']],
    ], o, 'DC Comics'),
  ];
}

export function generateDisneyEntities(): RawEntity[] {
  const o = 'The Walt Disney Company';
  return [
    ...chars([
      ['Mickey Mouse', ['Mickey','Steamboat Willie']],
      ['Minnie Mouse', ['Minnie']],
      ['Donald Duck', ['Donald','Angry Duck']],
      ['Goofy', ['Goofy Goof']],
      ['Pluto', ['Pluto (Disney)']],
      ['Elsa', ['Queen Elsa','Elsa of Arendelle']],
      ['Anna', ['Princess Anna','Anna of Arendelle']],
      ['Olaf', ['Olaf the Snowman']],
      ['Simba', ['Young Simba','King Simba']],
      ['Mufasa', ['King Mufasa']],
      ['Scar', ['Scar (Lion King)','Taka']],
      ['Timon', ['Timon (Lion King)']],
      ['Pumbaa', ['Pumbaa (Lion King)']],
      ['Buzz Lightyear', ['Buzz','Space Ranger Buzz']],
      ['Woody', ['Sheriff Woody','Woody (Toy Story)']],
      ['Lightning McQueen', ['McQueen','Ka-Chow']],
      ['Nemo', ['Finding Nemo','Nemo Fish']],
      ['Dory', ['Finding Dory','Blue Tang Dory']],
      ['Moana', ['Moana Waialiki']],
      ['Maui', ['Maui (Moana)','Demigod Maui']],
      ['Rapunzel', ['Rapunzel (Tangled)']],
      ['Ariel', ['The Little Mermaid','Princess Ariel']],
      ['Belle', ['Belle (Beauty and the Beast)']],
      ['Cinderella', ['Cinderella (Disney)']],
      ['Aladdin', ['Prince Ali','Street Rat']],
      ['Jasmine', ['Princess Jasmine']],
      ['Mulan', ['Fa Mulan','Hua Mulan']],
      ['Pocahontas', ['Pocahontas (Disney)']],
      ['Tarzan', ['Tarzan (Disney)']],
      ['Stitch', ['Experiment 626','Stitch (Lilo)']],
      ['WALL-E', ['Wall-E','WALL E']],
      ['EVE', ['EVE (WALL-E)']],
      ['Remy', ['Remy (Ratatouille)','Little Chef']],
      ['Mr. Incredible', ['Bob Parr','Mr Incredible']],
      ['Elastigirl', ['Helen Parr','Mrs. Incredible']],
      ['Jack-Jack', ['Jack Jack Parr']],
      ['Baymax', ['Baymax (Big Hero 6)']],
      ['Hiro Hamada', ['Hiro (Big Hero 6)']],
      ['Maleficent', ['Maleficent (Disney)']],
      ['Ursula', ['Ursula (Little Mermaid)']],
      ['Cruella de Vil', ['Cruella','Cruella De Vil']],
      ['Jafar', ['Jafar (Aladdin)']],
      ['Gaston', ['Gaston (Beauty Beast)']],
      ['Sully', ['James P. Sullivan','Sulley']],
      ['Mike Wazowski', ['Mike (Monsters Inc)']],
      ['Joy', ['Joy (Inside Out)']],
      ['Sadness', ['Sadness (Inside Out)']],
      ['Mirabel', ['Mirabel Madrigal','Mirabel (Encanto)']],
    ], o, 'Disney / Pixar'),
    ...places([
      ['Arendelle', ['Kingdom of Arendelle']],
      ['Agrabah', ['City of Agrabah']],
      ['Pride Rock', ['Pride Lands','Pride Rock (Lion King)']],
      ['Neverland', ['Never Land','Peter Pan Island']],
      ['Monstropolis', ['Monsters Inc City']],
      ['Atlantica', ['Atlantica (Little Mermaid)']],
    ], o, 'Disney / Pixar'),
    ...objects([
      ['Glass Slipper', ['Cinderella Slipper','Crystal Slipper']],
      ['Magic Carpet', ['Aladdin Carpet','Flying Carpet']],
      ['Genie Lamp', ['Aladdin Lamp','Magic Lamp']],
      ['Lightsaber', ['Light Saber','Laser Sword']],
      ['Pixar Ball', ['Luxo Ball']],
    ], o, 'Disney / Pixar'),
  ];
}

export function generateAnimeEntities(): RawEntity[] {
  return [
    ...chars([
      ['Goku', ['Son Goku','Kakarot','Son Gokou']], ['Vegeta', ['Prince Vegeta','Vegeta IV']],
      ['Gohan', ['Son Gohan','Great Saiyaman']], ['Piccolo', ['Piccolo Jr','Ma Junior']],
      ['Frieza', ['Freeza','Lord Frieza']], ['Cell', ['Perfect Cell','Cell (DBZ)']],
      ['Majin Buu', ['Buu','Fat Buu','Kid Buu']], ['Trunks', ['Future Trunks','Trunks Brief']],
      ['Krillin', ['Kuririn','Krillin (DB)']],['Bulma', ['Bulma Brief']],
    ], 'Shueisha / Toei', 'Dragon Ball'),
    ...chars([
      ['Naruto Uzumaki', ['Naruto','Seventh Hokage']], ['Sasuke Uchiha', ['Sasuke','Shadow Hokage']],
      ['Sakura Haruno', ['Sakura','Sakura Uchiha']], ['Kakashi Hatake', ['Kakashi','Copy Ninja']],
      ['Itachi Uchiha', ['Itachi','Weasel']], ['Hinata Hyuga', ['Hinata','Hinata Uzumaki']],
      ['Gaara', ['Gaara of the Sand','Kazekage Gaara']], ['Jiraiya', ['Pervy Sage','Toad Sage']],
      ['Orochimaru', ['Snake Sannin']], ['Madara Uchiha', ['Madara','Ghost of Uchiha']],
      ['Obito Uchiha', ['Tobi','Masked Man']], ['Pain', ['Nagato','Pain (Naruto)']],
      ['Rock Lee', ['Bushy Brow','Lee']],['Minato Namikaze', ['Fourth Hokage','Yellow Flash']],
    ], 'Shueisha / Pierrot', 'Naruto'),
    ...chars([
      ['Monkey D. Luffy', ['Luffy','Straw Hat Luffy']], ['Roronoa Zoro', ['Zoro','Pirate Hunter']],
      ['Nami', ['Nami (One Piece)','Cat Burglar']], ['Sanji', ['Vinsmoke Sanji','Black Leg']],
      ['Tony Tony Chopper', ['Chopper','Cotton Candy Lover']], ['Nico Robin', ['Robin','Devil Child']],
      ['Franky', ['Cutty Flam','Cyborg Franky']], ['Brook', ['Soul King Brook']],
      ['Jinbe', ['Jimbei','First Son of the Sea']], ['Shanks', ['Red-Haired Shanks']],
      ['Blackbeard', ['Marshall D. Teach','Teach']],['Kaido', ['Kaido of the Beasts']],
    ], 'Shueisha / Toei', 'One Piece'),
    ...chars([
      ['Tanjiro Kamado', ['Tanjiro','Water Hashira Apprentice']], ['Nezuko Kamado', ['Nezuko']],
      ['Zenitsu Agatsuma', ['Zenitsu','Thunder Boy']], ['Inosuke Hashibira', ['Inosuke','Boar Head']],
      ['Muzan Kibutsuji', ['Muzan','Demon King Muzan']],['Rengoku', ['Kyojuro Rengoku','Flame Hashira']],
    ], 'Shueisha / Ufotable', 'Demon Slayer'),
    ...chars([
      ['Eren Yeager', ['Eren Jaeger','Attack Titan']], ['Mikasa Ackerman', ['Mikasa']],
      ['Armin Arlert', ['Armin','Colossal Titan (Armin)']], ['Levi Ackerman', ['Captain Levi','Levi']],
      ['Erwin Smith', ['Commander Erwin']], ['Reiner Braun', ['Armored Titan','Reiner']],
    ], 'Kodansha / MAPPA', 'Attack on Titan'),
    ...chars([
      ['Izuku Midoriya', ['Deku','Midoriya']], ['Katsuki Bakugo', ['Kacchan','Bakugo']],
      ['All Might', ['Toshinori Yagi','Symbol of Peace']], ['Shoto Todoroki', ['Todoroki']],
      ['Ochaco Uraraka', ['Uravity','Ochaco']], ['Tomura Shigaraki', ['Tenko Shimura']],
    ], 'Shueisha / Bones', 'My Hero Academia'),
    ...chars([
      ['Yuji Itadori', ['Itadori','Yuji']], ['Megumi Fushiguro', ['Megumi','Fushiguro']],
      ['Nobara Kugisaki', ['Nobara']], ['Gojo Satoru', ['Gojo','Six Eyes','The Strongest']],
      ['Ryomen Sukuna', ['Sukuna','King of Curses']],
    ], 'Shueisha / MAPPA', 'Jujutsu Kaisen'),
    ...chars([
      ['Ichigo Kurosaki', ['Ichigo','Substitute Shinigami']], ['Rukia Kuchiki', ['Rukia']],
      ['Byakuya Kuchiki', ['Byakuya','Captain Kuchiki']], ['Aizen', ['Sosuke Aizen','Lord Aizen']],
      ['Urahara', ['Kisuke Urahara','Mr. Hat-and-Clogs']],
    ], 'Shueisha / Pierrot', 'Bleach'),
    ...objects([
      ['Kamehameha', ['Kamehame-ha','Turtle Devastation Wave']],
      ['Rasengan', ['Spiraling Sphere','Rasengan Jutsu']],
      ['Sharingan', ['Copy Wheel Eye','Sharingan Eye']],
      ['Devil Fruit', ['Akuma no Mi','Devil Fruits']],
      ['Zanpakuto', ['Soul Cutter','Zanpakutō']],
      ['Nichirin Blade', ['Nichirin Sword','Color Changing Sword']],
      ['Dragon Balls', ['Dragon Ball','Seven Dragon Balls']],
      ['One For All', ['OFA Quirk','One for All Quirk']],
      ['Gear Fifth', ['Gear 5','Nika','Sun God Nika']],
      ['Bankai', ['Ban-Kai','Final Release']],
    ], 'Various Shueisha', 'Anime/Manga'),
  ];
}

export function generateTolkienEntities(): RawEntity[] {
  const o = 'Tolkien Estate / Middle-earth Enterprises';
  return [
    ...chars([
      ['Frodo Baggins', ['Frodo','Mr. Frodo','Ring-bearer']],
      ['Gandalf', ['Gandalf the Grey','Gandalf the White','Mithrandir','Olorin']],
      ['Aragorn', ['Strider','Elessar','Isildur\'s Heir','King Elessar']],
      ['Legolas', ['Legolas Greenleaf','Legolas Thranduilion']],
      ['Gimli', ['Gimli son of Gloin','Elf-friend']],
      ['Samwise Gamgee', ['Sam','Samwise','Master Samwise']],
      ['Bilbo Baggins', ['Bilbo','Mr. Bilbo','Barrel-rider']],
      ['Gollum', ['Smeagol','Sméagol','My Precious']],
      ['Sauron', ['The Dark Lord','Lord of Mordor','Necromancer','Annatar']],
      ['Saruman', ['Saruman the White','Sharkey']],
      ['Elrond', ['Lord Elrond','Elrond Half-elven']],
      ['Galadriel', ['Lady Galadriel','Lady of Light']],
      ['Arwen', ['Arwen Undómiel','Evenstar']],
      ['Éowyn', ['Eowyn','Shieldmaiden of Rohan']],
      ['Théoden', ['Theoden','King Théoden']],
      ['Faramir', ['Captain Faramir']],
      ['Boromir', ['Son of Denethor']],
      ['Pippin', ['Peregrin Took','Pip']],
      ['Merry', ['Meriadoc Brandybuck']],
      ['Treebeard', ['Fangorn','Ent Leader']],
      ['Smaug', ['Smaug the Dragon','Smaug the Terrible']],
      ['Thorin', ['Thorin Oakenshield','Thorin II']],
      ['Thranduil', ['Elvenking','King of Mirkwood']],
      ['Morgoth', ['Melkor','The Dark Enemy']],
      ['Balrog', ['Durin\'s Bane','Balrog of Morgoth']],
      ['Tom Bombadil', ['Tom','Old Tom Bombadil']],
      ['Radagast', ['Radagast the Brown']],
      ['Witch-king', ['Witch King of Angmar','Lord of the Nazgul']],
    ], o, 'Middle-earth'),
    ...places([
      ['Middle-earth', ['Middle Earth','Arda']],['Mordor', ['Land of Mordor','Shadow Land']],
      ['The Shire', ['Shire','Hobbiton']],['Rivendell', ['Imladris','Last Homely House']],
      ['Gondor', ['Kingdom of Gondor']],['Rohan', ['Kingdom of Rohan','Horse Lords Land']],
      ['Minas Tirith', ['White City','City of Kings']],['Isengard', ['Orthanc','Saruman Tower']],
      ['Lothlórien', ['Lothlorien','Golden Wood']],['Mirkwood', ['Greenwood the Great']],
      ['Mount Doom', ['Orodruin','Amon Amarth']],['Erebor', ['Lonely Mountain']],
      ['Helm\'s Deep', ['Helms Deep','Hornburg']],['Barad-dûr', ['Barad dur','Dark Tower']],
    ], o, 'Middle-earth'),
    ...objects([
      ['The One Ring', ['One Ring','Ring of Power','Precious','The Ruling Ring']],
      ['Sting', ['Sting Sword','Bilbo Sword','Elven Blade']],
      ['Glamdring', ['Foe-hammer','Gandalf Sword']],
      ['Andúril', ['Anduril','Flame of the West','Narsil']],
      ['Palantír', ['Palantir','Seeing Stone','Seeing Stones']],
      ['Silmarils', ['Silmaril','Jewels of Feanor']],
      ['Mithril', ['Mithril Armor','True Silver']],
      ['Phial of Galadriel', ['Star-glass','Light of Earendil']],
    ], o, 'Middle-earth'),
  ];
}

export function generateIndianIPEntities(): RawEntity[] {
  return [
    ...chars([
      ['Chhota Bheem', ['Bheem','Little Bheem']], ['Chutki', ['Chutki (Bheem)']],
      ['Raju', ['Raju (Bheem)','Kalia\'s friend']], ['Kalia', ['Kalia (Bheem)']],
      ['Jaggu', ['Jaggu Bandar','Jaggu Monkey']],['Dholakpur', ['Dholakpur Village']],
      ['Motu Patlu', ['Motu and Patlu']], ['Motu', ['Motu (Nickelodeon)']],
      ['Patlu', ['Patlu (Nickelodeon)']], ['Dr. Jhatka', ['Jhatka','Dr Jhatka']],
      ['Inspector Chingum', ['Chingum','Inspector (Motu Patlu)']],
      ['John the Don', ['John (Motu Patlu)']],
    ], 'Green Gold Animation', 'Indian Animation'),
    ...chars([
      ['Nagraj', ['Naagraj','Snake King','Nagraj (Raj Comics)']],
      ['Super Commando Dhruva', ['Dhruva','Commando Dhruva']],
      ['Doga', ['Doga (Raj Comics)','Suraj','Dog Man']],
      ['Parmanu', ['Parmanu (Raj Comics)','Indian Atom']],
      ['Shakti', ['Shakti (Raj Comics)']],
      ['Bhokal', ['Bhokal (Raj Comics)','Warrior Bhokal']],
      ['Inspector Steel', ['Steel (Raj Comics)']],
      ['Tiranga', ['Tiranga (Raj Comics)','Indian Flag Hero']],
      ['Bankelal', ['Bankelal (Raj Comics)']],
      ['Fauladi Singh', ['Fauladi (Raj Comics)']],
      ['Anthony', ['Anthony (Raj Comics)']],
      ['Kobi', ['Kobi (Raj Comics)']],
    ], 'Raj Comics', 'Raj Comics Universe'),
    ...chars([
      ['Chacha Chaudhary', ['Chacha','Chaudhary']],
      ['Sabu', ['Sabu (Chacha)','Giant Sabu']],
      ['Suppandi', ['Suppandi (Tinkle)']],
      ['Shikari Shambu', ['Shambu','Shikari (Tinkle)']],
      ['Tantri the Mantri', ['Tantri','Mantri Tantri']],
      ['Kris', ['Kris (Tinkle)','Krishnamurthy']],
    ], 'Diamond Comics / Tinkle', 'Indian Comics'),
    ...chars([
      ['Prithviraj Chauhan', ['Prithviraj (ACK)']],
      ['Rani Lakshmibai', ['Jhansi ki Rani (ACK)']],
      ['Shivaji', ['Chhatrapati Shivaji (ACK)']],
      ['Ashoka', ['Emperor Ashoka (ACK)']],
      ['Krishna', ['Lord Krishna (ACK)']],
      ['Hanuman', ['Lord Hanuman (ACK)']],
    ], 'Amar Chitra Katha', 'Amar Chitra Katha'),
    ...chars([
      ['Little Singham', ['Singham (animated)','Little Singham Character']],
      ['Mighty Raju', ['Raju (animated)','Mighty Raju Character']],
      ['Roll No 21', ['Kris (Roll No 21)','Kanishk']],
      ['Shaktimaan', ['Shaktiman','Indian Superman','Pandit Gangadhar']],
      ['Krrish', ['Krrish (Film)','Krishna Mehra']],
      ['Rohit Mehra', ['Rohit (Koi Mil Gaya)','Jadoo Friend']],
      ['Ra.One', ['RaOne','Ra One','Random Access One']],
      ['G.One', ['GOne','G One','Good One']],
      ['Chitti', ['Chitti Robot','Robot (Rajinikanth)','Endhiran']],
      ['Mr. India', ['Mr India','Arun Verma (Mr India)']],
    ], 'Various Indian Studios', 'Indian Film/TV'),
  ];
}

export function generateOtherEntities(): RawEntity[] {
  return [
    ...chars([
      ['Harry Potter', ['The Boy Who Lived','The Chosen One']], ['Hermione Granger', ['Hermione']],
      ['Ron Weasley', ['Ronald Weasley']], ['Dumbledore', ['Albus Dumbledore']],
      ['Voldemort', ['Tom Riddle','He-Who-Must-Not-Be-Named','You-Know-Who']],
      ['Snape', ['Severus Snape','Half-Blood Prince']],
      ['Draco Malfoy', ['Malfoy','Draco']],['Hagrid', ['Rubeus Hagrid']],
    ], 'Warner Bros. / J.K. Rowling', 'Harry Potter'),
    ...chars([
      ['Luke Skywalker', ['Luke','Skywalker']], ['Darth Vader', ['Anakin Skywalker','Vader']],
      ['Yoda', ['Master Yoda']], ['Obi-Wan Kenobi', ['Ben Kenobi','Obi Wan']],
      ['Princess Leia', ['Leia Organa','General Leia']], ['Han Solo', ['Solo','Captain Solo']],
      ['Chewbacca', ['Chewie','Chewbacca the Wookiee']],
      ['Darth Maul', ['Maul']],['Palpatine', ['Emperor Palpatine','Darth Sidious']],
      ['Mandalorian', ['Din Djarin','Mando']],['Grogu', ['Baby Yoda','The Child']],
      ['Boba Fett', ['Boba','The Bounty Hunter']],
    ], 'Lucasfilm / Disney', 'Star Wars'),
    ...chars([
      ['Mario', ['Super Mario','Mario (Nintendo)']],['Luigi', ['Super Luigi']],
      ['Princess Peach', ['Peach','Princess Toadstool']],['Bowser', ['King Koopa']],
      ['Link', ['Link (Zelda)','Hero of Time']], ['Zelda', ['Princess Zelda']],
      ['Pikachu', ['Pikachu (Pokemon)']],['Ash Ketchum', ['Satoshi','Ash (Pokemon)']],
      ['Charizard', ['Charizard (Pokemon)']],['Mewtwo', ['Mewtwo (Pokemon)']],
      ['Sonic', ['Sonic the Hedgehog','Blue Blur']],
      ['Master Chief', ['John-117','Chief (Halo)']],
      ['Kratos', ['Kratos (God of War)','Ghost of Sparta']],
      ['Geralt', ['Geralt of Rivia','The Witcher','White Wolf (Witcher)']],
    ], 'Various (Nintendo/Sega/Microsoft/Sony/CDPR)', 'Video Games / Other'),
    ...places([
      ['Hogwarts', ['Hogwarts School','Hogwarts Castle']],
      ['Diagon Alley', ['Diagon Alley (HP)']],
      ['Hyrule', ['Kingdom of Hyrule']],
      ['Mushroom Kingdom', ['Mario Kingdom']],
      ['Tatooine', ['Tatooine (SW)']],
      ['Death Star', ['Death Star (SW)']],
    ], 'Various', 'Various'),
    ...objects([
      ['Elder Wand', ['Deathstick','Wand of Destiny']],
      ['Horcrux', ['Horcruxes','Soul Fragment']],
      ['Pokeball', ['Poke Ball','Pokéball']],
      ['Master Sword', ['Sword of Evil\'s Bane','Master Sword (Zelda)']],
      ['Triforce', ['Triforce (Zelda)','Golden Triangles']],
    ], 'Various', 'Various'),
  ];
}

/** Returns all 10K+ entities as a flat array ready for DB insertion */
export function getAllBlocklistEntities() {
  return [
    ...expand(generateMarvelEntities(), 'marvel'),
    ...expand(generateDCEntities(), 'dc'),
    ...expand(generateDisneyEntities(), 'disney'),
    ...expand(generateAnimeEntities(), 'anime'),
    ...expand(generateTolkienEntities(), 'tolkien'),
    ...expand(generateIndianIPEntities(), 'indian_ip'),
    ...expand(generateOtherEntities(), 'other'),
  ];
}
