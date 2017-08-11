# HTML manipulation tools README

This is the README for extension "htmlmanipulationtools".  
A selection of functions to manipulate HTML code.
Originally these where a set of Adobe Dreamweaver commands to manipulate HTML code.
I used these command scripts to update a lot of very old HTML code.  
But that was in the old days. I don't like Dreamweaver CC2017 anymore.
It doesn't fit the way we work anymore as a Front End Developer.
Today it's all about Web Components, with a very strong reliance on JavaScript.

## Features

### ArrangeAttributes

__VSC Command 'ArrangeAttributes' to rearrange INPUT element attributes__  

Select an `input` element and this command. And all `input` attributes are rearranged in a fixed order.  

Order of attributes; "id", "name", "value", "type", "disabled", "class", others.

### Textlabel

__VSC Command 'Textlabel' Text to label input element__  

Select text beside an `input` element of type __rabio__ or __checkbox__ and this command.
The text is transformed into a `label` element, connected by it's neighbour `input` element, connected by attribute _ID_.

++++ TODO: Need to clear up readme ++++

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

-----------------------------------------------------------------------------------------------------------

## Working with Markdown

**Note:** You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on OSX or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+CMD+V` on OSX or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux) or `Cmd+Space` (OSX) to see a list of Markdown snippets

### For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**