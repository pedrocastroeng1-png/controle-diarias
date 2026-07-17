DROP POLICY IF EXISTS "Allow public view employee photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert employee photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update employee photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public view attendance photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert attendance photos" ON storage.objects;

CREATE POLICY "Allow anon all employee photos" ON storage.objects FOR ALL TO public USING (bucket_id = 'employee-photos') WITH CHECK (bucket_id = 'employee-photos');
CREATE POLICY "Allow anon all attendance photos" ON storage.objects FOR ALL TO public USING (bucket_id = 'attendance-photos') WITH CHECK (bucket_id = 'attendance-photos');
