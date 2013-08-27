
/*
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
 */

(function() {
    'use strict';

    Backbone.StorageProxy = function(modelOrCollection, storageAdapter)
    {
        this.setStorageAdapter(storageAdapter);
        this._overrideSync(modelOrCollection);

        // Register event handler to "add" event for collection
        // to override sync method for each model added to the collection.
        // Note that any potential storageProxy instance created within the
        // model is overwritten.
        if (modelOrCollection instanceof Backbone.Collection) {
            modelOrCollection.on('add', function(model) {
                if (model.setStorageProxy) {
                    model.setStorageProxy(this);
                } else {
                    model.storageProxy = this;
                }

                this._overrideSync(model);
            }, this);

            modelOrCollection.on('remove', function(model) {
                if (model.setStorageProxy) {
                    model.setStorageProxy(null);
                } else {
                    delete model.storageProxy;
                }

                this._restoreSync(model);
            }, this);
        }
    };

    Backbone.StorageProxy.prototype = {
        /**
         * Storage adapter to forward sync calls to.
         */
        _storageAdapter: null,

        /**
         * Override the sync method of the model or collection.
         *
         * @param modelOrCollection Model or collection object
         */
        _overrideSync: function(modelOrCollection)
        {
            // Override model or collection sync method
            modelOrCollection.backboneSync = modelOrCollection.sync;
            modelOrCollection.sync = function(method, model, options) {
                // Get storage proxy
                var storageProxy;

                if (model.getStorageProxy && model.getStorageProxy() instanceof Backbone.StorageProxy) {
                    storageProxy = model.getStorageProxy();
                } else if (model.storageProxy && model.storageProxy instanceof Backbone.StorageProxy) {
                    storageProxy = model.storageProxy;
                } else if (model.collection && model.collection.getStorageProxy &&
                    model.collection.getStorageProxy() instanceof Backbone.StorageProxy) {
                    storageProxy = model.collection.getStorageProxy();
                } else if (model.collection && model.collection.storageProxy &&
                    model.collection.storageProxy instanceof Backbone.StorageProxy) {
                    storageProxy = model.collection.storageProxy;
                } else {
                    throw new TypeError('Storage proxy not found or removed from model or collection, ' +
                        'or is not of type Backbone.StorageProxy.');
                }

                // Call the storage adapter and return the result
                var storageAdapter = storageProxy.getStorageAdapter();
                return storageAdapter.sync(method, model, options);
            };
        },

        /**
         * Restore the original sync method of the model
         *
         * @param model Model of sync method to restore
         */
        _restoreSync: function(model)
        {
            if (model.backboneSync) {
                model.sync = model.backboneSync;
                delete model.backboneSync;
            }
        },

        /**
         * Set a storage adapter to the proxy.
         *
         * @param storageAdapter Storage adapter
         */
        setStorageAdapter: function(storageAdapter) {
            if (storageAdapter == null) {
                throw new TypeError('Storage adapter not defined.');
            }

            this._storageAdapter = storageAdapter;
        },

        /**
         * Get storage adapter.
         *
         * @returns Storage adapters
         */
        getStorageAdapter: function() {
            return this._storageAdapter;
        }
    };
})();
