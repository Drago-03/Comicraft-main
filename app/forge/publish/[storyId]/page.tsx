import PublishConsentClient from './client';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function PublishConsentPage({ params }: { params: { storyId: string } }) {
  return <PublishConsentClient params={params} />;
}
