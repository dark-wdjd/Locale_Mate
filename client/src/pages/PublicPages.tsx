import React, { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useParams } from "wouter";
import { Streamdown } from "streamdown";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileCheck2,
  Filter,
  Leaf,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";
import { toast } from "sonner";
import { PublicShell } from "@/components/PublicShell";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/manus-storage/localmate-chengdu-hero_79301c61.jpg";

type GuideTag = { id: number; slug: string; name: string; category: string };
type GuideSource = {
  id: number;
  platform: "xiaohongshu" | "douyin" | "media" | "website";
  sourceType: "profile" | "post" | "article" | "search";
  url: string;
  publicTitle: string | null;
  evidenceSummary: string | null;
  isPrimary: boolean;
  verifiedAt: Date;
};
type GuideSummary = {
  id: number;
  slug: string;
  displayName: string;
  shortBio: string;
  longBio: string | null;
  city: string;
  languages: string;
  status: "active" | "unclaimed" | "removed";
  isClaimed: boolean;
  isFeatured: boolean;
  isEditorsPick: boolean;
  avatarUrl: string | null;
  lastVerifiedAt: Date | null;
  tags: GuideTag[];
  sources: GuideSource[];
};
type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  category: string;
  readingMinutes: number;
  publishedAt: Date | null;
};

function usePageMeta(title: string, description: string, image = HERO_IMAGE, type: "website" | "article" = "website") {
  useEffect(() => {
    const fullTitle = `${title} | LocalMate China`;
    const canonicalUrl = new URL(window.location.pathname, window.location.origin).href;
    const absoluteImage = image.startsWith("http") ? image : new URL(image, window.location.origin).href;
    document.title = fullTitle;

    const setMeta = (selector: string, attribute: "name" | "property", key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMeta('meta[name="description"]', "name", "description", description);
    setMeta('meta[name="robots"]', "name", "robots", "index,follow,max-image-preview:large");
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:type"]', "property", "og:type", type);
    setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMeta('meta[property="og:image"]', "property", "og:image", absoluteImage);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", absoluteImage);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, image, title, type]);
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label">{children}</p>;
}

function InitialAvatar({ name, large = false }: { name: string; large?: boolean }) {
  const initials = name
    .split(/[\s()]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join("");
  const palettes = ["bg-[#d8e1c3] text-[#29473b]", "bg-[#f0d1b5] text-[#743926]", "bg-[#cddce2] text-[#214654]", "bg-[#eadcae] text-[#60471d]"];
  const palette = palettes[name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length];
  return (
    <div className={cn("grid shrink-0 place-items-center rounded-[1.35rem] font-serif font-semibold shadow-inner", large ? "size-28 text-3xl sm:size-36" : "size-16 text-xl", palette)} aria-hidden="true">
      {initials}
    </div>
  );
}

export function GuideAvatar({ name, avatarUrl, large = false }: { name: string; avatarUrl?: string | null; large?: boolean }) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!avatarUrl || imageFailed) return <InitialAvatar name={name} large={large} />;

  return (
    <img
      src={avatarUrl}
      alt={`${name} profile`}
      onError={() => setImageFailed(true)}
      className={cn(
        "shrink-0 rounded-[1.35rem] border border-[#17382f]/10 object-cover shadow-inner",
        large ? "size-28 sm:size-36" : "size-16",
      )}
    />
  );
}

function Tag({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{children}</span>;
}

function GuideCard({ guide }: { guide: GuideSummary }) {
  const { language, t } = useLanguage();
  const recordEvent = trpc.operations.recordContentEvent.useMutation();

  const recordGuideCardClick = () => {
    recordEvent.mutate({
      eventType: "guide_card_click",
      guideId: guide.id,
      pagePath: `${window.location.pathname}${window.location.search}`,
      referrerPath: document.referrer ? new URL(document.referrer).pathname : undefined,
    });
  };

  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-border/80 bg-card p-5 shadow-[0_16px_50px_rgba(44,43,36,.06)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(44,43,36,.11)]">
      <div className="flex items-start justify-between gap-4">
        <GuideAvatar name={guide.displayName} avatarUrl={guide.avatarUrl} />
        <div className="flex flex-wrap justify-end gap-2">
          {guide.isEditorsPick && <Tag active>{t("common.editorReviewed")}</Tag>}
          {guide.status === "unclaimed" && <Tag>{t("common.unclaimed")}</Tag>}
        </div>
      </div>
      <div className="mt-6 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{guide.city} · {guide.languages}</p>
        <h3 className="mt-2 font-serif text-[1.65rem] font-semibold tracking-[-0.025em] text-card-foreground">{guide.displayName}</h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{guide.shortBio}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {guide.tags.slice(0, 4).map(tag => <Tag key={tag.id}>{language === "zh" ? t(`tag.${tag.slug}`) : tag.name}</Tag>)}
        </div>
      </div>
      <Link href={`/guides/${guide.slug}`} onClick={recordGuideCardClick} className="mt-6 inline-flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-foreground">
        {t("common.reviewEvidence")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

function ArticleCard({ article, featured = false }: { article: ArticleSummary; featured?: boolean }) {
  const { language, t } = useLanguage();
  return (
    <Link href={`/blog/${article.slug}`} className={cn("group block overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[0_16px_50px_rgba(44,43,36,.06)]", featured && "md:grid md:grid-cols-[1.1fr_.9fr]")}>
      {article.coverImageUrl ? (
        <div className={cn("overflow-hidden bg-muted", featured ? "min-h-72" : "aspect-[16/10]")}>
          <img src={article.coverImageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]" />
        </div>
      ) : (
        <div className={cn("grid place-items-center bg-[#17382f] text-[#f7f0df]", featured ? "min-h-72" : "aspect-[16/10]")}>
          <FileCheck2 className="size-14 text-[#efb055]" />
        </div>
      )}
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.15em] text-primary">
          <span>{language === "zh" ? t(`category.${article.category}`) : article.category}</span><span className="size-1 rounded-full bg-border" /><span>{t("common.readMinutes", { count: article.readingMinutes })}</span>
        </div>
        <h3 className={cn("mt-4 font-serif font-semibold tracking-[-0.03em] text-card-foreground", featured ? "text-3xl" : "text-2xl")}>{article.title}</h3>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">{t("common.readNote")} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

function GuideGridSkeleton({ count = 4 }: { count?: number }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: count }).map((_, index) => <Skeleton key={index} className="h-[27rem] rounded-[1.75rem]" />)}</div>;
}

function ErrorPanel({ message }: { message: string }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/5 p-8 text-center">
      <CircleAlert className="mx-auto size-7 text-destructive" />
      <h2 className="mt-4 font-serif text-2xl font-semibold">{t("common.loadErrorTitle")}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ContentFallbackNote({ className }: { className?: string }) {
  const { language, t } = useLanguage();
  if (language !== "zh") return null;
  return <p className={cn("rounded-xl bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground", className)}>{t("common.contentFallback")}</p>;
}

export function HomePage() {
  const { t } = useLanguage();
  usePageMeta(t("home.metaTitle"), t("home.metaDescription"));
  const featured = trpc.guides.list.useQuery({ featuredOnly: true, limit: 4, offset: 0 });
  const articles = trpc.blog.list.useQuery({ featuredOnly: true });

  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border bg-[#f5eddf]">
        <div className="container grid min-h-[42rem] items-center gap-10 py-12 lg:min-h-[36rem] lg:grid-cols-[.92fr_1.08fr] lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <SectionLabel>{t("home.eyebrow")}</SectionLabel>
            <h1 className="mt-6 max-w-[12ch] font-serif text-[clamp(3.4rem,7vw,6.9rem)] font-semibold leading-[.91] tracking-[-0.055em] text-[#17382f]">
              {t("home.title")}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#4f5b53] sm:text-lg">
              {t("home.intro")}
            </p>
            <div className="mt-9">
              <Button asChild size="lg" className="h-13 rounded-full px-7 text-base">
                <Link href="/guides">{t("home.findGuide")} <ArrowRight className="size-5" /></Link>
              </Button>
            </div>
          </div>
          <div className="relative lg:pl-5">
            <div className="absolute -left-10 top-12 hidden size-32 rounded-full border border-[#af3926]/20 lg:block" />
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#17382f] shadow-[0_35px_90px_rgba(31,57,49,.25)]">
              <img src={HERO_IMAGE} alt={t("home.heroAlt")} className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[6/5]" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/25 bg-[#17382f]/88 p-5 text-white backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#efb055]" />
                  <div><p className="text-sm font-semibold">{t("home.pilot")}</p><p className="mt-1 text-xs leading-5 text-white/68">{t("home.pilotCopy")}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><SectionLabel>{t("home.evidenceLabel")}</SectionLabel><h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("home.evidenceTitle")}</h2></div>
          <Button asChild variant="outline" className="w-fit rounded-full bg-card"><Link href="/guides">{t("home.viewAll")} <ArrowRight className="size-4" /></Link></Button>
        </div>
        <ContentFallbackNote className="mt-8" />
        <div className="mt-10">
          {featured.isLoading ? <GuideGridSkeleton /> : featured.error ? <ErrorPanel message={featured.error.message} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{featured.data?.map(guide => <GuideCard key={guide.id} guide={guide as GuideSummary} />)}</div>}
        </div>
      </section>

      <section className="bg-[#17382f] py-20 text-[#f7f0df] sm:py-24">
        <div className="container">
          <SectionLabel>{t("home.interestLabel")}</SectionLabel>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
            <h2 className="max-w-xl font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("home.interestTitle")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [t("home.interest.pandas.title"), t("home.interest.pandas.copy"), "pandas"],
                [t("home.interest.tea.title"), t("home.interest.tea.copy"), "tea-culture"],
                [t("home.interest.opera.title"), t("home.interest.opera.copy"), "sichuan-opera"],
                [t("home.interest.west.title"), t("home.interest.west.copy"), "western-sichuan"],
              ].map(([title, copy, tag]) => (
                <Link key={tag} href={`/guides?tag=${tag}`} className="group rounded-[1.5rem] border border-white/12 bg-white/[.055] p-5 transition-colors hover:bg-white/[.1]">
                  <div className="flex items-start justify-between gap-4"><Leaf className="size-5 text-[#efb055]" /><ChevronRight className="size-4 text-white/45 transition-transform group-hover:translate-x-1" /></div>
                  <h3 className="mt-7 font-serif text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/62">{copy}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
          <div><SectionLabel>{t("home.notesLabel")}</SectionLabel><h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{t("home.notesTitle")}</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">{t("home.notesCopy")}</p><Button asChild variant="outline" className="mt-7 rounded-full bg-card"><Link href="/blog">{t("home.openJournal")} <BookOpen className="size-4" /></Link></Button></div>
          <div><ContentFallbackNote className="mb-5" /><div className="grid gap-5">{articles.isLoading ? <Skeleton className="h-80 rounded-[1.75rem]" /> : articles.data?.slice(0, 2).map((article, index) => <ArticleCard key={article.id} article={article as ArticleSummary} featured={index === 0} />)}</div></div>
        </div>
      </section>

      <section className="container pb-4">
        <div className="grid gap-6 rounded-[2rem] bg-[#eadcae] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#743926]">{t("home.accuracyLabel")}</p><h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.03em] text-[#17382f]">{t("home.guideQuestion")}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#435248]">{t("home.claimCopy")}</p></div>
          <Button asChild className="h-12 rounded-full px-6"><Link href="/claim">{t("home.startRequest")} <ArrowRight className="size-4" /></Link></Button>
        </div>
      </section>
    </PublicShell>
  );
}

export function GuidesDirectoryPage() {
  const { language, t } = useLanguage();
  usePageMeta(t("directory.metaTitle"), t("directory.metaDescription"));
  const params = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState(params.get("tag") ?? "");
  const queryInput = useMemo(() => ({ search: search.trim() || undefined, tag: tag || undefined, limit: 48, offset: 0 }), [search, tag]);
  const guides = trpc.guides.list.useQuery(queryInput);
  const tags = trpc.guides.tags.useQuery();

  return (
    <PublicShell>
      <section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20">
        <div className="container grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
          <div><SectionLabel>{t("directory.label")}</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">{t("directory.title")}</h1></div>
          <p className="max-w-xl text-sm leading-7 text-[#4f5b53]">{t("directory.intro")}</p>
        </div>
      </section>
      <section className="container py-10 sm:py-14">
        <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="relative"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder={t("directory.searchPlaceholder")} className="h-12 rounded-xl pl-12" aria-label={t("directory.searchLabel")} /></div>
          <div className="mt-4 flex items-start gap-3"><Filter className="mt-2 size-4 shrink-0 text-muted-foreground" /><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTag("")} className={cn("rounded-full px-3 py-2 text-xs font-semibold transition-colors", !tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{t("directory.allInterests")}</button>{tags.data?.map(item => <button key={item.id} type="button" onClick={() => setTag(item.slug)} className={cn("rounded-full px-3 py-2 text-xs font-semibold transition-colors", tag === item.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{language === "zh" ? t(`tag.${item.slug}`) : item.name}</button>)}</div></div>
        </div>
        <ContentFallbackNote className="mt-6" />
        <div className="mt-8 flex items-center justify-between"><p className="text-sm text-muted-foreground">{guides.isLoading ? t("directory.reviewing") : t("directory.profileCount", { count: guides.data?.length ?? 0, suffix: guides.data?.length === 1 ? "" : "s" })}</p>{(search || tag) && <button type="button" onClick={() => { setSearch(""); setTag(""); }} className="text-sm font-semibold text-primary hover:underline">{t("directory.clear")}</button>}</div>
        <div className="mt-5">{guides.isLoading ? <GuideGridSkeleton count={8} /> : guides.error ? <ErrorPanel message={guides.error.message} /> : guides.data?.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{guides.data.map(guide => <GuideCard key={guide.id} guide={guide as GuideSummary} />)}</div> : <div className="rounded-[2rem] border border-dashed border-border bg-muted/35 px-6 py-20 text-center"><UserRoundSearch className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-5 font-serif text-2xl font-semibold">{t("directory.emptyTitle")}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{t("directory.emptyCopy")}</p></div>}</div>
      </section>
    </PublicShell>
  );
}

function SourcePlatform({ source }: { source: GuideSource }) {
  const { t } = useLanguage();
  const labels = { xiaohongshu: "Xiaohongshu", douyin: "Douyin", media: t("common.source.media"), website: t("common.source.website") };
  return <span>{labels[source.platform]} · {t(`common.source.${source.sourceType}`)}</span>;
}

function OffsiteSourceButton({ guide, source }: { guide: GuideSummary; source: GuideSource }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const record = trpc.guides.recordClick.useMutation();
  const leave = async () => {
    const externalWindow = window.open("about:blank", "_blank", "noopener,noreferrer");
    try {
      const result = await record.mutateAsync({ guideId: guide.id, sourceId: source.id, pagePath: window.location.pathname, referrerPath: document.referrer ? new URL(document.referrer).pathname : undefined });
      if (externalWindow) externalWindow.location.href = result.targetUrl;
      else window.location.href = result.targetUrl;
      setOpen(false);
    } catch (error) {
      externalWindow?.close();
      toast.error(error instanceof Error ? error.message : t("guide.openError"));
    }
  };

  return (
    <>
      <Button type="button" variant={source.isPrimary ? "default" : "outline"} className="rounded-full" onClick={() => setOpen(true)}>
        {t("guide.openSource")} <ExternalLink className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[1.5rem] sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-2xl">{t("guide.offsiteTitle")}</DialogTitle><DialogDescription className="pt-2 leading-6">{t("guide.offsiteDescription", { platform: source.platform === "xiaohongshu" ? "Xiaohongshu" : source.platform === "douyin" ? "Douyin" : t("common.source.website") })}</DialogDescription></DialogHeader>
          <div className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">{t("guide.beforeArrange")}</strong> {t("guide.beforeArrangeCopy")}</div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">{t("guide.stay")}</Button><Button onClick={leave} disabled={record.isPending} className="rounded-full">{record.isPending ? t("guide.recording") : t("guide.continue")}<ArrowUpRight className="size-4" /></Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuideDetailPage() {
  const { language, t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const guide = trpc.guides.getBySlug.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  usePageMeta(guide.data?.displayName ?? t("guide.metaFallbackTitle"), guide.data?.shortBio ?? t("guide.metaFallbackDescription"));

  if (guide.isLoading) return <PublicShell><div className="container py-20"><Skeleton className="h-[35rem] rounded-[2rem]" /></div></PublicShell>;
  if (guide.error || !guide.data) return <PublicShell><div className="container py-20"><ErrorPanel message={guide.error?.message ?? t("guide.notFound")} /></div></PublicShell>;
  const item = guide.data as GuideSummary;

  return (
    <PublicShell>
      <section className="border-b border-border bg-[#f5eddf] py-10 sm:py-16">
        <div className="container">
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f5b53] hover:text-[#17382f]"><ArrowLeft className="size-4" /> {t("guide.back")}</Link>
          <div className="mt-9 grid gap-8 lg:grid-cols-[auto_1fr_.42fr] lg:items-start">
            <GuideAvatar name={item.displayName} avatarUrl={item.avatarUrl} large />
            <div><div className="flex flex-wrap gap-2">{item.isEditorsPick && <Tag active>{t("common.editorReviewed")}</Tag>}<Tag>{item.isClaimed ? t("common.claimed") : t("common.unclaimedProfile")}</Tag></div><h1 className="mt-5 font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">{item.displayName}</h1><p className="mt-5 max-w-3xl text-base leading-8 text-[#4f5b53]">{item.shortBio}</p><div className="mt-6 flex flex-wrap gap-2">{item.tags.map(tag => <Tag key={tag.id}>{language === "zh" ? t(`tag.${tag.slug}`) : tag.name}</Tag>)}</div></div>
            <div className="rounded-[1.5rem] border border-[#17382f]/12 bg-white/55 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#743926]">{t("guide.status")}</p><dl className="mt-4 grid gap-4 text-sm"><div><dt className="text-[#4f5b53]">{t("guide.location")}</dt><dd className="mt-1 font-semibold text-[#17382f]">{item.city}</dd></div><div><dt className="text-[#4f5b53]">{t("guide.languages")}</dt><dd className="mt-1 font-semibold text-[#17382f]">{item.languages}</dd></div><div><dt className="text-[#4f5b53]">{t("guide.reviewed")}</dt><dd className="mt-1 font-semibold text-[#17382f]">{item.lastVerifiedAt ? new Date(item.lastVerifiedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : t("guide.reviewUnavailable")}</dd></div></dl></div>
          </div>
        </div>
      </section>
      <section className="container grid gap-10 py-12 lg:grid-cols-[1fr_.52fr] lg:py-16">
        <div>
          <SectionLabel>{t("guide.indicate")}</SectionLabel>
          {language === "zh" && <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">{t("common.contentFallback")}</p>}
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-foreground/82">{item.longBio}</div>
          <div className="mt-12"><SectionLabel>{t("guide.sources")}</SectionLabel><h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.03em]">{t("guide.reviewYourself")}</h2><div className="mt-6 grid gap-4">{item.sources.map(source => <article key={source.id} className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary"><SourcePlatform source={source} /></p><h3 className="mt-3 font-serif text-xl font-semibold">{source.publicTitle ?? t("guide.publicEvidence")}</h3>{source.evidenceSummary && <p className="mt-3 text-sm leading-6 text-muted-foreground">{source.evidenceSummary}</p>}<p className="mt-3 text-xs text-muted-foreground">{t("guide.reviewDate", { date: new Date(source.verifiedAt).toLocaleDateString(language === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "short", day: "numeric" }) })}</p></div><OffsiteSourceButton guide={item} source={source} /></div></article>)}</div></div>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start"><div className="rounded-[1.75rem] bg-[#17382f] p-6 text-[#f7f0df] sm:p-7"><ShieldCheck className="size-7 text-[#efb055]" /><h2 className="mt-5 font-serif text-2xl font-semibold">{t("guide.verifyTitle")}</h2><ul className="mt-5 grid gap-4 text-sm leading-6 text-white/72">{[t("guide.verify.identity"), t("guide.verify.credentials"), t("guide.verify.terms"), t("guide.verify.privacy")].map(text => <li key={text} className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-[#efb055]" />{text}</li>)}</ul></div><div className="mt-5 rounded-[1.5rem] border border-border bg-card p-6"><p className="text-sm font-semibold">{t("guide.incorrectQuestion")}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{t("guide.incorrectCopy")}</p><Button asChild variant="outline" className="mt-5 w-full rounded-full bg-card"><Link href={`/claim?guide=${item.id}`}>{t("guide.startRequest")}</Link></Button></div></aside>
      </section>
    </PublicShell>
  );
}

export function BlogIndexPage() {
  const { t } = useLanguage();
  usePageMeta(t("blog.metaTitle"), t("blog.metaDescription"));
  const posts = trpc.blog.list.useQuery({});
  return <PublicShell><section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20"><div className="container"><SectionLabel>{t("blog.label")}</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">{t("blog.title")}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#4f5b53]">{t("blog.intro")}</p></div></section><section className="container py-12 sm:py-16"><ContentFallbackNote className="mb-6" />{posts.isLoading ? <div className="grid gap-6"><Skeleton className="h-96 rounded-[2rem]" /><Skeleton className="h-72 rounded-[2rem]" /></div> : posts.error ? <ErrorPanel message={posts.error.message} /> : <div className="grid gap-6">{posts.data?.map((article, index) => <ArticleCard key={article.id} article={article as ArticleSummary} featured={index === 0} />)}</div>}</section></PublicShell>;
}

export function BlogArticlePage() {
  const { language, t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const post = trpc.blog.getBySlug.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  const recordEvent = trpc.operations.recordContentEvent.useMutation();
  const recordedPostId = useRef<number | null>(null);
  usePageMeta(post.data?.seoTitle ?? post.data?.title ?? t("blog.articleFallback"), post.data?.seoDescription ?? post.data?.excerpt ?? t("blog.articleDescriptionFallback"), post.data?.coverImageUrl ?? HERO_IMAGE, "article");

  useEffect(() => {
    if (!post.data || recordedPostId.current === post.data.id) return;
    recordedPostId.current = post.data.id;
    recordEvent.mutate({
      eventType: "blog_view",
      blogPostId: post.data.id,
      pagePath: window.location.pathname,
      referrerPath: document.referrer ? new URL(document.referrer).pathname : undefined,
    });
  }, [post.data, recordEvent]);
  if (post.isLoading) return <PublicShell><div className="container py-20"><Skeleton className="h-[40rem] rounded-[2rem]" /></div></PublicShell>;
  if (post.error || !post.data) return <PublicShell><div className="container py-20"><ErrorPanel message={post.error?.message ?? t("blog.notFound")} /></div></PublicShell>;
  return <PublicShell><article><header className="border-b border-border bg-[#f5eddf] py-12 sm:py-20"><div className="container max-w-5xl"><Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f5b53]"><ArrowLeft className="size-4" /> {t("blog.back")}</Link><div className="mt-9 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#743926]"><span>{language === "zh" ? t(`category.${post.data.category}`) : post.data.category}</span><span className="size-1 rounded-full bg-[#743926]/35" /><span>{t("common.readMinutes", { count: post.data.readingMinutes })}</span></div><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#17382f] sm:text-7xl">{post.data.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-[#4f5b53]">{post.data.excerpt}</p></div></header>{post.data.coverImageUrl && <div className="container max-w-6xl -translate-y-0 pt-8"><img src={post.data.coverImageUrl} alt="" className="max-h-[35rem] w-full rounded-[2rem] object-cover shadow-[0_25px_80px_rgba(44,43,36,.12)]" /></div>}<div className="container grid max-w-6xl gap-12 py-12 lg:grid-cols-[1fr_.36fr] lg:py-16"><div>{language === "zh" && <p className="mb-6 rounded-xl bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">{t("common.contentFallback")}</p>}<div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:tracking-[-0.025em] prose-a:text-primary prose-blockquote:border-primary prose-blockquote:bg-muted/60 prose-blockquote:px-6 prose-blockquote:py-4"><Streamdown>{post.data.bodyMarkdown}</Streamdown></div></div><aside>{post.data.relatedGuides.length > 0 && <div className="rounded-[1.75rem] border border-border bg-card p-5"><p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">{t("blog.profilesMentioned")}</p><div className="mt-5 grid gap-4">{post.data.relatedGuides.map(guide => <Link key={guide.id} href={`/guides/${guide.slug}`} className="group flex items-center gap-3 rounded-xl bg-muted/65 p-3"><InitialAvatar name={guide.displayName} /><div><p className="font-serif text-lg font-semibold">{guide.displayName}</p><p className="mt-1 text-xs text-muted-foreground">{t("common.reviewEvidence")}</p></div><ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>)}</div></div>}<div className="mt-5 rounded-[1.5rem] bg-[#eadcae] p-5 text-[#17382f]"><BadgeCheck className="size-6 text-[#743926]" /><p className="mt-4 font-serif text-xl font-semibold">{t("blog.editorialNote")}</p><p className="mt-2 text-sm leading-6 text-[#435248]">{t("blog.editorialCopy")}</p></div></aside></div></article></PublicShell>;
}

export function AboutPage() {
  const { t } = useLanguage();
  usePageMeta(t("about.metaTitle"), t("about.metaDescription"));
  const steps = [["01", t("about.step1.title"), t("about.step1.copy")], ["02", t("about.step2.title"), t("about.step2.copy")], ["03", t("about.step3.title"), t("about.step3.copy")], ["04", t("about.step4.title"), t("about.step4.copy")]];
  return <PublicShell><section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20"><div className="container grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><SectionLabel>{t("about.label")}</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-7xl">{t("about.title")}</h1></div><p className="text-base leading-8 text-[#4f5b53]">{t("about.intro")}</p></div></section><section className="container py-14 sm:py-20"><div className="grid gap-5 md:grid-cols-2">{steps.map(([number, title, copy]) => <article key={number} className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-8"><span className="font-serif text-4xl font-semibold text-primary/35">{number}</span><h2 className="mt-8 font-serif text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p></article>)}</div><div className="mt-16 grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><SectionLabel>{t("about.rulesLabel")}</SectionLabel><h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.04em]">{t("about.rulesTitle")}</h2></div><div className="grid gap-4">{[[t("about.publish.title"), t("about.publish.copy")], [t("about.notPublish.title"), t("about.notPublish.copy")], [t("about.verify.title"), t("about.verify.copy")], [t("about.optOut.title"), t("about.optOut.copy")]].map(([title, copy]) => <div key={title} className="flex gap-4 rounded-[1.25rem] bg-muted/60 p-5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div></div>)}</div></div><div className="mt-16 rounded-[2rem] bg-[#17382f] p-7 text-[#f7f0df] sm:p-10"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#efb055]">{t("about.accuracyLabel")}</p><h2 className="mt-3 font-serif text-3xl font-semibold">{t("about.correctionTitle")}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">{t("about.correctionCopy")}</p></div><Button asChild className="rounded-full bg-[#f7f0df] text-[#17382f] hover:bg-white"><Link href="/claim">{t("about.openForm")} <ArrowRight className="size-4" /></Link></Button></div></div></section></PublicShell>;
}

export function ClaimPage() {
  const { t } = useLanguage();
  usePageMeta(t("claim.metaTitle"), t("claim.metaDescription"));
  const searchParams = new URLSearchParams(window.location.search);
  const guides = trpc.guides.list.useQuery({ limit: 100, offset: 0 });
  const submit = trpc.operations.submit.useMutation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ guideId: searchParams.get("guide") ?? "", requestType: "claim", requesterName: "", requesterEmail: "", relationship: "", message: "", evidenceUrl: "" });
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await submit.mutateAsync({ guideId: form.guideId ? Number(form.guideId) : null, requestType: form.requestType as "claim" | "correction" | "opt_out" | "removal", requesterName: form.requesterName, requesterEmail: form.requesterEmail, relationship: form.relationship, message: form.message, evidenceUrl: form.evidenceUrl || null });
      setSent(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) { toast.error(error instanceof Error ? error.message : t("claim.submitError")); }
  };
  if (sent) return <PublicShell><section className="container max-w-3xl py-24"><div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check className="size-8" /></div><h1 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em]">{t("claim.successTitle")}</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{t("claim.successCopy")}</p><Button asChild className="mt-7 rounded-full"><Link href="/guides">{t("claim.return")}</Link></Button></div></section></PublicShell>;
  return <PublicShell><section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20"><div className="container max-w-5xl"><SectionLabel>{t("claim.label")}</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">{t("claim.title")}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#4f5b53]">{t("claim.intro")}</p></div></section><section className="container grid max-w-5xl gap-8 py-12 lg:grid-cols-[1fr_.48fr] lg:py-16"><form onSubmit={onSubmit} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="grid gap-5"><label className="grid gap-2 text-sm font-semibold">{t("claim.profile")} <select value={form.guideId} onChange={event => update("guideId", event.target.value)} className="h-12 rounded-xl border border-input bg-background px-3 text-sm font-normal"><option value="">{t("claim.general")}</option>{guides.data?.map(guide => <option key={guide.id} value={guide.id}>{guide.displayName}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold">{t("claim.requestType")} <select value={form.requestType} onChange={event => update("requestType", event.target.value)} className="h-12 rounded-xl border border-input bg-background px-3 text-sm font-normal"><option value="claim">{t("claim.type.claim")}</option><option value="correction">{t("claim.type.correction")}</option><option value="opt_out">{t("claim.type.optOut")}</option><option value="removal">{t("claim.type.removal")}</option></select></label><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">{t("claim.name")} <Input required minLength={2} value={form.requesterName} onChange={event => update("requesterName", event.target.value)} className="h-12 rounded-xl" /></label><label className="grid gap-2 text-sm font-semibold">{t("claim.email")} <Input required type="email" value={form.requesterEmail} onChange={event => update("requesterEmail", event.target.value)} className="h-12 rounded-xl" /></label></div><label className="grid gap-2 text-sm font-semibold">{t("claim.relationship")} <Input required minLength={2} value={form.relationship} onChange={event => update("relationship", event.target.value)} placeholder={t("claim.relationshipPlaceholder")} className="h-12 rounded-xl" /></label><label className="grid gap-2 text-sm font-semibold">{t("claim.reviewQuestion")} <Textarea required minLength={30} value={form.message} onChange={event => update("message", event.target.value)} placeholder={t("claim.reviewPlaceholder")} className="min-h-36 rounded-xl" /></label><label className="grid gap-2 text-sm font-semibold">{t("claim.evidenceUrl")} <span className="font-normal text-muted-foreground">{t("claim.optional")}</span><Input type="url" value={form.evidenceUrl} onChange={event => update("evidenceUrl", event.target.value)} placeholder="https://" className="h-12 rounded-xl" /></label><Button type="submit" size="lg" disabled={submit.isPending} className="mt-2 h-12 rounded-full">{submit.isPending ? t("claim.submitting") : t("claim.submit")}<ArrowRight className="size-4" /></Button></div></form><aside><div className="rounded-[1.5rem] bg-[#17382f] p-6 text-[#f7f0df]"><FileCheck2 className="size-7 text-[#efb055]" /><h2 className="mt-5 font-serif text-2xl font-semibold">{t("claim.nextTitle")}</h2><ol className="mt-5 grid gap-4 text-sm leading-6 text-white/72"><li className="flex gap-3"><span className="font-semibold text-[#efb055]">1.</span>{t("claim.next1")}</li><li className="flex gap-3"><span className="font-semibold text-[#efb055]">2.</span>{t("claim.next2")}</li><li className="flex gap-3"><span className="font-semibold text-[#efb055]">3.</span>{t("claim.next3")}</li></ol></div><p className="mt-5 rounded-[1.25rem] bg-muted p-5 text-xs leading-6 text-muted-foreground">{t("claim.sensitive")}</p></aside></section></PublicShell>;
}
