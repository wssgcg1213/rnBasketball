import React, { Component, PropTypes } from 'react'
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import hoopFront from '../assets/hoopFront.png'

class Net extends Component {
  render() {
    return (
      <View style={[styles.netContainer, {
        left: this.props.x,
        bottom: this.props.y,
        transform: [{
          translateY: 80 - this.props.height
        }],
        height: 80,
        width: this.props.width,
      }, this.props.style]}
      >
        <Image source={hoopFront} style={[{width: this.props.width}, styles.hoop]}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  netContainer: {
    position: 'absolute',
    // backgroundColor: '#ff260f',
    borderRadius: 3,
  },
  hoop: {
    height: 80,
    resizeMode: 'stretch',
    transform: [{
      translateY: -5
    }]
  }
});

Net.defaultProps = {
  x: 0,
  y: 0,
  height: 10,
  width: 10,
};

Net.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default Net;
