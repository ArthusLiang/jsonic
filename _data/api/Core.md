Title: Core
Desc: You can find some common functions for Jsonic.Core.
SortIndex: 1
---
# Core

You can find some common functions for Jsonic.Core.

## Browser

### Property

| Property   | Type      | value                                    |
| -----------|:----------|:-----------------------------------------|
| Name       | string    | chrome / safari / msie / firefox / opera |
| Prefix     | string    | webkit / ms / moz                        |
| Version    | string    | a string as 1.0.0                        |

### Method

#### .attrPrefix()

Make a new object without prefix. The following table shows its arguments.

| Name   | Type            | Description                  |
| -------|:----------------|:-----------------------------|
| obj    | Object          | The Owner of the new object  |
| attr   | string          | The name of the function     |
| func   | Function / Null | Custom implementation        |

```
Jsonic.Browser.attrPrefix(window,'AudioContext');
```