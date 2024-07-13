import {postQuery,user_json} from "./post_query.js";

const visible_users=`LEAST(10,NOTIFICATIONS.COUNT)`;

const comment_column=`
(
	CASE WHEN
		post_id IS NOT NULL 
	THEN
		to_jsonb
		(
			comments.*
		)
	END
)`;

const post_column=`
(
	CASE WHEN
		post_id IS NOT NULL 
	THEN
		JSONB_BUILD_OBJECT
		(
			'id',POSTS.ID,
			'text',POSTS.TEXT
		)
	END
)`;

const follow_users= `
WHEN
	type = 'follow' 
THEN
(
	SELECT ARRAY
	(
		SELECT
			${user_json}
		FROM FOLLOWS
			LEFT JOIN USERS ON FOLLOWS.FOLLOWER = USERS.ID
		WHERE
			TIMESTAMP >= NOTIFICATIONS.DATE
			AND
			FOLLOWED=NOTIFICATIONS.USER_ID
		ORDER BY FOLLOWS.TIMESTAMP
		LIMIT ${visible_users}
	)
)`;

const like_users=`
WHEN
	type = 'like' 
THEN
(
	SELECT ARRAY
	(
		SELECT
			${user_json}
		FROM LIKES
			LEFT JOIN USERS ON LIKES.USER_ID=USERS.ID
		WHERE
			TIMESTAMP >= NOTIFICATIONS.DATE
			AND
			POST_ID=NOTIFICATIONS.POST_ID
		ORDER BY LIKES.TIMESTAMP
		LIMIT ${visible_users}
	)
)`;

const repost_users=`
WHEN
	type = 'repost' 
THEN
(
	SELECT ARRAY
	(
		SELECT
			${user_json}
		FROM POSTS
			LEFT JOIN USERS ON USERS.ID = POSTS.PUBLISHER
		WHERE
			REPOST=NOTIFICATIONS.POST_ID
			AND
			DATE>=NOTIFICATIONS.DATE
		ORDER BY DATE
		LIMIT ${visible_users}
	)
)`;

const users_column=`
(
	CASE 
	${follow_users}
	${like_users}
	${repost_users}
	END
)`;

const notifications=`
select
	notifications.*,
	${post_column} AS POST,
	${comment_column} AS COMMENT,
	${users_column} AS USERS
from notifications
	left join posts comments on comments.id=notifications.comment_id
	left join posts on posts.id=notifications.post_id
where user_id=:user_id
order by notifications.date desc
limit :limit offset :from`;

const markAsRead=`
UPDATE NOTIFICATIONS
	SET SEEN=TRUE
WHERE 
	SEEN=FALSE
	AND USER_ID=:user_id`;

export default notifications;
export {markAsRead};