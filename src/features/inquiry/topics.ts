import type { ActivityDomain, LandProject } from '../../content/types';

/** Sujet d'une demande : une offre (devis), un domaine, un projet foncier ou une demande générale. */
export type InquiryTopic = `offer:${string}` | `domain:${string}` | `project:${string}` | 'general';

/** Une demande portant sur une offre est une demande de devis. */
export const isQuoteTopic = (topic: InquiryTopic): topic is `offer:${string}` => topic.startsWith('offer:');

export type InquiryTopicGroup = {
  label: string;
  options: { value: InquiryTopic; label: string }[];
};

export function buildTopicGroups(domains: ActivityDomain[], projects: LandProject[]): InquiryTopicGroup[] {
  return [
    {
      label: 'Projets fonciers',
      options: projects.map((p) => ({ value: `project:${p.slug}` as const, label: p.name })),
    },
    // Offres, groupées par catégorie (demande de devis).
    ...domains.map((d) => ({
      label: `Devis — ${d.shortTitle}`,
      options: d.services
        .filter((s) => s.quoteEnabled)
        .map((s) => ({ value: `offer:${s.slug}` as const, label: s.title })),
    })),
    {
      label: "Domaines d'activité",
      options: domains.map((d) => ({ value: `domain:${d.slug}` as const, label: d.title })),
    },
    { label: 'Autre', options: [{ value: 'general', label: 'Demande générale' }] },
  ].filter((g) => g.options.length > 0) as InquiryTopicGroup[];
}

export const topicLabel = (groups: InquiryTopicGroup[], topic: InquiryTopic) =>
  groups.flatMap((g) => g.options).find((o) => o.value === topic)?.label ?? 'Demande générale';
