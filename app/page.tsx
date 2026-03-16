import Categories from "./components/Categories";
import PropertyList from "./components/properties/PropertyList";

interface HomeProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    guests?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  return (
    <main className="max-w-[1500px] mx-auto px-6">
      <Categories />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <PropertyList searchParams={params} />
      </div>
    </main>
  );
}
