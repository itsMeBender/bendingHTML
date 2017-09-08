//
// Mocha test framework, documentation on https://mochajs.org/.
//

// The module 'assert' provides assertion methods from node
import * as assert from "assert";

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as myExtension from "../src/extension";

import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextEditor = vscode.TextEditor;
import TextLine = vscode.TextLine;
import Window = vscode.window;

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    let data;
    let source = ' this is label text before <input name="_inputName" type="checkbox" class="_inputClass"' +
    ' value="_inputValue with some spaces" @[PLACEHOLDER]@ disabled> this is label text after';
    let testElements = [
        '<input name="_inputNameA" type="radio" class="_inputClass" value="_inputValueA with some spaces" @[PLACEHOLDER]@ disabled>',
        '<input value="" @[PLACEHOLDER]@ id="_id" disabled name="_inputNameB" type="radio" class="">',
        '<input name="_inputNameC" type="checkbox" class="_inputClass" value="_inputValue with some spaces" @[PLACEHOLDER]@ disabled>',
        '<input value="" @[PLACEHOLDER]@ id="_id" disabled name="_inputNameD" type="checkbox" class="">',
    ];

    let e = Window.activeTextEditor;
    let d = e.document;
    // let sel = e.selections;

    test("A01 - scanElementForAttributes() - Should find all attributes in valid element string.", function() {
        data = myExtension.scanElementForAttributes(testElements[0]);
        assert.equal(data.nodename, "input");
        assert.equal(data.element, testElements[0]);
        assert.equal(data.attribute.name, "_inputNameA");
        assert.equal(data.attribute.type, "radio");
        assert.equal(data.attribute.class, "_inputClass");
        assert.equal(data.attribute.value, "_inputValueA with some spaces");
        assert.equal(data.attribute["@[PLACEHOLDER]@"], null);
        assert.equal(data.attribute.disabled, null);
    });

    test("A02 - scanElementForAttributes() - Should only find these set of attributes.", function() {
        let count = 0;
        let expectedObjectKeys = "attributes element nodename";
        let expectedAttrKeys = "name type class value @[PLACEHOLDER]@' disabled";
        let notFound = 0;

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
        assert.equal(data.nodename, "input");
        assert.equal(data.element, testElements[0]);
        assert.equal(data.attribute.name, "_inputNameA");
        assert.equal(data.attribute.type, "radio");
        assert.equal(data.attribute.class, "_inputClass");
        assert.equal(data.attribute.value, "_inputValueA with some spaces");
        assert.equal(data.attribute["@[PLACEHOLDER]@"], null);
        assert.equal(data.attribute.disabled, null);
    });

    test("B01 - addClassString() - Should ADD a class to Class string.", function() {
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

    test("C01 - removeClassString() - Should REMOVE a class from a Class string.", function() {
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

    test("D01 - searchNeighborElement() - Should find TestBlock1 input with label text after", function() {
        let labelSelection: Selection;
        let line;
        let range: Range;
        let testLineNo: number;

        // Locate FILE test string `<input name="test1" value="A" type="radio"> ++This is label text A++`
        testLineNo = 13;
        line = d.lineAt(testLineNo); // Start counting from 0.
        labelSelection = new Selection(
            new Position(testLineNo, line.text.indexOf("++")),
            new Position(testLineNo, line.text.lastIndexOf("++") + 2),
        );

        range = myExtension.searchNeighborElement(e, d, [labelSelection], "input");
        assert.equal(range.start.line, 13);
        assert.equal(range.start.character, 4);
        assert.equal(range.end.character, 47);
    });

    test("D02 - searchNeighborElement() - Should find TestBlock2 input with label text before", function() {
        let labelSelection: Selection;
        let line;
        let range: Range;
        let testLineNo: number;

        // Locate FILE test string `++This is label text B++<input value="B" type="radio" name="test2">`
        testLineNo = 17;
        line = d.lineAt(testLineNo); // Start counting from 0.
        labelSelection = new Selection(
            new Position(testLineNo, line.text.indexOf("++")),
            new Position(testLineNo, line.text.lastIndexOf("++") + 2),
        );

        range = myExtension.searchNeighborElement(e, d, [labelSelection], "input");
        assert.equal(range.start.line, testLineNo);
        assert.equal(range.start.character, 28);
        assert.equal(range.end.character, 71);
    });

    test("D03 - searchNeighborElement() - Implement label-element for TestBlock3", function(done) {
        let labelSelection: Selection;
        let line;
        let range: Range;
        let testLineNo: number;

        // Locate FILE test string `++This is label text B++<input value="B" type="radio" name="test2">`
        testLineNo = 21;
        line = d.lineAt(testLineNo); // Start counting from 0.
        labelSelection = new Selection(
            new Position(testLineNo, line.text.indexOf("++")),
            new Position(testLineNo, line.text.lastIndexOf("++") + 2),
        );

        range = myExtension.searchNeighborElement(e, d, [labelSelection], "input");
        assert.equal(range.start.line, testLineNo);
        assert.equal(range.start.character, 4);
        assert.equal(range.end.character, 90);

        myExtension.convertTextToLabelElement (e, d, [labelSelection]);

        // Give the editor 'E', some time to perform the replace label text action.
        setTimeout(function() {
            line = d.lineAt(testLineNo); // Getting the actual CHANGED state of the line
            assert.equal(line.text,
                '    <input id="test3_C" name="test3" value="C" type="checkbox" disabled class="css-checkbox-symbol">' +
                '<label for="test3_C">++This is label text C++</label>');
            done();
        }, 500);
    });

    test("D04 - searchNeighborElement() - Implement label-element for TestBlock4, with own ID", function(done) {
        let labelSelection: Selection;
        let line;
        let range: Range;
        let testLineNo: number;

        // Locate FILE test string `++This is label text B++<input value="B" type="radio" name="test2">`
        testLineNo = 25;
        line = d.lineAt(testLineNo); // Getting the actual CHANGED state of the line
        labelSelection = new Selection(
            new Position(testLineNo, line.text.indexOf("++")),
            new Position(testLineNo, line.text.lastIndexOf("++") + 2),
        );

        range = myExtension.searchNeighborElement(e, d, [labelSelection], "input");
        assert.equal(range.start.line, testLineNo);
        assert.equal(range.start.character, 29);
        assert.equal(range.end.character, 109);

        myExtension.convertTextToLabelElement (e, d, [labelSelection]);

        // Give the editor 'E', some time to perform the replace label text action.
        setTimeout(function() {
            line = d.lineAt(testLineNo); // Start counting from 0.
            assert.equal(line.text,
                '    <label for="reused">++This is label text D++</label> ' +
                '<input id="reused" name="test4" value="D" type="checkbox" class="a--css--class css-checkbox-symbol">');
            done();
        }, 500);
    });

});
