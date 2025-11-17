import StatusClient from './StatusClient';

export default function StatusPage({ params }: { params: { appId: string } }) {
  return <StatusClient appId={params.appId} />;
}


