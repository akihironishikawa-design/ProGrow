# MeasureDatePicker — 実装ガイド

## ファイル構成

```
components/
  MeasureDatePicker.tsx   # カレンダーUIコンポーネント
hooks/
  useMeasureDates.ts      # 入力済み日付取得フック
app/input/step1/
  page.tsx                # InputStep1Page（使用例）
```

## インストール

```bash
npm install react-day-picker date-fns
```

## 使い方

```tsx
import MeasureDatePicker from '@/components/MeasureDatePicker'
import { useMeasureDates } from '@/hooks/useMeasureDates'

const { recordedDates } = useMeasureDates(userId)

<MeasureDatePicker
  onSelect={(date) => setSelectedDate(date)}
  recordedDates={recordedDates}      // 入力済み日 → グレーアウト・選択不可
  editingDate="2026-04-15"           // 修正モード時のみ指定（その日は選択可）
/>
```

## 必要なAPIエンドポイント

```
GET /api/records/dates?userId={userId}
→ { dates: ["2026-04-15", "2026-03-15", ...] }
```

Vercel Postgresなら:
```ts
// app/api/records/dates/route.ts
import { sql } from '@vercel/postgres'

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get('userId')
  const { rows } = await sql`
    SELECT TO_CHAR(measured_at, 'YYYY-MM-DD') AS date
    FROM measurements
    WHERE user_id = ${userId}
    ORDER BY measured_at DESC
  `
  return Response.json({ dates: rows.map(r => r.date) })
}
```

## 動作仕様

| 状態           | 表示                        |
|---------------|----------------------------|
| 未来日         | グレーアウト・選択不可          |
| 入力済み日      | 打ち消し線・グレーアウト・選択不可 |
| 修正モード対象日 | 通常通り選択可                |
| 今日           | 青枠でハイライト               |
| 過去日選択時    | 「入力忘れ対応」バッジ表示       |
| 無効日クリック  | エラーメッセージ表示            |
