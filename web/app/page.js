import { supabase } from "@/lib/supabase";
import Hero from "@/components/Hero";
import Storefront from "@/components/Storefront";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data, error } = await supabase.from("products").select("*");
  if (error) return <main className="p-10 text-red-400">Error: {error.message}</main>;
  return (
    <main>
      <Hero />
      <Storefront products={data} />
    </main>
  );
}