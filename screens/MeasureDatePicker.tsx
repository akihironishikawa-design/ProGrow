'use client'

import { useState, useEffect } from 'react'
import { DayPicker, DayClickEventHandler } from 'react-day-picker'
import { ja } from 'date-fns/locale'
import { format, isFuture, isToday, parseISO } from 'date-fns'
import 'react-day-picker/dist/style.css'

// ─────────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────────
interface MeasureDatePickerProps {
  /** 選択済みの日付を親に返す */
  onSelect: (date: Date | null) => void
  /** 初期選択日（修正モード時に渡す） */
  defaultDate?: Date
  /** 入力済み日付リスト（APIから取得） */
  recordedDates?: string[]   // 'YYYY-MM-DD' 形式
  /** 修正モード：この日付は入力済みでも選択可 */
  editingDate?: string       // 'YYYY-MM-DD' 形式
}

// ─────────────────────────────────────────────
// コンポーネント
// ─────────────────────────────────────────────
export default function MeasureDatePicker({
  onSelect,
  defaultDate,
  recordedDates = [],
  editingDate,
}: MeasureDatePickerProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [selected, setSelected] = useState<Date | undefined>(
    defaultDate ?? today
  )
  const [error, setError] = useState<string | null>(null)

  // 入力済み日付を Date[] に変換（修正中の日付は除外）
  const disabledDates: Date[] = recordedDates
    .filter(d => d !== editingDate)
    .map(d => parseISO(d))

  // 未来日も無効
  const disabledMatchers = [
    { after: today },      // 未来日
    ...disabledDates,      // 入力済み日
  ]

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) {
      if (isFuture(day)) {
        setError('未来の日付は選択できません')
      } else {
        setError('この日付はすでに入力済みです')
      }
      return
    }
    setError(null)
    setSelected(day)
    onSelect(day)
  }

  // 初期値を親に通知
  useEffect(() => {
    onSelect(selected ?? null)
  }, [])

  const isPast = selected && !isToday(selected) && !isFuture(selected)

  return (
    <div className="measure-date-picker">

      {/* 選択中の日付表示 */}
      <div className="selected-display">
        <span className="selected-label">測定日</span>
        <span className="selected-value">
          {selected
            ? format(selected, 'yyyy年M月d日（EEE）', { locale: ja })
            : '日付を選択してください'}
        </span>
        {isPast && (
          <span className="badge-past">⚠ 入力忘れ対応</span>
        )}
        {isToday(selected ?? new Date()) && (
          <span className="badge-today">今日</span>
        )}
      </div>

      {/* カレンダー本体 */}
      <DayPicker
        mode="single"
        selected={selected}
        onDayClick={handleDayClick}
        disabled={disabledMatchers}
        locale={ja}
        // 未来月への移動を制限
        toDate={today}
        // 過去12ヶ月まで遡れる
        fromDate={new Date(today.getFullYear(), today.getMonth() - 11, 1)}
        modifiers={{
          recorded: disabledDates,
        }}
        modifiersStyles={{
          recorded: {
            textDecoration: 'line-through',
            opacity: 0.4,
            cursor: 'not-allowed',
          },
        }}
        styles={{
          root:    { width: '100%' },
          caption: { color: 'var(--navy)' },
          head:    { color: 'var(--sub)' },
        }}
      />

      {/* エラーメッセージ */}
      {error && (
        <div className="date-error">
          🚫 {error}。別の日付を選んでください。
        </div>
      )}

      {/* 凡例 */}
      <div className="legend">
        <div className="legend-item">
          <span className="legend-dot legend-dot--selected" />
          <span>選択中</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot--recorded" />
          <span>入力済み（選択不可）</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot--disabled" />
          <span>選択不可</span>
        </div>
      </div>

      <style jsx>{`
        .measure-date-picker {
          font-family: 'Plus Jakarta Sans', 'Noto Sans JP', sans-serif;
        }

        /* ── 選択日表示 ── */
        .selected-display {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          background: #EAFAF1;
          border: 1.5px solid #A9DFBF;
          border-radius: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .selected-label {
          font-size: 11px;
          font-weight: 700;
          color: #5A6F84;
          flex-shrink: 0;
        }
        .selected-value {
          font-size: 14px;
          font-weight: 700;
          color: #0B1D35;
          flex: 1;
        }
        .badge-past {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 99px;
          background: #FFF7E6;
          border: 1px solid #F8C471;
          color: #8A4F00;
          white-space: nowrap;
        }
        .badge-today {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 99px;
          background: #EBF3FF;
          border: 1px solid rgba(30,111,217,.3);
          color: #1E6FD9;
        }

        /* ── カレンダー上書き ── */
        :global(.rdp) {
          --rdp-cell-size: 40px;
          --rdp-accent-color: #1E6FD9;
          --rdp-background-color: #EBF3FF;
          --rdp-accent-color-dark: #0B4DB5;
          --rdp-outline: 2px solid #1E6FD9;
          --rdp-outline-selected: 2px solid #0B4DB5;
          margin: 0;
          width: 100%;
        }
        :global(.rdp-months) { width: 100%; }
        :global(.rdp-month)  { width: 100%; }
        :global(.rdp-table)  { width: 100%; max-width: 100%; }

        /* 今日 */
        :global(.rdp-day_today:not(.rdp-day_selected)) {
          font-weight: 800;
          color: #1E6FD9;
          border: 1.5px solid #1E6FD9;
          border-radius: 50%;
        }

        /* 選択中 */
        :global(.rdp-day_selected) {
          background-color: #1E6FD9 !important;
          color: white !important;
          border-radius: 50%;
        }

        /* 入力済み（打ち消し線） */
        :global(.rdp-day_recorded) {
          text-decoration: line-through;
          opacity: 0.4;
          cursor: not-allowed !important;
        }

        /* 無効（未来・入力済み）共通 */
        :global(.rdp-day_disabled) {
          cursor: not-allowed;
          opacity: 0.35;
        }

        /* ホバー */
        :global(.rdp-button:not([disabled]):hover) {
          background-color: #EBF3FF;
          border-radius: 50%;
        }

        /* キャプション（月表示） */
        :global(.rdp-caption_label) {
          font-size: 14px;
          font-weight: 700;
          color: #0B1D35;
        }

        /* ── エラーメッセージ ── */
        .date-error {
          margin-top: 8px;
          padding: 9px 12px;
          background: #FFF5F5;
          border: 1px solid #F9BABA;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 600;
          color: #E53E3E;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── 凡例 ── */
        .legend {
          display: flex;
          gap: 14px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          color: #5A6F84;
        }
        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }
        .legend-dot--selected  { background: #1E6FD9; }
        .legend-dot--recorded  { background: #CBD5DF; }
        .legend-dot--disabled  { background: #EEF2F7; border: 1px solid #D8E5EF; }
      `}</style>
    </div>
  )
}
