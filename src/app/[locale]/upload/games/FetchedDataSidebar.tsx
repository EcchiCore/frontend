'use client';

import { DndContext } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DraggableItem } from './DraggableItem';

interface FetchedDataSidebarProps {
  fetchedData: Record<string, any> | null;
}

export const FetchedDataSidebar = ({ fetchedData }: FetchedDataSidebarProps) => {
  if (!fetchedData) {
    return null;
  }

  return (
    <DndContext>
      <Card>
        <CardHeader>
          <CardTitle>Fetched Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(fetchedData).map(([key, value]) => {
            if (!value) return null;

            const renderValue = (val: any) => {
              if (typeof val === 'object' && val !== null) {
                return (
                  <div className="pl-4">
                    {Object.entries(val).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="font-semibold">{k}:</span>
                        {renderValue(v)}
                      </div>
                    ))}
                  </div>
                );
              }
              return <span className="text-sm">{String(val)}</span>;
            };

            return (
              <DraggableItem key={key} id={JSON.stringify({ key, value })}>
                <div>
                  <h4 className="font-semibold">{key}</h4>
                  <div className="flex items-center justify-between">
                    {renderValue(value)}
                  </div>
                </div>
              </DraggableItem>
            );
          })}
        </CardContent>
      </Card>
    </DndContext>
  );
};
