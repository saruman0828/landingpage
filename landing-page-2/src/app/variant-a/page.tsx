import type { Metadata } from "next";
import { LandingVariant, variants } from "@/components/lp-variant";

export const metadata: Metadata = {
  title: "現場の持ち帰り確認を即断できる仕組みに変える｜AI実装相談",
  description:
    "建設・不動産・地域サービスなど、会社に持ち帰る見積、工程、教育、返信の確認を、AIと社員が再現できる仕組みに変える実装支援。",
};

export default function VariantAPage() {
  return <LandingVariant config={variants.a} />;
}
