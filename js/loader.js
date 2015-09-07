requirejs.config({
    baseUrl: "lib",
    paths: {
        activity: "../js",
        text : "requirejs-plugins/lib/text", //text is required
        json : "requirejs-plugins/src/json", //alias to plugin
    }
});

requirejs(["activity/activity"]);
