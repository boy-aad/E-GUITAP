-- E-GUITAP — contenu initial
-- Uniquement les informations communiquées par l'entreprise (et la charte v1.3).
-- Champs juridiques, statuts de projets non communiqués et dirigeant : laissés vides.

insert into public.company_profile (
  brand_name, full_name, country, head_office, ambition, presentation, mission, vision,
  signature_brand, signature_institutional, signature_sectoral
) values (
  'E-GUITAP',
  'Entreprise Guinéenne de Terrassement, d''Aménagement et de Prestations',
  'République de Guinée',
  'Dubréka et Conakry',
  'Intervenir à terme sur l''ensemble du territoire national et à l''international.',
  array[
    'E-GUITAP est une entreprise guinéenne ambitieuse qui intervient dans plusieurs secteurs stratégiques : le bâtiment et les travaux publics (BTP), l''immobilier, l''aménagement foncier, le commerce général et l''import-export.',
    'Elle ambitionne de contribuer au développement économique et infrastructurel de la Guinée à travers des projets structurants, des solutions immobilières adaptées et des partenariats stratégiques.',
    'Elle se positionne comme un acteur engagé dans la réalisation de projets, la valorisation foncière et le développement d''opportunités d''affaires.'
  ],
  'Proposer des solutions fiables et innovantes dans les domaines de la construction, de l''immobilier, de l''aménagement et du commerce, tout en contribuant au développement de notre environnement économique.',
  'Devenir une entreprise de référence en Guinée et en Afrique de l''Ouest dans les domaines du BTP, de l''immobilier et des investissements.',
  'Construire • Échanger • Développer',
  'Une entreprise au service du développement de la Guinée.',
  'BTP • Commerce général • Import-export'
);

insert into public.company_values (title, sort_order)
select title, ord::int
from unnest(array[
  'Professionnalisme', 'Intégrité et transparence', 'Engagement', 'Innovation',
  'Esprit d''équipe', 'Respect des engagements', 'Satisfaction des partenaires et des clients'
]) with ordinality as v(title, ord);

insert into public.company_contacts (kind, label, value, raw_value, sort_order) values
  ('address',  'Siège',     'Dubréka et Conakry, République de Guinée', 'Dubréka et Conakry, République de Guinée', 1),
  ('phone',    'Téléphone', '+224 621 73 02 47', '+224621730247', 2),
  ('whatsapp', 'WhatsApp',  '+224 621 73 02 47', '224621730247', 3),
  ('email',    'E-mail',    'eguitapimmobilier@gmail.com', 'eguitapimmobilier@gmail.com', 4);

-- Domaines et prestations
with d as (
  insert into public.activity_domains (slug, letter, title, short_title, summary, publication, sort_order) values
    ('btp', 'A', 'BTP — Bâtiment et travaux publics', 'BTP',
      'Terrassement, ouverture de routes, viabilisation de terrains et travaux de construction.', 'publie', 1),
    ('immobilier-amenagement', 'B', 'Immobilier et aménagement foncier', 'Immobilier et foncier',
      'Achat et vente de terrains, lotissement, commercialisation de parcelles et développement de projets.', 'publie', 2),
    ('commerce-general', 'C', 'Commerce général', 'Commerce général',
      'Commercialisation de produits, fourniture de matériels et approvisionnement.', 'publie', 3),
    ('import-export', 'D', 'Import-export', 'Import-export',
      'Importation, exportation, recherche de fournisseurs et négoce commercial.', 'publie', 4)
  returning id, slug
)
insert into public.activity_services (domain_id, title, sort_order)
select d.id, s.title, s.ord::int
from d
join lateral (
  select title, ord from unnest(
    case d.slug
      when 'btp' then array[
        'Travaux de terrassement et de remblayage',
        'Ouverture et aménagement de routes',
        'Préparation et viabilisation de terrains',
        'Travaux de construction',
        'Fourniture de latérite et matériaux de construction',
        'Location et mobilisation d''engins de chantier',
        'Travaux d''aménagement et de développement de sites']
      when 'immobilier-amenagement' then array[
        'Achat et vente de terrains',
        'Lotissement et aménagement foncier',
        'Commercialisation de parcelles',
        'Recherche et acquisition de domaines fonciers',
        'Développement de projets immobiliers',
        'Aménagement de zones résidentielles, industrielles et agricoles',
        'Accompagnement des investisseurs et partenaires fonciers']
      when 'commerce-general' then array[
        'Commercialisation de produits et marchandises diverses',
        'Fourniture de matériels et équipements',
        'Approvisionnement des entreprises et particuliers']
      when 'import-export' then array[
        'Importation et exportation de marchandises',
        'Recherche de fournisseurs et partenaires internationaux',
        'Négoce commercial',
        'Approvisionnement en équipements, matériaux et produits divers']
    end
  ) with ordinality as x(title, ord)
) s on true;

-- Projets fonciers (superficies annoncées ; statuts non communiqués laissés à null)
with p as (
  insert into public.land_projects (
    slug, name, prefecture, area_ha, summary, description, development_status, publication, sort_order
  ) values
    ('amaria-ouassou', 'Amaria – Ouassou', null, 1000,
      'Un site destiné à accueillir des zones résidentielles, des infrastructures communautaires et des activités économiques.',
      'Le site d''Amaria – Ouassou présente un potentiel pour la création de zones résidentielles modernes, d''infrastructures communautaires et d''espaces dédiés aux activités économiques.',
      null, 'publie', 1),
    ('tanene-kenende', 'Tanènè – Kenendé', null, 300,
      'Un site au potentiel agricole, résidentiel et commercial, pensé comme un espace structuré et accessible.',
      'Le site de Tanènè – Kenendé présente un potentiel pour l''agriculture, l''implantation de logements et des projets commerciaux, avec l''objectif de développer un espace structuré et accessible.',
      null, 'publie', 2),
    ('bady', 'Bady', null, 300,
      'Un site dédié à l''aménagement durable, présentant des opportunités foncières.',
      'Le site de Bady est un site en développement dédié à l''aménagement durable et présentant des opportunités foncières.',
      null, 'publie', 3),
    ('site-de-forecariah', 'Site de Forécariah', 'Préfecture de Forécariah', 3000,
      'Un projet d''aménagement en cours, pouvant accueillir des initiatives d''envergure.',
      'Le site de Forécariah fait l''objet d''un projet d''aménagement en cours. Il peut accueillir des initiatives d''envergure : nouveaux pôles urbains, zones agro-industrielles et infrastructures structurantes.',
      'amenagement_en_cours', 'publie', 4)
  returning id, slug
)
insert into public.land_project_objectives (project_id, label, sort_order)
select p.id, o.label, o.ord::int
from p
join lateral (
  select label, ord from unnest(
    case p.slug
      when 'amaria-ouassou' then array[
        'Création de zones résidentielles modernes', 'Infrastructures communautaires',
        'Espaces dédiés aux activités économiques']
      when 'tanene-kenende' then array[
        'Agriculture', 'Implantation de logements', 'Projets commerciaux',
        'Développement d''un espace structuré et accessible']
      when 'bady' then array['Aménagement durable', 'Opportunités foncières']
      when 'site-de-forecariah' then array[
        'Nouveaux pôles urbains', 'Zones agro-industrielles', 'Infrastructures structurantes']
    end
  ) with ordinality as x(label, ord)
) o on true;

-- Accueil : textes de départ issus de la charte (modifiables dans l'administration)
insert into public.hero_slides (
  eyebrow, title, title_highlight, subtitle, show_signature,
  primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order
) values (
  'République de Guinée · Entreprise multisectorielle',
  'Bâtir avec rigueur,', 'échanger avec confiance.',
  'Une entreprise au service du développement de la Guinée. E-GUITAP intervient dans le BTP, l''immobilier et l''aménagement foncier, le commerce général et l''import-export.',
  true, 'Découvrir nos projets', '/projets', 'Nos activités', '/activites', 1
);

insert into public.content_blocks (key, title, body) values
  ('home.cta', 'Un projet, une question ?',
    'Contactez E-GUITAP pour toute demande de renseignements sur nos activités ou nos projets fonciers.'),
  ('projects.intro', 'Projets fonciers',
    'E-GUITAP prévoit de mener des opérations de morcellement et de viabilisation progressives sur ces sites.'),
  ('contact.intro', 'Contacter E-GUITAP',
    'Une question sur nos activités ou nos projets fonciers ? Écrivez-nous ou appelez-nous.');
