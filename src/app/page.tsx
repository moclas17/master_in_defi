import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { protocols } from '@/data/protocols'
import { questions } from '@/data/questions'

export default function Home() {
  const aaveProtocol = protocols.find(p => p.id === 'aave')
  const aaveQuestions = questions.filter(q => q.protocol === 'aave')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-8 font-sans dark:bg-black">
      <main className="flex w-full max-w-4xl flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            DeFi Learning Quiz
          </h1>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            Aprende sobre protocolos DeFi de manera interactiva
          </p>
        </div>

        {/* Protocol Card */}
        {aaveProtocol && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{aaveProtocol.title || aaveProtocol.name}</CardTitle>
                <Badge variant="info">{aaveProtocol.category}</Badge>
              </div>
              <CardDescription>{aaveProtocol.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Briefing - Información educativa */}
                {aaveProtocol.briefing && aaveProtocol.briefing.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Acerca de {aaveProtocol.name}:</p>
                    <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {aaveProtocol.briefing.slice(0, 2).map((paragraph, idx) => (
                        <p key={idx} className="leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm font-medium">Características:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
                    {aaveProtocol.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Badge variant="success">APY: {aaveProtocol.apy}%</Badge>
                  <Badge variant="info">{aaveProtocol.chains.length} cadenas</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Disponibles</CardTitle>
            <CardDescription>
              {aaveQuestions.length} preguntas sobre {aaveProtocol?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aaveQuestions.slice(0, 3).map((question) => (
                <div key={question.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <p className="font-medium">{question.text}</p>
                    <Badge variant={question.difficulty === 'easy' ? 'success' : question.difficulty === 'medium' ? 'warning' : 'error'}>
                      {question.difficulty}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {question.answers.length} opciones
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="primary" size="lg">
            Comenzar Quiz
          </Button>
          <Button variant="outline" size="lg">
            Ver Protocolos
          </Button>
        </div>

        {/* Status */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-500">
          <p>✅ Estructura de carpetas creada</p>
          <p>✅ Tipos TypeScript definidos</p>
          <p>✅ Componentes UI base funcionando</p>
          <p>✅ Datos básicos de DeFi cargados</p>
        </div>
      </main>
    </div>
  )
}
