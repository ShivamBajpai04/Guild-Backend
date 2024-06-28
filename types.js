import { z } from "zod";

const createTodo = z.object({
	title: z.string(),
	description: z.string(),
});

const updateTodo = z.object({
	id: z.string(),
});

const userName = z.string().min(8);
const passWord = z.string().min(8);

export { createTodo, updateTodo, userName, passWord };
