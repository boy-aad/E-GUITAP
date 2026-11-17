"""Génère les illustrations SVG des offres (style plat, palette de la charte, 800x600, sans texte).

Usage : python scripts/generate-offer-illustrations.py public/assets/illustrations
Écrit aussi src/content/offerIllustrations.ts (liste des illustrations disponibles).
Un slug d'offre ajouté dans l'administration sans illustration reçoit celle de sa catégorie.
"""
import os, sys

OUT = sys.argv[1]
M, ML, MD, G, GL, IV, IVD, W = '#102C50', '#173A66', '#0A1C33', '#C6A15B', '#E8D7B0', '#F5F1E8', '#E9E3D5', '#FFFFFF'
LAT = '#B5653B'      # latérite (terre rouge) — teinte dérivée, discrète
LATL = '#CF8A5C'
GR, GRL = '#009460', '#4FB386'  # vert Guinée (accent ≤ 5 %)
RED, YEL = '#CE1126', '#FCD116'

def svg(body, dark=False):
    bg = (f'<defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{MD}"/>'
          f'<stop offset="1" stop-color="{ML}"/></linearGradient></defs><rect width="800" height="600" fill="url(#b)"/>'
          if dark else f'<rect width="800" height="600" fill="{IV}"/>')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-hidden="true">'
            f'{bg}{body}</svg>')

def sun(x=640, y=130, r=46, c=G): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}" opacity=".9"/>'
def hills(dark=False):
    a, b = (ML, M) if dark else (IVD, GL)
    return (f'<path d="M0 360 Q160 300 320 345 T640 330 T800 340 V600 H0Z" fill="{a}"/>'
            f'<path d="M0 400 Q200 370 400 395 T800 390 V600 H0Z" fill="{b}" opacity=".7"/>')
def ground(c=LAT, y=430): return f'<path d="M0 {y} Q400 {y-20} 800 {y} V600 H0Z" fill="{c}"/>'
def tree(x, y, s=1, c=GR):
    return (f'<rect x="{x-3*s}" y="{y-10*s}" width="{6*s}" height="{24*s}" fill="{M}"/>'
            f'<circle cx="{x}" cy="{y-24*s}" r="{18*s}" fill="{c}"/>')
def trees(lst): return ''.join(tree(*t) for t in lst)
def person(x, y, c=M, hat=YEL):
    return (f'<circle cx="{x}" cy="{y-58}" r="9" fill="{c}"/><path d="M{x-12} {y-62}h24v-5a12 12 0 0 0-24 0z" fill="{hat}"/>'
            f'<rect x="{x-10}" y="{y-48}" width="20" height="30" rx="6" fill="{c}"/>'
            f'<rect x="{x-9}" y="{y-18}" width="7" height="18" fill="{c}"/><rect x="{x+2}" y="{y-18}" width="7" height="18" fill="{c}"/>')

def excavator(x, y, s=1, flip=False):
    t = f'translate({x} {y}) scale({-s if flip else s} {s})'
    return (f'<g transform="{t}">'
            f'<rect x="-90" y="-30" width="180" height="30" rx="15" fill="{MD}"/>'
            + ''.join(f'<circle cx="{cx}" cy="-15" r="10" fill="{ML}"/>' for cx in (-65, -30, 5, 40, 70)) +
            f'<rect x="-70" y="-90" width="120" height="60" rx="6" fill="{G}"/>'
            f'<rect x="-10" y="-130" width="60" height="45" rx="6" fill="{G}"/><rect x="0" y="-122" width="40" height="26" rx="3" fill="{M}" opacity=".85"/>'
            f'<rect x="-80" y="-80" width="25" height="40" fill="{GL}"/>'
            f'<path d="M40 -95 L150 -175 L165 -160 L60 -80Z" fill="{G}"/>'
            f'<path d="M150 -175 L215 -110 L200 -98 L140 -158Z" fill="{G}"/>'
            f'<path d="M200 -110 L240 -95 L225 -55 L190 -70Z" fill="{M}"/></g>')

def dump_truck(x, y, s=1, load=LAT):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M-120 -95 L60 -95 L80 -40 L-120 -40Z" fill="{G}"/>'
            f'<path d="M-110 -95 Q-20 -150 50 -95Z" fill="{load}"/>'
            f'<rect x="80" y="-90" width="60" height="55" rx="6" fill="{M}"/><rect x="92" y="-82" width="36" height="22" rx="3" fill="{GL}"/>'
            f'<rect x="-120" y="-40" width="260" height="14" fill="{MD}"/>'
            + ''.join(f'<circle cx="{cx}" cy="-18" r="20" fill="{MD}"/><circle cx="{cx}" cy="-18" r="8" fill="{GL}"/>' for cx in (-85, -35, 105)) +
            '</g>')

def bulldozer(x, y, s=1):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<rect x="-80" y="-30" width="150" height="30" rx="15" fill="{MD}"/>'
            f'<rect x="-60" y="-80" width="110" height="50" rx="6" fill="{G}"/>'
            f'<rect x="-30" y="-125" width="55" height="48" rx="5" fill="{G}"/><rect x="-22" y="-117" width="38" height="26" fill="{M}" opacity=".85"/>'
            f'<path d="M70 -70 L110 -80 L120 0 L80 0Z" fill="{M}"/></g>')

def road(dark=False):
    return (f'<path d="M330 600 C380 500 470 470 470 420 C470 370 380 360 400 320" stroke="{M if not dark else MD}" stroke-width="120" fill="none" stroke-linecap="round"/>'
            f'<path d="M330 600 C380 500 470 470 470 420 C470 370 380 360 400 320" stroke="{GL}" stroke-width="5" stroke-dasharray="26 22" fill="none"/>')

def parcels(x0=110, y0=330, cols=5, rows=3, w=110, h=70, gap=14, fill=GRL, line=G, mark=True):
    out = []
    for r in range(rows):
        for c in range(cols):
            x = x0 + c * (w + gap) + r * 18
            y = y0 + r * (h + gap)
            out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" opacity=".85" stroke="{line}" stroke-width="3"/>')
            if mark: out.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{M}"/>')
    return ''.join(out)

def building(x, y, w=150, floors=5, c=M, crane=False, scaffold=False):
    fh = 46
    out = [f'<rect x="{x}" y="{y-floors*fh}" width="{w}" height="{floors*fh}" fill="{c}"/>']
    for f in range(floors):
        for k in range(3):
            out.append(f'<rect x="{x+16+k*(w-32)/3}" y="{y-(f+1)*fh+12}" width="{(w-32)/3-12}" height="22" fill="{GL}" opacity=".9"/>')
    if scaffold:
        out.append(f'<rect x="{x-14}" y="{y-floors*fh-40}" width="{w+28}" height="{floors*fh+40}" fill="none" stroke="{G}" stroke-width="4" stroke-dasharray="6 10"/>')
    if crane:
        cx = x + w + 60
        out.append(f'<rect x="{cx}" y="{y-floors*fh-150}" width="14" height="{floors*fh+150}" fill="{G}"/>'
                   f'<rect x="{cx-170}" y="{y-floors*fh-160}" width="260" height="14" fill="{G}"/>'
                   f'<line x1="{cx-120}" y1="{y-floors*fh-146}" x2="{cx-120}" y2="{y-floors*fh-60}" stroke="{M}" stroke-width="3"/>'
                   f'<rect x="{cx-140}" y="{y-floors*fh-60}" width="40" height="22" fill="{LAT}"/>')
    return ''.join(out)

def house(x, y, s=1, c=M, roof=LAT):
    return (f'<g transform="translate({x} {y}) scale({s})"><rect x="-50" y="-70" width="100" height="70" fill="{c}"/>'
            f'<path d="M-62 -68 L0 -115 L62 -68Z" fill="{roof}"/><rect x="-12" y="-38" width="24" height="38" fill="{G}"/>'
            f'<rect x="-40" y="-55" width="20" height="18" fill="{GL}"/><rect x="20" y="-55" width="20" height="18" fill="{GL}"/></g>')

def factory(x, y):
    return (f'<rect x="{x}" y="{y-110}" width="200" height="110" fill="{M}"/>'
            f'<path d="M{x} {y-110} l50 -40 v40 l50 -40 v40 l50 -40 v40 l50 -40 v40z" fill="{ML}"/>'
            f'<rect x="{x+150}" y="{y-220}" width="24" height="110" fill="{MD}"/>'
            + ''.join(f'<rect x="{x+20+i*45}" y="{y-80}" width="28" height="28" fill="{GL}"/>' for i in range(4)))

def crops(x, y, rows=5):
    return ''.join(f'<path d="M{x} {y+i*16} q60 -10 120 0" stroke="{GR}" stroke-width="7" fill="none"/>' for i in range(rows))

def pile(x, y, w=220, h=110, c=LAT):
    return f'<path d="M{x-w/2} {y} Q{x} {y-h*1.7} {x+w/2} {y}Z" fill="{c}"/><path d="M{x-w/4} {y} Q{x} {y-h*1.1} {x+w/3} {y}Z" fill="{LATL}" opacity=".7"/>'

def sandbags(x, y, c=GL):
    return ''.join(f'<rect x="{x+i*70}" y="{y-40}" width="62" height="40" rx="10" fill="{c}" stroke="{G}" stroke-width="3"/>' for i in range(3))

def boxes(x, y, cols=4, rows=3, s=60):
    out = []
    for r in range(rows):
        for c in range(cols - (r % 2)):
            bx = x + c * (s + 6) + (r % 2) * s / 2
            by = y - (r + 1) * (s + 4)
            out.append(f'<rect x="{bx}" y="{by}" width="{s}" height="{s}" fill="{G if (r+c)%2 else GL}" stroke="{M}" stroke-width="3"/>'
                       f'<line x1="{bx}" y1="{by+s/2}" x2="{bx+s}" y2="{by+s/2}" stroke="{M}" stroke-width="2"/>')
    return ''.join(out)

def shelves(x, y, w=520, levels=3):
    out = [f'<rect x="{x}" y="{y-levels*110}" width="10" height="{levels*110}" fill="{M}"/><rect x="{x+w}" y="{y-levels*110}" width="10" height="{levels*110}" fill="{M}"/>']
    for l in range(levels):
        ly = y - l * 110
        out.append(f'<rect x="{x}" y="{ly-8}" width="{w+10}" height="8" fill="{M}"/>')
        for k in range(6):
            out.append(f'<rect x="{x+20+k*82}" y="{ly-78}" width="64" height="70" fill="{[G,GL,ML,G,GL,LATL][(k+l)%6]}"/>')
    return ''.join(out)

def van(x, y, s=1, c=M):
    return (f'<g transform="translate({x} {y}) scale({s})"><rect x="-120" y="-110" width="170" height="90" rx="8" fill="{c}"/>'
            f'<path d="M50 -90 h45 l30 40 v30 h-75z" fill="{c}"/><path d="M58 -82 h33 l22 30 h-55z" fill="{GL}"/>'
            f'<rect x="-120" y="-30" width="245" height="12" fill="{MD}"/>'
            f'<circle cx="-70" cy="-15" r="20" fill="{MD}"/><circle cx="-70" cy="-15" r="8" fill="{GL}"/>'
            f'<circle cx="80" cy="-15" r="20" fill="{MD}"/><circle cx="80" cy="-15" r="8" fill="{GL}"/>'
            f'<rect x="-100" y="-95" width="70" height="8" fill="{G}"/></g>')

def ship(x, y, s=1):
    out = [f'<g transform="translate({x} {y}) scale({s})"><path d="M-260 0 L260 0 L220 70 L-230 70Z" fill="{M}"/>'
           f'<rect x="170" y="-90" width="60" height="90" fill="{W}"/><rect x="180" y="-80" width="40" height="14" fill="{M}"/>']
    cols = [G, RED, GL, ML, G, GL, YEL, ML]
    for r in range(2):
        for c in range(7):
            out.append(f'<rect x="{-230+c*56}" y="{-40-r*40}" width="52" height="36" fill="{cols[(c+r*3)%len(cols)]}" stroke="{M}" stroke-width="2"/>')
    out.append('</g>')
    return ''.join(out)

def water(dark=False):
    return (f'<rect y="450" width="800" height="150" fill="{ML if dark else "#BFD3E6"}"/>'
            + ''.join(f'<path d="M{x} {y} q20 -10 40 0" stroke="{W}" stroke-width="3" fill="none" opacity=".6"/>' for x, y in ((80, 500), (300, 540), (560, 510), (680, 560))))

def port_crane(x, y):
    return (f'<rect x="{x}" y="{y-260}" width="16" height="260" fill="{G}"/><rect x="{x+90}" y="{y-260}" width="16" height="260" fill="{G}"/>'
            f'<rect x="{x-120}" y="{y-280}" width="300" height="22" fill="{G}"/><line x1="{x-60}" y1="{y-258}" x2="{x-60}" y2="{y-170}" stroke="{M}" stroke-width="4"/>'
            f'<rect x="{x-85}" y="{y-170}" width="50" height="30" fill="{RED}"/>')

def globe(x, y, r=110):
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{ML}" stroke="{G}" stroke-width="5"/>'
            f'<ellipse cx="{x}" cy="{y}" rx="{r*0.45}" ry="{r}" fill="none" stroke="{G}" stroke-width="3"/>'
            f'<line x1="{x-r}" y1="{y}" x2="{x+r}" y2="{y}" stroke="{G}" stroke-width="3"/>'
            f'<path d="M{x-r*0.9} {y-r*0.45} H{x+r*0.9} M{x-r*0.9} {y+r*0.45} H{x+r*0.9}" stroke="{G}" stroke-width="2"/>')

def arc_route(x1, y1, x2, y2, c=GL):
    mx, my = (x1 + x2) / 2, min(y1, y2) - 120
    return (f'<path d="M{x1} {y1} Q{mx} {my} {x2} {y2}" stroke="{c}" stroke-width="4" stroke-dasharray="12 10" fill="none"/>'
            f'<circle cx="{x1}" cy="{y1}" r="10" fill="{G}"/><circle cx="{x2}" cy="{y2}" r="10" fill="{G}"/>')

def handshake(x, y, s=1):
    return (f'<g transform="translate({x} {y}) scale({s})">'
            f'<path d="M-200 -20 L-90 -20 L-40 -60 L10 -40 L-50 10 L-200 10Z" fill="{M}"/>'
            f'<path d="M200 -20 L90 -20 L40 -60 L-30 -10 L30 30 L200 30Z" fill="{G}"/>'
            f'<path d="M-30 -10 L30 30 L50 10 L-10 -30Z" fill="{GL}"/></g>')

def plan_sheet(x, y, w=300, h=200):
    out = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{W}" stroke="{M}" stroke-width="4"/>']
    for i in range(1, 4):
        out.append(f'<line x1="{x+i*w/4}" y1="{y+14}" x2="{x+i*w/4}" y2="{y+h-14}" stroke="{G}" stroke-width="2"/>')
    out.append(f'<line x1="{x+14}" y1="{y+h/2}" x2="{x+w-14}" y2="{y+h/2}" stroke="{G}" stroke-width="2"/>')
    out.append(f'<rect x="{x+w/4+8}" y="{y+18}" width="{w/4-16}" height="{h/2-30}" fill="{GRL}" opacity=".6"/>')
    return ''.join(out)

def magnifier(x, y, r=70):
    return (f'<circle cx="{x}" cy="{y}" r="{r}" fill="{W}" fill-opacity=".35" stroke="{M}" stroke-width="12"/>'
            f'<line x1="{x+r*0.72}" y1="{y+r*0.72}" x2="{x+r*1.6}" y2="{y+r*1.6}" stroke="{M}" stroke-width="20" stroke-linecap="round"/>')

def pin(x, y, c=RED):
    return f'<path d="M{x} {y} c-28 -36 -28 -70 0 -70 c28 0 28 34 0 70z" fill="{c}"/><circle cx="{x}" cy="{y-48}" r="9" fill="{W}"/>'

def tools(x, y):
    return (f'<rect x="{x}" y="{y-90}" width="240" height="90" rx="10" fill="{G}"/><rect x="{x+80}" y="{y-120}" width="80" height="34" rx="8" fill="none" stroke="{M}" stroke-width="10"/>'
            f'<rect x="{x}" y="{y-60}" width="240" height="8" fill="{M}"/>'
            f'<rect x="{x+300}" y="{y-180}" width="26" height="180" fill="{M}"/><rect x="{x+270}" y="{y-200}" width="86" height="40" rx="6" fill="{ML}"/>'
            f'<circle cx="{x+420}" cy="{y-60}" r="60" fill="{ML}"/><circle cx="{x+420}" cy="{y-60}" r="24" fill="{GL}"/>'
            + ''.join(f'<rect x="{x+412}" y="{y-128}" width="16" height="22" fill="{ML}" transform="rotate({a} {x+420} {y-60})"/>' for a in range(0, 360, 45)))

def arrows(x, y):
    return (f'<path d="M{x} {y} h160 v-24 l50 44 l-50 44 v-24 h-160z" fill="{G}"/>'
            f'<path d="M{x+210} {y+110} h-160 v-24 l-50 44 l50 44 v-24 h160z" fill="{M}"/>')

def signpost(x, y):
    return (f'<rect x="{x-6}" y="{y-150}" width="12" height="150" fill="{M}"/>'
            f'<rect x="{x-70}" y="{y-200}" width="140" height="80" rx="8" fill="{G}" stroke="{M}" stroke-width="5"/>'
            f'<rect x="{x-48}" y="{y-178}" width="96" height="10" rx="5" fill="{W}"/><rect x="{x-48}" y="{y-156}" width="60" height="10" rx="5" fill="{W}"/>')

def duo(x, y):
    return person(x - 40, y, M, G) + person(x + 40, y, ML, YEL)

def zones():
    return (f'<rect x="60" y="300" width="230" height="230" fill="{GL}" stroke="{G}" stroke-width="4"/>'
            f'<rect x="300" y="300" width="230" height="230" fill="{IVD}" stroke="{G}" stroke-width="4"/>'
            f'<rect x="540" y="300" width="200" height="230" fill="{GRL}" fill-opacity=".5" stroke="{G}" stroke-width="4"/>'
            + house(130, 470, .8) + house(225, 500, .6, ML)
            + factory(320, 490) + crops(575, 360, 8))

SCENES = {
 # --- BTP
 'travaux-de-terrassement-et-de-remblayage': lambda: svg(sun() + hills() + ground() + pile(600, 440, 260, 90) + excavator(330, 470, 1.15)),
 'ouverture-et-amenagement-de-routes': lambda: svg(sun(150, 120) + hills() + ground(LATL, 420) + road() + trees([(120, 430, 1.4), (200, 470, 1), (650, 430, 1.3), (720, 480, 1.1)]) + bulldozer(620, 560, 0.9)),
 'preparation-et-viabilisation-de-terrains': lambda: svg(sun() + hills() + ground(LATL) + parcels(90, 440, 5, 1, 110, 60, 14, LAT, G) + f'<path d="M80 560 H740" stroke="{M}" stroke-width="10" stroke-dasharray="40 20"/>' + trees([(80, 420), (720, 420, 1.2)])),
 'travaux-de-construction': lambda: svg(sun(120, 120) + ground(IVD, 470) + building(260, 480, 190, 5, M, crane=True, scaffold=True) + person(150, 520) + pile(620, 520, 120, 40)),
 'fourniture-de-laterite-et-materiaux-de-construction': lambda: svg(sun() + hills() + ground() + pile(220, 470, 260, 110) + sandbags(470, 480) + dump_truck(560, 560, 0.8)),
 'location-et-mobilisation-d-engins-de-chantier': lambda: svg(hills(True) + ground(LAT, 450) + excavator(250, 520, 0.9) + bulldozer(580, 540, 1.0), dark=True),
 'travaux-d-amenagement-et-de-developpement-de-sites': lambda: svg(sun() + hills() + ground(LATL) + parcels(110, 440, 3, 1, 120, 70, 16, GRL, G) + building(560, 520, 130, 3, ML) + f'<path d="M0 560 H800" stroke="{M}" stroke-width="22"/>'),
 # --- Immobilier et foncier
 'achat-et-vente-de-terrains': lambda: svg(sun() + hills() + ground(GL, 440) + parcels(140, 450, 4, 1, 120, 70, 16, GRL, G) + signpost(400, 450) + pin(600, 440)),
 'lotissement-et-amenagement-foncier': lambda: svg(hills() + ground(LATL, 300) + parcels(80, 320, 5, 3, 110, 64, 18, GRL, G)),
 'commercialisation-de-parcelles': lambda: svg(sun() + ground(LATL, 330) + parcels(90, 350, 5, 2, 110, 80, 18, GRL, G) + pin(318, 400, G) + pin(580, 495)),
 'recherche-et-acquisition-de-domaines-fonciers': lambda: svg(hills() + ground(GL, 420) + plan_sheet(140, 140, 360, 240) + magnifier(520, 300, 80) + trees([(680, 470, 1.4), (90, 480, 1.2)])),
 'developpement-de-projets-immobiliers': lambda: svg(sun(130, 120) + ground(IVD, 480) + building(220, 490, 140, 6, M) + building(400, 490, 140, 4, ML, crane=True) + trees([(120, 520), (680, 520)])),
 'amenagement-de-zones-residentielles-industrielles-et-agricoles': lambda: svg(sun(680, 110, 40) + zones()),
 'accompagnement-des-investisseurs-et-partenaires-fonciers': lambda: svg(hills(True) + ground(LAT, 470) + plan_sheet(230, 110, 340, 200) + duo(400, 520), dark=True),
 # --- Commerce général
 'commercialisation-de-produits-et-marchandises-diverses': lambda: svg(ground(IVD, 500) + boxes(140, 500, 4, 3, 70) + van(560, 540, 0.9)),
 'fourniture-de-materiels-et-equipements': lambda: svg(ground(IVD, 500) + tools(130, 500)),
 'approvisionnement-des-entreprises-et-particuliers': lambda: svg(sun() + hills() + ground(GL, 460) + house(170, 500, 1.1) + building(560, 520, 130, 3, ML) + van(400, 560, 0.75)),
 # --- Import-export
 'importation-et-exportation-de-marchandises': lambda: svg(water() + ship(400, 420, 1.1) + port_crane(620, 400), ),
 'recherche-de-fournisseurs-et-partenaires-internationaux': lambda: svg(globe(400, 300, 150) + arc_route(270, 250, 520, 360) + arc_route(330, 380, 500, 200), dark=True),
 'negoce-commercial': lambda: svg(ground(IVD, 500) + boxes(90, 500, 3, 2, 70) + arrows(330, 230) + boxes(560, 500, 2, 2, 70)),
 'approvisionnement-en-equipements-materiaux-et-produits-divers': lambda: svg(water() + ship(260, 420, 0.65) + ground(IVD, 470) + boxes(480, 470, 3, 2, 60) + dump_truck(560, 580, 0.6, GL)),
}
CATEGORIES = {
 'btp': lambda: svg(sun() + hills() + ground() + excavator(260, 480, 1.0) + dump_truck(600, 520, 0.75)),
 'immobilier-amenagement': lambda: svg(hills() + ground(LATL, 330) + parcels(90, 350, 5, 2, 110, 80, 18, GRL, G) + house(220, 360, 0.7) + house(620, 455, 0.7)),
 'commerce-general': lambda: svg(ground(IVD, 520) + shelves(140, 520)),
 'import-export': lambda: svg(water(True) + ship(360, 420, 1.0) + port_crane(600, 400), dark=True),
}
DEFAULT = lambda: svg(hills(True) + building(150, 470, 130, 4, M) + parcels(380, 380, 3, 2, 100, 60, 14, GRL, G) + ship(560, 560, 0.35), dark=True)

def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8', newline='\n').write(content)
    return len(content.encode())

sizes = {}
for slug, f in SCENES.items(): sizes['offres/' + slug] = write(f'{OUT}/offres/{slug}.svg', f())
for slug, f in CATEGORIES.items(): sizes['categories/' + slug] = write(f'{OUT}/categories/{slug}.svg', f())
sizes['defaut'] = write(f'{OUT}/defaut.svg', DEFAULT())
HEADER = "// Fichier généré par scripts/generate-offer-illustrations.py : ne pas modifier à la main.\n"
def ts_set(name, doc, keys):
    items = "".join(f"  '{k}',\n" for k in keys)
    return f"/** {doc} */\nexport const {name}: ReadonlySet<string> = new Set([\n{items}]);\n"
manifest = (HEADER
            + ts_set('OFFER_ILLUSTRATIONS', "Offres disposant d'une illustration dédiée (public/assets/illustrations/offres/<slug>.svg).", SCENES)
            + "\n"
            + ts_set('CATEGORY_ILLUSTRATIONS', "Catégories disposant d'une illustration (public/assets/illustrations/categories/<slug>.svg).", CATEGORIES))
write('src/content/offerIllustrations.ts', manifest)
for k, v in sizes.items(): print(f'{v:6d} {k}')
print('max', max(sizes.values()), 'count', len(sizes))
