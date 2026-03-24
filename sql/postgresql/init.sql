BEGIN;

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    mobile VARCHAR(20),
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_roles_user_role UNIQUE (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE IF NOT EXISTS project_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_project_templates_status ON project_templates (status);

CREATE TABLE IF NOT EXISTS work_order_templates (
    id BIGSERIAL PRIMARY KEY,
    project_template_id BIGINT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    title_template VARCHAR(200) NOT NULL,
    description_template TEXT,
    default_priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    sort_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_work_order_templates_project_template FOREIGN KEY (project_template_id) REFERENCES project_templates (id)
);

CREATE INDEX IF NOT EXISTS idx_work_order_templates_project_template_id ON work_order_templates (project_template_id);
CREATE INDEX IF NOT EXISTS idx_work_order_templates_status ON work_order_templates (status);
CREATE INDEX IF NOT EXISTS idx_work_order_templates_type ON work_order_templates (type);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    project_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    customer_name VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    move_in_at TIMESTAMP,
    rehearsal_at TIMESTAMP,
    move_out_at TIMESTAMP,
    manager_id BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    source_type VARCHAR(30) NOT NULL DEFAULT 'manual',
    template_id BIGINT,
    remark TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_projects_manager FOREIGN KEY (manager_id) REFERENCES users (id),
    CONSTRAINT fk_projects_template FOREIGN KEY (template_id) REFERENCES project_templates (id)
);

CREATE INDEX IF NOT EXISTS idx_projects_event_date ON projects (event_date);
CREATE INDEX IF NOT EXISTS idx_projects_manager_id ON projects (manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);

CREATE TABLE IF NOT EXISTS project_members (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_in_project VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_project_members UNIQUE (project_id, user_id, role_in_project),
    CONSTRAINT fk_project_members_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_project_members_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members (project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members (user_id);

CREATE TABLE IF NOT EXISTS work_orders (
    id BIGSERIAL PRIMARY KEY,
    work_order_no VARCHAR(50) NOT NULL UNIQUE,
    project_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    status VARCHAR(30) NOT NULL DEFAULT 'pending_assign',
    assignee_id BIGINT,
    reviewer_id BIGINT,
    planned_start_at TIMESTAMP,
    planned_end_at TIMESTAMP,
    actual_start_at TIMESTAMP,
    actual_end_at TIMESTAMP,
    description TEXT,
    template_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_work_orders_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_work_orders_assignee FOREIGN KEY (assignee_id) REFERENCES users (id),
    CONSTRAINT fk_work_orders_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id),
    CONSTRAINT fk_work_orders_template FOREIGN KEY (template_id) REFERENCES work_order_templates (id)
);

CREATE INDEX IF NOT EXISTS idx_work_orders_project_id ON work_orders (project_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_assignee_id ON work_orders (assignee_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders (status);
CREATE INDEX IF NOT EXISTS idx_work_orders_type ON work_orders (type);

CREATE TABLE IF NOT EXISTS work_order_logs (
    id BIGSERIAL PRIMARY KEY,
    work_order_id BIGINT NOT NULL,
    action_type VARCHAR(30) NOT NULL,
    operator_id BIGINT,
    content TEXT,
    from_status VARCHAR(30),
    to_status VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_work_order_logs_work_order FOREIGN KEY (work_order_id) REFERENCES work_orders (id),
    CONSTRAINT fk_work_order_logs_operator FOREIGN KEY (operator_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_work_order_logs_work_order_id ON work_order_logs (work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_logs_action_type ON work_order_logs (action_type);

CREATE TABLE IF NOT EXISTS setup_lists (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    template_id BIGINT,
    title VARCHAR(200) NOT NULL,
    project_name_snapshot VARCHAR(200) NOT NULL,
    location_snapshot VARCHAR(255) NOT NULL,
    event_date_snapshot DATE NOT NULL,
    move_in_at_snapshot TIMESTAMP,
    rehearsal_at_snapshot TIMESTAMP,
    move_out_at_snapshot TIMESTAMP,
    remark TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_setup_lists_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_setup_lists_template FOREIGN KEY (template_id) REFERENCES project_templates (id)
);

CREATE INDEX IF NOT EXISTS idx_setup_lists_project_id ON setup_lists (project_id);
CREATE INDEX IF NOT EXISTS idx_setup_lists_status ON setup_lists (status);

CREATE TABLE IF NOT EXISTS setup_list_items (
    id BIGSERIAL PRIMARY KEY,
    setup_list_id BIGINT NOT NULL,
    parent_id BIGINT,
    sequence_no VARCHAR(50),
    category_name VARCHAR(100),
    item_name VARCHAR(200) NOT NULL,
    specification VARCHAR(255),
    quantity NUMERIC(12,2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    remark VARCHAR(255),
    execute_status VARCHAR(30) NOT NULL DEFAULT 'pending',
    assignee_id BIGINT,
    completed_at TIMESTAMP,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_setup_list_items_setup_list FOREIGN KEY (setup_list_id) REFERENCES setup_lists (id),
    CONSTRAINT fk_setup_list_items_parent FOREIGN KEY (parent_id) REFERENCES setup_list_items (id),
    CONSTRAINT fk_setup_list_items_assignee FOREIGN KEY (assignee_id) REFERENCES users (id),
    CONSTRAINT ck_setup_list_items_quantity CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_setup_list_items_setup_list_id ON setup_list_items (setup_list_id);
CREATE INDEX IF NOT EXISTS idx_setup_list_items_assignee_id ON setup_list_items (assignee_id);
CREATE INDEX IF NOT EXISTS idx_setup_list_items_execute_status ON setup_list_items (execute_status);
CREATE INDEX IF NOT EXISTS idx_setup_list_items_sort_order ON setup_list_items (sort_order);

CREATE TABLE IF NOT EXISTS attachments (
    id BIGSERIAL PRIMARY KEY,
    biz_type VARCHAR(30) NOT NULL,
    biz_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachments_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_attachments_biz_type_biz_id ON attachments (biz_type, biz_id);

CREATE TABLE IF NOT EXISTS import_tasks (
    id BIGSERIAL PRIMARY KEY,
    biz_type VARCHAR(30) NOT NULL,
    biz_id BIGINT,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    total_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    fail_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    operator_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    CONSTRAINT fk_import_tasks_operator FOREIGN KEY (operator_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_import_tasks_status ON import_tasks (status);
CREATE INDEX IF NOT EXISTS idx_import_tasks_biz_type ON import_tasks (biz_type);

INSERT INTO roles (code, name, description)
VALUES
    ('admin', '超级管理员', '系统管理员'),
    ('project_manager', '项目经理', '负责项目创建与管理'),
    ('dispatcher', '调度/内勤', '负责派工与协调'),
    ('site_manager', '现场负责人', '负责现场执行推进'),
    ('worker', '搭建人员', '负责现场执行')
ON CONFLICT (code) DO NOTHING;

COMMIT;
