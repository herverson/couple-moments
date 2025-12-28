CREATE TABLE `couples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user1Id` int NOT NULL,
	`user2Id` int NOT NULL,
	`relationshipStartDate` timestamp NOT NULL,
	`coupleName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `couples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coupleId` int NOT NULL,
	`uploadedByUserId` int NOT NULL,
	`s3Key` varchar(512) NOT NULL,
	`s3Url` text NOT NULL,
	`description` text,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `romanticPhrases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phrase` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`author` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `romanticPhrases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `youtubeVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`coupleId` int NOT NULL,
	`addedByUserId` int NOT NULL,
	`videoId` varchar(255) NOT NULL,
	`title` varchar(512),
	`description` text,
	`thumbnail` text,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `youtubeVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `coupleId` int;