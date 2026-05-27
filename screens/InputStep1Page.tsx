'use client'

/**
 * D-04: データ入力 STEP1（Next.js ページコンポーネント例）
 *
 * 使用例:
 *   app/input/step1/page.tsx  として配置
 *
 * 依存:
 *   npm install react-day-picker date-fns
 */

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import MeasureDatePicker from '@/components/MeasureDatePicker'
import { useMeasureDates } from '@/hooks/useMeasureDates'

export default function InputStep1Page() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  // 修正モード: /input/step1?edit=2026-04-15
  const editingDate  = searchParams.get('edit') ?? undefined

  // TODO: 実際はsession/authから取得
  const userId = 'user_yamada_taro'

  const { recordedDates, isLoading } = useMeasureDates(userId)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [height, setHeight]             = useState(161.2)
  const [weight, setWeight]             = useState(52.3)
  const [epiphysis, setEpiphysis]       = useState(3.2)

  const isDateValid =
    selectedDate !== null &&
    (
      !recordedDates.includes(format(selectedDate, 'yyyy-MM-dd')) ||
      format(selectedDate, 'yyyy-MM-dd') === editingDate
    )

  function handleNext() {
    if (!isDateValid) return
    // セッション/storeに保存してSTEP2へ
    sessionStorage.setItem('nobita_input', JSON.stringify({
      measure_date: format(selectedDate!, 'yyyy-MM-dd'),
      ht: height,
      wt: weight,
      ep: epiphysis,
      _editing: editingDate,
    }))
    router.push('/input/step2')
  }

  return (
    <div className="page">

      {/* ─ ステップヘッダー ─ */}
      <header className="step-header">
        <button onClick={() => router.back()} className="back-btn">‹</button>
        <div>
          <h1 className="step-title">定期測定入力</h1>
          <p className="step-meta">STEP 1 / 4</p>
        </div>
      </header>

      <div className="content">

        {/* ─ 日付ピッカー ─ */}
        <section className="section">
          <h2 className="section-title">📅 測定日を選択</h2>
          {isLoading ? (
            <div className="loading">読み込み中…</div>
          ) : (
            <MeasureDatePicker
              onSelect={setSelectedDate}
              defaultDate={editingDate ? new Date(editingDate) : new Date()}
              recordedDates={recordedDates}
              editingDate={editingDate}
            />
          )}
        </section>

        {/* ─ 身長・体重 ─ */}
        <section className="section">
          <h2 className="section-title">📏 身長・体重</h2>
          <NumericInput
            label="身長"
            value={height}
            unit="cm"
            step={0.1}
            min={100}
            max={250}
            onChange={setHeight}
          />
          <NumericInput
            label="体重"
            value={weight}
            unit="kg"
            step={0.1}
            min={20}
            max={200}
            onChange={setWeight}
          />
        </section>

        {/* ─ 骨端線幅（任意） ─ */}
        <section className="section">
          <h2 className="section-title">🦴 骨端線幅（任意）</h2>
          <NumericInput
            label="骨端線幅"
            value={epiphysis}
            unit="mm"
            step={0.1}
            min={0}
            max={20}
            onChange={setEpiphysis}
          />
        </section>

        {/* ─ ボタン ─ */}
        <button
          className="btn-primary"
          onClick={handleNext}
          disabled={!isDateValid}
        >
          次へ → 生活習慣の入力
        </button>

        <button
          className="btn-ghost"
          onClick={() => router.push('/dashboard')}
        >
          ← ダッシュボードに戻る
        </button>

        <button
          className="btn-cancel"
          onClick={() => {
            if (confirm('入力を中止してホームに戻りますか？\n入力中のデータは保存されません。')) {
              router.push('/dashboard')
            }
          }}
        >
          ✕ 入力を中止する
        </button>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// サブコンポーネント: ±ボタン数値入力
// ─────────────────────────────────────────────
function NumericInput({
  label, value, unit, step, min, max, onChange,
}: {
  label: string
  value: number
  unit: string
  step: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  function adj(delta: number) {
    const next = Math.round((value + delta) * 100) / 100
    onChange(Math.max(min, Math.min(max, next)))
  }

  return (
    <div className="num-field">
      <label className="num-label">{label}</label>
      <div className="num-wrap">
        <button className="nm-btn" onClick={() => adj(-step)}>−</button>
        <div className="nm-center">
          <span className="nm-val">{value.toFixed(1)}</span>
          <span className="nm-unit">{unit}</span>
        </div>
        <button className="nm-btn" onClick={() => adj(+step)}>＋</button>
      </div>
    </div>
  )
}
