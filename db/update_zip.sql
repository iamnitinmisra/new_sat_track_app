UPDATE profile 
SET 
    zip = $2, 
    lat = $3, 
    long = $4 

WHERE profile_id = $1