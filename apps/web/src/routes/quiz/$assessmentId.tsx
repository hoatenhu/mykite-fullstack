import { createFileRoute } from '@tanstack/react-router'
import { QuizPage } from './-$assessmentId.page'

export const Route = createFileRoute('/quiz/$assessmentId')({
  component: QuizPage,
})
