'''
# Contributing to the RHTI Portal

This document outlines the development principles and architectural guidelines for contributing to the RHTI Portal. The goal is to create a modern, student-centric application that is both user-friendly and easy to maintain.

## Student-Centered Architecture

The core principle of the portal is a **student-centric design**. Every piece of data and every action within the system should revolve around the student. The student record is the central hub of the application.

- **Central Student Record:** The `portal_students` table is the heart of the system. All other data, such as enrollments, fees, grades, and attendance, must have a direct relationship with the student record.
- **Implicit Relationships:** When a student is assigned to a program, this action should automatically create all the necessary underlying relationships, such as enrolling the student in the program's courses and generating the initial fee structure.

## Modern User Interface

The portal will feature a modern user interface built with **shadcn-ui** components to ensure a consistent and visually appealing user experience.

### Tables

- **shadcn-ui Tables:** All tabular data should be displayed using shadcn-ui's table components.
- **Action Dropdowns:** Each row in a table should have an "Actions" dropdown menu that contains all the possible operations for that record (e.g., Edit, Delete, View Details).
- **Consistent Status Indicators:** Status columns (e.g., "Onboarding Status," "Payment Status") should use a consistent set of three statuses where possible: `Pending`, `In Progress`, and `Completed`.

### Forms

- **Modal Forms:** All forms for creating or editing data should be presented in a modal dialog. This keeps the user in the context of the current page and provides a more fluid experience.
- **Cascading Dropdowns:** Forms with dependent fields (e.g., selecting a program and then a cohort) should use cascading dropdowns to guide the user through the selection process.

## The Student Dashboard

The **Student Dashboard** is the single most important page in the application. It is the central hub for managing every aspect of a student's lifecycle, from onboarding to graduation.

The dashboard should be designed as a clean, well-organized page, with distinct sections for each area of the student's information.

### Onboarding

The student's journey begins with onboarding. This process should be managed from the student dashboard and should include:

- **Document Uploads:** A section for uploading all required documents, such as:
    - Education Certificates
    - Signed Acceptance Letter
    - National ID/Passport
- **Onboarding Checklist:** A checklist to track the completion of all onboarding tasks.

### Lifecycle Management

Once onboarding is complete, the student dashboard will be used to manage all other aspects of the student's lifecycle, including:

- **Bio-Data:** Personal details, contact information, and next of kin.
- **Program Enrollment:** Assigning the student to a program and cohort.
- **Fee Management:** Viewing the fee structure, tracking payments, and seeing the current balance.
- **Classes and Timetables:** Displaying the student's class schedule.
- **Exams and Results:** Showing upcoming exam dates and past results.

## Development Workflow

1. **Update the `CONTRIBUTING.md`:** Before starting a new feature, ensure that the plan is documented in this file.
2. **Feature Branches:** Create a new branch for each new feature.
3. **Pull Requests:** Once a feature is complete, submit a pull request for review.



'''

complete this changes

read the READme i want to change the implementaion of th portal , both admin and student 

i want to tighten it to make evry thing sorround the student so that the relation ship ensure assigning a student to a programe assigne the relation ship alos

change the form  and tables design and layout and use modern shadcn table with reall action dropdown with - status columns to have on;y 3 status where requied 

form should open in model and where a ca cade dropdown is required for smoe seletion  you can implemnet fom with a fomr pop up modal 

the student dashabord is where everything happens, 

TH journ start on onbaordng-student documents are uploadedand inlcusing eduction certificate, signed acceptane letter

one onaboarding is complete ,now the assisgnement of other area can be done based on the program-THis is all done in single page studen dahsabord

forms should be moda forms -and the records should 

the student dashabor  should be nice pdf page with section of the student detas from bio , programs, fees, Cllasses, exam , and required status

use moderf layout 