-- ============================================
-- StudentBoard - Seed Data
-- Sri Lanka O/L Templates (Grades 10-11)
-- 7 Subjects: Mathematics, Science, English,
--   Sinhala, Tamil, History, ICT
-- ============================================

-- Helper function to seed a subject + template + cards + checklist
create or replace function seed_subject_template(
  p_name text,
  p_grade int,
  p_country text,
  p_exam text,
  p_display_order int,
  p_card_titles text[]
) returns void as $$
declare
  v_subject_id uuid;
  v_template_id uuid;
  v_card_id uuid;
  v_card_title text;
  v_order int := 0;
begin
  -- Create subject
  insert into public.subjects (name, grade, country, exam, display_order)
  values (p_name, p_grade, p_country, p_exam, p_display_order)
  returning id into v_subject_id;

  -- Create template
  insert into public.templates (subject_id, grade, country, checklist_enabled)
  values (v_subject_id, p_grade, p_country, true)
  returning id into v_template_id;

  -- Create cards with default checklist
  foreach v_card_title in array p_card_titles loop
    v_order := v_order + 1;

    insert into public.template_cards (template_id, title, display_order)
    values (v_template_id, v_card_title, v_order)
    returning id into v_card_id;

    -- Default checklist items for every card
    insert into public.template_checklist_items (template_card_id, text, display_order)
    values
      (v_card_id, 'Understand the lesson (notes/video/class)', 1),
      (v_card_id, 'Make short notes / formula sheet', 2),
      (v_card_id, 'Practice 10-20 questions', 3),
      (v_card_id, 'Review mistakes + update error log', 4);
  end loop;
end;
$$ language plpgsql;

-- ============================================
-- GRADE 10 TEMPLATES
-- ============================================

select seed_subject_template('Mathematics', 10, 'LK', 'OL', 1, array[
  'Setup + Syllabus Map',
  'Number + Indices/Logs (foundation)',
  'Algebra basics (expressions, equations)',
  'Geometry basics (angles, triangles)',
  'Mensuration basics (area/volume)',
  'Graphs + basic statistics',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('Science', 10, 'LK', 'OL', 2, array[
  'Setup + Syllabus Map',
  'Biology fundamentals (cells, classification)',
  'Human biology basics (systems overview)',
  'Chemistry fundamentals (atoms, bonding basics)',
  'Physics fundamentals (motion/forces basics)',
  'Scientific method + lab-style questions',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('English', 10, 'LK', 'OL', 3, array[
  'Setup + Syllabus Map',
  'Grammar essentials (tenses, parts of speech)',
  'Vocabulary + common errors',
  'Reading comprehension (short passages)',
  'Writing basics (paragraphs, letters)',
  'Summary / guided writing practice',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('Sinhala', 10, 'LK', 'OL', 4, array[
  'Setup + Syllabus Map',
  'Grammar + common language rules',
  'Reading comprehension practice',
  'Writing (short essays / letters)',
  'Literature texts/lessons',
  'Vocabulary + common mistakes',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('Tamil', 10, 'LK', 'OL', 5, array[
  'Setup + Syllabus Map',
  'Grammar + common language rules',
  'Reading comprehension practice',
  'Writing (short essays / letters)',
  'Literature texts/lessons',
  'Vocabulary + common mistakes',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('History', 10, 'LK', 'OL', 6, array[
  'Setup + Syllabus Map',
  'Sri Lanka history core themes (overview)',
  'Ancient/medieval period key points',
  'Colonial period overview + key events',
  'Modern era overview + key themes',
  'Map/source-based style questions',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('ICT', 10, 'LK', 'OL', 7, array[
  'Setup + Syllabus Map',
  'Computer basics (hardware/software)',
  'Operating systems + file management',
  'Networks + Internet basics',
  'Data basics (tables, simple databases)',
  'Office tools fundamentals (docs/sheets/slides)',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

-- ============================================
-- GRADE 11 TEMPLATES
-- ============================================

select seed_subject_template('Mathematics', 11, 'LK', 'OL', 1, array[
  'Setup + Syllabus Map',
  'Algebra mastery (factorization, functions)',
  'Geometry + mensuration mixed problems',
  'Trigonometry basics + applications',
  'Graphs + statistics + probability basics',
  'Mixed revision (high-frequency question types)',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('Science', 11, 'LK', 'OL', 2, array[
  'Setup + Syllabus Map',
  'Biology revision (systems + key definitions)',
  'Chemistry revision (reactions + calculations)',
  'Physics revision (electricity/energy/motion)',
  'Interdisciplinary mixed questions',
  'Definitions, diagrams, structured answers',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('English', 11, 'LK', 'OL', 3, array[
  'Setup + Syllabus Map',
  'Grammar accuracy (error correction focus)',
  'Comprehension (timed practice)',
  'Writing (timed: letters/essays/reports)',
  'Summary + editing/proofreading',
  'Model answers + common marking points',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('Sinhala', 11, 'LK', 'OL', 4, array[
  'Setup + Syllabus Map',
  'Grammar accuracy + common exam patterns',
  'Comprehension (timed practice)',
  'Writing (timed: essays/letters)',
  'Literature (answer structure + key points)',
  'Model answers + marking scheme practice',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('Tamil', 11, 'LK', 'OL', 5, array[
  'Setup + Syllabus Map',
  'Grammar accuracy + common exam patterns',
  'Comprehension (timed practice)',
  'Writing (timed: essays/letters)',
  'Literature (answer structure + key points)',
  'Model answers + marking scheme practice',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('History', 11, 'LK', 'OL', 6, array[
  'Setup + Syllabus Map',
  'High-frequency Sri Lanka history themes',
  'Key periods/events consolidation',
  'Cause/effect + comparison questions',
  'Source/map-based + structured answers',
  'Essay planning + model answers',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

select seed_subject_template('ICT', 11, 'LK', 'OL', 7, array[
  'Setup + Syllabus Map',
  'Networks + Internet (deeper + exam questions)',
  'Databases (tables, keys, queries concepts)',
  'Systems + security basics',
  'Logic/algorithms (flowcharts/pseudocode)',
  'Mixed revision + common pitfalls',
  'Past Papers + Timed Practice',
  'Error Log + Final Revision'
]);

-- Clean up helper function
drop function if exists seed_subject_template;
