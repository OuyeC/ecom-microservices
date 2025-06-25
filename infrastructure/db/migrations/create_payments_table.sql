CREATE TABLE IF NOT EXISTS payments (
  id          VARCHAR(36)   PRIMARY KEY,                  -- UUID
  order_id    VARCHAR(36)   NOT NULL,                     -- FK to orders.id
  amount      DECIMAL(10,2) NOT NULL,                     -- Payment amount
  status      VARCHAR(20)   NOT NULL DEFAULT 'PENDING',   -- PENDING, COMPLETED, FAILED
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);