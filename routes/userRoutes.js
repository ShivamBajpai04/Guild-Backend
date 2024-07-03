import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";
import { User, Guild } from "../db/index.js";
import userMiddleware from "../middleware/userMiddleware.js";
import dotenv from "dotenv";
import { createquest, userName, passWord } from "../types.js";
import bcrypt from "bcrypt";

dotenv.config();

router.post("/signup", async (req, res) => {
	// Implement user signup logic
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

	const response = await User.findOne({
		username,
		email,
		password,
	});
	if (!response) {
		await User.create({
			username,
			email,
			password: hash,
		});

		res.status(200).json({
			msg: "Success: User Created",
		});
	} else {
		res.status(403).json({
			msg: "User already exists",
		});
	}
});

router.post("/signin", async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const email = req.body.email;
	const response = await User.findOne({
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

router.post("/addQuest", userMiddleware, async (req, res) => {
	const username = req.username;
	const title = req.body.title;
	const description = req.body.description;
	const result = createquest.safeParse({
		title,
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
		const addedquests = await User.updateOne(
			{
				username,
			},
			{
				$push: {
					quests: {
						title: title,
						description: description,
					},
				},
			}
		);
		res.status(200).json({
			msg: "quest added",
			quests: addedquests.quests,
		});
	} catch (e) {
		res.json({
			msg: "Could not add quest",
		});
	}
});

router.get("/myQuests", userMiddleware, async (req, res) => {
	const user = await User.findOne({
		username: req.username,
	});
	const quests = user.quests;
	if (quests.length) {
		res.status(200).json({
			quests,
		});
	} else {
		res.status(403).json({
			msg: "No quests Added",
		});
	}
});

router.get("/guilds", async (req, res) => {
	// Implement listing all courses logic
	const guilds = await Guild.find({});
	res.status(200).json({
		guilds: guilds,
	});
});

router.get("/guilds:id", async (req, res) => {
	// Implement listing all courses logic
	const guilds = await Guild.find({ _id: req.params.id });
	res.status(200).json({
		guilds: guilds,
	});
});

// router.patch("/completed/:id", async (req, res) => {
// 	try {
// 		// Find the user by username and the specific quest by ID
// 		// const username = req.username;
// 		const questId = req.params.id;
// 		const result = await User.updateOne(
// 			{ "quests._id": questId },
// 			{
// 				$set: { "quests.$.completed": true },
// 			}
// 		);
// 		// console.log(result);
// 		if (result.modifiedCount > 0) {
// 			res.status(200).json({ message: "quest marked as completed." });
// 		} else {
// 			res.status(404).json({ message: "quest not found or already completed." });
// 		}
// 	} catch (error) {
// 		console.error("Error updating quest:", error);
// 		res.status(500).json({ message: "Internal server error." });
// 	}
// });

// router.patch("/update/:id", async (req, res) => {
// 	try {
// 		// Find the user by username and the specific quest by ID
// 		// const username = req.username;
// 		const title = req.body.title;
// 		const description = req.body.description;
// 		const questId = req.params.id;
// 		let result;
// 		if (title) {
// 			result = await User.updateOne(
// 				{ "quests._id": questId },
// 				{
// 					$set: { "quests.$.title": title },
// 				}
// 			);
// 		}
// 		if (description) {
// 			result = await User.updateOne(
// 				{ "quests._id": questId },
// 				{
// 					$set: { "quests.$.description": description },
// 				}
// 			);
// 		}
// 		console.log(result);
// 		if (result.modifiedCount > 0) {
// 			res.status(200).json({ message: "quest Updated" });
// 		} else {
// 			res.status(404).json({ message: "quest not found" });
// 		}
// 	} catch (error) {
// 		console.error("Error updating quest:", error);
// 		res.status(500).json({ message: "Internal server error." });
// 	}
// });

export default router;
