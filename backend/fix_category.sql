ALTER TABLE community.threads ADD COLUMN category_int integer DEFAULT 0;
UPDATE community.threads SET category_int = CASE category::text WHEN 'General' THEN 0 WHEN 'Feedback' THEN 1 WHEN 'Support' THEN 2 ELSE 0 END;
ALTER TABLE community.threads DROP COLUMN category;
ALTER TABLE community.threads RENAME COLUMN category_int TO category;
