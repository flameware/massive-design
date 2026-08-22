/* GENERATED from @massive/ui manifests. Do not edit. */
export const catalog = [
  {
    "component": "badge",
    "displayName": "Badge",
    "hash": "37c940c4d831",
    "cells": 4,
    "axes": {
      "variant": [
        "neutral",
        "accent",
        "success",
        "danger"
      ]
    },
    "anatomy": [
      "Badge"
    ],
    "configurationStates": {},
    "stateSamples": false,
    "source": "src/components/ui/badge.tsx"
  },
  {
    "component": "button",
    "displayName": "Button",
    "hash": "8472d5d50576",
    "cells": 48,
    "axes": {
      "size": [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg"
      ],
      "variant": [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link"
      ]
    },
    "anatomy": [],
    "configurationStates": {},
    "stateSamples": true,
    "source": "src/components/ui/button.tsx"
  },
  {
    "component": "card",
    "displayName": "Card",
    "hash": "50895e9c5fea",
    "cells": 1,
    "axes": {},
    "anatomy": [],
    "configurationStates": {},
    "stateSamples": false,
    "source": "src/components/ui/card.tsx"
  },
  {
    "component": "checkbox",
    "displayName": "Checkbox",
    "hash": "b952b37163b6",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Checkbox",
      "Indicator"
    ],
    "configurationStates": {
      "checked": [
        "unchecked",
        "checked",
        "indeterminate"
      ]
    },
    "stateSamples": true,
    "source": "src/components/ui/checkbox.tsx"
  },
  {
    "component": "dropdown-menu",
    "displayName": "Dropdown Menu",
    "hash": "e3617c6fd13c",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "DropdownMenu",
      "DropdownMenuTrigger",
      "DropdownMenuContent",
      "DropdownMenuGroup*",
      "DropdownMenuLabel?",
      "DropdownMenuItem*",
      "DropdownMenuSeparator?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "stateSamples": false,
    "source": "src/components/ui/dropdown-menu.tsx"
  },
  {
    "component": "input",
    "displayName": "Input",
    "hash": "238507ed3be1",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Input"
    ],
    "configurationStates": {},
    "stateSamples": false,
    "source": "src/components/ui/input.tsx"
  },
  {
    "component": "label",
    "displayName": "Label",
    "hash": "f13a318e70a1",
    "cells": 1,
    "axes": {},
    "anatomy": [],
    "configurationStates": {},
    "stateSamples": false,
    "source": "src/components/ui/label.tsx"
  },
  {
    "component": "list-row",
    "displayName": "List Row",
    "hash": "109497324ece",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "ListRow",
      "ListRowLeading?",
      "ListRowContent",
      "ListRowTitle",
      "ListRowDescription?",
      "ListRowMeta?",
      "ListRowTrailing?"
    ],
    "configurationStates": {
      "row": [
        "default",
        "selected"
      ]
    },
    "stateSamples": true,
    "source": "src/components/ui/list-row.tsx"
  },
  {
    "component": "select",
    "displayName": "Select",
    "hash": "306160b2cb63",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Select",
      "SelectTrigger",
      "SelectValue",
      "SelectContent",
      "SelectGroup*",
      "SelectLabel?",
      "SelectItem*",
      "SelectSeparator?"
    ],
    "configurationStates": {
      "open": [
        "closed",
        "open"
      ]
    },
    "stateSamples": false,
    "source": "src/components/ui/select.tsx"
  },
  {
    "component": "table",
    "displayName": "Table",
    "hash": "aac033c553b2",
    "cells": 1,
    "axes": {},
    "anatomy": [
      "Table",
      "TableHeader",
      "TableBody",
      "TableRow*",
      "TableHead*",
      "TableCell*",
      "TableCaption?"
    ],
    "configurationStates": {
      "row": [
        "default",
        "selected"
      ]
    },
    "stateSamples": false,
    "source": "src/components/ui/table.tsx"
  }
] as const
