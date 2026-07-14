import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
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

function Tag({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{children}</span>;
}

function GuideCard({ guide }: { guide: GuideSummary }) {
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
        <InitialAvatar name={guide.displayName} />
        <div className="flex flex-wrap justify-end gap-2">
          {guide.isEditorsPick && <Tag active>Editor reviewed</Tag>}
          {guide.status === "unclaimed" && <Tag>Unclaimed</Tag>}
        </div>
      </div>
      <div className="mt-6 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{guide.city} · {guide.languages}</p>
        <h3 className="mt-2 font-serif text-[1.65rem] font-semibold tracking-[-0.025em] text-card-foreground">{guide.displayName}</h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">{guide.shortBio}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {guide.tags.slice(0, 4).map(tag => <Tag key={tag.id}>{tag.name}</Tag>)}
        </div>
      </div>
      <Link href={`/guides/${guide.slug}`} onClick={recordGuideCardClick} className="mt-6 inline-flex items-center justify-between border-t border-border pt-4 text-sm font-semibold text-foreground">
        Review public evidence <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </article>
  );
}

function ArticleCard({ article, featured = false }: { article: ArticleSummary; featured?: boolean }) {
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
          <span>{article.category}</span><span className="size-1 rounded-full bg-border" /><span>{article.readingMinutes} min read</span>
        </div>
        <h3 className={cn("mt-4 font-serif font-semibold tracking-[-0.03em] text-card-foreground", featured ? "text-3xl" : "text-2xl")}>{article.title}</h3>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">Read the field note <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

function GuideGridSkeleton({ count = 4 }: { count?: number }) {
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: count }).map((_, index) => <Skeleton key={index} className="h-[27rem] rounded-[1.75rem]" />)}</div>;
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-[1.5rem] border border-destructive/25 bg-destructive/5 p-8 text-center">
      <CircleAlert className="mx-auto size-7 text-destructive" />
      <h2 className="mt-4 font-serif text-2xl font-semibold">We could not load this page</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function HomePage() {
  usePageMeta("English-speaking local guides in Chengdu", "Discover English-speaking Chengdu guide profiles compiled from public evidence, plus thoughtful trip-planning notes.");
  const featured = trpc.guides.list.useQuery({ featuredOnly: true, limit: 4, offset: 0 });
  const articles = trpc.blog.list.useQuery({ featuredOnly: true });

  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border bg-[#f5eddf]">
        <div className="container grid min-h-[42rem] items-center gap-10 py-12 lg:grid-cols-[.92fr_1.08fr] lg:py-16">
          <div className="relative z-10 max-w-2xl">
            <SectionLabel>Chengdu, interpreted locally</SectionLabel>
            <h1 className="mt-6 max-w-[12ch] font-serif text-[clamp(3.4rem,7vw,6.9rem)] font-semibold leading-[.91] tracking-[-0.055em] text-[#17382f]">
              Meet the city beyond the map.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#4f5b53] sm:text-lg">
              A curated, English-language directory of potential local guides—built from public evidence, transparent sourcing, and no invented ratings.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-13 rounded-full px-7 text-base">
                <Link href="/guides">Find a Chengdu guide <ArrowRight className="size-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 rounded-full border-[#17382f]/25 bg-white/45 px-7 text-base text-[#17382f]">
                <Link href="/about">See our evidence method</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-[#17382f]/15 pt-6">
              <div><p className="font-serif text-2xl font-semibold text-[#17382f]">5</p><p className="mt-1 text-xs leading-5 text-[#4f5b53]">Initial public-source profiles</p></div>
              <div><p className="font-serif text-2xl font-semibold text-[#17382f]">0</p><p className="mt-1 text-xs leading-5 text-[#4f5b53]">Paid rankings or ratings</p></div>
              <div><p className="font-serif text-2xl font-semibold text-[#17382f]">100%</p><p className="mt-1 text-xs leading-5 text-[#4f5b53]">Source cards on every profile</p></div>
            </div>
          </div>
          <div className="relative lg:pl-5">
            <div className="absolute -left-10 top-12 hidden size-32 rounded-full border border-[#af3926]/20 lg:block" />
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#17382f] shadow-[0_35px_90px_rgba(31,57,49,.25)]">
              <img src={HERO_IMAGE} alt="Illustrated Chengdu streetscape with teahouse details and city skyline" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
              <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/25 bg-[#17382f]/88 p-5 text-white backdrop-blur-md">
                <div className="flex items-start gap-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-[#efb055]" />
                  <div><p className="text-sm font-semibold">Chengdu pilot directory</p><p className="mt-1 text-xs leading-5 text-white/68">Pandas, tea culture, city classics, Sichuan opera, and western Sichuan leads.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div><SectionLabel>Evidence before endorsement</SectionLabel><h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Start with people whose public work matches your day.</h2></div>
          <Button asChild variant="outline" className="w-fit rounded-full bg-card"><Link href="/guides">View all guides <ArrowRight className="size-4" /></Link></Button>
        </div>
        <div className="mt-10">
          {featured.isLoading ? <GuideGridSkeleton /> : featured.error ? <ErrorPanel message={featured.error.message} /> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{featured.data?.map(guide => <GuideCard key={guide.id} guide={guide as GuideSummary} />)}</div>}
        </div>
      </section>

      <section className="bg-[#17382f] py-20 text-[#f7f0df] sm:py-24">
        <div className="container">
          <SectionLabel>Choose by interest</SectionLabel>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.35fr]">
            <h2 className="max-w-xl font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">What kind of Chengdu do you want help understanding?</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Pandas & first visits", "Public evidence around classic city sights", "pandas"],
                ["Tea & everyday life", "Parks, teahouses, and local context", "tea-culture"],
                ["Opera & culture", "Sichuan opera and performance traditions", "sichuan-opera"],
                ["Beyond Chengdu", "Leads connected with western Sichuan routes", "western-sichuan"],
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
          <div><SectionLabel>Field notes</SectionLabel><h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Plan with context, not a crowded checklist.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">Independent English notes for choosing a guide and pacing a first Chengdu trip.</p><Button asChild variant="outline" className="mt-7 rounded-full bg-card"><Link href="/blog">Open the journal <BookOpen className="size-4" /></Link></Button></div>
          <div className="grid gap-5">{articles.isLoading ? <Skeleton className="h-80 rounded-[1.75rem]" /> : articles.data?.slice(0, 2).map((article, index) => <ArticleCard key={article.id} article={article as ArticleSummary} featured={index === 0} />)}</div>
        </div>
      </section>

      <section className="container pb-4">
        <div className="grid gap-6 rounded-[2rem] bg-[#eadcae] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#743926]">Accuracy is collaborative</p><h2 className="mt-3 font-serif text-3xl font-semibold tracking-[-0.03em] text-[#17382f]">Are you a guide shown here?</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[#435248]">Claim your profile, correct public information, or request removal. Every request enters an administrator review queue.</p></div>
          <Button asChild className="h-12 rounded-full px-6"><Link href="/claim">Start a request <ArrowRight className="size-4" /></Link></Button>
        </div>
      </section>
    </PublicShell>
  );
}

export function GuidesDirectoryPage() {
  usePageMeta("Chengdu guide directory", "Browse public-source profiles of potential English-speaking local guides in Chengdu by interest and route.");
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
          <div><SectionLabel>Public-source directory</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">Find a Chengdu guide by evidence and interest.</h1></div>
          <p className="max-w-xl text-sm leading-7 text-[#4f5b53]">Profiles may be unclaimed. We show where each claim came from and when it was reviewed; you verify identity, credentials, price, and availability directly.</p>
        </div>
      </section>
      <section className="container py-10 sm:py-14">
        <div className="rounded-[1.75rem] border border-border bg-card p-4 shadow-sm sm:p-6">
          <div className="relative"><Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search a name, topic, or public bio…" className="h-12 rounded-xl pl-12" aria-label="Search guide profiles" /></div>
          <div className="mt-4 flex items-start gap-3"><Filter className="mt-2 size-4 shrink-0 text-muted-foreground" /><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTag("")} className={cn("rounded-full px-3 py-2 text-xs font-semibold transition-colors", !tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>All interests</button>{tags.data?.map(item => <button key={item.id} type="button" onClick={() => setTag(item.slug)} className={cn("rounded-full px-3 py-2 text-xs font-semibold transition-colors", tag === item.slug ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>{item.name}</button>)}</div></div>
        </div>
        <div className="mt-8 flex items-center justify-between"><p className="text-sm text-muted-foreground">{guides.isLoading ? "Reviewing the directory…" : `${guides.data?.length ?? 0} public profile${guides.data?.length === 1 ? "" : "s"}`}</p>{(search || tag) && <button type="button" onClick={() => { setSearch(""); setTag(""); }} className="text-sm font-semibold text-primary hover:underline">Clear filters</button>}</div>
        <div className="mt-5">{guides.isLoading ? <GuideGridSkeleton count={8} /> : guides.error ? <ErrorPanel message={guides.error.message} /> : guides.data?.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{guides.data.map(guide => <GuideCard key={guide.id} guide={guide as GuideSummary} />)}</div> : <div className="rounded-[2rem] border border-dashed border-border bg-muted/35 px-6 py-20 text-center"><UserRoundSearch className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-5 font-serif text-2xl font-semibold">No public profiles match yet</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Try a broader keyword or clear the current interest filter. The Chengdu pilot begins with a deliberately small evidence-reviewed set.</p></div>}</div>
      </section>
    </PublicShell>
  );
}

function SourcePlatform({ source }: { source: GuideSource }) {
  const labels = { xiaohongshu: "Xiaohongshu", douyin: "Douyin", media: "Independent media", website: "Website" };
  return <span>{labels[source.platform]} · {source.sourceType}</span>;
}

function OffsiteSourceButton({ guide, source }: { guide: GuideSummary; source: GuideSource }) {
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
      toast.error(error instanceof Error ? error.message : "Could not open the public source.");
    }
  };

  return (
    <>
      <Button type="button" variant={source.isPrimary ? "default" : "outline"} className="rounded-full" onClick={() => setOpen(true)}>
        Open source <ExternalLink className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[1.5rem] sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-serif text-2xl">You are leaving LocalMate China</DialogTitle><DialogDescription className="pt-2 leading-6">This opens a public page on {source.platform === "xiaohongshu" ? "Xiaohongshu" : source.platform === "douyin" ? "Douyin" : "another website"}. LocalMate China does not control that page, process bookings, or verify private conversations.</DialogDescription></DialogHeader>
          <div className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground"><strong className="text-foreground">Before arranging anything:</strong> confirm the creator's identity, current availability, credentials where relevant, full price, cancellation terms, and payment method.</div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} className="rounded-full">Stay here</Button><Button onClick={leave} disabled={record.isPending} className="rounded-full">{record.isPending ? "Recording source…" : "Continue to source"}<ArrowUpRight className="size-4" /></Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function GuideDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const guide = trpc.guides.getBySlug.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  usePageMeta(guide.data?.displayName ?? "Guide profile", guide.data?.shortBio ?? "Review a Chengdu guide profile and its public evidence sources.");

  if (guide.isLoading) return <PublicShell><div className="container py-20"><Skeleton className="h-[35rem] rounded-[2rem]" /></div></PublicShell>;
  if (guide.error || !guide.data) return <PublicShell><div className="container py-20"><ErrorPanel message={guide.error?.message ?? "Guide not found"} /></div></PublicShell>;
  const item = guide.data as GuideSummary;

  return (
    <PublicShell>
      <section className="border-b border-border bg-[#f5eddf] py-10 sm:py-16">
        <div className="container">
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f5b53] hover:text-[#17382f]"><ArrowLeft className="size-4" /> Back to all profiles</Link>
          <div className="mt-9 grid gap-8 lg:grid-cols-[auto_1fr_.42fr] lg:items-start">
            <InitialAvatar name={item.displayName} large />
            <div><div className="flex flex-wrap gap-2">{item.isEditorsPick && <Tag active>Editor reviewed</Tag>}<Tag>{item.isClaimed ? "Claimed" : "Unclaimed profile"}</Tag></div><h1 className="mt-5 font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">{item.displayName}</h1><p className="mt-5 max-w-3xl text-base leading-8 text-[#4f5b53]">{item.shortBio}</p><div className="mt-6 flex flex-wrap gap-2">{item.tags.map(tag => <Tag key={tag.id}>{tag.name}</Tag>)}</div></div>
            <div className="rounded-[1.5rem] border border-[#17382f]/12 bg-white/55 p-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#743926]">Profile status</p><dl className="mt-4 grid gap-4 text-sm"><div><dt className="text-[#4f5b53]">Location</dt><dd className="mt-1 font-semibold text-[#17382f]">{item.city}</dd></div><div><dt className="text-[#4f5b53]">Languages reported</dt><dd className="mt-1 font-semibold text-[#17382f]">{item.languages}</dd></div><div><dt className="text-[#4f5b53]">Evidence last reviewed</dt><dd className="mt-1 font-semibold text-[#17382f]">{item.lastVerifiedAt ? new Date(item.lastVerifiedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Review date unavailable"}</dd></div></dl></div>
          </div>
        </div>
      </section>
      <section className="container grid gap-10 py-12 lg:grid-cols-[1fr_.52fr] lg:py-16">
        <div>
          <SectionLabel>What public sources indicate</SectionLabel>
          <div className="mt-5 whitespace-pre-line text-base leading-8 text-foreground/82">{item.longBio}</div>
          <div className="mt-12"><SectionLabel>Source cards</SectionLabel><h2 className="mt-4 font-serif text-3xl font-semibold tracking-[-0.03em]">Review the evidence yourself.</h2><div className="mt-6 grid gap-4">{item.sources.map(source => <article key={source.id} className="rounded-[1.5rem] border border-border bg-card p-5 sm:p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary"><SourcePlatform source={source} /></p><h3 className="mt-3 font-serif text-xl font-semibold">{source.publicTitle ?? "Public evidence source"}</h3>{source.evidenceSummary && <p className="mt-3 text-sm leading-6 text-muted-foreground">{source.evidenceSummary}</p>}<p className="mt-3 text-xs text-muted-foreground">Reviewed {new Date(source.verifiedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</p></div><OffsiteSourceButton guide={item} source={source} /></div></article>)}</div></div>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start"><div className="rounded-[1.75rem] bg-[#17382f] p-6 text-[#f7f0df] sm:p-7"><ShieldCheck className="size-7 text-[#efb055]" /><h2 className="mt-5 font-serif text-2xl font-semibold">Verify before you arrange</h2><ul className="mt-5 grid gap-4 text-sm leading-6 text-white/72">{["Confirm the account belongs to the person shown.", "Ask about current credentials and service scope.", "Agree on route, price, inclusions, cancellation, and payment in writing.", "Do not send sensitive documents through an unverified channel."].map(text => <li key={text} className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-[#efb055]" />{text}</li>)}</ul></div><div className="mt-5 rounded-[1.5rem] border border-border bg-card p-6"><p className="text-sm font-semibold">Is this you, or is something incorrect?</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Claim this profile, send a correction, opt out, or request removal.</p><Button asChild variant="outline" className="mt-5 w-full rounded-full bg-card"><Link href={`/claim?guide=${item.id}`}>Start a request</Link></Button></div></aside>
      </section>
    </PublicShell>
  );
}

export function BlogIndexPage() {
  usePageMeta("Chengdu journal", "English trip-planning field notes for choosing a local guide and understanding Chengdu at a more thoughtful pace.");
  const posts = trpc.blog.list.useQuery({});
  return <PublicShell><section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20"><div className="container"><SectionLabel>LocalMate field notes</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">A quieter, more useful way to plan Chengdu.</h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#4f5b53]">Independent English notes on pacing a first visit, reading public guide evidence, and choosing by interest instead of popularity.</p></div></section><section className="container py-12 sm:py-16">{posts.isLoading ? <div className="grid gap-6"><Skeleton className="h-96 rounded-[2rem]" /><Skeleton className="h-72 rounded-[2rem]" /></div> : posts.error ? <ErrorPanel message={posts.error.message} /> : <div className="grid gap-6">{posts.data?.map((article, index) => <ArticleCard key={article.id} article={article as ArticleSummary} featured={index === 0} />)}</div>}</section></PublicShell>;
}

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const post = trpc.blog.getBySlug.useQuery({ slug: slug ?? "" }, { enabled: Boolean(slug) });
  const recordEvent = trpc.operations.recordContentEvent.useMutation();
  const recordedPostId = useRef<number | null>(null);
  usePageMeta(post.data?.seoTitle ?? post.data?.title ?? "Chengdu journal", post.data?.seoDescription ?? post.data?.excerpt ?? "A LocalMate China field note.", post.data?.coverImageUrl ?? HERO_IMAGE, "article");

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
  if (post.error || !post.data) return <PublicShell><div className="container py-20"><ErrorPanel message={post.error?.message ?? "Article not found"} /></div></PublicShell>;
  return <PublicShell><article><header className="border-b border-border bg-[#f5eddf] py-12 sm:py-20"><div className="container max-w-5xl"><Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4f5b53]"><ArrowLeft className="size-4" /> Back to the journal</Link><div className="mt-9 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#743926]"><span>{post.data.category}</span><span className="size-1 rounded-full bg-[#743926]/35" /><span>{post.data.readingMinutes} min read</span></div><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.05em] text-[#17382f] sm:text-7xl">{post.data.title}</h1><p className="mt-7 max-w-3xl text-lg leading-8 text-[#4f5b53]">{post.data.excerpt}</p></div></header>{post.data.coverImageUrl && <div className="container max-w-6xl -translate-y-0 pt-8"><img src={post.data.coverImageUrl} alt="" className="max-h-[35rem] w-full rounded-[2rem] object-cover shadow-[0_25px_80px_rgba(44,43,36,.12)]" /></div>}<div className="container grid max-w-6xl gap-12 py-12 lg:grid-cols-[1fr_.36fr] lg:py-16"><div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:tracking-[-0.025em] prose-a:text-primary prose-blockquote:border-primary prose-blockquote:bg-muted/60 prose-blockquote:px-6 prose-blockquote:py-4"><Streamdown>{post.data.bodyMarkdown}</Streamdown></div><aside>{post.data.relatedGuides.length > 0 && <div className="rounded-[1.75rem] border border-border bg-card p-5"><p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">Profiles mentioned</p><div className="mt-5 grid gap-4">{post.data.relatedGuides.map(guide => <Link key={guide.id} href={`/guides/${guide.slug}`} className="group flex items-center gap-3 rounded-xl bg-muted/65 p-3"><InitialAvatar name={guide.displayName} /><div><p className="font-serif text-lg font-semibold">{guide.displayName}</p><p className="mt-1 text-xs text-muted-foreground">Review public evidence</p></div><ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>)}</div></div>}<div className="mt-5 rounded-[1.5rem] bg-[#eadcae] p-5 text-[#17382f]"><BadgeCheck className="size-6 text-[#743926]" /><p className="mt-4 font-serif text-xl font-semibold">Editorial note</p><p className="mt-2 text-sm leading-6 text-[#435248]">LocalMate China does not receive payment for rankings and does not publish fabricated ratings or testimonials.</p></div></aside></div></article></PublicShell>;
}

export function AboutPage() {
  usePageMeta("About our methodology", "See how LocalMate China finds, reviews, labels, corrects, and removes public-source guide profiles.");
  const steps = [["01", "Find public evidence", "We look for direct public posts, profiles, or named independent media coverage connecting a person with English-language guiding."], ["02", "Attribute carefully", "A confirmed profile is different from a platform search result. We state that difference instead of filling gaps with assumptions."], ["03", "Publish source cards", "Each profile explains what a source supports, its platform, source type, and the date it was last reviewed."], ["04", "Invite correction", "Guides and readers can submit evidence, corrections, opt-out requests, or removal requests for administrator review."]];
  return <PublicShell><section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20"><div className="container grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end"><div><SectionLabel>About & methodology</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-7xl">Useful discovery without pretending certainty.</h1></div><p className="text-base leading-8 text-[#4f5b53]">LocalMate China is an independent editorial directory—not a booking agent, guide employer, credential issuer, or review platform.</p></div></section><section className="container py-14 sm:py-20"><div className="grid gap-5 md:grid-cols-2">{steps.map(([number, title, copy]) => <article key={number} className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-8"><span className="font-serif text-4xl font-semibold text-primary/35">{number}</span><h2 className="mt-8 font-serif text-2xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{copy}</p></article>)}</div><div className="mt-16 grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><SectionLabel>Our publication rules</SectionLabel><h2 className="mt-4 font-serif text-4xl font-semibold tracking-[-0.04em]">What we will—and will not—claim.</h2></div><div className="grid gap-4">{[["We publish", "Public professional context, source links, evidence summaries, review dates, neutral interest tags, and clearly labeled editorial notes."], ["We do not publish", "Invented reviews or star ratings, copied private contact details, unverified personal claims, promises of current availability, or hidden paid rankings."], ["Travelers still verify", "Identity, current credentials where relevant, service scope, itinerary, price, inclusions, cancellation, insurance, and payment arrangements."], ["People can opt out", "A guide, authorized representative, or reader with evidence can request correction or removal through the public form."]].map(([title, copy]) => <div key={title} className="flex gap-4 rounded-[1.25rem] bg-muted/60 p-5"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" /><div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div></div>)}</div></div><div className="mt-16 rounded-[2rem] bg-[#17382f] p-7 text-[#f7f0df] sm:p-10"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#efb055]">Keep the record accurate</p><h2 className="mt-3 font-serif text-3xl font-semibold">Send a correction with evidence.</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">Requests are stored for administrator review. Submitting a claim does not automatically publish changes or establish identity.</p></div><Button asChild className="rounded-full bg-[#f7f0df] text-[#17382f] hover:bg-white"><Link href="/claim">Open request form <ArrowRight className="size-4" /></Link></Button></div></div></section></PublicShell>;
}

export function ClaimPage() {
  usePageMeta("Claim, correct, or remove a profile", "Submit a guide profile claim, correction, opt-out, or removal request for administrator review.");
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
    } catch (error) { toast.error(error instanceof Error ? error.message : "We could not submit your request."); }
  };
  if (sent) return <PublicShell><section className="container max-w-3xl py-24"><div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm sm:p-12"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-800"><Check className="size-8" /></div><h1 className="mt-6 font-serif text-4xl font-semibold tracking-[-0.04em]">Your request is in the review queue.</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">An administrator can review the evidence and update the request status. Submission does not automatically change or claim a public profile.</p><Button asChild className="mt-7 rounded-full"><Link href="/guides">Return to the directory</Link></Button></div></section></PublicShell>;
  return <PublicShell><section className="border-b border-border bg-[#f5eddf] py-14 sm:py-20"><div className="container max-w-5xl"><SectionLabel>Profile stewardship</SectionLabel><h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold tracking-[-0.05em] text-[#17382f] sm:text-6xl">Claim, correct, opt out, or request removal.</h1><p className="mt-6 max-w-2xl text-base leading-8 text-[#4f5b53]">Tell us your relationship to the profile and provide enough public evidence for an administrator to review the request.</p></div></section><section className="container grid max-w-5xl gap-8 py-12 lg:grid-cols-[1fr_.48fr] lg:py-16"><form onSubmit={onSubmit} className="rounded-[1.75rem] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="grid gap-5"><label className="grid gap-2 text-sm font-semibold">Profile <select value={form.guideId} onChange={event => update("guideId", event.target.value)} className="h-12 rounded-xl border border-input bg-background px-3 text-sm font-normal"><option value="">General request / profile not listed</option>{guides.data?.map(guide => <option key={guide.id} value={guide.id}>{guide.displayName}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold">Request type <select value={form.requestType} onChange={event => update("requestType", event.target.value)} className="h-12 rounded-xl border border-input bg-background px-3 text-sm font-normal"><option value="claim">Claim this profile</option><option value="correction">Correct information</option><option value="opt_out">Opt out of the directory</option><option value="removal">Request removal</option></select></label><div className="grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-semibold">Your name <Input required minLength={2} value={form.requesterName} onChange={event => update("requesterName", event.target.value)} className="h-12 rounded-xl" /></label><label className="grid gap-2 text-sm font-semibold">Email <Input required type="email" value={form.requesterEmail} onChange={event => update("requesterEmail", event.target.value)} className="h-12 rounded-xl" /></label></div><label className="grid gap-2 text-sm font-semibold">Relationship to the profile <Input required minLength={2} value={form.relationship} onChange={event => update("relationship", event.target.value)} placeholder="Example: I am the guide shown" className="h-12 rounded-xl" /></label><label className="grid gap-2 text-sm font-semibold">What should we review? <Textarea required minLength={30} value={form.message} onChange={event => update("message", event.target.value)} placeholder="Describe the change and how we can verify it (at least 30 characters)." className="min-h-36 rounded-xl" /></label><label className="grid gap-2 text-sm font-semibold">Public evidence URL <span className="font-normal text-muted-foreground">Optional</span><Input type="url" value={form.evidenceUrl} onChange={event => update("evidenceUrl", event.target.value)} placeholder="https://" className="h-12 rounded-xl" /></label><Button type="submit" size="lg" disabled={submit.isPending} className="mt-2 h-12 rounded-full">{submit.isPending ? "Submitting for review…" : "Submit request"}<ArrowRight className="size-4" /></Button></div></form><aside><div className="rounded-[1.5rem] bg-[#17382f] p-6 text-[#f7f0df]"><FileCheck2 className="size-7 text-[#efb055]" /><h2 className="mt-5 font-serif text-2xl font-semibold">What happens next</h2><ol className="mt-5 grid gap-4 text-sm leading-6 text-white/72"><li className="flex gap-3"><span className="font-semibold text-[#efb055]">1.</span>Your request is stored as pending.</li><li className="flex gap-3"><span className="font-semibold text-[#efb055]">2.</span>An administrator reviews your message and evidence.</li><li className="flex gap-3"><span className="font-semibold text-[#efb055]">3.</span>The profile may be corrected, claimed after verification, or removed.</li></ol></div><p className="mt-5 rounded-[1.25rem] bg-muted p-5 text-xs leading-6 text-muted-foreground">Do not submit identity documents, payment details, private messages, or other sensitive information through this form.</p></aside></section></PublicShell>;
}
