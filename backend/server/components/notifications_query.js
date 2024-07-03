import {postQuery,user_json} from "./post_query.js";

const users_column = `
(
	SELECT ARRAY_AGG
	(
		${user_json}
	)
	FROM USERS
	WHERE USERS.ID = ANY(USER_IDS)
)
AS USERS`;

const posts_column = `
(
	SELECT JSONB_BUILD_OBJECT(
		'id',
		POSTS.ID,
		'text',
		POSTS.TEXT
	)
	FROM POSTS
	WHERE POSTS.ID = POST_ID
)
AS POST`;

const repost_query = `
SELECT 2 AS TYPE,
	REPOST AS POST_ID,
	MAX(COUNT) AS USER_COUNT,
	ARRAY_AGG(PUBLISHER) AS USER_IDS,
	MAX(timestamp) AS timestamp
FROM
	(SELECT PUBLISHER,
			REPOST,
			MAX(date) OVER W AS timestamp,
			COUNT(*) OVER W,
			ROW_NUMBER(*) OVER W
		FROM POSTS
		WHERE REPOSTED_FROM_USER = :user_id WINDOW W AS (PARTITION BY POSTS.REPOST) ) AS NUMBERED_ROWS
WHERE ROW_NUMBER <= 3
GROUP BY REPOST`;

const likes_query = `
SELECT 0 AS TYPE,
	POST_ID,
	MAX(COUNT) AS USER_COUNT,
	ARRAY_AGG(USER_ID) AS USER_IDS,
	MAX(timestamp) AS timestamp
FROM
	(SELECT USER_ID,
			POST_ID,
			MAX(timestamp) OVER W AS timestamp,
			COUNT(*) OVER W,
			ROW_NUMBER(*) OVER W
		FROM LIKES
		WHERE PUBLISHER_ID = :user_id WINDOW W AS (PARTITION BY LIKES.POST_ID) ) AS NUMBERED_ROWS
WHERE ROW_NUMBER <= 3
GROUP BY POST_ID`;

const follows_query = `
SELECT *
FROM
	(SELECT 4 AS TYPE,
			NULL::int AS POST_ID,
			COUNT(*) OVER() AS USER_COUNT,
			ARRAY_AGG(FOLLOWED) AS USER_IDS,
			MAX(timestamp) AS timestamp
		FROM FOLLOWS
		WHERE FOLLOWED = :user_id
		ORDER BY timestamp DESC
		LIMIT 3) AS FOLLOWS`;

const comment_query = `
SELECT
1 AS TYPE,
id as post_id,
1 AS USER_COUNT,
date as timestamp,
null as users,
TO_JSONB(FORMATTED_POSTS.*) as post

FROM (${postQuery("WHERE REPLYING_TO_PUBLISHER = :user_id")}) as FORMATTED_POSTS`;

const columns = `
TYPE,
POST_ID,
USER_COUNT,
timestamp,
${users_column},
${posts_column}
`;

const notifications_query = `
SELECT * FROM(
    SELECT
    ${columns}
    FROM
        (
            ${repost_query}
            UNION ALL 
            ${likes_query}
            UNION ALL 
            ${follows_query}
        ) 
    AS LIKES_FOLLOWS_REPOSTS
    WHERE LIKES_FOLLOWS_REPOSTS.USER_IDS IS NOT NULL
UNION ALL ${comment_query}
    ) AS NOTIFICATIONS
ORDER BY timestamp DESC
OFFSET :from LIMIT ${config.notifications_per_request}`;
//"WHERE LIKES_FOLLOWS_REPOSTS.USER_IDS IS NOT NULL" is necessary because the likes, reposts, and follows are grouped, and they return an empty group if there are 0 entries. this row filters out the empty groups

export default notifications_query;