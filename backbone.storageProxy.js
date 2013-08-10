
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

    Backbone.StorageProxy = function()
    {

    };

    /**
     * Construct a new storage proxy with the storage adapters
     * passed.
     *
     * @param modelOrCollection Model or collection to override sync method
     * @param storageAdapters Array of storage adapters
     * @returns Constructed storage proxy
     */
    Backbone.StorageProxy.factory = function(modelOrCollection, storageAdapters)
    {
        Backbone.StorageProxy._overrideSync(modelOrCollection);
        return Backbone.StorageProxy().setStorageAdapters(storageAdapters);
    };

    /**
     * Override the sync method of the model or collection.
     *
     * @param modelOrCollection Model or collection object
     * @private
     */
    Backbone.StorageProxy._overrideSync = function(modelOrCollection)
    {
        // Override model or collection sync method
        modelOrCollection.backboneSync = modelOrCollection.sync;
        modelOrCollection.sync = function(method, model, options) {
            // Get storage proxy
            var storageProxy = model.storageProxy || model.collection.storageProxy;

            // If no storage proxy exists, throw an exception as it must have been removed
            // inappropriately which will likely result in unanticipated results when syncing.
            if (storageProxy == null || !storageProxy instanceof Backbone.StorageProxy) {
                throw new TypeError('Storage proxy not found or removed from model or collection, ' +
                    'or is not of type Backbone.StorageProxy.');
            }

            // Call all storage adapters attached to the storage proxy
            // and notify the callbacks with the appropriate responses
            var storageAdapters = storageProxy.getStorageAdapters();
            for(var i = 0; i < storageAdapters.length; i++) {
                var args = _.clone(arguments);
                args.push(storageAdapters[i].adapter.sync.apply(storageAdapters[i].adapter, arguments));

                if (storageAdapters[i].callback.apply(model, args) !== true) {
                    // Short circuit any further storage adapter execution
                    break;
                }
            }
        };
    };

    _.extend(Backbone.StorageProxy.prototype, {
        /**
         * List of storage adapters to forward sync calls to.
         */
        _storageAdapters: [],

        /**
         * Sets all the list of storage adapters to proxy to
         * to the list provided.
         *
         * @param storageAdapters Array of storage adapters
         */
        setStorageAdapters: function(storageAdapters) {
            if (storageAdapters == null) {
                this.reset();
            } else {
                // Validate storage adapter array
                for (var i = 0; i < storageAdapters.length; i++) {
                    if (storageAdapters[i].adapter == null) {
                        throw new TypeError('Storage adapter at position ' + i + ' not defined.');
                    } else if (storageAdapters[i].callback == null) {
                        throw new TypeError('Callback for storage adapter at position ' + i + ' not defined.');
                    }
                }

                this._storageAdapters = storageAdapters;
            }
        },

        /**
         * Add a storage adapter to the proxy.
         *
         * @param storageAdapter Single storage adapter
         * @param callback Callback to execute when storage adapter has completed
         */
        addStorageAdapter: function(storageAdapter, callback) {
            if (storageAdapter == null) {
                throw new TypeError('Storage adapter not defined.');
            } else if (callback == null) {
                throw new TypeError('Storage adapter callback not defined.');
            }

            this._storageAdapters.push({adapter: storageAdapter, callback: callback});
        },

        /**
         * Get array of storage adapters.
         *
         * @returns Array of storage adapters
         */
        getStorageAdapters: function() {
            return this._storageAdapters;
        }
    });
})();
