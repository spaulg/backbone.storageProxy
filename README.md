# Backbone storage provider proxy

A proxy class for allowing multiple storage providers to be utilised on backbone.js models and collections at the same time.

## Usage

Include the storage proxy once backbone.js has been loaded

```html
<script src="backbone.js"></script>
<script src="backbone.storageProxy.js"></script>
```
Register the storage proxy into each model and collection that requires it.

```javascript
var model = Backbone.Model.extend({
    storageProxy: Backbone.StorageProxy.factory(this,
        [new Backbone.MyStorageAdapter(), new Backbone.MyOtherStorageAdapter()]
    ),
});

var collection = Backbone.Collection.extend({
    storageProxy: Backbone.StorageProxy.factory(this,
        [new Backbone.MyStorageAdapter(), new Backbone.MyOtherStorageAdapter()]
    ),
});
```
