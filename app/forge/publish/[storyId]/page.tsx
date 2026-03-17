import PublishConsentClient from './client';

export const dynamicParams = true;

export function generateStaticParams() {
  // A minimal list of params is required when `output: 'export'` is set, otherwise
  // Next.js will abort the build with a missing generateStaticParams error.
  // We supply a dummy id so one static page is generated; additional IDs will
  // be handled by the client router at runtime.
  return [{ storyId: 'default' }];
}

export default function PublishConsentPage({ params }: { params: { storyId: string } }) {
  return <PublishConsentClient params={params} />;
}
