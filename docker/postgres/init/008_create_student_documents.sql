CREATE TABLE portal_student_documents (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES portal_students(id),
    document_type VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
