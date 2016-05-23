/**
 * Created at 16/5/21.
 * @Author Ling.
 * @Email i@zeroling.com
 */
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  LayoutAnimation,
  Alert,
  Dimensions
} from 'react-native';
import BasketballPage from './Backetball'
import logo from '../assets/logo.png'
import standardMode from '../assets/standardMode.png'
import practiseMode from '../assets/practiseMode.png'
import chuangguanMode from '../assets/chuangguanMode.png'
import lianjiMode from '../assets/lianjiMode.png'

const { width, height } = Dimensions.get('window')
export default class defaultPage extends Component {
  toBasketballScene (mode) {
    const { navigator } = this.props
    if (navigator) {
      navigator.push({
        name: 'BasketballPage',
        component: BasketballPage,
        params: {
          gameType: mode
        }
      })
    }
  }

  constructor (props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount () {
  }
  undo() {
    Alert.alert(
      '本功能正在开发中',
      '敬请期待'
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Image source={logo} style={[styles.nav, styles.logo]} />
        <TouchableOpacity onPress={this.toBasketballScene.bind(this, 1)}>
          <Image source={standardMode} style={styles.nav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.toBasketballScene.bind(this, 2)}>
          <Image source={practiseMode} style={styles.nav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.toBasketballScene.bind(this, 3)}>
          <Image source={chuangguanMode} style={styles.nav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.undo.bind(this)}>
          <Image source={lianjiMode} style={styles.nav} />
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#80B3FF'
  },
  nav: {
    resizeMode: 'contain',
    width: width * 0.4
  },
  logo: {
    width: width * 0.6
  },
  cloud: {
    margin: 30,
    resizeMode: 'contain',
    opacity: 0.8,
    position: 'absolute'
  }
})
