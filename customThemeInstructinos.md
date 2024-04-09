# Extending your theme with Luting Highlighting

- Find your Theme's .json file.
- Under the category "tokenColors": [ add the following tokenColors:

```sh
    {
      "scope": "source note",
      "settings": {
          "foreground": "#32A0B6"
      }
    },
    {
      "scope": "source chord",
      "settings": {
        "foreground": "#a468cc"
      }
    },
    {
        "scope": "source fraction",
        "settings": {
            "foreground": "#4AD9BA"
        }
    },
    {
        "scope": "source instrument",
        "settings": {
            "foreground": "#C38EFF"
        }
    },
    {
        "scope": "source octave",
        "settings": {
            "foreground": "#aeb4b5"
        }
    },
    {
        "scope": "source volume",
        "settings": {
            "foreground": "#aeb4b5"
        }
    },
    {
        "scope": "source time",
        "settings": {
            "foreground": "#aeb4b5"
        }
    },
    {
        "scope": "source start-definition",
        "settings": {
            "foreground": "#CEC267"
        }
    },
    {
        "scope": "source end-definition",
        "settings": {
            "foreground": "#CEC267"
        }
    },
    {
        "scope": "source predefined-section",
        "settings": {
            "foreground": "#CEC267"
        }
    },
    {
        "scope": "source octaveChange",
        "settings": {
            "foreground": "#4AD988"
        }
    },
    {
        "scope": "source lutingheader",
        "settings": {
            "foreground": "#C38EFF"
        }
    },
    {
      "scope": "source newVoice",
      "settings": {
          "foreground": "#C38EFF"
      }
    }
```

This should make your theme capable of rendering the Luting syntax-highlighting.
If you wish to further modify the specific colors, here is a list of all the tokens the language uses:

```sh
All the possible types of tokens:
    'instrument'
    'octave',
    'volume',
    'time',
    'fraction',
    'note',
    'start-definition',
    'end-definition',
    'predefined-section',
    'new-voice',
    'octave-change',
    'luting-header',
    'comment',
    'side',
    'chord'
```

#### Created by [@AnAnnoyingCat](https://pages.github.com/)

##### Discord: @justanannoyingcat