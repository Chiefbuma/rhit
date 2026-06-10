
-- Create the portal_students table
CREATE TABLE IF NOT EXISTS portal_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_programs table
CREATE TABLE IF NOT EXISTS portal_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_cohorts table
CREATE TABLE IF NOT EXISTS portal_cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    program_id UUID NOT NULL REFERENCES portal_programs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_student_enrollments table
CREATE TABLE IF NOT EXISTS portal_student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES portal_students(id),
    program_id UUID NOT NULL REFERENCES portal_programs(id),
    cohort_id UUID NOT NULL REFERENCES portal_cohorts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_student_onboarding table
CREATE TABLE IF NOT EXISTS portal_student_onboarding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES portal_students(id),
    has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    program VARCHAR(255) NOT NULL,
    kcse_mean_grade VARCHAR(10) NOT NULL,
    kcse_year INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_users table
CREATE TABLE IF NOT EXISTS portal_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_sessions table
CREATE TABLE IF NOT EXISTS portal_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the portal_roles table
CREATE TABLE IF NOT EXISTS portal_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create the portal_permissions table
CREATE TABLE IF NOT EXISTS portal_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_key VARCHAR(255) NOT NULL UNIQUE
);

-- Create the portal_user_roles table
CREATE TABLE IF NOT EXISTS portal_user_roles (
    user_id UUID NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES portal_roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create the portal_role_permissions table
CREATE TABLE IF NOT EXISTS portal_role_permissions (
    role_id UUID NOT NULL REFERENCES portal_roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES portal_permissions(id) ON DELETE CASCADE,
    allowed BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (role_id, permission_id)
);
