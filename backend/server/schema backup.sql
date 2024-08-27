--
-- PostgreSQL database dump
--

-- Dumped from database version 15.4
-- Dumped by pg_dump version 15.4

-- Started on 2024-08-28 01:53:07

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 902 (class 1247 OID 91208)
-- Name: notification; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification AS ENUM (
    'like',
    'follow',
    'repost',
    'comment'
);


ALTER TYPE public.notification OWNER TO postgres;

--
-- TOC entry 242 (class 1255 OID 91183)
-- Name: cache_bookmark_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_bookmark_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	bookmarked_post integer;
BEGIN
  --get the reposted post id
	IF TG_OP IN ('INSERT') THEN
		bookmarked_post:=new.post_id;
	ELSE
		bookmarked_post:=old.post_id;
	END IF;
	
	--update counter
 	UPDATE posts
	SET bookmark_count = (select count(*) from bookmarks where bookmarks.post_id=posts.id)
	WHERE posts.id = bookmarked_post;
	
  	RETURN NULL;
END$$;


ALTER FUNCTION public.cache_bookmark_count_trg() OWNER TO postgres;

--
-- TOC entry 244 (class 1255 OID 91175)
-- Name: cache_comment_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_comment_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	replied_post integer;
BEGIN
	--get the replied post id
	IF TG_OP IN ('INSERT') THEN
		replied_post:=new.replying_to;
	ELSE
		replied_post:=old.replying_to;
	END IF;
	
	--if this is not a comment, ignore
	IF replied_post IS NULL THEN
		RETURN NULL;
	END IF;	
	
	--update count
 	UPDATE posts
	SET comment_count = (select count(*) from posts where posts.replying_to=replied_post)
	WHERE posts.id = replied_post;
  	RETURN NULL;
END
$$;


ALTER FUNCTION public.cache_comment_count_trg() OWNER TO postgres;

--
-- TOC entry 250 (class 1255 OID 115711)
-- Name: cache_follower_counts_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_follower_counts_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	i_follower integer;
	i_followed integer;
BEGIN
	--select the post id from 'new' or 'old'
	IF TG_OP IN ('INSERT') THEN
		i_follower:=new.follower;
		i_followed:=new.followed;
	ELSE
		i_follower:=old.follower;
		i_followed:=old.followed;
	END IF;
	
	--update count
 	UPDATE users
	SET follower_count = (select count(*) from follows where followed=i_followed)
	WHERE users.id = i_followed;
	
	UPDATE users
	SET following_count = (select count(*) from follows where follower=i_follower)
	WHERE users.id = i_follower;
	
  	RETURN NULL;
END$$;


ALTER FUNCTION public.cache_follower_counts_trg() OWNER TO postgres;

--
-- TOC entry 230 (class 1255 OID 91161)
-- Name: cache_hashtag_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_hashtag_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
 	INSERT INTO trends (hashtag,count)
	VALUES(new.hashtag,1)
	ON CONFLICT (hashtag)
    DO UPDATE  
	SET count = (select count(*) from hashtags where hashtag=trends.hashtag)
	WHERE trends.hashtag = new.hashtag;
  RETURN NULL;
END
$$;


ALTER FUNCTION public.cache_hashtag_count_trg() OWNER TO postgres;

--
-- TOC entry 252 (class 1255 OID 91284)
-- Name: cache_like_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_like_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	post integer;
BEGIN
	--select the post id from 'new' or 'old'
	IF TG_OP IN ('INSERT') THEN
		post:=new.post_id;
	ELSE
		post:=old.post_id;
	END IF;
	
	--update count
 	UPDATE posts
	SET like_count = (select count(*) from likes where post_id=posts.id)
	WHERE posts.id = post;
	
  	RETURN NULL;
END$$;


ALTER FUNCTION public.cache_like_count_trg() OWNER TO postgres;

--
-- TOC entry 247 (class 1255 OID 91281)
-- Name: cache_replied_user_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_replied_user_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
	IF new.replying_to IS NOT NULL THEN
		new.replying_to_user=(SELECT PUBLISHER FROM POSTS WHERE ID=new.REPLYING_TO);
	END IF;
	RETURN new;
END
$$;


ALTER FUNCTION public.cache_replied_user_trg() OWNER TO postgres;

--
-- TOC entry 243 (class 1255 OID 91180)
-- Name: cache_repost_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_repost_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	reposted_post integer;
BEGIN
  --get the reposted post id
	IF TG_OP IN ('INSERT') THEN
		reposted_post:=new.repost;
	ELSE
		reposted_post:=old.repost;
	END IF;
	
	--if this is not a repost, ignore
	IF reposted_post IS NULL THEN
		RETURN NULL;
	END IF;	
	
	--update counter
 	UPDATE posts
	SET repost_count = (select count(*) from posts as reposts where reposts.repost=posts.id)
	WHERE posts.id = reposted_post;
  	RETURN NULL;
END
$$;


ALTER FUNCTION public.cache_repost_count_trg() OWNER TO postgres;

--
-- TOC entry 246 (class 1255 OID 99307)
-- Name: cache_unread_notification_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_unread_notification_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	my_user_id integer;
BEGIN
	--select the user id from 'new' or 'old'
	IF TG_OP IN ('INSERT','UPDATE') THEN
		my_user_id:=new.user_id;
	ELSE
		my_user_id:=old.user_id;
	END IF;
	
	--update count
 	UPDATE users
	SET unread_notification_count = (
		select count(*) from notifications
		where notifications.user_id=my_user_id 
		and notifications.seen=false
	)
	WHERE users.id = my_user_id;
	
  	RETURN NULL;
END$$;


ALTER FUNCTION public.cache_unread_notification_count_trg() OWNER TO postgres;

--
-- TOC entry 248 (class 1255 OID 91178)
-- Name: cache_view_count_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.cache_view_count_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	post integer;
BEGIN
	--select the post id from 'new' or 'old'
	IF TG_OP IN ('INSERT') THEN
		post:=new.post_id;
	ELSE
		post:=new.post_id;
	END IF;
	
	--update count
 	UPDATE posts
	SET view_count = (select count(*) from views where post_id=posts.id)
	WHERE posts.id = post;
	
  	RETURN NULL;
END
$$;


ALTER FUNCTION public.cache_view_count_trg() OWNER TO postgres;

--
-- TOC entry 229 (class 1255 OID 91146)
-- Name: count_estimate(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.count_estimate(query text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    plan jsonb;
BEGIN
    EXECUTE 'EXPLAIN (FORMAT JSON)' || query INTO plan;
    RETURN plan->0->'Plan'->'Plan Rows';
END;
$$;


ALTER FUNCTION public.count_estimate(query text) OWNER TO postgres;

--
-- TOC entry 245 (class 1255 OID 91246)
-- Name: create_comment_notification_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_comment_notification_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
	--on insert, create a new notification if necessary
	IF TG_OP IN ('INSERT') THEN
		--if this is not a comment, ignore
		IF new.replying_to IS NULL THEN
			RETURN NULL;
		END IF;
		
		--exit if the user is commenting to itself
		IF new.replying_to_user=new.publisher THEN
			RETURN NULL;
		END IF;

		--insert new notification
 		INSERT INTO notifications (type,user_id,post_id,comment_id)
		VALUES(
			'comment',
			new.replying_to_user,
			new.replying_to,
			new.id
		)
		ON CONFLICT (user_id,post_id,comment_id,type) WHERE seen=FALSE
		DO NOTHING;
		
	--on delete, delete the notification of the comment
 	ELSE
		--if this is not a comment, ignore
		IF old.replying_to IS NULL THEN
			RETURN NULL;
		END IF;

		--delete the notification
 		DELETE FROM notifications 
		WHERE
			TYPE='comment'
			AND COMMENT_ID=old.id
			AND POST_ID=old.replying_to
			AND USER_ID=old.replying_to_user;
 	END IF;
	
	RETURN NULL;
END
$$;


ALTER FUNCTION public.create_comment_notification_trg() OWNER TO postgres;

--
-- TOC entry 251 (class 1255 OID 91259)
-- Name: create_follow_notification_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_follow_notification_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	followed_user_id integer;
	follow_count integer;
BEGIN
	--getting the user id either from 'new' or 'old'
	IF TG_OP IN ('INSERT') THEN
		followed_user_id:=new.followed;
	ELSE
		followed_user_id:=old.followed;
	END IF;
	
	--creating a new notification, or updating an existing unread notification
	IF TG_OP IN ('INSERT') THEN
		--on insert, try to insert or update
		INSERT INTO notifications (type,user_id)
		VALUES(
			'follow',
			followed_user_id
		)
		ON CONFLICT (user_id,post_id,type,comment_id) WHERE seen=FALSE
		DO UPDATE SET 
		count=(
			select count(*) from follows 
			where follows.followed=followed_user_id 
			and follows.timestamp>=notifications.date
		);
	ELSE
		--on delete, try to update or delete
		UPDATE notifications SET 
		count=(
			select count(*) from follows 
			where follows.followed=followed_user_id 
			and follows.timestamp>=notifications.date
		)
		WHERE 
			type='follow'
			and user_id=followed_user_id
			and seen=false
		RETURNING count into follow_count;
	
		--delete if count is 0
		IF follow_count=0 THEN
			DELETE FROM notifications
			WHERE 
			type='follow'
			and user_id=followed_user_id;
		END IF;
	END IF;
	RETURN NULL;
END
$$;


ALTER FUNCTION public.create_follow_notification_trg() OWNER TO postgres;

--
-- TOC entry 254 (class 1255 OID 91249)
-- Name: create_like_notification_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_like_notification_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	liked_post_id integer;
	liker_user integer;
	like_count integer;
	liked_user integer;
BEGIN
	--getting the post id either from 'new' or 'old'
	IF TG_OP IN ('INSERT') THEN
		liked_post_id:=new.post_id;
		liker_user:=new.user_id;
	ELSE
		liked_post_id:=old.post_id;
		liker_user:=old.user_id;
	END IF;
	
	--getting the user who will recieve the notification
	liked_user:=(SELECT posts.publisher from posts where posts.id=liked_post_id);
	
	--no notification if the user likes it's own post
	IF liked_user=liker_user THEN
		RETURN NULL;
	END IF;
	
	--creating a new notification, or updating an existing unread notification
	IF TG_OP IN ('INSERT') THEN
		--on insert, try to insert or update
		INSERT INTO notifications (type,user_id,post_id)
		VALUES(
			'like',
			liked_user,
			liked_post_id
		)
		ON CONFLICT (user_id,post_id,type,comment_id) WHERE seen=FALSE
		DO UPDATE SET 
		count=(
			select count(*) from likes 
			where likes.post_id=notifications.post_id 
			and likes.timestamp>=notifications.date
		);
	ELSE
		--on delete, try to update or delete
		UPDATE notifications SET 
		count=(
			select count(*) from likes 
			where likes.post_id=notifications.post_id 
			and likes.timestamp>=notifications.date
		)
		WHERE 
			type='like'
			and notifications.post_id=liked_post_id
			and seen=false
		RETURNING count into like_count;
	
		--delete if count is 0
		IF like_count<=0 THEN
			DELETE FROM notifications
			WHERE 
				type='like'
				and notifications.post_id=liked_post_id
				and seen=false;
		END IF;
	END IF;
	RETURN NULL;
END
$$;


ALTER FUNCTION public.create_like_notification_trg() OWNER TO postgres;

--
-- TOC entry 249 (class 1255 OID 91253)
-- Name: create_repost_notification_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_repost_notification_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	reposted_post_id integer;
	repost_count integer;
	repost_publisher integer;
	reposter integer;
BEGIN
	--getting the post id either from 'new' or 'old'
	IF TG_OP IN ('INSERT') THEN
		reposted_post_id:=new.repost;
		reposter:=new.publisher;
	ELSE
		reposted_post_id:=old.repost;
		reposter:=old.publisher;
	END IF;
	
	--if this is not a repost, ignore
	IF(reposted_post_id IS NULL) THEN
		RETURN NULL;
	END IF;
	
	--get the publisher of the reposted post
	repost_publisher:=(SELECT posts.publisher from posts where posts.id=reposted_post_id);
	
	--if the user repost his own post, ignore
	IF repost_publisher=reposter THEN
		RETURN NULL;
	END IF;
	
	--creating a new notification, or updating an existing unread notification
	INSERT INTO notifications (type,user_id,post_id)
	VALUES(
		'repost',
		repost_publisher,
		reposted_post_id
	)
	ON CONFLICT (user_id,post_id,type,comment_id) WHERE seen=FALSE
	DO UPDATE SET 
	count=(
		select count(*) from posts 
		where posts.repost=notifications.post_id 
		and posts.date>=notifications.date
	)
	RETURNING count INTO repost_count;
	
	--delete if count 0
	IF TG_OP IN ('DELETE') THEN
		IF repost_count=0 THEN
			DELETE FROM notifications
			WHERE 
			type='repost'
			and notifications.post_id=reposted_post_id;
		END IF;
	END IF;
	
	RETURN NULL;
END$$;


ALTER FUNCTION public.create_repost_notification_trg() OWNER TO postgres;

--
-- TOC entry 253 (class 1255 OID 91273)
-- Name: repost_cant_be_reposted_trg(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.repost_cant_be_reposted_trg() RETURNS trigger
    LANGUAGE plpgsql
    AS $$DECLARE
	reposted_repost boolean;
BEGIN
	--if this is a repost, and the reposted post is also a repost (not a quote) then throw an error
	IF new.repost IS NULL THEN
		RETURN new;
	END IF;
	
	--get if the reposted post is a repost or not
	reposted_repost:= 
		(
			SELECT (repost IS NOT NULL AND text IS NULL) as not_okay
			FROM POSTS WHERE POSTS.ID=NEW.REPOST
		);
		
	--if its a repost, throw error
	IF reposted_repost THEN
		RAISE EXCEPTION	'a repost cannot be reposted';	
	END IF;
	
	RETURN new;
END$$;


ALTER FUNCTION public.repost_cant_be_reposted_trg() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 223 (class 1259 OID 91072)
-- Name: blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocks (
    blocker integer NOT NULL,
    blocked integer NOT NULL
);


ALTER TABLE public.blocks OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 82756)
-- Name: bookmarks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookmarks (
    user_id integer,
    post_id integer,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bookmarks OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 74573)
-- Name: follows; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.follows (
    follower integer,
    followed integer,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT cannot_follow_itself CHECK ((follower <> followed))
);


ALTER TABLE public.follows OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 91110)
-- Name: hashtags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hashtags (
    post_id integer NOT NULL,
    hashtag character varying(50) NOT NULL
);


ALTER TABLE public.hashtags OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 74606)
-- Name: likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.likes (
    user_id integer,
    post_id integer,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.likes OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 91185)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    user_id integer NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    post_id integer,
    count integer DEFAULT 1 NOT NULL,
    type public.notification NOT NULL,
    comment_id integer,
    seen boolean DEFAULT false NOT NULL,
    CONSTRAINT comment_id_nn CHECK (((type <> 'comment'::public.notification) OR (comment_id IS NOT NULL))),
    CONSTRAINT post_id_nn CHECK (((type = 'follow'::public.notification) OR (post_id IS NOT NULL)))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 91087)
-- Name: password_changes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_changes (
    id integer,
    secret integer DEFAULT floor((random() * (2147483647)::double precision)) NOT NULL,
    created timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_changes OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 74587)
-- Name: posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    publisher integer,
    text text,
    date timestamp without time zone DEFAULT now() NOT NULL,
    repost integer,
    views integer DEFAULT 0 NOT NULL,
    replying_to integer,
    media jsonb[],
    hashtags character varying(50)[],
    like_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    repost_count integer DEFAULT 0 NOT NULL,
    bookmark_count integer DEFAULT 0 NOT NULL,
    replying_to_user integer,
    deleted timestamp without time zone,
    CONSTRAINT replying_to_user_nn CHECK (((replying_to IS NULL) OR (replying_to_user IS NOT NULL)))
);


ALTER TABLE public.posts OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 74586)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.posts_id_seq OWNER TO postgres;

--
-- TOC entry 3504 (class 0 OID 0)
-- Dependencies: 218
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 216 (class 1259 OID 66368)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 91154)
-- Name: trends; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trends (
    id integer NOT NULL,
    hashtag character varying(50) NOT NULL,
    count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.trends OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 91153)
-- Name: trends_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trends_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trends_id_seq OWNER TO postgres;

--
-- TOC entry 3505 (class 0 OID 0)
-- Dependencies: 226
-- Name: trends_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trends_id_seq OWNED BY public.trends.id;


--
-- TOC entry 215 (class 1259 OID 50015)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    name character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    password_hash character varying(255),
    registration_date timestamp without time zone DEFAULT now() NOT NULL,
    email_notifications boolean DEFAULT false NOT NULL,
    browser_notifications boolean DEFAULT false NOT NULL,
    birthdate date NOT NULL,
    bio text,
    picture jsonb,
    banner jsonb,
    follower_count integer DEFAULT 0 NOT NULL,
    last_check_notifs timestamp without time zone DEFAULT now() NOT NULL,
    push_subscribtion jsonb,
    unread_notification_count integer DEFAULT 0 NOT NULL,
    last_email_notifications integer DEFAULT 0 NOT NULL,
    following_count integer DEFAULT 0 NOT NULL,
    settings jsonb
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 50014)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3506 (class 0 OID 0)
-- Dependencies: 214
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 222 (class 1259 OID 91057)
-- Name: views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.views (
    post_id integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.views OWNER TO postgres;

--
-- TOC entry 3247 (class 2604 OID 74590)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 3259 (class 2604 OID 91157)
-- Name: trends id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trends ALTER COLUMN id SET DEFAULT nextval('public.trends_id_seq'::regclass);


--
-- TOC entry 3237 (class 2604 OID 50018)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3285 (class 2606 OID 82789)
-- Name: follows follow_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follow_unique UNIQUE (follower, followed);


--
-- TOC entry 3316 (class 2606 OID 91114)
-- Name: hashtags hashtag_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT hashtag_unique PRIMARY KEY (post_id, hashtag);


--
-- TOC entry 3293 (class 2606 OID 74595)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 3281 (class 2606 OID 66374)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3318 (class 2606 OID 91164)
-- Name: trends trend_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trends
    ADD CONSTRAINT trend_unique UNIQUE (hashtag);


--
-- TOC entry 3320 (class 2606 OID 91160)
-- Name: trends trends_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trends
    ADD CONSTRAINT trends_pkey PRIMARY KEY (id);


--
-- TOC entry 3309 (class 2606 OID 91076)
-- Name: blocks unique_blocks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT unique_blocks UNIQUE (blocker, blocked);


--
-- TOC entry 3303 (class 2606 OID 82770)
-- Name: bookmarks unique_bookmarks; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT unique_bookmarks UNIQUE (user_id, post_id);


--
-- TOC entry 3299 (class 2606 OID 82755)
-- Name: likes unique_likes; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT unique_likes UNIQUE (user_id, post_id);


--
-- TOC entry 3313 (class 2606 OID 91098)
-- Name: password_changes unique_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_changes
    ADD CONSTRAINT unique_user_id UNIQUE (id);


--
-- TOC entry 3305 (class 2606 OID 91071)
-- Name: views unique_view; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT unique_view UNIQUE (post_id, user_id);


--
-- TOC entry 3273 (class 2606 OID 50023)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3276 (class 2606 OID 74572)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3278 (class 2606 OID 50021)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3279 (class 1259 OID 66375)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3307 (class 1259 OID 115703)
-- Name: blocked_by_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blocked_by_user_idx ON public.blocks USING btree (blocker, blocked);


--
-- TOC entry 3300 (class 1259 OID 115708)
-- Name: bookmarks_of_post_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bookmarks_of_post_idx ON public.bookmarks USING btree (post_id, "timestamp" DESC);


--
-- TOC entry 3301 (class 1259 OID 115705)
-- Name: bookmarks_of_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bookmarks_of_user_idx ON public.bookmarks USING btree (user_id, post_id, "timestamp" DESC);


--
-- TOC entry 3268 (class 1259 OID 115768)
-- Name: celebrities_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX celebrities_idx ON public.users USING btree (follower_count DESC, id);


--
-- TOC entry 3289 (class 1259 OID 115763)
-- Name: contents_of_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX contents_of_user_idx ON public.posts USING btree (publisher, ((text IS NULL)), date DESC, id DESC);


--
-- TOC entry 3269 (class 1259 OID 115687)
-- Name: email_notifications_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX email_notifications_idx ON public.users USING btree (unread_notification_count, last_email_notifications) WHERE (unread_notification_count > 0);


--
-- TOC entry 3282 (class 1259 OID 115779)
-- Name: fki_follows_followed_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_follows_followed_fkey ON public.follows USING btree (followed);


--
-- TOC entry 3283 (class 1259 OID 115785)
-- Name: fki_follows_follower_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_follows_follower_fkey ON public.follows USING btree (follower);


--
-- TOC entry 3310 (class 1259 OID 115791)
-- Name: fki_passwordchanges_id_fkey2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_passwordchanges_id_fkey2 ON public.password_changes USING btree (id);


--
-- TOC entry 3286 (class 1259 OID 115767)
-- Name: followed_by_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX followed_by_user_idx ON public.follows USING btree (follower, "timestamp" DESC);


--
-- TOC entry 3287 (class 1259 OID 115766)
-- Name: followers_of_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX followers_of_user_idx ON public.follows USING btree (followed, "timestamp" DESC);


--
-- TOC entry 3314 (class 1259 OID 115771)
-- Name: hashtag_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX hashtag_idx ON public.hashtags USING btree (hashtag);


--
-- TOC entry 3311 (class 1259 OID 115707)
-- Name: id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX id_idx ON public.password_changes USING btree (id);


--
-- TOC entry 3288 (class 1259 OID 115734)
-- Name: is_followed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX is_followed ON public.follows USING btree (followed, follower);


--
-- TOC entry 3296 (class 1259 OID 115700)
-- Name: likes_of_post_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_of_post_idx ON public.likes USING btree (post_id, user_id, "timestamp" DESC);


--
-- TOC entry 3297 (class 1259 OID 115698)
-- Name: likes_of_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX likes_of_user_idx ON public.likes USING btree (user_id, "timestamp" DESC);


--
-- TOC entry 3322 (class 1259 OID 115773)
-- Name: notifs_of_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifs_of_user_idx ON public.notifications USING btree (user_id, seen, date DESC);


--
-- TOC entry 3290 (class 1259 OID 107495)
-- Name: posts_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_id_idx ON public.posts USING btree (id);


--
-- TOC entry 3291 (class 1259 OID 115760)
-- Name: posts_or_comments_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX posts_or_comments_idx ON public.posts USING btree (replying_to, date DESC, id DESC);


--
-- TOC entry 3294 (class 1259 OID 115761)
-- Name: reposter_of_post_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reposter_of_post_idx ON public.posts USING btree (repost, date DESC, id DESC) WHERE (repost IS NOT NULL);


--
-- TOC entry 3270 (class 1259 OID 115769)
-- Name: search_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_name_idx ON public.users USING btree (name, follower_count DESC);


--
-- TOC entry 3271 (class 1259 OID 115770)
-- Name: search_username_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX search_username_idx ON public.users USING btree (username, follower_count DESC);


--
-- TOC entry 3321 (class 1259 OID 115772)
-- Name: trends_search_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX trends_search_idx ON public.trends USING btree (hashtag, count);


--
-- TOC entry 3295 (class 1259 OID 90990)
-- Name: unique_repost; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_repost ON public.posts USING btree (publisher, repost) WHERE (text IS NULL);


--
-- TOC entry 3323 (class 1259 OID 91268)
-- Name: unique_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_unread ON public.notifications USING btree (user_id, post_id, type, comment_id) NULLS NOT DISTINCT WITH (deduplicate_items='true') WHERE (seen = false);


--
-- TOC entry 3274 (class 1259 OID 115686)
-- Name: users_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_id_idx ON public.users USING btree (id);


--
-- TOC entry 3306 (class 1259 OID 115699)
-- Name: views_of_post_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX views_of_post_idx ON public.views USING btree (post_id, user_id);


--
-- TOC entry 3353 (class 2620 OID 91184)
-- Name: bookmarks cache_bookmark_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_bookmark_count AFTER INSERT OR DELETE ON public.bookmarks FOR EACH ROW EXECUTE FUNCTION public.cache_bookmark_count_trg();


--
-- TOC entry 3345 (class 2620 OID 91176)
-- Name: posts cache_comment_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_comment_count AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.cache_comment_count_trg();


--
-- TOC entry 3343 (class 2620 OID 115712)
-- Name: follows cache_follower_counts; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_follower_counts AFTER INSERT OR DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION public.cache_follower_counts_trg();


--
-- TOC entry 3351 (class 2620 OID 91285)
-- Name: likes cache_like_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_like_count AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.cache_like_count_trg();


--
-- TOC entry 3346 (class 2620 OID 91282)
-- Name: posts cache_replied_user; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_replied_user BEFORE INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.cache_replied_user_trg();


--
-- TOC entry 3347 (class 2620 OID 91181)
-- Name: posts cache_repost_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_repost_count AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.cache_repost_count_trg();


--
-- TOC entry 3356 (class 2620 OID 99308)
-- Name: notifications cache_unread_notification_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_unread_notification_count AFTER INSERT OR DELETE OR UPDATE OF seen ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.cache_unread_notification_count_trg();


--
-- TOC entry 3354 (class 2620 OID 91179)
-- Name: views cache_view_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER cache_view_count AFTER INSERT OR DELETE ON public.views FOR EACH ROW EXECUTE FUNCTION public.cache_view_count_trg();


--
-- TOC entry 3348 (class 2620 OID 91247)
-- Name: posts create_comment_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_comment_notification AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.create_comment_notification_trg();


--
-- TOC entry 3344 (class 2620 OID 91269)
-- Name: follows create_follow_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_follow_notification AFTER INSERT OR DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION public.create_follow_notification_trg();


--
-- TOC entry 3352 (class 2620 OID 91250)
-- Name: likes create_like_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_like_notification AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.create_like_notification_trg();


--
-- TOC entry 3349 (class 2620 OID 91254)
-- Name: posts create_repost_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER create_repost_notification AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.create_repost_notification_trg();


--
-- TOC entry 3350 (class 2620 OID 91274)
-- Name: posts repost_cant_be_reposted; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER repost_cant_be_reposted BEFORE INSERT ON public.posts FOR EACH ROW EXECUTE FUNCTION public.repost_cant_be_reposted_trg();


--
-- TOC entry 3355 (class 2620 OID 115792)
-- Name: hashtags update_hashtag_count; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_hashtag_count AFTER INSERT ON public.hashtags FOR EACH ROW EXECUTE FUNCTION public.cache_hashtag_count_trg();


--
-- TOC entry 3336 (class 2606 OID 91082)
-- Name: blocks blocked_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocked_fkey FOREIGN KEY (blocked) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3337 (class 2606 OID 91077)
-- Name: blocks blocker_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocker_fkey FOREIGN KEY (blocker) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3332 (class 2606 OID 91100)
-- Name: bookmarks bookmarks_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3333 (class 2606 OID 91105)
-- Name: bookmarks bookmarks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookmarks
    ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3340 (class 2606 OID 91237)
-- Name: notifications comment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT comment_id_fk FOREIGN KEY (comment_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3324 (class 2606 OID 115774)
-- Name: follows follows_followed_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_followed_fkey FOREIGN KEY (followed) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3325 (class 2606 OID 115780)
-- Name: follows follows_follower_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.follows
    ADD CONSTRAINT follows_follower_fkey FOREIGN KEY (follower) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3330 (class 2606 OID 90975)
-- Name: likes likes_liker_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_liker_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3331 (class 2606 OID 90980)
-- Name: likes likes_post_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_post_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3338 (class 2606 OID 115786)
-- Name: password_changes passwordchanges_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_changes
    ADD CONSTRAINT passwordchanges_id_fkey FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3339 (class 2606 OID 91115)
-- Name: hashtags post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hashtags
    ADD CONSTRAINT post_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3341 (class 2606 OID 91195)
-- Name: notifications post_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT post_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3334 (class 2606 OID 91065)
-- Name: views post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3326 (class 2606 OID 99310)
-- Name: posts posts_publisher_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_publisher_fkey FOREIGN KEY (publisher) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3327 (class 2606 OID 99315)
-- Name: posts posts_repost_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_repost_fkey FOREIGN KEY (repost) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3328 (class 2606 OID 99346)
-- Name: posts replying_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT replying_to_fkey FOREIGN KEY (replying_to) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3329 (class 2606 OID 99325)
-- Name: posts replying_to_user_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT replying_to_user_fkey FOREIGN KEY (replying_to_user) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3342 (class 2606 OID 91190)
-- Name: notifications user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3335 (class 2606 OID 91060)
-- Name: views user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2024-08-28 01:53:07

--
-- PostgreSQL database dump complete
--

