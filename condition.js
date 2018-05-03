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
        },
        'else': function (a) {
            return a === true;
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
                
                if (operators[rule.t](lv,v1,v2)) {
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
                
                if ( rule.t == "else" ) { 
                    // in the else case we set it anyway... 
                    if ( matchany == "true" ) {
                        onward[0] = msg;
                        break;
                    } else { 
                        onward[i] = msg;
                    }
                }
            }
            
            node.send(onward);
        });
    }
    RED.nodes.registerType("condition",ConditionNode);
}