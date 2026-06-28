'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { OpportunityBoard } from '@/components/kanban/opportunity-board';
import {
  OpportunityActionDialogs,
  type ActionState,
} from './opportunity-action-dialogs';
import { OpportunityCreateForm } from './opportunity-create-form';
import { OpportunitiesTable } from './opportunities-table';
import type { CardAction } from '@/components/kanban/opportunity-card';
import type { Opportunity } from '@/lib/api/types/commercial';

export function OpportunitiesView() {
  const [creating, setCreating] = useState(false);
  const [action, setAction] = useState<ActionState | null>(null);

  const openAction = (a: CardAction, opp: Opportunity) =>
    setAction({ action: a, opp });

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Oportunidades
        </h1>
        <Button onClick={() => setCreating(true)}>Nueva oportunidad</Button>
      </div>

      {/* View toggle — kanban (this task) / tabla (Task 5.5) */}
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="tabla">Tabla</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <OpportunityBoard filters={{}} onAction={openAction} />
        </TabsContent>

        <TabsContent value="tabla" className="mt-4">
          <OpportunitiesTable onAction={openAction} />
        </TabsContent>
      </Tabs>

      {/* Dialogs — wired in Task 5.4 */}
      <OpportunityCreateForm open={creating} onOpenChange={setCreating} />
      <OpportunityActionDialogs state={action} onClose={() => setAction(null)} />
    </div>
  );
}
