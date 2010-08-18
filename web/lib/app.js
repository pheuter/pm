configure(function() {
    set("root", __dirname);

    use(Logger);
    use(Static, { path: require("path").join(__dirname, "..", "public") });
    enable("show exceptions");
});

get("/", function() {
	this.render("index.html.haml");
});

run(parseInt(process.env.PORT || 8080), null);