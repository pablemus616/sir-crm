'use client';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useSendProposal, useFollowUp, useWinOpportunity, useLoseOpportunity,
} from '@/lib/api/opportunities';
import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export type ActionState = { action: CardAction; opp: Opportunity };

const titles: Record<CardAction, string> = {
  win: 'Marcar como ganada', lose: 'Marcar como perdida',
  proposal: 'Enviar propuesta', 'follow-up': 'Programar seguimiento',
};

export function OpportunityActionDialogs({
  state, onClose,
}: {
  state: ActionState | null; onClose: () => void;
}) {
  const proposal = useSendProposal();
  const followUp = useFollowUp();
  const win = useWinOpportunity();
  const lose = useLoseOpportunity();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [when, setWhen] = useState('');

  if (!state) return null;
  const { action, opp } = state;
  const close = () => { setAmount(''); setReason(''); setWhen(''); onClose(); };

  const submit = () => {
    if (action === 'win') win.mutate({ id: opp.id }, { onSuccess: close });
    if (action === 'lose') lose.mutate({ id: opp.id, lostReason: reason || undefined }, { onSuccess: close });
    if (action === 'proposal')
      proposal.mutate({ id: opp.id, amount: amount ? Number(amount) : undefined }, { onSuccess: close });
    if (action === 'follow-up' && when)
      followUp.mutate({ id: opp.id, nextFollowUpAt: new Date(when).toISOString() }, { onSuccess: close });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && close()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{titles[action]}</DialogTitle></DialogHeader>
        {action === 'win' && <p className="text-sm text-muted-foreground">¿Confirmas marcar esta oportunidad como ganada?</p>}
        {action === 'lose' && (
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de pérdida</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
        {action === 'proposal' && (
          <div className="space-y-2">
            <Label htmlFor="amount">Monto (GTQ)</Label>
            <Input id="amount" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
        )}
        {action === 'follow-up' && (
          <div className="space-y-2">
            <Label htmlFor="when">Próximo seguimiento</Label>
            <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancelar</Button>
          <Button onClick={submit}
            disabled={(action === 'follow-up' && !when) ||
              proposal.isPending || followUp.isPending || win.isPending || lose.isPending}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
