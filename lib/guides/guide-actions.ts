'use server'

/**
 * Server Actions for Cancellation Guides
 * Handles fetching guides from the database
 */

import { createClient } from '@/lib/supabase/server'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface GuideStep {
  step: number
  title: string
  description: string
  imageUrl?: string
  deepLink?: string
}

export interface UPIMandateProvider {
  provider: string
  steps: string[]
}

export interface CancellationGuide {
  id: string
  service_id: string
  service_name: string
  service_logo_url: string | null
  service_category: string
  steps: GuideStep[]
  upi_mandate_instructions: UPIMandateProvider[] | null
  estimated_time_minutes: number
  difficulty_level: DifficultyLevel
  last_verified_at: string
  created_at: string
}

// Internal type for database response (Supabase returns services as object, not array)
interface GuideWithService {
  id: string
  service_id: string
  steps: GuideStep[]
  upi_mandate_instructions: UPIMandateProvider[] | null
  estimated_time_minutes: number
  difficulty_level: DifficultyLevel
  last_verified_at: string
  created_at: string
  services: {
    name: string
    logo_url: string | null
    category: string
  } | null
}

/**
 * Get all cancellation guides with service info
 */
export async function getAllGuides(): Promise<{ success: boolean; data?: CancellationGuide[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cancellation_guides')
      .select(`
        id,
        service_id,
        steps,
        upi_mandate_instructions,
        estimated_time_minutes,
        difficulty_level,
        last_verified_at,
        created_at,
        services:service_id (
          name,
          logo_url,
          category
        )
      `)
      .order('services(name)', { ascending: true })

    if (error) {
      console.error('Error fetching guides:', error)
      return { success: false, error: error.message }
    }

    // Transform data to flatten service info
    const guides: CancellationGuide[] = (data || []).map((guide) => {
      const guideWithService = guide as unknown as GuideWithService
      return {
        id: guideWithService.id,
        service_id: guideWithService.service_id,
        service_name: guideWithService.services?.name || 'Unknown',
        service_logo_url: guideWithService.services?.logo_url || null,
        service_category: guideWithService.services?.category || 'other',
        steps: guideWithService.steps,
        upi_mandate_instructions: guideWithService.upi_mandate_instructions,
        estimated_time_minutes: guideWithService.estimated_time_minutes,
        difficulty_level: guideWithService.difficulty_level,
        last_verified_at: guideWithService.last_verified_at,
        created_at: guideWithService.created_at,
      }
    })

    return { success: true, data: guides }
  } catch (error) {
    console.error('Unexpected error fetching guides:', error)
    return { success: false, error: 'Failed to fetch guides' }
  }
}

/**
 * Get guide by service ID
 */
export async function getGuideByServiceId(
  serviceId: string
): Promise<{ success: boolean; data?: CancellationGuide; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cancellation_guides')
      .select(`
        id,
        service_id,
        steps,
        upi_mandate_instructions,
        estimated_time_minutes,
        difficulty_level,
        last_verified_at,
        created_at,
        services:service_id (
          name,
          logo_url,
          category
        )
      `)
      .eq('service_id', serviceId)
      .single()

    if (error) {
      console.error('Error fetching guide:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Guide not found' }
    }

    // Transform data to flatten service info
    const guideData = data as unknown as GuideWithService
    const guide: CancellationGuide = {
      id: guideData.id,
      service_id: guideData.service_id,
      service_name: guideData.services?.name || 'Unknown',
      service_logo_url: guideData.services?.logo_url || null,
      service_category: guideData.services?.category || 'other',
      steps: guideData.steps,
      upi_mandate_instructions: guideData.upi_mandate_instructions,
      estimated_time_minutes: guideData.estimated_time_minutes,
      difficulty_level: guideData.difficulty_level,
      last_verified_at: guideData.last_verified_at,
      created_at: guideData.created_at,
    }

    return { success: true, data: guide }
  } catch (error) {
    console.error('Unexpected error fetching guide:', error)
    return { success: false, error: 'Failed to fetch guide' }
  }
}

/**
 * Search guides by service name
 */
export async function searchGuides(
  query: string
): Promise<{ success: boolean; data?: CancellationGuide[]; error?: string }> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('cancellation_guides')
      .select(`
        id,
        service_id,
        steps,
        upi_mandate_instructions,
        estimated_time_minutes,
        difficulty_level,
        last_verified_at,
        created_at,
        services:service_id (
          name,
          logo_url,
          category
        )
      `)
      .ilike('services.name', `%${query}%`)
      .order('services(name)', { ascending: true })

    if (error) {
      console.error('Error searching guides:', error)
      return { success: false, error: error.message }
    }

    // Transform data to flatten service info
    const guides: CancellationGuide[] = (data || []).map((guide) => {
      const guideWithService = guide as unknown as GuideWithService
      return {
        id: guideWithService.id,
        service_id: guideWithService.service_id,
        service_name: guideWithService.services?.name || 'Unknown',
        service_logo_url: guideWithService.services?.logo_url || null,
        service_category: guideWithService.services?.category || 'other',
        steps: guideWithService.steps,
        upi_mandate_instructions: guideWithService.upi_mandate_instructions,
        estimated_time_minutes: guideWithService.estimated_time_minutes,
        difficulty_level: guideWithService.difficulty_level,
        last_verified_at: guideWithService.last_verified_at,
        created_at: guideWithService.created_at,
      }
    })

    return { success: true, data: guides }
  } catch (error) {
    console.error('Unexpected error searching guides:', error)
    return { success: false, error: 'Failed to search guides' }
  }
}
