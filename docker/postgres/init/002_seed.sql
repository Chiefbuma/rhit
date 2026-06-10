
-- Seed the applications table
INSERT INTO applications (full_name, email, phone, date_of_birth, program, kcse_mean_grade, kcse_year, status)
VALUES
  ('John Doe', 'john.doe@example.com', '123-456-7890', '1995-01-15', 'Computer Science', 'A', 2013, 'new'),
  ('Jane Smith', 'jane.smith@example.com', '987-654-3210', '1998-05-20', 'Software Engineering', 'A-', 2016, 'new'),
  ('Peter Jones', 'peter.jones@example.com', '555-123-4567', '1997-03-10', 'Information Technology', 'B+', 2015, 'in-progress'),
  ('Mary Williams', 'mary.williams@example.com', '555-987-6543', '1999-11-25', 'Computer Science', 'A', 2017, 'completed');
