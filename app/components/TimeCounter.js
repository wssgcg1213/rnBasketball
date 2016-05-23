import React, { Component, PropTypes } from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default class TimeCounter extends Component {
  static propTypes = {
    start: PropTypes.number,
    onEnd: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      remain: this.props.start
    }
  }

  componentDidMount() {
    setTimeout(this.tick.bind(this), 1000)
  }

  tick() {
    const remain = this.state.remain
    let _continue = true
    if (this.props.tick) {
      _continue = this.props.tick(remain)
    }
    if (remain + this.props.step !== -1) {
      this.setState({
        remain: remain + this.props.step
      })
      _continue && setTimeout(this.tick.bind(this), 1000)
    } else {
      this.props.onEnd && this.props.onEnd((remain) => {
        this.state.remain = remain
        setTimeout(this.tick.bind(this), 1000)
      })
    }
  }
  render () {
    if (this.props.start) {
      return (<View style={[this.props.style, styles.container]}>
        <Text style={styles.text} >{this.props.scoreText || '分数'}: {this.props.score * 10}</Text>
        <Text style={styles.text} >倒计时: {this.state.remain}s</Text>
      </View>)
    }

    if (this.props.step > 0) {
      return (<View style={[this.props.style, styles.container]}>
        <Text style={styles.text} >{this.props.scoreText || '分数'}: {this.props.score * 10}</Text>
        <Text style={styles.text} >关卡: {parseInt(this.props.score / 3) + 1}</Text>
        <Text style={styles.text} >计时: {this.state.remain}s</Text>
      </View>)
    }
    return (<View style={[this.props.style, styles.container]}>
      <Text style={styles.text} >{this.props.scoreText || '分数'}: {this.props.score * 10}</Text>
    </View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    margin: 5
  }
})

