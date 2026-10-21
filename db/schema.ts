// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
export const services = sqliteTable('services', {id:integer('id').primaryKey(),name:text('name').notNull(),price:integer('price').notNull(),duration:integer('duration').notNull()});
export const bookings = sqliteTable('bookings', {id:text('id').primaryKey(),customer_name:text('customer_name').notNull(),phone:text('phone').notNull(),service_id:integer('service_id').notNull().references(()=>services.id),date:text('date').notNull(),time:text('time').notNull(),status:text('status').notNull().default('Pending'),price:integer('price').notNull(),duration:integer('duration').notNull(),created_at:text('created_at').notNull()});
export const occupiedSlots = sqliteTable('occupied_slots', {date:text('date').notNull(),minute:integer('minute').notNull(),booking_id:text('booking_id').notNull().references(()=>bookings.id)},t=>[primaryKey({columns:[t.date,t.minute]})]);
export const invoices = sqliteTable('invoices', {id:text('id').primaryKey(),booking_id:text('booking_id').notNull().references(()=>bookings.id),customer_name:text('customer_name').notNull(),items:text('items').notNull(),total:integer('total').notNull(),created_at:text('created_at').notNull()});
