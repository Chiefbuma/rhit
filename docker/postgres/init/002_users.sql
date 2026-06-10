
-- Create roles
INSERT INTO portal_roles (name) VALUES ('admin'), ('student') ON CONFLICT (name) DO NOTHING;

-- Create permissions
INSERT INTO portal_permissions (permission_key) VALUES ('portal.admin'), ('portal.student') ON CONFLICT (permission_key) DO NOTHING;

-- Assign permissions to roles
DO $$
DECLARE
    admin_role_id UUID;
    student_role_id UUID;
    admin_permission_id UUID;
    student_permission_id UUID;
BEGIN
    -- Get role and permission IDs
    SELECT id INTO admin_role_id FROM portal_roles WHERE name = 'admin';
    SELECT id INTO student_role_id FROM portal_roles WHERE name = 'student';
    SELECT id INTO admin_permission_id FROM portal_permissions WHERE permission_key = 'portal.admin';
    SELECT id INTO student_permission_id FROM portal_permissions WHERE permission_key = 'portal.student';

    -- Assign permissions to admin role
    INSERT INTO portal_role_permissions (role_id, permission_id, allowed) VALUES (admin_role_id, admin_permission_id, true) ON CONFLICT DO NOTHING;

    -- Assign permissions to student role
    INSERT INTO portal_role_permissions (role_id, permission_id, allowed) VALUES (student_role_id, student_permission_id, true) ON CONFLICT DO NOTHING;
END;
$$;

-- Create users
INSERT INTO portal_users (full_name, email, password_hash, status)
VALUES
    ('Admin User', 'admin@rhti.local', 'scrypt:c96c2122b9787e3f:942b0c51f434024891153f3e2e038e815e12e1a38b3da7e18981f951a31622f6720f780e903c734b4656134b223cde210633333332353a433945444133373539', 'active'),
    ('Student User', 'student@rhti.local', 'scrypt:5d638914f6b3014a:b6f4886566432b0d5c0f169f4530514e6b52a13898628b05423f8510842e2b9c737088450146b281b373809618b111e138343943333939333941324330313430', 'active')
ON CONFLICT (email) DO NOTHING;

-- Assign roles to users
DO $$
DECLARE
    admin_user_id UUID;
    student_user_id UUID;
    admin_role_id UUID;
    student_role_id UUID;
BEGIN
    -- Get user and role IDs
    SELECT id INTO admin_user_id FROM portal_users WHERE email = 'admin@rhti.local';
    SELECT id INTO student_user_id FROM portal_users WHERE email = 'student@rhti.local';
    SELECT id INTO admin_role_id FROM portal_roles WHERE name = 'admin';
    SELECT id INTO student_role_id FROM portal_roles WHERE name = 'student';

    -- Assign roles to users
    INSERT INTO portal_user_roles (user_id, role_id) VALUES (admin_user_id, admin_role_id) ON CONFLICT DO NOTHING;
    INSERT INTO portal_user_roles (user_id, role_id) VALUES (student_user_id, student_role_id) ON CONFLICT DO NOTHING;
END;
$$;
