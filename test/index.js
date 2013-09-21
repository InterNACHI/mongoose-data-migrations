var vows = require('vows'),
    assert = require('assert'),
    migration = require('../');

/*
TESTS:

Does it adhere to options?  Custom key; save on edit.
Does it migrate up 1 level?
Does it migrate up multiple levels?
What about skipping past levels?
What if the doc is the current level?
Same for down: 1 and many.
What about if migration causes errors?
*/

function mockSchema() {
    return {
        add: sinon.spy().withArgs('__sv'),
        pre: sinon.spy()
    };
}

vows.describe('Set')
    .addBatch({
        'Batch': {
            topic: function() {
            },
            'Result': function(result) {
            }
        }
    })

    // Export to module
    .export(module);