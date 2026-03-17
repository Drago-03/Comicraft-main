import StoryPreviewClient from './client';

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function StoryPreviewPage({ params }: { params: { storyId: string } }) {
  return <StoryPreviewClient params={params} />;
}
