CREATE TABLE IF NOT EXISTS orders (
  id          VARCHAR(36)   PRIMARY KEY,                   -- UUID from service
  user_id     INT           NOT NULL,                      -- FK to users.id
  items       JSON          NOT NULL,                      -- JSON array of { product_id, quantity }
  status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING',    -- Order state
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
