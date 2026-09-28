import RouteChrome from "./RouteChrome";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div
      dir={lang === "he" ? "rtl" : "ltr"}
      className="bg-white min-h-screen overflow-x-clip flex flex-col justify-between"
    >
      <RouteChrome>{children}</RouteChrome>
    </div>
  );
}