requirejs.config({
    paths: {
        qunit: '//cdn.bootcss.com/qunit/1.18.0/qunit.min',
    },
});

requirejs(['qunit'], function() {
    qunit.test('firsttest', function(assert) {
        assert.equal(1, 1/3*3);
    });
})