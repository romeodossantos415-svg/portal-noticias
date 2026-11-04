import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AdSlot } from "@/components/site/AdSlot";

export const revalidate = 60;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSlot position="top" />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
