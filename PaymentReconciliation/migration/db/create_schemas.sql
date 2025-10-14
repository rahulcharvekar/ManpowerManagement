-- Create schemas for each microservice
drop database if exists user_auth_db;
drop database if exists payment_flow_db;
drop database if exists reconciliation_db;

create database user_auth_db;
create database payment_flow_db;
create database reconciliation_db;
