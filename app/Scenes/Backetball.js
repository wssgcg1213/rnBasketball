/**
 * Created at 16/5/21.
 * @Author Ling.
 * @Email i@zeroling.com
 */
import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native'
import bg from '../assets/bg.png'

import Ball from '../components/Ball'
import Hoop from '../components/Hoop'
import Net from '../components/Net'
import Floor from '../components/Floor'
import Emoji from '../components/Emoji'
import Score from '../components/Score'
import TimeCounter from '../components/TimeCounter'

import Vector from '../utils/Vector';
const { width, height } = Dimensions.get('window')

// physical variables
const gravity = 0.6; // gravity
const radius = 40; // ball radius
const rotationFactor = 10; // ball rotation factor

// components sizes and positions
function getComponentSize (level) {
  let FLOOR_HEIGHT = 48;
  let FLOOR_Y = 11;
  let HOOP_Y = height - 227;
  let NET_HEIGHT = 6;
  let NET_WIDTH = 84;
  let NET_Y = height - 216;
  let NET_X = (width / 2) - (NET_WIDTH / 2);
  let NET_LEFT_BORDER_X = NET_X + NET_HEIGHT / 2;
  let NET_LEFT_BORDER_Y = NET_Y;
  let NET_RIGHT_BORDER_X = NET_X + NET_WIDTH - NET_HEIGHT / 2;
  let NET_RIGHT_BORDER_Y = NET_LEFT_BORDER_Y;
  switch (level) {
    case undefined:
      return {FLOOR_HEIGHT, FLOOR_Y, HOOP_Y, NET_HEIGHT, NET_WIDTH,
        NET_Y, NET_X, NET_LEFT_BORDER_X, NET_LEFT_BORDER_Y, NET_RIGHT_BORDER_X, NET_RIGHT_BORDER_Y
      }
    case 1:
      NET_WIDTH = 180; break;
    case 2:
      NET_WIDTH = 150; break;
    case 3:
      NET_WIDTH = 120; break;
    case 4:
      NET_WIDTH = 90; break;
    default:
      NET_WIDTH = 60;
  }
  NET_X = (width / 2) - (NET_WIDTH / 2);
  NET_LEFT_BORDER_X = NET_X + NET_HEIGHT / 2;
  NET_LEFT_BORDER_Y = NET_Y;
  NET_RIGHT_BORDER_X = NET_X + NET_WIDTH - NET_HEIGHT / 2;
  NET_RIGHT_BORDER_Y = NET_LEFT_BORDER_Y;
  return {FLOOR_HEIGHT, FLOOR_Y, HOOP_Y, NET_HEIGHT, NET_WIDTH,
    NET_Y, NET_X, NET_LEFT_BORDER_X, NET_LEFT_BORDER_Y, NET_RIGHT_BORDER_X, NET_RIGHT_BORDER_Y
  }
}
let {FLOOR_HEIGHT, FLOOR_Y, HOOP_Y, NET_HEIGHT, NET_WIDTH,
  NET_Y, NET_X, NET_LEFT_BORDER_X, NET_LEFT_BORDER_Y, NET_RIGHT_BORDER_X, NET_RIGHT_BORDER_Y
} = getComponentSize()

// ball lifecycle
const LC_WAITING = 0;
const LC_STARTING = 1;
const LC_FALLING = 2;
const LC_BOUNCING = 3;
const LC_RESTARTING = 4;
const LC_RESTARTING_FALLING = 5;

class BasketballPage extends Component {

  constructor(props) {
    super(props)

    this.interval = null;
    // initialize ball states
    let sizes = getComponentSize(this.props.gameType === 3 ? 1: undefined)
    this.state = {
      ...sizes,
      x: width / 2 - radius,
      y: FLOOR_Y,
      vx: 0,
      vy: 0,
      rotate: 0,
      scale: 1,
      lifecycle: LC_WAITING,
      scored: null,
      score: 0
    };
  }

  componentDidMount() {
    this.interval = setInterval(this.update.bind(this), 1000 / 60);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  onStart(angle) {
    if (this.state.lifecycle === LC_WAITING) {
      this.setState({
        vx: angle * 0.2,
        vy: -16,
        lifecycle: LC_STARTING,
      });
    }
  }

  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  circlesColliding(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circle1.radius + circle2.radius) {
      return true;
    }
    return false;
  }

  // Inspired by http://www.adambrookesprojects.co.uk/project/canvas-collision-elastic-collision-tutorial/
  updateCollisionVelocity(nextState, ball, netBorder) {
    const xDistance = (netBorder.x - ball.x);
    const yDistance = (netBorder.y - ball.y);
    let normalVector = new Vector(xDistance, yDistance);
    normalVector = normalVector.normalise();

    const tangentVector = new Vector((normalVector.getY() * -1), normalVector.getX());

    // create ball scalar normal direction.
    const ballScalarNormal = normalVector.dot(ball.velocity);
    const netScalarNormal = normalVector.dot(netBorder.velocity);

    // create scalar velocity in the tagential direction.
    const ballScalarTangential = tangentVector.dot(ball.velocity);

    const ballScalarNormalAfter = (ballScalarNormal * (ball.mass - netBorder.mass) +
      2 * netBorder.mass * netScalarNormal) / (ball.mass + netBorder.mass);

    const ballScalarNormalAfterVector = normalVector.multiply(ballScalarNormalAfter);
    const ballScalarNormalVector = (tangentVector.multiply(ballScalarTangential));

    const nextVelocity = ballScalarNormalVector.add(ballScalarNormalAfterVector);

    if (ball.y < NET_Y + NET_HEIGHT / 2) {
      nextState.vx = nextVelocity.x;
    } else {
      nextState.vx = -nextVelocity.x;
    }

    nextState.vy = nextVelocity.y;
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;
  }

  handleCollision(nextState) {
    if (nextState.lifecycle !== LC_FALLING && nextState.lifecycle !== LC_BOUNCING) return;

    const _self = this;

    const ball = {
      x: nextState.x + radius,
      y: nextState.y + radius,
      radius: radius * nextState.scale,
      velocity: {
        getX() {
          return _self.state.vx;
        },
        getY() {
          return _self.state.vy;
        },
      },
      mass: 2,
    };
    const netLeftBorder = {
      x: this.state.NET_LEFT_BORDER_X,
      y: this.state.NET_LEFT_BORDER_Y,
      radius: NET_HEIGHT / 2,
      velocity: {
        getX() {
          return 0;
        },
        getY() {
          return 0;
        },
      },
      mass: 10,
    };
    const netRightBorder = {
      x: this.state.NET_RIGHT_BORDER_X,
      y: this.state.NET_RIGHT_BORDER_Y,
      radius: NET_HEIGHT / 2,
      velocity: {
        getX() {
          return 0;
        },
        getY() {
          return 0;
        },
      },
      mass: 10,
    };

    const isLeftCollision = this.circlesColliding(ball, netLeftBorder);
    if (isLeftCollision) {
      nextState.lifecycle = LC_BOUNCING;
      this.updateCollisionVelocity(nextState, ball, netLeftBorder);
    } else {
      const isRightCollision = this.circlesColliding(ball, netRightBorder);
      if (isRightCollision) {
        nextState.lifecycle = LC_BOUNCING;
        this.updateCollisionVelocity(nextState, ball, netRightBorder);
      }
    }
  }

  updateVelocity(nextState) {
    nextState.vx = this.state.vx;
    if (nextState.lifecycle === LC_STARTING && nextState.y < NET_Y - 200) {
      nextState.vy = this.state.vy;
    } else {
      nextState.vy = this.state.vy + gravity;
    }
  }

  updatePosition(nextState) {
    nextState.x = this.state.x + nextState.vx;
    nextState.y = this.state.y - nextState.vy;

    if (nextState.lifecycle === LC_STARTING && nextState.y < this.state.y) {
      nextState.lifecycle = LC_FALLING;
    }
    if (nextState.lifecycle === LC_RESTARTING && nextState.y < this.state.y) {
      nextState.lifecycle = LC_RESTARTING_FALLING;
    }

    if (this.state.scored === null) {
      if (this.state.y + radius > NET_Y + NET_HEIGHT / 2 && nextState.y + radius < NET_Y + NET_HEIGHT / 2) {
        if (nextState.x + radius > this.state.NET_LEFT_BORDER_X && nextState.x + radius < this.state.NET_RIGHT_BORDER_X) {
          nextState.scored = true;
          nextState.score += 1;
        } else {
          nextState.scored = false;
        }
      }
    }
  }

  updateScale(nextState) {
    if (nextState.lifecycle === LC_BOUNCING || nextState.lifecycle === LC_RESTARTING || nextState.lifecycle === LC_RESTARTING_FALLING) return;

    let scale = this.state.scale;
    if (scale > 0.4 && this.state.y > FLOOR_HEIGHT) {
      scale -= 0.01;
    }

    nextState.scale = scale;
  }

  updateRotate(nextState) {
    nextState.rotate = this.state.rotate + (nextState.vx * rotationFactor);
  }

  handleRestart(nextState) {
    if (nextState.lifecycle === LC_RESTARTING_FALLING && nextState.y <= FLOOR_Y) {
      // in front of the Floor
      // will restart to 'Waiting' lifecycle step
      nextState.y = FLOOR_Y;
      nextState.vx = 0;
      nextState.vy = 0;
      nextState.rotate = 0;
      nextState.scale = 1;
      nextState.lifecycle = LC_WAITING;

      nextState.scored = null;
    }

    const outOfScreen = (nextState.x > width + 100 || nextState.x < 0 - (radius * 2) - 100);

    if (
      (outOfScreen === true)
      || ((nextState.lifecycle === LC_FALLING || nextState.lifecycle === LC_BOUNCING) && (nextState.y + (radius * nextState.scale * 2) < FLOOR_Y + radius * -2))
    ) {
      if (this.props.gameType === 3) {
        let {NET_WIDTH, NET_X, NET_LEFT_BORDER_X, NET_RIGHT_BORDER_X } = getComponentSize(parseInt(this.state.score / 3 + 1))
        nextState.NET_X = NET_X
        nextState.NET_WIDTH = NET_WIDTH
        nextState.NET_LEFT_BORDER_X = NET_LEFT_BORDER_X
        nextState.NET_RIGHT_BORDER_X = NET_RIGHT_BORDER_X
      }

      if (outOfScreen && nextState.scored === null) {
        nextState.scored = false;
      }

      // behind the Floor
      // will be thrown to the front of the floor
      nextState.y = FLOOR_Y;

      if (nextState.scored === true) {
        nextState.x = this.randomIntFromInterval(4, width - (radius * 2) - 4);
      } else {
        // nextState.x = Dimensions.get('window').width / 2 - radius;
        nextState.x = this.randomIntFromInterval(4, width - (radius * 2) - 4);
        if (this.props.gameType === 2) { // 清空score
          nextState.score = 0;
          Alert.alert(
            '投丢了哟',
            `连续 ${this.state.score} 个`,
            [
              {text: '不玩了', onPress: this._returnToDefaultPage.bind(this)},
              {text: '再来!', onPress: () => {}}
            ]
          )
        }
      }

      // nextState.x = Dimensions.get('window').width / 2 - radius;
      nextState.vy = -8;
      nextState.vx = 0;
      nextState.scale = 1;
      nextState.rotate = 0;
      nextState.lifecycle = LC_RESTARTING;
    }
  }

  update() {
    if (this.state.lifecycle === LC_WAITING) return;

    let nextState = { ...this.state }
    this.updateVelocity(nextState);
    this.updatePosition(nextState);
    this.updateScale(nextState);
    this.updateRotate(nextState);

    this.handleCollision(nextState);
    this.handleRestart(nextState);

    this.setState(nextState);
  }

  _returnToDefaultPage() {
    const { navigator, cb } = this.props
    if (navigator) {
      navigator.pop()
      cb && cb()
    }
  }

  reset() {
    this.state.lifecycle = LC_RESTARTING
    this.update()
  }
  renderTimeCounter (gameType) {
    let timeCounter = false
    let countDown
    let scoreText = '分数'
    switch (gameType) {
      case 1:
        countDown = 30
        break;
      case 2:
        scoreText ='连续命中得分'
        break;
      case 3:
        countDown = 0
        timeCounter = true
        break;
      case 4:

    }
    return (<TimeCounter score={this.state.score}
                         start={countDown}
                         step={timeCounter ? 1 : -1}
                         tick={((time) => {
                          if (gameType === 3 && this.state.score === 15) {
                            Alert.alert(
                              '闯关成功',
                              `耗时 ${time} 秒`,
                              [
                                {text: '返回', onPress: () => {
                                  this._returnToDefaultPage()
                                }}
                              ]
                            )
                            return false
                          } else {
                            return true
                          }
                         }).bind(this)}
                         scoreText={scoreText}
                         onEnd={((restart) => {
          Alert.alert(
            '游戏结束',
            `恭喜! 你的得分是 ${10 * this.state.score} 分!`,
            [
              {text: '返回', onPress: () => {
                this._returnToDefaultPage()
              }},
              {text: '再来一次', onPress: () => {
                this.setState({score: 0})
                restart(countDown)
              }}
            ]
          )
        }).bind(this)} style={{
          position: 'absolute',
          top: 30,
          right: 0,
          backgroundColor: '#ffffff',
          opacity: 0.4,
        }} />)
  }

  render() {
    return (
      <Image source={bg} style={styles.container}>
        <TouchableOpacity onPress={this._returnToDefaultPage.bind(this)}>
          <Text style={styles.back}>返回</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.reset.bind(this)}>
          <Text style={styles.reset}>重置球</Text>
        </TouchableOpacity>
        <Hoop y={HOOP_Y} />
        <Net y={this.state.NET_Y} x={this.state.NET_X} height={this.state.NET_HEIGHT} width={this.state.NET_WIDTH} style={{opacity: this.state.lifecycle === LC_STARTING ? 1 : 0}} />
        <Floor height={FLOOR_HEIGHT} />
        <Ball
          onStart={this.onStart.bind(this)}
          x={this.state.x}
          y={this.state.y}
          radius={radius}
          rotate={this.state.rotate}
          scale={this.state.scale}
        />
        <Net y={this.state.NET_Y} x={this.state.NET_X} height={this.state.NET_HEIGHT} width={this.state.NET_WIDTH} style={{opacity: this.state.lifecycle !== LC_STARTING ? 1 : 0}} />

        <Emoji y={NET_Y} scored={this.state.scored} />
        {this.renderTimeCounter(this.props.gameType)}

      </Image>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  back: {
    position: 'absolute',
    left: 10,
    top: 25,
    fontSize: 20,
    color: '#ffffff'
  },
  reset: {
    position: 'absolute',
    left: 70,
    top: 25,
    fontSize: 20,
    color: '#ffffff'
  }
})

export default BasketballPage
