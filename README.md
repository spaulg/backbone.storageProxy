# Backbone Storage Adapter Proxy

A proxy class for tracking and forwarding sync method calls on models and collections in
which the proxy has been applied to a storage adapter. This is done by overriding the sync
method to proxy any request. If the proxy is applied to a collection, each model added
to the collection will also have its sync method overridden.

The plugin does not override the standard Backbone.sync method. This ensures multiple 
storage adapters can coexist without having to worry about adapter compatibility.

## Usage

Load the storage proxy after backbone.js has been loaded.

```html
<script src="backbone.js"></script>
<script src="backbone.storageProxy.js"></script>
```

Register the storage proxy into each model and collection that requires it
using the backbone initialize function. The object property used must be 'storageProxy'.

```javascript
var model = Backbone.Model.extend({
    initialize: function() {
        this.storageProxy = new Backbone.StorageProxy(this, new Backbone.MyStorageAdapter())
    }
});

var collection = Backbone.Collection.extend({
    initialize: function() {
        this.storageProxy = new Backbone.StorageProxy(this, new Backbone.MyStorageAdapter())
    }
});
```

## Storage Adapter Interface

The storage adapter added to the proxy must implement the sync function, matching the
same function signature as Backbone.sync.

This function is called by the storage proxy with the parameters as provided to the model or
collection sync method with which the storage proxy overrides.

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
