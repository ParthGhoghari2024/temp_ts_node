-- CREATE DATABASE
CREATE DATABASE exam_management_30_4;

USE exam_management_30_4;

-- CREATE TABLES
CREATE TABLE
    roles (
        id int PRIMARY KEY AUTO_INCREMENT,
        role varchar(255) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );


create table
    users (
        id int PRIMARY KEY AUTO_INCREMENT,
        role_id int NOT NULL DEFAULT '2',
        fname varchar(255) NOT NULL,
        lname varchar(255) NOT NULL,
        email varchar(255) UNIQUE KEY NOT NULL,
        dob DATE NOT NULL,
        phone_no varchar(15) NOT NULL,
        address text,   
        city varchar(100),
        state varchar(100) ,
        zipcode varchar(10) ,
        password varchar(255)  NOT NULL,
        about TEXT,
        activation_code varchar(255) NOT NULL,
        activation_status TINYINT NOT NULL DEFAULT '0',
        FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        token_created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    login_logs (
        id int PRIMARY KEY AUTO_INCREMENT,
        user_id  int NOT NULL,
        is_success tinyint DEFAULT '0',
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        attempted_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    );


create table
    permissions (
       id int PRIMARY KEY AUTO_INCREMENT,
        permission varchar(255) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
       updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    role_has_permissions (
        id int PRIMARY KEY AUTO_INCREMENT,
        role_id int NOT NULL,
        permission_id int NOT NULL,
        FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(permission_id) REFERENCES permissions(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    exam_details (
        id int PRIMARY KEY AUTO_INCREMENT,
        creater_id  int NOT NULL,
        title varchar(255) NOT NULL,
        start_time timestamp NOT NULL,
        duration_minute int NOT NULL,
        total_marks int NOT NULL,
        passing_marks FLOAT NOT NULL,
        instructions TEXT,
        exam_status TINYINT DEFAULT '0'  NOT NULL,
        -- exam_status will be 1 once questions are inserted
        exam_activation_code varchar(255) NOT NULL,
        isDeleted TINYINT DEFAULT '0'  NOT NULL,
        FOREIGN KEY(creater_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    difficulty_levels (
        id int PRIMARY KEY AUTO_INCREMENT,
        difficulty varchar(255) NOT NULL,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    exam_topics (
       id int PRIMARY KEY AUTO_INCREMENT,
        topic varchar(255) NOT NULL,
        is_deleted TINYINT DEFAULT '0',
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    questions (
        id int PRIMARY KEY AUTO_INCREMENT,
        exam_id int NOT NULL,
        difficulty_id int NOT NULL,
        topic_id int NOT NULL,
        questions TEXT NOT NULL,
        score int DEFAULT '1' NOT NULL,
        isDeleted BOOLEAN default false NOT NULL,
        FOREIGN KEY(exam_id) REFERENCES exam_details(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(difficulty_id) REFERENCES difficulty_levels(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(topic_id) REFERENCES exam_topics(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
     options(
        id int PRIMARY KEY AUTO_INCREMENT,
        question_id int NOT NULL,
        option_value varchar(255) NOT NULL,
        isAnswer TINYINT DEFAULT '0',
        isDeleted BOOLEAN DEFAULT false NOT NULL,
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    results (
        id int PRIMARY KEY AUTO_INCREMENT,
        exam_id int NOT NULL,
        user_id int NOT NULL,
        marks FLOAT  NOT NULL,
        FOREIGN KEY(exam_id) REFERENCES exam_details(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    instructor_feedbacks (
        id int PRIMARY KEY AUTO_INCREMENT,
        student_id int NOT NULL,
        exam_id int NOT NULL,
        instructor_id int NOT NULL,
        feedback text NOT NULL,
        FOREIGN KEY(exam_id) REFERENCES exam_details(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(instructor_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    user_answers (
        id int PRIMARY KEY AUTO_INCREMENT,
        user_id int NOT NULL,
        exam_id int NOT NULL,
        question_id int NOT NULL,
        answer_id int NULL,
        FOREIGN KEY(exam_id) REFERENCES exam_details(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(answer_id) REFERENCES options(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
    user_examtimes (
        id int PRIMARY KEY AUTO_INCREMENT,
        user_id int NOT NULL,
        exam_id int NOT NULL,
        starttime timestamp NOT NULL,
        endtime timestamp NULL,
        FOREIGN KEY(exam_id) REFERENCES exam_details(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table 
    user_profile_images(
        id int PRIMARY KEY AUTO_INCREMENT,
        user_id int NOT NULL,
        image_path varchar(255),
        actual_name varchar(255),
        current_name varchar(255),
        active_profile TINYINT ,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );

create table
     CSVFiles(
        id int PRIMARY KEY AUTO_INCREMENT,
        exam_id int NOT NULL,
        admin_id int NOT NULL,
        original_filename varchar(255) NOT NULL,
        new_filename varchar(255) NOT NULL,
        path varchar(255) NOT NULL,
        isDeleted BOOLEAN default false NOT NULL,
        FOREIGN KEY(exam_id) REFERENCES exam_details(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY(admin_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
    );


