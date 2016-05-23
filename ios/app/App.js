/**
 * Created at 16/5/21.
 * @Author Ling.
 * @Email i@zeroling.com
 */
import React, { Component } from 'react';
import {
  View,
  Navigator
} from 'react-native';
import DefaultPage from './Scenes/default';
import BacketBallPage from './Scenes/Backetball'

export default class SampleComponent extends Component {
  render() {
    const defaultName = 'DefaultPage';
    const defaultComponent = DefaultPage;
    return (
      <Navigator
        initialRoute={{ name: defaultName, component: defaultComponent }}
        configureScene={(route) => Navigator.SceneConfigs.PushFromRight}
        renderScene={(route, navigator) => {
            const Component = route.component;
            return <Component {...route.params} navigator={navigator} />
          }} />
    );
  }
}