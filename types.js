import { z } from "zod";

const createquest = z.object({
	title: z.string(),
	description: z.string(),
});

const createguild = z.object({
	guildName: z.string(),
	description: z.string(),
});

const updatequest = z.object({
	id: z.string(),
});

const userName = z.string().min(8);
const passWord = z.string().min(8);

export { createguild,createquest, updatequest, userName, passWord };
