DROP POLICY "Users can update controls in custom frameworks" ON controls;
CREATE POLICY "Users can update controls"
ON controls FOR UPDATE TO authenticated
USING (true)
WITH CHECK (true);