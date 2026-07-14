CREATE TABLE `content_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventType` enum('blog_view','guide_card_click') NOT NULL,
	`pagePath` varchar(500) NOT NULL,
	`guideId` int,
	`blogPostId` int,
	`sessionHash` varchar(128),
	`referrerPath` varchar(500),
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `content_events` ADD CONSTRAINT `content_events_guideId_guides_id_fk` FOREIGN KEY (`guideId`) REFERENCES `guides`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_events` ADD CONSTRAINT `content_events_blogPostId_blog_posts_id_fk` FOREIGN KEY (`blogPostId`) REFERENCES `blog_posts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `content_events_occurred_idx` ON `content_events` (`occurredAt`);--> statement-breakpoint
CREATE INDEX `content_events_type_idx` ON `content_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `content_events_guide_idx` ON `content_events` (`guideId`);--> statement-breakpoint
CREATE INDEX `content_events_blog_idx` ON `content_events` (`blogPostId`);