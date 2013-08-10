
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
     * Construct a new storage proxy with the storage providers
     * passed.
     *
     * @param modelOrCollection Model or collection to override sync method
     * @param storageProviders Array of storage providers
     * @returns Constructed storage proxy
     */
    Backbone.StorageProxy.factory = function(modelOrCollection, storageProviders)
    {
        Backbone.StorageProxy._overrideSync(modelOrCollection);
        return Backbone.StorageProxy().setStorageProviders(storageProviders);
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

            // Call all storage providers attached to the storage proxy
            // and notify the callbacks with the appropriate responses
            var storageBackEnds = storageProxy.getStorageBackEnds();
            for(var i = 0; i < storageBackEnds.length; i++) {
                var args = _.clone(arguments);
                args.push(storageBackEnds[i].provider.sync.apply(storageBackEnds[i].provider, arguments));

                if (storageBackEnds[i].callback.apply(model, args) !== true) {
                    // Short circuit any further storage provider execution
                    break;
                }
            }
        };
    };

    _.extend(Backbone.StorageProxy.prototype, {
        /**
         * List of storage providers to forward sync calls to.
         */
        _storageProviders: [],

        /**
         * Sets all the list of storage providers to proxy to
         * to the list provided.
         *
         * @param storageBackEnds Array of storage providers
         */
        setStorageProviders: function(storageBackEnds) {
            if (storageBackEnds == null) {
                this.reset();
            } else {
                // Validate storage provider array
                for (var i = 0; i < storageBackEnds.length; i++) {
                    if (storageBackEnds[i].provider == null) {
                        throw new TypeError('Storage provider at position ' + i + ' not defined.');
                    } else if (storageBackEnds[i].callback == null) {
                        throw new TypeError('Callback for storage provider at position ' + i + ' not defined.');
                    }
                }

                this._storageProviders = storageBackEnds;
            }
        },

        /**
         * Add a storage back end to the proxy.
         *
         * @param storageProvider Single storage back end
         * @param callback Callback to execute when storage provider has completed
         */
        addStorageProvider: function(storageProvider, callback) {
            if (storageProvider == null) {
                throw new TypeError('Storage provider not defined.');
            } else if (callback == null) {
                throw new TypeError('Callback not provided.');
            }

            this._storageProviders.push({provider: storageProvider, callback: callback});
        },

        /**
         * Get array of storage providers.
         *
         * @returns Array of storage providers
         */
        getStorageProviders: function() {
            return this._storageProviders;
        }
    });
})();
