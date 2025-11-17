import CaseClient from './CaseClient';

export default function CasePage({ params }: { params: { id: string } }) {
  return <CaseClient caseId={params.id} />;
}


