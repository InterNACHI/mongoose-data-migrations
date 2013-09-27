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
    function up(from, to) {
        var len = migrationKeys.length;

        for (var i = 0; i < len; i++) {
            var key = migrationKeys[i];
            if (key <= from) continue;
            if (key > to) break;

            this._migrated = true;
            migrations[key].up.call(this);
        }

        this._migrated && this.set(versionKey, to);
    }

    function down(from, to) {
        for (var i = migrationKeys.length - 1; i >= 0; i--) {
            var key = migrationKeys[i];
            if (key > from) continue;
            if (key <= to) break;

            this._migrated = true;
            migrations[key].down.call(this);
        }

        this._migrated && this.set(versionKey, to);
    }

    // Add migration hooks
    schema.pre('init', function(next, data) {
        this._rawDocVersion = (data[versionKey] ? parseInt(data[versionKey]) : 0);
        next();
    });
    schema.post('init', function() {
        var docVersion = this._rawDocVersion;
        this._migrated = false;
        if (docVersion == currentVersion) {
            return; // next();
        } else {
            try {
                if (currentVersion < docVersion) {
                    down.call(this, docVersion, currentVersion);
                } else if (currentVersion > docVersion) {
                    up.call(this, docVersion, currentVersion);
                }
            } catch (error) {
                // this._migrated = false;
                console.error('Migration error: ', error);
            }

            // Save after init if saveOnMigration is set to true
            if (this._migrated && saveOnMigration) {
                this.save();
            }
        }
    });

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
};