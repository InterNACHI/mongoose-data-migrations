module.exports = function(schema, currentVersion, options) {
    // Load options
    options = options || {};
    var versionKey = options.versionKey || '__sv';
    var saveOnMigration = options.saveOnMigration || true;

    // Add version key to schema
    var keys = {};
    keys[versionKey] = {
        'type': Number,
        'default': currentVersion
    };
    schema.add(keys);

    // Objects to hold migration operations
    var migrations = {},
        migrationKeys = [];

    // Migration loops
    function up(next, data, from, to) {
        var len = migrationKeys.length;

        for (var i = 0; i < len; i++) {
            var key = migrationKeys[i];
            if (key <= from) continue;
            if (key > to) break;

            this._migrated = true;
            migrations[key].up.call(this, data);
        }

        data[versionKey] = to;
        next();
    }

    function down(next, data, from, to) {
        for (var i = migrationKeys.length - 1; i >= 0; i--) {
            var key = migrationKeys[i];
            if (key > from) continue;
            if (key <= to) break;

            this._migrated = true;
            migrations[key].down.call(this, data);
        }

        data[versionKey] = to;
        next();
    }

    // Add migration hook
    schema.pre('init', function(next, data) {
        this._migrated = false;
        var docVersion = (data[versionKey] ? parseInt(data[versionKey]) : 0);
        if (docVersion == currentVersion) {
            return next();
        } else {
            var originalData = data;
            try {
                if (currentVersion < docVersion) {
                    down.call(this, next, data, docVersion, currentVersion);
                } else if (currentVersion > docVersion) {
                    up.call(this, next, data, docVersion, currentVersion);
                }
            } catch (error) {
                data = originalData;
                this._migrated = false;
                console.error('Migration error (reverting data): ', error);
            }
        }
    });

    // Save after init if saveOnMigration is set to true
    if (saveOnMigration) {
        schema.post('init', function() {
            this._migrated && this.save();
        });
    }

    // Set up private methods for public interface
    function _checkMigration(migration) {
        if (!migration.version) {
            throw new Error('Migration version is required.');
        }
        if (!migration.up) {
            throw new Error('Migration up() is required.');
        }
        if (!migration.down) {
            throw new Error('Migration down() is required.');
        }
    }

    // Return public interface
    return {
        'migrations': migrations,
        add: function(migration) {
            _checkMigration(migration);
            migrations[migration.version] = migration;
            migrationKeys.push(migration.version);
            migrationKeys.sort();
            return this;
        }
    };
}


/*
migrations(schema, 2, {})
    .add({
        version: 1,
        up: function(doc) {},
        down: function(doc) {}
    });
*/