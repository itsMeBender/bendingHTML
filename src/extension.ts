"use strict";

// Example code
// https://github.com/Microsoft/vscode-MDTools/blob/master/extension.ts
// API https://code.visualstudio.com/docs/extensionAPI/vscode-api#Position

interface ElementAttributes extends Object {
    attribute: any; // attribute-label, value pairs. Example 'class:hideobject'
    element: String; // The element string analyzed
    nodename: String; // Node name
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import Document = vscode.TextDocument;
import Position = vscode.Position;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
import TextLine = vscode.TextLine;
import Window = vscode.window;

/**
 * Search for a HTML-element of `nodename` in the area of last position `sel`.
 * And return it's document location range.
 * @param {TextEditor} e the active text EDITOR
 * @param {TextDocument} d the DOCUMENT working on
 * @param {Selection} sel the selected text in the document
 * @param {String} search to search for
 * @param {String} direction of the search; AFTER, BEFORE of given `pos`
 * @return {Range} the code text range of the fount element, or `null` when not found.
 */
export function searchNeighborElement (e: TextEditor, d: TextDocument, sel: Selection[], nodeName: string): Range {
    let attr: ElementAttributes;
    let charNo: number = sel[0].start.character;
    // http://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
    let html: RegExp = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g; // Does not recognize @[PLACEHOLDER]@
    let idx: number;
    let line: TextLine;
    let lineNo: number = sel[0].start.line;
    let match: Array<string>;
    let neighbour = 0;

    do {
        line = d.lineAt(lineNo + neighbour);
        match = line.text.match(html); // Find HTML-elements
        if (match.length) {
            for (idx = 0 ; idx < match.length; idx += 1) {
                attr = scanElementForAttributes(match[idx]);
                if (nodeName === attr.nodename) {
                    charNo = line.text.indexOf(match[idx]);
                    return new Range(
                        new Position(lineNo + neighbour, charNo),
                        new Position(lineNo + neighbour, charNo + match[idx].length),
                    );
                }
            }
        }
        // Sequence: 0, 1, -1, 2, -2, 3, -3 ....
        if (neighbour < 0) {
            // Make positive, add one
            neighbour = Math.abs(neighbour) + 1;
        } else {
            if (neighbour === 0) {
                neighbour = 1;
            } else {
                neighbour *= -1;
            }
        }
    } while (lineNo + neighbour >= d.lineCount || lineNo + neighbour <= 0);

    return null; // Nothing found
}

/**
 * This method is called when your extension is activated
 * your extension is activated the very first time the command is executed
 * @param {ExtensionContext} context ...
 */
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "bendingHTML" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("extension.bendingHTML", () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!' + vscode.version);

        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a file first to manipulate text selections");
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
                    convertTextToLabelElement(e, d, sel);
                    break;
                default:
                    console.log("Hum this should not have happend - no selection");
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
 * The selected plain text is placed inside a labelElement-element.
 * With the 'for'-attribute pointing to the RADIO-, CHECKBOX-input field.
 * If input doesn't have an 'id'-attribute, it will be created.
 * Using the 'name'- and 'value'-attribute, creating an unique ID.
 * @param {TextEditor} e the active text EDITOR
 * @param {TextDocument} d the DOCUMENT working on
 * @param {Selection} sel the selected text in the document
 */
export function convertTextToLabelElement (e: TextEditor, d: TextDocument, sel: Selection[]) {
    // let source = dreamweaver.getDocumentDOM("document").documentElement.outerHTML;

    if (!sel[0].isEmpty) {
        // Only ONE (the first) selection is of importance
        e.edit(function (edit) {
            let inputObj: ElementAttributes;
            let inputRange: Range;
            let inputSource: string;
            let labelElement = '<label for="REPLACE-INPUTID">REPLACE-LABELTEXT</label>';
            let labelSource: string;

            labelSource = d.getText(new Range(sel[0].start, sel[0].end));
            inputRange = searchNeighborElement (e, d, sel, "input");
            if (inputRange) {
                inputSource = d.getText(inputRange);
                inputObj = scanElementForAttributes(inputSource);

                // Assure INPUT has an ID to link the LABEL to.
                if (!inputObj.attribute.hasOwnProperty("id")) {
                    inputObj.attribute.id = inputObj.attribute.name + "_" + inputObj.attribute.value;
                }

                // If 'type'-attribute is CHECKBOX, we can add class 'css-checkbox-symbol'.
                if (inputObj.attribute.type === "checkbox") {
                    inputObj.attribute.class = addClassString(inputObj.attribute.class, "css-checkbox-symbol");
                }

                // Replace selected text in labelElement container
                labelElement = labelElement.replace(/REPLACE-LABELTEXT/g, labelSource);
                labelElement = labelElement.replace(/REPLACE-INPUTID/g, inputObj.attribute.id);
                edit.replace(sel[0], labelElement);
                edit.replace(inputRange, buildElementString(inputObj));
            } else {
                vscode.window.showInformationMessage("No related input element found.");
            }
        });
    } else {
        vscode.window.showInformationMessage("First select text next to input element");
    }
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
 * Re-order attributes of the selected INPUT-element.
 * @param {TextEditor} e the active text EDITOR
 * @param {TextDocument} d the DOCUMENT working on
 * @param {Selection} sel the selected text in the document
 */
export function rearrangeInputElement (e: TextEditor, d: TextDocument, sel: Selection[]) {
    e.edit(function (edit) {
        let elementAttributes: ElementAttributes;
        let x: number;

        // Itterate through the selections and convert all text to Upper
        for (x = 0; x < sel.length; x++) {
            let txt: string = d.getText(new Range(sel[x].start, sel[x].end));
            elementAttributes = scanElementForAttributes(txt);
            edit.replace(sel[x], buildElementString(elementAttributes));
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log("TODO: deactivate()");
}
