
'use client';

import { useState } from 'react';
import { useTrackedTopics } from '@/hooks/use-tracked-topics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, List } from 'lucide-react';

export function ManageTrackedTopics() {
  const { trackedTopics, removeTrackedTopic } = useTrackedTopics();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List />
          Tracked Topics
        </CardTitle>
        <CardDescription>
          Topics from your practice tests are automatically added here. You can remove any you no longer want to track.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {trackedTopics.length > 0 ? (
            trackedTopics.map((item, index) => (
              <Badge key={`${item.topic}-${item.subject}-${index}`} variant="secondary" className="flex items-center gap-1 pr-1">
                {item.topic} <span className="text-muted-foreground/70 text-xs ml-1 mr-1">({item.subject})</span>
                <button onClick={() => removeTrackedTopic(item.topic)} className='rounded-full hover:bg-muted-foreground/20 p-0.5'>
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Take a practice test to start tracking topics.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
