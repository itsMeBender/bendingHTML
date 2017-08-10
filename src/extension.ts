'use strict';

// Example code
// https://github.com/Microsoft/vscode-MDTools/blob/master/extension.ts

interface ElementAttributes extends Object {
    attribute: Object; // attribute-label, value pairs. Example 'class:hideobject'
    element: String; // The element string analyzed
    nodename: String; // Node name
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "htmlmanipulationtools" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.htmlManipulationTools', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!' + vscode.version);

       	if (!vscode.window.activeTextEditor) {
    		vscode.window.showInformationMessage('Open a file first to manipulate text selections');
		    return;
        }

        let opts: QuickPickOptions = { matchOnDescription: true, placeHolder: "What do you want to do to the selection(s)?" };
        let items: QuickPickItem[] = [];

        items.push({ label: "ArrangeAttributes", description: "Rearrange input attributes" });
    	items.push({ label: "Textlabel", description: "Text to label input element" });

        Window.showQuickPick(items).then((selection) => {
            if (!selection) {
                return;
            }
            let e = Window.activeTextEditor;
            let d = e.document;
            let sel = e.selections;

            switch (selection.label) {
                case "ArrangeAttributes":
                    rearrangeInputElement(e, d, sel);
                    break;
                case "Textlabel":
                    convertTextToLabelElement();
                    break;
                default:
                    console.log("Hum this should not have happend - no selection")
                    break;
            }
        });
    });

    context.subscriptions.push(disposable);
}

/**
 * Add a CSS class string to a class string
 * @param {String} classList is the existing class string
 * @param {String} addClass is the string to add to
 * @return {String} the complete new class string
 */
export function addClassString (classList: string, addClass: string): string {
    let re = new RegExp("\\b" + addClass + "\\b", "g"); // Using word boundaries
    if (classList) {
        if (!re.test(classList)) { // Already available
            classList += " " + addClass;
        }
    } else {
        classList = addClass;
    }
    return classList;
}

export function convertTextToLabelElement () {
    console.log("convertTextToLabelElement()");
}

/**
 * Remove a CSS class string from a class string.
 * @param {String} classList of existing classes
 * @param {String} removeClass which will be remove from the list
 * @return {String} the complete new class string
 */
export function removeClassString (classList, removeClass) {
    let lstOfClassnames = [];
    let newClassList: String = "";

    if (classList) {
        lstOfClassnames = classList.split(" ");
        lstOfClassnames.forEach(function (name, idx) {
            if (name !== removeClass) {
                if (newClassList) {
                    newClassList += " " + name;
                } else {
                    newClassList = name;
                }
            }
        });
    } else {
        newClassList = classList;
    }
    return newClassList;
}

/**
 * Scans element string for nodeName and attributes.
 * @param {String} elementString the complete element as string from '<' to '>'.
 * @return {ElementAttributes} the found element broken down into attibute key:value pairs.
 */
export function scanElementForAttributes (elementString: string): ElementAttributes {
    let attr: String;
    let attributes = []; // Find attributes of the element
    let end = 0;
    let idx: number;
    let idxBeginAttr: number;
    let isString = false; // True when first double quote (") is found, then spaces are not the attribute delimiter
    let	elementAttributes: ElementAttributes = {
        attribute: [],
        element: "",
        nodename: "",
    };
    let symbol = "";

    end = elementString.length;

    // Build array of ELEMENT attributes. With or without values, like `disabled`
    idxBeginAttr = 1;
    for (idx = 1; idx < end; idx += 1) {
        symbol = elementString[1 + idx];
        if (symbol === '"' && isString === false) {
            isString = true;
            // continue to find closing "
        } else if (symbol === '"' && isString === true) {
            isString = false;
            // continue to find SPACE as attribute delimiter
        } else if (symbol === " " && isString === false) {
            // An ATTRIBUTED located
            attributes.push(elementString.substr(idxBeginAttr, 1 + idx - idxBeginAttr));
            idxBeginAttr = idx + 2;
        }
    }
    attributes.push(elementString.substr(idxBeginAttr, end - idxBeginAttr - 1));

    // Build attribute value ARRAY
    elementAttributes.element = elementString;
    elementAttributes.nodename = attributes[0];
    elementAttributes.attribute = {};
    for (idx = 1; idx < attributes.length; idx += 1) {
        attr = attributes[idx].split("=");
        if (attr.length === 2) {
            elementAttributes.attribute[attr[0]] = attr[1].replace(/\"/g, "");
        } else {
            elementAttributes.attribute[attr[0]] = null;
        }
    } // EndFor, all attributes

    return elementAttributes;
}

/**
 * Creates a String containing an HTML element as described by the `elementAttributes` parameter.
 * The attributes are placed in a specified, fixed order. See `attributeSeq`.
 * This improves code readabillity.
 * @param {ElementAttributes} elementAttributes containing information about the element and attribute data.
 * @return {String} re-ordered element string
 */
export function buildElementString(elementAttributes: ElementAttributes): string {
    let attributeSeq = ["id", "name", "value", "type", "disabled", "class"];
    let elementStr = "<";
    let polyfil: Array<any> = [];

    elementStr += elementAttributes.nodename;

    // Doing it this fixed way, is to assure element attributes are in the same order.
    // Improving source code readabillity
    attributeSeq.forEach(attribute => {
        if (elementAttributes.attribute.hasOwnProperty(attribute)) {
            if (elementAttributes.attribute[attribute] || elementAttributes.attribute[attribute] === "") {
                elementStr += " " + attribute + '="' + elementAttributes.attribute[attribute] + '"';
            } else {
                elementStr += " " + attribute; // Attribute with value NULL, like 'disabled' flag
            }
        }
    });

    // The rest of the attribute pack
    if (!Object.keys) {
        // DreamWeaver internal JS, does not support Object.keys();
        let key: any;
        for (key in elementAttributes.attribute) {
            if (elementAttributes.attribute.hasOwnProperty(key)) {
                polyfil.push(key);
            }
        }
    } else {
        polyfil = Object.keys(elementAttributes.attribute);
    }

    polyfil.forEach(attribute => {
        if (attributeSeq.indexOf(attribute) === -1) {
            // Not in attributeSeq FIX list, so add it at the end.
            if (elementAttributes.attribute[attribute] || elementAttributes.attribute[attribute] === "") {
                elementStr += " " + attribute + '="' + elementAttributes.attribute[attribute] + '"';
            } else {
                elementStr += " " + attribute; // Attribute with value NULL, like 'disabled' flag
            }
        }
    });

    elementStr += ">";

    return elementStr;
}

/**
 * Re-order attributes of the selected INPUT-element.
 * @param {TextEditor} e the active text EDITOR
 * @param {TextDocument} d the DOCUMENT working on
 * @param {Selection} sel the selected text in the document
 */
export function rearrangeInputElement (e: TextEditor, d: TextDocument, sel: Selection[]) {
    e.edit(function (edit) {
        let elementAttributes: ElementAttributes;
        // Itterate through the selections and convert all text to Upper
        for (var x = 0; x < sel.length; x++) {
            let txt: string = d.getText(new Range(sel[x].start, sel[x].end));
            elementAttributes = scanElementForAttributes(txt);
            edit.replace(sel[x], buildElementString(elementAttributes));
        }
    });        
}

// this method is called when your extension is deactivated
export function deactivate() {
}
