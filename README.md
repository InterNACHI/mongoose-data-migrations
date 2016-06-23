# Mongoose Schema Migrations

Performs mongoose data migrations on document init.

## Brief Example

```javascript
var schema = new mongoose.Schema({ /* ... */ });

var currentSchemaVersion = 2;
var opts = {
    versionKey: '__sv',   // The default
    saveOnMigration: true // Also the default
};

migrations(schema, currentSchemaVersion, opts).add({
    version: 1,
    up: function() {
        var data = this;
        var nameParts = data.name.split(' ', 2);
        data.firstName = nameParts[0];
        data.lastName = nameParts[1];
        delete data.name;
    },
    down: function() {
        var data = this;
        data.name = data.firstName + ' ' + data.lastName;
        delete data.firstName;
        delete data.lastName;
    }
}).add({
    version: 2,
    up: function() {
        var data = this;
        var lastNameParts = data.lastName.split(',', 2);
        data.suffix = null;
        if (2 == lastNameParts.length) {
            data.lastName = lastNameParts[0];
            data.suffix = lastNameParts[1].replace(/^\s/, '');
        }
    },
    down: function() {
        var data = this;
        if (data.suffix) {
            data.lastName += ', ' + data.suffix;
            delete data.suffix;
        }
    }
});
```