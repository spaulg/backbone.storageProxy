# Backbone storage provider proxy

A proxy class for allowing multiple storage providers to be utilised on backbone.js models and collections at the same time.

## Usage

```javascript
var model = Backbone.Model.extend({
    storageProxy: Backbone.StorageProxy.factory(this,
        [new Backbone.MyStorageAdapter(), new Backbone.MyOtherStorageAdapter]
    ),
});

var collection = Backbone.Collection.extend({
    storageProxy: Backbone.StorageProxy.factory(this,
        [new Backbone.MyStorageAdapter(), new Backbone.MyOtherStorageAdapter]
    ),
});
```
