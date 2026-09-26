import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-20 md:pt-24">{children}</main>
      <Footer />
    </>
  );
}
