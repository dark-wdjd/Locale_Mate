import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import {
  AdminAnalyticsPage,
  AdminArticlesPage,
  AdminGuidesPage,
  AdminOverviewPage,
  AdminRequestsPage,
  AdminTagsPage,
} from "@/pages/AdminPages";
import {
  AboutPage,
  BlogArticlePage,
  BlogIndexPage,
  ClaimPage,
  GuideDetailPage,
  GuidesDirectoryPage,
  HomePage,
} from "@/pages/PublicPages";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/guides" component={GuidesDirectoryPage} />
      <Route path="/guides/:slug" component={GuideDetailPage} />
      <Route path="/blog" component={BlogIndexPage} />
      <Route path="/blog/:slug" component={BlogArticlePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/claim" component={ClaimPage} />
      <Route path="/admin" component={AdminOverviewPage} />
      <Route path="/admin/guides" component={AdminGuidesPage} />
      <Route path="/admin/articles" component={AdminArticlesPage} />
      <Route path="/admin/tags" component={AdminTagsPage} />
      <Route path="/admin/requests" component={AdminRequestsPage} />
      <Route path="/admin/analytics" component={AdminAnalyticsPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-center" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
