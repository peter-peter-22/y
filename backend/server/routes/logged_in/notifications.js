import express from "express";
import { Validator } from "node-input-validator";
import notifications_query, { markAsRead } from "../../components/notifications_query.js";
import { CheckV } from "../../components/validations.js";

const router = express.Router();
router.post("/get", async (req, res) => {
	//get and validate
	const v = new Validator(req.body, {
		from: 'required|integer',
		timestamp: 'required|integer'
	});
	await CheckV(v);
	const { from, timestamp } = req.body;
	const user_id = UserId(req);

	//get the notifications
	const notifs = await db.query(named(notifications_query)({
		user_id,
		from,
		limit: config.notifications_per_request,
		timestamp
	}));

	//mark the downloaded notifications as read
	await db.query(named(markAsRead)({
		user_id: user_id,
	}));

	res.json(notifs.rows);
});

router.get("/events", (req, res) => {
	//start stream
	const headers = {
		'Content-Type': 'text/event-stream',
		'Connection': 'keep-alive',
		'Cache-Control': 'no-cache',
		...enableCors()
	};
	res.writeHead(200,headers);

	const user_id = UserId(req);
	let count = 0;

	//get notif count from db
	async function calculateCount() {
		//get unread notification count
		count = await countUnread(user_id);
	}


	//send count to client
	async function sendCount() {
		//write to stream
		res.write(count);
	}

	//send on connect
	sendCount();

	//continuusly send the count of the unread notifications 
	const interval = setInterval(sendCount, 1000);
	const interval2 = setInterval(calculateCount, 5000);

	res.on("close", () => {
		clearInterval(interval);
		clearInterval(interval2);
		res.end();
	});
});

async function countUnread(user_id) {
	const q = await db.query("select count(*) from notifications where user_id=$1 and seen=false", [user_id]);
	return q.rows[0].count;
}

export default router;
export { countUnread };

function enableCors(res) {
	return {
		// Website you wish to allow to connect
		'Access-Control-Allow-Origin': config.address_mode.client,
		// Request methods you wish to allow
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
		// Request headers you wish to allow
		'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
		// to the API (e.g. in case you use sessions)
		'Access-Control-Allow-Credentials': true
	}
}

