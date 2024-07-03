import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const db = mongoose;
db.connect(process.env.DB_LINK);

const QuestSchema = new mongoose.Schema({
	title: { type: String, required: true },
	description: String,
	reward: String,
	rank: { type: String, enum: ["S", "A", "B", "C", "D", "F"] },
	completed: { type: Boolean, default: false },
});

const GuildSchema = new mongoose.Schema({
	guildName: { type: String, required: true },
	description: String,
	members: [
		{
			userId: {
				type: mongoose.Schema.ObjectId,
				ref: "users",
			},
			rank: { type: String, enum: ["Leader", "Veteran", "Novice"], required: true, default: "Novice" },
		},
	],
	activeQuests: [QuestSchema],
});

const UserSchema = new db.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
});

const AdminSchema = new db.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true },
});

const User = db.model("users", UserSchema);
const Guild = db.model("guilds", GuildSchema);
const Admin = db.model("admin", AdminSchema);

export { User, Guild, Admin };
