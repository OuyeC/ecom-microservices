CREATE TABLE IF NOT EXISTS users (
  id             INT           AUTO_INCREMENT PRIMARY KEY,
  username       VARCHAR(255)  NOT NULL UNIQUE,
  password_hash  VARCHAR(60)   NOT NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
