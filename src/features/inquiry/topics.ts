import { publicDomains } from '../../content/activities';
import { LAND_PROJECTS } from '../../content/landProjects';

/** Sujet d'une demande : un domaine, un projet foncier ou une demande générale. */
export type InquiryTopic = `domain:${string}` | `project:${string}` | 'general';

export type InquiryTopicGroup = {
  label: string;
  options: { value: InquiryTopic; label: string }[];
};

export const INQUIRY_TOPIC_GROUPS: InquiryTopicGroup[] = [
  {
    label: 'Projets fonciers',
    options: LAND_PROJECTS.map((p) => ({ value: `project:${p.slug}` as const, label: p.name })),
  },
  {
    label: "Domaines d'activité",
    options: publicDomains().map((d) => ({ value: `domain:${d.slug}` as const, label: d.title })),
  },
  {
    label: 'Autre',
    options: [{ value: 'general', label: 'Demande générale' }],
  },
];

export const topicLabel = (topic: InquiryTopic) =>
  INQUIRY_TOPIC_GROUPS.flatMap((g) => g.options).find((o) => o.value === topic)?.label ??
  'Demande générale';
