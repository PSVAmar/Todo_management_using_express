const app = require("./app");

// eslint-disable-next-line no-undef
app.listen(process.env.port || 3000, () => {
  console.log("Server started at port 3000");
});
