// KAVACH Scan Detail & Originality Report
import ScanDetailClient from './client';

// Required for Next.js static export (output: 'export').
// Scan IDs are runtime-generated UUIDs; all data is fetched client-side.
// We provide a dummy ID to satisfy the build-time requirement.
export function generateStaticParams() {
  return [{ id: 'default' }];
}

export const dynamicParams = true;

export default function ScanDetailPage({ params }: { params: { id: string } }) {
  return <ScanDetailClient id={params.id} />;
}
