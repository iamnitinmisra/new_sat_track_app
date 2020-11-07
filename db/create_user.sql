INSERT INTO users(password, user_email)
VALUES ($1, $2);

SELECT * FROM users 
WHERE user_email = $2;
-- select user_id, user_email from users
-- where user_email = $2;