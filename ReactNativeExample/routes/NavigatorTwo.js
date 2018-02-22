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
import { ScreenSix, ScreenSeven } from '../screens'
import NavigationStore from 'mobx-react-navigation-store'
import {TabNavigator} from 'mobx-react-navigation-store'

const NavTwo = TabNavigator('NavTwo',
    {
        NavTwoFirst: { screen: ScreenSix,title:'NavTwoFirst' },
        NavTwoSecond: { screen: ScreenSeven ,title:'NavTwoSecond'},
    }, {
        headerMode: 'none',
        lazy: true,
        initialRouteName: 'NavTwoFirst',
        tabBarPosition: 'top'

    }
)

@inject('NavigationStore')
@observer
class NavigatorTwo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nowMounted: false
        }
    }
    componentWillMount() {
    }
    componentDidMount(){
        this.setState({ nowMounted: true })

        this.props.NavigationStore.setActiveNavigator('NavTwo')
    }
    render(){
        return (
                <NavTwo/>
        )
    }
}
export default NavigatorTwo