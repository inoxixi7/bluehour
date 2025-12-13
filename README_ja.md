# BlueHour - 写真撮影アシスタント 📷

[![Expo](https://img.shields.io/badge/Expo-Go-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.73-61dafb.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BlueHour** は、写真愛好家のために設計されたオールインワンのアシスタントアプリです。「ゴールデンアワー」や「ブルーアワー」などの最適な光の時間を正確に計画し、複雑な撮影シーンに対応するためのプロフェッショナルな計算ツール一式を提供します。

[English](README.md) | [日本語](README_ja.md) | [中文](README_zh.md)

---

## ✨ 主な機能

### 🌅 ブルーアワー・プランナー (Blue Hour Planner)
最高の光の瞬間をもう逃しません。
- **スマート位置特定**：GPS自動測位、都市検索、地図上でのピン留めに対応。
- **正確なタイムライン**：
  - 🔵 **ブルーアワー**：空が深い青色に染まる魔法の時間帯。
  - 🟡 **ゴールデンアワー**：日の出・日の入り時の柔らかい金色の光。
  - 🌑 **薄明（トワイライト）**：天文薄明、航海薄明、市民薄明の詳細データ。
  - ☀️ **日の出/日の入り & 南中**：太陽の重要な位置情報。
- **未来の計画**：日付を自由に選択して、撮影旅行を事前に計画できます。
- **視覚化**：直感的な太陽の軌跡と光のフェーズチャート。

### 🧮 撮影計算ツール (Calculator Suite)

#### 1. 露出計算機 (EV Calculator)
- **相反則計算**：露出量を一定に保ちながら、絞り、シャッタースピード、ISO感度を自由に変換。
- **パラメータロック**：任意のパラメータをロックして、他の値を自動計算。
- **NDフィルター**：NDフィルター使用時の換算を内蔵。

#### 2. 相反則不軌計算機 (Reciprocity Failure)
- **フィルム写真用**：長時間露光時の感度低下（相反則不軌）を補正。
- **フィルムプリセット**：Kodak Portra, Fujifilm Acros, Ilford HP5 など主要なフィルムデータを内蔵。
- **タイマー**：プログレスバー付きのカウントダウンタイマーを搭載。

#### 3. 被写界深度 & 過焦点距離 (DoF & Hyperfocal)
- **合焦範囲**：前方被写界深度、後方被写界深度、全被写界深度を計算。
- **過焦点距離**：風景写真でパンフォーカスを得るために不可欠な計算。
- **マルチフォーマット**：フルサイズ、APS-C、M4/3、中判カメラなどに対応。

---

## 🚀 はじめに

### 前提条件
開発環境に以下がインストールされていることを確認してください：
- **Node.js** (v18以上)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: iOS または Android デバイスにダウンロードしてください。

### インストール手順

1. **リポジトリをクローン**
   ```bash
   git clone https://github.com/inoxixi7/bluehournew.git
   cd bluehournew
   ```

2. **依存関係をインストール**
   ```bash
   npm install
   ```

3. **プロジェクトを起動**
   ```bash
   npx expo start
   ```

4. **アプリを実行**
   - スマートフォンの Expo Go アプリでQRコードをスキャンします。
   - または、Androidエミュレータの場合は `a`、iOSシミュレータの場合は `i` を押します。

---

## 📂 プロジェクト構成

```
bluehournew/
├── assets/             # 静的リソース (画像, フォント)
├── src/
│   ├── api/            # API サービス (Geocoding, SunTimes)
│   ├── components/     # UI コンポーネント
│   ├── constants/      # グローバル定数 (Colors, Layout)
│   ├── contexts/       # React Context (Theme, Location)
│   ├── hooks/          # カスタム Hooks
│   ├── locales/        # i18n 国際化ファイル
│   ├── navigation/     # ナビゲーション設定
│   ├── screens/        # 画面コンポーネント
│   └── utils/          # ユーティリティ関数 (Calculations, Formatters)
└── docs/               # 詳細ドキュメント
```

---

## 🗺️ ロードマップ

- [x] **v1.0 基礎版**
  - [x] 太陽時刻表 & ブルーアワー計算
  - [x] 基本的な露出計算機
  - [x] 多言語対応 (英/中/日/独)
  - [x] ダークモード
- [ ] **v1.1 発展版**
  - [ ] 月齢 & 天の川撮影プランナー
  - [ ] タイムラプス計算機
  - [ ] 現地天気予報の統合
- [ ] **v2.0 コミュニティ版**
  - [ ] ユーザー写真共有
  - [ ] 撮影スポットの推奨

---

## 🛠 技術スタック

- **フレームワーク**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **ナビゲーション**: [React Navigation](https://reactnavigation.org/)
- **地図**: [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- **国際化**: [i18next](https://www.i18next.com/)

## 📄 ライセンス

本プロジェクトは [MIT ライセンス](LICENSE) の下で公開されています。
