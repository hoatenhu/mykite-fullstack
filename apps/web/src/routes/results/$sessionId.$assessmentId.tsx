import { createFileRoute } from '@tanstack/react-router'
import { ResultsPage } from './-$sessionId.$assessmentId.page'

export const Route = createFileRoute('/results/$sessionId/$assessmentId')({
  component: ResultsPage,
})
