INSERT INTO profile(user_id, zip, lat, long)
VALUES ($1, $2, $3, $4);

SELECT * FROM users
JOIN profile
ON(users.user_id = profile.user_id)
WHERE users.user_id = $1;