import type { ActivityDomain, LandProject } from '../../content/types';

/** Sujet d'une demande : un domaine, un projet foncier ou une demande générale. */
export type InquiryTopic = `domain:${string}` | `project:${string}` | 'general';

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
    {
      label: "Domaines d'activité",
      options: domains.map((d) => ({ value: `domain:${d.slug}` as const, label: d.title })),
    },
    { label: 'Autre', options: [{ value: 'general', label: 'Demande générale' }] },
  ].filter((g) => g.options.length > 0) as InquiryTopicGroup[];
}

export const topicLabel = (groups: InquiryTopicGroup[], topic: InquiryTopic) =>
  groups.flatMap((g) => g.options).find((o) => o.value === topic)?.label ?? 'Demande générale';
