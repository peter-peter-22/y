
const is_followed = (by = ":user_id") => `EXISTS (SELECT * FROM FOLLOWS WHERE FOLLOWER = ${by} AND FOLLOWED = USERS.ID)`;

const is_following = (target = ":user_id") => `EXISTS (SELECT * FROM FOLLOWS WHERE FOLLOWED = ${target} AND FOLLOWER = USERS.ID)`;

const is_blocked = `EXISTS (SELECT * FROM BLOCKS WHERE BLOCKER = :user_id AND BLOCKED = USERS.ID)`;

const user_json = `
JSONB_BUILD_OBJECT
(
	'id',USERS.ID,
	'username',USERS.USERNAME,
	'name',USERS.NAME,
	'picture',USERS.PICTURE
)`;

const user_json_extended = `
JSONB_BUILD_OBJECT
(
	'id',USERS.ID,
	'username',USERS.USERNAME,
	'name',USERS.NAME,
	'picture',USERS.PICTURE,
	'is_followed',${is_followed()},
	'is_blocked',${is_blocked}
)`;

//for session
const user_columns = `
id,
username,
name,
picture`;

const user_columns_extended = `
${user_columns},
${is_blocked} AS IS_BLOCKED,
${is_followed()} AS IS_FOLLOWED
`

const liked_by_user = `
EXISTS
	(SELECT *
		FROM LIKES
		WHERE LIKES.POST_ID = POST.ID
			AND USER_ID = :user_id)`;

const reposted_by_user = `
EXISTS
	(SELECT *
		FROM POSTS REPOSTS
		WHERE REPOSTS.REPOST = POST.ID
			AND REPOSTS.TEXT IS NULL
			AND REPOSTS.PUBLISHER = :user_id)`;

const bookmarked_by_user = `
EXISTS
(
	SELECT * FROM BOOKMARKS BOOKMARK
	WHERE BOOKMARK.POST_ID = POST.ID
	AND BOOKMARK.USER_ID = :user_id
)`;

const publisher = `
(
	SELECT
		${user_json_extended}
	FROM USERS 
		WHERE USERS.ID=POST.PUBLISHER
)`;

const replied_user=`
(
	select
		${user_json}
	from users
		where users.id=post.replying_to_user
)`;


const columns = `
    POST.TEXT,
    POST.ID,
	POST.MEDIA,
	POST.DATE,
	POST.REPOST AS REPOSTED_ID,
	POST.REPLYING_TO,
	POST.VIEW_COUNT,
	POST.LIKE_COUNT,
	POST.REPOST_COUNT,
	POST.BOOKMARK_COUNT,
    POST.COMMENT_COUNT,
	${liked_by_user} AS LIKED_BY_USER,
	${reposted_by_user} AS REPOSTED_BY_USER,
	${bookmarked_by_user} AS BOOKMARKED_BY_USER,
    ${publisher} AS PUBLISHER,
	${replied_user} as replied_user`;

function postQuery(where = "", offset = 0, limit = config.posts_per_request, from = "POSTS AS POST") {
	return `
	SELECT
		${columns}
	FROM ${from}
		${where}
	ORDER BY DATE DESC, ID DESC
	OFFSET ${offset}
	LIMIT ${limit}`;
}

export { postQuery, is_followed, is_blocked, user_columns, user_columns_extended, columns, is_following, user_json, bookmarked_by_user }