import type { Metadata } from "next";
import { LandingVariant, variants } from "@/components/lp-variant";

export const metadata: Metadata = {
  title: "経営者解放と仕組み継承を2日で進める｜AI実装相談",
  description:
    "社長のまたかという雑務を減らし、判断基準、見積、返信、教育、確認作業をAIと社員が再現できる会社の型に変える2日間の実装支援。",
};

export default function VariantCPage() {
  return <LandingVariant config={variants.c} />;
}
