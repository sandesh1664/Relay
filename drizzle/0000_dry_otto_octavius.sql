CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`scene` text NOT NULL,
	`user` text NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reactions` (
	`scene` text NOT NULL,
	`user` text NOT NULL,
	`kind` text NOT NULL,
	PRIMARY KEY(`scene`, `user`, `kind`)
);
--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` text PRIMARY KEY NOT NULL,
	`parent` text,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`genre` text NOT NULL,
	`author` text NOT NULL,
	`user_id` text NOT NULL,
	`media` text,
	`media_type` text,
	`created` integer NOT NULL
);
