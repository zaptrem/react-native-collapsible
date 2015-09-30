/**
 * @providesModule Collapsible
 * @flow
 */
'use strict';

var React = require('react-native');
var {
  Animated,
  Easing,
  View,
} = React;

var ANIMATED_EASING_PREFIXES = ['easeInOut', 'easeOut', 'easeIn'];

// For some reason 0 heights won't hide overflow in RN 0.12+
var ALMOST_ZERO = 0.00000001;

var Collapsible = React.createClass({
  propTypes: {
    collapsed:  React.PropTypes.bool,
    duration:   React.PropTypes.number,
    easing:     React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.func
    ]),
  },

  getDefaultProps() : Object {
    return {
      collapsed:  true,
      duration:   300,
      easing:     'easeOutCubic',
    };
  },

  componentWillReceiveProps(props : Object) {
    if(props.collapsed !== this.props.collapsed) {
      this._toggleCollapsed(props.collapsed);
    }
  },

  getInitialState() : Object {
    return {
      height: new Animated.Value(ALMOST_ZERO),
      contentHeight: 0,
    };
  },

  _toggleCollapsed(collapsed : bool) {
    var height = collapsed ? ALMOST_ZERO : this.state.contentHeight;
    var { easing, duration } = this.props;

    if(typeof easing === 'string') {
      var prefix, found = false;
      for (var i = 0; i < ANIMATED_EASING_PREFIXES.length; i++) {
        prefix = ANIMATED_EASING_PREFIXES[i];
        if(easing.substr(0, prefix.length) === prefix) {
          easing = easing.substr(prefix.length, 1).toLowerCase() + easing.substr(prefix.length + 1);
          prefix = prefix.substr(4, 1).toLowerCase() + prefix.substr(5);
          easing = Easing[prefix](Easing[easing || 'ease']);
          found = true;
          break;
        }
      };
      if(!found) {
        easing = Easing[easing];
      }
      if(!easing) {
        throw new Error('Invalid easing type "' + this.props.easing +'"');
      }
    }

    if(this._animation) {
      this._animation.stop();
    }
    this._animation = Animated.timing(this.state.height, {
      toValue: height,
      duration,
      easing,
    }).start();
  },

  _handleLayoutChange(event : Object) {
    var contentHeight = event.nativeEvent.layout.height;
    var height = this.props.collapsed ? ALMOST_ZERO : contentHeight
    this.setState({
      height: new Animated.Value(height),
      contentHeight,
    });
  },

  render() {
    var style = {
      overflow: 'hidden',
      height: this.state.height
    };
    return (
      <Animated.View style={style} pointerEvents={this.props.collapsed ? 'none' : 'auto'}>
        <View ref="content" onLayout={this._handleLayoutChange}>
          {this.props.children}
        </View>
      </Animated.View>
    );
  }
});

module.exports = Collapsible;