CREATE TABLE `checkin` (
	`id` text PRIMARY KEY NOT NULL,
	`trial_id` text NOT NULL,
	`occurred_at` integer NOT NULL,
	`note` text,
	FOREIGN KEY (`trial_id`) REFERENCES `trial`(`id`) ON UPDATE no action ON DELETE no action
);
