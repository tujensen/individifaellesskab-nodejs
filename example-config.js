var config = {};

config.mysql = {
  host     : 'localhost',
  user     : 'root',
  password : 'pass',
  database : 'mysql'
};
config.port = 3000;
config.blacklist = [
  '/sport/',
  '-sport-',
  'fodbold',
  'golf',
  'haandbold',
  'cykling',
  'boksning',
  'tennis',
  'superligaen',
  'badminton',
  'ishockey',
  'formel-1',
  '/vm/',
  '/em/'
];
config.interval = 86400; // One day.
config.debug = true;
config.urls = [
  'http://feeds.tv2.dk/nyheder/rss',
  'http://feeds.tv2.dk/nyhederne_seneste/rss',
  'http://feeds.tv2.dk/beep_seneste/rss',
  'http://feeds.tv2.dk/finans_seneste/rss',
  'http://feeds.tv2.dk/vejret_seneste/rss',
  'http://feeds.tv2.dk/livsstil_seneste/rss',
  'http://feeds.tv2.dk/mad_seneste/rss',
  'http://feeds.tv2.dk/underholdning_seneste/rss',
  'http://www.dr.dk/Nyheder/Service/feeds/Allenyheder',
  'http://www.dr.dk/Nyheder/Service/feeds/Indland',
  'http://www.dr.dk/Nyheder/Service/feeds/Udland',
  'http://www.dr.dk/Nyheder/Service/feeds/Politik',
  'http://www.dr.dk/Nyheder/Service/feeds/Kultur',
  'http://www.dr.dk/Nyheder/Service/feeds/Levnu',
  'http://www.dr.dk/Nyheder/Service/feeds/Viden',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/kbh/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/bornholm/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/syd/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/fyn/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/vest/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/nord/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/trekanten/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/sjaelland/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/oestjylland/',
  'http://www.dr.dk/Nyheder/Service/feeds/regionale/esbjerg/',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=nyheder',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=flash',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=112',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=musik',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=kendte',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=film',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=sex_og_samliv',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=ferie',
  'http://ekstrabladet.dk/rss2/?mode=normal&submode=biler',
  'http://ekstrabladet.dk/rssfeed/mest_laeste/',
  'http://ekstrabladet.dk/rssfeed/tv_rss/',
  'http://ekstrabladet.dk/rssfeed/RSS_Forbrug/',
  'http://ekstrabladet.dk/rssfeed/Sex_og_samliv/',
  'http://ekstrabladet.dk/rssfeed/Verden_p__vrangen_RSS/',
  'http://www.b.dk/nodequeue/383/rss',
  'http://www.b.dk/breaking/rss',
  'http://www.b.dk/seneste/rss',
  'http://www.b.dk/nodequeue/264/rss',
  'http://www.b.dk/feeds/rss/Nationalt',
  'http://www.b.dk/feeds/rss/Globalt',
  'http://www.b.dk/feeds/rss/Politiko',
  'http://www.b.dk/nodequeue/1598/rss',
  'http://www.b.dk/feeds/rss/Tech',
  'http://www.b.dk/feeds/rss/Viden',
  'http://www.b.dk/feeds/rss/Kultur',
  'http://www.b.dk/nodequeue/4985/rss',
  'http://www.b.dk/feeds/rss/Berlingske%20Mener',
  'http://www.bt.dk/bt/seneste/rss',
  'http://www.bt.dk/nyheder/seneste/rss',
  'http://www.bt.dk/underholdning/seneste/rss',
  'http://www.bt.dk/forbrug/seneste/rss',
  'http://www.bt.dk/sundhed/seneste/rss',
  'http://www.bt.dk/krimi/seneste/rss',
  'http://www.bt.dk/politik/seneste/rss',
  'http://www.bt.dk/musik/seneste/rss',
  'http://www.bt.dk/utroligt/seneste/rss',
  'http://www.bt.dk/biler/seneste/rss',
  'http://www.bt.dk/digital/seneste/rss',
  'http://jyllands-posten.dk/?service=rssfeed&submode=topnyheder',
  'http://jyllands-posten.dk/indland/?service=rssfeed',
  'http://jyllands-posten.dk/politik/?service=rssfeed',
  'http://jyllands-posten.dk/international/?service=rssfeed',
  'http://jyllands-posten.dk/kultur/?service=rssfeed',
  'http://jyllands-posten.dk/nyviden/?service=rssfeed',
  'http://jyllands-posten.dk/jptv/?service=rssfeed',
  'http://jyllands-posten.dk/?service=rssfeed&mode=top',
  'http://jyllands-posten.dk/index.jsp?service=rssfeed&submode=breakingnews',
  'http://jyllands-posten.dk/index.jsp?service=rssfeed&submode=seneste',
  'http://politiken.dk/rss/indland.rss',
  'http://politiken.dk/rss/magasinet.rss',
  'http://politiken.dk/rss/udland.rss',
  'http://politiken.dk/rss/kultur.rss',
  'http://politiken.dk/rss/debat.rss',
  'http://politiken.dk/rss/oekonomi.rss',
  'http://politiken.dk/rss/forbrugogliv.rss',
  'http://politiken.dk/rss/ibyen.rss',
  'http://politiken.dk/rss/mad.rss',
  'http://politiken.dk/rss/rejser.rss',
  'http://politiken.dk/rss/viden.rss',
  'http://politiken.dk/rss/navne.rss',
  'http://politiken.dk/rss/fotografier.rss',
  'http://politiken.dk/rss/tv.rss',
  'http://politiken.dk/rss/mestlaeste.rss',
  'http://politiken.dk/rss/senestenyt.rss',
  'http://politiken.dk/rss/tophistorier.rss',
  'https://www.information.dk/feed'
];

module.exports = config;
