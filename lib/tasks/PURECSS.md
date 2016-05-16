# PureCSS

PureCSS Task for generate custom grid.

Features:
- ```visible/hidden``` classes
- ```wrapper``` class for main wrapper
- ```offset``` classes
- media variables | *example:* ```--screen-xs```


Config ```tasks.json```
```
{
  "purecss": {
    "prefix": "grid",
    "columnHasPrefix": true,
    "columns": 12,
    "columnPrefix": "col",
    "wrapperBreakpoints": ["md", "lg"],
    "breakpoints": {
      "xs": "30em",
      "sm": "48em",
      "md": "62em",
      "lg": "75em"
    },
    "files": {
      "dest": "./generated/pcss/",
      "src": ["base", "grids-core"]
    }
  }
}
```

#### prefix

Type: ```String```

Sets prefix for all generated classes.

#### columnHasPrefix

Type: ```Boolean```

Indicates whether the column get a prefix.

#### columns

Type: ```Number```

Sets the number of columns.

#### columnPrefix

Type: ```String```

Sets the prefix of columns.

#### wrapperBreakpoints

Type: ```Array```

Sets the breakpoints for the wrapper.

#### breakpoints

Type: ```Object```

Sets the breakpoints that are required to generate the grid classes and media querys vars.

```
{
  "xs": "30em",
  "sm": "48em",
  "md": "62em",
  "lg": "75em"
}
```

#### files

Type: ```String```

Sets PureCSS files and destination path for generated files.
```
{
  "dest": "./generated/pcss/",
  "src": ["base", "grids-core"]
}
```
