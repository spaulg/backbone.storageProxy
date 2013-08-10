# Backbone Storage Adapter Proxy

A proxy class for allowing multiple storage adapters to be utilised on backbone.js
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
        [{adapter: new Backbone.MyStorageAdapter(),
            callback: myStorageAdapterCallback},
        {adapter: new Backbone.MyOtherStorageAdapter(),
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
        [{adapter: new Backbone.MyStorageAdapter(),
            callback: myStorageAdapterCallback},
        {adapter: new Backbone.MyOtherStorageAdapter(),
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

## Storage Adapter Interface

Each storage adapter must implement the Backbone.sync function.

This function is called by the storage proxy with the parameters as provided to the model or
collection sync method, which is storage proxy overrides.

## Storage Adapter Result Callback

After the sync method of each storage adapter has been invoked, a callback is made that must
be registered for each storage adapter when added to the storage proxy. This callback
takes four arguments. The first three arguments are those passed to the sync method, with
the fourth argument being the result of the sync call on the storage adapter.

This allows custom handling of the result of each storage adapter sync call to each model or
collection as required.

The return value of this callback is used to indicate whether the storage proxy should continue
with further storage adapter invocations.

If the callback returns true, the invocation of further storage adapters will continue. All
other return status will suspend further storage adapter invocation.

## License

Copyright 2013 Simon Paulger <spaulger@codezen.co.uk>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
