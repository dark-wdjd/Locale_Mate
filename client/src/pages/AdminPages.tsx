import { Fragment, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  ExternalLink,
  FileCheck2,
  MapPinned,
  Pencil,
  Plus,
  Tags,
  Trash2,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

function AdminPage({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-[#ad422f]">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-.03em] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon }: { label: string; value: number | string; note: string; icon: typeof BarChart3 }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">{label}</p><p className="mt-3 font-serif text-4xl font-semibold tracking-[-.04em]">{value}</p><p className="mt-2 text-xs text-muted-foreground">{note}</p></div>
          <span className="grid size-10 place-items-center rounded-2xl bg-[#e9ddc8] text-primary"><Icon className="size-5" /></span>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-36 rounded-2xl" />)}</div>;
}

function AnalyticsError({ retry }: { retry: () => void }) {
  return <Card className="border-[#ad422f]/20 bg-[#fff8f4] shadow-sm"><CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#ad422f]/10 text-[#ad422f]"><CircleAlert className="size-5" /></span><div className="flex-1"><p className="font-semibold">统计数据暂时无法加载 / Analytics unavailable</p><p className="mt-1 text-sm leading-6 text-muted-foreground">请稍后重试。其他内容管理功能仍可正常使用。</p></div><Button variant="outline" className="rounded-full bg-card" onClick={retry}>重新加载 / Retry</Button></CardContent></Card>;
}

export function AdminOverviewPage() {
  const analytics = trpc.operations.analytics.useQuery();
  const links = [
    { href: "/admin/guides", icon: MapPinned, label: "管理导游", sub: "Guides & source evidence" },
    { href: "/admin/articles", icon: BookOpenText, label: "编辑文章", sub: "Articles & publishing" },
    { href: "/admin/requests", icon: FileCheck2, label: "处理申请", sub: "Claims & corrections" },
  ];
  return <AdminPage><PageHeader eyebrow="运营概览 · Operations" title="LocalMate China 内容后台" description="管理公开来源导游资料、成都英文文章、纠错申请与匿名离站点击。所有公开内容均应保持可审计、可纠错。" action={<Button asChild variant="outline" className="rounded-full bg-card"><a href="/" target="_blank" rel="noreferrer">查看网站 <ExternalLink className="size-4" /></a></Button>} />
    {analytics.isLoading ? <LoadingGrid /> : analytics.isError ? <AnalyticsError retry={() => void analytics.refetch()} /> : analytics.data ? <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="公开导游 / Guides" value={analytics.data.totals.guides} note="Active or unclaimed" icon={UsersRound} />
      <MetricCard label="已发布 / Articles" value={analytics.data.totals.publishedPosts} note="Published field notes" icon={BookOpenText} />
      <MetricCard label="待处理 / Requests" value={analytics.data.totals.pendingRequests} note="Pending review" icon={Clock3} />
      <MetricCard label="离站点击 / Clicks" value={analytics.data.totals.outboundClicks} note="Anonymous aggregate" icon={BarChart3} />
    </div><div className="mt-4 grid gap-4 sm:grid-cols-3">
      <MetricCard label="文章访问 / Article views" value={analytics.data.totals.blogViews} note="Anonymous content entry" icon={BookOpenText} />
      <MetricCard label="导游卡片 / Guide cards" value={analytics.data.totals.guideCardClicks} note="Directory intent signal" icon={UsersRound} />
      <MetricCard label="公开来源 / Source exits" value={analytics.data.totals.outboundClicks} note="Evidence-source visit" icon={BarChart3} />
    </div></> : <AnalyticsError retry={() => void analytics.refetch()} />}
    <div className="mt-8 grid gap-4 lg:grid-cols-3">{links.map(item => <Link key={item.href} href={item.href} className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><item.icon className="size-6 text-primary" /><p className="mt-5 font-semibold">{item.label}</p><p className="mt-1 text-sm text-muted-foreground">{item.sub}</p><ArrowRight className="mt-5 size-4 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>)}</div>
    <Card className="mt-8 border-[#c89d55]/35 bg-[#fff8e9]"><CardContent className="flex gap-4 p-5"><CircleAlert className="mt-0.5 size-5 shrink-0 text-[#ad6d20]" /><div><p className="font-semibold">编辑原则 / Editorial guardrail</p><p className="mt-1 text-sm leading-6 text-muted-foreground">不要添加星级、评论或无法公开核验的私人信息。更新导游资料时，请同时维护来源说明与最近核验日期。</p></div></CardContent></Card>
  </AdminPage>;
}

type GuideEditor = {
  id?: number; slug: string; displayName: string; shortBio: string; longBio: string; city: string; languages: string; status: "active" | "unclaimed" | "removed"; isClaimed: boolean; isFeatured: boolean; isEditorsPick: boolean; avatarUrl: string; tagIds: number[];
};
const emptyGuide: GuideEditor = { slug: "", displayName: "", shortBio: "", longBio: "", city: "Chengdu", languages: "English, Chinese", status: "unclaimed", isClaimed: false, isFeatured: false, isEditorsPick: false, avatarUrl: "", tagIds: [] };

export function AdminGuidesPage() {
  const utils = trpc.useUtils();
  const guides = trpc.guides.adminList.useQuery();
  const tagsQuery = trpc.guides.tags.useQuery();
  const [editor, setEditor] = useState<GuideEditor | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sourceEditor, setSourceEditor] = useState<{ guideId: number; source?: any } | null>(null);
  const saveCreate = trpc.guides.adminCreate.useMutation({ onSuccess: async () => { toast.success("导游已创建"); setEditor(null); await utils.guides.adminList.invalidate(); } });
  const saveUpdate = trpc.guides.adminUpdate.useMutation({ onSuccess: async () => { toast.success("导游已更新"); setEditor(null); await utils.guides.adminList.invalidate(); } });
  const removeGuide = trpc.guides.adminRemove.useMutation({ onSuccess: async () => { toast.success("导游已设为 removed"); await utils.guides.adminList.invalidate(); } });
  const addSource = trpc.guides.adminCreateSource.useMutation({ onSuccess: async () => { toast.success("公开来源已添加"); setSourceEditor(null); await utils.guides.adminList.invalidate(); } });
  const updateSource = trpc.guides.adminUpdateSource.useMutation({ onSuccess: async () => { toast.success("公开来源已更新"); setSourceEditor(null); await utils.guides.adminList.invalidate(); } });
  const deleteSource = trpc.guides.adminDeleteSource.useMutation({ onSuccess: async () => { toast.success("来源已删除"); await utils.guides.adminList.invalidate(); } });

  const openEdit = (item: any) => setEditor({ id: item.id, slug: item.slug, displayName: item.displayName, shortBio: item.shortBio, longBio: item.longBio ?? "", city: item.city, languages: item.languages, status: item.status, isClaimed: item.isClaimed, isFeatured: item.isFeatured, isEditorsPick: item.isEditorsPick, avatarUrl: item.avatarUrl ?? "", tagIds: item.tags?.map((tag: any) => tag.id) ?? [] });
  const submitGuide = (event: FormEvent) => {
    event.preventDefault(); if (!editor) return;
    const values = { ...editor, avatarUrl: editor.avatarUrl || null, longBio: editor.longBio || null, lastVerifiedAt: new Date() };
    if (editor.id) saveUpdate.mutate({ ...values, id: editor.id }); else { const { id: _id, ...createValues } = values; saveCreate.mutate(createValues); }
  };

  return <AdminPage><PageHeader eyebrow="内容库 · Directory" title="导游与公开来源 / Guides" description="维护导游展示资料、收录状态、主题标签与每一条可追溯的公开来源。" action={<Button className="rounded-full" onClick={() => setEditor({ ...emptyGuide })}><Plus className="size-4" /> 新增导游 / Add</Button>} />
    <Card className="overflow-hidden border-0 shadow-sm"><Table><TableHeader><TableRow><TableHead>导游 / Guide</TableHead><TableHead>状态</TableHead><TableHead>标签</TableHead><TableHead>来源</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>
      {guides.isLoading && <TableRow><TableCell colSpan={5}><Skeleton className="h-24 w-full" /></TableCell></TableRow>}
      {guides.data?.map((guide: any) => <Fragment key={guide.id}>
        <TableRow><TableCell><div className="font-semibold">{guide.displayName}</div><div className="mt-1 max-w-md truncate text-xs text-muted-foreground">/{guide.slug} · {guide.languages}</div></TableCell><TableCell><Badge variant={guide.status === "removed" ? "destructive" : "secondary"}>{guide.status}</Badge></TableCell><TableCell><div className="flex max-w-xs flex-wrap gap-1">{guide.tags?.slice(0, 3).map((tag: any) => <Badge key={tag.id} variant="outline">{tag.name}</Badge>)}</div></TableCell><TableCell>{guide.sources?.length ?? 0}</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" aria-label="Edit guide" onClick={() => openEdit(guide)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label="Manage sources" onClick={() => setExpandedId(expandedId === guide.id ? null : guide.id)}>{expandedId === guide.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}</Button><Button size="icon" variant="ghost" className="text-destructive" aria-label="Remove guide" onClick={() => removeGuide.mutate({ id: guide.id })}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>
        {expandedId === guide.id && <TableRow key={`${guide.id}-sources`}><TableCell colSpan={5} className="bg-muted/45"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold">公开来源 / Public evidence</p><p className="text-xs text-muted-foreground">只添加可公开访问且与职业身份直接相关的链接。</p></div><Button size="sm" variant="outline" className="bg-card" onClick={() => setSourceEditor({ guideId: guide.id })}><Plus className="size-4" /> 添加来源</Button></div><div className="mt-4 grid gap-2">{guide.sources?.length ? guide.sources.map((source: any) => <div key={source.id} className="flex items-center gap-3 rounded-xl border bg-card p-3"><Badge variant="outline">{source.platform}</Badge><a className="min-w-0 flex-1 truncate text-sm font-medium hover:underline" href={source.url} target="_blank" rel="noreferrer">{source.publicTitle || source.url}</a><span className="hidden text-xs text-muted-foreground md:block">{new Date(source.verifiedAt).toLocaleDateString()}</span><Button size="icon" variant="ghost" aria-label="Edit source" onClick={() => setSourceEditor({ guideId: guide.id, source })}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" aria-label="Delete source" onClick={() => deleteSource.mutate({ id: source.id })}><Trash2 className="size-4" /></Button></div>) : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">尚未添加来源。</p>}</div></TableCell></TableRow>}
      </Fragment>)}
    </TableBody></Table></Card>

    <Dialog open={Boolean(editor)} onOpenChange={open => !open && setEditor(null)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{editor?.id ? "编辑导游 / Edit guide" : "新增导游 / Add guide"}</DialogTitle><DialogDescription>公开页面不会展示评分或虚构评价。</DialogDescription></DialogHeader>{editor && <form className="grid gap-5" onSubmit={submitGuide}><div className="grid gap-4 sm:grid-cols-2"><Field label="展示名称 / Display name"><Input required value={editor.displayName} onChange={e => setEditor({ ...editor, displayName: e.target.value })} /></Field><Field label="Slug"><Input required pattern="[a-z0-9-]+" value={editor.slug} onChange={e => setEditor({ ...editor, slug: e.target.value })} /></Field></div><Field label="短简介 / Short bio"><Textarea required minLength={20} value={editor.shortBio} onChange={e => setEditor({ ...editor, shortBio: e.target.value })} /></Field><Field label="详细介绍 / Long bio"><Textarea rows={7} value={editor.longBio} onChange={e => setEditor({ ...editor, longBio: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="语言 / Languages"><Input required value={editor.languages} onChange={e => setEditor({ ...editor, languages: e.target.value })} /></Field><Field label="状态 / Status"><Select value={editor.status} onValueChange={(value: GuideEditor["status"]) => setEditor({ ...editor, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unclaimed">unclaimed</SelectItem><SelectItem value="active">active</SelectItem><SelectItem value="removed">removed</SelectItem></SelectContent></Select></Field></div><Field label="头像 URL / Avatar URL"><Input type="url" value={editor.avatarUrl} onChange={e => setEditor({ ...editor, avatarUrl: e.target.value })} placeholder="Optional" /></Field><Field label="主题标签 / Tags"><div className="flex flex-wrap gap-2">{tagsQuery.data?.map(tag => <label key={tag.id} className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs"><input type="checkbox" checked={editor.tagIds.includes(tag.id)} onChange={event => setEditor({ ...editor, tagIds: event.target.checked ? [...editor.tagIds, tag.id] : editor.tagIds.filter(id => id !== tag.id) })} /> {tag.name}</label>)}</div></Field><div className="grid gap-2 sm:grid-cols-3">{([ ["isFeatured", "首页精选"], ["isEditorsPick", "编辑推荐"], ["isClaimed", "已认领"] ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={editor[key]} onChange={event => setEditor({ ...editor, [key]: event.target.checked })} /> {label}</label>)}</div><Button disabled={saveCreate.isPending || saveUpdate.isPending} className="rounded-full">保存 / Save</Button></form>}</DialogContent></Dialog>

    <SourceDialog key={sourceEditor?.source?.id ?? sourceEditor?.guideId ?? "closed"} editor={sourceEditor} onClose={() => setSourceEditor(null)} onSubmit={values => sourceEditor?.source ? updateSource.mutate({ ...values, id: sourceEditor.source.id }) : addSource.mutate(values)} pending={addSource.isPending || updateSource.isPending} />
  </AdminPage>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <div className="grid gap-2"><Label>{label}</Label>{children}</div>; }

function SourceDialog({ editor, onClose, onSubmit, pending }: { editor: { guideId: number; source?: any } | null; onClose: () => void; onSubmit: (values: any) => void; pending: boolean }) {
  const source = editor?.source;
  const [platform, setPlatform] = useState<"xiaohongshu" | "douyin" | "media" | "website">(source?.platform ?? "xiaohongshu");
  const [sourceType, setSourceType] = useState<"profile" | "post" | "article" | "search">(source?.sourceType ?? "profile");
  return <Dialog open={editor !== null} onOpenChange={open => !open && onClose()}><DialogContent><DialogHeader><DialogTitle>{source ? "编辑公开来源 / Edit source" : "添加公开来源 / Add source"}</DialogTitle><DialogDescription>记录链接、公开标题、证据说明和核验日期。</DialogDescription></DialogHeader>{editor && <form className="grid gap-4" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); onSubmit({ guideId: editor.guideId, platform, sourceType, url: String(form.get("url")), publicTitle: String(form.get("title")) || null, evidenceSummary: String(form.get("summary")) || null, isPrimary: form.get("primary") === "on", verifiedAt: new Date() }); }}><div className="grid gap-4 sm:grid-cols-2"><Field label="平台 / Platform"><Select value={platform} onValueChange={(value: typeof platform) => setPlatform(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="xiaohongshu">xiaohongshu</SelectItem><SelectItem value="douyin">douyin</SelectItem><SelectItem value="media">media</SelectItem><SelectItem value="website">website</SelectItem></SelectContent></Select></Field><Field label="类型 / Type"><Select value={sourceType} onValueChange={(value: typeof sourceType) => setSourceType(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="profile">profile</SelectItem><SelectItem value="post">post</SelectItem><SelectItem value="article">article</SelectItem><SelectItem value="search">search</SelectItem></SelectContent></Select></Field></div><Field label="公开链接 / URL"><Input required type="url" name="url" defaultValue={source?.url ?? ""} /></Field><Field label="公开标题 / Public title"><Input name="title" defaultValue={source?.publicTitle ?? ""} /></Field><Field label="证据摘要 / Evidence"><Textarea name="summary" defaultValue={source?.evidenceSummary ?? ""} /></Field><label className="flex items-center gap-2 text-sm"><input name="primary" type="checkbox" defaultChecked={source?.isPrimary ?? false} /> 设为主要来源 / Primary</label><Button disabled={pending} className="rounded-full">{source ? "保存 / Save source" : "添加 / Add source"}</Button></form>}</DialogContent></Dialog>;
}

type ArticleEditor = { id?: number; slug: string; title: string; excerpt: string; bodyMarkdown: string; coverImageUrl: string; category: string; seoTitle: string; seoDescription: string; status: "draft" | "published" | "archived"; isFeatured: boolean; sortOrder: number; readingMinutes: number; publishedAt: Date | null; guideIds: number[] };
const emptyArticle: ArticleEditor = { slug: "", title: "", excerpt: "", bodyMarkdown: "", coverImageUrl: "", category: "Planning", seoTitle: "", seoDescription: "", status: "draft", isFeatured: false, sortOrder: 0, readingMinutes: 5, publishedAt: null, guideIds: [] };

export function AdminArticlesPage() {
  const utils = trpc.useUtils();
  const articles = trpc.blog.adminList.useQuery();
  const guidesQuery = trpc.guides.adminList.useQuery();
  const [editor, setEditor] = useState<ArticleEditor | null>(null);
  const create = trpc.blog.adminCreate.useMutation({ onSuccess: async () => { toast.success("文章已创建"); setEditor(null); await utils.blog.adminList.invalidate(); } });
  const update = trpc.blog.adminUpdate.useMutation({ onSuccess: async () => { toast.success("文章已更新"); setEditor(null); await utils.blog.adminList.invalidate(); } });
  const remove = trpc.blog.adminDelete.useMutation({ onSuccess: async () => { toast.success("文章已删除"); await utils.blog.adminList.invalidate(); } });
  const openEdit = (post: any) => setEditor({ id: post.id, slug: post.slug, title: post.title, excerpt: post.excerpt, bodyMarkdown: post.bodyMarkdown, coverImageUrl: post.coverImageUrl ?? "", category: post.category, seoTitle: post.seoTitle ?? "", seoDescription: post.seoDescription ?? "", status: post.status, isFeatured: post.isFeatured, sortOrder: post.sortOrder, readingMinutes: post.readingMinutes, publishedAt: post.publishedAt, guideIds: post.guideIds ?? [] });
  const submit = (event: FormEvent) => { event.preventDefault(); if (!editor) return; const values = { ...editor, coverImageUrl: editor.coverImageUrl || null, seoTitle: editor.seoTitle || null, seoDescription: editor.seoDescription || null, publishedAt: editor.status === "published" ? editor.publishedAt ?? new Date() : null }; if (editor.id) update.mutate({ ...values, id: editor.id }); else { const { id: _id, ...rest } = values; create.mutate(rest); } };
  return <AdminPage><PageHeader eyebrow="编辑出版 · Editorial" title="文章 / Articles" description="编辑成都英文旅行文章，维护封面、摘要、Markdown 正文和搜索摘要。" action={<Button className="rounded-full" onClick={() => setEditor({ ...emptyArticle })}><Plus className="size-4" /> 新增文章 / New</Button>} />
    <Card className="overflow-hidden border-0 shadow-sm"><Table><TableHeader><TableRow><TableHead>标题 / Title</TableHead><TableHead>分类</TableHead><TableHead>状态</TableHead><TableHead>阅读</TableHead><TableHead className="text-right">操作</TableHead></TableRow></TableHeader><TableBody>{articles.isLoading && <TableRow><TableCell colSpan={5}><Skeleton className="h-24" /></TableCell></TableRow>}{articles.data?.map(post => <TableRow key={post.id}><TableCell><div className="max-w-lg font-semibold">{post.title}</div><div className="mt-1 text-xs text-muted-foreground">/{post.slug}</div></TableCell><TableCell>{post.category}</TableCell><TableCell><Badge variant={post.status === "published" ? "secondary" : "outline"}>{post.status}</Badge></TableCell><TableCell>{post.readingMinutes} min</TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(post)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate({ id: post.id })}><Trash2 className="size-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table></Card>
    <Dialog open={Boolean(editor)} onOpenChange={open => !open && setEditor(null)}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>{editor?.id ? "编辑文章 / Edit article" : "新增文章 / New article"}</DialogTitle><DialogDescription>正文使用 Markdown；发布前请确认公开事实与来源边界。</DialogDescription></DialogHeader>{editor && <form className="grid gap-5" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><Field label="英文标题 / Title"><Input required minLength={8} value={editor.title} onChange={e => setEditor({ ...editor, title: e.target.value })} /></Field><Field label="Slug"><Input required pattern="[a-z0-9-]+" value={editor.slug} onChange={e => setEditor({ ...editor, slug: e.target.value })} /></Field></div><Field label="摘要 / Excerpt"><Textarea required minLength={20} value={editor.excerpt} onChange={e => setEditor({ ...editor, excerpt: e.target.value })} /></Field><Field label="Markdown 正文 / Body"><Textarea className="min-h-[320px] font-mono text-sm" required minLength={100} value={editor.bodyMarkdown} onChange={e => setEditor({ ...editor, bodyMarkdown: e.target.value })} /></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="分类 / Category"><Input required value={editor.category} onChange={e => setEditor({ ...editor, category: e.target.value })} /></Field><Field label="封面 URL / Cover"><Input type="url" value={editor.coverImageUrl} onChange={e => setEditor({ ...editor, coverImageUrl: e.target.value })} /></Field></div><div className="grid gap-4 sm:grid-cols-4"><Field label="状态 / Status"><Select value={editor.status} onValueChange={(value: ArticleEditor["status"]) => setEditor({ ...editor, status: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">draft</SelectItem><SelectItem value="published">published</SelectItem><SelectItem value="archived">archived</SelectItem></SelectContent></Select></Field><Field label="阅读分钟 / Minutes"><Input type="number" min={1} max={90} value={editor.readingMinutes} onChange={e => setEditor({ ...editor, readingMinutes: Number(e.target.value) })} /></Field><Field label="Journal 排序 / Order"><Input type="number" min={-1000} max={10000} value={editor.sortOrder} onChange={e => setEditor({ ...editor, sortOrder: Number(e.target.value) })} /></Field><label className="mt-6 flex items-center gap-2 rounded-xl border p-3 text-sm"><input type="checkbox" checked={editor.isFeatured} onChange={e => setEditor({ ...editor, isFeatured: e.target.checked })} /> 首页精选 / Featured</label></div><Field label="关联导游 / Related guides"><div className="flex flex-wrap gap-2">{guidesQuery.data?.filter(guide => guide.status !== "removed").map(guide => <label key={guide.id} className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-xs"><input type="checkbox" checked={editor.guideIds.includes(guide.id)} onChange={event => setEditor({ ...editor, guideIds: event.target.checked ? [...editor.guideIds, guide.id] : editor.guideIds.filter(id => id !== guide.id) })} /> {guide.displayName}</label>)}</div></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="SEO 标题"><Input value={editor.seoTitle} onChange={e => setEditor({ ...editor, seoTitle: e.target.value })} /></Field><Field label="SEO 描述"><Textarea value={editor.seoDescription} onChange={e => setEditor({ ...editor, seoDescription: e.target.value })} /></Field></div><Button disabled={create.isPending || update.isPending} className="rounded-full">保存文章 / Save</Button></form>}</DialogContent></Dialog>
  </AdminPage>;
}

export function AdminTagsPage() {
  const utils = trpc.useUtils();
  const tagsQuery = trpc.guides.tags.useQuery();
  const [category, setCategory] = useState<"language" | "interest" | "audience" | "route" | "style">("interest");
  const [editingTag, setEditingTag] = useState<any | null>(null);
  const create = trpc.guides.adminCreateTag.useMutation({ onSuccess: async () => { toast.success("标签已创建"); await utils.guides.tags.invalidate(); } });
  const update = trpc.guides.adminUpdateTag.useMutation({ onSuccess: async () => { toast.success("标签已更新"); setEditingTag(null); await utils.guides.tags.invalidate(); } });
  const remove = trpc.guides.adminDeleteTag.useMutation({ onSuccess: async () => { toast.success("标签已删除"); await utils.guides.tags.invalidate(); } });
  return <AdminPage><PageHeader eyebrow="分类体系 · Taxonomy" title="标签 / Tags" description="统一维护游客端筛选和导游主题标签。删除前请确认标签未被重要资料使用。" />
    <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]"><Card className="border-0 shadow-sm"><CardHeader><CardTitle>新增标签 / Add tag</CardTitle></CardHeader><CardContent><form className="grid gap-4" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); create.mutate({ slug: String(form.get("slug")), name: String(form.get("name")), category, description: String(form.get("description")) || null }); event.currentTarget.reset(); }}><Field label="英文名称 / Name"><Input required name="name" /></Field><Field label="Slug"><Input required name="slug" pattern="[a-z0-9-]+" /></Field><Field label="分类 / Category"><Select value={category} onValueChange={(value: typeof category) => setCategory(value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="language">language</SelectItem><SelectItem value="interest">interest</SelectItem><SelectItem value="audience">audience</SelectItem><SelectItem value="route">route</SelectItem><SelectItem value="style">style</SelectItem></SelectContent></Select></Field><Field label="说明 / Description"><Textarea name="description" /></Field><Button disabled={create.isPending} className="rounded-full">创建 / Create</Button></form></CardContent></Card><Card className="border-0 shadow-sm"><CardHeader><CardTitle>现有标签 / Current tags</CardTitle></CardHeader><CardContent className="grid gap-2">{tagsQuery.data?.map(tag => <div key={tag.id} className="flex items-center gap-3 rounded-xl border p-3"><Badge variant="outline">{tag.category}</Badge><div className="min-w-0 flex-1"><p className="font-medium">{tag.name}</p><p className="text-xs text-muted-foreground">/{tag.slug}</p></div><Button size="icon" variant="ghost" aria-label="Edit tag" onClick={() => setEditingTag(tag)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove.mutate({ id: tag.id })}><Trash2 className="size-4" /></Button></div>)}</CardContent></Card></div>
    <Dialog open={Boolean(editingTag)} onOpenChange={open => !open && setEditingTag(null)}><DialogContent><DialogHeader><DialogTitle>编辑标签 / Edit tag</DialogTitle><DialogDescription>更新标签名称、slug、分类与说明。</DialogDescription></DialogHeader>{editingTag && <form className="grid gap-4" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); update.mutate({ id: editingTag.id, name: String(form.get("name")), slug: String(form.get("slug")), category: String(form.get("category")) as any, description: String(form.get("description")) || null }); }}><Field label="英文名称 / Name"><Input required name="name" defaultValue={editingTag.name} /></Field><Field label="Slug"><Input required name="slug" pattern="[a-z0-9-]+" defaultValue={editingTag.slug} /></Field><Field label="分类 / Category"><select name="category" defaultValue={editingTag.category} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="language">language</option><option value="interest">interest</option><option value="audience">audience</option><option value="route">route</option><option value="style">style</option></select></Field><Field label="说明 / Description"><Textarea name="description" defaultValue={editingTag.description ?? ""} /></Field><Button disabled={update.isPending} className="rounded-full">保存 / Save tag</Button></form>}</DialogContent></Dialog>
  </AdminPage>;
}

export function AdminRequestsPage() {
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<"all" | "pending" | "reviewing" | "resolved" | "rejected">("all");
  const requests = trpc.operations.adminList.useQuery(status === "all" ? {} : { status });
  const update = trpc.operations.adminUpdate.useMutation({ onSuccess: async () => { toast.success("申请状态已更新"); await utils.operations.adminList.invalidate(); await utils.operations.analytics.invalidate(); } });
  return <AdminPage><PageHeader eyebrow="资料治理 · Requests" title="认领、纠错与下架申请" description="核对申请者关系、证据链接和说明，再将申请设置为处理中、已解决或拒绝。" action={<Select value={status} onValueChange={(value: typeof status) => setStatus(value)}><SelectTrigger className="w-48 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">全部 / All</SelectItem><SelectItem value="pending">pending</SelectItem><SelectItem value="reviewing">reviewing</SelectItem><SelectItem value="resolved">resolved</SelectItem><SelectItem value="rejected">rejected</SelectItem></SelectContent></Select>} />
    <div className="grid gap-4">{requests.isLoading && <Skeleton className="h-40" />}{requests.data?.length === 0 && <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">当前筛选下没有申请。</CardContent></Card>}{requests.data?.map(({ request, guideName }) => <Card key={request.id} className="border-0 shadow-sm"><CardContent className="p-5"><div className="flex flex-col gap-5 lg:flex-row lg:items-start"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge>{request.requestType}</Badge><Badge variant="outline">{request.status}</Badge><span className="text-xs text-muted-foreground">#{request.id} · {new Date(request.createdAt).toLocaleString()}</span></div><h2 className="mt-4 font-serif text-2xl font-semibold">{guideName || "General directory request"}</h2><p className="mt-2 text-sm"><strong>{request.requesterName}</strong> · {request.requesterEmail}</p><p className="mt-1 text-sm text-muted-foreground">关系 / Relationship: {request.relationship}</p><p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm leading-6">{request.message}</p>{request.evidenceUrl && <a className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline" href={request.evidenceUrl} target="_blank" rel="noreferrer">查看证据 <ExternalLink className="size-3.5" /></a>}</div><form className="grid w-full gap-3 lg:w-80" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); update.mutate({ id: request.id, status: String(form.get("status")) as any, adminNote: String(form.get("note")) || null }); }}><Label>处理状态 / Status</Label><select name="status" defaultValue={request.status} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="pending">pending</option><option value="reviewing">reviewing</option><option value="resolved">resolved</option><option value="rejected">rejected</option></select><Label>管理员备注 / Note</Label><Textarea name="note" defaultValue={request.adminNote ?? ""} /><Button disabled={update.isPending} variant="outline" className="bg-card">保存处理结果 / Save</Button></form></div></CardContent></Card>)}</div>
  </AdminPage>;
}

export function AdminAnalyticsPage() {
  const analytics = trpc.operations.analytics.useQuery();
  const maxClicks = useMemo(() => Math.max(1, ...(analytics.data?.recentClicks.map(item => item.clicks) ?? [1])), [analytics.data]);
  return <AdminPage><PageHeader eyebrow="匿名统计 · Analytics" title="内容漏斗与离站点击分析" description="以匿名汇总展示文章访问、导游卡片访问与公开来源离站点击，不存储不必要的个人数据。" />
    {analytics.isLoading ? <LoadingGrid /> : analytics.isError ? <AnalyticsError retry={() => void analytics.refetch()} /> : analytics.data ? <><div className="grid gap-4 sm:grid-cols-3"><MetricCard label="文章访问 / Article views" value={analytics.data.totals.blogViews} note="Anonymous content entry" icon={BookOpenText} /><MetricCard label="导游卡片 / Guide cards" value={analytics.data.totals.guideCardClicks} note="Directory intent signal" icon={UsersRound} /><MetricCard label="公开来源 / Source exits" value={analytics.data.totals.outboundClicks} note="Evidence-source visit" icon={BarChart3} /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Card className="border-0 shadow-sm"><CardHeader><CardTitle>近 14 个记录日 / Recent click days</CardTitle></CardHeader><CardContent><div className="flex h-64 items-end gap-2">{analytics.data.recentClicks.map(item => <div key={item.date} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold opacity-0 group-hover:opacity-100">{item.clicks}</span><div className="w-full rounded-t-lg bg-primary/80" style={{ height: `${Math.max(6, (item.clicks / maxClicks) * 190)}px` }} /><span className="max-w-full truncate text-[10px] text-muted-foreground">{String(item.date).slice(5)}</span></div>)}</div>{analytics.data.recentClicks.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">尚无离站点击记录。</p>}</CardContent></Card><Card className="border-0 shadow-sm"><CardHeader><CardTitle>导游点击 / Top guides</CardTitle></CardHeader><CardContent className="grid gap-3">{analytics.data.topGuides.map((item, index) => <div key={`${item.guideId}-${index}`} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-muted text-xs font-bold">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{item.displayName || "Unknown guide"}</span><Badge variant="secondary">{item.clicks}</Badge></div>)}{analytics.data.topGuides.length === 0 && <p className="text-sm text-muted-foreground">尚无数据。</p>}</CardContent></Card></div></> : <AnalyticsError retry={() => void analytics.refetch()} />}
  </AdminPage>;
}
