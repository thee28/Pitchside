class Component extends DCLogic {
  state = { page: 'home', teamId: null, playerId: null, group: 'I' };

  // ---------- static data ----------
  flags = { MEX:'🇲🇽',RSA:'🇿🇦',KOR:'🇰🇷',CZE:'🇨🇿',SUI:'🇨🇭',CAN:'🇨🇦',BIH:'🇧🇦',QAT:'🇶🇦',BRA:'🇧🇷',MAR:'🇲🇦',SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿',HAI:'🇭🇹',USA:'🇺🇸',AUS:'🇦🇺',PAR:'🇵🇾',TUR:'🇹🇷',GER:'🇩🇪',CIV:'🇨🇮',ECU:'🇪🇨',CUR:'🇨🇼',NED:'🇳🇱',JPN:'🇯🇵',SWE:'🇸🇪',TUN:'🇹🇳',BEL:'🇧🇪',EGY:'🇪🇬',IRN:'🇮🇷',NZL:'🇳🇿',ESP:'🇪🇸',CPV:'🇨🇻',URU:'🇺🇾',KSA:'🇸🇦',FRA:'🇫🇷',NOR:'🇳🇴',SEN:'🇸🇳',IRQ:'🇮🇶',ARG:'🇦🇷',AUT:'🇦🇹',ALG:'🇩🇿',JOR:'🇯🇴',COL:'🇨🇴',POR:'🇵🇹',DRC:'🇨🇩',UZB:'🇺🇿',ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',CRO:'🇭🇷',GHA:'🇬🇭',PAN:'🇵🇦' };

  groups = {
    A:[['MEX','Mexico',3,3,0,0,'+6',9,'q'],['RSA','South Africa',3,1,1,1,'-1',4,'q'],['KOR','South Korea',3,1,0,2,'-1',3,'x'],['CZE','Czechia',3,0,1,2,'-4',1,'x']],
    B:[['SUI','Switzerland',3,2,1,0,'+5',7,'q'],['CAN','Canada',3,1,2,0,'+2',5,'q'],['BIH','Bosnia & Herz.',3,1,1,1,'-1',4,'t'],['QAT','Qatar',3,0,0,3,'-6',0,'x']],
    C:[['BRA','Brazil',3,2,1,0,'+6',7,'q'],['MAR','Morocco',3,2,1,0,'+3',7,'q'],['SCO','Scotland',3,1,0,2,'-3',3,'x'],['HAI','Haiti',3,0,0,3,'-6',0,'x']],
    D:[['USA','United States',3,2,0,1,'+3',6,'q'],['AUS','Australia',3,1,1,1,'0',4,'q'],['PAR','Paraguay',3,1,1,1,'-2',4,'t'],['TUR','Türkiye',3,1,0,2,'-1',3,'x']],
    E:[['GER','Germany',3,2,0,1,'+6',6,'q'],['CIV','Ivory Coast',3,2,0,1,'+2',6,'q'],['ECU','Ecuador',3,1,1,1,'0',4,'t'],['CUR','Curaçao',3,0,1,2,'-8',1,'x']],
    F:[['NED','Netherlands',3,2,1,0,'+6',7,'q'],['JPN','Japan',3,1,2,0,'+5',5,'q'],['SWE','Sweden',3,1,1,1,'-1',4,'t'],['TUN','Tunisia',3,0,0,3,'-10',0,'x']],
    G:[['BEL','Belgium',3,1,2,0,'+4',5,'q'],['EGY','Egypt',3,1,2,0,'+2',5,'q'],['IRN','Iran',3,0,3,0,'0',3,'x'],['NZL','New Zealand',3,0,1,2,'-6',1,'x']],
    H:[['ESP','Spain',3,2,1,0,'+5',7,'q'],['CPV','Cabo Verde',3,0,3,0,'0',3,'q'],['URU','Uruguay',3,0,2,1,'-1',2,'x'],['KSA','Saudi Arabia',3,0,2,1,'-4',2,'x']],
    I:[['FRA','France',3,3,0,0,'+7',9,'q'],['NOR','Norway',3,2,0,1,'+1',6,'q'],['SEN','Senegal',3,1,0,2,'+1',3,'t'],['IRQ','Iraq',3,0,0,3,'-9',0,'x']],
    J:[['ARG','Argentina',3,3,0,0,'+7',9,'q'],['AUT','Austria',3,1,1,1,'0',4,'q'],['ALG','Algeria',3,1,1,1,'0',4,'t'],['JOR','Jordan',3,0,0,3,'-7',0,'x']],
    K:[['COL','Colombia',3,2,1,0,'+4',7,'q'],['POR','Portugal',3,1,2,0,'+3',5,'q'],['DRC','DR Congo',3,1,1,1,'-1',4,'t'],['UZB','Uzbekistan',3,0,0,3,'-6',0,'x']],
    L:[['ENG','England',3,2,1,0,'+5',7,'q'],['CRO','Croatia',3,1,2,0,'+2',5,'q'],['GHA','Ghana',3,1,1,1,'0',4,'t'],['PAN','Panama',3,0,0,3,'-7',0,'x']]
  };

  players = {
    mbappe:{name:'Kylian Mbappé',flag:'🇫🇷',teamName:'France',teamId:'fra',pos:'Forward',num:10,goals:9,assists:3,rating:'8.8',mins:634,note:'GOLDEN BOOT · 9 GOALS',bars:[['Shot accuracy','70%',70],['Pass accuracy','84%',84],['Dribble success','63%',63],['Duels won','55%',55]],form:[['PAR',8.2],['MAR',8.6],['BRA',9.0],['ARG',9.4]]},
    olise:{name:'Michael Olise',flag:'🇫🇷',teamName:'France',teamId:'fra',pos:'Winger',num:14,goals:3,assists:7,rating:'8.5',mins:601,bars:[['Shot accuracy','56%',56],['Pass accuracy','89%',89],['Dribble success','71%',71],['Duels won','58%',58]],form:[['PAR',8.4],['MAR',8.1],['BRA',8.6],['ARG',8.8]]},
    tchouameni:{name:'Aurélien Tchouaméni',flag:'🇫🇷',teamName:'France',teamId:'fra',pos:'Midfielder',num:8,goals:1,assists:1,rating:'7.6',mins:690,bars:[['Shot accuracy','46%',46],['Pass accuracy','91%',91],['Dribble success','55%',55],['Duels won','69%',69]],form:[['PAR',7.5],['MAR',7.8],['BRA',7.4],['ARG',8.2]]},
    vinicius:{name:'Vinícius Júnior',flag:'🇧🇷',teamName:'Brazil',teamId:'bra',pos:'Winger',num:7,goals:3,assists:4,rating:'8.2',mins:604,bars:[['Shot accuracy','59%',59],['Pass accuracy','82%',82],['Dribble success','73%',73],['Duels won','52%',52]],form:[['JPN',8.0],['NOR',8.2],['ENG',7.8],['FRA',8.5]]},
    martinelli:{name:'Gabriel Martinelli',flag:'🇧🇷',teamName:'Brazil',teamId:'bra',pos:'Forward',num:11,goals:4,assists:1,rating:'7.9',mins:342,bars:[['Shot accuracy','64%',64],['Pass accuracy','80%',80],['Dribble success','65%',65],['Duels won','50%',50]],form:[['JPN',8.8],['NOR',8.4],['ENG',7.6],['FRA',7.8]]},
    casemiro:{name:'Casemiro',flag:'🇧🇷',teamName:'Brazil',teamId:'bra',pos:'Midfielder',num:5,goals:1,assists:0,rating:'7.5',mins:592,bars:[['Shot accuracy','50%',50],['Pass accuracy','88%',88],['Dribble success','48%',48],['Duels won','71%',71]],form:[['JPN',8.1],['NOR',7.6],['ENG',7.4],['FRA',7.2]]},
    balogun:{name:'Folarin Balogun',flag:'🇺🇸',teamName:'United States',teamId:'usa',pos:'Forward',num:20,goals:3,assists:0,rating:'7.9',mins:322,bars:[['Shot accuracy','66%',66],['Pass accuracy','76%',76],['Dribble success','52%',52],['Duels won','55%',55]],form:[['PAR',8.6],['AUS',7.7],['TUR',7.0],['BIH',8.2]]},
    tillman:{name:'Malik Tillman',flag:'🇺🇸',teamName:'United States',teamId:'usa',pos:'Midfielder',num:16,goals:2,assists:1,rating:'7.7',mins:457,bars:[['Shot accuracy','57%',57],['Pass accuracy','85%',85],['Dribble success','60%',60],['Duels won','53%',53]],form:[['AUS',8.0],['TUR',7.1],['BIH',8.3],['BEL',7.4]]},
    pulisic:{name:'Christian Pulisic',flag:'🇺🇸',teamName:'United States',teamId:'usa',pos:'Winger',num:10,goals:2,assists:2,rating:'7.6',mins:464,bars:[['Shot accuracy','55%',55],['Pass accuracy','83%',83],['Dribble success','66%',66],['Duels won','47%',47]],form:[['TUR',6.9],['BIH',7.8],['BEL',7.9]]},
    gimenez:{name:'Santiago Giménez',flag:'🇲🇽',teamName:'Mexico',teamId:'mex',pos:'Forward',num:9,goals:3,assists:0,rating:'7.7',mins:408,bars:[['Shot accuracy','64%',64],['Pass accuracy','74%',74],['Dribble success','50%',50],['Duels won','56%',56]],form:[['KOR',7.4],['CZE',8.4],['ECU',8.0],['ENG',6.8]]},
    mora:{name:'Gilberto Mora',flag:'🇲🇽',teamName:'Mexico',teamId:'mex',pos:'Midfielder',num:26,goals:2,assists:2,rating:'8.0',mins:391,bars:[['Shot accuracy','59%',59],['Pass accuracy','87%',87],['Dribble success','69%',69],['Duels won','50%',50]],form:[['KOR',8.1],['CZE',8.6],['ECU',8.1],['ENG',7.7]]},
    alvarezE:{name:'Edson Álvarez',flag:'🇲🇽',teamName:'Mexico',teamId:'mex',pos:'Midfielder',num:4,goals:0,assists:1,rating:'7.5',mins:450,bars:[['Shot accuracy','42%',42],['Pass accuracy','90%',90],['Dribble success','46%',46],['Duels won','72%',72]],form:[['KOR',7.2],['CZE',7.6],['ECU',7.8],['ENG',7.3]]},
    hakimi:{name:'Achraf Hakimi',flag:'🇲🇦',teamName:'Morocco',teamId:'mar',pos:'Right back',num:2,goals:1,assists:3,rating:'8.0',mins:570,bars:[['Shot accuracy','52%',52],['Pass accuracy','86%',86],['Dribble success','63%',63],['Duels won','61%',61]],form:[['HAI',8.2],['NED',8.1],['CAN',8.0],['FRA',7.6]]},
    ennesyri:{name:'Youssef En-Nesyri',flag:'🇲🇦',teamName:'Morocco',teamId:'mar',pos:'Forward',num:19,goals:4,assists:0,rating:'7.7',mins:512,bars:[['Shot accuracy','61%',61],['Pass accuracy','71%',71],['Dribble success','44%',44],['Duels won','63%',63]],form:[['HAI',8.3],['NED',7.4],['CAN',8.5],['FRA',7.2]]},
    diop:{name:'Issa Diop',flag:'🇲🇦',teamName:'Morocco',teamId:'mar',pos:'Centre back',num:5,goals:1,assists:0,rating:'7.6',mins:557,bars:[['Shot accuracy','48%',48],['Pass accuracy','89%',89],['Dribble success','35%',35],['Duels won','74%',74]],form:[['SCO',7.4],['HAI',7.2],['NED',8.5],['CAN',7.9]]},
    haaland:{name:'Erling Haaland',flag:'🇳🇴',teamName:'Norway',teamId:'nor',pos:'Forward',num:9,goals:5,assists:0,rating:'8.3',mins:448,bars:[['Shot accuracy','71%',71],['Pass accuracy','69%',69],['Dribble success','45%',45],['Duels won','58%',58]],form:[['SEN',8.6],['FRA',6.8],['CIV',8.7],['BRA',7.4]]},
    odegaard:{name:'Martin Ødegaard',flag:'🇳🇴',teamName:'Norway',teamId:'nor',pos:'Midfielder',num:10,goals:1,assists:3,rating:'7.9',mins:450,bars:[['Shot accuracy','53%',53],['Pass accuracy','90%',90],['Dribble success','62%',62],['Duels won','48%',48]],form:[['SEN',8.2],['FRA',6.9],['CIV',8.0],['BRA',7.7]]},
    sorloth:{name:'Alexander Sørloth',flag:'🇳🇴',teamName:'Norway',teamId:'nor',pos:'Forward',num:11,goals:2,assists:1,rating:'7.4',mins:344,bars:[['Shot accuracy','58%',58],['Pass accuracy','70%',70],['Dribble success','40%',40],['Duels won','66%',66]],form:[['SEN',7.6],['FRA',6.5],['CIV',7.7],['BRA',7.0]]},
    messi:{name:'Lionel Messi',flag:'🇦🇷',teamName:'Argentina',teamId:'arg',pos:'Forward',num:10,goals:5,assists:6,rating:'8.6',mins:583,note:'GOLDEN BALL · PLAYER OF THE TOURNAMENT',bars:[['Shot accuracy','67%',67],['Pass accuracy','88%',88],['Dribble success','73%',73],['Duels won','46%',46]],form:[['EGY',8.9],['COL',8.4],['ESP',8.7],['FRA',7.8]]},
    alvarezJ:{name:'Julián Álvarez',flag:'🇦🇷',teamName:'Argentina',teamId:'arg',pos:'Forward',num:9,goals:4,assists:2,rating:'8.0',mins:566,bars:[['Shot accuracy','63%',63],['Pass accuracy','79%',79],['Dribble success','57%',57],['Duels won','60%',60]],form:[['EGY',8.0],['COL',7.9],['ESP',8.2],['FRA',7.3]]},
    macallister:{name:'Alexis Mac Allister',flag:'🇦🇷',teamName:'Argentina',teamId:'arg',pos:'Midfielder',num:20,goals:1,assists:3,rating:'7.9',mins:655,bars:[['Shot accuracy','51%',51],['Pass accuracy','89%',89],['Dribble success','54%',54],['Duels won','62%',62]],form:[['EGY',7.8],['COL',8.1],['ESP',8.3],['FRA',7.5]]},
    kane:{name:'Harry Kane',flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',teamName:'England',teamId:null,pos:'Forward',num:9,goals:6,assists:1,rating:'8.2',mins:623,bars:[['Shot accuracy','70%',70],['Pass accuracy','81%',81],['Dribble success','43%',43],['Duels won','57%',57]],form:[['PAN',8.0],['DRC',9.2],['MEX',8.4],['BRA',7.9]]},
    gakpo:{name:'Cody Gakpo',flag:'🇳🇱',teamName:'Netherlands',teamId:null,pos:'Forward',num:11,goals:3,assists:1,rating:'7.9',mins:381,bars:[['Shot accuracy','61%',61],['Pass accuracy','82%',82],['Dribble success','59%',59],['Duels won','52%',52]],form:[['JPN',7.7],['SWE',8.5],['TUN',7.9],['MAR',7.8]]},
    ronaldo:{name:'Cristiano Ronaldo',flag:'🇵🇹',teamName:'Portugal',teamId:null,pos:'Forward',num:7,goals:3,assists:0,rating:'7.6',mins:436,bars:[['Shot accuracy','64%',64],['Pass accuracy','77%',77],['Dribble success','41%',41],['Duels won','50%',50]],form:[['UZB',8.1],['DRC',7.6],['CRO',8.4],['ESP',7.0]]},
    lukaku:{name:'Romelu Lukaku',flag:'🇧🇪',teamName:'Belgium',teamId:null,pos:'Forward',num:10,goals:4,assists:1,rating:'7.8',mins:487,bars:[['Shot accuracy','65%',65],['Pass accuracy','73%',73],['Dribble success','39%',39],['Duels won','64%',64]],form:[['IRN',6.8],['NZL',8.3],['SEN',8.6],['USA',7.9]]}
  };

  teams = {
    fra:{flag:'🇫🇷',name:'FRANCE',code:'FRA',group:'I',sub:'World Champions · beat Argentina 3–1 in the final',status:'World Champions · Jul 19',radar:[74,82,68,72,93,79],blurb:'Champions by counterattack. France conceded possession all tournament and broke at pace through Mbappé and Olise, scoring 18 goals in seven matches. Mbappé\u2019s brace in the final capped the run.',matches:[['GROUP I','SEN','🇸🇳','3–1','W','Jun 16'],['GROUP I','IRQ','🇮🇶','3–0','W','Jun 22'],['GROUP I','NOR','🇳🇴','4–1','W','Jun 26'],['ROUND OF 32','SWE','🇸🇪','3–0','W','Jun 30'],['ROUND OF 16','PAR','🇵🇾','2–0','W','Jul 4'],['QUARTER-FINAL','MAR','🇲🇦','2–1','W','Jul 9'],['SEMI-FINAL','BRA','🇧🇷','3–2','W','AET · Jul 14'],['FINAL','ARG','🇦🇷','3–1','W','Jul 19 · E. Rutherford']],bars:[['Goals per match','2.6',80],['xG per match','2.4',72],['Goals conceded / match','0.9',32]],players:['mbappe','olise','tchouameni']},
    arg:{flag:'🇦🇷',name:'ARGENTINA',code:'ARG',group:'J',sub:'Runners-up · lost the final 1–3 to France',status:'Runners-up · Jul 19',radar:[76,74,62,70,88,82],blurb:'A title defence that fell one match short. Argentina went unbeaten until the final, with Messi producing five goals and six assists at 39, before France\u2019s pace on the break decided East Rutherford.',matches:[['GROUP J','JOR','🇯🇴','3–0','W','Jun 17'],['GROUP J','AUT','🇦🇹','2–0','W','Jun 22'],['GROUP J','ALG','🇩🇿','2–0','W','Jun 27'],['ROUND OF 32','CPV','🇨🇻','3–0','W','Jul 3'],['ROUND OF 16','EGY','🇪🇬','2–0','W','Jul 7'],['QUARTER-FINAL','COL','🇨🇴','1–0','W','Jul 11'],['SEMI-FINAL','ESP','🇪🇸','1–1','W','Pens 4–2 · Jul 15'],['FINAL','FRA','🇫🇷','1–3','L','Jul 19 · E. Rutherford']],bars:[['Goals per match','1.9',56],['xG per match','2.0',60],['Goals conceded / match','0.6',22]],players:['messi','alvarezJ','macallister']},
    bra:{flag:'🇧🇷',name:'BRAZIL',code:'BRA',group:'C',sub:'Third place · beat Spain in the bronze final',status:'Third place · Jul 18',radar:[78,70,60,80,84,72],blurb:'Bronze medalists. Slow starts and big finishes. The five-goal semi-final against France was the match of the tournament, and they took third on the final weekend.',matches:[['GROUP C','MAR','🇲🇦','1–1','D','Jun 13'],['GROUP C','HAI','🇭🇹','3–0','W','Jun 19'],['GROUP C','SCO','🏴󠁧󠁢󠁳󠁣󠁴󠁿','3–0','W','Jun 24'],['ROUND OF 32','JPN','🇯🇵','2–1','W','Jun 29'],['ROUND OF 16','NOR','🇳🇴','2–1','W','Jul 5'],['QUARTER-FINAL','ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','1–1','W','Pens 4–3 · Jul 10'],['SEMI-FINAL','FRA','🇫🇷','2–3','L','AET · Jul 14'],['THIRD PLACE','ESP','🇪🇸','1–0','W','Jul 18 · Miami']],bars:[['Goals per match','2.0',60],['xG per match','2.0',60],['Goals conceded / match','0.9',32]],players:['vinicius','martinelli','casemiro']},
    mex:{flag:'🇲🇽',name:'MEXICO',code:'MEX',group:'A',sub:'Round of 16 · out to England at the Azteca',status:'Round of 16 · Jul 5',radar:[70,78,58,74,76,88],blurb:'The tournament\u2019s meanest group-stage defence: five matches, one goal conceded. England finally solved the block at the Azteca in the Round of 16.',matches:[['GROUP A','RSA','🇿🇦','2–0','W','Jun 11'],['GROUP A','KOR','🇰🇷','1–0','W','Jun 18'],['GROUP A','CZE','🇨🇿','3–0','W','Jun 24'],['ROUND OF 32','ECU','🇪🇨','2–0','W','Jul 1'],['ROUND OF 16','ENG','🏴󠁧󠁢󠁥󠁮󠁧󠁿','1–2','L','Jul 5 · Mexico City']],bars:[['Goals per match','1.8',54],['xG per match','1.6',48],['Goals conceded / match','0.4',15]],players:['gimenez','mora','alvarezE']},
    usa:{flag:'🇺🇸',name:'UNITED STATES',code:'USA',group:'D',sub:'Round of 16 · out on penalties to Belgium',status:'Round of 16 · Jul 6',radar:[62,86,74,66,72,70],blurb:'The hosts pressed in packs and scored off turnovers, but the run ended on penalties against Belgium while the suspended Balogun watched from the stands.',matches:[['GROUP D','PAR','🇵🇾','4–1','W','Jun 12'],['GROUP D','AUS','🇦🇺','2–0','W','Jun 19'],['GROUP D','TUR','🇹🇷','2–3','L','Jun 25'],['ROUND OF 32','BIH','🇧🇦','2–0','W','Jul 1'],['ROUND OF 16','BEL','🇧🇪','2–2','L','Pens 3–4 · Jul 6']],bars:[['Goals per match','2.4',70],['xG per match','2.1',62],['Goals conceded / match','1.2',42]],players:['balogun','tillman','pulisic']},
    mar:{flag:'🇲🇦',name:'MOROCCO',code:'MAR',group:'C',sub:'Quarter-finalists · only the champions beat them',status:'Quarter-finals · Jul 9',radar:[58,80,64,68,66,90],blurb:'Organized chaos for opponents, calm for Morocco. They beat the Netherlands on penalties and shut out Canada. Only the eventual champions ended the run, 2–1 in the quarter-final.',matches:[['GROUP C','BRA','🇧🇷','1–1','D','Jun 13'],['GROUP C','SCO','🏴󠁧󠁢󠁳󠁣󠁴󠁿','1–0','W','Jun 19'],['GROUP C','HAI','🇭🇹','4–2','W','Jun 24'],['ROUND OF 32','NED','🇳🇱','1–1','W','Pens 3–2 · Jun 29'],['ROUND OF 16','CAN','🇨🇦','1–0','W','Jul 4'],['QUARTER-FINAL','FRA','🇫🇷','1–2','L','Jul 9 · Boston']],bars:[['Goals per match','1.5',46],['xG per match','1.4',42],['Goals conceded / match','1.0',36]],players:['hakimi','ennesyri','diop']},
    nor:{flag:'🇳🇴',name:'NORWAY',code:'NOR',group:'I',sub:'Round of 16 · Haaland\u2019s five goals',status:'Round of 16 · Jul 5',radar:[54,66,88,62,74,68],blurb:'Route one, refined. Haaland\u2019s five goals carried Norway through the group and past Ivory Coast before Brazil ended the run in the Round of 16.',matches:[['GROUP I','IRQ','🇮🇶','4–1','W','Jun 16'],['GROUP I','SEN','🇸🇳','3–2','W','Jun 22'],['GROUP I','FRA','🇫🇷','1–4','L','Jun 26'],['ROUND OF 32','CIV','🇨🇮','2–1','W','Jun 30'],['ROUND OF 16','BRA','🇧🇷','1–2','L','Jul 5 · New Jersey']],bars:[['Goals per match','2.2',66],['xG per match','1.9',56],['Goals conceded / match','1.8',60]],players:['haaland','odegaard','sorloth']}
  };

  teamOrder = ['fra','arg','bra','mar','mex','usa','nor'];
  pendingTeams = [['🏴󠁧󠁢󠁥󠁮󠁧󠁿','ENGLAND','Quarter-finalists'],['🇪🇸','SPAIN','Fourth place'],['🇧🇪','BELGIUM','Quarter-finalists'],['🇨🇴','COLOMBIA','Quarter-finalists'],['🇨🇦','CANADA','Round of 16'],['🇵🇹','PORTUGAL','Round of 16'],['🇨🇭','SWITZERLAND','Round of 16'],['🇪🇬','EGYPT','Round of 16'],['🇵🇾','PARAGUAY','Round of 16']];

  koData = [
    ['FRA','ARG','France 3–1 Argentina','F','Jul 19 · E. Rutherford'],
    ['BRA','ESP','Brazil 1–0 Spain','3RD','Jul 18 · Miami'],
    ['FRA','BRA','France 3–2 Brazil','SF','AET · Jul 14'],
    ['ARG','ESP','Argentina 1–1 Spain','SF','Pens 4–2 · Jul 15'],
    ['FRA','MAR','France 2–1 Morocco','QF','Jul 9 · Boston'],
    ['BRA','ENG','Brazil 1–1 England','QF','Pens 4–3 · Jul 10'],
    ['ESP','BEL','Spain 2–0 Belgium','QF','Jul 11 · Miami'],
    ['ARG','COL','Argentina 1–0 Colombia','QF','Jul 11 · Kansas City']
  ];

  r32 = [
    ['RSA',0,'CAN',1,'b','FT · Jun 28'],
    ['NED',1,'MAR',1,'b','PENS 3–2 · Jun 29'],
    ['FRA',3,'SWE',0,'a','FT · Jun 30'],
    ['GER',1,'PAR',1,'b','PENS 4–3 · Jun 29'],
    ['BRA',2,'JPN',1,'a','FT · Jun 29'],
    ['CIV',1,'NOR',2,'b','FT · Jun 30'],
    ['MEX',2,'ECU',0,'a','FT · Jul 1'],
    ['ENG',2,'DRC',1,'a','FT · Jul 1'],
    ['ESP',3,'AUT',0,'a','FT · Jul 2'],
    ['POR',2,'CRO',1,'a','FT · Jul 2'],
    ['BEL',3,'SEN',2,'a','AET · Jul 1'],
    ['USA',2,'BIH',0,'a','FT · Jul 1'],
    ['AUS',0,'EGY',1,'b','FT · Jul 2'],
    ['ARG',3,'CPV',0,'a','FT · Jul 3'],
    ['SUI',3,'ALG',0,'a','FT · Jul 2'],
    ['COL',2,'GHA',1,'a','FT · Jul 3']
  ];
  r16 = [
    ['CAN',0,'MAR',1,'b','FT · Jul 4'],
    ['FRA',2,'PAR',0,'a','FT · Jul 4'],
    ['BRA',2,'NOR',1,'a','FT · Jul 5'],
    ['MEX',1,'ENG',2,'b','FT · Jul 5'],
    ['ESP',1,'POR',0,'a','FT · Jul 6'],
    ['BEL',2,'USA',2,'a','PENS 4–3 · Jul 6'],
    ['EGY',0,'ARG',2,'b','FT · Jul 7'],
    ['SUI',0,'COL',1,'b','FT · Jul 7']
  ];
  qf = [
    ['MAR',1,'FRA',2,'b','FT · Jul 9'],
    ['BRA',1,'ENG',1,'a','PENS 4–3 · Jul 10'],
    ['ESP',2,'BEL',0,'a','FT · Jul 11'],
    ['ARG',1,'COL',0,'a','FT · Jul 11']
  ];
  sf = [
    ['FRA',3,'BRA',2,'a','AET · Jul 14'],
    ['ARG',1,'ESP',1,'a','PENS 4–2 · Jul 15']
  ];
  fin = [
    ['FRA',3,'ARG',1,'a','CHAMPIONS · FT · Jul 19','champ'],
    ['BRA',1,'ESP',0,'a','THIRD PLACE · Jul 18','third']
  ];

  boardIds = ['mbappe','kane','haaland','messi','lukaku','ennesyri','martinelli','alvarezJ','balogun','olise'];

  // ---------- helpers ----------
  nav(page, extra) { this.setState(Object.assign({ page, teamId: null, playerId: null }, extra || {})); }

  dotStyle(q) {
    const c = q === 'q' ? '#F5F5F0' : q === 't' ? 'rgba(250,250,247,0.55)' : 'rgba(28,26,22,0.4)';
    return { width: 4, height: 4, borderRadius: '50%', background: c, flex: '0 0 auto' };
  }
  rowsFor(letter) {
    return (this.groups[letter] || []).map(r => ({
      flag: this.flags[r[0]], name: r[1], p: r[2], w: r[3], d: r[4], l: r[5], gd: r[6], pts: r[7],
      dotStyle: this.dotStyle(r[8])
    }));
  }
  initials(name) { return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase(); }

  radarPts(vals) {
    const cx = 120, cy = 120, R = 86;
    return vals.map((v, i) => {
      const a = (-90 + i * 60) * Math.PI / 180;
      const r = R * v / 100;
      return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
    }).join(' ');
  }

  renderVals() {
    const s = this.state;
    const variant = this.props.heroVariant ?? 'floodlit';

    const navDefs = [['Groups', 'home'], ['Teams', 'teams'], ['Players', 'leaders'], ['Bracket', 'bracket']];
    const navActive = s.page === 'team' ? 'teams' : s.page === 'player' ? 'leaders' : s.page;
    const navLinks = navDefs.map(([label, page]) => ({
      label,
      go: () => this.nav(page),
      style: {
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
        fontSize: 13, fontWeight: navActive === page ? 500 : 400, padding: '19px 2px 17px',
        color: navActive === page ? '#FAFAF7' : 'rgba(250,250,247,0.6)',
        borderBottom: navActive === page ? '2px solid #F5F5F0' : '2px solid transparent',
        transition: 'color 150ms'
      }
    }));

    const groupTabs = 'ABCDEFGHIJKL'.split('').map(l => ({
      label: l,
      pick: () => this.setState({ group: l }),
      style: {
        background: s.group === l ? '#F5F5F0' : 'none', color: s.group === l ? '#2E4228' : 'rgba(250,250,247,0.6)',
        border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 11,
        fontWeight: 500, width: 22, height: 22, padding: 0, lineHeight: '22px'
      }
    }));

    const specialFates = { FRA: 'World Champions', ARG: 'Runners-up', BRA: 'Third place', ESP: 'Fourth place' };
    const fateOf = code => {
      if (specialFates[code]) return specialFates[code];
      const rounds = [[this.qf, 'Out in quarter-finals'], [this.r16, 'Out in Round of 16'], [this.r32, 'Out in Round of 32']];
      for (const [arr, label] of rounds) {
        if (arr.some(m => m[0] === code || m[2] === code)) return label;
      }
      return null;
    };
    const knockoutRuns = (this.groups[s.group] || [])
      .map(r => ({ code: r[0], name: r[1], fate: fateOf(r[0]) }))
      .filter(r => r.fate)
      .map(r => ({
        flag: this.flags[r.code], name: r.name, fate: r.fate,
        fateStyle: {
          fontSize: 11, fontWeight: specialFates[r.code] ? 700 : 500,
          color: r.code === 'FRA' ? '#F8A828' : specialFates[r.code] ? '#FAFAF7' : 'rgba(250,250,247,0.62)'
        }
      }));

    const koResults = this.koData.map(u => ({
      fa: this.flags[u[0]], fb: this.flags[u[1]], teams: u[2], stage: u[3], when: u[4]
    }));

    const tourStats = [
      { value: '104', label: 'Matches played' },
      { value: '291', label: 'Goals scored' },
      { value: '2.8', label: 'Goals per match' }
    ];

    // teams index
    const cardBase = {
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left',
      background: '#4A6741', border: '1.5px solid rgba(250,250,247,0.55)', padding: '20px', cursor: 'pointer',
      fontFamily: "'DM Sans',sans-serif", transition: 'border-color 150ms'
    };
    const nameBase = { fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '0.04em', color: '#FAFAF7', marginTop: 10 };
    const subBase = { fontSize: 11, color: 'rgba(250,250,247,0.62)', marginTop: 2 };
    const teamCards = this.teamOrder.map(id => {
      const t = this.teams[id];
      const champ = id === 'fra';
      return {
        flag: t.flag, name: t.name, sub: t.sub.split(' · ')[0],
        tag: 'SCOUT REPORT →',
        nameStyle: champ ? Object.assign({}, nameBase, { color: '#FAFAF7' }) : nameBase,
        subStyle: champ ? Object.assign({}, subBase, { color: 'rgba(250,250,247,0.85)' }) : subBase,
        tagStyle: { fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', color: champ ? '#FAFAF7' : '#F5F5F0', marginTop: 14 },
        open: () => this.setState({ page: 'team', teamId: id, playerId: null }),
        style: champ ? Object.assign({}, cardBase, { background: '#F8A828', border: '1.5px solid #FAFAF7' }) : cardBase,
        hoverStyle: champ ? { borderColor: '#2E4228' } : { borderColor: '#FAFAF7' }
      };
    }).concat(this.pendingTeams.map(p => ({
      flag: p[0], name: p[1], sub: p[2], tag: 'FULL REPORT SOON',
      nameStyle: nameBase, subStyle: subBase,
      tagStyle: { fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', color: 'rgba(250,250,247,0.55)', marginTop: 14 },
      open: () => {}, style: Object.assign({}, cardBase, { cursor: 'default' }), hoverStyle: {}
    })));

    // team profile
    const team = s.teamId ? this.teams[s.teamId] : null;
    const chipStyle = res => ({
      fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', padding: '2px 7px',
      color: res === 'W' ? '#CFE6BE' : res === 'D' ? '#F0D9A0' : '#F2B3A0',
      background: res === 'W' ? 'rgba(207,230,190,0.16)' : res === 'D' ? 'rgba(240,217,160,0.14)' : 'rgba(242,179,160,0.16)'
    });
    const fillStyle = (pct, warn) => ({
      height: '100%', width: pct + '%', background: warn ? '#F8A828' : '#F5F5F0',
      transformOrigin: 'left', animation: 'psBar 600ms ease-out'
    });
    let teamVals = {};
    if (team) {
      const champTeam = s.teamId === 'fra';
      const heroInk = champTeam ? '#FAFAF7' : '#2E4228';
      const heroMuted = champTeam ? 'rgba(250,250,247,0.85)' : 'rgba(46,66,40,0.62)';
      Object.assign(teamVals, {
        teamHeroStyle: { background: champTeam ? '#F8A828' : '#FAFAF7', borderBottom: champTeam ? '1.5px solid #FAFAF7' : '1.5px solid #4A6741' },
        teamHeroBackStyle: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: heroMuted },
        teamHeroNameStyle: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(28px,5vw,40px)', lineHeight: 1, letterSpacing: '0.04em', color: heroInk },
        teamHeroSubStyle: { fontSize: 12, color: heroMuted, marginTop: 4 },
        teamHeroLabelStyle: { fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', color: heroMuted },
        teamHeroStatusStyle: { fontSize: 13, color: heroMuted, marginTop: 3 }
      });
      const axesNames = ['Possession', 'Pressing', 'Directness', 'Width', 'Creation', 'Defending'];
      const cx = 120, cy = 120;
      Object.assign(teamVals, {
        team,
        radarRing1: this.radarPts([33,33,33,33,33,33]),
        radarRing2: this.radarPts([66,66,66,66,66,66]),
        radarRing3: this.radarPts([100,100,100,100,100,100]),
        radarData: this.radarPts(team.radar),
        radarAxes: axesNames.map((n, i) => {
          const a = (-90 + i * 60) * Math.PI / 180;
          return { x: (cx + 86 * Math.cos(a)).toFixed(1), y: (cy + 86 * Math.sin(a)).toFixed(1) };
        }),
        radarLabels: axesNames.map((n, i) => {
          const a = (-90 + i * 60) * Math.PI / 180;
          const x = cx + 103 * Math.cos(a), y = cy + 103 * Math.sin(a);
          return { x: x.toFixed(1), y: (y + 3).toFixed(1), t: n, anchor: Math.abs(Math.cos(a)) < 0.3 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end') };
        }),
        teamGroupRows: this.rowsFor(team.group),
        teamBars: team.bars.map(b => ({ label: b[0], val: b[1], fillStyle: fillStyle(b[2], b[0].indexOf('conceded') >= 0) })),
        teamMatches: team.matches.map(m => ({
          stage: m[0], opp: m[1], flag: m[2], score: m[3], res: m[4], note: m[5], chipStyle: chipStyle(m[4])
        })),
        teamPlayers: team.players.map(pid => {
          const p = this.players[pid];
          return {
            name: p.name, pos: p.pos, goals: p.goals, assists: p.assists, rating: p.rating,
            initials: this.initials(p.name),
            open: () => this.setState({ page: 'player', playerId: pid })
          };
        })
      });
    }

    // player page
    const player = s.playerId ? this.players[s.playerId] : null;
    let playerVals = {};
    if (player) {
      playerVals = {
        player: Object.assign({ initials: this.initials(player.name) }, player),
        playerNote: player.note || false,
        playerBack: () => player.teamId
          ? this.setState({ page: 'team', teamId: player.teamId, playerId: null })
          : this.nav('leaders'),
        playerBackLabel: player.teamId ? this.teams[player.teamId].name.charAt(0) + this.teams[player.teamId].name.slice(1).toLowerCase() : 'Leaders',
        playerTiles: [
          { value: player.goals, label: 'Goals' },
          { value: player.assists, label: 'Assists' },
          { value: player.rating, label: 'Avg rating' },
          { value: player.mins + '′', label: 'Minutes' }
        ],
        playerBars: player.bars.map(b => ({ label: b[0], val: b[1], fillStyle: fillStyle(b[2], b[2] < 50) })),
        playerForm: player.form.map(f => ({
          opp: f[0], r: f[1].toFixed(1),
          barStyle: { width: 26, height: Math.round(f[1] / 10 * 84), background: f[1] >= 7.5 ? '#F5F5F0' : '#F8A828', transformOrigin: 'bottom', animation: 'psBar 600ms ease-out' }
        }))
      };
    }

    // bracket
    const cardKinds = {
      def: {
        card: { background: '#4A6741', border: '1.5px solid rgba(250,250,247,0.55)', padding: '10px 12px' },
        win: '#FAFAF7', lose: 'rgba(250,250,247,0.6)', winScore: '#FAFAF7', loseScore: 'rgba(250,250,247,0.45)',
        note: 'rgba(250,250,247,0.55)', noteWeight: 500
      },
      champ: {
        card: { background: '#F8A828', border: '1.5px solid #FAFAF7', padding: '10px 12px' },
        win: '#FAFAF7', lose: 'rgba(250,250,247,0.78)', winScore: '#FAFAF7', loseScore: 'rgba(250,250,247,0.7)',
        note: '#FAFAF7', noteWeight: 700
      },
      third: {
        card: { background: '#FAFAF7', border: '1.5px solid #4A6741', padding: '10px 12px' },
        win: '#2E4228', lose: 'rgba(46,66,40,0.55)', winScore: '#2E4228', loseScore: 'rgba(46,66,40,0.5)',
        note: '#4A6741', noteWeight: 700
      }
    };
    const mk = m => {
      const [ca, sa, cb, sb, w, note, kind] = m;
      const k = cardKinds[kind] || cardKinds.def;
      const teamStyle = win => ({ fontSize: 12, fontWeight: win ? 700 : 500, color: win ? k.win : k.lose });
      const scoreStyle = win => ({ fontFamily: "'Bebas Neue',sans-serif", fontSize: 17, lineHeight: 1, color: win ? k.winScore : k.loseScore });
      return {
        fa: this.flags[ca], fb: this.flags[cb], ca, cb, sa, sb,
        aStyle: teamStyle(w === 'a'), bStyle: teamStyle(w === 'b'),
        asStyle: scoreStyle(w === 'a'), bsStyle: scoreStyle(w === 'b'),
        note, noteStyle: { fontSize: 9.5, fontWeight: k.noteWeight, letterSpacing: '0.05em', color: k.note },
        cardStyle: k.card
      };
    };
    const bracketCols = [
      { title: 'Round of 32', sub: 'Jun 28 – Jul 3', matches: this.r32.map(mk) },
      { title: 'Round of 16', sub: 'Jul 4 – 7', matches: this.r16.map(mk) },
      { title: 'Quarter-finals', sub: 'Jul 9 – 11', matches: this.qf.map(mk) },
      { title: 'Semi-finals', sub: 'Jul 14 – 15', matches: this.sf.map(mk) },
      { title: 'Final · Third place', sub: 'Jul 18 – 19 · East Rutherford', matches: this.fin.map(mk) }
    ];

    // leaders
    const openPlayer = pid => () => this.setState({ page: 'player', playerId: pid });
    const board = this.boardIds.map((pid, i) => Object.assign({ pid, rank: i + 1 }, this.players[pid]));
    const medals = ['#F8A828', '#A9AFA6', '#BC8A62'];
    const topThree = board.slice(0, 3).map((p, i) => ({
      rank: p.rank, name: p.name, flag: p.flag, teamName: p.teamName, goals: p.goals,
      initials: this.initials(p.name), open: openPlayer(p.pid),
      style: {
        background: medals[i], border: '1.5px solid rgba(250,250,247,0.7)', padding: '18px 20px',
        cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif",
        display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 150ms'
      },
      hoverStyle: { borderColor: '#FAFAF7' }
    }));
    const rowStyle = {
      display: 'grid', gridTemplateColumns: '28px 1fr repeat(3, minmax(40px, 56px))', gap: '0 8px',
      alignItems: 'center', width: '100%', background: 'none', border: 'none', borderTop: '0.5px solid rgba(250,250,247,0.25)',
      padding: '9px 0', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans',sans-serif", transition: 'background 150ms'
    };
    const boardRows = board.map(p => ({
      rank: p.rank, flag: p.flag, name: p.name, teamCode: p.teamName,
      goals: p.goals, assists: p.assists, mins: p.mins + '′',
      open: openPlayer(p.pid), style: rowStyle, hoverStyle: { background: 'rgba(250,250,247,0.12)' }
    }));
    const assistRows = [['olise', 7], ['messi', 6], ['vinicius', 4]].map(([pid, n]) => ({
      flag: this.players[pid].flag, name: this.players[pid].name, n
    }));
    const awards = [
      { flag: '🇫🇷', name: 'Kylian Mbappé', award: 'Golden Boot', detail: '9 goals' },
      { flag: '🇦🇷', name: 'Lionel Messi', award: 'Golden Ball', detail: '5 G · 6 A' },
      { flag: '🇫🇷', name: 'Mike Maignan', award: 'Golden Glove', detail: '4 clean sheets' }
    ];

    return Object.assign({
      isHome: s.page === 'home', isTeams: s.page === 'teams', isTeam: s.page === 'team' && !!team,
      isPlayer: s.page === 'player' && !!player, isBracket: s.page === 'bracket', isLeaders: s.page === 'leaders',
      heroFloodlit: variant === 'floodlit', heroBroadcast: variant === 'broadcast', heroTicker: variant === 'ticker',
      showHeroStats: this.props.showHeroStats ?? true,
      navLinks, groupTabs,
      standingsRows: this.rowsFor(s.group),
      koResults, knockoutRuns, tourStats, teamCards, bracketCols, topThree, boardRows, assistRows, awards,
      goHome: () => this.nav('home'),
      goTeams: () => this.nav('teams'),
      goBracket: () => this.nav('bracket'),
      goLeaders: () => this.nav('leaders'),
      goChampions: () => this.setState({ page: 'team', teamId: 'fra', playerId: null }),
      goRunnersUp: () => this.setState({ page: 'team', teamId: 'arg', playerId: null })
    }, teamVals, playerVals);
  }
}
