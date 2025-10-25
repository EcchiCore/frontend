'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableInputProps {
  id: string;
  children: React.ReactNode;
}

export function DroppableInput({ id, children }: DroppableInputProps) {
  const { setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div ref={setNodeRef}>
      {children}
    </div>
  );
}
