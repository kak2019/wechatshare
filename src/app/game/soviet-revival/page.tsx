import type { Metadata } from "next";

import { SovietGalClient } from "@/components/soviet-vn/SovietGalClient";
import { SITE } from "@/content/soviet-vn/meta";

export const metadata: Metadata = {
  title: SITE.title,
  description: SITE.description,
};

export default function SovietRevivalPage() {
  return <SovietGalClient />;
}
