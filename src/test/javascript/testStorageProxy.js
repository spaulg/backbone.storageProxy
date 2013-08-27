
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

describe('Check Storage Proxy construction', function() {
    function StorageAdapter() {}
    StorageAdapter.prototype = {
        sync: function(method, model, options) {
            return [method, model, options];
        }
    };

    var Model = Backbone.Model.extend({
        initialize: function() {
            this.storageProxy = new Backbone.StorageProxy(this, new StorageAdapter());
        }
    });

    var Model2 = Backbone.Model.extend({
        storageProxyObject: null,

        initialize: function() {
            this.storageProxyObject = new Backbone.StorageProxy(this, new StorageAdapter());
        },

        setStorageProxy: function(proxy) {
            this.storageProxyObject = proxy;
        },

        getStorageProxy: function() {
            return this.storageProxyObject;
        }
    });





    it('to validate the factory method', function() {
        var modelInstance = new Model();
        expect(modelInstance.storageProxy instanceof Backbone.StorageProxy).toBe(true);
    });

    it('to confirm the correct registration of a valid storage adapter', function() {
        var modelInstance = new Model();
        var storageAdapter = new StorageAdapter();
        modelInstance.storageProxy.setStorageAdapter(storageAdapter);

        expect(storageAdapter).
            toBe(modelInstance.storageProxy.getStorageAdapter());
    });

    // Confirm validation of setStorageAdapter for missing adapter and/or callback
    it('to confirm the correct checking of an invalid storage adapter', function() {
        var modelInstance = new Model();

        // Add validation
        try
        {
            modelInstance.storageProxy.setStorageAdapter(null);
        } catch (ex) {
            expect(ex.message).toBe('Storage adapter not defined.');
        }
    });

    it('to confirm the correct execution of the sync proxy function', function() {
        // Activate storage adapters
        var method = 'create';
        var options = {};
        var modelInstance = new Model();
        var result = modelInstance.sync(method, modelInstance, options);

        expect(result[0]).toBe(method);
        expect(result[1]).toBe(modelInstance);
        expect(result[2]).toBe(options);
    });

    it('to confirm the correct retrieval of a proxy using the model setter/getter methods', function() {
        var method = 'create';
        var options = {};
        var modelInstance = new Model2();
        var result = modelInstance.sync(method, modelInstance, options);

        expect(result[0]).toBe(method);
        expect(result[1]).toBe(modelInstance);
        expect(result[2]).toBe(options);
    });
});
