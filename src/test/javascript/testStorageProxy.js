
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
    it('to validate the constructor', function() {
        var storageProxy = new Backbone.StorageProxy();
        expect(storageProxy instanceof Backbone.StorageProxy).toBe(true);
    });

    it('to validate the factory method', function() {
        var factoryModel = Backbone.Model.extend({
            initialize: function() {
                this.storageProxy = Backbone.StorageProxy.factory(this, []);
            }
        });

        var nonFactoryModel = Backbone.Model.extend({});

        var factoryModelInstance = new factoryModel();
        var nonfactoryModelInstance = new nonFactoryModel();

        // Confirm the factory method registers the sync method for us
        expect(factoryModelInstance.storageProxy instanceof Backbone.StorageProxy).toBe(true);

        // Confirm the constructor does not register the sync method for us,
        // but that this is done when registration of the method is requested
        // manually
        expect(nonfactoryModelInstance.storageProxy).toBe(undefined);
        var modelSyncMethod = nonfactoryModelInstance.sync;

        Backbone.StorageProxy.overrideSync(nonfactoryModelInstance);
        expect(nonfactoryModelInstance.sync).not.toBe(modelSyncMethod);
    });

    it('to confirm the correct registration of valid storage adapters using the appropriate accessor methods', function() {
        function StorageProvider(){}
        function storageProviderCallback() {}

        var storageProxy = new Backbone.StorageProxy();
        expect(storageProxy.setStorageAdapters([
            {adapter: new StorageProvider(), callback: storageProviderCallback},
            {adapter: new StorageProvider(), callback: storageProviderCallback},
            {adapter: new StorageProvider(), callback: storageProviderCallback}
        ])).toBe(storageProxy);
        expect(storageProxy.getStorageAdapters().length).toBe(3);

        expect(storageProxy.setStorageAdapters([
            {adapter: new StorageProvider(), callback: storageProviderCallback},
            {adapter: new StorageProvider(), callback: storageProviderCallback}
        ])).toBe(storageProxy);
        expect(storageProxy.getStorageAdapters().length).toBe(2);

        expect(storageProxy.addStorageAdapter(new StorageProvider(), storageProviderCallback))
            .toBe(storageProxy);
        expect(storageProxy.getStorageAdapters().length).toBe(3);
    });

    // Confirm validation of setStorageAdapters for missing adapter and/or callback
    it('to confirm the correct checking of invalid storage adapters using the appropriate accessor methods', function() {
        function StorageProvider(){}
        function storageProviderCallback() {}

        var storageProxy = new Backbone.StorageProxy();

        // Set validation
        try
        {
            storageProxy.setStorageAdapters([
                {callback: storageProviderCallback}
            ]);
        } catch (ex) {
            expect(ex.message).toBe('Storage adapter at position 0 not defined.');
        }

        try
        {
            storageProxy.setStorageAdapters([
                {adapter: new StorageProvider()}
            ]);
        } catch (ex) {
            expect(ex.message).toBe('Storage adapter callback at position 0 not defined.');
        }

        // Add validation
        try
        {
            storageProxy.addStorageAdapter(null, storageProviderCallback);
        } catch (ex) {
            expect(ex.message).toBe('Storage adapter not defined.');
        }

        try
        {
            storageProxy.addStorageAdapter(new StorageProvider(), null);
        } catch (ex) {
            expect(ex.message).toBe('Storage adapter callback not defined.');
        }
    });

    it('to confirm the correct execution of the sync proxy function without short circuiting', function() {
        var complete1 = false;
        var complete2 = false;

        var modelInstance;
        var syncMethod;
        var syncModel;
        var syncOptions;

        function StorageProvider1() {}
        StorageProvider1.prototype = {
            sync: function(method, model, options) {
                syncMethod = method;
                syncModel = model;
                syncOptions = options;

                expect(model).toBe(modelInstance);
                return 'StorageProvider1';
            }
        };

        function StorageProvider2() {}
        StorageProvider2.prototype = {
            sync: function(method, model, options) {
                syncMethod = method;
                syncModel = model;
                syncOptions = options;

                expect(model).toBe(modelInstance);
                return 'StorageProvider2';
            }
        };

        var Model = Backbone.Model.extend({
            initialize: function()
            {
                this.storageProxy = Backbone.StorageProxy.factory(this, [
                    {adapter: new StorageProvider1(), callback: this.storageProvider1Callback},
                    {adapter: new StorageProvider2(), callback: this.storageProvider2Callback}
                ]);
            },

            storageProvider1Callback: function(method, model, options, results)
            {
                complete1 = true;
                expect(method).toBe(syncMethod);
                expect(model).toBe(syncModel);
                expect(options).toBe(syncOptions);
                expect(results).toBe('StorageProvider1');

                expect(model).toBe(modelInstance);
                return true;
            },

            storageProvider2Callback: function(method, model, options, results)
            {
                complete2 = true;
                expect(method).toBe(syncMethod);
                expect(model).toBe(syncModel);
                expect(options).toBe(syncOptions);
                expect(results).toBe('StorageProvider2');

                expect(this).toBe(modelInstance);
                expect(model).toBe(modelInstance);
                return true;
            }
        });

        // Activate storage adapters
        modelInstance = new Model();
        modelInstance.save();

        expect(complete1).toBe(true);
        expect(complete2).toBe(true);
    });

    it('to confirm the correct execution of the sync proxy function with short circuiting', function() {
        var complete1 = false;
        var complete2 = false;

        var modelInstance;
        var syncMethod;
        var syncModel;
        var syncOptions;

        function StorageProvider1() {}
        StorageProvider1.prototype = {
            sync: function(method, model, options) {
                syncMethod = method;
                syncModel = model;
                syncOptions = options;
                return 'StorageProvider1';
            }
        };

        function StorageProvider2() {}
        StorageProvider2.prototype = {
            sync: function(method, model, options) {
                syncMethod = method;
                syncModel = model;
                syncOptions = options;
                return 'StorageProvider2';
            }
        };

        var Model = Backbone.Model.extend({
            initialize: function()
            {
                this.storageProxy = Backbone.StorageProxy.factory(this, [
                    {adapter: new StorageProvider1(), callback: this.storageProvider1Callback},
                    {adapter: new StorageProvider2(), callback: this.storageProvider2Callback}
                ]);
            },

            storageProvider1Callback: function(method, model, options, results)
            {
                complete1 = true;
                expect(method).toBe(syncMethod);
                expect(model).toBe(syncModel);
                expect(options).toBe(syncOptions);
                expect(results).toBe('StorageProvider1');

                expect(this).toBe(modelInstance);
                expect(model).toBe(modelInstance);
                return false;
            },

            storageProvider2Callback: function(method, model, options, results)
            {
                complete2 = true;
                return true;
            }
        });

        // Activate storage adapters
        modelInstance = new Model();
        modelInstance.save();

        expect(complete1).toBe(true);
        expect(complete2).toBe(false);
    });
});
