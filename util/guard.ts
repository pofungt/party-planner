import express from "express";

export const isLoggedIn = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.session?.user) {
    //called Next here
    next();
  } else {
    res.status(404).redirect("/");
  }
};

export const isLoggedInAPI = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	if (req.session?.user) {
		//called Next here
		// console.log('user name', req.session.user);
		next();
	} else {
		// redirect to 404 page
		res.status(400).json({ error: "You don't have the permission" });
	}
};