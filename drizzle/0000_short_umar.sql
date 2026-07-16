CREATE TABLE `baby` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`birthdate` integer NOT NULL,
	`default_window_days` integer DEFAULT 3 NOT NULL,
	`locale` text
);
--> statement-breakpoint
CREATE TABLE `food` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`is_custom` integer DEFAULT false NOT NULL,
	`allergen_group` text
);
--> statement-breakpoint
CREATE TABLE `reaction` (
	`id` text PRIMARY KEY NOT NULL,
	`trial_id` text NOT NULL,
	`symptoms` text NOT NULL,
	`severity` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`note` text,
	FOREIGN KEY (`trial_id`) REFERENCES `trial`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trial` (
	`id` text PRIMARY KEY NOT NULL,
	`food_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`window_days` integer NOT NULL,
	`outcome` text,
	`ended_at` integer,
	FOREIGN KEY (`food_id`) REFERENCES `food`(`id`) ON UPDATE no action ON DELETE no action
);
