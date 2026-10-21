CREATE TABLE services (id integer PRIMARY KEY NOT NULL, name text NOT NULL, price integer NOT NULL, duration integer NOT NULL);
--> statement-breakpoint
CREATE TABLE bookings (id text PRIMARY KEY NOT NULL, customer_name text NOT NULL, phone text NOT NULL, service_id integer NOT NULL REFERENCES services(id), date text NOT NULL, time text NOT NULL, status text DEFAULT 'Pending' NOT NULL, price integer NOT NULL, duration integer NOT NULL, created_at text NOT NULL);
--> statement-breakpoint
CREATE TABLE occupied_slots (date text NOT NULL, minute integer NOT NULL, booking_id text NOT NULL REFERENCES bookings(id), PRIMARY KEY(date,minute));
--> statement-breakpoint
CREATE TABLE invoices (id text PRIMARY KEY NOT NULL, booking_id text NOT NULL REFERENCES bookings(id), customer_name text NOT NULL, items text NOT NULL, total integer NOT NULL, created_at text NOT NULL);
