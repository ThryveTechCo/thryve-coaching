CREATE TABLE IF NOT EXISTS enquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    enquiry TEXT NOT NULL,
    created_at TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    notes TEXT,
    last_updated TEXT
  );

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);

CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    created_by TEXT,
    is_active INTEGER DEFAULT 1,
    last_updated TEXT
  );

CREATE TABLE IF NOT EXISTS survey_responses (
    id TEXT PRIMARY KEY,
    survey_id TEXT NOT NULL,
    respondent_name TEXT NOT NULL,
    respondent_email TEXT,
    respondent_company TEXT,
    responses JSON,
    submitted_at TEXT NOT NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(id)
  );

CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);

CREATE TABLE IF NOT EXISTS assessments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    created_by TEXT,
    is_active INTEGER DEFAULT 1,
    last_updated TEXT
  );

CREATE TABLE IF NOT EXISTS assessment_results (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    respondent_name TEXT NOT NULL,
    respondent_email TEXT,
    respondent_company TEXT,
    score REAL,
    results JSON,
    submitted_at TEXT NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
  );

CREATE INDEX IF NOT EXISTS idx_assessment_results_assessment_id ON assessment_results(assessment_id);

CREATE TABLE IF NOT EXISTS audit_log (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    user_email TEXT,
    details JSON,
    created_at TEXT NOT NULL
  );

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
