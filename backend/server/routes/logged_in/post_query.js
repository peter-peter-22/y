const is_followed = `EXISTS (SELECT * FROM FOLLOWS WHERE FOLLOWER = :user_id AND FOLLOWED = USERS.ID)`

const is_blocked= `EXISTS (SELECT * FROM BLOCKS WHERE BLOCKER = :user_id AND BLOCKED = USERS.ID)`

const user_columns_basic =`
ID, 
USERNAME, 
NAME
`
const user_columns_extended =`
${user_columns_basic},
${is_blocked} AS IS_BLOCKED,
${is_followed} AS IS_BLOCKED
`

const like_count = `
(SELECT COUNT(*)
		FROM LIKES
		WHERE LIKES.POST_ID = POST.ID)::INT AS LIKE_COUNT`;

const liked_by_user = `
EXISTS
	(SELECT *
		FROM LIKES
		WHERE LIKES.POST_ID = POST.ID
			AND USER_ID = :user_id) AS LIKED_BY_USER`;

const repost_count = `
(SELECT COUNT(*)
		FROM POSTS REPOSTS
		WHERE REPOSTS.REPOST = POST.ID)::INT AS REPOST_COUNT`;

const reposted_by_user = `
EXISTS
	(SELECT *
		FROM POSTS REPOSTS
		WHERE REPOSTS.REPOST = POST.ID
			AND REPOSTS.TEXT IS NULL
			AND REPOSTS.PUBLISHER = :user_id) AS REPOSTED_BY_USER`;

const bookmark_count = `
(SELECT COUNT(*)
		FROM BOOKMARKS BOOKMARK
		WHERE BOOKMARK.POST_ID = POST.ID)::INT AS BOOKMARK_COUNT`;

const bookmarked_by_user = `
EXISTS
	(SELECT *
		FROM BOOKMARKS BOOKMARK
		WHERE BOOKMARK.POST_ID = POST.ID
			AND BOOKMARK.USER_ID = :user_id) AS BOOKMARKED_BY_USER`;

const comment_count = `
(SELECT COUNT(*)
		FROM POSTS AS COMMENTS_TABLE
		WHERE COMMENTS_TABLE.REPLYING_TO = POST.ID)::INT AS COMMENT_COUNT`;

const view_count = `
(SELECT COUNT(*)
		FROM VIEWS
		WHERE VIEWS.POST_ID = POST.ID)::INT AS VIEWS`;

const publisher = `
(SELECT
JSONB_BUILD_OBJECT(
	'id',USERS.ID, 
	'name',USERS.NAME, 
	'username',USERS.USERNAME, 
    'is_followed',${is_followed}, 
	'is_blocked',${is_blocked}
) AS PUBLISHER
FROM
USERS WHERE USERS.ID=POST.PUBLISHER)`;

const columns = `
    POST.TEXT,
    POST.ID,
	POST.IMAGE_COUNT,
	POST.DATE,
	POST.REPOST AS REPOSTED_ID,
	POST.REPLYING_TO,
    POST.REPLYING_TO_PUBLISHER,
    ${view_count},
	${like_count},
	${liked_by_user},
	${repost_count},
	${reposted_by_user},
	${bookmark_count},
	${bookmarked_by_user},
    ${publisher},
    ${comment_count}`;

const postQueryText = `
SELECT 
	${columns}
FROM
(SELECT *
    FROM POSTS
    ORDER BY POSTS.DATE DESC) POST`;

export default postQueryText;
export {is_followed,is_blocked,user_columns_basic,user_columns_extended}