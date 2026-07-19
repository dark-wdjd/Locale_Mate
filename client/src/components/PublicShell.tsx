import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ArrowUpRight, Languages, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/guides", labelKey: "nav.findGuide" },
  { href: "/blog", labelKey: "nav.journal" },
];

function LanguageToggle({ mobile = false }: { mobile?: boolean }) {
  const { language, toggleLanguage, t } = useLanguage();
  const targetLabel = language === "en" ? t("language.chinese") : t("language.english");
  const ariaLabel = language === "en" ? t("language.switchToChinese") : t("language.switchToEnglish");

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-center gap-2 border border-border bg-card font-semibold text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:scale-[.97]",
        mobile ? "h-11 w-full rounded-xl px-4 text-sm" : "h-10 rounded-full px-3 text-xs",
      )}
    >
      <Languages className="size-4 text-primary" aria-hidden="true" />
      {targetLabel}
    </button>
  );
}

export function BrandMark({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  const { t } = useLanguage();

  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label={t("brand.home")}>
      <span className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(175,57,38,.24)] transition-transform group-hover:-rotate-3">
        <span className="font-serif text-lg font-semibold">LM</span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={cn("block font-serif text-[1.18rem] font-semibold tracking-[-0.02em]", inverse ? "text-[#f7f0df]" : "text-foreground")}>LocalMate</span>
          <span className={cn("mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.25em]", inverse ? "text-[#f7f0df]/62" : "text-muted-foreground")}>{t("brand.location")}</span>
        </span>
      )}
    </Link>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/92 backdrop-blur-xl">
        <div className="container flex h-[4.75rem] items-center justify-between gap-8">
          <BrandMark />
          <nav className="hidden items-center gap-2 lg:flex" aria-label={t("nav.primary")}>
            {navigation.map(item => {
              const active = location === item.href || location.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground xl:inline-flex">
              <ShieldCheck className="size-4 text-emerald-700" /> {t("nav.publicSource")}
            </span>
            <LanguageToggle />
            <Button asChild className="rounded-full px-5">
              <Link href="/guides">{t("nav.browse")} <ArrowUpRight className="size-4" /></Link>
            </Button>
          </div>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground lg:hidden"
            onClick={() => setOpen(value => !value)}
            aria-expanded={open}
            aria-label={t("nav.toggle")}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border bg-background px-4 py-3 lg:hidden">
            <nav className="mx-auto grid max-w-sm gap-2" aria-label={t("nav.mobile")}>
              {navigation.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-5 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              <div className="mt-1 border-t border-border pt-3"><LanguageToggle mobile /></div>
            </nav>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="mt-20 border-t border-border bg-[#17382f] text-[#f7f0df]">
        <div className="container grid gap-12 py-14 md:grid-cols-[1.15fr_.85fr_.85fr]">
          <div className="max-w-md">
            <BrandMark inverse />
            <p className="mt-5 text-sm leading-7 text-[#f7f0df]/72">{t("footer.description")}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efb055]">{t("footer.explore")}</p>
            <div className="mt-4 grid gap-3 text-sm text-[#f7f0df]/78">
              <Link href="/guides" className="hover:text-white">{t("footer.guideDirectory")}</Link>
              <Link href="/blog" className="hover:text-white">{t("nav.journal")}</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#efb055]">{t("footer.accuracy")}</p>
            <p className="mt-4 text-sm leading-6 text-[#f7f0df]/72">{t("footer.question")}</p>
            <Link href="/claim" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#efb055]">
              {t("footer.action")} <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container flex flex-col gap-2 py-5 text-xs text-[#f7f0df]/55 sm:flex-row sm:items-center sm:justify-between">
            <span>{t("footer.copyright")}</span>
            <span className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
              {t("footer.disclaimer")}
              <Link href="/about" className="underline decoration-white/30 hover:text-white">{t("footer.credits")}</Link>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
