import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { NavigationActions } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import { create } from 'mobx-persist'
import { ScreenFour, ScreenFive } from '../screens'
import NavigatorTwo from './NavigatorTwo'
import { StackNavigator } from 'rn-navigation-store'


const NavOne = StackNavigator('NavOne',
    {
        NavOneFirst: { screen: ScreenFour, title: 'NavOneFirst' },
        NavOneSecond: { screen: ScreenFive, title: 'NavOneSecond' },
        NestedNavigator: { screen: NavigatorTwo },
    }, {
        headerMode: 'none',
        lazy: true,
        initialRouteName: 'NavOneFirst',
    }
)

@inject('NavigationStore')
@observer
class NavigatorOne extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    componentWillMount() {

    }
    componentDidMount() {
    }
    render() {
        return (

            <NavOne />

        )
    }
}
export default NavigatorOne