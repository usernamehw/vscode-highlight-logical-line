# Highlight logical line

Highlights the entire active line:

![Example](/img/example.gif)

Uses `"editor.lineHighlightBackground"` by default. Can be changed in `Settings`:

```javascript
"workbench.colorCustomizations": {
	"highlightLogicalLine.background": "#00000030",
	// also can be changed per each theme
	"[Default Dark+]": {
		"highlightLogicalLine.background": "#ff000020"
	}
}
```

Recommended Settings:
```json
"editor.renderLineHighlight": "gutter",
```