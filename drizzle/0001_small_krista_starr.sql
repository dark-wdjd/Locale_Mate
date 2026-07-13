CREATE TABLE `blog_guide_links` (
	`blogPostId` int NOT NULL,
	`guideId` int NOT NULL,
	`editorialNote` varchar(320),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `blog_guide_links_pk` PRIMARY KEY(`blogPostId`,`guideId`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(240) NOT NULL,
	`excerpt` varchar(500) NOT NULL,
	`bodyMarkdown` text NOT NULL,
	`coverImageUrl` varchar(2048),
	`category` varchar(100) NOT NULL,
	`seoTitle` varchar(240),
	`seoDescription` varchar(320),
	`status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
	`isFeatured` boolean NOT NULL DEFAULT false,
	`readingMinutes` int NOT NULL DEFAULT 5,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `claim_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guideId` int,
	`requestType` enum('claim','correction','opt_out','removal') NOT NULL,
	`requesterName` varchar(160) NOT NULL,
	`requesterEmail` varchar(320) NOT NULL,
	`relationship` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`evidenceUrl` varchar(2048),
	`status` enum('pending','reviewing','resolved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `claim_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guide_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guideId` int NOT NULL,
	`platform` enum('xiaohongshu','douyin','media','website') NOT NULL,
	`sourceType` enum('profile','post','article','search') NOT NULL,
	`url` varchar(2048) NOT NULL,
	`publicTitle` varchar(500),
	`evidenceSummary` text,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`verifiedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guide_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guide_tag_links` (
	`guideId` int NOT NULL,
	`tagId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `guide_tag_links_pk` PRIMARY KEY(`guideId`,`tagId`)
);
--> statement-breakpoint
CREATE TABLE `guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`shortBio` varchar(320) NOT NULL,
	`longBio` text,
	`city` varchar(80) NOT NULL DEFAULT 'Chengdu',
	`languages` varchar(240) NOT NULL DEFAULT 'English, Mandarin',
	`status` enum('active','unclaimed','removed') NOT NULL DEFAULT 'unclaimed',
	`isClaimed` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`isEditorsPick` boolean NOT NULL DEFAULT false,
	`avatarUrl` varchar(2048),
	`lastVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `guides_id` PRIMARY KEY(`id`),
	CONSTRAINT `guides_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `outbound_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pagePath` varchar(500) NOT NULL,
	`guideId` int,
	`sourceId` int,
	`targetUrl` varchar(2048) NOT NULL,
	`clickType` enum('xiaohongshu_profile','xiaohongshu_post','douyin','other') NOT NULL,
	`sessionHash` varchar(128),
	`referrerPath` varchar(500),
	`userAgentHash` varchar(128),
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `outbound_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(100) NOT NULL,
	`name` varchar(100) NOT NULL,
	`category` enum('language','interest','audience','route','style') NOT NULL,
	`description` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `blog_guide_links` ADD CONSTRAINT `blog_guide_links_blogPostId_blog_posts_id_fk` FOREIGN KEY (`blogPostId`) REFERENCES `blog_posts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_guide_links` ADD CONSTRAINT `blog_guide_links_guideId_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `guides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `claim_requests` ADD CONSTRAINT `claim_requests_guideId_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `guides`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guide_sources` ADD CONSTRAINT `guide_sources_guideId_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `guides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guide_tag_links` ADD CONSTRAINT `guide_tag_links_guideId_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `guides`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `guide_tag_links` ADD CONSTRAINT `guide_tag_links_tagId_tags_id_fk` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outbound_clicks` ADD CONSTRAINT `outbound_clicks_guideId_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `guides`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `outbound_clicks` ADD CONSTRAINT `outbound_clicks_sourceId_guide_sources_id_fk` FOREIGN KEY (`sourceId`) REFERENCES `guide_sources`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `blog_guide_links_guide_idx` ON `blog_guide_links` (`guideId`);--> statement-breakpoint
CREATE INDEX `blog_posts_status_published_idx` ON `blog_posts` (`status`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `blog_posts_category_idx` ON `blog_posts` (`category`);--> statement-breakpoint
CREATE INDEX `claim_requests_status_idx` ON `claim_requests` (`status`);--> statement-breakpoint
CREATE INDEX `claim_requests_guide_idx` ON `claim_requests` (`guideId`);--> statement-breakpoint
CREATE INDEX `guide_sources_guide_idx` ON `guide_sources` (`guideId`);--> statement-breakpoint
CREATE INDEX `guide_sources_platform_idx` ON `guide_sources` (`platform`);--> statement-breakpoint
CREATE INDEX `guide_tag_links_tag_idx` ON `guide_tag_links` (`tagId`);--> statement-breakpoint
CREATE INDEX `guides_status_idx` ON `guides` (`status`);--> statement-breakpoint
CREATE INDEX `guides_featured_idx` ON `guides` (`isFeatured`);--> statement-breakpoint
CREATE INDEX `outbound_clicks_clicked_idx` ON `outbound_clicks` (`clickedAt`);--> statement-breakpoint
CREATE INDEX `outbound_clicks_guide_idx` ON `outbound_clicks` (`guideId`);--> statement-breakpoint
CREATE INDEX `outbound_clicks_type_idx` ON `outbound_clicks` (`clickType`);--> statement-breakpoint
CREATE INDEX `tags_category_idx` ON `tags` (`category`);