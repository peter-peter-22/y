const expiration_minutes = 15;

const not_expired = `EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - CREATED)) / 60 < ${expiration_minutes}`;

//get an user id if the secret, the user id, and the expiration date is valid
const get_user_if_valid = `
(
    SELECT ID
	FROM PASSWORD_CHANGES
	WHERE ID = :user_id
	AND
    SECRET = :secret
	AND
    ${not_expired}
)`;

const change_password = `
UPDATE USERS
SET PASSWORD_HASH = :password
WHERE USERS.ID = ${get_user_if_valid}
returning id`;

//create a password change request that has a secret code and is valid for a limited time, return the code
const create_secret = `
INSERT INTO PASSWORD_CHANGES (ID)
VALUES($1) ON CONFLICT (ID) DO
UPDATE
SET CREATED = DEFAULT,
	SECRET = DEFAULT
returning secret`;

const clear_user_request=`delete from PASSWORD_CHANGES where id=:user_id`;

export {change_password,create_secret,clear_user_request,expiration_minutes};