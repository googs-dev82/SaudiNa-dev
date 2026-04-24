-- SaudiNA Sample Data
-- Migration: 20260405_operational_schema
-- Purpose: Realistic seed data for development and testing

-- ============================================
-- ROLES
-- ============================================
INSERT INTO roles (code, name_ar, name_en, description) VALUES
('SUPER_ADMIN', 'مدير النظام', 'Super Admin', 'Full system access with no scope restrictions'),
('REGIONAL_MANAGER', 'مدير إقليمي', 'Regional Manager', 'Manages all areas and committees within a region'),
('AREA_MANAGER', 'مدير منطقة', 'Area Manager', 'Manages committees within a specific area'),
('COMMITTEE_MANAGER', 'مدير لجنة', 'Committee Manager', 'Approves/rejects in-service meetings for a committee'),
('COMMITTEE_SECRETARY', 'أمين لجنة', 'Committee Secretary', 'Creates and submits in-service meetings'),
('MEETING_EDITOR', 'محرر اجتماعات', 'Meeting Editor', 'Creates and publishes recovery meetings within assigned area'),
('CONTENT_EDITOR', 'محرر محتوى', 'Content Editor', 'Manages resources and CMS content');

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, email, display_name, status, provider, created_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'admin@saudina.org', 'أحمد المدير', 'ACTIVE', 'INTERNAL', NOW() - INTERVAL '90 days'),
('a2222222-2222-2222-2222-222222222222', 'regional.riyadh@saudina.org', 'فاطمة الإقليمية', 'ACTIVE', 'GOOGLE', NOW() - INTERVAL '60 days'),
('a3333333-3333-3333-3333-333333333333', 'area.north@saudina.org', 'خالد المنطقة', 'ACTIVE', 'ZOHO', NOW() - INTERVAL '45 days'),
('a4444444-4444-4444-4444-444444444444', 'mgr.pr@saudina.org', 'محمد اللجنة', 'ACTIVE', 'INTERNAL', NOW() - INTERVAL '30 days'),
('a5555555-5555-5555-5555-555555555555', 'sec.pr@saudina.org', 'نورة الأمين', 'ACTIVE', 'INTERNAL', NOW() - INTERVAL '30 days'),
('a6666666-6666-6666-6666-666666666666', 'editor1@saudina.org', 'عمر المحرر', 'ACTIVE', 'GOOGLE', NOW() - INTERVAL '20 days'),
('a7777777-7777-7777-7777-777777777777', 'content@saudina.org', 'سارة المحتوى', 'ACTIVE', 'INTERNAL', NOW() - INTERVAL '15 days'),
('a8888888-8888-8888-8888-888888888888', 'inactive@saudina.org', 'مستخدم غير نشط', 'INACTIVE', 'INTERNAL', NOW() - INTERVAL '120 days');

-- ============================================
-- USER ASSIGNMENTS
-- ============================================
INSERT INTO user_assignments (id, user_id, role_code, scope_type, scope_id, scope_code, created_at) VALUES
-- Super Admin (global)
(gen_random_uuid(), 'a1111111-1111-1111-1111-111111111111', 'SUPER_ADMIN', 'GLOBAL', NULL, NULL, NOW() - INTERVAL '90 days'),
-- Regional Manager for Riyadh
(gen_random_uuid(), 'a2222222-2222-2222-2222-222222222222', 'REGIONAL_MANAGER', 'REGION', 'r1111111-1111-1111-1111-111111111111', 'RIYADH', NOW() - INTERVAL '60 days'),
-- Area Manager for North Riyadh
(gen_random_uuid(), 'a3333333-3333-3333-3333-333333333333', 'AREA_MANAGER', 'AREA', 'ar111111-1111-1111-1111-111111111111', 'NORTH_RIYADH', NOW() - INTERVAL '45 days'),
-- Committee Manager for PR Committee
(gen_random_uuid(), 'a4444444-4444-4444-4444-444444444444', 'COMMITTEE_MANAGER', 'COMMITTEE', 'c1111111-1111-1111-1111-111111111111', 'PR_COMMITTEE', NOW() - INTERVAL '30 days'),
-- Committee Secretary for PR Committee
(gen_random_uuid(), 'a5555555-5555-5555-5555-555555555555', 'COMMITTEE_SECRETARY', 'COMMITTEE', 'c1111111-1111-1111-1111-111111111111', 'PR_COMMITTEE', NOW() - INTERVAL '30 days'),
-- Meeting Editor for North Riyadh area
(gen_random_uuid(), 'a6666666-6666-6666-6666-666666666666', 'MEETING_EDITOR', 'AREA', 'ar111111-1111-1111-1111-111111111111', 'NORTH_RIYADH', NOW() - INTERVAL '20 days'),
-- Content Editor (global)
(gen_random_uuid(), 'a7777777-7777-7777-7777-777777777777', 'CONTENT_EDITOR', 'GLOBAL', NULL, NULL, NOW() - INTERVAL '15 days');

-- ============================================
-- REGIONS
-- ============================================
INSERT INTO regions (id, code, name_ar, name_en, created_at) VALUES
('r1111111-1111-1111-1111-111111111111', 'RIYADH', 'الرياض', 'Riyadh', NOW() - INTERVAL '100 days'),
('r2222222-2222-2222-2222-222222222222', 'MAKKAH', 'مكة المكرمة', 'Makkah', NOW() - INTERVAL '100 days'),
('r3333333-3333-3333-3333-333333333333', 'EASTERN', 'المنطقة الشرقية', 'Eastern Province', NOW() - INTERVAL '100 days');

-- ============================================
-- AREAS
-- ============================================
INSERT INTO areas (id, region_id, code, name_ar, name_en, created_at) VALUES
('ar111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', 'NORTH_RIYADH', 'شمال الرياض', 'North Riyadh', NOW() - INTERVAL '95 days'),
('ar222222-2222-2222-2222-222222222222', 'r1111111-1111-1111-1111-111111111111', 'SOUTH_RIYADH', 'جنوب الرياض', 'South Riyadh', NOW() - INTERVAL '95 days'),
('ar333333-3333-3333-3333-333333333333', 'r2222222-2222-2222-2222-222222222222', 'NORTH_JEDDAH', 'شمال جدة', 'North Jeddah', NOW() - INTERVAL '95 days'),
('ar444444-4444-4444-4444-444444444444', 'r3333333-3333-3333-3333-333333333333', 'DAMMAM', 'الدمام', 'Dammam', NOW() - INTERVAL '95 days');

-- ============================================
-- COMMITTEES
-- ============================================
INSERT INTO committees (id, code, level, region_id, area_id, name_ar, name_en, description_ar, description_en, created_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'PR_COMMITTEE', 'AREA',
 'r1111111-1111-1111-1111-111111111111', 'ar111111-1111-1111-1111-111111111111',
 'لجنة العلاقات العامة', 'Public Relations Committee',
 'مسؤولة عن العلاقات العامة والتواصل', 'Responsible for public relations and communication',
 NOW() - INTERVAL '90 days'),
('c2222222-2222-2222-2222-222222222222', 'EDU_COMMITTEE', 'REGIONAL',
 'r1111111-1111-1111-1111-111111111111', NULL,
 'لجنة التوعية', 'Education Committee',
 'مسؤولة عن التوعية والتعليم', 'Responsible for education and awareness',
 NOW() - INTERVAL '85 days'),
('c3333333-3333-3333-3333-333333333333', 'DAMMAM_PR', 'AREA',
 'r3333333-3333-3333-3333-333333333333', 'ar444444-4444-4444-4444-444444444444',
 'لجنة العلاقات العامة - الدمام', 'Public Relations Committee - Dammam',
 null, null,
 NOW() - INTERVAL '80 days');

-- ============================================
-- COMMITTEE MEMBERSHIPS
-- ============================================
INSERT INTO committee_memberships (committee_id, user_id, role_in_committee, assigned_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'MANAGER', NOW() - INTERVAL '30 days'),
('c1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'SECRETARY', NOW() - INTERVAL '30 days'),
('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'MANAGER', NOW() - INTERVAL '60 days');

-- ============================================
-- RECOVERY MEETINGS
-- ============================================
INSERT INTO recovery_meetings (
    id, region_id, area_id, name_ar, name_en, description_ar, description_en,
    language, gender, format, city, district, day_of_week, start_time, end_time,
    meeting_link, latitude, longitude, location, address_ar, address_en,
    organizer_name, organizer_phone, status, created_by_id, created_at
) VALUES
-- In-person, published
('m1111111-1111-1111-1111-111111111111',
 'r1111111-1111-1111-1111-111111111111', 'ar111111-1111-1111-1111-111111111111',
 'اجتماع الرياض الأسبوعي', 'Riyadh Weekly Meeting', 'اجتماع أسبوعي مفتوح للجميع',
 'Weekly open meeting for all',
 'BILINGUAL', 'MIXED', 'IN_PERSON', 'الرياض', 'العليا',
 'MONDAY', '19:00', '21:00',
 NULL, 24.7136, 46.6753, ST_SetSRID(ST_MakePoint(46.6753, 24.7136), 4326),
 'شارع الملك فهد، العليا', 'King Fahd Road, Al Olaya',
 'أحمد المنظم', '+966501234567', 'PUBLISHED',
 'a6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '10 days'),

-- Online, published
('m2222222-2222-2222-2222-222222222222',
 'r2222222-2222-2222-2222-222222222222', 'ar333333-3333-3333-3333-333333333333',
 'اجتماع جدة الافتراضي', 'Jeddah Virtual Meeting', NULL,
 'Online meeting via Zoom',
 'ARABIC', 'MALE', 'ONLINE', 'جدة', NULL,
 'WEDNESDAY', '20:00', '21:30',
 'https://zoom.us/j/123456789', NULL, NULL, NULL,
 NULL, NULL,
 NULL, NULL, 'PUBLISHED',
 'a6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '7 days'),

-- Hybrid, published
('m3333333-3333-3333-3333-333333333333',
 'r3333333-3333-3333-3333-333333333333', 'ar444444-4444-4444-4444-444444444444',
 'اجتماع الدمام', 'Dammam Recovery Meeting', 'اجتماع تعافي في الدمام',
 'Recovery meeting in Dammam',
 'ENGLISH', 'FEMALE', 'HYBRID', 'الدمام', 'الشاطئ',
 'FRIDAY', '17:00', '19:00',
 'https://meet.google.com/abc-defg-hij', 26.4207, 50.0888,
 ST_SetSRID(ST_MakePoint(50.0888, 26.4207), 4326),
 'شارع الكورنيش، الشاطئ', 'Corniche Street, Al Shatie',
 'منيرة المنسقة', '+966559876543', 'PUBLISHED',
 'a6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '5 days'),

-- Draft (not yet public)
('m4444444-4444-4444-4444-444444444444',
 'r1111111-1111-1111-1111-111111111111', 'ar222222-2222-2222-2222-222222222222',
 'اجتماع جنوب الرياض', 'South Riyadh Meeting', NULL, NULL,
 'ARABIC', 'MIXED', 'IN_PERSON', 'الرياض', 'النرجس',
 'SATURDAY', '18:00', '20:00',
 NULL, 24.6000, 46.7000, ST_SetSRID(ST_MakePoint(46.7000, 24.6000), 4326),
 'حي النرجس', 'Al Narjis District',
 NULL, NULL, 'DRAFT',
 'a6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '2 days'),

-- Archived
('m5555555-5555-5555-5555-555555555555',
 'r1111111-1111-1111-1111-111111111111', 'ar111111-1111-1111-1111-111111111111',
 'اجتماع سابق', 'Previous Meeting', NULL, NULL,
 'BILINGUAL', 'MALE', 'IN_PERSON', 'الرياض', 'الملقا',
 'SUNDAY', '16:00', '18:00',
 NULL, 24.7500, 46.6300, ST_SetSRID(ST_MakePoint(46.6300, 24.7500), 4326),
 'حي الملقا', 'Al Malqa District',
 NULL, NULL, 'ARCHIVED',
 'a6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '60 days');

-- ============================================
-- IN-SERVICE MEETINGS
-- ============================================
INSERT INTO in_service_meetings (
    id, committee_id, title_ar, title_en, description, meeting_date,
    start_time, end_time, mom, notes, status, created_by_id,
    approved_by_id, rejection_comments, created_at
) VALUES
-- Approved
('is111111-1111-1111-1111-111111111111',
 'c1111111-1111-1111-1111-111111111111',
 'اجتماع اللجنة الشهري', 'Monthly Committee Meeting',
 'مناقشة خطة الربع القادم',
 '2026-04-15', '10:00', '12:00',
 'تم الاتفاق على زيادة عدد الاجتماعات الأسبوعية وتعيين منسقين جدد',
 NULL, 'APPROVED',
 'a5555555-5555-5555-5555-555555555555',
 'a4444444-4444-4444-4444-444444444444',
 NULL, NOW() - INTERVAL '20 days'),

-- Pending
('is222222-2222-2222-2222-222222222222',
 'c1111111-1111-1111-1111-111111111111',
 'ورشة عمل التوعية', 'Awareness Workshop',
 'ورشة عمل للمجتمع المحلي',
 '2026-05-01', '09:00', '14:00',
 'تم تحضير المواد التعليمية وتحديد المتحدثين',
 'يحتاج موافقة الميزانية', 'PENDING',
 'a5555555-5555-5555-5555-555555555555',
 NULL, NULL, NOW() - INTERVAL '3 days'),

-- Rejected
('is333333-3333-3333-3333-333333333333',
 'c2222222-2222-2222-2222-222222222222',
 'اجتماع غير مكتمل', 'Incomplete Meeting',
 NULL,
 '2026-03-20', '14:00', '15:00',
 'مسودة أولية',
 NULL, 'REJECTED',
 'a5555555-5555-5555-5555-555555555555',
 NULL,
 'البيانات غير مكتملة، يرجى إعادة التقديم مع تفاصيل الأنشطة',
 NOW() - INTERVAL '15 days'),

-- Draft
('is444444-4444-4444-4444-444444444444',
 'c3333333-3333-3333-3333-333333333333',
 'اجتماع الدمام القادم', 'Dammam Upcoming Meeting',
 NULL,
 '2026-06-10', '11:00', '13:00',
 'قيد التحضير',
 NULL, 'DRAFT',
 'a5555555-5555-5555-5555-555555555555',
 NULL, NULL, NOW() - INTERVAL '1 day');

-- ============================================
-- IN-SERVICE MEETING ACTIVITIES
-- ============================================
INSERT INTO in_service_meeting_activities (in_service_meeting_id, description_ar, description_en, assigned_to, target_date, priority, sort_order) VALUES
('is111111-1111-1111-1111-111111111111', 'إعداد التقرير الشهري', 'Prepare monthly report', 'نورة', '2026-04-20', 'HIGH', 1),
('is111111-1111-1111-1111-111111111111', 'تحديث قائمة الحضور', 'Update attendance list', 'أحمد', '2026-04-18', 'MEDIUM', 2),
('is222222-2222-2222-2222-222222222222', 'تصميم المواد التوعوية', 'Design awareness materials', 'فريق التصميم', '2026-04-25', 'HIGH', 1),
('is222222-2222-2222-2222-222222222222', 'حجز القاعة', 'Book the venue', 'الإدارة', '2026-04-20', 'CRITICAL', 2),
('is222222-2222-2222-2222-222222222222', 'إرسال الدعوات', 'Send invitations', 'نورة', '2026-04-22', 'MEDIUM', 3);

-- ============================================
-- IN-SERVICE MEETING APPROVAL HISTORY
-- ============================================
INSERT INTO in_service_meeting_approval_history (in_service_meeting_id, action, performed_by_id, comments, previous_status, new_status, performed_at) VALUES
('is111111-1111-1111-1111-111111111111', 'SUBMITTED', 'a5555555-5555-5555-5555-555555555555', NULL, 'DRAFT', 'PENDING', NOW() - INTERVAL '18 days'),
('is111111-1111-1111-1111-111111111111', 'APPROVED', 'a4444444-4444-4444-4444-444444444444', 'موافق عليه، عمل ممتاز', 'PENDING', 'APPROVED', NOW() - INTERVAL '17 days'),
('is333333-3333-3333-3333-333333333333', 'SUBMITTED', 'a5555555-5555-5555-5555-555555555555', NULL, 'DRAFT', 'PENDING', NOW() - INTERVAL '14 days'),
('is333333-3333-3333-3333-333333333333', 'REJECTED', 'a4444444-4444-4444-4444-444444444444', 'البيانات غير مكتملة', 'PENDING', 'REJECTED', NOW() - INTERVAL '13 days'),
('is222222-2222-2222-2222-222222222222', 'SUBMITTED', 'a5555555-5555-5555-5555-555555555555', NULL, 'DRAFT', 'PENDING', NOW() - INTERVAL '3 days');

-- ============================================
-- RESOURCE CATEGORIES
-- ============================================
INSERT INTO resource_categories (id, code, name_ar, name_en, sort_order) VALUES
('rc111111-1111-1111-1111-111111111111', 'LITERATURE', 'الأدبيات', 'Literature', 1),
('rc222222-2222-2222-2222-222222222222', 'GUIDES', 'الأدلة الإرشادية', 'Guides', 2),
('rc333333-3333-3333-3333-333333333333', 'FORMS', 'النماذج', 'Forms', 3),
('rc444444-4444-4444-4444-444444444444', 'RESEARCH', 'الأبحاث', 'Research', 4);

-- ============================================
-- RESOURCES
-- ============================================
INSERT INTO resources (
    id, category_id, title_ar, title_en, description_ar, description_en,
    file_path, file_name, file_mime_type, file_size_bytes, is_public, download_count, created_at
) VALUES
('res11111-1111-1111-1111-111111111111',
 'rc111111-1111-1111-1111-111111111111',
 'دليل الخطوات الاثنتي عشرة', 'The Twelve Steps Guide',
 'دليل شامل للخطوات الاثنتي عشرة',
 'Comprehensive guide to the twelve steps',
 'resources/literature/12-steps-ar.pdf', '12-steps-ar.pdf',
 'application/pdf', 2457600, true, 342, NOW() - INTERVAL '30 days'),

('res22222-2222-2222-2222-222222222222',
 'rc222222-2222-2222-2222-222222222222',
 'دليل الأسرة', 'Family Guide',
 'كيف تدعم أسرتك',
 'How to support your family member',
 'resources/guides/family-guide.pdf', 'family-guide.pdf',
 'application/pdf', 1843200, true, 189, NOW() - INTERVAL '25 days'),

('res33333-3333-3333-3333-333333333333',
 'rc333333-3333-3333-3333-333333333333',
 'نموذج التسجيل', 'Registration Form',
 'نموذج تسجيل عضو جديد',
 'New member registration form',
 'resources/forms/registration.docx', 'registration.docx',
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 51200, true, 78, NOW() - INTERVAL '20 days'),

('res44444-4444-4444-4444-444444444444',
 'rc444444-4444-4444-4444-444444444444',
 'بحث فعالية العلاج', 'Treatment Effectiveness Research',
 'دراسة حول فعالية برامج العلاج',
 'Study on treatment program effectiveness',
 'resources/research/treatment-2025.pdf', 'treatment-2025.pdf',
 'application/pdf', 5242880, true, 56, NOW() - INTERVAL '10 days');

-- ============================================
-- CONTACT SUBMISSIONS
-- ============================================
INSERT INTO contact_submissions (
    id, name, email, phone, subject, message, status,
    internal_notes, assigned_committee_code, ip_address, created_at
) VALUES
('ct111111-1111-1111-1111-111111111111',
 'عبدالله محمد', 'abdullah@email.com', '+966501111111',
 'استفسار عن الاجتماعات', 'أريد معرفة مواعيد الاجتماعات في الرياض',
 'RESOLVED', 'تم إرسال جدول الاجتماعات', 'PR_COMMITTEE',
 '203.0.113.10', NOW() - INTERVAL '15 days'),

('ct222222-2222-2222-2222-222222222222',
 'Sarah Johnson', 'sarah.j@email.com', NULL,
 'Volunteer Inquiry', 'I would like to volunteer as a translator for English materials',
 'IN_PROGRESS', 'Forwarded to content team', 'PR_COMMITTEE',
 '198.51.100.20', NOW() - INTERVAL '7 days'),

('ct333333-3333-3333-3333-333333333333',
 'خالد العمري', 'khaled.a@email.com', '+966552222222',
 'طلب مساعدة', 'أحتاج مساعدة في العثور على اجتماع في جدة',
 'NEW', NULL, 'PR_COMMITTEE',
 '203.0.113.30', NOW() - INTERVAL '2 days'),

('ct444444-4444-4444-4444-444444444444',
 'نورة السالم', 'noura.s@email.com', '+966543333333',
 'اقتراح', 'أقترح إضافة اجتماعات نسائية في المنطقة الشرقية',
 'NEW', NULL, NULL,
 '198.51.100.40', NOW() - INTERVAL '1 day'),

('ct555555-5555-5555-5555-555555555555',
 'Faisal Al-Rashid', 'faisal.r@email.com', '+966504444444',
 'Technical Issue', 'The map is not loading on mobile Safari',
 'IN_PROGRESS', 'Reproduced, assigned to dev team', NULL,
 '203.0.113.50', NOW() - INTERVAL '5 hours');

-- ============================================
-- REPORTS
-- ============================================
INSERT INTO reports (
    id, type, status, approval_required, filters, file_path, file_name,
    file_mime_type, file_size_bytes, created_by_id, approved_by_id, created_at
) VALUES
('rpt11111-1111-1111-1111-111111111111',
 'MEETING_SUMMARY', 'READY', false,
 '{"region_id": "r1111111-1111-1111-1111-111111111111", "date_range": "2026-Q1"}',
 'reports/meeting-summary-q1-2026.pdf', 'meeting-summary-q1-2026.pdf',
 'application/pdf', 1048576,
 'a4444444-4444-4444-4444-444444444444',
 'a1111111-1111-1111-1111-111111111111',
 NOW() - INTERVAL '20 days'),

('rpt22222-2222-2222-2222-222222222222',
 'USER_ACTIVITY', 'APPROVED', true,
 '{"date_range": "2026-03"}',
 'reports/user-activity-march-2026.xlsx', 'user-activity-march-2026.xlsx',
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
 524288,
 'a1111111-1111-1111-1111-111111111111',
 'a1111111-1111-1111-1111-111111111111',
 NOW() - INTERVAL '10 days'),

('rpt33333-3333-3333-3333-333333333333',
 'ACTIVITY_REPORT', 'GENERATING', false,
 '{"committee_id": "c1111111-1111-1111-1111-111111111111"}',
 NULL, NULL, NULL, NULL,
 'a5555555-5555-5555-5555-555555555555',
 NULL,
 NOW() - INTERVAL '1 hour'),

('rpt44444-4444-4444-4444-444444444444',
 'RESOURCE_USAGE', 'FAILED', false,
 '{"date_range": "2026-Q1"}',
 NULL, NULL, NULL, NULL,
 'a7777777-7777-7777-7777-777777777777',
 NULL,
 NOW() - INTERVAL '3 hours'),

('rpt55555-5555-5555-5555-555555555555',
 'AUDIT_TRAIL_EXTRACT', 'PENDING', true,
 '{"date_range": "2026-03", "resource_types": ["recovery_meeting", "in_service_meeting"]}',
 NULL, NULL, NULL, NULL,
 'a1111111-1111-1111-1111-111111111111',
 NULL,
 NOW() - INTERVAL '30 minutes');

-- ============================================
-- REPORT REQUESTS
-- ============================================
INSERT INTO report_requests (report_id, requested_by_id, status, started_at, completed_at) VALUES
('rpt11111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'COMPLETED',
 NOW() - INTERVAL '20 days' + INTERVAL '1 minute', NOW() - INTERVAL '20 days' + INTERVAL '5 minutes'),
('rpt33333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'PROCESSING',
 NOW() - INTERVAL '1 hour', NULL),
('rpt44444-4444-4444-4444-444444444444', 'a7777777-7777-7777-7777-777777777777', 'FAILED',
 NOW() - INTERVAL '3 hours' + INTERVAL '1 minute', NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes');

-- ============================================
-- CHATBOT INTERACTION LOGS
-- ============================================
INSERT INTO chatbot_interaction_logs (
    session_id, channel, user_message, bot_response, intent, context_used, locale,
    ip_address, response_time_ms, created_at
) VALUES
('sess-001', 'WEB', 'ما هي مواعيد الاجتماعات في الرياض؟',
 'هناك 3 اجتماعات متاحة في الرياض. اجتماع أسبوعي يوم الاثنين في العليا من 7-9 مساءً.',
 'MEETING_SEARCH', '{"meeting_ids": ["m1111111-1111-1111-1111-111111111111"]}',
 'ar', '203.0.113.10', 1200, NOW() - INTERVAL '2 hours'),

('sess-001', 'WEB', 'هل هناك اجتماعات أونلاين؟',
 'نعم، هناك اجتماع افتراضي في جدة يوم الأربعاء. يمكنك الانضمام عبر الرابط المتاح.',
 'MEETING_SEARCH', '{"meeting_ids": ["m2222222-2222-2222-2222-222222222222"]}',
 'ar', '203.0.113.10', 950, NOW() - INTERVAL '2 hours' + INTERVAL '3 minutes'),

('sess-002', 'WEB', 'What are the twelve steps?',
 'The Twelve Steps are a set of principles that guide recovery. You can download our comprehensive guide from the Resources section.',
 'FAQ', '{"faq_ids": ["faq-12-steps"]}',
 'en', '198.51.100.20', 800, NOW() - INTERVAL '1 hour'),

('sess-003', 'WEB', 'كيف أتواصل معكم؟',
 'يمكنك استخدام نموذج الاتصال المتاح في صفحة "اتصل بنا" وسنرد عليك في أقرب وقت.',
 'CONTACT_FALLBACK', '{}',
 'ar', '203.0.113.30', 600, NOW() - INTERVAL '30 minutes'),

('sess-004', 'MOBILE', 'Are there meetings near me?',
 'I need your location to find nearby meetings. Please enable location services or tell me your city.',
 'MEETING_SEARCH', '{}',
 'en', '198.51.100.50', 500, NOW() - INTERVAL '10 minutes');

-- ============================================
-- AUDIT LOGS
-- ============================================
INSERT INTO audit_logs (
    user_id, user_role_snapshot, action, resource_type, resource_id,
    http_method, path, ip_address, correlation_id, before_state, after_state, timestamp
) VALUES
-- Recovery meeting published
('a6666666-6666-6666-6666-666666666666', 'MEETING_EDITOR', 'STATUS_CHANGED',
 'recovery_meeting', 'm1111111-1111-1111-1111-111111111111',
 'POST', '/api/v1/admin/recovery-meetings/m1111111-1111-1111-1111-111111111111/publish',
 '203.0.113.10', 'corr-001',
 '{"status": "DRAFT"}', '{"status": "PUBLISHED"}',
 NOW() - INTERVAL '10 days'),

-- In-service meeting submitted
('a5555555-5555-5555-5555-555555555555', 'COMMITTEE_SECRETARY', 'SUBMITTED',
 'in_service_meeting', 'is111111-1111-1111-1111-111111111111',
 'POST', '/api/v1/admin/in-service-meetings/is111111-1111-1111-1111-111111111111/submit',
 '203.0.113.20', 'corr-002',
 '{"status": "DRAFT"}', '{"status": "PENDING"}',
 NOW() - INTERVAL '18 days'),

-- In-service meeting approved
('a4444444-4444-4444-4444-444444444444', 'COMMITTEE_MANAGER', 'APPROVED',
 'in_service_meeting', 'is111111-1111-1111-1111-111111111111',
 'POST', '/api/v1/admin/in-service-meetings/is111111-1111-1111-1111-111111111111/approve',
 '203.0.113.20', 'corr-003',
 '{"status": "PENDING"}', '{"status": "APPROVED", "approved_by": "a4444444-4444-4444-4444-444444444444"}',
 NOW() - INTERVAL '17 days'),

-- In-service meeting rejected
('a4444444-4444-4444-4444-444444444444', 'COMMITTEE_MANAGER', 'REJECTED',
 'in_service_meeting', 'is333333-3333-3333-3333-333333333333',
 'POST', '/api/v1/admin/in-service-meetings/is333333-3333-3333-3333-333333333333/reject',
 '203.0.113.20', 'corr-004',
 '{"status": "PENDING"}', '{"status": "REJECTED", "rejection_comments": "البيانات غير مكتملة"}',
 NOW() - INTERVAL '13 days'),

-- Contact submission status changed
('a1111111-1111-1111-1111-111111111111', 'SUPER_ADMIN', 'CONTACT_STATUS_CHANGED',
 'contact_submission', 'ct111111-1111-1111-1111-111111111111',
 'PATCH', '/api/v1/admin/contact-submissions/ct111111-1111-1111-1111-111111111111',
 '203.0.113.10', 'corr-005',
 '{"status": "IN_PROGRESS"}', '{"status": "RESOLVED", "internal_notes": "تم إرسال جدول الاجتماعات"}',
 NOW() - INTERVAL '12 days'),

-- Access denied attempt
('a8888888-8888-8888-8888-888888888888', 'INACTIVE', 'ACCESS_DENIED',
 'in_service_meeting', NULL,
 'GET', '/api/v1/admin/in-service-meetings',
 '198.51.100.99', 'corr-006',
 NULL, NULL,
 NOW() - INTERVAL '1 day'),

-- User login
('a1111111-1111-1111-1111-111111111111', 'SUPER_ADMIN', 'LOGIN',
 'user', 'a1111111-1111-1111-1111-111111111111',
 'POST', '/api/v1/auth/google/callback',
 '203.0.113.10', 'corr-007',
 NULL, NULL,
 NOW() - INTERVAL '5 hours'),

-- Report generated
('a5555555-5555-5555-5555-555555555555', 'COMMITTEE_SECRETARY', 'REPORT_RUN',
 'report', 'rpt33333-3333-3333-3333-333333333333',
 'POST', '/api/v1/admin/reports/rpt33333-3333-3333-3333-333333333333/run',
 '203.0.113.20', 'corr-008',
 '{"status": "DRAFT"}', '{"status": "GENERATING"}',
 NOW() - INTERVAL '1 hour'),

-- Chatbot query
(NULL, NULL, 'CHATBOT_QUERY',
 'chatbot_interaction', NULL,
 'POST', '/api/v1/public/chatbot/query',
 '203.0.113.10', 'corr-009',
 NULL, '{"intent": "MEETING_SEARCH", "locale": "ar"}',
 NOW() - INTERVAL '2 hours'),

-- Resource created
('a7777777-7777-7777-7777-777777777777', 'CONTENT_EDITOR', 'CREATED',
 'resource', 'res44444-4444-4444-4444-444444444444',
 'POST', '/api/v1/admin/resources',
 '203.0.113.30', 'corr-010',
 NULL, '{"title_en": "Treatment Effectiveness Research", "category": "RESEARCH"}',
 NOW() - INTERVAL '10 days');
