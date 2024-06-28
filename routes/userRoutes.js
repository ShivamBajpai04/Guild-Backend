import { Router } from "express";
const router = Router();
import jwt from "jsonwebtoken";
import { User } from "../db/index.js";
import userMiddleware from "../middleware/userMiddleware.js";
import dotenv from "dotenv";
import { createTodo, userName, passWord } from "../types.js";
import bcrypt from "bcrypt";

dotenv.config();

router.post("/signup", async (req, res) => {
	// Implement user signup logic
	const username = req.body.username;
	const password = req.body.password;
	
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
		password,
	});
	if (!response) {
		await User.create({
			username,
			password:hash,
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

	const response = await User.findOne({
		username,
	});

	const isValid = bcrypt.compare(password,response.password)

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

router.post("/todo", userMiddleware, async (req, res) => {
	const username = req.username;
	const title = req.body.title;
	const description = req.body.description;
	const result = createTodo.safeParse({
		title,
		description,
	});
	if (!result.success) {
		res.status(411).json({
			msg: "Invalid inputs",
		});
		return;
	}
	//Add todo to DB
	try {
		const addedTodos = await User.updateOne(
			{
				username,
			},
			{
				$push: {
					todos: {
						title: title,
						description: description,
					},
				},
			}
		);
		res.status(200).json({
			msg: "Todo added",
			todos: addedTodos.todos,
		});
	} catch (e) {
		res.json({
			msg: "Could not add todo",
		});
	}
});

router.get("/todos", userMiddleware, async (req, res) => {
	const user = await User.findOne({
		username: req.username,
	});
	const todos = user.todos;
	if (todos.length) {
		res.status(200).json({
			todos,
		});
	} else {
		res.status(403).json({
			msg: "No Todos Added",
		});
	}
});

router.patch("/completed/:id", async (req, res) => {
	try {
		// Find the user by username and the specific todo by ID
		// const username = req.username;
		const todoId = req.params.id;
		const result = await User.updateOne(
			{ "todos._id": todoId },
			{
				$set: { "todos.$.completed": true },
			}
		);
		// console.log(result);
		if (result.modifiedCount > 0) {
			res.status(200).json({ message: "Todo marked as completed." });
		} else {
			res.status(404).json({ message: "Todo not found or already completed." });
		}
	} catch (error) {
		console.error("Error updating todo:", error);
		res.status(500).json({ message: "Internal server error." });
	}
});

router.patch("/update/:id", async (req, res) => {
	try {
		// Find the user by username and the specific todo by ID
		// const username = req.username;
		const title = req.body.title;
		const description = req.body.description;
		const todoId = req.params.id;
		let result;
		if (title) {
			result = await User.updateOne(
				{ "todos._id": todoId },
				{
					$set: { "todos.$.title": title },
				}
			);
		}
		if (description) {
			result = await User.updateOne(
				{ "todos._id": todoId },
				{
					$set: { "todos.$.description": description },
				}
			);
		}
		console.log(result);
		if (result.modifiedCount > 0) {
			res.status(200).json({ message: "Todo Updated" });
		} else {
			res.status(404).json({ message: "Todo not found" });
		}
	} catch (error) {
		console.error("Error updating todo:", error);
		res.status(500).json({ message: "Internal server error." });
	}
});

export default router;
