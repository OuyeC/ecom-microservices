CREATE TABLE IF NOT EXISTS cart_items (
  id         INT           AUTO_INCREMENT PRIMARY KEY,
  user_id    INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   INT           NOT NULL DEFAULT 1,
  added_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);