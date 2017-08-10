//
// Mocha test framework, documentation on https://mochajs.org/.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    let data;
    let source = ' this is label text before <input name="_inputName" type="checkbox" class="_inputClass" value="_inputValue with some spaces" @[PLACEHOLDER]@ disabled> this is label text after';
    let testElements = [
        '<input name="_inputName" type="checkbox" class="_inputClass" value="_inputValue with some spaces" @[PLACEHOLDER]@ disabled>',
        '<input value="" @[PLACEHOLDER]@ id="_id" disabled name="_inputName" type="checkbox" class="">'
    ];

    test('A01 - scanElementForAttributes() - Should find all attributes in valid element string.', function() {
        data = myExtension.scanElementForAttributes(testElements[0]);
        assert.equal(data.nodename, 'input');
        assert.equal(data.element, testElements[0]);
        assert.equal(data.attribute.name, '_inputName');
        assert.equal(data.attribute.type, 'checkbox');
        assert.equal(data.attribute.class, '_inputClass');
        assert.equal(data.attribute.value, '_inputValue with some spaces');
        assert.equal(data.attribute['@[PLACEHOLDER]@'], null);
        assert.equal(data.attribute.disabled, null);
    });

    test('A02 - scanElementForAttributes() - Should only find these set of attributes.', function() {
        var count = 0;
        var expectedObjectKeys = "attributes element nodename";
        var expectedAttrKeys = "name type class value @[PLACEHOLDER]@' disabled";
        var notFound = 0;

        data = myExtension.scanElementForAttributes(testElements[0]);

        // The object keys
        Object.keys(data).forEach(function (key) {
            if (expectedObjectKeys.indexOf(key) >= 0) {
                count += 1;
            } else {
                notFound += 1;
            }
        });

        assert.equal(notFound, 0);
        assert.equal(count, 3);

        // The attribute keys
        count = 0;
        notFound = 0;
        Object.keys(data.attribute).forEach(function (key) {
            if (expectedAttrKeys.indexOf(key) >= 0) {
                count += 1;
            } else {
                notFound += 1;
            }
        });

        assert.equal(notFound, 0);
        assert.equal(count, 6);

        // Values off attribute keys
        assert.equal(data.nodename, 'input');
        assert.equal(data.element, testElements[0]);
        assert.equal(data.attribute.name, '_inputName');
        assert.equal(data.attribute.type, 'checkbox');
        assert.equal(data.attribute.class, '_inputClass');
        assert.equal(data.attribute.value, '_inputValue with some spaces');
        assert.equal(data.attribute['@[PLACEHOLDER]@'], null);
        assert.equal(data.attribute.disabled, null);
    });

    test('B01 - addClassString() - Should ADD a class to Class string.', function() {
        // Empty
        data = myExtension.addClassString("", "testclass");
        assert.equal(data, "testclass");

        // Has other classes
        data = myExtension.addClassString("already has classes", "testclass");
        assert.equal(data, "already has classes testclass");

        // Same class exists
        data = myExtension.addClassString("testclass", "testclass");
        assert.equal(data, "testclass");

        data = myExtension.addClassString("testclass and more classes", "testclass");
        assert.equal(data, "testclass and more classes");

        data = myExtension.addClassString("more classes with testclass", "testclass");
        assert.equal(data, "more classes with testclass");

        data = myExtension.addClassString("more classes and testclass within", "testclass");
        assert.equal(data, "more classes and testclass within");

        data = myExtension.addClassString("more classes and testclassSuper within", "testclass");
        assert.equal(data, "more classes and testclassSuper within testclass");

        data = myExtension.addClassString("more classes and Supertestclass within", "testclass");
        assert.equal(data, "more classes and Supertestclass within testclass");

        data = myExtension.addClassString("more classes and SupertestclassSuper within", "testclass");
        assert.equal(data, "more classes and SupertestclassSuper within testclass");
    });

    test('C01 - removeClassString() - Should REMOVE a class from a Class string.', function() {   
        data = myExtension.removeClassString("testclass", "testclass");
        assert.equal(data, "");

        data = myExtension.removeClassString("already has classes testclass", "testclass");
        assert.equal(data, "already has classes");

        data = myExtension.removeClassString("testclass already has classes", "testclass");
        assert.equal(data, "already has classes");

        data = myExtension.removeClassString("testclassalready has testclass classes", "testclass");
        assert.equal(data, "testclassalready has classes");

        data = myExtension.removeClassString("test", "testclass");
        assert.equal(data, "test");

        data = myExtension.removeClassString("", "testclass");
        assert.equal(data, "");
    });

    test('D01 - buildElementString() - Should build a element string from an given object.', function() {
        // FIXED Sequence ["id", "name", "value", "type", "disabled", "class"];
        var reformedElement = [
        '<input name="_inputName" value="_inputValue with some spaces" type="checkbox" disabled class="_inputClass" @[PLACEHOLDER]@>',
        '<input id="_id" name="_inputName" value="" type="checkbox" disabled class="" @[PLACEHOLDER]@>'];

        data = myExtension.buildElementString(myExtension.scanElementForAttributes(testElements[0]));
        assert.equal(data, reformedElement[0]);

        data = myExtension.buildElementString(myExtension.scanElementForAttributes(testElements[1]));
        assert.equal(data, reformedElement[1]);
    });
});
