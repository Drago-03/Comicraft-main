import SubmissionReviewClient from './client';

export const dynamicParams = true;

export function generateStaticParams() {
  // Return empty array to allow all paths to be resolved on-demand at runtime
  // or via SPA fallback when using output: export
  return [];
}

export default function SubmissionReviewPage({ params }: { params: { id: string } }) {
  return <SubmissionReviewClient params={params} />;
}
