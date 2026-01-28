'use server'

// ══════════════════════════════════════════════════════════════════════════════
// VOXPOLL WEB - POLL SERVER ACTIONS
// Next.js 16 Server Actions with type-safe @voxpoll/api client
// ══════════════════════════════════════════════════════════════════════════════

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerClient } from '@/lib/api'
import type { CreatePollInput, Poll, PollResults, PaginatedResponse } from '@voxpoll/api/client'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ─────────────────────────────────────────────────────────────────────────────
// Get Polls Action (Data Fetching)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPollsAction(params?: {
  page?: number
  limit?: number
  sort?: string
  category?: string
}): Promise<ActionResult<PaginatedResponse<Poll>>> {
  try {
    const api = await getServerClient()
    const data = await api.polls.list(params)

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch polls',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Poll Action
// ─────────────────────────────────────────────────────────────────────────────

export async function getPollAction(id: string): Promise<ActionResult<Poll>> {
  try {
    const api = await getServerClient()
    const data = await api.polls.get(id)

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch poll',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Poll Action
// ─────────────────────────────────────────────────────────────────────────────

export async function createPollAction(
  _prevState: ActionResult<Poll>,
  formData: FormData
): Promise<ActionResult<Poll>> {
  try {
    const api = await getServerClient()

    // Parse options from form
    const optionsJson = formData.get('options') as string
    const options = JSON.parse(optionsJson) as { text: string; order: number }[]

    const input: CreatePollInput = {
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || undefined,
      type: formData.get('type') as CreatePollInput['type'],
      visibility: formData.get('visibility') as CreatePollInput['visibility'],
      options,
      endsAt: (formData.get('endsAt') as string) || undefined,
      settings: {
        allowAnonymous: formData.get('allowAnonymous') === 'true',
        showResultsBeforeVoting: formData.get('showResultsBeforeVoting') === 'true',
        requireVerification: formData.get('requireVerification') === 'true',
      },
    }

    const poll = await api.polls.create(input)

    revalidatePath('/polls')

    return { success: true, data: poll }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create poll',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Update Poll Action
// ─────────────────────────────────────────────────────────────────────────────

export async function updatePollAction(
  id: string,
  _prevState: ActionResult<Poll>,
  formData: FormData
): Promise<ActionResult<Poll>> {
  try {
    const api = await getServerClient()

    const input: Partial<CreatePollInput> = {}

    const title = formData.get('title')
    if (title) input.title = title as string

    const description = formData.get('description')
    if (description) input.description = description as string

    const poll = await api.polls.update(id, input)

    revalidatePath(`/polls/${id}`)

    return { success: true, data: poll }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update poll',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete Poll Action
// ─────────────────────────────────────────────────────────────────────────────

export async function deletePollAction(id: string): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    await api.polls.delete(id)

    revalidatePath('/polls')

    redirect('/polls')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete poll',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vote Action
// ─────────────────────────────────────────────────────────────────────────────

export async function voteAction(
  pollId: string,
  optionIds: string[]
): Promise<ActionResult<PollResults>> {
  try {
    const api = await getServerClient()
    const results = await api.polls.vote(pollId, { optionIds })

    revalidatePath(`/polls/${pollId}`)

    return { success: true, data: results }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit vote',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get Results Action
// ─────────────────────────────────────────────────────────────────────────────

export async function getPollResultsAction(id: string): Promise<ActionResult<PollResults>> {
  try {
    const api = await getServerClient()
    const results = await api.polls.getResults(id)

    return { success: true, data: results }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch results',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Start Live Poll Action
// ─────────────────────────────────────────────────────────────────────────────

export async function startLivePollAction(id: string): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    await api.polls.startLive(id)

    revalidatePath(`/polls/${id}`)

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start live poll',
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// End Live Poll Action
// ─────────────────────────────────────────────────────────────────────────────

export async function endLivePollAction(id: string): Promise<ActionResult> {
  try {
    const api = await getServerClient()
    await api.polls.endLive(id)

    revalidatePath(`/polls/${id}`)

    return { success: true, data: undefined }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to end live poll',
    }
  }
}
