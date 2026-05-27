'use client'

import { useEffect, useState } from 'react'

interface UseMeasureDatesReturn {
  recordedDates: string[]   // 'YYYY-MM-DD' 形式
  isLoading: boolean
  error: string | null
  refetch: () => void
}

/**
 * 入力済み測定日をAPIから取得するフック
 *
 * GET /api/records/dates
 * Response: { dates: string[] }  例: { dates: ["2026-04-15", "2026-03-15"] }
 */
export function useMeasureDates(userId: string): UseMeasureDatesReturn {
  const [recordedDates, setRecordedDates] = useState<string[]>([])
  const [isLoading, setIsLoading]         = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [tick, setTick]                   = useState(0)

  useEffect(() => {
    if (!userId) return

    setIsLoading(true)
    setError(null)

    fetch(`/api/records/dates?userId=${encodeURIComponent(userId)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setRecordedDates(data.dates ?? [])
      })
      .catch(err => {
        console.error('Failed to fetch recorded dates:', err)
        setError('測定日の取得に失敗しました')
      })
      .finally(() => setIsLoading(false))
  }, [userId, tick])

  return {
    recordedDates,
    isLoading,
    error,
    refetch: () => setTick(t => t + 1),
  }
}
