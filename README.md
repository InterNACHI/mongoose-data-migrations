# Mongoose Schema Migrations

Performs mongoose data migrations on document init.

## Brief Example

```javascript
var schema = new mongoose.Schema({ /* ... */ });

var currentSchemaVersion = 2;
migrations(schema, currentSchemaVersion).add({
    version: 1,
    up: function(data) {
        var nameParts = data.name.split(' ', 2);
        data.firstName = nameParts[0];
        data.lastName = nameParts[1];
        delete data.name;
    },
    down: function(data) {
        data.name = data.firstName + ' ' + data.lastName;
        delete data.firstName;
        delete data.lastName;
    }
}).add({
    version: 2,
    up: function(data) {
        var lastNameParts = data.lastName.split(',', 2);
        data.suffix = null;
        if (2 == lastNameParts.length) {
            data.lastName = lastNameParts[0];
            data.suffix = lastNameParts[1].replace(/^\s/, '');
        }
    },
    down: function(data) {
        if (data.suffix) {
            data.lastName += ', ' + data.suffix;
            delete data.suffix;
        }
    }
});
```