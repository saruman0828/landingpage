import type { Metadata } from "next";
import { LandingVariant, variants } from "@/components/lp-variant";

export const metadata: Metadata = {
  title: "AIマスター2日間集中キャンプ｜経営者・幹部向けAI講座",
  description:
    "時間が無い経営者やシステム開発を目指す方向け。ChatGPT、Codex、Claude Codeを使い、バイブコーディングとAIエージェント作成まで学ぶ2日間集中強化キャンプ。",
};

export default function VariantBPage() {
  return <LandingVariant config={variants.b} />;
}
