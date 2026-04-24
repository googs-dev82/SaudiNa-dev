-- Ensure overlapping held/booked event slots cannot coexist

CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_slots_no_overlap'
  ) THEN
    ALTER TABLE "event_slots"
      ADD CONSTRAINT "event_slots_no_overlap"
      EXCLUDE USING gist (
        "timezone" WITH =,
        tsrange("slotStartAt", "slotEndAt", '[)') WITH &&
      )
      WHERE ("status" IN ('HELD', 'BOOKED'));
  END IF;
END $$;
