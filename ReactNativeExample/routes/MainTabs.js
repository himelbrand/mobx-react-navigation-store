import React, { Component } from 'react'
import {
    View,
    Text,
    AsyncStorage,
    Keyboard
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation'
import { observer, inject } from 'mobx-react/native'
import { create } from 'mobx-persist'
import NavigationStore,{TabNavigator} from 'rn-navigation-store'
import { Home, Second } from '../screens'
import MainStack from './MainStack'
import { Header, Footer } from '../components'

const Tabs = TabNavigator('MainTabs',
{
    Home: { screen: Home },
    Two: { screen: Second },
    NestedNavigatorMain: { 
        screen: MainStack
    }
}, {
        initialRouteName: 'Home',
        lazy: true,
        lazyLoad: true,
        backBehavior:'none',
    })

@inject('NavigationStore')
@observer
class MainTabs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nowMounted: false
        }
    }
    componentWillMount() {

    }
    componentDidMount() {
    }
    render() {
                return (
            <View style={{flex:1}}>
                <Tabs/>
            </View>

        )
    }
}
export default MainTabs