import express, { Application, Request, Response } from "express";
import { postRouter } from "./modules/post/post.router";

const app: Application = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// user related api
app.use("/posts", postRouter);

export default app;
