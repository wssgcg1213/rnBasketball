import React, { Component, PropTypes } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import floor from '../assets/floor.jpg'

class Floor extends Component {
  render() {
    return (
      <Image source={floor} style={[styles.floorContainer, {height: this.props.height}]} />
    );
  }
}

const styles = StyleSheet.create({
  floorContainer: {
    // backgroundColor: '#F4F4F4',
    position: 'absolute',
    width: Dimensions.get('window').width,
    bottom: 0,
  },
});

Floor.defaultProps = {
  heght: 10,
};

Floor.propTypes = {
  height: PropTypes.number,
};

export default Floor;
