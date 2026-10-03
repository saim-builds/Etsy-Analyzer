   import {
     pgTable, bigserial, bigint, text, smallint, integer,
     numeric, timestamp, date, primaryKey, unique,
   } from "drizzle-orm/pg-core";

   export const keywords = pgTable("keywords", {
     id: bigserial("id", { mode: "number" }).primaryKey(),
     term: text("term").notNull().unique(),
     demand: smallint("demand"),
     competition: smallint("competition"),
     opportunity: smallint("opportunity"),
     updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
   });

   export const keywordSnapshots = pgTable(
     "keyword_snapshots",
     {
       id: bigserial("id", { mode: "number" }).primaryKey(),
       keywordId: bigint("keyword_id", { mode: "number" })
         .notNull()
         .references(() => keywords.id, { onDelete: "cascade" }),
       resultCount: integer("result_count"),
       avgTopReviews: numeric("avg_top_reviews"),
       avgFavPerMonth: numeric("avg_fav_per_month"),
       autocompleteRank: smallint("autocomplete_rank"),
       trendValue: numeric("trend_value"),
       capturedOn: date("captured_on").notNull(),
     },
     (t) => [unique().on(t.keywordId, t.capturedOn)]
   );

   export const listings = pgTable("listings", {
     id: bigserial("id", { mode: "number" }).primaryKey(),
     etsyListingId: bigint("etsy_listing_id", { mode: "number" }).notNull().unique(),
     title: text("title"),
     tags: text("tags").array(),
     price: numeric("price"),
     numFavorers: integer("num_favorers"),
     reviewCount: integer("review_count"),
     fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
   });

   export const keywordListings = pgTable(
     "keyword_listings",
     {
       keywordId: bigint("keyword_id", { mode: "number" })
         .notNull()
         .references(() => keywords.id, { onDelete: "cascade" }),
       listingId: bigint("listing_id", { mode: "number" })
         .notNull()
         .references(() => listings.id, { onDelete: "cascade" }),
       rank: smallint("rank"),
       capturedOn: date("captured_on").notNull(),
     },
     (t) => [primaryKey({ columns: [t.keywordId, t.listingId, t.capturedOn] })]
   );