requirejs.config({
    paths: {
        QUnit: '//cdn.bootcss.com/qunit/1.18.0/qunit.min',
    },
});

requirejs(['QUnit'], function() {
    QUnit.test('firsttest', function(assert) {
        assert.equal(1, 1/3*3);
    });
    QUnit.start();
})