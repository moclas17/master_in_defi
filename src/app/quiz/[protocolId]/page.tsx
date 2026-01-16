import { getProtocolById } from '@/lib/db/protocols'
import { ProtocolStudyClient } from '@/components/quiz/ProtocolStudyClient'
import { notFound } from 'next/navigation'

export default async function ProtocolStudyPage({
  params,
}: {
  params: Promise<{ protocolId: string }>
}) {
  // En Next.js 15+, params es una Promise y debe ser esperada
  const { protocolId } = await params
  const protocol = await getProtocolById(protocolId)

  if (!protocol) {
    notFound()
  }

  return <ProtocolStudyClient protocol={protocol} />
}
