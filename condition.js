module.exports = function(RED) {
    var operators = {
        'matchLabel' : function ( lv, a, b ) { 
            for ( var i = 0; i < b.length; i++ ) { 
                if ( b[i].label == lv ) { 
                    return b[i];
                    break;
                }
            }
            return null;
        },
        'exists' : function ( lv, a, b ) { 
            if ( operators.matchLabel(lv,a,b) != null ) { 
                return true;
            } else { 
                return false;
            }
        },
        'eq': function (lv, a, b) {
            var opMatch = operators.matchLabel(lv,a,b);
            if ( opMatch != null ) { 
                if ( opMatch.content == a ) { 
                    return true;
                } else { 
                    return false;
                }
            } else { 
                return false;
            }
        },
        'neq': function (lv, a, b) {
            var opMatch = operators.matchLabel(lv,a,b);
            if ( opMatch != null ) { 
                if ( opMatch.content != a ) { 
                    return true;
                } else { 
                    return false;
                }
            } else { 
                return false;
            }
        },
        'cont': function (lv, a, b) {
            var opMatch = operators.matchLabel(lv,a,b);
            if ( opMatch != null ) { 
                if ( opMatch.content.indexOf(a) != -1 ) { 
                    return true;
                } else { 
                    return false;
                }
            } else { 
                return false;
            }
        },
        'regex': function (lv, a, b ) {
            var opMatch = operators.matchLabel(lv,a,b);
            if ( opMatch != null ) { 
                if ( opMatch.content.match(b) != null ) { 
                    return true;
                } else { 
                    return false;
                }
            } else { 
                return false;
            }
        }
    };
    
    
    function isWordLevel ( msg ) { 
        return true;
    }
    
    
    function ConditionNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(msg) {
            var wordLevel = isWordLevel ( msg );
            var matchany = config.matchany;
            
            var foundMatch = false;
            
            var onward = [];
        
            // iterate over all of the rules... 
            for (var i=0; i< config.rules.length; i+=1) {
                var rule = config.rules[i];
                var v1,v2,lv;
                
                lv = rule.lv;
                v1 = rule.v;
                if ( wordLevel ) { 
                    v2 = msg.payload[0].predictions;
                } else { 
                
                }
                
                if (rule.t === 'else') {
                    if (matchany === 'true') {
                      // when we are in the mode where we send a 
                      // message if any rule matches: if we
                      // encounter an 'else' rule, then we
                      // will send a message regardless of other 
                      // rules
                      onward[0] = msg;
                      break;
                    } else {
                      // when we are in the mode where we send a
                      // message for each matching rule: if we
                      // encounter an 'else' rule and have already
                      // matched a rule then we don't send a message;
                      // however, if we haven't matched a rule yet
                      // then we should send a message.
                      if (foundMatch) {
                        onward[i] = null;
                        // if there are more rules after the else,
                        // then do what the switch node does and
                        // reset the match status
                        foundMatch = false;
                      } else {
                        onward[i] = msg;
                      }
                    }
                } else if (operators[rule.t](lv,v1,v2)) {
                    // have a match... 
                    foundMatch = true;
                    if ( matchany == "true" ) { 
                        // only ever send one message...
                        onward[0] = msg;
                        break;
                    } else { 
                        // else place it in the right part of the onward array...
                        onward[i] = msg;
                    }
                } else {
                    if ( matchany == "false" ) { 
                        // set the correct place in the return array to be null... 
                        onward[i] = null;
                    }  
                }
            }
            
            node.send(onward);
        });
    }
    RED.nodes.registerType("condition",ConditionNode);
}
