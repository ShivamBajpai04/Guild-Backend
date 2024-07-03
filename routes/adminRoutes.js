import { Router } from "express";
const adminRouter = Router();
import jwt from "jsonwebtoken";
import { Guild, Admin } from "../db/index.js";
import dotenv from "dotenv";
import { createguild, userName, passWord } from "../types.js";
import bcrypt from "bcrypt";
import adminMiddleware from "../middleware/adminMiddleware.js";

dotenv.config();

adminRouter.post("/signup", async (req, res) => {
	// Implement Admin signup logic
	const username = req.body.username;
	const password = req.body.password;
	const email = req.body.email;

	const validUsername = userName.safeParse(username);
	const validpassword = passWord.safeParse(password);

	if (!validUsername.success || !validpassword.success) {
		res.json({
			msg: "invalid username or password",
		});
		return;
	}

	const hash = await bcrypt.hash(password, 10);

	const response = await Admin.findOne({
		username,
		email,
		password,
	});
	if (!response) {
		await Admin.create({
			username,
			email,
			password: hash,
		});

		res.status(200).json({
			msg: "Success: Admin Created",
		});
	} else {
		res.status(403).json({
			msg: "Admin already exists",
		});
	}
});

adminRouter.post("/signin", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const email = req.body.email;
	const response = await Admin.findOne({
		username,
	});

	const isValid = bcrypt.compare(password, response.password);

	if (isValid) {
		const token = jwt.sign(username, process.env.JWT_SECRET);
		res.status(200).json({
			token,
		});
	} else {
		res.status(411).json({
			msg: "invalid username or password",
		});
	}
});

adminRouter.post("/addGuild", adminMiddleware, async (req, res) => {
	const guildName = req.body.guildName;
	const description = req.body.description;
	const result = createguild.safeParse({
		guildName,
		description,
	});
	if (!result.success) {
		res.status(411).json({
			msg: "Invalid inputs",
		});
		return;
	}
	//Add quest to DB
	try {
		const addedguild = await Guild.create({
			guildName,
			description,
		});
		res.status(200).json({
			msg: "guild added",
			guild: addedguild,
		});
	} catch (e) {
		res.json({
			msg: "Could not add quest",
		});
	}
});

// adminRouter.get("/myQuests", userMiddleware, async (req, res) => {
// 	const Admin = await Admin.findOne({
// 		username: req.username,
// 	});
// 	const quests = Admin.quests;
// 	if (quests.length) {
// 		res.status(200).json({
// 			quests,
// 		});
// 	} else {
// 		res.status(403).json({
// 			msg: "No quests Added",
// 		});
// 	}
// });

adminRouter.get("/guilds", async (req, res) => {
	// Implement listing all courses logic
	const guilds = await Guild.find({});
	res.status(200).json({
		guilds: guilds,
	});
});

export default adminRouter;
