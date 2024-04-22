# Luting in VS Code

## _QOL for writing Lutings_

Luting in VS Code is a small extension I made for the purpose of simplifying the process of writing and maintaining a database of your previously written Lutings in VS Code.

## Features

- Custom .lute extension for Luting files
- Commands to optimize character count of your Luting
- A command to download a .wav from a .lute file
- Custom Theme to enable Luting-specific syntax-highlighting in .lute files
- Comments supported by the .lute extension
- A Command to quickly copy a cheerable version of your Luting into your clipboard

The goal of these features is to make both the process of writing and sharing Lutings neater,
and to make shared Lutings more readable and easy to understand.

## .lute

All the .lute extension does is take a normal file and tell VS Code to apply syntax highlighting,
and to render a neat little file-Icon 

## Comments

Any text after "//" is treated as a comment. Use "//" again to finish the comment.

```sh
//This is a comment
//This is one, and// this is not.
```

Comments will be removed upon generating the final string to cheer in chat.

## Commands

### Optimization

The optimize and multilute commands supports two different modes:

| Type | Effect |
| ------ | ------ |
| Thorough | Completely expands all definitions and optimizes 'from scratch'. Fairly slow but good. |
| Quick | Does not expand any already existing definitions first to check all possibilities. Great for extra long lutings. |

Since Thorough bruteforce-checks every possible optimization it can take up to 15-20 seconds for large lutings, and exponentionally longer for even larger lutings.  
If your resulting lutings is too long for one message, turn it into a multilute directly with the multilute command. It's recommended to use quick optimization for multilutes, as thorough can take upwards of multiple minutes.

### Generation

The command "Download your Luting" will create a folder called "Luting-Out" and get the .wav of the current .lute file from luteboi.com and save it there.

### Cheering

Luting in VS Code supports two commands for cheering Lutings:

| Type | Effect |
| ------ | ------ |
| Copy to clipboard | Adds the current Luting with all newLines and comments removed to clipboard. |
| Generate cheerable String | Adds the Luting message already including "Cheer1" to clipboard, ready to be cheered! |

## Installation

Simply install this Extension directly from the marketplace.

To enable the Luting theme select the theme "Luting Syntax Highlights" from your available themes.
This theme is based off of the "One Dark Pro Mix" theme.
If, instead, you wish to modify your own theme to allow for Luting syntax highlight,
simply follow the instructions in the customThemeInstructions file.

Happy Luting! hryAdmire

![conducting](Images/conducting.webp)

#### Created by [@AnAnnoyingCat](https://github.com/AnAnnoyingCat)

#### Source code can be found on [GitHub](https://github.com/AnAnnoyingCat/lutingsyntax)

##### Discord: @justanannoyingcat