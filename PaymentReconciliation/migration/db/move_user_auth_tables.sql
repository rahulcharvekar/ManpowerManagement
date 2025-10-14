-- Move user auth tables to user_auth_db
CREATE TABLE user_auth_db.users LIKE paymentreconciliation_dev.users;
INSERT INTO user_auth_db.users SELECT * FROM paymentreconciliation_dev.users;

CREATE TABLE user_auth_db.user_roles LIKE paymentreconciliation_dev.user_roles;
INSERT INTO user_auth_db.user_roles SELECT * FROM paymentreconciliation_dev.user_roles;

CREATE TABLE user_auth_db.roles LIKE paymentreconciliation_dev.roles;
INSERT INTO user_auth_db.roles SELECT * FROM paymentreconciliation_dev.roles;

CREATE TABLE user_auth_db.capabilities LIKE paymentreconciliation_dev.capabilities;
INSERT INTO user_auth_db.capabilities SELECT * FROM paymentreconciliation_dev.capabilities;

CREATE TABLE user_auth_db.policies LIKE paymentreconciliation_dev.policies;
INSERT INTO user_auth_db.policies SELECT * FROM paymentreconciliation_dev.policies;

CREATE TABLE user_auth_db.policy_capabilities LIKE paymentreconciliation_dev.policy_capabilities;
INSERT INTO user_auth_db.policy_capabilities SELECT * FROM paymentreconciliation_dev.policy_capabilities;

CREATE TABLE user_auth_db.endpoint_policies LIKE paymentreconciliation_dev.endpoint_policies;
INSERT INTO user_auth_db.endpoint_policies SELECT * FROM paymentreconciliation_dev.endpoint_policies;

CREATE TABLE user_auth_db.endpoints LIKE paymentreconciliation_dev.endpoints;
INSERT INTO user_auth_db.endpoints SELECT * FROM paymentreconciliation_dev.endpoints;

CREATE TABLE user_auth_db.page_actions LIKE paymentreconciliation_dev.page_actions;
INSERT INTO user_auth_db.page_actions SELECT * FROM paymentreconciliation_dev.page_actions;

CREATE TABLE user_auth_db.ui_pages LIKE paymentreconciliation_dev.ui_pages;
INSERT INTO user_auth_db.ui_pages SELECT * FROM paymentreconciliation_dev.ui_pages;

CREATE TABLE user_auth_db.authorization_audit LIKE paymentreconciliation_dev.authorization_audit;
INSERT INTO user_auth_db.authorization_audit SELECT * FROM paymentreconciliation_dev.authorization_audit;

CREATE TABLE user_auth_db.user_sessions LIKE paymentreconciliation_dev.user_sessions;
INSERT INTO user_auth_db.user_sessions SELECT * FROM paymentreconciliation_dev.user_sessions;

CREATE TABLE user_auth_db.audit_event LIKE paymentreconciliation_dev.audit_event;
INSERT INTO user_auth_db.audit_event SELECT * FROM paymentreconciliation_dev.audit_event;

CREATE TABLE user_auth_db.audit_log LIKE paymentreconciliation_dev.audit_log;
INSERT INTO user_auth_db.audit_log SELECT * FROM paymentreconciliation_dev.audit_log;

CREATE TABLE user_auth_db.system_config LIKE paymentreconciliation_dev.system_config;
INSERT INTO user_auth_db.system_config SELECT * FROM paymentreconciliation_dev.system_config;

CREATE TABLE user_auth_db.notification_templates LIKE paymentreconciliation_dev.notification_templates;
INSERT INTO user_auth_db.notification_templates SELECT * FROM paymentreconciliation_dev.notification_templates;
