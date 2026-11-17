-- Nouveau type de demande : devis (PRD v2 § 5.4).
-- Seul dans sa migration : une valeur d'enum ajoutée ne peut pas être utilisée
-- dans la même transaction.
alter type public.inquiry_type add value if not exists 'demande_devis';
