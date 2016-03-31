requirejs.config({
    baseUrl: './'
});

requirejs(["app"], function(app) {
    app.run();
})