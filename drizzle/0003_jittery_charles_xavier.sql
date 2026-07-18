DROP INDEX `blog_posts_status_published_idx` ON `blog_posts`;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `sortOrder` int DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX `blog_posts_status_published_idx` ON `blog_posts` (`status`,`sortOrder`,`publishedAt`);