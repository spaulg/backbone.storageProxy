# Backbone Storage Provider Proxy

A proxy class for allowing multiple storage providers to be utilised on backbone.js
models and collections at the same time.

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
        [{provider: new Backbone.MyStorageAdapter(),
            callback: myStorageAdapterCallback},
        {provider: new Backbone.MyOtherStorageAdapter(),
            callback: myOtherStorageAdapterCallback}]
    ),

    myStorageAdapterCallback: function(method, model, options, result) {

        // ...

        return true;
    },

    myOtherStorageAdapterCallback: function(method, model, options, result) {

        // ...

        return true;
    }

});

var collection = Backbone.Collection.extend({
    storageProxy: Backbone.StorageProxy.factory(this,
        [{provider: new Backbone.MyStorageAdapter(),
            callback: myStorageAdapterCallback},
        {provider: new Backbone.MyOtherStorageAdapter(),
            callback: myOtherStorageAdapterCallback}]
    ),

    myStorageAdapterCallback: function(method, model, options, result) {

        // ...

        return true;
    },

    myOtherStorageAdapterCallback: function(method, model, options, result) {

        // ...

        return true;
    }
});
```

## Storage Provider Interface

Each storage provider must implement the Backbone.sync function.

This function is called by the storage proxy with the parameters as provided to the model or
collection sync method, which is overridden.

## Storage Provider Result Callback

After the sync method of each storage provider has been invoked, a callback is made that must
be registered for each storage provider when added to the storage proxy. This callback
takes 4 arguments. The first 3 arguments are those passed to the sync method, with the fourth
argument being the result of the sync call on the storage provider.

This allows custom handling of the result of each storage provider sync call to each model or
collection as required.

The return value of this callback is used to indicate whether the storage proxy should continue
with further storage provider invocations.

If the callback returns true, the invocation of further storage providers will continue. All
other return status will suspend further storage provider invocation.
