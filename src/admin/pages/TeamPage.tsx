import { useEffect, useRef, useState } from 'react';
import { useFetcher, useLoaderData } from 'react-router';
import { UserCheck, UserPlus, UserX } from 'lucide-react';
import { Field, Input, Select } from '../../components/ui/Field';
import type { Enums } from '../../types/database';
import { formatDateTime } from '../format';
import { AdminPageHeader, Badge, FormSection, Notice, cardClass, ghostButton, primaryButton, secondaryButton, useConfirm, useResultToast } from '../ui';
import { ROLE_HINTS, ROLE_LABELS, action as teamAction, loader as teamLoader, type ActionResult, type Member, type TeamData } from './team/teamData';

export const loader = teamLoader;
export const action = teamAction;
export const handle = { crumb: 'Équipe' };

export function Component() {
  const { members, meId } = useLoaderData() as TeamData;
  const [inviting, setInviting] = useState(false);
  const admins = members.filter((m) => m.role === 'admin' && m.is_active).length;

  return (
    <>
      <title>Équipe | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Équipe"
        description="Personnes ayant accès à l'administration. Un compte n'est jamais supprimé : il est désactivé, et son historique reste dans le journal."
        actions={
          !inviting && (
            <button type="button" className={primaryButton} onClick={() => setInviting(true)}>
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Inviter un membre
            </button>
          )
        }
      />
      <div className="space-y-6">
        {inviting && <InviteForm onDone={() => setInviting(false)} />}
        <ul className="space-y-3" aria-label="Membres de l'équipe">
          {members.map((m) => (
            <MemberRow key={m.user_id} member={m} isMe={m.user_id === meId} lastAdmin={m.role === 'admin' && m.is_active && admins === 1} />
          ))}
        </ul>
      </div>
    </>
  );
}

function MemberRow({ member: m, isMe, lastAdmin }: { member: Member; isMe: boolean; lastAdmin: boolean }) {
  const fetcher = useFetcher<ActionResult>();
  const confirm = useConfirm();
  const busy = fetcher.state !== 'idle';
  useResultToast(fetcher.data);
  // Rôle affiché pendant l'envoi, puis celui de la base (revient en arrière si refusé).
  const pendingRole = fetcher.formData?.get('intent') === 'role' ? (fetcher.formData.get('role') as Enums<'staff_role'>) : null;

  const changeRole = async (role: Enums<'staff_role'>) => {
    if (isMe && role !== 'admin') {
      const ok = await confirm({
        title: 'Retirer vos droits d’administrateur ?',
        message: 'Vous perdrez immédiatement l’accès à la gestion de l’équipe, au journal et aux suppressions.',
        confirmLabel: 'Devenir éditeur',
        danger: true,
      });
      if (!ok) return;
    }
    void fetcher.submit({ intent: 'role', user_id: m.user_id, role }, { method: 'post' });
  };

  const toggleActive = async () => {
    if (m.is_active) {
      const ok = await confirm({
        title: `Désactiver l’accès de ${m.full_name} ?`,
        message: 'Cette personne ne pourra plus se connecter à l’administration. Vous pourrez réactiver son accès à tout moment.',
        confirmLabel: 'Désactiver',
        danger: true,
      });
      if (!ok) return;
    }
    void fetcher.submit({ intent: 'active', user_id: m.user_id, active: String(!m.is_active) }, { method: 'post' });
  };

  return (
    <li className={`${cardClass} flex flex-col gap-4 p-4 sm:flex-row sm:items-center ${m.is_active ? '' : 'bg-slate-50'}`}>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-marine">
          {m.full_name}
          {isMe && <span className="text-xs font-normal text-slate-500">(vous)</span>}
          {!m.is_active && <Badge tone="danger">Désactivé</Badge>}
          {m.pending && <Badge tone="warning">Invitation en attente</Badge>}
        </p>
        <p className="break-all text-sm text-slate-600">{m.email ?? 'E-mail inconnu'}</p>
        <p className="text-xs text-slate-500">{m.last_sign_in_at ? `Dernière connexion : ${formatDateTime(m.last_sign_in_at)}` : 'Jamais connecté'}</p>
        {fetcher.data && !fetcher.data.ok && <Notice tone="error">{fetcher.data.message}</Notice>}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Rôle" hint={lastAdmin ? 'Dernier administrateur actif.' : undefined}>
          <Select
            value={pendingRole ?? m.role}
            disabled={busy || lastAdmin || !m.is_active}
            onChange={(e) => void changeRole(e.target.value as Enums<'staff_role'>)}
            aria-label={`Rôle de ${m.full_name}`}
          >
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        {!isMe && !lastAdmin && (
          <button type="button" className={m.is_active ? secondaryButton : primaryButton} disabled={busy} onClick={() => void toggleActive()}>
            {m.is_active ? <UserX className="h-4 w-4" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
            {m.is_active ? 'Désactiver' : 'Réactiver'}
          </button>
        )}
      </div>
    </li>
  );
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const fetcher = useFetcher<ActionResult>();
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole] = useState<Enums<'staff_role'>>('editeur');
  const busy = fetcher.state !== 'idle';
  const errors = fetcher.data && !fetcher.data.ok ? (fetcher.data.fieldErrors ?? {}) : {};
  useResultToast(fetcher.data);
  useEffect(() => formRef.current?.querySelector<HTMLInputElement>('input[name="full_name"]')?.focus(), []);
  const sent = fetcher.state === 'idle' && fetcher.data?.ok === true;
  useEffect(() => {
    if (sent) onDone();
  }, [sent, onDone]);

  return (
    <fetcher.Form ref={formRef} method="post">
      <input type="hidden" name="intent" value="invite" />
      <FormSection title="Inviter un membre" description="La personne reçoit un e-mail pour définir son mot de passe. Si le lien a expiré, elle peut utiliser « Mot de passe oublié » sur la page de connexion.">
        {fetcher.data && !fetcher.data.ok && !fetcher.data.fieldErrors && <Notice tone="error">{fetcher.data.message}</Notice>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" required error={errors.full_name}>
            <Input name="full_name" autoComplete="off" maxLength={120} />
          </Field>
          <Field label="E-mail" required error={errors.email}>
            <Input name="email" type="email" autoComplete="off" maxLength={200} />
          </Field>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-marine">Rôle</legend>
          {(Object.keys(ROLE_LABELS) as Enums<'staff_role'>[]).map((r) => (
            <div key={r} className={`flex gap-3 rounded-lg border p-3 ${role === r ? 'border-marine bg-ivory' : 'border-slate-200'}`}>
              <input
                id={`role-${r}`}
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                aria-describedby={`role-${r}-hint`}
                className="mt-1 h-4 w-4 accent-marine"
              />
              <div>
                <label htmlFor={`role-${r}`} className="block cursor-pointer text-sm font-semibold text-marine">
                  {ROLE_LABELS[r]}
                </label>
                <p id={`role-${r}-hint`} className="text-xs text-slate-600">
                  {ROLE_HINTS[r]}
                </p>
              </div>
            </div>
          ))}
        </fieldset>
        <div className="flex gap-2">
          <button type="submit" className={primaryButton} disabled={busy}>
            <UserPlus className="h-4 w-4" aria-hidden="true" /> {busy ? 'Envoi…' : 'Envoyer l’invitation'}
          </button>
          <button type="button" className={ghostButton} onClick={onDone}>
            Annuler
          </button>
        </div>
      </FormSection>
    </fetcher.Form>
  );
}
