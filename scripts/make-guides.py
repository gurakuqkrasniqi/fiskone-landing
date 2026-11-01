# Builds udhezues.html (the guides index) and udhezues/<slug>.html from the articles below.
# Guides are in Albanian (the language of the market and of ATK's rules); the page notes it
# when someone reads in Serbian or English. Run: python scripts/make-guides.py
import html
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GUIDES = [
    {
        'slug': 'cfare-me-duhet',
        'category': 'Fillimi',
        'title': 'Çfarë më duhet për të lëshuar kuponë fiskalë pa kuti?',
        'summary': 'Lista e plotë: pajisja, të dhënat nga ATK dhe EDI, printeri, dhe çfarë bëjmë ne për ju.',
        'body': [
            ('p', 'Që nga Udhëzimi Administrativ 01/2026, kuponi fiskal mund të lëshohet edhe me <strong>softuer elektronik fiskal (SEF)</strong>, pa pajisje fiskale (kuti). SEF-i duhet të jetë i certifikuar nga ATK dhe çdo arkë merr certifikatën e vet.'),
            ('h2', 'Pajisja'),
            ('p', 'Një kompjuter me Windows 10 ose 11 (64-bit), ose një telefon/tablet me Android 7 e më të ri. Çelësi me të cilin nënshkruhen kuponët krijohet brenda pajisjes dhe nuk largohet prej saj.'),
            ('h2', 'Të dhënat e biznesit dhe të arkës'),
            ('ul', [
                'NUI-ja dhe, nëse jeni i regjistruar, numri i TVSH-së',
                'Adresa dhe numri i njësisë (dyqanit ose lokalit)',
                'Numri unik i fiskalizimit, që e merrni në sistemin EDI të ATK-së',
                'Numri i arkës (për secilën arkë, një numër i veçantë)',
            ]),
            ('h2', 'Printeri'),
            ('p', 'Një printer termik standard 58 ose 80 mm (ESC/POS), me USB, rrjet ose Bluetooth. Kuponi mund të shfaqet edhe në ekran me kodin QR, që klienti ta skanojë.'),
            ('h2', 'Çfarë bëjmë ne'),
            ('p', 'E instalojmë FiskOne, e lidhim arkën me ATK-në, i fusim produktet (edhe nga Excel) dhe ju trajnojmë. Pas kësaj, shitja e parë merr pak sekonda.'),
        ],
    },
    {
        'slug': 'arka-pa-internet',
        'category': 'Kuponët dhe arka',
        'title': 'Arka pa internet: si funksionon modaliteti offline',
        'summary': 'Kur bie interneti vazhdoni të shitni. Çfarë shkruhet në kupon dhe cilat janë afatet ligjore.',
        'body': [
            ('p', 'Mungesa e internetit nuk e ndal shitjen. Rregullat e ATK-së e parashikojnë <strong>modalitetin offline</strong>: arka vazhdon të lëshojë kuponë dhe i dërgon më vonë.'),
            ('h2', 'Çfarë ndodh në arkë'),
            ('ul', [
                'Në ekran shfaqet qartë shenja OFFLINE',
                'Çdo kupon printohet me fjalën OFFLINE dhe me kodin QR, si gjithmonë',
                'Numërimi i kuponëve vazhdon me radhë, pa ndërprerje',
                'Kuponët ruhen të enkriptuar në pajisje',
                'Sapo kthehet lidhja, arka i dërgon vetë te ATK, me radhën e lëshimit',
            ]),
            ('h2', 'Afatet'),
            ('p', 'Kuponët e lëshuar offline duhet t\'i dërgohen ATK-së brenda <strong>48 orëve</strong> nga ndërprerja. Nëse lidhja nuk kthehet deri më 10 të muajit pasues, tatimpaguesi i paraqet në ATK të gjithë kuponët e pafiskalizuar. FiskOne ju tregon në ekranin Gjendja sa kuponë presin dhe sa kohë ka mbetur, dhe i eksporton në CSV ose PDF kur ATK i kërkon.'),
        ],
    },
    {
        'slug': 'verifikimi-i-kuponit',
        'category': 'Kuponët dhe arka',
        'title': 'Si verifikohet kuponi fiskal me QR',
        'summary': 'Si e kontrollon klienti nëse kuponi është raportuar në ATK, dhe çfarë përmban kodi QR.',
        'body': [
            ('p', 'Çdo kupon fiskal ka një <strong>kod QR</strong>. Me të, blerësi kontrollon nëse kuponi është raportuar në ATK.'),
            ('h2', 'Si bëhet verifikimi'),
            ('ul', [
                'Skanoni kodin QR me aplikacionin e ATK-së ose me një aplikacion që lexon QR',
                'Ose hapni faqen e ATK-së për verifikim dhe shkruani të dhënat e kuponit, si NUIKF-ja (numri unik i kuponit)',
                'Hapet faqja me detajet e kuponit dhe statusin e tij te ATK',
            ]),
            ('h2', 'Çfarë ka në kod'),
            ('p', 'Kodi QR përmban të dhënat kryesore të kuponit (biznesi, numri, data, totali dhe TVSH-ja) dhe nënshkrimin digjital të arkës. Nënshkrimi tregon se kuponi nuk është ndryshuar pasi është lëshuar.'),
            ('h2', 'Kuponi në letër'),
            ('p', 'Blerësi duhet ta mbajë kuponin e marrë deri në 30 metra larg vendit të shitjes dhe t\'ia tregojë zyrtarit të ATK-së nëse kërkohet.'),
        ],
    },
    {
        'slug': 'kuponet-nga-blloku',
        'category': 'Kuponët dhe arka',
        'title': 'Kur prishet pajisja: kuponët nga blloku tatimor',
        'summary': 'Çfarë bëni kur arka nuk punon fare, sa kohë keni për ta rregulluar dhe si regjistrohen kuponët e shkruar me dorë.',
        'body': [
            ('p', 'Kur pajisja ndalon plotësisht, shitja vazhdon me <strong>bllokun e veçantë të kuponëve fiskalë</strong>, të fiskalizuar në ATK, me numër serik për çdo kupon dhe me dy kopje: origjinali për klientin, kopja për ju.'),
            ('h2', 'Afatet'),
            ('ul', [
                'Brenda 48 orëve nga ndalimi: rregulloni pajisjen ose vendosni një pajisje të re',
                'Brenda 5 ditëve pas atij afati: regjistroni në SEF të gjithë kuponët e shkruar me dorë',
            ]),
            ('h2', 'Si i regjistroni në FiskOne'),
            ('p', 'Menaxheri hap Kuponët → Kuponë nga blloku dhe shkruan për secilin: numrin e bllokut, numrin e kuponit, datën dhe orën, shumat sipas normës së TVSH-së dhe mënyrën e pagesës. FiskOne e regjistron dhe e lëshon si kupon që i dërgohet ATK-së. I njëjti kupon nuk mund të regjistrohet dy herë.'),
            ('h2', 'Pa pritur teknikun'),
            ('p', 'Me FiskOne, “pajisja e re” mund të jetë çdo kompjuter ose telefon: instaloni aplikacionin, regjistroni arkën dhe vazhdoni.'),
        ],
    },
]

HEAD = '''<!doctype html>
<html lang="sq" data-page="udhezues">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — FiskOne</title>
    <meta name="description" content="{desc}" />
    <meta name="theme-color" content="#081C2D" />
    <link rel="icon" href="/icon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icon-180.png" />
    <link rel="canonical" href="https://fiskone.com/{path}" />
    <meta property="og:title" content="{title} — FiskOne" />
    <meta property="og:image" content="https://fiskone.com/og.png" />
  </head>
  <body>
<!--#header-->
    <main id="main">
'''
FOOT = '''    </main>
<!--#footer-->
  </body>
</html>
'''
ONLY_SQ = '          <p class="lang-note" data-i18n="g.onlySq" data-show-in="sr en" hidden>Ky udhëzues është në shqip.</p>\n'


def render(block):
    kind, content = block
    if kind == 'ul':
        items = ''.join(f'<li>{c}</li>' for c in content)
        return f'          <ul>{items}</ul>\n'
    return f'          <{kind}>{content}</{kind}>\n'


os.makedirs(os.path.join(ROOT, 'udhezues'), exist_ok=True)
for g in GUIDES:
    body = ''.join(render(b) for b in g['body'])
    page = HEAD.format(title=html.escape(g['title']), desc=html.escape(g['summary']), path=f"udhezues/{g['slug']}")
    page += f'''      <article class="article">
        <div class="wrap wrap--narrow">
          <p class="crumbs"><a href="/udhezues" data-i18n="nav.guides">Udhëzues</a> · {html.escape(g['category'])}</p>
          <h1>{html.escape(g['title'])}</h1>
{ONLY_SQ}          <p class="lead">{html.escape(g['summary'])}</p>
{body}          <p class="more"><a href="/udhezues" data-i18n="g.back">← Të gjithë udhëzuesit</a></p>
        </div>
      </article>
'''
    page += FOOT
    open(os.path.join(ROOT, 'udhezues', g['slug'] + '.html'), 'w', encoding='utf-8', newline='\n').write(page)

cats = []
for g in GUIDES:
    if g['category'] not in cats:
        cats.append(g['category'])
index = HEAD.format(title='Udhëzues', desc='Përgjigje të shkurtra për fiskalizimin në Kosovë: çfarë ju duhet, arka pa internet, verifikimi i kuponit, kuponët nga blloku.', path='udhezues')
index += '''      <section class="page-hero">
        <div class="wrap">
          <p class="eyebrow" data-i18n="nav.guides">Udhëzues</p>
          <h1 data-i18n="g.title">Përgjigje të shkurtra për fiskalizimin</h1>
          <p class="lead" data-i18n="g.lead">Çfarë ju duhet, si punon arka pa internet, si verifikohet kuponi dhe çfarë bëni kur prishet pajisja.</p>
''' + ONLY_SQ.replace('Ky udhëzues është', 'Udhëzuesit janë').replace('g.onlySq', 'g.onlySqAll') + '''        </div>
      </section>
      <section class="section">
        <div class="wrap">
'''
for c in cats:
    index += f'          <h2 class="guides__cat">{html.escape(c)}</h2>\n          <div class="guides">\n'
    for g in [x for x in GUIDES if x['category'] == c]:
        index += f'''            <a class="guide-card" href="/udhezues/{g['slug']}">
              <h3>{html.escape(g['title'])}</h3>
              <p>{html.escape(g['summary'])}</p>
            </a>
'''
    index += '          </div>\n'
index += '''        </div>
      </section>
'''
index += FOOT
open(os.path.join(ROOT, 'udhezues.html'), 'w', encoding='utf-8', newline='\n').write(index)
print(f'{len(GUIDES)} guides and the index written')
