-- ============================================================
-- SEED — HappyHouse IELTS Platform
-- Run AFTER schema.sql on a fresh database
-- ============================================================

-- ============================================================
-- PASSAGES (reading articles + listening audio clips)
-- ============================================================

INSERT INTO passages (id, title, type, level, content, audio_url, active) VALUES

-- Reading Passage 1 — B1
('00000000-0000-0000-0001-000000000001',
 'Urban Farming',
 'reading', 'B1',
 E'Urban farming is transforming the way cities think about food production. With rapid population growth and increasing concerns about food security, cities around the world are turning rooftops, empty lots, and even indoor spaces into productive growing areas. Singapore has developed vertical farms that use hydroponics to grow vegetables without soil, while New York City runs dozens of community garden programmes that supply fresh produce to local residents.\n\nThe benefits of urban farming extend beyond simply producing food. Urban gardens help reduce carbon emissions by shortening the distance food travels before it reaches consumers — a concept known as "food miles". Green spaces in cities also help reduce temperatures by providing shade and absorbing heat, making urban environments more comfortable during summer months.\n\nDespite its advantages, urban farming faces several challenges. Setting up a professional urban farm requires significant investment in equipment, lighting, and irrigation systems. Limited space in densely populated cities also restricts how much food can actually be produced. Critics argue that urban farming can never replace industrial agriculture in terms of scale and efficiency.\n\nNevertheless, urban farming advocates believe it has an important role to play in making cities more sustainable. Rather than replacing traditional farming, they see it as a valuable complement — one that brings communities closer to their food sources and promotes environmental awareness among urban populations.',
 NULL, true),

-- Reading Passage 2 — B2
('00000000-0000-0000-0002-000000000001',
 'The Remote Work Revolution',
 'reading', 'B2',
 E'The widespread adoption of remote work, dramatically accelerated by the global pandemic of 2020, has fundamentally reshaped modern working life. Although many organisations initially embraced remote work as a temporary necessity, a substantial number have since embedded it as a permanent fixture of their operational strategy.\n\nResearch conducted by Stanford University economist Nicholas Bloom found that employees working from home are, on average, 13 percent more productive than those in traditional office environments. Workers report improved concentration, reduced commuting time, and greater flexibility in managing personal responsibilities alongside professional obligations. For companies, the financial benefits are equally compelling: lower expenditure on office real estate and access to a global talent pool unconstrained by geographic limitations.\n\nHowever, the transition to remote work has not been without complications. Spontaneous collaboration — the kind that arises from informal corridor conversations or impromptu whiteboard sessions — is difficult to replicate digitally. Research suggests that junior employees, who rely heavily on observational learning and informal mentoring from senior colleagues, may be particularly disadvantaged. Furthermore, the boundary between work and personal life can become problematic when both share the same physical environment.\n\nAs organisations continue to navigate these trade-offs, most management experts advocate for a hybrid approach: one that combines the deep-focus advantages of remote work with the collaborative benefits of in-person interaction. The consensus emerging from workplace research is that flexibility, rather than a single prescribed model, will define the future of work.',
 NULL, true),

-- Listening Passage 1 — A2 (active=false until audio_url is set)
('00000000-0000-0000-0003-000000000001',
 'Finding Your Way Around Campus',
 'listening', 'A2',
 NULL,
 NULL,  -- replace with your hosted audio URL
 false);


-- ============================================================
-- QUESTIONS
-- ============================================================

INSERT INTO questions (section, type, level, question_text, option_a, option_b, option_c, option_d, correct_answer, active) VALUES

-- ===== GRAMMAR (standalone) =====
('grammar','multiple_choice','A2', '''............................... on Sundays?'' ''No, not usually.''', 'Do you work','Are you work','Do you working','Are you working','A',true),
('grammar','multiple_choice','A2', '''What _______ next weekend?'' ''Nothing. I''ve got no plans.''', 'do you do','are you doing','will you do','would you do','B',true),
('grammar','multiple_choice','A2', 'I''m going shopping. I need ________.', 'some new jeans','a new jeans','a new pair of jeans','a new pair jeans','C',true),
('grammar','multiple_choice','A2', 'My sister ________ by plane.', 'has never travel','has never travelled','is never travelled','has never been travelled','B',true),
('grammar','multiple_choice','A2', 'What time ______ (Lisa/phone)?', 'did Lisa phone','does Lisa phone','Lisa phones','has Lisa phoned','A',true),
('grammar','multiple_choice','A2', '______ (you/see) Jenny last night?', 'Do you see','Did you see','Have you seen','Are you seeing','B',true),
('grammar','multiple_choice','A2', 'I think you look ______ in that dress.', 'pretty','prettier','prettiest','beauty','A',true),
('grammar','multiple_choice','A2', 'Dad didn''t help me. I did it all ___.', 'themselves','myself','himself','yourself','B',true),
('grammar','multiple_choice','A2', 'I''m not very good ___ telling stories.', 'with','at','in','for','B',true),
('grammar','multiple_choice','B1', 'I''ve told my bank to close my account. ... an account with a more ethical bank.', 'I opened','I open','I am going to open','I''m opening','C',true),
('grammar','multiple_choice','B1', 'I ______ (lie)! It''s true!', 'lie','am lying','am not lying','lied','C',true),
('grammar','multiple_choice','B1', 'It ______ (rain) a lot while we were on holiday.', 'rained','was raining','has rained','rains','B',true),
('grammar','multiple_choice','B1', 'A lot of time ___ on pointless meetings.', 'wastes','is wasted','was waste','wasting','B',true),
('grammar','multiple_choice','B1', 'What would you do if you ___ to do this again?', 'have','had','will have','having','B',true),
('grammar','multiple_choice','B1', 'I wish you ___ put your toys away!', 'will','would','can','are','B',true),
('grammar','multiple_choice','A2', 'She ______ to school every day by bus.', 'go','goes','going','gone','B',true),
('grammar','multiple_choice','A2', 'Visitors are not ______ to touch the exhibits.', 'allowed','advised','let',NULL,'A',true),
('grammar','multiple_choice','A2', 'The library is a quiet place. You ______ talk on your phone inside.', 'can''t','don''t','haven''t','shouldn''t','A',true),

-- ===== VOCABULARY (standalone) =====
('vocabulary','multiple_choice','A1', 'A ... is white or grey and is high in the sky.', 'cloud','cold','storm','wind','A',true),
('vocabulary','multiple_choice','A1', 'A ... is where you see films.', 'bank','cinema','post office','stadium','B',true),
('vocabulary','multiple_choice','A1', 'We need this ... to get on transport.', 'glasses','bill','ticket','cheque','C',true),
('vocabulary','multiple_choice','A1', 'Most people have five ... on each hand.', 'arms','fingers','legs','toes','B',true),
('vocabulary','multiple_choice','A1', 'An ... area with many trees.', 'forest','mountain','plant','lake','A',true),
('vocabulary','multiple_choice','A2', 'Bob _____ a lot of money in business.', 'spent','made','saved','owed','B',true),
('vocabulary','multiple_choice','A2', 'Home Lovers have lots of _____ in sale.', 'debts','fortunes','bargains','fees','C',true),
('vocabulary','multiple_choice','A2', 'Let me just add _____ what I''m buying.', 'on','up','over','in','B',true),
('vocabulary','multiple_choice','A2', 'I''ve bought a new ______ book (COOK)', 'cook','cooked','cooking','cookery','C',true),
('vocabulary','multiple_choice','A2', 'We are all in ______ (AGREE)', 'agree','agreement','agreeing','agreed','B',true),
('vocabulary','multiple_choice','A2', 'Todd is really ______ (ART)', 'art','artist','artistic','artistry','C',true),
('vocabulary','multiple_choice','A2', 'Women still ______ less than men.', 'earn','alone','close','examine','A',true),
('vocabulary','multiple_choice','A2', 'My diary is ______.', 'earn','private','close','artistic','B',true),
('vocabulary','multiple_choice','A2', 'We have a very ______ relationship.', 'alone','private','close','examine','C',true),
('vocabulary','multiple_choice','B1', 'I''ve come to the ______ (CONCLUDE)', 'conclude','conclusion','concluding','concluded','B',true),
('vocabulary','multiple_choice','B2', 'The scientist made a ______ discovery that changed our understanding of the universe.', 'groundbreaking','ordinary','subtle','delayed','A',true),
('vocabulary','multiple_choice','B1', 'Despite the heavy rain, they decided to ______ with their outdoor event.', 'proceed','precede','recede','concede','A',true);


-- ===== READING — Passage 1: Urban Farming (B1) =====
INSERT INTO questions (section, type, level, question_text, option_a, option_b, option_c, option_d, correct_answer, active, passage_id) VALUES

('reading','reading','B1',
 'What is the main topic of the passage?',
 'The history of Singapore''s farming industry',
 'The growth and impact of urban farming in cities',
 'The problems with industrial agriculture',
 'How hydroponics technology works',
 'B', true,
 '00000000-0000-0000-0001-000000000001'),

('reading','reading','B1',
 'According to the passage, what does the term "food miles" refer to?',
 'The number of farms in a city',
 'The weight of food produced in urban areas',
 'The distance food travels to reach consumers',
 'The cost of transporting produce',
 'C', true,
 '00000000-0000-0000-0001-000000000001'),

('reading','reading','B1',
 'What does the passage identify as a challenge for urban farming?',
 'Lack of public interest in fresh produce',
 'High setup costs and limited urban space',
 'Poor quality of hydroponically grown vegetables',
 'Government bans on rooftop gardens',
 'B', true,
 '00000000-0000-0000-0001-000000000001'),

('reading','reading','B1',
 'How does the author describe the relationship between urban farming and traditional farming?',
 'Urban farming will eventually replace traditional farming entirely',
 'Traditional farming is superior in every measurable way',
 'Urban farming is a valuable complement to traditional farming',
 'The two methods cannot coexist in the same country',
 'C', true,
 '00000000-0000-0000-0001-000000000001');


-- ===== READING — Passage 2: Remote Work (B2) =====
INSERT INTO questions (section, type, level, question_text, option_a, option_b, option_c, option_d, correct_answer, active, passage_id) VALUES

('reading','reading','B2',
 'What does the passage say accelerated the shift to remote work?',
 'Advances in communication technology',
 'The global pandemic of 2020',
 'Rising costs of city office space',
 'Government policy changes',
 'B', true,
 '00000000-0000-0000-0002-000000000001'),

('reading','reading','B2',
 'According to the Stanford research cited, how much more productive are remote workers compared to office-based workers?',
 '3 percent more productive',
 '13 percent more productive',
 '30 percent more productive',
 '50 percent more productive',
 'B', true,
 '00000000-0000-0000-0002-000000000001'),

('reading','reading','B2',
 'The word "embedded" in paragraph two most closely means...',
 'Temporarily adopted',
 'Officially announced',
 'Firmly established',
 'Widely questioned',
 'C', true,
 '00000000-0000-0000-0002-000000000001'),

('reading','reading','B2',
 'According to the passage, which employees are most likely to be disadvantaged by remote work?',
 'Senior executives working across time zones',
 'Technology specialists using cloud tools',
 'Junior employees who rely on mentoring and observation',
 'Part-time workers with flexible schedules',
 'C', true,
 '00000000-0000-0000-0002-000000000001'),

('reading','reading','B2',
 'What solution do most management experts advocate, according to the passage?',
 'Fully remote work for all employees',
 'A return to traditional office environments',
 'A hybrid model combining remote and in-person work',
 'Reducing overall working hours',
 'C', true,
 '00000000-0000-0000-0002-000000000001');


-- ===== LISTENING — Passage 1: Campus Directions (A2, inactive until audio added) =====
INSERT INTO questions (section, type, level, question_text, option_a, option_b, option_c, option_d, correct_answer, active, passage_id) VALUES

('listening','listening','A2',
 'Where does the student want to go?',
 'The cafeteria',
 'The library',
 'The sports centre',
 'The administration office',
 'B', false,
 '00000000-0000-0000-0003-000000000001'),

('listening','listening','A2',
 'The student is told the library is located...',
 'Next to the main entrance',
 'Opposite the science building',
 'Behind the student centre',
 'On the second floor of Block C',
 'B', false,
 '00000000-0000-0000-0003-000000000001'),

('listening','listening','A2',
 'What does the student need to borrow books from the library?',
 'A cash deposit',
 'Written permission from a teacher',
 'A valid student ID card',
 'An online registration form',
 'C', false,
 '00000000-0000-0000-0003-000000000001');
