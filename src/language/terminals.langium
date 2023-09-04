

// recognize a hexadecimal sequence, used to recognize colors for the 'Color' command
terminal HEX returns string:    /#(\d|[a-fA-F])+/;

// recognize a URI
terminal URI returns string:     /http(s)?:\/\/(([a-zA-Z0-9])([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+([a-zA-Z]{2,6})(:[0-9]{1,5})?(\/[a-zA-Z0-9]+)+(\/)?/;

// recognize an identifier
terminal ID returns string:     /[_a-zA-Z][\w_]*/;

// recognize an Integer (but represented via a 'number' type)
terminal INT returns number:    /-?[0-9]+/;

// recognize an Decimal (but represented via a 'number' type)
terminal DECIMAL returns number:    /-?[0-9]+(\.[0_9]+)?/;
terminal DATE_STRING: /@@".*"/;

terminal STRING: /@@".*"/;

hidden terminal WS:             /\s+/;
hidden terminal ML_COMMENT:     /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT:     /\/\/[^\n\r]*/;