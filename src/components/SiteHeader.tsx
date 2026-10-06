import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        Groww FirstStep
      </Link>
      <p className="prototype-label">Prototype</p>
    </header>
  );
}
