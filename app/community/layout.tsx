import React from 'react';
import { metadata } from './metadata';

export { metadata };

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full h-full flex-grow font-sans text-gray-200">
      {children}
    </div>
  );
}
