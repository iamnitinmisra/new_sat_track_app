SELECT * FROM users
JOIN profile
ON(users.user_id = profile.user_id)
WHERE user_email = $1;